import BetterSqlite3 from "better-sqlite3"
import cron from 'node-cron'
import { existsSync, unlinkSync } from "fs"

import * as db from "./main"
import { Link, LinkParams, User, UserEncryptedPW } from "../types"

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
        this.startCleanExpiredLink = this.startCleanExpiredLink.bind(this)
        this.backup = this.init.bind(this)
        this.trackServe = this.trackServe.bind(this)
        this.deleteUserByID = this.deleteUserByID.bind(this)
        this.cancelUserByID = this.cancelUserByID.bind(this)
        this.createUser = this.createUser.bind(this)
        this.getUserByUsername = this.getUserByUsername.bind(this)
        this.getUserByEmail = this.getUserByEmail.bind(this)
        this.getUserByID = this.getUserByID.bind(this)
        this.getEncryptedPasswordByID = this.getEncryptedPasswordByID.bind(this)
        this.serveLink = this.serveLink.bind(this)
        this.deleteLinkByID = this.deleteLinkByID.bind(this)
        this.cancelLinkByID = this.cancelLinkByID.bind(this)
        this.createLink = this.createLink.bind(this)
        this.getLinkByID = this.getLinkByID.bind(this)
        this.getLinkByShort = this.getLinkByShort.bind(this)
        this.getLinksByUser = this.getLinksByUser.bind(this)
        this.getUsers = this.getUsers.bind(this)
        this.teardown = this.teardown.bind(this)
        this.init()
    }

    getLinksByUser(UserID: string): Array<Link> {
        const res = this.database.prepare<[string], Link>(`
        SELECT * FROM Link WHERE userID == ?`).all(UserID)
        if (res === undefined) {
            return []
        }
        if (res.length === 0) {
            return []
        }
        for (let l of res) {
            l.status = l.status == true
            l.deleted = l.deleted == true
        }
        return res
    }

    getLinkByID(id: number): Link | undefined {
        const res = this.database.prepare<[number], Link>(`
        SELECT * FROM Link WHERE ID == ?`).get(id)
        if (res === undefined) {
            return undefined
        }
        res.status = res.status == true
        res.deleted = res.deleted == true
        return res
    }

    createLink(link: Link): Link | undefined {
        const stmt = this.database.prepare<[string | null, string, string, number, number, string, string, string]>(`
            INSERT INTO Link (userID, url, short, status, deleted,
            createdAt, deletedAt, expiresAt)
            VALUES (?,?,?,?,?,?,?,?)
            `)
        const info = stmt.run(link.userID == "" ? null : link.userID, link.url, link.short,
            link.status ? 1 : 0, link.deleted ? 1 : 0, link.createdAt, link.deletedAt, link.expiresAt)
        if (info === undefined) return undefined
        if (info.changes < 1) return undefined
        link.ID = info.lastInsertRowid as number
        return link
    }

    cancelLinkByID(id: number): boolean {
        const stmt = this.database.prepare<[string, number]>(`
            UPDATE Link SET deleted = 1, deletedAt = ? WHERE ID == ?
            `)
        const deletedAt: Link["deletedAt"] = (new Date())
            .toISOString().split('T')[0]
        const info = stmt.run(deletedAt, id)
        if (info === undefined) return false
        if (info.changes < 1) return false
        return true
    }

    deleteLinkByID(id: number): boolean {
        const stmt = this.database.prepare<[number]>(`
            DELETE FROM Link WHERE ID == ?
            `)
        const info = stmt.run(id)
        if (info === undefined) return false
        if (info.changes < 1) return false
        return true
    }

    serveLink(short: string): string | undefined {
        const res = this.database.prepare<[string], LinkParams>(`
        SELECT url FROM Link WHERE short == ?`).get(short)
        if (res === undefined) {
            return undefined
        }
        const { url: url } = res
        return url
    }

    getUsers(): Array<User> {
        const res = this.database.prepare<[], User>(`
        SELECT * FROM User`).all()
        if (res === undefined) {
            return []
        }
        if (res.length === 0) {
            return []
        }
        for (let u of res) {
            u.isAdmin = u.isAdmin == true
            u.deleted = u.deleted == true
            u.guest = u.guest == true
        }
        return res
    }

    getUserByID(id: string): User | undefined {
        const res = this.database.prepare<[string], User>(`
        SELECT * FROM User WHERE ID == ?`).get(id)
        if (res === undefined) {
            return undefined
        }
        res.isAdmin = res.isAdmin == true
        res.deleted = res.deleted == true
        res.guest = res.guest == true
        return res
    }

    getEncryptedPasswordByID(id: string): string | undefined {
        const res = this.database.prepare<[string], UserEncryptedPW>(`
        SELECT encryptedPassword FROM User WHERE ID == ?`).get(id)
        if (res === undefined || res.encryptedPassword === undefined) return undefined
        return res.encryptedPassword
    }

    getUserByEmail(email: string): User | undefined {
        const res = this.database.prepare<[string], User>(`
        SELECT * FROM User WHERE email == ?`).get(email)
        if (res === undefined) {
            return undefined
        }
        res.isAdmin = res.isAdmin == true
        res.deleted = res.deleted == true
        res.guest = res.guest == true
        return res
    }

    getUserByUsername(username: string): User | undefined {
        const res = this.database.prepare<[string], User>(`
        SELECT * FROM User WHERE username == ?`).get(username)
        if (res === undefined) {
            return undefined
        }
        res.isAdmin = res.isAdmin == true
        res.deleted = res.deleted == true
        res.guest = res.guest == true
        return res
    }

    createUser(user: User): User | undefined {
        const stmt = this.database.prepare<
            [string, number, string, string, number,
                string, string, string, number]>(`
            INSERT INTO User (ID, guest, username, email, deleted,
            createdAt, deletedAt, encryptedPassword, isAdmin)
            VALUES (?,?,?,?,?,?,?,?,?)
            `)
        const info = stmt.run(user.ID, user.guest ? 1 : 0, user.username, user.email,
            user.deleted ? 1 : 0, user.createdAt, user.deletedAt, user.encryptedPassword,
            user.isAdmin ? 1 : 0)
        if (info === undefined) return undefined
        if (info.changes < 1) return undefined
        return user
    }

    cancelUserByID(id: string): boolean {
        const stmt = this.database.prepare<[string, string]>(`
            UPDATE User SET deleted = 1, deletedAt = ? WHERE ID == ?
            `)
        const deletedAt: User["deletedAt"] = (new Date())
            .toISOString().split('T')[0]
        const info = stmt.run(deletedAt, id)
        if (info === undefined) return false
        if (info.changes < 1) return false
        return true
    }

    deleteUserByID(id: string): boolean {
        const stmt = this.database.prepare<[string]>(`
            DELETE FROM User WHERE ID == ?
            `)
        const info = stmt.run(id)
        if (info === undefined) return false
        if (info.changes < 1) return false
        return true
    }

    trackServe(short: string): boolean {
        const stmt = this.database.prepare<string>(`
            UPDATE TrackLink SET activity = activity + 1 WHERE short == ?
            `)
        let info = stmt.run(short)
        if (info !== undefined && info.changes > 0) return true

        const stmt2 = this.database.prepare<[string, number]>(`
            INSERT INTO TrackLink (short, activity)
            VALUES (?,?)
            `)
        info = stmt2.run(short, 1)
        if (info === undefined || info.changes < 1) return false
        return true
    }

    getLastLinkID(): number {
        type maxId = {
            "max(ID)": number
        }
        const res = this.database.prepare<[], maxId>(`
        SELECT max(ID) FROM Link`).get()
        if (res === undefined) {
            return -1
        }
        const { "max(ID)": id } = res
        return id
    }

    getLinkByShort(short: string): Link | undefined {
        const res = this.database.prepare<[string], Link>(`
        SELECT * FROM Link WHERE short == ?`).get(short)
        if (res === undefined) {
            return undefined
        }
        res.status = res.status == true
        res.deleted = res.deleted == true
        return res
    }

    teardown() {
        try {
            this.database.exec('DELETE FROM Link; DELETE FROM User;  DELETE FROM TrackLink;')
        } catch (err) {
            console.error('error deleting tables:', err);
            return
        }
        this.database.close()
        if (existsSync(this.location)) {
            try {
                unlinkSync(this.location);
                console.log('database cleaned up.');

            } catch (err) {
                console.error('error deleting db file:', err);
                return
            }
        }
    }

    startCleanExpiredLink() {
        //-------------m h d m dm
        cron.schedule('0 0 * * *', () => {
            const stmt = this.database.prepare(`
                DELETE FROM Links
                WHERE expiresAt < DATE('now');
            `);
            const result = stmt.run();
            console.log('Expired links cleaned up');
            console.log(`cleaned ${result.changes} links`);
        });
    }

    private init() {
        this.database.pragma('foreign_keys = ON')
        this.database.pragma('journal_mode = WAL')
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
            encryptedPassword TEXT NOT NULL
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
