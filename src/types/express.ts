import { HttpError } from "./result";

export type NextFunction = (err?: {httpError:HttpError, exception?:Error}) => void
