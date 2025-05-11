import * as db from "./db/main";
import {
    User, User_DTO, UserSchema, UserParams, parseUser_DTO,
    Link, Link_DTO, LinkSchema, LinkParamsSchema, LinkParams, parseLink_DTO,
    createLinkFromParams, createUserFromParams, createLinkFromParamsWithExpiration,
    PasswordEncrypter
} from "./types/entities"
import { Hasher } from "./hash";
import { ResultHttp, resultStoreToResultHttp } from "./types/result";

export interface UserService {
    getUsers(): ResultHttp<User[]>
    getUserByID(id: string, forAdmin?: boolean): ResultHttp<User_DTO | User>
    getEncrytpedPasswordByID(id: string): ResultHttp<string>
    getUserByEmail(email: string, forAdmin?: boolean): ResultHttp<User_DTO | User>
    getUserByUsername(username: string, forAdmin?: boolean): ResultHttp<User_DTO | User>
    createUser(userParams: UserParams): ResultHttp<User_DTO>
    createAdmin(userParams: UserParams): ResultHttp<User>
    cancelUserByID(id: string, forAdmin?: boolean): ResultHttp<User_DTO | User>
    deleteUserByID(id: string, forAdmin?: boolean): ResultHttp<User_DTO | User>
}

export interface LinkService {
    getLinkByID(id: string, forAdmin?: boolean): ResultHttp<Link_DTO | Link>
    getLinksByUser(id: string, forAdmin?: boolean): ResultHttp<Link_DTO[] | Link[]>
    createLink(url: LinkParams, userID: string, forAdmin?: boolean): ResultHttp<Link_DTO | Link>
    createAnonymousLink(link: LinkParams): ResultHttp<Link_DTO>
    deleteLinkByID(id: number, userID: string, forAdmin?: boolean): ResultHttp<Link_DTO | Link>
    cancelLinkByID(id: number, userID: string, forAdmin?: boolean): ResultHttp<Link_DTO | Link>
}

export interface LinkServerService {
    serveLink(short: string): ResultHttp<string>
    trackLink(short: string): ResultHttp<boolean>
}

export class ServiceImpl implements UserService, LinkService, LinkServerService {
    udb: db.UserDB
    ldb: db.LinkDB
    haser: Hasher
    encrypter: PasswordEncrypter
    constructor(udb: db.UserDB, ldb: db.LinkDB, hasher: Hasher, encrypter: PasswordEncrypter) {
        this.udb = udb
        this.ldb = ldb
        this.haser = hasher
        this.encrypter = encrypter
        this.getUsers = this.getUsers.bind(this)
        this.getUserByID = this.getUserByID.bind(this)
        this.getUserByEmail = this.getUserByEmail.bind(this)
        this.getUserByUsername = this.getUserByUsername.bind(this)
        this.getEncrytpedPasswordByID = this.getEncrytpedPasswordByID.bind(this)
        this.createUser = this.createUser.bind(this)
        this.createAdmin = this.createAdmin.bind(this)
        this.cancelUserByID = this.cancelUserByID.bind(this)
        this.deleteUserByID = this.deleteUserByID.bind(this)
        this.getLinkByID = this.getLinkByID.bind(this)
        this.getLinksByUser = this.getLinksByUser.bind(this)
        this.createLink = this.createLink.bind(this)
        this.cancelLinkByID = this.cancelLinkByID.bind(this)
        this.deleteLinkByID = this.deleteLinkByID.bind(this)
        this.createAnonymousLink = this.createAnonymousLink.bind(this)
        this.serveLink = this.serveLink.bind(this)
        this.trackLink = this.trackLink.bind(this)

    }

    getUsers(): ResultHttp<User[]> {
        let result = this.udb.getUsers()
        return resultStoreToResultHttp(result)
    }

    getUserByID(id: string, forAdmin: boolean = false): ResultHttp<User_DTO | User> {
        const validationRes = UserSchema.shape.ID.safeParse(id)
        if (!validationRes.success) {
            return { ok: false, err: { status: 400, msg: [validationRes.error.message] } }
        }
        const validID = validationRes.data
        const result = this.udb.getUserByID(validID)
        if (forAdmin) {
            return resultStoreToResultHttp(result)
        }
        return resultStoreToResultHttp({ ...result, data: (result.ok ? parseUser_DTO(result.data!) : undefined) })
    }

    getEncrytpedPasswordByID(id: string): ResultHttp<string> {
        const validationRes = UserSchema.shape.ID.safeParse(id)
        if (!validationRes.success) {
            return { ok: false, err: { status: 400, msg: [validationRes.error.message] } }
        }
        const validID = validationRes.data
        const result = this.udb.getEncryptedPasswordByID(validID)
        return resultStoreToResultHttp(result)
    }

