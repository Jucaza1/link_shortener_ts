import * as db from "../db/sqlite"
import * as types from "../types"

//TODO: handle secrets with ENV vars
const dbloc = "./shortener.db"

const sqliteDBreset = new db.SqliteDB(dbloc)
sqliteDBreset.teardown()
const sqliteDB = new db.SqliteDB(dbloc)
const encrypter = new types.PasswordEncrypter("secretforpassword")
function insertUser(username: string, password: string, isAdmin: boolean) {
    const userParams: types.UserParams = {
        username: username,
        email: `${username}@short.com`,
        password: password,
    }
    const operation = types.createUserFromParams(userParams, encrypter, isAdmin)
    if (!operation.success || operation.data === undefined) {
        return false
    }
    console.log(sqliteDB.createUser(operation.data))
    return true
}
console.log(insertUser("admin", "supersecret", true))
console.log(insertUser("user1", "supersecret", false))
