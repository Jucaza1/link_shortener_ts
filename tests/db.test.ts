import { describe, test, expect } from '@jest/globals'
import { SqliteDB } from "../src/db/sqlite"
import * as db from "../src/db/main"
import * as types from "../src/types"
function createUserDB(): db.UserDB {
    return new SqliteDB("test_db.db")
}
function createLinkDB(): db.LinkDB {
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
            encriptedPassword: "testpassword",
            ID: "22250a76-9868-4afc-9abb-c677574dfd32",
            guest: false,
            deleted: false,
            isAdmin: false,
            createdAt: (new Date(Date.now())).toISOString().split("T")[0],
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
            encriptedPassword: "testpassword",
            ID: "22250a76-9868-4afc-9abb-c677574dfd31",
            guest: false,
            deleted: false,
            isAdmin: false,
            createdAt: (new Date(Date.now())).toISOString().split("T")[0],
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
            encriptedPassword: "testpassword",
            ID: "22250a76-9868-4afc-9abb-c677574dfd31",
            guest: false,
            deleted: false,
            isAdmin: false,
            createdAt: (new Date(Date.now())).toISOString().split("T")[0],
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
            encriptedPassword: "testpassword",
            ID: "22250a76-9868-4afc-9abb-c677574dfd31",
            guest: false,
            deleted: false,
            isAdmin: false,
            createdAt: (new Date(Date.now())).toISOString().split("T")[0],
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
            encriptedPassword: "testpassword",
            ID: "22250a76-9868-4afc-9abb-c677574dfd31",
            guest: false,
            deleted: false,
            isAdmin: false,
            createdAt: (new Date(Date.now())).toISOString().split("T")[0],
            deletedAt: ""
        }
        const resUser = db.createUser(user)
        expect(resUser).toBeDefined()
        expect(resUser).toEqual(user)
        const encriptedPassword = db.getEncryptedPasswordByID(user.ID)
        expect(encriptedPassword).toEqual(user.encriptedPassword)
        console.log = () => { }
        db.teardown()
    })
    test('getUsers', () => {
        const db = createUserDB()
        const user1: types.User = {
            username: "testname1",
            email: "test1@mail.com",
            encriptedPassword: "testpassword",
            ID: "00000000-0000-0000-0000-c677574dfd31",
            guest: false,
            deleted: false,
            isAdmin: false,
            createdAt: (new Date(Date.now())).toISOString().split("T")[0],
            deletedAt: ""
        }
        const user2: types.User = {
            username: "testname2",
            email: "test2@mail.com",
            encriptedPassword: "testpassword",
            ID: "00000000-0000-0000-0000-c677574dfd32",
            guest: false,
            deleted: false,
            isAdmin: false,
            createdAt: (new Date(Date.now())).toISOString().split("T")[0],
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
            encriptedPassword: "testpassword",
            ID: "22250a76-9868-4afc-9abb-c677574dfd31",
            guest: false,
            deleted: false,
            isAdmin: false,
            createdAt: (new Date(Date.now())).toISOString().split("T")[0],
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
            encriptedPassword: "testpassword",
            ID: "00000000-0000-0000-0000-c677574dfd31",
            guest: false,
            deleted: false,
            isAdmin: false,
            createdAt: (new Date(Date.now())).toISOString().split("T")[0],
            deletedAt: ""
        }
        const user2: types.User = {
            username: "testname2",
            email: "test2@mail.com",
            encriptedPassword: "testpassword",
            ID: "00000000-0000-0000-0000-c677574dfd32",
            guest: false,
            deleted: false,
            isAdmin: false,
            createdAt: (new Date(Date.now())).toISOString().split("T")[0],
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
