import { Router, Request, Response } from "express"
import { UserHandler, LSHandler } from "./handlers/handlers.js"
import * as db from "./db/main.js"
export function createRouter(
    udb: db.UserDB,
    // ldb: db.LinkDB
): Router {
    const v1Router = Router()
    const uHandler = new UserHandler(udb)
    // const lHandler = new LinkHandler(ldb)
    v1Router.get("/", handleRoot)
    function handleRoot(_req: Request, res: Response) {
        res.status(200).json({ resp: "hello world" })
    }
    v1Router.get("/users/", handleGetUsers)
    function handleGetUsers(_req: Request, res: Response) {
        res.status(200).json({ resp: "hello world" })
    }
    v1Router.get("/users/:id", uHandler.handleGetUser)
    return v1Router
}
export function createLinkServer(db: db.LinkDB): Router {
    const linkRouter = Router()
    const lSHandler = new LSHandler(db)
    linkRouter.get("/:short", lSHandler.handleServeLink)
    return linkRouter
}
