import {expect, describe, test} from '@jest/globals'
import { Hasher } from '../src/hash'

describe("hasher for link short",()=>{
    test("hash and unhash",()=>{
        const hasher = new Hasher()
        const input = 12345
        const hashedOutput = hasher.hash(input)
        expect(hashedOutput).toBeDefined()
        const unhasedOutput = hasher.unhash(hashedOutput)
        expect(unhasedOutput).toBeDefined()
        expect(unhasedOutput).toEqual(input)

    })
    // test("hash and unhash with custom settings",()=>{})
})
