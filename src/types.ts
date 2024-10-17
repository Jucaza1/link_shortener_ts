import z  from "zod"
import crypto from 'crypto';
import { v4 as uuidv4 } from "uuid"

import { errorSource, Operation } from "./error.js"

export const UserSchema = z.object({
    ID: z.string().uuid(),
    isAdmin: z.boolean(),
    guest: z.boolean(),
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(15, "Username must be 15 characters or less")
        .regex(/^[\p{L}\p{N}]+$/u, "Username can only contain letters, and numbers"),
    email: z.string().email(),
    deleted: z.boolean(),
    createdAt: z.string().date(),
    deletedAt: z.string().date(),
    encryptedPassword: z.string(),
})
export const LinkSchema = z.object({
    userID: z.string().uuid(),
    ID: z.number(),
    url: z.string().url().refine((url) => {
        const domainRegex = /^https?:\/\/[a-zA-Z0-9\-_\.]+\.[a-z]{2,}(\/[a-zA-Z0-9\-_\.]*)*(\?[a-zA-Z0-9\-_=&]*)?$/i;
        return domainRegex.test(url);
    }, {
        message: "Invalid URL: Must contain a valid domain like .com, .org, etc.",
    }),
    short: z.string().url(),
    status: z.boolean(),
    deleted: z.boolean(),
    createdAt: z.string().date(),
    deletedAt: z.string().date(),
    expiresAt: z.string().date()
})
export const User_DTOSchema = UserSchema.omit({
    isAdmin: true,
    deletedAt: true,
    deleted: true,
    encryptedPassword: true,
})
export const Link_DTOSchema = LinkSchema.omit({
    ID: true,
    deleted: true,
    deletedAt: true,
})
export const UserEncryptedPWSchema = UserSchema.omit({
    ID: true,
    isAdmin: true,
    guest: true,
    deletedAt: true,
    deleted: true,
    createdAt: true,
    email: true,
    username: true
})
export const UserParamsSchema = UserSchema.omit({
    ID: true,
    isAdmin: true,
    guest: true,
    deletedAt: true,
    deleted: true,
    createdAt: true,
    encryptedPassword: true,

}).extend({
    password: z.string().max(15, "Password must be 15 characters or less")
        .min(3, "Password must be at least 3 characters")
        .regex(/^[a-zA-Z0-9\p{P}]+$/u, "Password can only contain letters, numbers, and punctuation"),

})
export const LinkParamsSchema = LinkSchema.omit({
    ID: true,
    createdAt: true,
    status: true,
    userID: true,
    deleted: true,
    deletedAt: true,
    expiresAt: true,
    short: true,
})
export type User = z.infer<typeof UserSchema>
export type UserParams = z.infer<typeof UserParamsSchema>
export type UserEncryptedPW = z.infer<typeof UserEncryptedPWSchema>
export type Link = z.infer<typeof LinkSchema>
export type LinkParams = z.infer<typeof LinkParamsSchema>
export type User_DTO = z.infer<typeof User_DTOSchema>
export type Link_DTO = z.infer<typeof Link_DTOSchema>
export type User_Middleware = {
    ID:z.infer<typeof UserSchema.shape.ID>,
    isAdmin:z.infer<typeof UserSchema.shape.isAdmin>,
}

export function parseUser_DTO(u: User): User_DTO {
    return {
        ID: u.ID,
        username: u.username,
        guest: u.guest,
        email: u.email,
        createdAt: u.createdAt,
    }
}
export function parseLink_DTO(l: Link): Link_DTO {
    return {
        userID: l.userID,
        url: l.url,
        short: l.short,
        status: l.status,
        createdAt: l.createdAt,
        expiresAt: l.expiresAt,
    }
}
type ErrorMsg = {
    error: string
}
export function errorMsg(s: string): ErrorMsg {
    return { error: s }
}
export function createUserFromParams(params: UserParams, encrypter: PasswordEncrypter, isAdmin: boolean = false): Operation<User | undefined> {
    const validationRes = UserParamsSchema.safeParse(params)
    if (!validationRes.success) {
        return new Operation(false, undefined, errorSource.validation, "invalid user")
    }
    const validParams = validationRes.data
    const user: User = {
        ID: uuidv4(),
        isAdmin: isAdmin,
        username: validParams.username,
        email: validParams.email,
        guest: false,
        deleted: false,
        deletedAt: "",
        createdAt: (new Date(Date.now())).toISOString().split("T")[0],
        encryptedPassword: encrypter.encrytp(validParams.password),
    }
    return new Operation(true, user)
}
export function createLinkFromParams(params: LinkParams, userID: string, short: string): Operation<Link | undefined> {
    const validationRes = LinkParamsSchema.safeParse(params)
    if (!validationRes.success) {
        return new Operation(false, undefined, errorSource.validation, "invalid user")
    }
    const validParams = validationRes.data
    const link: Link = {
        ID: 0,
        userID: userID,
        url: validParams.url,
        short: short,
        status: true,
        deleted: false,
        createdAt: (new Date(Date.now())).toISOString().split("T")[0],
        deletedAt: "",
        expiresAt: "",
    }
    return new Operation(true, link)
}

export function createLinkFromParamsWithExpiration(params: LinkParams, userID: string, short: string, expDate: string): Operation<Link | undefined> {
    const validationRes = LinkParamsSchema.safeParse(params)
    if (!validationRes.success) {
        return new Operation(false, undefined, errorSource.validation, "invalid url")
    }
    const validParams = validationRes.data
    const link: Link = {
        ID: 0,
        userID: userID,
        url: validParams.url,
        short: short,
        status: true,
        deleted: false,
        createdAt: (new Date()).toISOString().split("T")[0],
        deletedAt: "",
        expiresAt: expDate,
    }
    return new Operation(true, link)
}

export class PasswordEncrypter {
    private secret: string
    constructor(secret: string) {
        this.secret = secret
        this.encrytp = this.encrytp.bind(this)
    }
    encrytp(input: string): string {
        // Create a HMAC hash using SHA-256
        const hash = crypto.createHmac('sha256', this.secret)
            .update(input)
            .digest('hex');
        return hash
    }
}
// export type User = {
//     ID: UUID
//     username: string
//     email: string
//     deleted: boolean
//     createdAt: number
//     deletedAt: number
//     encriptedPassword: string
// }
// export type Link = {
//     ID:UUID
//     url: string
//     short: string
//     userID: UUID
//     status: boolean
//     deleted: boolean
//     createdAt: number
//     deletedAt: number
// }
// export type Link_DTO = Omit<Link, "userID" | "deletedAt" | "deleted">
// export type User_DTO = Omit<User, "deletedAt" | "deleted">
//
