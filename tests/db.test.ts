import { describe, test, expect } from '@jest/globals'
import { SqliteDB } from "../src/db/sqlite"
import * as types from "../src/types"
function createDB() {
    return new SqliteDB("test_db.db")
}
describe('db', () => {
    const db = createDB()
    db.teardown()
    test('createUser', () => {
        const db = new SqliteDB("test_db.db")
        // const userParams :types.UserParams = {
        //     username: "testname",
        //     email: "test@mail.com",
        //     password: "testpassword"
        // }
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
        db.teardown()
        //TODO test fail cases -> same: id, username, email
    })
    test('getUserByID', () => {
        const db = createDB()
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
        db.teardown()
    })
    test('getUsers', () => {
        const db = createDB()
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
        db.teardown()
    })
})
