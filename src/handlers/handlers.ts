import { Request, Response } from "express"
import { constants as httpStatus } from "http2"

import * as types from "../types/entities"
import { UserService, LinkServerService, LinkService } from "../services"
import { NextFunction } from "../types/express"
import { ResultHttp } from "../types/result"
import { User, User_DTO } from "../types/entities"

export class UserHandler {
    uService: UserService
    constructor(uService: UserService) {
        this.uService = uService
        this.handleGetUsers = this.handleGetUsers.bind(this)
        this.handleGetUserByID = this.handleGetUserByID.bind(this)
        this.handleGetMyUser = this.handleGetMyUser.bind(this)
        this.handleGetUserByEmail = this.handleGetUserByEmail.bind(this)
        this.handleGetUserByUsername = this.handleGetUserByUsername.bind(this)
        this.handleCreateUser = this.handleCreateUser.bind(this)
        this.handleCreateAdmin = this.handleCreateAdmin.bind(this)
        this.handleCancelUserByID = this.handleCancelUserByID.bind(this)
        this.handleDeleteUserByID = this.handleDeleteUserByID.bind(this)
    }

    handleGetMyUser(_req: Request, res: Response, next: NextFunction) {
        const user: types.User_Middleware = res.locals.user
        if (!user || user.ID === undefined || (typeof user.ID) !== "string" || user.ID === "") {
            next({ httpError: { status: httpStatus.HTTP_STATUS_BAD_REQUEST, msg: ["invalid user"] } })
            return
        }
        const result = this.uService.getUserByID(user.ID)
        if (!result.ok) {
            next({ httpError: result.err!, exception: result.exception })
            return
        }
        res.status(httpStatus.HTTP_STATUS_OK).json(result.data)
    }

    handleGetUsers(_req: Request, res: Response, next: NextFunction) {
        const result = this.uService.getUsers()
        if (!result.ok || result.data === undefined) {
            next({ httpError: result.err!, exception: result.exception })
            return
        }
        res.status(httpStatus.HTTP_STATUS_OK).json(result.data)
    }

    handleGetUserByID(req: Request, res: Response, next: NextFunction) {
        const params = req.params
        const id = params.id
        if (id === undefined || (typeof id) !== "string" || id === "") {
            next({ httpError: { status: httpStatus.HTTP_STATUS_BAD_REQUEST, msg: ["invalid id"] } })
            return
        }
        const result = this.uService.getUserByID(id as string)
        if (!result.ok || result.data === undefined) {
            next({ httpError: result.err!, exception: result.exception })
            return
        }
        res.status(httpStatus.HTTP_STATUS_OK).json(result.data)
    }

    handleGetUserByEmail(req: Request, res: Response, next: NextFunction) {
        const email = req.body?.email
        if (email === undefined || (typeof email) !== "string" || email === "") {
            next({ httpError: { status: httpStatus.HTTP_STATUS_BAD_REQUEST, msg: ["invalid email"] } })
            return
        }
        const result = this.uService.getUserByEmail(email as string)
        if (!result.ok || result.data === undefined) {
            next({ httpError: result.err!, exception: result.exception })
            return
        }
        res.status(httpStatus.HTTP_STATUS_OK).json(result.data)
    }

    handleGetUserByUsername(req: Request, res: Response, next: NextFunction) {
        const username = req.params?.username
        if (username === undefined || (typeof username) !== "string" || username === "") {
            next({ httpError: { status: httpStatus.HTTP_STATUS_BAD_REQUEST, msg: ["invalid username"] } })
            return
        }
        const operation = this.uService.getUserByUsername(username as string)
        if (!operation.ok || operation.data === undefined) {
            next({ httpError: operation.err!, exception: operation.exception })
            return
        }
        res.status(httpStatus.HTTP_STATUS_OK).json(operation.data)
    }

    handleCreateUser(req: Request, res: Response, next: NextFunction) {
        const params = req.body
        if (!params) {
            next({ httpError: { status: httpStatus.HTTP_STATUS_BAD_REQUEST, msg: ["invalid params"] } })
            return
        }
        const user: types.UserParams = {
            username: params.username,
            email: params.email,
            password: params.password,
        }
        const result = this.uService.createUser(user)
        if (!result.ok || result.data === undefined) {
            next({ httpError: result.err!, exception: result.exception })
            return
        }
        res.status(httpStatus.HTTP_STATUS_CREATED).json(result.data)
    }

