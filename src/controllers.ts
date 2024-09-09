import * as db from "./db/main.js";
import * as types from "./types.js"
import { errorSource, Operation } from "./error.js";

export interface UserController {
    getUserByID(id: string): Operation<types.User_DTO | undefined>
    getUserbyEmail(email: string): Operation<types.User_DTO | undefined>
    getUserbyUsername(username: string): Operation<types.User_DTO | undefined>
    createUser(userParams: types.UserParams): Operation<types.User_DTO | undefined>

}
export class Controller implements UserController {
    udb: db.UserDB
    ldb: db.LinkDB
    encrypter: types.PasswordEncrypter
    constructor(udb: db.UserDB, ldb: db.LinkDB, encrypter: types.PasswordEncrypter) {
        this.udb = udb
        this.ldb = ldb
        this.encrypter = encrypter
    }
    getUserByID(id: string, forAdmin: boolean = false): Operation<types.User_DTO | undefined> {
        let result: types.User | undefined
        let validID: string
        const validationRes = types.UserSchema.shape.ID.safeParse(id)
        if (!validationRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid id")
        }
        validID = validationRes.data
        try {
            result = this.udb.getUserByID(validID)
        } catch (e) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (result == undefined) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (forAdmin) {
            return new Operation(true, result)
        }
        return new Operation(true, types.parseUser_DTO(result))
    }
    getUserbyEmail(email: string, forAdmin: boolean = false): Operation<types.User_DTO | undefined> {
        let result: types.User | undefined
        let validEmail: string
        const validationRes = types.UserSchema.shape.email.safeParse(email)
        if (!validationRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid email")
        }
        validEmail = validationRes.data
        try {
            result = this.udb.getUserByEmail(validEmail)
        } catch (e) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (result == undefined) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (forAdmin) {
            return new Operation(true, result)
        }
        return new Operation(true, types.parseUser_DTO(result))
    }
    getUserbyUsername(username: string, forAdmin: boolean = false): Operation<types.User_DTO | undefined> {
        let result: types.User | undefined
        let validUsername: string
        const validationRes = types.UserSchema.shape.username.safeParse(username)
        if (!validationRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid username")
        }
        validUsername = validationRes.data
        try {
            result = this.udb.getUserByEmail(validUsername)
        } catch (e) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (result == undefined) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (forAdmin) {
            return new Operation(true, result)
        }
        return new Operation(true, types.parseUser_DTO(result))
    }
    createUser(userParams: types.UserParams): Operation<types.User_DTO | undefined> {
        let result: types.User | undefined
        let validUserParams: types.UserParams
        const validationRes = types.UserParamsSchema.safeParse(userParams)
        if (!validationRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid user")
        }
        validUserParams = validationRes.data
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
        let validUserParams: types.UserParams
        const validationRes = types.UserParamsSchema.safeParse(userParams)
        if (!validationRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid user")
        }
        validUserParams = validationRes.data
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
        let validID: string
        let success: boolean = false
        const validationRes = types.UserSchema.shape.ID.safeParse(id)
        if (!validationRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid id")
        }
        validID = validationRes.data
        try {
            result = this.udb.getUserByID(validID)
        } catch (e) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (result == undefined) {
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
        let validID: string
        let success: boolean = false
        const validationRes = types.UserSchema.shape.ID.safeParse(id)
        if (!validationRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid id")
        }
        validID = validationRes.data
        try {
            result = this.udb.getUserByID(validID)
        } catch (e) {
            return new Operation(false, undefined, errorSource.database, "internal server error")
        }
        if (result == undefined) {
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
        let validID: string
        const validationRes = types.LinkSchema.shape.ID.safeParse(id)
        if (!validationRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid id")
        }
        validID = validationRes.data
        try {
            result = this.ldb.getLinkbyID(validID)
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
        let validID: string
        const validationRes = types.UserSchema.shape.ID.safeParse(id)
        if (!validationRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid id")
        }
        validID = validationRes.data
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
    createLink(url: string, userID: string, forAdmin: boolean = false): Operation<types.Link_DTO | types.Link | undefined> {
        let userResult: types.User | undefined
        let result: types.Link | undefined
        let validID: string
        const validationRes = types.LinkSchema.shape.userID.safeParse(userID)
        if (!validationRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid id")
        }
        validID = validationRes.data
        try {
            userResult = this.udb.getUserByID(validID)
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

}
