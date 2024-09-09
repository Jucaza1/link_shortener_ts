import { Request, Response } from "express"
import { constants as httpStatus } from "http2"
import * as types from "../types.js"
import * as db from "../db/main.js"

export class UserHandler {
    userDB: db.UserDB
    constructor(userDB: db.UserDB) {
        this.userDB = userDB
        this.handleGetUser = this.handleGetUser.bind(this)
    }
    handleGetUser(req: Request, res: Response) {
        const params = req.params
        if (params.id === undefined || params.id === "") {
            res
                .status(httpStatus.HTTP_STATUS_BAD_REQUEST)
                .send(types.errorMsg("invalid id"))
            return
        }
        const user = this.userDB.getUserByID(params.id)
        if (user === undefined) {
            res.status(httpStatus.HTTP_STATUS_NOT_FOUND)
                .send(types.errorMsg("id not found"))
            return
        }
        const user_DTO = types.parseUser_DTO(user)
        res.status(httpStatus.HTTP_STATUS_OK).json(user_DTO)
    }
}
export class LinkHandler {
    linkDB: db.LinkDB
    constructor(linkDB: db.LinkDB) {
        this.linkDB = linkDB
        // this.handleServeLink = this.handleServeLink.bind(this)
    }
}
export class LSHandler {
    linkDB: db.LinkDB
    constructor(linkDB: db.LinkDB) {
        this.linkDB = linkDB
        this.handleServeLink = this.handleServeLink.bind(this)
    }
    handleServeLink(req: Request, res: Response) {
        const params = req.params
        if (params.short === undefined || params.short === "") {
            res
                .status(httpStatus.HTTP_STATUS_BAD_REQUEST)
                .send(types.errorMsg("invalid id"))
            return
        }
        const url = this.linkDB.serveLink(params.short)
        if (url === undefined) {
            res.status(httpStatus.HTTP_STATUS_NOT_FOUND)
                .send(types.errorMsg("id not found"))
            return
        }
        res.setHeader("Location",url)
        res.status(httpStatus.HTTP_STATUS_PERMANENT_REDIRECT)
        res.send()
        this.linkDB.trackServe(params.short)
    }
}
