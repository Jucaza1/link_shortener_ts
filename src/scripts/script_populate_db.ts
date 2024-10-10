import * as db from "../db/sqlite.js"
import * as types from "../types.js"

//TODO: handle secrets with ENV vars
const dbloc = "./shortener.db"

const sqliteDB = new db.SqliteDB(dbloc)
const encrypter = new types.PasswordEncrypter("secretforpassword")
function insertUser(username: string, password: string, isAdmin: boolean){
    const userParams: types.UserParams={
        username: username,
        email: "${username}@short.com",
        password: password,
    }
    const operation = types.createUserFromParams(userParams,encrypter,isAdmin)
    if (!operation.success || operation.data === undefined){
        return false
    }
    if (undefined===sqliteDB.createUser(operation.data)){
        return false
    }
    return true

}
insertUser("admin","supersecret",true)
insertUser("user1","supersecret",false)
