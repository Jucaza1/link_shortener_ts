import { NextFunction, Request, Response } from "express"
import { constants as httpStatus } from "http2"

import { Auther } from "../auth"
import { UserController } from "../controllers"
import { PasswordEncrypter, User, User_DTO, User_Middleware, errorMsg } from "../types"
import { Operation } from "../error"

export class AuthHandler {
    auther: Auther
    uController: UserController
    encrypter: PasswordEncrypter
    constructor(auther: Auther, uController: UserController, encrypter: PasswordEncrypter) {
        this.auther = auther
        this.uController = uController
        this.encrypter = encrypter
        this.authenticate = this.authenticate.bind(this)
        this.validateMiddleware = this.validateMiddleware.bind(this)
    }
    authenticate(req: Request, res: Response) {
        let operation: Operation<User_DTO | undefined>
        if (req.body === undefined) {
            res.status(httpStatus.HTTP_STATUS_BAD_REQUEST)
                .json(errorMsg("invalid credentials"))
            return
        }
        if (req.body.password === undefined) {
            res.status(httpStatus.HTTP_STATUS_BAD_REQUEST)
                .json(errorMsg("invalid credentials"))
            return
        }
        const user = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
        }
        if (user.username !== undefined) {
            operation = this.uController.getUserByUsername(user.username)
        } else {
            if (user.email === undefined) {
                res.status(httpStatus.HTTP_STATUS_BAD_REQUEST)
                    .json(errorMsg("invalid credentials"))
                return
            }
            operation = this.uController.getUserByEmail(user.email)
        }
        if (operation.success === false || operation.data === undefined) {
            res.status(httpStatus.HTTP_STATUS_UNAUTHORIZED)
                .json(errorMsg("incorrect credentials"))
            return
        }
        const operation2 = this.uController.getEncrytpedPasswordByID(operation.data.ID)
        if (operation2.success === false || operation2.data === undefined) {
            res.status(httpStatus.HTTP_STATUS_UNAUTHORIZED)
                .json(errorMsg("incorrect credentials"))
            return
        }
        const encryptedPW = this.encrypter.encrytp(user.password)
        if (operation2.data !== encryptedPW) {
            res.status(httpStatus.HTTP_STATUS_UNAUTHORIZED)
                .json(errorMsg("incorrect credentials"))
            return
        }
        const token = this.auther.generateToken({ ID: operation.data.ID })
        res.setHeader("x-authorization", token).sendStatus(httpStatus.HTTP_STATUS_NO_CONTENT)
    }
    validateMiddleware(req: Request, res: Response, next: NextFunction) {
        const token = req.header("x-authorization")
        if (typeof token !== "string" || token === "") {
            res.status(httpStatus.HTTP_STATUS_UNAUTHORIZED)
                .json(errorMsg("invalid credentials"))
            return
        }
        const decoded = this.auther.verifyToken(token)
        if (decoded === undefined) {
            res.status(httpStatus.HTTP_STATUS_UNAUTHORIZED)
                .json(errorMsg("invalid credentials"))
            return
        }
        const operation = this.uController.getUserByID(decoded?.ID, true)
        if (operation.success === false || operation.data === undefined) {
            res.status(httpStatus.HTTP_STATUS_UNAUTHORIZED)
                .json(errorMsg("invalid credentials"))
            return
        }
        const user: User_Middleware = {
            ID: (operation.data as User).ID,
            isAdmin: (operation.data as User).isAdmin,
        }
        res.locals.user = user
        next()
    }
}
export function adminMiddleware(_req: Request, res: Response, next: NextFunction) {
    const user: User_Middleware = res.locals.user
    if (user.isAdmin) {
        next()
    } else {
        res.status(httpStatus.HTTP_STATUS_UNAUTHORIZED).json(errorMsg("unauthorized"))
    }

}
