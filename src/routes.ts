import { Router, Request, Response } from "express"
import { UserHandler, } from "./handlers/handlers.js"
import * as db from "./db/main.js"
import { ControllerImp, } from "./controllers.js"
import { Hasher } from "./hash.js"
import { PasswordEncrypter } from "./types.js"
export function createRouter(
    udb: db.UserDB,
    ldb: db.LinkDB,
    hasher: Hasher,
    encrypter: PasswordEncrypter
): Router {
    const uController = new ControllerImp(udb, ldb, hasher, encrypter)
    const v1Router = Router()
    const uHandler = new UserHandler(uController)
    // const lHandler = new LinkHandler(ldb)
    v1Router.get("/", handleRoot)
    function handleRoot(_req: Request, res: Response) {
        res.status(200).json({ resp: "hello world" })
    }
    v1Router.get("/users/", handleGetUsers)
    function handleGetUsers(_req: Request, res: Response) {
        res.status(200).json({ resp: "hello world" })
    }
    v1Router.get("/users/:id", uHandler.handleGetUserByID)
    return v1Router
}
// export function createLinkServer(uController: UserController): Router {
//     const linkRouter = Router()
//     const lSHandler = new LSHandler(uController)
//     linkRouter.get("/:short", lSHandler.handleServeLink)
//     return linkRouter
// }
