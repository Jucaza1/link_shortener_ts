import { Router } from "express"

import { LinkHandler, UserHandler, } from "./handlers/handlers.js"
import { adminMiddleware, AuthHandler } from "./handlers/middlewares.js"
import * as db from "./db/main.js"
import { ControllerImp, } from "./controllers.js"
import { Hasher } from "./hash.js"
import { PasswordEncrypter } from "./types.js"
import { Auther } from "./auth.js"

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
    const authHandler = new AuthHandler(auther, uController, encrypter)
    const uHandler = new UserHandler(uController)
    const lHandler = new LinkHandler(lController)
    // v1Router.use("/",json())
    v1Router.post("/users", uHandler.handleCreateUser)
    v1Router.post("/login", authHandler.authenticate)
    //endpoint for anonymous link creation with rate limiter
    v1Router.post("/guestlink", limiter, lHandler.handleCreateAnonymousLink)

    const validateRouter = Router()
    v1Router.use("/", authHandler.validateMiddleware, validateRouter)

    validateRouter.get("/users/:id", uHandler.handleGetUserByID)
    validateRouter.get("/users/email/:email", uHandler.handleGetUserByEmail)
    validateRouter.get("/users/username/:username", uHandler.handleGetUserByUsername)
    validateRouter.delete("/users/:id", uHandler.handleCancelUserByID)
    validateRouter.get("/users/:id/link", lHandler.handleGetLinksByUser)
    validateRouter.post("/links/", lHandler.handleCreateLink)
    validateRouter.get("/links/:id", lHandler.handleGetLinkById)
    validateRouter.delete("/links/:id", lHandler.handleCancelLinkByID)
    //AMIN only routes with a middleware filter
    validateRouter.get("/users", adminMiddleware, uHandler.handleGetUsers)
    validateRouter.post("/users/admin",adminMiddleware, uHandler.handleCreateAdmin)
    validateRouter.delete("/users/:id/delete", adminMiddleware, uHandler.handleDeleteUserByID)
    validateRouter.delete("/links/:id/delete", adminMiddleware, lHandler.handleDeleteLinkByID)

    return v1Router
}
// export function createLinkServer(uController: UserController): Router {
//     const linkRouter = Router()
//     const lSHandler = new LSHandler(uController)
//     linkRouter.get("/:short", lSHandler.handleServeLink)
//     return linkRouter
// }
