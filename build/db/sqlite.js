import BetterSqlite3 from "better-sqlite3";
export class SqliteDB {
    constructor(location) {
        this.location = location;
        if (location[location.length - 1] === "/") {
            this.location = this.location + "database.db";
        }
        if (this.location.slice(-3) !== ".db") {
            this.location = this.location + ".db";
        }
        this.database = new BetterSqlite3(this.location);
        this.init = this.init.bind(this);
        this.backup = this.init.bind(this);
        this.trackServe = this.trackServe.bind(this);
        this.deleteUserByID = this.deleteUserByID.bind(this);
        this.cancelUserByID = this.cancelUserByID.bind(this);
        this.createUser = this.createUser.bind(this);
        this.getUserByUsername = this.getUserByUsername.bind(this);
        this.getUserByEmail = this.getUserByEmail.bind(this);
        this.getUserByID = this.getUserByID.bind(this);
        this.serveLink = this.serveLink.bind(this);
        this.deleteLink = this.deleteLink.bind(this);
        this.cancelLink = this.cancelLink.bind(this);
        this.createLink = this.createLink.bind(this);
        this.getLinkbyID = this.getLinkbyID.bind(this);
        this.getLinksByUser = this.getLinksByUser.bind(this);
        this.init();
    }
    getLinksByUser(UserID) {
        let result = [];
        let res = this.database.prepare(`
        SELECT * FROM Link WHERE userID == ?`).all(UserID);
        if (res !== undefined) {
            result = { ...result, ...res };
        }
        return result;
    }
    getLinkbyID(id) {
        let res = this.database.prepare(`
        SELECT * FROM Link WHERE ID == ?`).get(id);
        return res;
    }
    createLink(link) {
        const stmt = this.database.prepare(`
            INSERT INTO Link (userID, ID, url, short, status, deleted,
            createdAt, deletedAt, expiresAt)
            VALUES (?,?,?,?,?,?,?,?,?)
            `);
        const info = stmt.run(link.userID, link.ID, link.url, link.short, link.status, link.deleted, link.createdAt, link.deletedAt, link.expiresAt);
        if (info === undefined)
            return undefined;
        if (info.changes < 1)
            return undefined;
        return link;
    }
    cancelLink(id) {
        const stmt = this.database.prepare(`
            UPDATE TABLE Link SET deleted = 1, deletedAt = ? WHERE ID == ?
            `);
        const deletedAt = (new Date(Date.now()))
            .toISOString().split('T')[0];
        const info = stmt.run(deletedAt, id);
        if (info === undefined)
            return false;
        if (info.changes < 1)
            return false;
        return true;
    }
    deleteLink(id) {
        const stmt = this.database.prepare(`
            DELETE FROM Link WHERE ID == ?
            `);
        const info = stmt.run(id);
        if (info === undefined)
            return false;
        if (info.changes < 1)
            return false;
        return true;
    }
    serveLink(short) {
        let res = this.database.prepare(`
        SELECT url FROM Link WHERE short == ?`).get(short);
        return res;
    }
    getUserByID(id) {
        let res = this.database.prepare(`
        SELECT * FROM User WHERE ID == ?`).get(id);
        return res;
    }
    getUserByEmail(email) {
        let res = this.database.prepare(`
        SELECT * FROM User WHERE email == ?`).get(email);
        return res;
    }
    getUserByUsername(username) {
        let res = this.database.prepare(`
        SELECT * FROM User WHERE username == ?`).get(username);
        return res;
    }
    createUser(user) {
        const stmt = this.database.prepare(`
            INSERT INTO User (ID, guest, username, email, deleted,
            createdAt, deletedAt, encriptedPassword)
            VALUES (?,?,?,?,?,?,?,?)
            `);
        const info = stmt.run(user.ID, user.guest, user.username, user.email, user.deleted, user.createdAt, user.deletedAt, user.encriptedPassword);
        if (info === undefined)
            return undefined;
        if (info.changes < 1)
            return undefined;
        return user;
    }
    cancelUserByID(id) {
        const stmt = this.database.prepare(`
            UPDATE TABLE User SET deleted = 1, deletedAt = ? WHERE ID == ?
            `);
        const deletedAt = (new Date(Date.now()))
            .toISOString().split('T')[0];
        const info = stmt.run(deletedAt, id);
        if (info === undefined)
            return false;
        if (info.changes < 1)
            return false;
        return true;
    }
    deleteUserByID(id) {
        const stmt = this.database.prepare(`
            DELETE FROM User WHERE ID == ?
            `);
        const info = stmt.run(id);
        if (info === undefined)
            return false;
        if (info.changes < 1)
            return false;
        return true;
    }
    trackServe(short) {
        let stmt = this.database.prepare(`
            UPDATE TABLE TrackLink SET activity = activity + 1 WHERE short == ?
            `);
        let info = stmt.run(short);
        if (info !== undefined && info.changes > 0)
            return true;
        stmt = this.database.prepare(`
            INSERT INTO TrackLink (short, activity)
            VALUES (?,?)
            `);
        info = stmt.run(short, 1);
        if (info === undefined || info.changes < 1)
            return false;
        return true;
    }
    init() {
        this.database.pragma('journal_mode = WAL');
        this.database.exec(`
            CREATE TABLE IF NOT EXISTS User (
            ID UUID PRIMARY KEY ,
            guest BOOLEAN DEFAULT 0,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            deleted BOOLEAN DEFAULT 0,
            createdAt TEXT NOT NULL,
            deletedAt TEXT NOT NULL,
            encriptedPassword TEXT NOT NULL
            )
        `);
        this.database.exec(`
            CREATE TABLE IF NOT EXISTS Link (
            ID UUID PRIMARY KEY ,
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
        `);
        this.database.exec(`
            CREATE TABLE IF NOT EXISTS TrackLink (
            short TEXT PRIMARY KEY,
            activity INT DEFAULT 0
            )
        `);
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
//# sourceMappingURL=sqlite.js.map