    handleCreateAdmin(req: Request, res: Response, next: NextFunction) {
        const params = req.body
        if (!params) {
            next({ httpError: { status: httpStatus.HTTP_STATUS_BAD_REQUEST, msg: ["invalid params"] } })
            return
        }
        const user: types.UserParams = {
            username: params.username,
            email: params.email,
            password: params.password,
        }
        const result = this.uService.createAdmin(user)
        if (!result.ok || result.data === undefined) {
            next({ httpError: result.err!, exception: result.exception })
            return
        }
        res.status(httpStatus.HTTP_STATUS_CREATED).json(result.data)
    }

    handleCancelUserByID(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id
        const user: types.User_Middleware = res.locals.user
        if (!user) {
            next({ httpError: { status: httpStatus.HTTP_STATUS_UNAUTHORIZED, msg: ["unauthorized"] } })
            return
        }
        let result: ResultHttp<User | User_DTO>
        if (!user?.isAdmin && id === user?.ID || user.isAdmin) {
            // only admin can cancel any user
            result = this.uService.cancelUserByID(id, user.isAdmin)
        } else {
            next({ httpError: { status: httpStatus.HTTP_STATUS_BAD_REQUEST, msg: ["invalid id"] } })
            return
        }
        if (!result.ok || result.data === undefined) {
            next({ httpError: result.err!, exception: result.exception })
            return
        }
        res.status(httpStatus.HTTP_STATUS_OK).json(result.data)
    }

    handleDeleteUserByID(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id
        const user: types.User_Middleware = res.locals.user
        if (!user) {
            next({ httpError: { status: httpStatus.HTTP_STATUS_UNAUTHORIZED, msg: ["unauthorized"] } })
            return
        }
        let result: ResultHttp<User | User_DTO>
        if (!user?.isAdmin && id === user?.ID || user.isAdmin) {
            // only admin can delete any user
            result = this.uService.deleteUserByID(id, user.isAdmin)
        } else {
            next({ httpError: { status: httpStatus.HTTP_STATUS_UNAUTHORIZED, msg: ["unauthorized"] } })
            return
        }
        if (!result.ok || !result.data) {
            next({ httpError: result.err!, exception: result.exception })
            return
        }
        res.status(httpStatus.HTTP_STATUS_OK).json(result.data)
    }
}

export class LinkHandler {
    linkController: LinkService
    constructor(linkController: LinkService) {
        this.linkController = linkController
        this.handleCreateLink = this.handleCreateLink.bind(this)
        this.handleCreateAnonymousLink = this.handleCreateAnonymousLink.bind(this)
        this.handleDeleteLinkByID = this.handleDeleteLinkByID.bind(this)
        this.handleCancelLinkByID = this.handleCancelLinkByID.bind(this)
        this.handleGetLinkById = this.handleGetLinkById.bind(this)
        this.handleGetLinksByUser = this.handleGetLinksByUser.bind(this)
    }

    handleCreateLink(req: Request, res: Response, next: NextFunction) {
        const params = req.body
        if (params === undefined) {
            next({ httpError: { status: httpStatus.HTTP_STATUS_BAD_REQUEST, msg: ["invalid params"] } })
            return
        }
        const user: types.User_Middleware = res.locals.user
        if (!user) {
            next({ httpError: { status: httpStatus.HTTP_STATUS_UNAUTHORIZED, msg: ["unauthorized"] } })
            return
        }
        const link: types.LinkParams = {
            url: params.url,
        }
        if (!link.url || !user) {
            next({ httpError: { status: httpStatus.HTTP_STATUS_BAD_REQUEST, msg: ["invalid params"] } })
            return
        }
        const hasHttpPrefix = /^https?:\/\//i.test(link.url);
        link.url = hasHttpPrefix ? link.url : `http://${link.url}`;

        const result = this.linkController.createLink(link, user?.ID, user?.isAdmin)
        if (result.ok || result.data === undefined) {
            next({ httpError: result.err!, exception: result.exception })
            return
        }
        res.status(httpStatus.HTTP_STATUS_CREATED).json(result.data)
    }

    handleCreateAnonymousLink(req: Request, res: Response, next: NextFunction) {
        const params = req.body
        if (params === undefined) {
            next({ httpError: { status: httpStatus.HTTP_STATUS_BAD_REQUEST, msg: ["invalid params"] } })
            return
        }
        const link: types.LinkParams = {
            url: params.url,
        }
        const hasHttpPrefix = /^https?:\/\//i.test(link.url);
        link.url = hasHttpPrefix ? link.url : `http://${link.url}`;

        const result = this.linkController.createAnonymousLink(link)
        if (!result.ok || result.data === undefined) {
            next({ httpError: result.err!, exception: result.exception })
            return
        }
        res.status(httpStatus.HTTP_STATUS_CREATED).json(result.data)
    }