    getUserByEmail(email: string, forAdmin: boolean = false): ResultHttp<User_DTO | User> {
        const validationRes = UserSchema.shape.email.safeParse(email)
        if (!validationRes.success) {
            return { ok: false, err: { status: 400, msg: [validationRes.error.message] } }
        }
        const validEmail = validationRes.data
        const result = this.udb.getUserByEmail(validEmail)
        if (forAdmin) {
            return resultStoreToResultHttp(result)
        }
        return resultStoreToResultHttp({ ...result, data: (result.ok ? parseUser_DTO(result.data!) : undefined) })
    }

    getUserByUsername(username: string, forAdmin: boolean = false): ResultHttp<User_DTO> {
        const validationRes = UserSchema.shape.username.safeParse(username)
        if (!validationRes.success) {
            return { ok: false, err: { status: 400, msg: [validationRes.error.message] } }
        }
        const validUsername = validationRes.data
        const result = this.udb.getUserByUsername(validUsername)
        if (forAdmin) {
            return resultStoreToResultHttp(result)
        }
        return resultStoreToResultHttp({ ...result, data: (result.ok ? parseUser_DTO(result.data!) : undefined) })
    }

    createUser(userParams: UserParams): ResultHttp<User_DTO> {
        const validationUser = createUserFromParams(userParams, this.encrypter)
        if (!validationUser.ok) {
            return validationUser
        }
        const result = this.udb.createUser(validationUser.data!)
        return resultStoreToResultHttp({ ...result, data: (result.ok ? parseUser_DTO(result.data!) : undefined) })
    }

    createAdmin(userParams: UserParams): ResultHttp<User> {
        const validationUser = createUserFromParams(userParams, this.encrypter, true)
        if (!validationUser.ok) {
            return validationUser
        }
        const result = this.udb.createUser(validationUser.data!)
        return resultStoreToResultHttp(result)
    }

    cancelUserByID(id: string, forAdmin: boolean = false): ResultHttp<User_DTO> {
        const validationRes = UserSchema.shape.ID.safeParse(id)
        if (!validationRes.success) {
            return { ok: false, err: { status: 400, msg: [validationRes.error.message] } }
        }
        const validID = validationRes.data
        const resultGet = this.udb.getUserByID(validID)
        if (!resultGet.ok) {
            return resultStoreToResultHttp(resultGet)
        }
        const resultCancel = this.udb.cancelUserByID(validID)
        if (forAdmin) {
            return resultStoreToResultHttp({ ...resultCancel, data: (resultCancel.ok ? resultGet.data : undefined) })
        }
        return resultStoreToResultHttp({ ...resultCancel, data: (resultCancel.ok ? parseUser_DTO(resultGet.data!) : undefined) })
    }

    deleteUserByID(id: string, forAdmin: boolean = false): ResultHttp<User_DTO | User> {
        const validationRes = UserSchema.shape.ID.safeParse(id)
        if (!validationRes.success) {
            return { ok: false, err: { status: 400, msg: [validationRes.error.message] } }
        }
        const validID = validationRes.data
        const resultGet = this.udb.getUserByID(validID)
        if (!resultGet.ok) {
            return resultStoreToResultHttp(resultGet)
        }
        const resultDel = this.udb.cancelUserByID(validID)
        if (forAdmin) {
            return resultStoreToResultHttp({ ...resultDel, data: (resultDel.ok ? resultGet.data : undefined) })
        }
        return resultStoreToResultHttp({ ...resultDel, data: (resultDel.ok ? parseUser_DTO(resultGet.data!) : undefined) })
    }

    getLinkByID(id: string, forAdmin: boolean = false): ResultHttp<Link_DTO | Link> {
        const validationRes = LinkSchema.shape.ID.safeParse(id)
        if (!validationRes.success) {
            return { ok: false, err: { status: 400, msg: [validationRes.error.message] } }
        }
        const validID = validationRes.data
        const result = this.ldb.getLinkByID(validID)
        if (forAdmin) {
            return resultStoreToResultHttp(result)
        }
        return resultStoreToResultHttp({ ...result, data: (result.ok ? parseLink_DTO(result.data!) : undefined) })
    }

    getLinksByUser(id: string, forAdmin: boolean = false): ResultHttp<Link_DTO[] | Link[]> {
        const validationRes = UserSchema.shape.ID.safeParse(id)
        if (!validationRes.success) {
            return { ok: false, err: { status: 400, msg: [validationRes.error.message] } }
        }
        const validID = validationRes.data
        const result = this.ldb.getLinksByUser(validID)
        if (forAdmin) {
            return resultStoreToResultHttp(result)
        }
        return resultStoreToResultHttp({ ...result, data: (result.ok ? result.data?.map((l) => parseLink_DTO(l)) : undefined) })
    }

