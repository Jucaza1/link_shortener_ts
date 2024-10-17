import { Request, Response } from "express"
import { constants as httpStatus } from "http2"
import * as types from "../types.js"
import { UserController, LinkServerController, LinkController } from "../controllers.js"
import { Operation } from "../error.js"

export class UserHandler {
    uController: UserController
    constructor(uController: UserController) {
        this.uController = uController
        this.handleGetUsers = this.handleGetUsers.bind(this)
        this.handleGetUserByID = this.handleGetUserByID.bind(this)
        this.handleGetUserByEmail = this.handleGetUserByEmail.bind(this)
        this.handleGetUserByUsername = this.handleGetUserByUsername.bind(this)
        this.handleCreateUser = this.handleCreateUser.bind(this)
        this.handleCreateAdmin = this.handleCreateAdmin.bind(this)
        this.handleCancelUserByID = this.handleCancelUserByID.bind(this)
        this.handleDeleteUserByID = this.handleDeleteUserByID.bind(this)
    }
    handleGetUsers(_req: Request, res: Response) {
        const operation = this.uController.getUsers()
        if (!operation.success || !operation.data) {
            res
                .status(httpStatus.HTTP_STATUS_INTERNAL_SERVER_ERROR)
                .json(types.errorMsg(operation.msg as string))
            return
        }
        res.status(httpStatus.HTTP_STATUS_OK).json(operation.data)
    }
    handleGetUserByID(req: Request, res: Response) {
        const params = req.params
        const id = params.id
        if (id === undefined || (typeof id) !== "string" || id === "") {
            res
                .status(httpStatus.HTTP_STATUS_BAD_REQUEST)
                .json(types.errorMsg("invalid id"))
            return
        }
        const operation = this.uController.getUserByID(id as string)
        if (operation.success === false || operation.data === undefined) {
            res.status(httpStatus.HTTP_STATUS_NOT_FOUND)
                .json(types.errorMsg(operation.msg as string))
            return
        }
        res.status(httpStatus.HTTP_STATUS_OK).json(operation.data)
    }
    handleGetUserByEmail(req: Request, res: Response) {
        const email = req.body.email
        if (email === undefined || (typeof email) !== "string" || email === "") {
            res
                .status(httpStatus.HTTP_STATUS_BAD_REQUEST)
                .json(types.errorMsg("invalid id"))
            return
        }
        const operation = this.uController.getUserByEmail(email as string)
        if (operation.success === false || operation.data === undefined) {
            res.status(httpStatus.HTTP_STATUS_NOT_FOUND)
                .json(types.errorMsg(operation.msg as string))
            return
        }
        res.status(httpStatus.HTTP_STATUS_OK).json(operation.data)
    }
    handleGetUserByUsername(req: Request, res: Response) {
        const username = req.params.username
        if (username === undefined || (typeof username) !== "string" || username === "") {
            res
                .status(httpStatus.HTTP_STATUS_BAD_REQUEST)
                .json(types.errorMsg("invalid id"))
            return
        }
        const operation = this.uController.getUserByUsername(username as string)
        if (operation.success === false || operation.data === undefined) {
            res.status(httpStatus.HTTP_STATUS_NOT_FOUND)
                .json(types.errorMsg(operation.msg as string))
            return
        }
        res.status(httpStatus.HTTP_STATUS_OK).json(operation.data)
    }
    handleCreateUser(req: Request, res: Response) {
        const params = req.body
        const user: types.UserParams = {
            username: params.username,
            email: params.email,
            password: params.password,
        }
        if (!user.username || user.username === "" ||
            !user.email || user.email === "" ||
            !user.password || user.password === "") {
            res
                .status(httpStatus.HTTP_STATUS_BAD_REQUEST)
                .json(types.errorMsg("invalid params"))
            return
        }
        const operation = this.uController.createUser(user)
        if (operation.success === false || operation.data === undefined) {
            res.status(httpStatus.HTTP_STATUS_NOT_FOUND)
                .json(types.errorMsg(operation.msg as string))
            return
        }
        res.status(httpStatus.HTTP_STATUS_CREATED).json(operation.data)
    }
    handleCreateAdmin(req: Request, res: Response) {
        const params = req.body
        const user: types.UserParams = {
            username: params.username,
            email: params.email,
            password: params.password,
        }
        if (!user.username || !user.email || !user.password) {
            res
                .status(httpStatus.HTTP_STATUS_BAD_REQUEST)
                .json(types.errorMsg("invalid id"))
            return
        }
        const operation = this.uController.createAdmin(user)
        if (operation.success === false || operation.data === undefined) {
            res.status(httpStatus.HTTP_STATUS_NOT_FOUND)
                .json(types.errorMsg(operation.msg as string))
            return
        }
        res.status(httpStatus.HTTP_STATUS_CREATED).json(operation.data)
    }
    handleCancelUserByID(req: Request, res: Response) {
        const id = req.params.id
        const user: types.User_Middleware = res.locals.user
        if (!user) {
            res
                .status(httpStatus.HTTP_STATUS_BAD_REQUEST)
                .json(types.errorMsg("invalid id"))
            return
        }
        let operation: Operation<any>
        if (!user?.isAdmin && id === user?.ID || user.isAdmin) {
            operation = this.uController.cancelUserByID(id, user.isAdmin)
        } else {
            res
                .status(httpStatus.HTTP_STATUS_BAD_REQUEST)
                .json(types.errorMsg("invalid id"))
            return
        }
        if (!operation.success || !operation.data) {
            res.status(httpStatus.HTTP_STATUS_NOT_FOUND)
                .json(types.errorMsg(operation.msg as string))
            return
        }
        res.status(httpStatus.HTTP_STATUS_OK).json(operation.data)
    }
    handleDeleteUserByID(req: Request, res: Response) {
        const id = req.params.id
        const user: types.User_Middleware = res.locals.user
        if (!user) {
            res
                .status(httpStatus.HTTP_STATUS_BAD_REQUEST)
                .json(types.errorMsg("invalid id"))
            return
        }
        let operation: Operation<any>
        if (!user?.isAdmin && id === user?.ID || user.isAdmin) {
            operation = this.uController.deleteUserByID(id, user.isAdmin)
        } else {
            res
                .status(httpStatus.HTTP_STATUS_BAD_REQUEST)
                .json(types.errorMsg("invalid id"))
            return
        }
        if (!operation.success || !operation.data) {
            res.status(httpStatus.HTTP_STATUS_NOT_FOUND)
                .json(types.errorMsg(operation.msg as string))
            return
        }
        res.status(httpStatus.HTTP_STATUS_OK).json(operation.data)
    }
}
export class LinkHandler {
    linkController: LinkController
    constructor(linkController: LinkController) {
        this.linkController = linkController
        this.handleCreateLink = this.handleCreateLink.bind(this)
        this.handleCreateAnonymousLink = this.handleCreateAnonymousLink.bind(this)
        this.handleDeleteLinkByID = this.handleDeleteLinkByID.bind(this)
        this.handleCancelLinkByID = this.handleCancelLinkByID.bind(this)
        this.handleGetLinkById = this.handleGetLinkById.bind(this)
        this.handleGetLinksByUser = this.handleGetLinksByUser.bind(this)
    }
    handleCreateLink(req: Request, res: Response) {
        const params = req.body
        const user: types.User_Middleware = res.locals.user
        const link: types.LinkParams = {
            url: params.url,
        }
        if (!link.url || !user) {
            res
                .status(httpStatus.HTTP_STATUS_BAD_REQUEST)
                .json(types.errorMsg("invalid id"))
            return
        }
        const operation = this.linkController.createLink(link, user?.ID, user?.isAdmin)
        if (operation.success === false || operation.data === undefined) {
            res.status(httpStatus.HTTP_STATUS_NOT_FOUND)
                .json(types.errorMsg(operation.msg as string))
            return
        }
        res.status(httpStatus.HTTP_STATUS_CREATED).json(operation.data)
    }

