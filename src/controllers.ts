import * as db from "./db/main.js";
import * as types from "./types.js"
import { errorSource, Operation } from "./error.js";
import { Hasher } from "./hash.js";

export interface UserController {
    getUsers(): Operation<Array<types.User> | undefined>
    getUserByID(id: string, forAdmin?: boolean): Operation<types.User_DTO | types.User | undefined>
    getEncrytpedPasswordByID(id: string): Operation<string | undefined>
    getUserByEmail(email: string, forAdmin?: boolean): Operation<types.User_DTO | types.User | undefined>
    getUserByUsername(username: string, forAdmin?: boolean): Operation<types.User_DTO | types.User | undefined>
    createUser(userParams: types.UserParams): Operation<types.User_DTO | undefined>
    createAdmin(userParams: types.UserParams): Operation<types.User | undefined>
    cancelUserByID(id: string, forAdmin?: boolean): Operation<types.User_DTO | types.User | undefined>
    deleteUserByID(id: string, forAdmin?: boolean): Operation<types.User_DTO | types.User | undefined>
}
export interface LinkController {
    getLinkByID(id: string, forAdmin?: boolean): Operation<types.Link_DTO | types.Link | undefined>
    getLinksByUser(id: string, forAdmin?: boolean): Operation<Array<types.Link_DTO> | Array<types.Link>>
    createLink(url: types.LinkParams, userID: string, forAdmin?: boolean): Operation<types.Link_DTO | types.Link | undefined>
    deleteLinkByID(id: number, userID: string, forAdmin?: boolean): Operation<types.Link_DTO | types.Link | undefined>
    cancelLinkByID(id: number, userID: string, forAdmin?: boolean): Operation<types.Link_DTO | types.Link | undefined>
}
export interface LinkServerController {
    serveLink(short: string): Operation<string | undefined>
    trackLink(short: string): Operation<boolean>
}
export class ControllerImp implements UserController, LinkController, LinkServerController {
    udb: db.UserDB
    ldb: db.LinkDB
    haser: Hasher
    encrypter: types.PasswordEncrypter
    constructor(udb: db.UserDB, ldb: db.LinkDB, hasher: Hasher, encrypter: types.PasswordEncrypter) {
        this.udb = udb
        this.ldb = ldb
        this.haser = hasher
        this.encrypter = encrypter
        this.getUsers = this.getUsers.bind(this)
        this.getUserByID = this.getUserByID.bind(this)
        this.getUserByEmail = this.getUserByEmail.bind(this)
        this.getUserByUsername = this.getUserByUsername.bind(this)
        this.createUser = this.createUser.bind(this)
        this.createAdmin = this.createAdmin.bind(this)
        this.cancelUserByID = this.cancelUserByID.bind(this)
        this.deleteUserByID = this.deleteUserByID.bind(this)
        this.getLinkByID = this.getLinkByID.bind(this)
        this.getLinksByUser = this.getLinksByUser.bind(this)
        this.createLink = this.createLink.bind(this)
        this.serveLink = this.serveLink.bind(this)
        this.trackLink = this.trackLink.bind(this)

    }
    getUsers(): Operation<Array<types.User> | undefined> {
        let result: Array<types.User> | undefined
        result = this.udb.getUsers()
        if (!result){
            return new Operation(false,undefined,errorSource.database, "internal server error")
        }
        return new Operation(true,result)
    }
    getUserByID(id: string, forAdmin: boolean = false): Operation<types.User_DTO | types.User | undefined> {
        let result: types.User | undefined
        const validationRes = types.UserSchema.shape.ID.safeParse(id)
        if (!validationRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid id")
        }
        const validID = validationRes.data
        try {
            result = this.udb.getUserByID(validID)
        } catch (e) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (result === undefined) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (forAdmin) {
            return new Operation(true, result)
        }
        return new Operation(true, types.parseUser_DTO(result))
    }
    getEncrytpedPasswordByID(id: string): Operation<string | undefined> {
        let result: string | undefined
        const validationRes = types.UserSchema.shape.ID.safeParse(id)
        if (!validationRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid id")
        }
        const validID = validationRes.data
        try {
            result = this.udb.getEncryptedPasswordByID(validID)
        } catch (e) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (result === undefined) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        return new Operation(true, result)
    }
    getUserByEmail(email: string, forAdmin: boolean = false): Operation<types.User_DTO | types.User | undefined> {
        let result: types.User | undefined
        const validationRes = types.UserSchema.shape.email.safeParse(email)
        if (!validationRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid email")
        }
        const validEmail = validationRes.data
        try {
            result = this.udb.getUserByEmail(validEmail)
        } catch (e) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (result === undefined) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (forAdmin) {
            return new Operation(true, result)
        }
        return new Operation(true, types.parseUser_DTO(result))
    }
    getUserByUsername(username: string, forAdmin: boolean = false): Operation<types.User_DTO | undefined> {
        let result: types.User | undefined
        const validationRes = types.UserSchema.shape.username.safeParse(username)
        if (!validationRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid username")
        }
        const validUsername = validationRes.data
        try {
            result = this.udb.getUserByEmail(validUsername)
        } catch (e) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (result === undefined) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (forAdmin) {
            return new Operation(true, result)
        }
        return new Operation(true, types.parseUser_DTO(result))
    }
    createUser(userParams: types.UserParams): Operation<types.User_DTO | undefined> {
        let result: types.User | undefined
        const validationRes = types.UserParamsSchema.safeParse(userParams)
        if (!validationRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid user")
        }
        const validUserParams: types.UserParams = validationRes.data
        const operation = types.createUserFromParams(validUserParams, this.encrypter)
        if (!operation.success || operation.data === undefined) {
            return operation
        }
        try {
            result = this.udb.createUser(operation.data)
        } catch (e) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (result === undefined) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        return new Operation(true, types.parseUser_DTO(result))
    }
    createAdmin(userParams: types.UserParams): Operation<types.User | undefined> {
        let result: types.User | undefined
        const validationRes = types.UserParamsSchema.safeParse(userParams)
        if (!validationRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid user")
        }
        const validUserParams: types.UserParams = validationRes.data
        const operation = types.createUserFromParams(validUserParams, this.encrypter, true)
        if (!operation.success || operation.data === undefined) {
            return operation
        }
        try {
            result = this.udb.createUser(operation.data)
        } catch (e) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (result === undefined) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        return new Operation(true, result)
    }
    cancelUserByID(id: string, forAdmin: boolean = false): Operation<types.User_DTO | undefined> {
        let result: types.User | undefined
        let success: boolean = false
        const validationRes = types.UserSchema.shape.ID.safeParse(id)
        if (!validationRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid id")
        }
        const validID = validationRes.data
        try {
            result = this.udb.getUserByID(validID)
        } catch (e) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (result === undefined) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        try {
            success = this.udb.cancelUserByID(validID)
        } catch (e) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (true !== success) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (forAdmin) {
            return new Operation(true, types.parseUser_DTO(result))
        }
        return new Operation(true, types.parseUser_DTO(result))

    }
    deleteUserByID(id: string, forAdmin: boolean = false): Operation<types.User_DTO | types.User | undefined> {
        let result: types.User | undefined
        let success: boolean = false
        const validationRes = types.UserSchema.shape.ID.safeParse(id)
        if (!validationRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid id")
        }
        const validID = validationRes.data
        try {
            result = this.udb.getUserByID(validID)
        } catch (e) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (result === undefined) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        try {
            success = this.udb.deleteUserByID(validID)
        } catch (e) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (true !== success) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (forAdmin) {
            return new Operation(true, result)
        }
        return new Operation(true, types.parseUser_DTO(result))
    }
    getLinkByID(id: string, forAdmin: boolean = false): Operation<types.Link_DTO | types.Link | undefined> {
        let result: types.Link | undefined
        const validationRes = types.LinkSchema.shape.ID.safeParse(id)
        if (!validationRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid id")
        }
        const validID = validationRes.data
        try {
            result = this.ldb.getLinkByID(validID)
        } catch (e) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (result === undefined) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (forAdmin) {
            return new Operation(true, result)
        }
        return new Operation(true, types.parseLink_DTO(result))
    }
    getLinksByUser(id: string, forAdmin: boolean = false): Operation<Array<types.Link_DTO> | Array<types.Link>> {
        let result: Array<types.Link> = []
        const validationRes = types.UserSchema.shape.ID.safeParse(id)
        if (!validationRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid id")
        }
        const validID = validationRes.data
        try {
            result = this.ldb.getLinksByUser(validID)
        } catch (e) {
            return new Operation(false, [], errorSource.database, "internal server error")
        }
        if (result === undefined) {
            return new Operation(false, [], errorSource.database, "internal server error")
        }
        if (forAdmin) {
            return new Operation(true, result)
        }
        return new Operation(true, result.map(link => types.parseLink_DTO(link)))
    }
    createLink(link: types.LinkParams, userID: string, forAdmin: boolean = false): Operation<types.Link_DTO | types.Link | undefined> {
        let userResult: types.User | undefined
        let result: types.Link | undefined
        let validationUserRes = types.LinkSchema.shape.userID.safeParse(userID)
        if (!validationUserRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid id")
        }
        const validID = validationUserRes.data
        let validationLinkRes = types.LinkParamsSchema.safeParse(link)
        if (!validationLinkRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid url")
        }
        try {
            userResult = this.udb.getUserByID(validID)
        } catch (e) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (userResult === undefined) {
            return new Operation(false, undefined, errorSource.database, "user not found")
        }
        const next = this.ldb.getLastLinkID() + 1
        const short = this.haser.hash(next)
        const operation = types.createLinkFromParams(link, validID, short)
        if (!operation.success || operation.data === undefined) {
            return operation
        }
        result = operation.data
        try {
            result = this.ldb.createLink(result)
        } catch (e) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        result = this.ldb.getLinkByShort(short)
        if (result === undefined) {
            return new Operation(false, undefined, errorSource.database, "user not found")
        }
        if (forAdmin) {
            return new Operation(true, result)
        }
        return new Operation(true, types.parseLink_DTO(result))
    }
    deleteLinkByID(id: number, userID: string, isAdmin: boolean = false): Operation<types.Link | undefined> {
        let result: types.Link | undefined
        let success: boolean = false
        const validationRes = types.LinkSchema.shape.ID.safeParse(id)
        if (!validationRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid id")
        }
        const validID = validationRes.data
        try {
            result = this.ldb.getLinkByID(validID)
        } catch (e) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (result === undefined) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (!isAdmin && result.userID !== userID) {
            return new Operation(false, undefined, errorSource.database, "unauthorized")
        }
        try {
            success = this.ldb.deleteLinkByID(validID)
        } catch (e) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (true !== success) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        return new Operation(true, result)
    }
    cancelLinkByID(id: number, userID: string, isAdmin: boolean = false): Operation<types.Link | undefined> {
        let result: types.Link | undefined
        let success: boolean = false
        const validationRes = types.LinkSchema.shape.ID.safeParse(id)
        if (!validationRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid id")
        }
        const validID = validationRes.data
        try {
            result = this.ldb.getLinkByID(validID)
        } catch (e) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (result === undefined) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (!isAdmin && result.userID !== userID) {
            return new Operation(false, undefined, errorSource.database, "unauthorized")
        }
        try {
            success = this.ldb.cancelLinkByID(validID)
        } catch (e) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (true !== success) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        return new Operation(true, result)
    }
    serveLink(short: string): Operation<string | undefined> {
        const url = this.ldb.serveLink(short)
        if (url === undefined || url === "") {
            return new Operation(false, undefined, errorSource.database, "link not found")
        }
        return new Operation(true, url)
    }
    trackLink(short: string): Operation<boolean> {
        const success = this.ldb.trackServe(short)
        if (!success) {
            return new Operation(false, false, errorSource.database, "internal server error")
        }
        return new Operation(true, success)
    }
}
