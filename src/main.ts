import express from "express"

import { createRouter } from "./routes.js"
import * as db from "./db/sqlite.js"
import { JWT_Auther, TestJWT } from "./middleware.js"
import { Hasher } from "./hash.js"
import { PasswordEncrypter } from "./types.js"

//TODO: handle config with ENV vars
const PORT = 3000
const dbloc = "./shortener.db"
const secret = "12345abcde"

const sqliteDB = new db.SqliteDB(dbloc)
const hasher = new Hasher()
const encrypter = new PasswordEncrypter("secretforpassword")
const auther = new JWT_Auther(secret)
const app = express()
app.disable('x-powered-by')
app.get("/root", (_req, res) => {
    res.status(200).json({ resp: "root is empty" })
})
// app.use("/", createLinkServer(sqliteDB))

app.use("/api/v1", createRouter(sqliteDB, sqliteDB, hasher, encrypter,auther
    // sqliteDB,
    // hasher
))

console.log(`Running on http://localhost:${PORT}`)

TestJWT()
app.listen(PORT)
