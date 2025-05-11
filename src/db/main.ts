import { ResultStore } from "../types/result"
import { Link, User } from "../types/entities"

export interface UserDB {
    getUsers(): ResultStore<User[]>
    getUserByID(id: string): ResultStore<User>
    getEncryptedPasswordByID(id: string): ResultStore<string>
    getUserByEmail(email: string): ResultStore<User>
    getUserByUsername(username: string): ResultStore<User>
    createUser(user: User): ResultStore<User>
    cancelUserByID(id: string): ResultStore<boolean>
    deleteUserByID(id: string): ResultStore<boolean>
    teardown(): void
}

export interface LinkDB {
    getLinksByUser(UserID: string): ResultStore<Link[]>
    getLinkByID(id: number): ResultStore<Link>
    createLink(link: Link): ResultStore<Link>
    cancelLinkByID(id: number): ResultStore<boolean>
    deleteLinkByID(id: number): ResultStore<boolean>
    serveLink(short: string): ResultStore<string>
    trackServe(short: string): ResultStore<boolean>
    getLastLinkID(): ResultStore<number>
    getLinkByShort(short: string): ResultStore<Link>
    teardown(): void
    //
}
