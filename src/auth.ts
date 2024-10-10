import jwt from 'jsonwebtoken'

export interface Auther {
    generateToken(input: any): string,
    verifyToken(token: string): undefined | any,

}

export class JWT_Auther implements Auther {
    private secret: string
    constructor(secret: string) {
        this.secret = secret ?? "defaultsecret"
        this.generateToken = this.generateToken.bind(this)
        this.verifyToken = this.verifyToken.bind(this)
    }
    generateToken(input: any): string {
        const token = jwt.sign(input, this.secret, { algorithm: 'HS256', expiresIn: "1h" });
        return token

    }
    verifyToken(token: string): undefined | any {
        let decoded: jwt.JwtPayload | string
        if (token === undefined || token === "") {
            return undefined
        }
        try {
            decoded = jwt.verify(token, this.secret);
        } catch (err) {
            return undefined
        }
        if (typeof decoded === "string" || decoded === undefined) {
            return undefined
        }
        if (decoded.exp === undefined || decoded.exp * 1000 < Date.now()) {
            return undefined
        }
        return decoded
    }
}
export function TestJWT() {
    const jwt_auther = new JWT_Auther("secrettest")
    const input = {
        user: "testuser",
    }
    const input2 = {
        user: "testuser2",
    }
    const token = jwt_auther.generateToken(input)
    console.log("token is")
    console.log(token)
    const token2 = jwt_auther.generateToken(input2)
    console.log("token2 is")
    console.log(token2)
    const decoded = jwt_auther.verifyToken(token)
    console.log("decoded2 is")
    console.log(decoded)
    const output = {
        user: decoded.user,
        password: decoded.password
    }
    const decoded2 = jwt_auther.verifyToken(token2)
    console.log("decoded2 is")
    console.log(decoded2)
    const output2 = {
        user: decoded2.user,
        password: decoded2.password
    }
    let success = false
    if (output.user === input.user) success = true
    console.log(`output === input -> ${success}`)
    success = false
    if (output2.user === input2.user) success = true
    console.log(`output2 === input2 -> ${success}`)
    success = false
    if (output.user !== output2.user) success = true
    console.log(`output !== output2 -> ${success}`)

}