    handleCreateAnonymousLink(req: Request, res: Response) {
        const params = req.body
        const link: types.LinkParams = {
            url: params.url,
        }
        const hasHttpPrefix = /^https?:\/\//i.test(link.url);
        link.url = hasHttpPrefix ? link.url : `http://${link.url}`;

        const operation = this.linkController.createAnonymousLink(link)
        if (operation.success === false || operation.data === undefined) {
            res.status(httpStatus.HTTP_STATUS_NOT_FOUND)
                .json(types.errorMsg(operation.msg as string))
            return
        }
        res.status(httpStatus.HTTP_STATUS_CREATED).json(operation.data)
    }

    handleDeleteLinkByID(req: Request, res: Response) {
        const id = req.params.id
        const user: types.User_Middleware = res.locals.user
        if (!user) {
            res
                .status(httpStatus.HTTP_STATUS_BAD_REQUEST)
                .json(types.errorMsg("invalid id"))
            return
        }
        let operation: Operation<any>
        const parsedID = parseInt(id)
        if (!isNaN(parsedID)) {
            operation = this.linkController.deleteLinkByID(parsedID, user.ID, user.isAdmin)
        } else {
            res
                .status(httpStatus.HTTP_STATUS_BAD_REQUEST)
                .json(types.errorMsg("invalid id"))
            return
        }
        if (!operation.success || !operation.data) {
            res.status(httpStatus.HTTP_STATUS_NOT_FOUND)
                .json(types.errorMsg(operation.msg as string))
            return
        }
        res.status(httpStatus.HTTP_STATUS_OK).json(operation.data)
    }
    handleCancelLinkByID(req: Request, res: Response) {
        const id = req.params.id
        const user: types.User_Middleware = res.locals.user
        if (!user) {
            res
                .status(httpStatus.HTTP_STATUS_BAD_REQUEST)
                .json(types.errorMsg("invalid user id"))
            return
        }
        let operation: Operation<any>
        const parsedID = parseInt(id)
        if (!isNaN(parsedID)) {
            operation = this.linkController.cancelLinkByID(parsedID, user.ID, user.isAdmin)
        } else {
            res
                .status(httpStatus.HTTP_STATUS_BAD_REQUEST)
                .json(types.errorMsg("invalid id"))
            return
        }
        if (!operation.success || !operation.data) {
            res.status(httpStatus.HTTP_STATUS_NOT_FOUND)
                .json(types.errorMsg(operation.msg as string))
            return
        }
        res.status(httpStatus.HTTP_STATUS_OK).json(operation.data)
    }
    handleGetLinkById(req: Request, res: Response) {
        const id: string = req.params.id
        const user: types.User_Middleware = res.locals.user
        if (!user) {
            res
                .status(httpStatus.HTTP_STATUS_BAD_REQUEST)
                .json(types.errorMsg("invalid user id"))
        }
        const operation = this.linkController.getLinkByID(id, user.isAdmin)
        if (!operation.success || !operation.data) {
            res.status(httpStatus.HTTP_STATUS_NOT_FOUND)
                .json(types.errorMsg(operation.msg as string))
            return
        }
        if (!user.isAdmin && operation.data.userID !== user.ID) {
            res.status(httpStatus.HTTP_STATUS_UNAUTHORIZED)
                .json(types.errorMsg("unauthorized"))
            return
        }
        res.status(httpStatus.HTTP_STATUS_OK).json(operation.data)
    }
    handleGetLinksByUser(req: Request, res: Response) {
        const id: string = req.params.id
        const user: types.User_Middleware = res.locals.user
        if (!user) {
            res
                .status(httpStatus.HTTP_STATUS_BAD_REQUEST)
                .json(types.errorMsg("invalid user id"))
        }
        if (!user.isAdmin && id !== user.ID) {
            res.status(httpStatus.HTTP_STATUS_UNAUTHORIZED)
                .json(types.errorMsg("unauthorized"))
            return
        }
        const operation = this.linkController.getLinksByUser(id, user.isAdmin)
        if (!operation.success || !operation.data) {
            res.status(httpStatus.HTTP_STATUS_NOT_FOUND)
                .json(types.errorMsg(operation.msg as string))
            return
        }
        res.status(httpStatus.HTTP_STATUS_OK).json(operation.data)
    }

}
export class LSHandler {
    linkSController: LinkServerController
    constructor(linkSController: LinkServerController) {
        this.linkSController = linkSController
        this.handleServeLink = this.handleServeLink.bind(this)
    }
    handleServeLink(req: Request, res: Response) {
        const params = req.params
        if (params.short === undefined || params.short === "") {
            res
                .status(httpStatus.HTTP_STATUS_BAD_REQUEST)
                .json(types.errorMsg("invalid id"))
            return
        }
        const operation = this.linkSController.serveLink(params.short)
        if (operation.success === false || operation.data === undefined) {
            res.status(httpStatus.HTTP_STATUS_NOT_FOUND)
                .json(types.errorMsg("id not found"))
            return
        }
        res.setHeader("Location", operation.data.trim())
        res.status(httpStatus.HTTP_STATUS_PERMANENT_REDIRECT)
        res.send()
        this.linkSController.trackLink(params.short)
    }
}
