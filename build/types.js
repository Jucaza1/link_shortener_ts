import z from "zod";
import crypto from 'crypto';
import { v4 as uuidv4 } from "uuid";
import { errorSource, Operation } from "./error.js";
export const UserSchema = z.object({
    ID: z.string().uuid(),
    guest: z.boolean(),
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(15, "Username must be 15 characters or less")
        .regex(/^[\p{L}\p{N}]+$/u, "Username can only contain letters, and numbers"),
    email: z.string().email(),
    deleted: z.boolean(),
    createdAt: z.string().date(),
    deletedAt: z.string().date(),
    encriptedPassword: z.string(),
});
export const LinkSchema = z.object({
    userID: z.string().uuid(),
    ID: z.string().uuid(),
    url: z.string().url(),
    short: z.string().url(),
    status: z.boolean(),
    deleted: z.boolean(),
    createdAt: z.string().date(),
    deletedAt: z.string().date(),
    expiresAt: z.string().date()
});
export const User_DTOSchema = UserSchema.omit({
    ID: true,
    deletedAt: true,
    deleted: true,
    encriptedPassword: true,
});
export const Link_DTOSchema = LinkSchema.omit({
    ID: true,
    userID: true,
    deleted: true,
    deletedAt: true,
});
export const UserParamsSchema = UserSchema.omit({
    ID: true,
    guest: true,
    deletedAt: true,
    deleted: true,
    createdAt: true,
    encriptedPassword: true,
}).extend({
    password: z.string().max(15, "Password must be 15 characters or less")
        .min(3, "Password must be at least 3 characters")
        .regex(/^[a-zA-Z0-9\p{P}]+$/u, "Password can only contain letters, numbers, and punctuation"),
});
export function parseUser_DTO(u) {
    return {
        username: u.username,
        guest: u.guest,
        email: u.email,
        createdAt: u.createdAt,
    };
}
export function parseLink_DTO(l) {
    return {
        url: l.url,
        short: l.short,
        status: l.status,
        createdAt: l.createdAt,
        expiresAt: l.expiresAt,
    };
}
export function errorMsg(s) {
    return { error: s };
}
export function createUserFromParams(params, encrypter) {
    const validationRes = UserParamsSchema.safeParse(params);
    if (!validationRes.success) {
        return new Operation(false, undefined, errorSource.validation, "invalid user");
    }
    const validParams = validationRes.data;
    const user = {
        ID: uuidv4(),
        username: validParams.username,
        email: validParams.email,
        guest: false,
        deleted: false,
        deletedAt: "",
        createdAt: (new Date(Date.now())).toISOString().split("T")[0],
        encriptedPassword: encrypter.encrytp(validParams.password),
    };
    return new Operation(true, user);
}
export class PasswordEncrypter {
    constructor(secret) {
        this.secret = secret;
    }
    encrytp(input) {
        // Create a HMAC hash using SHA-256
        const hash = crypto.createHmac('sha256', this.secret)
            .update(input)
            .digest('hex');
        return hash;
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
//# sourceMappingURL=types.js.map