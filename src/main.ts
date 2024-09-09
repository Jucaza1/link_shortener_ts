import express from "express"

import { createLinkServer, createRouter } from "./routes.js"
import * as db from "./db/sqlite.js"
import { Hasher } from "./hash.js"

const PORT = 3000
const dbloc = "./shortener.db"

const sqliteDB = new db.SqliteDB(dbloc)
const hasher = new Hasher()
const app = express()
app.disable('x-powered-by')
app.get("/root", (_req, res) => {
    res.status(200).json({ resp: "root is empty" })
})
app.use("/", createLinkServer(sqliteDB))

app.use("/api/v1", createRouter(sqliteDB,
    // sqliteDB,
    // hasher
))

console.log(`Running on http://localhost:${PORT}`)

app.listen(PORT)
