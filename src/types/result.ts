export type Result<T, E> = {
    ok: boolean
    data?: T
    err?: E
    exception?: Error
}

export type ResultHttp<T> = Result<T, HttpError>
export type HttpError = {
    status: number
    msg?: string[]
}

export type ResultStore<T> = Result<T, StoreError>
export type StoreError = {
    code: StoreErrorCode
    msg?: string
}

export enum StoreErrorCode {
    engineFault, // 500
    connectionFault, // 500
    invalidCredentials, // 500
    inconsistentState, // 500
    versionError, // 500
    unique,  // 422
    notFound, // 404
    invalidInput, // 400
    unknown, // 500
    migrateError, // 500
}

export function resultStoreToResultHttp<T>(result: ResultStore<T>): ResultHttp<T> {
    if (result.ok) {
        return { ok: true, data: result.data }
    }
    let e: ResultHttp<T>
    switch (result.err!.code) {
        case StoreErrorCode.engineFault:
            e = { ok: false, err: { status: 500, msg: [result.err!.msg!] } }
            break
        case StoreErrorCode.connectionFault:
            e = { ok: false, err: { status: 500, msg: [result.err!.msg!] } }
            break
        case StoreErrorCode.invalidCredentials:
            e = { ok: false, err: { status: 500, msg: [result.err!.msg!] } }
            break
        case StoreErrorCode.unique:
            e = { ok: false, err: { status: 422, msg: ["entity already exists"] } }
            break
        case StoreErrorCode.notFound:
            e = { ok: false, err: { status: 404, msg: [result.err!.msg!] } }
            break
        case StoreErrorCode.invalidInput:
            e = { ok: false, err: { status: 400, msg: ["invalid input"] } }
            break
        case StoreErrorCode.inconsistentState:
            e = { ok: false, err: { status: 500, msg: [result.err!.msg!] } }
            break
        case StoreErrorCode.versionError:
            e = { ok: false, err: { status: 500, msg: [result.err!.msg!] } }
            break
        case StoreErrorCode.unknown:
            e = { ok: false, err: { status: 500, msg: [result.err!.msg!] } }
            break
        case StoreErrorCode.migrateError:
            e = { ok: false, err: { status: 500, msg: [result.err!.msg!] } }
            break
        default:
            e = { ok: false, err: { status: 500, msg: [result.err!.msg!] } }
            break
    }
    e.exception = result.exception
    return e
}
