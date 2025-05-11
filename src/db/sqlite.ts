import BetterSqlite3 from "better-sqlite3"
import cron from 'node-cron'
import { existsSync, unlinkSync } from "fs"

import { sqlCatchToStoreError } from "../types/db-exception"
import * as db from "./main"
import { Link, LinkParams, User, UserEncryptedPW } from "../types/entities"
import { ResultStore, StoreErrorCode } from "../types/result"

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

    getLinksByUser(UserID: string): ResultStore<Link[]> {
        let res: Link[] | undefined
        try {
            res = this.database.prepare<[string], Link>(`
        SELECT * FROM Link WHERE userID == ?`).all(UserID)
        } catch (e) {
            return { ok: false, err: { code: sqlCatchToStoreError(e), msg: "internal server error" } }

        }
        if (res === undefined) {
            return { ok: false, err: { code: StoreErrorCode.unknown, msg: "internal server error" } }
        }
        if (res.length === 0) {
            return { ok: true, data: [] }
        }
        for (let l of res) {
            l.status = l.status == true
            l.deleted = l.deleted == true
        }
        return { ok: true, data: res }
    }

    getLinkByID(id: number): ResultStore<Link> {
        let res: Link | undefined
        try {
            res = this.database.prepare<[number], Link>(`
        SELECT * FROM Link WHERE ID == ?`).get(id)
        } catch (e) {
            return { ok: false, err: { code: sqlCatchToStoreError(e), msg: "internal server error" } }

        }
        if (res === undefined) {
            return { ok: false, err: { code: StoreErrorCode.notFound, msg: "not found" } }
        }
        res.status = res.status == true
        res.deleted = res.deleted == true
        return { ok: true, data: res }
    }

    createLink(link: Link): ResultStore<Link> {
        const stmt = this.database.prepare<[string | null, string, string, number, number, string, string, string]>(`
            INSERT INTO Link (userID, url, short, status, deleted,
            createdAt, deletedAt, expiresAt)
            VALUES (?,?,?,?,?,?,?,?)
            `)
        let info: BetterSqlite3.RunResult | undefined
        try {
            info = stmt.run(link.userID == "" ? null : link.userID, link.url, link.short,
                link.status ? 1 : 0, link.deleted ? 1 : 0, link.createdAt, link.deletedAt, link.expiresAt)
        } catch (e) {
            return { ok: false, err: { code: sqlCatchToStoreError(e), msg: "internal server error" } }
        }
        if (info === undefined) return { ok: false, err: { code: StoreErrorCode.unknown, msg: "internal server error" } }
        if (info.changes < 1) return { ok: false, err: { code: StoreErrorCode.unknown, msg: "internal server error" } }
        link.ID = info.lastInsertRowid as number
        return { ok: true, data: link }
    }

    cancelLinkByID(id: number): ResultStore<boolean> {
        const stmt = this.database.prepare<[string, number]>(`
            UPDATE Link SET deleted = 1, deletedAt = ? WHERE ID == ?
            `)
        const deletedAt: Link["deletedAt"] = (new Date())
            .toISOString().split('T')[0]
        let info: BetterSqlite3.RunResult | undefined
        try {
            info = stmt.run(deletedAt, id)
        } catch (e) {
            return { ok: false, err: { code: sqlCatchToStoreError(e), msg: "internal server error" } }
        }
        if (info === undefined) return { ok: false, err: { code: StoreErrorCode.unknown, msg: "internal server error" } }
        if (info.changes < 1) return { ok: false, err: { code: StoreErrorCode.notFound, msg: "not found" } }
        return { ok: true, data: true }
    }

    deleteLinkByID(id: number): ResultStore<boolean> {
        const stmt = this.database.prepare<[number]>(`
            DELETE FROM Link WHERE ID == ?
            `)
        let info: BetterSqlite3.RunResult | undefined
        try {
            info = stmt.run(id)
        } catch (e) {
            return { ok: false, err: { code: sqlCatchToStoreError(e), msg: "internal server error" } }
        }
        if (info === undefined) return { ok: false, err: { code: StoreErrorCode.unknown, msg: "internal server error" } }
        if (info.changes < 1) return { ok: false, err: { code: StoreErrorCode.notFound, msg: "not found" } }
        return { ok: true, data: true }
    }

    serveLink(short: string): ResultStore<string> {
        let res: LinkParams | undefined
        try {
            res = this.database.prepare<[string], LinkParams>(`
        SELECT url FROM Link WHERE short == ?`).get(short)
        } catch (e) {
            return { ok: false, err: { code: sqlCatchToStoreError(e), msg: "internal server error" } }
        }
        if (res === undefined) {
            return { ok: false, err: { code: StoreErrorCode.notFound, msg: "not found" } }
        }
        const { url: url } = res
        return { ok: true, data: url }
    }

    getUsers(): ResultStore<User[]> {
        let res: User[] | undefined
        try {
            res = this.database.prepare<[], User>(` SELECT * FROM User`).all()
        } catch (e) {
            return { ok: false, err: { code: sqlCatchToStoreError(e), msg: "internal server error" } }
        }
        if (res === undefined) {
            return { ok: false, err: { code: StoreErrorCode.unknown, msg: "internal server error" } }
        }
        if (res.length === 0) {
            return { ok: true, data: [] }
        }
        for (let u of res) {
            u.isAdmin = u.isAdmin == true
            u.deleted = u.deleted == true
            u.guest = u.guest == true
        }
        return { ok: true, data: res }
    }

    getUserByID(id: string): ResultStore<User> {
        let res: User | undefined
        try {
            res = this.database.prepare<[string], User>(`
            SELECT * FROM User WHERE ID == ?`).get(id)
        } catch (e) {
            return { ok: false, err: { code: sqlCatchToStoreError(e), msg: "internal server error" } }
        }
        if (res === undefined) {
            return { ok: false, err: { code: StoreErrorCode.notFound, msg: "not found" } }
        }
        res.isAdmin = res.isAdmin == true
        res.deleted = res.deleted == true
        res.guest = res.guest == true
        return { ok: true, data: res }
    }

    getEncryptedPasswordByID(id: string): ResultStore<string> {
        let res: UserEncryptedPW | undefined
        try {
            res = this.database.prepare<[string], UserEncryptedPW>(`
            SELECT encryptedPassword FROM User WHERE ID == ?`).get(id)
        } catch (e) {
            return { ok: false, err: { code: sqlCatchToStoreError(e), msg: "internal server error" } }
        }
        if (res === undefined) {
            return { ok: false, err: { code: StoreErrorCode.notFound, msg: "not found" } }
        }
        return { ok: true, data: res.encryptedPassword }
    }

    getUserByEmail(email: string): ResultStore<User> {
        let res: User | undefined
        try {
            res = this.database.prepare<[string], User>(`
            SELECT * FROM User WHERE email == ?`).get(email)
        } catch (e) {
            return { ok: false, err: { code: sqlCatchToStoreError(e), msg: "internal server error" } }
        }
        if (res === undefined) {
            return { ok: false, err: { code: StoreErrorCode.notFound, msg: "not found" } }
        }
        res.isAdmin = res.isAdmin == true
        res.deleted = res.deleted == true
        res.guest = res.guest == true
        return { ok: true, data: res }
    }

    getUserByUsername(username: string): ResultStore<User> {
        let res: User | undefined
        try {
            res = this.database.prepare<[string], User>(`
        SELECT * FROM User WHERE username == ?`).get(username)
        } catch (e) {
            return { ok: false, err: { code: sqlCatchToStoreError(e), msg: "internal server error" } }
        }
        if (res === undefined) {
            return { ok: false, err: { code: StoreErrorCode.notFound, msg: "not found" } }
        }
        res.isAdmin = res.isAdmin == true
        res.deleted = res.deleted == true
        res.guest = res.guest == true
        return { ok: true, data: res }
    }

    createUser(user: User): ResultStore<User> {
        const stmt = this.database.prepare<
            [string, number, string, string, number,
                string, string, string, number]>(`
            INSERT INTO User (ID, guest, username, email, deleted,
            createdAt, deletedAt, encryptedPassword, isAdmin)
            VALUES (?,?,?,?,?,?,?,?,?)
            `)
        let info: BetterSqlite3.RunResult | undefined
        try {
            info = stmt.run(user.ID, user.guest ? 1 : 0, user.username, user.email,
                user.deleted ? 1 : 0, user.createdAt, user.deletedAt, user.encryptedPassword,
                user.isAdmin ? 1 : 0)
        } catch (e) {
            return { ok: false, err: { code: sqlCatchToStoreError(e), msg: "internal server error" } }
        }
        if (info === undefined || info.changes < 1) return { ok: false, err: { code: StoreErrorCode.unknown, msg: "internal server error" } }
        return { ok: true, data: user }
    }

    cancelUserByID(id: string): ResultStore<boolean> {
        const stmt = this.database.prepare<[string, string]>(`
            UPDATE User SET deleted = 1, deletedAt = ? WHERE ID == ?
            `)
        const deletedAt: User["deletedAt"] = (new Date())
            .toISOString().split('T')[0]
        let info: BetterSqlite3.RunResult | undefined
        try {
            info = stmt.run(deletedAt, id)
        } catch (e) {
            return { ok: false, err: { code: sqlCatchToStoreError(e), msg: "internal server error" } }
        }
        if (info === undefined || info.changes < 1) return { ok: false, err: { code: StoreErrorCode.unknown, msg: "internal server error" } }
        return { ok: true, data: true }
    }

    deleteUserByID(id: string): ResultStore<boolean> {
        const stmt = this.database.prepare<[string]>(`
            DELETE FROM User WHERE ID == ?
            `)
        let info: BetterSqlite3.RunResult | undefined
        try {
            info = stmt.run(id)
        } catch (e) {
            return { ok: false, err: { code: sqlCatchToStoreError(e), msg: "internal server error" } }
        }
        if (info === undefined || info.changes < 1) return { ok: false, err: { code: StoreErrorCode.unknown, msg: "internal server error" } }
        return { ok: true, data: true }
    }

    trackServe(short: string): ResultStore<boolean> {
        const stmt = this.database.prepare<string>(`
            UPDATE TrackLink SET activity = activity + 1 WHERE short == ?
            `)
        let info: BetterSqlite3.RunResult | undefined
        try {
            info = stmt.run(short)
        } catch (e) {
            return { ok: false, err: { code: sqlCatchToStoreError(e), msg: "internal server error" } }
        }
        if (info !== undefined && info.changes > 0) return { ok: true, data: true }
        const stmt2 = this.database.prepare<[string, number]>(`
            INSERT INTO TrackLink (short, activity)
            VALUES (?,?)
            `)
        try {
            info = stmt2.run(short, 1)
        } catch (e) {
            return { ok: false, err: { code: sqlCatchToStoreError(e), msg: "internal server error" } }
        }
        if (info === undefined || info.changes < 1) return { ok: false, err: { code: StoreErrorCode.unknown, msg: "internal server error" } }
        return { ok: true, data: true }
    }

    getLastLinkID(): ResultStore<number> {
        type maxId = {
            "max(ID)": number
        }
        let res: maxId | undefined
        try {
            res = this.database.prepare<[], maxId>(`
            SELECT max(ID) FROM Link`).get()
        } catch (e) {
            return { ok: false, err: { code: sqlCatchToStoreError(e), msg: "internal server error" } }
        }
        if (res === undefined) {
            return { ok: false, err: { code: StoreErrorCode.unknown, msg: "internal server error" } }
        }
        const { "max(ID)": id } = res
        return { ok: true, data: id }
    }

    getLinkByShort(short: string): ResultStore<Link> {
        let res: Link | undefined
        try {
            res = this.database.prepare<[string], Link>(`
            SELECT * FROM Link WHERE short == ?`).get(short)
        } catch (e) {
            return { ok: false, err: { code: sqlCatchToStoreError(e), msg: "internal server error" } }
        }
        if (res === undefined) {
            return { ok: false, err: { code: StoreErrorCode.notFound, msg: "not found" } }
        }
        res.status = res.status == true
        res.deleted = res.deleted == true
        return { ok: true, data: res }
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
