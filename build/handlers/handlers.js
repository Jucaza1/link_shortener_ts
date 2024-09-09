import { constants as httpStatus } from "http2";
import * as types from "../types.js";
export class UserHandler {
    constructor(userDB) {
        this.userDB = userDB;
        this.handleGetUser = this.handleGetUser.bind(this);
    }
    handleGetUser(req, res) {
        const params = req.params;
        if (params.id === undefined || params.id === "") {
            res
                .status(httpStatus.HTTP_STATUS_BAD_REQUEST)
                .send(types.errorMsg("invalid id"));
            return;
        }
        const user = this.userDB.getUserByID(params.id);
        if (user === undefined) {
            res.status(httpStatus.HTTP_STATUS_NOT_FOUND)
                .send(types.errorMsg("id not found"));
            return;
        }
        const user_DTO = types.parseUser_DTO(user);
        res.status(httpStatus.HTTP_STATUS_OK).json(user_DTO);
    }
}
export class LinkHandler {
    constructor(linkDB) {
        this.linkDB = linkDB;
        // this.handleServeLink = this.handleServeLink.bind(this)
    }
}
export class LSHandler {
    constructor(linkDB) {
        this.linkDB = linkDB;
        this.handleServeLink = this.handleServeLink.bind(this);
    }
    handleServeLink(req, res) {
        const params = req.params;
        if (params.short === undefined || params.short === "") {
            res
                .status(httpStatus.HTTP_STATUS_BAD_REQUEST)
                .send(types.errorMsg("invalid id"));
            return;
        }
        const url = this.linkDB.serveLink(params.short);
        if (url === undefined) {
            res.status(httpStatus.HTTP_STATUS_NOT_FOUND)
                .send(types.errorMsg("id not found"));
            return;
        }
        res.setHeader("Location", url);
        res.status(httpStatus.HTTP_STATUS_PERMANENT_REDIRECT);
        res.send();
        this.linkDB.trackServe(params.short);
    }
}
//# sourceMappingURL=handlers.js.map