    handleDeleteLinkByID(req: Request, res: Response, next: NextFunction) {
        const id = req.params?.id
        const user: types.User_Middleware = res.locals.user
        if (!user) {
            next({ httpError: { status: httpStatus.HTTP_STATUS_UNAUTHORIZED, msg: ["unauthorized"] } })
            return
        }
        const parsedID = parseInt(id)
        if (isNaN(parsedID)) {
            next({ httpError: { status: httpStatus.HTTP_STATUS_BAD_REQUEST, msg: ["invalid id"] } })
            return
        }
        const result = this.linkController.deleteLinkByID(parsedID, user.ID, user.isAdmin)
        if (!result.ok || !result.data) {
            next({ httpError: result.err!, exception: result.exception })
            return
        }
        res.status(httpStatus.HTTP_STATUS_OK).json(result.data)
    }

    handleCancelLinkByID(req: Request, res: Response, next: NextFunction) {
        const id = req.params?.id
        const user: types.User_Middleware = res.locals.user
        if (!user) {
            next({ httpError: { status: httpStatus.HTTP_STATUS_UNAUTHORIZED, msg: ["unauthorized"] } })
            return
        }
        const parsedID = parseInt(id)
        if (isNaN(parsedID)) {
            next({ httpError: { status: httpStatus.HTTP_STATUS_BAD_REQUEST, msg: ["invalid id"] } })
            return
        }
        const result = this.linkController.cancelLinkByID(parsedID, user.ID, user.isAdmin)
        if (!result.ok || !result.data) {
            next({ httpError: result.err!, exception: result.exception })
            return
        }
        res.status(httpStatus.HTTP_STATUS_OK).json(result.data)
    }

    handleGetLinkById(req: Request, res: Response, next: NextFunction) {
        const id: string = req.params?.id
        const user: types.User_Middleware = res.locals.user
        if (!user) {
            next({ httpError: { status: httpStatus.HTTP_STATUS_UNAUTHORIZED, msg: ["unauthorized"] } })
            return
        }
        const result = this.linkController.getLinkByID(id, user.isAdmin)
        if (!result.ok || !result.data) {
            next({ httpError: result.err!, exception: result.exception })
            return
        }
        if (!user.isAdmin && result.data.userID !== user.ID) {
            // only admin can get any user link entity
            next({ httpError: { status: httpStatus.HTTP_STATUS_UNAUTHORIZED, msg: ["unauthorized"] } })
            return
        }
        res.status(httpStatus.HTTP_STATUS_OK).json(result.data)
    }

    handleGetLinksByUser(req: Request, res: Response, next: NextFunction) {
        const id: string = req.params.id
        const user: types.User_Middleware = res.locals.user
        if (!user || !user.isAdmin && id !== user.ID ) {
            next({ httpError: { status: httpStatus.HTTP_STATUS_UNAUTHORIZED, msg: ["unauthorized"] } })
            return
        }
        const result = this.linkController.getLinksByUser(id, user.isAdmin)
        if (!result.ok || !result.data) {
            next({ httpError: result.err!, exception: result.exception })
            return
        }
        res.status(httpStatus.HTTP_STATUS_OK).json(result.data)
    }

}

export class LSHandler {
    linkSController: LinkServerService
    constructor(linkSController: LinkServerService) {
        this.linkSController = linkSController
        this.handleServeLink = this.handleServeLink.bind(this)
    }

    handleServeLink(req: Request, res: Response, next: NextFunction) {
        const params = req.params
        if (params.short === undefined || params.short === "") {
            next({ httpError: { status: httpStatus.HTTP_STATUS_BAD_REQUEST, msg: ["invalid url"] } })
            return
        }
        const result = this.linkSController.serveLink(params.short)
        if (!result.ok || result.data === undefined) {
            next({ httpError: result.err!, exception: result.exception })
            return
        }
        res.setHeader("Location", result.data.trim())
        res.status(httpStatus.HTTP_STATUS_PERMANENT_REDIRECT)
        res.send()
        // update activity for the link
        this.linkSController.trackLink(params.short)
    }
}
