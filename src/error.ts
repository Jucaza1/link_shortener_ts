export class Operation<T> {
    success: boolean
    data: T | undefined
    source: errorSource | undefined
    msg: string | undefined
    constructor(success: boolean, data: undefined | T = undefined,
        source: errorSource | undefined = undefined,
        msg: string | undefined = undefined) {

        this.success = success
        this.data = data
        this.source = source
        this.msg = msg
    }
}
export enum errorSource {
    none,
    database,
    validation,
}
