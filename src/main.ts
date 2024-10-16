import express from "express"

import { createLinkServer, createRouter } from "./routes.js"
import * as db from "./db/sqlite.js"
import { JWT_Auther } from "./auth.js"
import { Hasher } from "./hash.js"
import { PasswordEncrypter } from "./types.js"

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
app.get("/root", (_req, res) => {
    res.status(200).json({ resp: "root is empty" })
})
app.use("/", createLinkServer(sqliteDB, sqliteDB, hasher, encrypter))

app.use("/api/v1", createRouter(sqliteDB, sqliteDB, hasher, encrypter, auther))
// function logBody(req: express.Request, _res: express.Response, next: express.NextFunction) {
//     console.log("recieved json body:")
//     console.log(stringify(req.body))
//     next()
// }
console.log(`Running on http://localhost:${PORT}`);

// TestJWT()
app.listen(PORT)