    createLink(link: LinkParams, userID: string, forAdmin: boolean = false): ResultHttp<Link_DTO | Link> {
        let validationUserRes = UserSchema.shape.ID.safeParse(userID)
        if (!validationUserRes.success) {
            return { ok: false, err: { status: 400, msg: [validationUserRes.error.message] } }
        }
        const validID = validationUserRes.data
        let validationLinkRes = LinkParamsSchema.safeParse(link)
        if (!validationLinkRes.success) {
            return { ok: false, err: { status: 400, msg: [validationLinkRes.error.message] } }
        }
        const userResult = this.udb.getUserByID(validID)
        if (!userResult.ok) {
            return { ok: false, err: { status: 400, msg: ["invalid user"] } }
        }
        const currentId = this.ldb.getLastLinkID()
        if (!currentId.ok || currentId.data === undefined) {
            return { ok: false, err: { status: 500, msg: ["internal server error"] } }
        }
        const nextId = currentId.data + 1
        const short = this.haser.hash(nextId)
        const validationLink = createLinkFromParams(link, validID, short)
        if (!validationLink.ok || validationLink.data === undefined) {
            return validationLink
        }
        const result = this.ldb.createLink(validationLink.data)
        if (forAdmin) {
            return resultStoreToResultHttp(result)
        }
        return resultStoreToResultHttp({ ...result, data: (result.ok ? parseLink_DTO(result.data!) : undefined) })
    }

    createAnonymousLink(link: LinkParams): ResultHttp<Link_DTO> {
        let validationLinkRes = LinkParamsSchema.safeParse(link)
        if (!validationLinkRes.success) {
            return { ok: false, err: { status: 400, msg: [validationLinkRes.error.message] } }
        }
        const currentId = this.ldb.getLastLinkID()
        if (!currentId.ok || currentId.data === undefined) {
            return { ok: false, err: { status: 500, msg: ["internal server error"] } }
        }
        const next = currentId.data + 1
        const short = this.haser.hash(next)
        const durationMilis = 1000 * 60 * 60 * 24
        const expDate = (new Date(Date.now() + durationMilis)).toISOString().split(".")[0]

        const validationLink = createLinkFromParamsWithExpiration(link, null, short, expDate)
        if (!validationLink.ok || validationLink.data === undefined) {
            return validationLink
        }
        const result = this.ldb.createLink(validationLink.data)
        return resultStoreToResultHttp(result)
    }

    deleteLinkByID(id: number, userID: string, forAdmin: boolean = false): ResultHttp<Link | Link_DTO> {
        const validationRes = LinkSchema.shape.ID.safeParse(id)
        if (!validationRes.success) {
            return { ok: false, err: { status: 400, msg: [validationRes.error.message] } }
        }
        const validID = validationRes.data
        const resultGet = this.ldb.getLinkByID(validID)
        if (!resultGet.ok || resultGet.data === undefined) {
            return { ok: false, err: { status: 400, msg: ["not found"] } }
        }
        if (!forAdmin && resultGet.data.userID !== userID) {
            return { ok: false, err: { status: 401, msg: ["unauthorized"] } }
        }
        const resultDel = this.ldb.deleteLinkByID(validID)
        if (forAdmin) {
            return resultStoreToResultHttp({ ...resultDel, data: (resultDel.ok ? resultGet.data : undefined) })
        }
        return resultStoreToResultHttp({ ...resultDel, data: (resultDel.ok ? parseLink_DTO(resultGet.data!) : undefined) })
    }

    cancelLinkByID(id: number, userID: string, forAdmin: boolean = false): ResultHttp<Link | Link_DTO> {
        const validationRes = LinkSchema.shape.ID.safeParse(id)
        if (!validationRes.success) {
            return { ok: false, err: { status: 400, msg: [validationRes.error.message] } }
        }
        const validID = validationRes.data
        const resultGet = this.ldb.getLinkByID(validID)
        if (!resultGet.ok || resultGet.data === undefined) {
            return { ok: false, err: { status: 400, msg: ["not found"] } }
        }
        if (!forAdmin && resultGet.data.userID !== userID) {
            return { ok: false, err: { status: 401, msg: ["unauthorized"] } }
        }
        const resultDel = this.ldb.deleteLinkByID(validID)
        if (forAdmin) {
            return resultStoreToResultHttp({ ...resultDel, data: (resultDel.ok ? resultGet.data : undefined) })
        }
        return resultStoreToResultHttp({ ...resultDel, data: (resultDel.ok ? parseLink_DTO(resultGet.data!) : undefined) })
    }

    serveLink(short: string): ResultHttp<string> {
        const url = this.ldb.serveLink(short)
        if (!url.ok || url.data === undefined) {
            return { ok: false, err: { status: 404, msg: ["not found"] } }
        }
        return resultStoreToResultHttp(url)
    }

    trackLink(short: string): ResultHttp<boolean> {
        const result = this.ldb.trackServe(short)
        return resultStoreToResultHttp(result)
    }
}
