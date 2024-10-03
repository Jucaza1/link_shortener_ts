import { Router, Request, Response, json } from "express"
import { AuthHandler, LinkHandler, UserHandler, } from "./handlers/handlers.js"
import * as db from "./db/main.js"
import { ControllerImp, } from "./controllers.js"
import { Hasher } from "./hash.js"
import { PasswordEncrypter } from "./types.js"
import { Auther } from "./middleware.js"
export function createRouter(
    udb: db.UserDB,
    ldb: db.LinkDB,
    hasher: Hasher,
    encrypter: PasswordEncrypter,
    auther: Auther
): Router {
    const uController = new ControllerImp(udb, ldb, hasher, encrypter)
    const lController = new ControllerImp(udb, ldb, hasher, encrypter)
    const v1Router = Router()
    const authHandler = new AuthHandler(auther,uController,encrypter)
    const uHandler = new UserHandler(uController)
    const lHandler = new LinkHandler(lController)
    v1Router.get("/", handleRoot)
    function handleRoot(_req: Request, res: Response) {
        res.status(200).json({ resp: "hello world" })
    }
    v1Router.get("/users/", handleGetUsers)
    function handleGetUsers(_req: Request, res: Response) {
        res.status(200).json({ resp: "hello world" })
    }
    v1Router.use(json())
    v1Router.post("/users/", uHandler.handleCreateUser)
    const validateRouter = Router()

    validateRouter.get("/users/:id", uHandler.handleGetUserByID)
    validateRouter.get("/users/email/:email", uHandler.handleGetUserByEmail)
    validateRouter.get("/users/username/:username", uHandler.handleGetUserByUsername)
    validateRouter.delete("/users/:id", uHandler.handleCancelUserByID)
    validateRouter.get("/users/:id/link", lHandler.handleGetLinksByUser)
    validateRouter.post("/link/", lHandler.handleCreateLink)
    validateRouter.get("/link/:id", lHandler.handleGetLinkById)
    validateRouter.delete("/link/:id", lHandler.handleCancelLinkByID)
    v1Router.use("/",authHandler.validateMiddleware,validateRouter)
    //TODO AMIN only routes with a middleware
    return v1Router
}
// export function createLinkServer(uController: UserController): Router {
//     const linkRouter = Router()
//     const lSHandler = new LSHandler(uController)
//     linkRouter.get("/:short", lSHandler.handleServeLink)
//     return linkRouter
// }
