import * as db from "../db/sqlite"
import * as types from "../types/entities"

//TODO: handle secrets with ENV vars
const dbloc = "./shortener.db"

const sqliteDBreset = new db.SqliteDB(dbloc)
sqliteDBreset.teardown()
const sqliteDB = new db.SqliteDB(dbloc)
const encrypter = new types.PasswordEncrypter("secretforpassword")
export function insertUser(username: string, password: string, isAdmin: boolean) {
    const userParams: types.UserParams = {
        username: username,
        email: `${username}@short.com`,
        password: password,
    }
    const result = types.createUserFromParams(userParams, encrypter, isAdmin)
    if (!result.ok || result.data === undefined) {
        return false
    }
    console.log(sqliteDB.createUser(result.data))
    return true
}
console.log(insertUser("admin", "supersecret", true))
console.log(insertUser("user1", "supersecret", false))
