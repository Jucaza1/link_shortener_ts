import express from "express"

import { createRouter } from "./routes.js"
import * as db from "./db/sqlite.js"
// import { Hasher } from "./hash.js"
import { TestJWT } from "./middlewate.js"
import { Hasher } from "./hash.js"
import { PasswordEncrypter } from "./types.js"

const PORT = 3000
const dbloc = "./shortener.db"

const sqliteDB = new db.SqliteDB(dbloc)
//TODO express Handlers and connect to controllers
const hasher = new Hasher()
const encrypter = new PasswordEncrypter("secretforpassword")
const app = express()
app.disable('x-powered-by')
app.get("/root", (_req, res) => {
    res.status(200).json({ resp: "root is empty" })
})
// app.use("/", createLinkServer(sqliteDB))

app.use("/api/v1", createRouter(sqliteDB, sqliteDB, hasher, encrypter
    // sqliteDB,
    // hasher
))

console.log(`Running on http://localhost:${PORT}`)

TestJWT()
app.listen(PORT)
