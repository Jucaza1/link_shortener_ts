import jwt from 'jsonwebtoken'

export class JWT_Auther {
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
        if (token === undefined || token === ""){
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
        if (decoded.exp === undefined || decoded.exp*1000 < Date.now()) {
            return undefined
        }
        return decoded
    }
}
export function TestJWT(){
    const jwt_auther = new JWT_Auther("secrettest")
    const input = {
        user : "testuser",
        password : "testpassword"
    }
    const token = jwt_auther.generateToken(input)
    console.log("token is")
    console.log(token)
    const decoded = jwt_auther.verifyToken(token+"i")
    console.log("decoded is")
    console.log(decoded)
    const output = {
        user: decoded.user,
        password: decoded.password
    }
    let success = false
    if (output.user === input.user && output.password === input .password) success = true
    console.log(`output === input -> ${success}`)

}
