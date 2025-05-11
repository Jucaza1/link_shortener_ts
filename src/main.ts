import express, { ErrorRequestHandler, Request, Response, NextFunction } from "express"

import { createLinkServer, createRouter } from "./routes"
import * as db from "./db/sqlite"
import { JWT_Auther } from "./auth"
import { Hasher } from "./hash"
import { PasswordEncrypter } from "./types/entities"
import { HttpError } from "./types/result"

//TODO: handle config with ENV vars
const PORT = 3000
const dbloc = "./shortener.db"
const secret = "12345abcde";

// (new db.SqliteDB(dbloc)).teardown()

const sqliteDB = new db.SqliteDB(dbloc)
//start cron cleaning task
sqliteDB.startCleanExpiredLink()
const hasher = new Hasher()
const encrypter = new PasswordEncrypter("secretforpassword")
const auther = new JWT_Auther(secret)

const app = express()
app.disable('x-powered-by')
app.use("/", createLinkServer(sqliteDB, sqliteDB, hasher, encrypter))

app.use("/api/v1", createRouter(sqliteDB, sqliteDB, hasher, encrypter, auther))
const globalErrorHandler: ErrorRequestHandler = (
    // { httpError, exception }: { httpError: HttpError, exception: Error },
    error: any,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {

    if (error.httpError !== undefined) {
        //{ httpError, exception }: { httpError: HttpError, exception: Error } = error
        console.error(error.httpError as HttpError)
        res.status(error.httpError.status ?? 500).json({ error: error.httpError.msg })
        if (error.exception) {
            console.log(error.exception)
        }
        return
    }
    if (error.status !== undefined) {
        console.error({ statusCode: error.statusCode, type: error.type })
        if (error.statusCode === 400) {
            res.status(error.statusCode as number).json({ error: "bad request" })
        } else {
            res.status(error.statusCode as number).json({ error: error.status })
        }
        return
    }
    if (error instanceof Error) {
        console.error(error)
        res.status(500).json({ error: "internal server error" })
        return
    }
}
app.use(globalErrorHandler)

// function logBody(req: express.Request, _res: express.Response, next: express.NextFunction) {
//     console.log("recieved json body:")
//     console.log(stringify(req.body))
//     next()
// }
console.log(`Running on http://localhost:${PORT}`);

// TestJWT()
app.listen(PORT)
