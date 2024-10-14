import { describe, test, expect } from "@jest/globals"
import supertest from "supertest"
import express, { json, NextFunction, Request, Response } from "express"
import {User, UserParams} from "../src/types.js"
import { AuthHandler } from "../src/handlers/middlewares.js"
import { JWT_Auther } from "../src/auth.js"
import { ControllerImp } from "../src/controllers.js"
import { PasswordEncrypter } from "../src/types.js"
import { createUserDB, createLinkDB } from "./db.test.js"
import * as db from "../src/db/main.js"
import { Hasher } from "../src/hash.js"

export function createAuthHandler(udb: db.UserDB, ldb: db.LinkDB): AuthHandler {
    const encrypter = new PasswordEncrypter('pwdsecret')
    return new AuthHandler(
        new JWT_Auther("jwtsecret"),
        new ControllerImp(udb, ldb, new Hasher(), encrypter),
        encrypter
    )
}
export function insertUserParms(user: UserParams, udb: db.UserDB, ldb: db.LinkDB): boolean {
    const controller = new ControllerImp(
        udb,
        ldb,
        new Hasher(),
        new PasswordEncrypter('pwdsecret')
    )
    return controller.createUser(user).success
}
describe('handlers', () => {
    test('login', async () => {
        const logger = (req: Request, _res:Response, next:NextFunction)=>{
            console.info(req.body)
            const user =udb.getUserByUsername(req.body.username as string)
            const encpwd = udb.getEncryptedPasswordByID(( user as User).ID)
            console.info(user?.encryptedPassword)
            console.info(encpwd)
            next()
        }
        const udb = createUserDB()
        const ldb = createLinkDB()
        const AuthHandler = createAuthHandler(udb, ldb)
        const app = express()
        app.post("/login",json(),logger, AuthHandler.authenticate)
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
            }).set("Content-Type","application/json")
        expect(res.status).toEqual(204)
        console.info(res)
        expect(res.header["x-authorization"]).toBeDefined()
        // console.log = () => { }
        udb.teardown()

    })
})
