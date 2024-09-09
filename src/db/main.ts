import * as types from "../types.js"

export interface UserDB {
    getUserByID(id: string): types.User | undefined
    getUserByEmail(email: string): types.User | undefined
    getUserByUsername(username: string): types.User | undefined
    createUser(user : types.User) : types.User | undefined
    cancelUserByID(id: string): boolean
    deleteUserByID(id: string): boolean
}
export interface LinkDB {
    getLinksByUser(UserID: string): Array<types.Link>
    getLinkbyID(id: string): types.Link | undefined
    createLink(link: types.Link): types.Link | undefined
    cancelLink(id: string): boolean
    deleteLink(id: string): boolean
    serveLink(short: string): string | undefined
    trackServe(short: string): boolean
    //
}
