import { NextFunction, Request, Response } from "express";

export function jsonMiddleware(req: Request, res: Response, next: NextFunction) {
    // check if header is application/json and if not, return 415
    if (!req.is("application/json")) {
        if (req.method === "POST") {
            res.setHeader("Accept-Post", "application/json")
        }
        if (req.method === "PUT") {
            res.setHeader("Accept-Put", "application/json")
        }
        if (req.method === "PATCH") {
            res.setHeader("Accept-Patch", "application/json")
        }
        res.status(415).json({ error: ["unsupported Media Type"] });

        return;
    }
    next();
}
