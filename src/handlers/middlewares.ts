import { Request, Response } from "express"
import { constants as httpStatus } from "http2"

import { Auther } from "../auth"
import { UserService } from "../services"
import { PasswordEncrypter, User, User_Middleware } from "../types/entities"
import { NextFunction } from "../types/express"
import { ResultHttp } from "../types/result"

export class AuthHandler {
    auther: Auther
    uService: UserService
    encrypter: PasswordEncrypter
    constructor(auther: Auther, uService: UserService, encrypter: PasswordEncrypter) {
        this.auther = auther
        this.uService = uService
        this.encrypter = encrypter
        this.authenticate = this.authenticate.bind(this)
        this.validateMiddleware = this.validateMiddleware.bind(this)
    }
    authenticate(req: Request, res: Response, next: NextFunction) {
        let result: ResultHttp<User>
        if (req?.body?.password === undefined) {
            next({ httpError: { status: httpStatus.HTTP_STATUS_BAD_REQUEST, msg: ["incorrect credentials"] } })
        }
        const user = {
            username: req.body?.username,
            email: req.body?.email,
            password: req.body?.password,
        }
        if (user.username !== undefined) {
            // if usernamse is defined, we use it to get the user
            result = this.uService.getUserByUsername(user.username, true) as ResultHttp<User>
        } else {
            if (user.email === undefined) {
                next({ httpError: { status: httpStatus.HTTP_STATUS_BAD_REQUEST, msg: ["incorrect credentials"] } })
                return
            }
            // if email is defined, we use it to get the user
            result = this.uService.getUserByEmail(user.email) as ResultHttp<User>
        }
        if (!result.ok || result.data === undefined) {
            next({ httpError: { status: httpStatus.HTTP_STATUS_UNAUTHORIZED, msg: ["incorrect credentials"] } })
            return
        }
        const encryptedPW = this.encrypter.encrytp(user.password)
        if (result.data.encryptedPassword !== encryptedPW) {
            next({ httpError: { status: httpStatus.HTTP_STATUS_UNAUTHORIZED, msg: ["incorrect credentials"] } })
            return
        }
        const token = this.auther.generateToken({ ID: result.data.ID })
        res.setHeader("x-authorization", token).sendStatus(httpStatus.HTTP_STATUS_NO_CONTENT)
    }
    validateMiddleware(req: Request, res: Response, next: NextFunction) {
        const token = req.header("x-authorization")
        if (!token || token === "") {
            next({ httpError: { status: httpStatus.HTTP_STATUS_UNAUTHORIZED, msg: ["invalid credentials"] } })
            return
        }
        const decoded = this.auther.verifyToken(token)
        if (decoded === undefined) {
            next({ httpError: { status: httpStatus.HTTP_STATUS_UNAUTHORIZED, msg: ["invalid credentials"] } })
            return
        }
        const result = this.uService.getUserByID(decoded?.ID, true)
        if (!result.ok || result.data === undefined) {
            next({ httpError: { status: httpStatus.HTTP_STATUS_UNAUTHORIZED, msg: ["invalid credentials"] } })
            return
        }
        const user: User_Middleware = {
            ID: (result.data as User).ID,
            isAdmin: (result.data as User).isAdmin,
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
        next({ httpError: { status: httpStatus.HTTP_STATUS_UNAUTHORIZED, msg: ["invalid credentials"] } })
    }

}
