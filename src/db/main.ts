import * as types from "../types.js"

export interface UserDB {
    getUserByID(id: string): types.User | undefined
    getEncryptedPasswordByID(id: string): string | undefined
    getUserByEmail(email: string): types.User | undefined
    getUserByUsername(username: string): types.User | undefined
    createUser(user : types.User) : types.User | undefined
    cancelUserByID(id: string): boolean
    deleteUserByID(id: string): boolean
}
export interface LinkDB {
    getLinksByUser(UserID: string): Array<types.Link>
    getLinkByID(id: number): types.Link | undefined
    createLink(link: types.Link): types.Link | undefined
    cancelLink(id: string): boolean
    deleteLink(id: string): boolean
    serveLink(short: string): string | undefined
    trackServe(short: string): boolean
    getLastLinkID(): number
    getLinkByShort(short: string):types.Link | undefined
    //
}
