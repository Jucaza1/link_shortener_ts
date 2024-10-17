import { describe, test, expect } from '@jest/globals'
import { SqliteDB } from "../src/db/sqlite.js"
import * as db from "../src/db/main.js"
import * as types from "../src/types.js"
export function createUserDB(): db.UserDB {
    return new SqliteDB("test_db.db")
}
export function createLinkDB(): db.LinkDB {
    return new SqliteDB("test_db.db")
}
describe('Userdb', () => {
    const db = createUserDB()
    db.teardown()
    test('createUser', () => {
        const db = createUserDB()
        const user: types.User = {
            username: "testname",
            email: "test@mail.com",
            encryptedPassword: "testpassword",
            ID: "22250a76-9868-4afc-9abb-c677574dfd32",
            guest: false,
            deleted: false,
            isAdmin: false,
            createdAt: (new Date()).toISOString().split("T")[0],
            deletedAt: ""
        }
        const resUser = db.createUser(user)
        expect(resUser).toBeDefined()
        expect(resUser).toEqual(user)
        console.log = () => { }
        db.teardown()
        //TODO test fail cases -> same: id, username, email
    })
    test('getUserByID', () => {
        const db = createUserDB()
        const user: types.User = {
            username: "testname",
            email: "test@mail.com",
            encryptedPassword: "testpassword",
            ID: "22250a76-9868-4afc-9abb-c677574dfd31",
            guest: false,
            deleted: false,
            isAdmin: false,
            createdAt: (new Date()).toISOString().split("T")[0],
            deletedAt: ""
        }
        const resUser = db.createUser(user)
        expect(resUser).toBeDefined()
        expect(resUser).toEqual(user)
        const userGet = db.getUserByID(user.ID)
        expect(userGet).toEqual(user)
        console.log = () => { }
        db.teardown()
    })
    test('getUserByUsername', () => {
        const db = createUserDB()
        const user: types.User = {
            username: "testname",
            email: "test@mail.com",
            encryptedPassword: "testpassword",
            ID: "22250a76-9868-4afc-9abb-c677574dfd31",
            guest: false,
            deleted: false,
            isAdmin: false,
            createdAt: (new Date()).toISOString().split("T")[0],
            deletedAt: ""
        }
        const resUser = db.createUser(user)
        expect(resUser).toBeDefined()
        expect(resUser).toEqual(user)
        const userGet = db.getUserByUsername(user.username)
        expect(userGet).toEqual(user)
        console.log = () => { }
        db.teardown()
    })
    test('getUserByEmail', () => {
        const db = createUserDB()
        const user: types.User = {
            username: "testname",
            email: "test@mail.com",
            encryptedPassword: "testpassword",
            ID: "22250a76-9868-4afc-9abb-c677574dfd31",
            guest: false,
            deleted: false,
            isAdmin: false,
            createdAt: (new Date()).toISOString().split("T")[0],
            deletedAt: ""
        }
        const resUser = db.createUser(user)
        expect(resUser).toBeDefined()
        expect(resUser).toEqual(user)
        const userGet = db.getUserByEmail(user.email)
        expect(userGet).toEqual(user)
        console.log = () => { }
        db.teardown()
    })
    test('getEncryptedPasswordByID', () => {
        const db = createUserDB()
        const user: types.User = {
            username: "testname",
            email: "test@mail.com",
            encryptedPassword: "testpassword",
            ID: "22250a76-9868-4afc-9abb-c677574dfd31",
            guest: false,
            deleted: false,
            isAdmin: false,
            createdAt: (new Date()).toISOString().split("T")[0],
            deletedAt: ""
        }
        const resUser = db.createUser(user)
        expect(resUser).toBeDefined()
        expect(resUser).toEqual(user)
        const encryptedPassword = db.getEncryptedPasswordByID(user.ID)
        expect(encryptedPassword).toEqual(user.encryptedPassword)
        console.log = () => { }
        db.teardown()
    })
    test('getUsers', () => {
        const db = createUserDB()
        const user1: types.User = {
            username: "testname1",
            email: "test1@mail.com",
            encryptedPassword: "testpassword",
            ID: "00000000-0000-0000-0000-c677574dfd31",
            guest: false,
            deleted: false,
            isAdmin: false,
            createdAt: (new Date()).toISOString().split("T")[0],
            deletedAt: ""
        }
        const user2: types.User = {
            username: "testname2",
            email: "test2@mail.com",
            encryptedPassword: "testpassword",
            ID: "00000000-0000-0000-0000-c677574dfd32",
            guest: false,
            deleted: false,
            isAdmin: false,
            createdAt: (new Date()).toISOString().split("T")[0],
            deletedAt: ""
        }
        const resUser1 = db.createUser(user1)
        expect(resUser1).toBeDefined()
        expect(resUser1).toEqual(user1)
        const resUser2 = db.createUser(user2)
        expect(resUser2).toBeDefined()
        expect(resUser2).toEqual(user2)
        const AlluserGet = db.getUsers()
        expect(AlluserGet).toEqual([user1, user2])
        console.log = () => { }
        db.teardown()
    })
    test('cancelUserByID', () => {
        const db = createUserDB()
        const user: types.User = {
            username: "testname",
            email: "test@mail.com",
            encryptedPassword: "testpassword",
            ID: "22250a76-9868-4afc-9abb-c677574dfd31",
            guest: false,
            deleted: false,
            isAdmin: false,
            createdAt: (new Date()).toISOString().split("T")[0],
            deletedAt: ""
        }
        const resUser = db.createUser(user)
        expect(resUser).toBeDefined()
        expect(resUser).toEqual(user)
        const success = db.cancelUserByID(user.ID)
        expect(success).toEqual(true)
        const getUser = db.getUserByID(user.ID)
        expect(getUser).toBeDefined()
        expect(getUser?.deleted).toEqual(true)
        console.log = () => { }
        db.teardown()
    })
    test('deleteUserByID', () => {
        const db = createUserDB()
        const user1: types.User = {
            username: "testname1",
            email: "test1@mail.com",
            encryptedPassword: "testpassword",
            ID: "00000000-0000-0000-0000-c677574dfd31",
            guest: false,
            deleted: false,
            isAdmin: false,
            createdAt: (new Date()).toISOString().split("T")[0],
            deletedAt: ""
        }
        const user2: types.User = {
            username: "testname2",
            email: "test2@mail.com",
            encryptedPassword: "testpassword",
            ID: "00000000-0000-0000-0000-c677574dfd32",
            guest: false,
            deleted: false,
            isAdmin: false,
            createdAt: (new Date()).toISOString().split("T")[0],
            deletedAt: ""
        }
        const resUser1 = db.createUser(user1)
        expect(resUser1).toBeDefined()
        expect(resUser1).toEqual(user1)
        const resUser2 = db.createUser(user2)
        expect(resUser2).toBeDefined()
        expect(resUser2).toEqual(user2)
        let AlluserGet = db.getUsers()
        expect(AlluserGet).toEqual([user1, user2])
        const success = db.deleteUserByID(user1.ID)
        expect(success).toEqual(true)
        AlluserGet = db.getUsers()
        expect(AlluserGet).toEqual([user2])
        console.log = () => { }
        db.teardown()
    })
})
describe('Linkdb', () => {
    const db = createLinkDB()
    db.teardown()
    test('createLink', () => {
        const db = createLinkDB()
        const link: types.Link = {
            ID: 0,
            deleted: false,
            url: "www.test.com",
            short: "1234abcd",
            status: true,
            userID: "00000000-0000-0000-0000-c677574dfd31",
            expiresAt: "",
            createdAt: (new Date()).toISOString().split("T")[0],
            deletedAt: ""
        }
        const udb = createUserDB()
        const user1: types.User = {
            username: "testname1",
            email: "test1@mail.com",
            encryptedPassword: "testpassword",
            ID: "00000000-0000-0000-0000-c677574dfd31",
            guest: false,
            deleted: false,
            isAdmin: false,
            createdAt: (new Date()).toISOString().split("T")[0],
            deletedAt: ""
        }
        const resUser1 = udb.createUser(user1)
        expect(resUser1).toBeDefined()
        expect(resUser1).toEqual(user1)
        const resLink = db.createLink(link)
        expect(resLink).toBeDefined()
        expect(resLink).toEqual(link)
        console.log = () => { }
        db.teardown()
        udb.teardown()
    })
    test('getLinksByUser', () => {
        const db = createLinkDB()
        const links: types.Link[] = [{
            ID: 1,
            deleted: false,
            url: "www.test.com",
            short: "1234abcd",
            status: true,
            userID: "00000000-0000-0000-0000-c677574dfd31",
            expiresAt: "",
            createdAt: (new Date()).toISOString().split("T")[0],
            deletedAt: ""
        }, {
            ID: 2,
            deleted: false,
            url: "www.test2.com",
            short: "1234abcd",
            status: true,
            userID: "00000000-0000-0000-0000-c677574dfd31",
            expiresAt: "",
            createdAt: (new Date()).toISOString().split("T")[0],
            deletedAt: ""
        },]
        const udb = createUserDB()
        const user: types.User = {
            username: "testname1",
            email: "test1@mail.com",
            encryptedPassword: "testpassword",
            ID: "00000000-0000-0000-0000-c677574dfd31",
            guest: false,
            deleted: false,
            isAdmin: false,
            createdAt: (new Date()).toISOString().split("T")[0],
            deletedAt: ""
        }
        const resUser1 = udb.createUser(user)
        expect(resUser1).toBeDefined()
        expect(resUser1).toEqual(user)
        let resLinks: Array<types.Link | undefined> = []
        resLinks[0] = db.createLink(links[0])
        resLinks[1] = db.createLink(links[1])
        expect(resLinks[0]).toBeDefined()
        expect(resLinks[1]).toBeDefined();
        links[0].ID = ((resLinks[0] as types.Link).ID) as number
        links[1].ID = ((resLinks[1] as types.Link).ID) as number
        expect(resLinks).toEqual(links)
        const AllLinksGet = db.getLinksByUser(user.ID)
        expect(AllLinksGet[0]).toBeDefined()
        expect(AllLinksGet[1]).toBeDefined()
        expect(AllLinksGet).toEqual(links)
        console.log = () => { }
        db.teardown()
        udb.teardown()
    })
    test('getLinkByShort', () => {
        const db = createLinkDB()
        const links: types.Link[] = [{
            ID: 1,
            deleted: false,
            url: "www.test.com",
            short: "1234abcd2",
            status: true,
            userID: "00000000-0000-0000-0000-c677574dfd31",
            expiresAt: "",
            createdAt: (new Date()).toISOString().split("T")[0],
            deletedAt: ""
        }, {
            ID: 2,
            deleted: false,
            url: "www.test2.com",
            short: "1234abcd",
            status: true,
            userID: "00000000-0000-0000-0000-c677574dfd31",
            expiresAt: "",
            createdAt: (new Date()).toISOString().split("T")[0],
            deletedAt: ""
        },]
        const udb = createUserDB()
        const user: types.User = {
            username: "testname1",
            email: "test1@mail.com",
            encryptedPassword: "testpassword",
            ID: "00000000-0000-0000-0000-c677574dfd31",
            guest: false,
            deleted: false,
            isAdmin: false,
            createdAt: (new Date()).toISOString().split("T")[0],
            deletedAt: ""
        }
        const resUser1 = udb.createUser(user)
        expect(resUser1).toBeDefined()
        expect(resUser1).toEqual(user)
        let resLinks: Array<types.Link | undefined> = []
        resLinks[0] = db.createLink(links[0])
        resLinks[1] = db.createLink(links[1])
        expect(resLinks[0]).toBeDefined()
        expect(resLinks[1]).toBeDefined();
        links[0].ID = ((resLinks[0] as types.Link).ID) as number
        links[1].ID = ((resLinks[1] as types.Link).ID) as number
        expect(resLinks).toEqual(links)
        const resLink = db.getLinkByShort(links[0].short)
        expect(resLink).toBeDefined()
        console.log(new Object(resLink).toString)
        expect(resLink).toEqual(links[0])
        console.log = () => { }
        db.teardown()
        udb.teardown()
    })
    test('getlinkByID', () => {
        const db = createLinkDB()
        const links: types.Link[] = [{
            ID: 0,
            deleted: false,
            url: "www.test.com",
            short: "1234abcd2",
            status: true,
            userID: "00000000-0000-0000-0000-c677574dfd31",
            expiresAt: "",
            createdAt: (new Date()).toISOString().split("T")[0],
            deletedAt: ""
        }, {
            ID: 0,
            deleted: false,
            url: "www.test2.com",
            short: "1234abcd",
            status: true,
            userID: "00000000-0000-0000-0000-c677574dfd31",
            expiresAt: "",
            createdAt: (new Date()).toISOString().split("T")[0],
            deletedAt: ""
        },]
        const udb = createUserDB()
        const user: types.User = {
            username: "testname1",
            email: "test1@mail.com",
            encryptedPassword: "testpassword",
            ID: "00000000-0000-0000-0000-c677574dfd31",
            guest: false,
            deleted: false,
            isAdmin: false,
            createdAt: (new Date()).toISOString().split("T")[0],
            deletedAt: ""
        }
        const resUser1 = udb.createUser(user)
        expect(resUser1).toBeDefined()
        expect(resUser1).toEqual(user)
        let resLinks: Array<types.Link | undefined> = []
        resLinks[0] = db.createLink(links[0])
        resLinks[1] = db.createLink(links[1])
        expect(resLinks[0]).toBeDefined()
        expect(resLinks[1]).toBeDefined();
        links[0].ID = ((resLinks[0] as types.Link).ID) as number
        links[1].ID = ((resLinks[1] as types.Link).ID) as number
        expect(resLinks).toEqual(links)
        const resLink = db.getLinkByID(links[0].ID)
        expect(resLink).toBeDefined()
        console.log(new Object(resLink).toString)
        expect(resLink).toEqual(links[0])
        console.log = () => { }
        db.teardown()
        udb.teardown()
    })
    test('serveLink', () => {
        const db = createLinkDB()
        const link: types.Link = {
            ID: 0,
            deleted: false,
            url: "www.test.com",
            short: "1234abcd",
            status: true,
            userID: "00000000-0000-0000-0000-c677574dfd31",
            expiresAt: "",
            createdAt: (new Date()).toISOString().split("T")[0],
            deletedAt: ""
        }
        const udb = createUserDB()
        const user1: types.User = {
            username: "testname1",
            email: "test1@mail.com",
            encryptedPassword: "testpassword",
            ID: "00000000-0000-0000-0000-c677574dfd31",
            guest: false,
            deleted: false,
            isAdmin: false,
            createdAt: (new Date()).toISOString().split("T")[0],
            deletedAt: ""
        }
        const resUser1 = udb.createUser(user1)
        expect(resUser1).toBeDefined()
        expect(resUser1).toEqual(user1)
        const resLink = db.createLink(link)
        expect(resLink).toBeDefined()
        expect(resLink).toEqual(link)
        const url = db.serveLink(link.short)
        expect(url).toBeDefined()
        expect(url).toEqual(link.url)
        console.log = () => { }
        db.teardown()
        udb.teardown()
    })
    test('getLastLinkID', () => {
        const db = createLinkDB()
        const link: types.Link = {
            ID: 0,
            deleted: false,
            url: "www.test.com",
            short: "1234abcd",
            status: true,
            userID: "00000000-0000-0000-0000-c677574dfd31",
            expiresAt: "",
            createdAt: (new Date()).toISOString().split("T")[0],
            deletedAt: ""
        }
        const udb = createUserDB()
        const user1: types.User = {
            username: "testname1",
            email: "test1@mail.com",
            encryptedPassword: "testpassword",
            ID: "00000000-0000-0000-0000-c677574dfd31",
            guest: false,
            deleted: false,
            isAdmin: false,
            createdAt: (new Date()).toISOString().split("T")[0],
            deletedAt: ""
        }
        const resUser1 = udb.createUser(user1)
        expect(resUser1).toBeDefined()
        expect(resUser1).toEqual(user1)
        const resLink = db.createLink(link)
        expect(resLink).toBeDefined()
        link.ID = (resLink as types.Link).ID
        expect(resLink).toEqual(link)
        const id = db.getLastLinkID()
        expect(id).toBeDefined()
        expect(id).toEqual(link.ID)
        console.log = () => { }
        db.teardown()
        udb.teardown()
    })
    //TODO test fail cases -> same: id, username, email
})
