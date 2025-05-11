import { Request, Response, NextFunction, ErrorRequestHandler } from "express"
import { HttpError } from "../types/result"
export const globalErrorHandler: ErrorRequestHandler = (
    // { httpError, exception }: { httpError: HttpError, exception: Error },
    error: any,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {

    if (error.httpError !== undefined) {
        //{ httpError, exception }: { httpError: HttpError, exception: Error } = error
        console.error(error.httpError as HttpError)
        res.status(error.httpError.status ?? 500).json({ error: error.httpError.msg })
        if (error.exception) {
            console.log(error.exception)
        }
        return
    }
    if (error.status !== undefined) {
        console.error({ statusCode: error.statusCode, type: error.type })
        if (error.statusCode === 400) {
            res.status(error.statusCode as number).json({ error: "bad request" })
        } else {
            res.status(error.statusCode as number).json({ error: error.status })
        }
        return
    }
    if (error instanceof Error) {
        console.error(error)
        res.status(500).json({ error: "internal server error" })
        return
    }
}
