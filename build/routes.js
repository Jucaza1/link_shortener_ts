import { Router } from "express";
import { UserHandler, LSHandler } from "./handlers/handlers.js";
export function createRouter(udb) {
    const v1Router = Router();
    const uHandler = new UserHandler(udb);
    // const lHandler = new LinkHandler(ldb)
    v1Router.get("/", handleRoot);
    function handleRoot(_req, res) {
        res.status(200).json({ resp: "hello world" });
    }
    v1Router.get("/users/", handleGetUsers);
    function handleGetUsers(_req, res) {
        res.status(200).json({ resp: "hello world" });
    }
    v1Router.get("/users/:id", uHandler.handleGetUser);
    return v1Router;
}
export function createLinkServer(db) {
    const linkRouter = Router();
    const lSHandler = new LSHandler(db);
    linkRouter.get("/:short", lSHandler.handleServeLink);
    return linkRouter;
}
//# sourceMappingURL=routes.js.map