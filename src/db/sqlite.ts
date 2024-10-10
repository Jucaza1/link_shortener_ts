import BetterSqlite3 from "better-sqlite3"
import * as db from "./main.js"
import { Link, User, UserEncryptedPW } from "../types.js"

export class SqliteDB implements db.LinkDB, db.UserDB {
    database: BetterSqlite3.Database
    location: string
    constructor(location: string) {
        this.location = location
        if (location[location.length - 1] === "/") {
            this.location = this.location + "database.db"
        }
        if (this.location.slice(-3) !== ".db") {
            this.location = this.location + ".db"
        }
        this.database = new BetterSqlite3(this.location)
        this.init = this.init.bind(this)
        this.backup = this.init.bind(this)
        this.trackServe = this.trackServe.bind(this)
        this.deleteUserByID = this.deleteUserByID.bind(this)
        this.cancelUserByID = this.cancelUserByID.bind(this)
        this.createUser = this.createUser.bind(this)
        this.getUserByUsername = this.getUserByUsername.bind(this)
        this.getUserByEmail = this.getUserByEmail.bind(this)
        this.getUserByID = this.getUserByID.bind(this)
        this.serveLink = this.serveLink.bind(this)
        this.deleteLinkByID = this.deleteLinkByID.bind(this)
        this.cancelLinkByID = this.cancelLinkByID.bind(this)
        this.createLink = this.createLink.bind(this)
        this.getLinkByID = this.getLinkByID.bind(this)
        this.getLinkByShort = this.getLinkByShort.bind(this)
        this.getLinksByUser = this.getLinksByUser.bind(this)
        this.getUsers = this.getUsers.bind(this)
        this.init()
    }
    getLinksByUser(UserID: string): Array<Link> {
        let result: Array<Link> = []
        const res = this.database.prepare(`
        SELECT * FROM Link WHERE userID == ?`).all(UserID)
        if (res !== undefined) {
            result = { ...result, ...(res as Array<Link>) }
        }
        return result
    }
    getLinkByID(id: number): Link | undefined {
        const res = this.database.prepare(`
        SELECT * FROM Link WHERE ID == ?`).get(id)
        return res as Link | undefined
    }
    createLink(link: Link): Link | undefined {
        const stmt = this.database.prepare(`
            INSERT INTO Link (userID, url, short, status, deleted,
            createdAt, deletedAt, expiresAt)
            VALUES (?,?,?,?,?,?,?,?)
            `)
        const info = stmt.run(link.userID, link.url, link.short,
            link.status, link.deleted, link.createdAt, link.deletedAt, link.expiresAt)
        if (info === undefined) return undefined
        if (info.changes < 1) return undefined
        return link
    }
    cancelLinkByID(id: number): boolean {
        const stmt = this.database.prepare(`
            UPDATE TABLE Link SET deleted = 1, deletedAt = ? WHERE ID == ?
            `)
        const deletedAt: Link["deletedAt"] = (new Date(Date.now()))
            .toISOString().split('T')[0]
        const info = stmt.run(deletedAt, id)
        if (info === undefined) return false
        if (info.changes < 1) return false
        return true
    }
    deleteLinkByID(id: number): boolean {
        const stmt = this.database.prepare(`
            DELETE FROM Link WHERE ID == ?
            `)
        const info = stmt.run(id)
        if (info === undefined) return false
        if (info.changes < 1) return false
        return true
    }
    serveLink(short: string): string | undefined {
        const res = this.database.prepare(`
        SELECT url FROM Link WHERE short == ?`).get(short)
        return res as string | undefined
    }
    getUsers(): Array<User> {
        const res = this.database.prepare(`
        SELECT * FROM User`).all()
        return res as Array<User>
    }
    getUserByID(id: string): User | undefined {
        const res = this.database.prepare(`
        SELECT * FROM User WHERE ID == ?`).get(id)
        return res as User | undefined
    }
    getEncryptedPasswordByID(id: string): string | undefined {
        const res = this.database.prepare(`
        SELECT encriptedPassword FROM User WHERE ID == ?`).get(id)
        if (res === undefined || (res as UserEncryptedPW).encriptedPassword === undefined) return undefined
        return (res as UserEncryptedPW).encriptedPassword as string | undefined
    }
    getUserByEmail(email: string): User | undefined {
        const res = this.database.prepare(`
        SELECT * FROM User WHERE email == ?`).get(email)
        return res as User | undefined
    }
    getUserByUsername(username: string): User | undefined {
        const res = this.database.prepare(`
        SELECT * FROM User WHERE username == ?`).get(username)
        return res as User | undefined
    }
    createUser(user: User): User | undefined {
        const stmt = this.database.prepare(`
            INSERT INTO User (ID, guest, username, email, deleted,
            createdAt, deletedAt, encriptedPassword)
            VALUES (?,?,?,?,?,?,?,?)
            `)
        const info = stmt.run(user.ID, user.guest, user.username, user.email,
            user.deleted, user.createdAt, user.deletedAt, user.encriptedPassword)
        if (info === undefined) return undefined
        if (info.changes < 1) return undefined
        return user
    }
    cancelUserByID(id: string): boolean {
        const stmt = this.database.prepare(`
            UPDATE TABLE User SET deleted = 1, deletedAt = ? WHERE ID == ?
            `)
        const deletedAt: User["deletedAt"] = (new Date(Date.now()))
            .toISOString().split('T')[0]
        const info = stmt.run(deletedAt, id)
        if (info === undefined) return false
        if (info.changes < 1) return false
        return true
    }
    deleteUserByID(id: string): boolean {
        const stmt = this.database.prepare(`
            DELETE FROM User WHERE ID == ?
            `)
        const info = stmt.run(id)
        if (info === undefined) return false
        if (info.changes < 1) return false
        return true
    }
    trackServe(short: string): boolean {
        let stmt = this.database.prepare(`
            UPDATE TABLE TrackLink SET activity = activity + 1 WHERE short == ?
            `)
        let info = stmt.run(short)
        if (info !== undefined && info.changes > 0) return true

        stmt = this.database.prepare(`
            INSERT INTO TrackLink (short, activity)
            VALUES (?,?)
            `)
        info = stmt.run(short, 1)
        if (info === undefined || info.changes < 1) return false
        return true
    }
    getLastLinkID(): number {
        const res = this.database.prepare(`
        SELECT max(ID) FROM Link`).get()
        if ("number" === typeof res)
            return res
        if ("string" === typeof res && res.length !== 0) {
            return parseInt(res)
        }
        return -1
    }
    getLinkByShort(short: string): Link | undefined {
        const res = this.database.prepare(`
        SELECT ID FROM Link WHERE short == ?`).get(short)
        return res as Link | undefined
    }
    private init() {
        this.database.pragma('journal_mode = WAL');
        this.database.exec(`
            CREATE TABLE IF NOT EXISTS User (
            ID UUID PRIMARY KEY,
            isAdmin BOOLEAN DEFAULT 0,
            guest BOOLEAN DEFAULT 0,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            deleted BOOLEAN DEFAULT 0,
            createdAt TEXT NOT NULL,
            deletedAt TEXT NOT NULL,
            encriptedPassword TEXT NOT NULL
            )
        `)
        this.database.exec(`
            CREATE TABLE IF NOT EXISTS Link (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            userID UUID ,
            url TEXT NOT NULL,
            short TEXT NOT NULL,
            status BOOLEAN DEFAULT 1,
            deleted BOOLEAN DEFAULT 0,
            createdAt TEXT NOT NULL ,
            expiresAt TEXT DEFAULT NULL,
            deletedAt TEXT DEFAULT NULL,
            FOREIGN KEY(userID) REFERENCES User(ID)
            )
        `)
        this.database.exec(`
            CREATE TABLE IF NOT EXISTS TrackLink (
            short TEXT PRIMARY KEY,
            activity INT DEFAULT 0
            )
        `)
    }
    backup() {
        this.database.backup(`${location}-backup-${Date.now()}.db`)
            .then(() => {
                console.log('backup complete!');
            })
            .catch((err) => {
                console.log('backup failed:', err);
            });
    }
}
