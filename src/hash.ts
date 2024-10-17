export class Hasher {
    base: string = "0123456789abcdefghijklmnopqrstuvwxyz"
    digits: number = 5
    /**
     * @default
     * base: string = "0123456789abcdefghijklmnopqrstuvwxyz"
     * digits: number = 5
     * */
    constructor(base?: string, digits?: number) {
        this.base = base ?? this.base
        this.digits = Math.trunc(digits ?? this.digits)
        if (this.digits < 1) throw "digits must be at least 1"
        this.hash = this.hash.bind(this)
        this.unhash = this.unhash.bind(this)

    }

    hash(input: number): string {
        const min = 0
        const base = this.base.length
        const max = base ** this.digits - 1
        let result = ""
        let q = input
        let mod = 0
        if (input <= min) {
            for (let i = 0; i < this.digits; i++) {
                result += this.base[0]
            }
        }
        if (input >= max) {
            for (let i = 0; i < this.digits; i++) {
                result += this.base[base - 1]
            }
        }
        while (q > 0 && input < max && input > min) {
            mod = q % base
            q = q / base | 0
            result = this.base[mod] + result
        }
        const pad = this.digits - result.length
        for (let i = 0; i < pad; i++) {
            result = this.base[0] + result
        }
        return result
    }

    unhash(input: string): number {
        let c = this.base[0]
        if (c === "]") c = "\\]"
        if (c === "^") c = "\\^"
        if (c === "\\") c = "\\\\"
        const s = input.replace(new RegExp(
            "^[" + c + "]+", "g"
        ), "");
        let result = 0
        for (let i = 0; i < s.length; i++) {
            // console.log(`(${this.base.length}** ${i}) * ${this.base.indexOf(s[s.length-i-1])}`)
            result += (this.base.length ** i) * this.base.indexOf(s[s.length - i - 1])
        }
        return result
    }
}
// export function run() {
//     let n
//     let res: boolean = true
//     for (n = 0; n < pool.length ** 1; n++) {
//         console.log(`${n} hash= ${hash(n)}, unhash= ${unhash(hash(n))}`)
//         if (unhash(hash(n)) !== n) res = false
//     }
//     console.log(res)
//     console.log(pool.length)
//     console.log(unhash(hash(0)) == 0)
//     console.log(hash(36))
//     console.log(hash(36 ** 2))
//     console.log(hash(798323))
//     console.log(hash(36 ** 5 - 1))
// }
