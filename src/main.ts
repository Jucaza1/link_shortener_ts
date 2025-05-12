import express from "express"
import cors, { CorsOptions } from "cors"

import { createLinkServer, createRouter } from "./routes"
import * as db from "./db/sqlite"
import { JWT_Auther } from "./auth"
import { Hasher } from "./hash"
import { createUserFromParams, PasswordEncrypter } from "./types/entities"
import { globalErrorHandler } from "./handlers/error-handler"

const SERVER_HOST = process.env.SERVER_HOST ?? "0.0.0.0"
const s_port = parseInt(process.env.SERVER_PORT ?? "3000")
const SERVER_PORT = isNaN(s_port) ? 3000 : s_port
const JWT_SECRET = process.env.JWT_SECRET ?? "jwtsecret"
const PASSWORD_SECRET = process.env.PASSWORD_SECRET ?? "secretforpassword"
const DB_LOCATION = process.env.DB_LOCATION ?? "./data/database.db"
const DB_RESET = process.env.DB_RESET === "true" || false
const DB_SEED = process.env.DB_SEED === "true" || false
const USERNAME_ADMIN = process.env.USERNAME_ADMIN ?? "admin"
const EMAIL_ADMIN = process.env.EMAIL_ADMIN ?? "admin@admin.com"
const PASSWORD_ADMIN = process.env.PASSWORD_ADMIN ?? "adminadmin"

if (DB_RESET) {
    console.log("Resetting database")
    const sqliteDBreset = new db.SqliteDB(DB_LOCATION)
    sqliteDBreset.teardown()
}
const sqliteDB = new db.SqliteDB(DB_LOCATION)
if (DB_SEED) {
    console.log("Seeding database")
    const userParams = {
        username: USERNAME_ADMIN,
        email: EMAIL_ADMIN,
        password: PASSWORD_ADMIN,
    }
    const resultParams = createUserFromParams(userParams, new PasswordEncrypter(PASSWORD_SECRET), true)
    if (!resultParams.ok || resultParams.data === undefined) {
        console.log("Error creating admin user")
        console.log(resultParams.err)
    //     process.exit(1)
    }
    const result = sqliteDB.createUser(resultParams.data!)
    if (!result.ok) {
        console.log("Error creating admin user")
        console.log(result.err)
        // process.exit(1)
    }
    console.log("Admin user created")
    console.log("Admin user email: ", userParams.email)
    console.log("Admin user username: ", userParams.username)
    console.log("Admin user password: ", userParams.password)
    console.log("Database seeded")
}

//start cron cleaning task
sqliteDB.startCleanExpiredLink()
const hasher = new Hasher()
const encrypter = new PasswordEncrypter(PASSWORD_SECRET)
const auther = new JWT_Auther(JWT_SECRET)

const app = express()
app.disable('x-powered-by')

const jsonParser = express.json({ limit: "4kb" })
app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
        jsonParser(req, res, next)
    } else {
        next()
    }
})
const corsOptions: CorsOptions = {
    // origin: 'http://localhost:5173',
    origin: '*',
    optionsSuccessStatus: 200,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-authorization'],
}
app.use(cors(corsOptions))

app.use("/", createLinkServer(sqliteDB, sqliteDB, hasher, encrypter))

app.use("/api/v1", createRouter(sqliteDB, sqliteDB, hasher, encrypter, auther))

app.use(globalErrorHandler)

app.listen(SERVER_PORT, SERVER_HOST, () => {
    console.log(`server running on http://${SERVER_HOST}:${SERVER_PORT}`)
})
