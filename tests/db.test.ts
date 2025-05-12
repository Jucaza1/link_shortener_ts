import { describe, test, expect } from '@jest/globals'
import { SqliteDB } from "../src/db/sqlite"
import * as db from "../src/db/main"
import * as types from "../src/types/entities"
export function createUserDB(): db.UserDB {
    return new SqliteDB("test_db.db")
}
export function createLinkDB(): db.LinkDB {
    return new SqliteDB("test_db.db")
}
describe('Userdb', () => {
    beforeEach(() => {
        const udb = createUserDB()
        udb.teardown()
    })
    afterEach(() => {
        const udb = createUserDB()
        udb.teardown()
    })
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
            createdAt: (new Date()).toISOString().split(".")[0],
            deletedAt: ""
        }
        const resUser = db.createUser(user)
        expect(resUser.ok).toEqual(true)
        expect(resUser.data).toBeDefined()
        expect(resUser.data).toEqual(user)
        // console.log = () => { }
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
            createdAt: (new Date()).toISOString().split(".")[0],
            deletedAt: ""
        }
        const resUser = db.createUser(user)
        expect(resUser.ok).toEqual(true)
        expect(resUser.data).toEqual(user)
        const userGet = db.getUserByID(user.ID)
        expect(userGet.ok).toEqual(true)
        expect(userGet.data).toEqual(user)
        console.log = () => { }
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
            createdAt: (new Date()).toISOString().split(".")[0],
            deletedAt: ""
        }
        const resUser = db.createUser(user)
        expect(resUser.ok).toBeDefined()
        expect(resUser.data).toBeDefined()
        expect(resUser.data).toEqual(user)
        const userGet = db.getUserByUsername(user.username)
        expect(userGet.ok).toEqual(true)
        expect(userGet.data).toEqual(user)
        console.log = () => { }
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
            createdAt: (new Date()).toISOString().split(".")[0],
            deletedAt: ""
        }
        const resUser = db.createUser(user)
        expect(resUser.ok).toEqual(true)
        expect(resUser.data).toBeDefined()
        expect(resUser.data).toEqual(user)
        const userGet = db.getUserByEmail(user.email)
        expect(userGet.ok).toEqual(true)
        expect(userGet.data).toEqual(user)
        console.log = () => { }
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
            createdAt: (new Date()).toISOString().split(".")[0],
            deletedAt: ""
        }
        const resUser = db.createUser(user)
        expect(resUser.ok).toEqual(true)
        expect(resUser.data).toBeDefined()
        expect(resUser.data).toEqual(user)
        const encryptedPassword = db.getEncryptedPasswordByID(user.ID)
        expect(encryptedPassword.data).toEqual(user.encryptedPassword)
        console.log = () => { }
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
            createdAt: (new Date()).toISOString().split(".")[0],
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
            createdAt: (new Date()).toISOString().split(".")[0],
            deletedAt: ""
        }
        const resUser1 = db.createUser(user1)
        expect(resUser1.ok).toEqual(true)
        expect(resUser1.data).toBeDefined()
        expect(resUser1.data).toEqual(user1)
        const resUser2 = db.createUser(user2)
        expect(resUser2.ok).toEqual(true)
        expect(resUser2.data).toBeDefined()
        expect(resUser2.data).toEqual(user2)
        const AlluserGet = db.getUsers()
        expect(AlluserGet.ok).toEqual(true)
        expect(AlluserGet.data).toBeDefined()
        expect(AlluserGet.data).toEqual([user1, user2])
        console.log = () => { }
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
            createdAt: (new Date()).toISOString().split(".")[0],
            deletedAt: ""
        }
        const resUser = db.createUser(user)
        expect(resUser.ok).toEqual(true)
        expect(resUser.data).toBeDefined()
        expect(resUser.data).toEqual(user)
        const success = db.cancelUserByID(user.ID)
        expect(success.ok).toEqual(true)
        expect(success.data).toEqual(true)
        const getUser = db.getUserByID(user.ID)
        expect(getUser.ok).toEqual(true)
        expect(getUser.data?.deleted).toEqual(true)
        console.log = () => { }
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
            createdAt: (new Date()).toISOString().split(".")[0],
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
            createdAt: (new Date()).toISOString().split(".")[0],
            deletedAt: ""
        }
        const resUser1 = db.createUser(user1)
        expect(resUser1.ok).toEqual(true)
        expect(resUser1.data).toBeDefined()
        expect(resUser1.data).toEqual(user1)
        const resUser2 = db.createUser(user2)
        expect(resUser2.ok).toEqual(true)
        expect(resUser2.data).toBeDefined()
        expect(resUser2.data).toEqual(user2)
        let AlluserGet = db.getUsers()
        expect(AlluserGet.ok).toEqual(true)
        expect(AlluserGet.data).toBeDefined()
        expect(AlluserGet.data).toEqual([user1, user2])
        const success = db.deleteUserByID(user1.ID)
        expect(success.ok).toEqual(true)
        expect(success.data).toEqual(true)
        AlluserGet = db.getUsers()
        expect(AlluserGet.ok).toEqual(true)
        expect(AlluserGet.data).toBeDefined()
        expect(AlluserGet.data).toEqual([user2])
        console.log = () => { }
    })
})
describe('Linkdb', () => {
    beforeEach(() => {
        const ldb = createLinkDB()
        const udb = createUserDB()
        ldb.teardown()
        udb.teardown()
    })
    afterEach(() => {
        const ldb = createLinkDB()
        const udb = createUserDB()
        ldb.teardown()
        udb.teardown()
    })
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
            createdAt: (new Date()).toISOString().split(".")[0],
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
            createdAt: (new Date()).toISOString().split(".")[0],
            deletedAt: ""
        }
        const resUser1 = udb.createUser(user1)
        expect(resUser1.ok).toBe(true)
        expect(resUser1.data).toBeDefined()
        expect(resUser1.data).toEqual(user1)
        const resLink = db.createLink(link)
        expect(resLink.ok).toEqual(true)
        expect(resLink.data).toBeDefined()
        expect(resLink.data).toEqual(link)
        console.log = () => { }
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
            createdAt: (new Date()).toISOString().split(".")[0],
            deletedAt: ""
        }, {
            ID: 2,
            deleted: false,
            url: "www.test2.com",
            short: "1234abcd",
            status: true,
            userID: "00000000-0000-0000-0000-c677574dfd31",
            expiresAt: "",
            createdAt: (new Date()).toISOString().split(".")[0],
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
            createdAt: (new Date()).toISOString().split(".")[0],
            deletedAt: ""
        }
        const resUser1 = udb.createUser(user)
        expect(resUser1.ok).toEqual(true)
        expect(resUser1.data).toBeDefined()
        expect(resUser1.data).toEqual(user)
        let resLinks: Array<types.Link | undefined> = []
        resLinks[0] = db.createLink(links[0]).data
        resLinks[1] = db.createLink(links[1]).data
        expect(resLinks[0]).toBeDefined()
        expect(resLinks[1]).toBeDefined();
        links[0].ID = resLinks[0]!.ID
        links[1].ID = resLinks[1]!.ID
        expect(resLinks).toEqual(links)
        const AllLinksGet = db.getLinksByUser(user.ID).data
        expect(AllLinksGet).toBeDefined()
        expect(AllLinksGet![0]).toBeDefined()
        expect(AllLinksGet![1]).toBeDefined()
        expect(AllLinksGet).toEqual(links)
        console.log = () => { }
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
            createdAt: (new Date()).toISOString().split(".")[0],
            deletedAt: ""
        }, {
            ID: 2,
            deleted: false,
            url: "www.test2.com",
            short: "1234abcd",
            status: true,
            userID: "00000000-0000-0000-0000-c677574dfd31",
            expiresAt: "",
            createdAt: (new Date()).toISOString().split(".")[0],
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
            createdAt: (new Date()).toISOString().split(".")[0],
            deletedAt: ""
        }
        const resUser1 = udb.createUser(user)
        expect(resUser1.ok).toEqual(true)
        expect(resUser1.data).toBeDefined()
        expect(resUser1.data).toEqual(user)
        let resLinks: Array<types.Link | undefined> = []
        resLinks[0] = db.createLink(links[0]).data
        resLinks[1] = db.createLink(links[1]).data
        expect(resLinks[0]).toBeDefined()
        expect(resLinks[1]).toBeDefined();
        links[0].ID = resLinks[0]!.ID
        links[1].ID = resLinks[1]!.ID
        expect(resLinks).toEqual(links)
        const resLink = db.getLinkByShort(links[0].short)
        expect(resLink.ok).toEqual(true)
        expect(resLink.data).toBeDefined()
        expect(resLink.data).toEqual(links[0])
        console.log = () => { }
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
            createdAt: (new Date()).toISOString().split(".")[0],
            deletedAt: ""
        }, {
            ID: 0,
            deleted: false,
            url: "www.test2.com",
            short: "1234abcd",
            status: true,
            userID: "00000000-0000-0000-0000-c677574dfd31",
            expiresAt: "",
            createdAt: (new Date()).toISOString().split(".")[0],
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
            createdAt: (new Date()).toISOString().split(".")[0],
            deletedAt: ""
        }
        const resUser1 = udb.createUser(user)
        expect(resUser1.ok).toEqual(true)
        expect(resUser1.data).toBeDefined()
        expect(resUser1.data).toEqual(user)
        let resLinks: Array<types.Link | undefined> = []
        resLinks[0] = db.createLink(links[0]).data
        resLinks[1] = db.createLink(links[1]).data
        expect(resLinks[0]).toBeDefined()
        expect(resLinks[1]).toBeDefined();
        links[0].ID = resLinks[0]!.ID
        links[1].ID = resLinks[1]!.ID
        expect(resLinks).toEqual(links)
        const resLink = db.getLinkByID(links[0].ID)
        expect(resLink.ok).toEqual(true)
        expect(resLink.data).toBeDefined()
        expect(resLink.data).toEqual(links[0])
        console.log = () => { }
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
            createdAt: (new Date()).toISOString().split(".")[0],
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
            createdAt: (new Date()).toISOString().split(".")[0],
            deletedAt: ""
        }
        const resUser1 = udb.createUser(user1)
        expect(resUser1.ok).toEqual(true)
        expect(resUser1.data).toBeDefined()
        expect(resUser1.data).toEqual(user1)
        const resLink = db.createLink(link)
        expect(resLink.data).toBeDefined()
        expect(resLink.data).toEqual(link)
        const url = db.serveLink(link.short)
        expect(url.ok).toEqual(true)
        expect(url.data).toBeDefined()
        expect(url.data).toEqual(link.url)
        console.log = () => { }
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
            createdAt: (new Date()).toISOString().split(".")[0],
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
            createdAt: (new Date()).toISOString().split(".")[0],
            deletedAt: ""
        }
        const resUser1 = udb.createUser(user1)
        expect(resUser1.ok).toEqual(true)
        expect(resUser1.data).toBeDefined()
        expect(resUser1.data).toEqual(user1)
        const resLink = db.createLink(link)
        expect(resLink.ok).toEqual(true)
        link.ID = resLink.data!.ID!
        expect(resLink.data).toEqual(link)
        const id = db.getLastLinkID()
        expect(id.ok).toEqual(true)
        expect(id.data).toBeDefined()
        expect(id.data).toEqual(link.ID)
        console.log = () => { }
    })
    //TODO test fail cases -> same: id, username, email
})
