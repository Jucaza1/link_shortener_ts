import { describe, it, expect } from "@jest/globals"
import supertest from "supertest"
import express, { json } from "express"
import { UserParams } from "../src/types/entities"
import { AuthHandler } from "../src/handlers/middlewares"
import { JWT_Auther } from "../src/auth"
import { ServiceImpl } from "../src/services"
import { PasswordEncrypter } from "../src/types/entities"
import { createUserDB, createLinkDB } from "./db.test"
import * as db from "../src/db/main"
import { Hasher } from "../src/hash"

export function createAuthHandler(udb: db.UserDB, ldb: db.LinkDB): AuthHandler {
    const encrypter = new PasswordEncrypter('pwdsecret')
    return new AuthHandler(
        new JWT_Auther("jwtsecret"),
        new ServiceImpl(udb, ldb, new Hasher(), encrypter),
        encrypter
    )
}
export function insertUserParms(user: UserParams, udb: db.UserDB, ldb: db.LinkDB): boolean {
    const controller = new ServiceImpl(
        udb,
        ldb,
        new Hasher(),
        new PasswordEncrypter('pwdsecret')
    )
    return controller.createUser(user).ok
}
describe('handlers', () => {
    it('login', async () => {
        const udb = createUserDB()
        const ldb = createLinkDB()
        const AuthHandler = createAuthHandler(udb, ldb)
        const app = express()
        app.post("/login", json(), AuthHandler.authenticate)
        const user: UserParams = {
            username: "testname",
            email: "test@mail.com",
            password: "testpassword",
        }
        const success = insertUserParms(user, udb, ldb)
        expect(success).toEqual(true)
        const res = await supertest(app)
            .post("/login")
            .send({
                username: user.username,
                password: user.password
            }).set("Content-Type", "application/json")
        expect(res.status).toEqual(204)
        expect(res.header["x-authorization"]).toBeDefined()
        console.log = () => { }
        udb.teardown()

    })
})
