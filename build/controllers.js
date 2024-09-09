import * as types from "./types.js";
import { errorSource, Operation } from "./error.js";
export class Controller {
    constructor(udb, ldb, encrypter) {
        this.udb = udb;
        this.ldb = ldb;
        this.encrypter = encrypter;
    }
    getUserByID(id) {
        let result;
        let validID;
        const validationRes = types.UserSchema.shape.ID.safeParse(id);
        if (!validationRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid id");
        }
        validID = validationRes.data;
        try {
            result = this.udb.getUserByID(validID);
        }
        catch (e) {
            return new Operation(false, undefined, errorSource.database, "internal server error");
        }
        if (result == undefined) {
            return new Operation(false, undefined, errorSource.database, "internal server error");
        }
        return new Operation(true, types.parseUser_DTO(result));
    }
    getUserbyEmail(email) {
        let result;
        let validEmail;
        const validationRes = types.UserSchema.shape.email.safeParse(email);
        if (!validationRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid email");
        }
        validEmail = validationRes.data;
        try {
            result = this.udb.getUserByEmail(validEmail);
        }
        catch (e) {
            return new Operation(false, undefined, errorSource.database, "internal server error");
        }
        if (result == undefined) {
            return new Operation(false, undefined, errorSource.database, "internal server error");
        }
        return new Operation(true, types.parseUser_DTO(result));
    }
    getUserbyUsername(username) {
        let result;
        let validUsername;
        const validationRes = types.UserSchema.shape.username.safeParse(username);
        if (!validationRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid username");
        }
        validUsername = validationRes.data;
        try {
            result = this.udb.getUserByEmail(validUsername);
        }
        catch (e) {
            return new Operation(false, undefined, errorSource.database, "internal server error");
        }
        if (result == undefined) {
            return new Operation(false, undefined, errorSource.database, "internal server error");
        }
        return new Operation(true, types.parseUser_DTO(result));
    }
    createUser(userParams) {
        let result;
        let validUserParams;
        const validationRes = types.UserParamsSchema.safeParse(userParams);
        if (!validationRes.success) {
            return new Operation(false, result, errorSource.validation, "invalid user");
        }
        validUserParams = validationRes.data;
        const operation = types.createUserFromParams(validUserParams, this.encrypter);
        if (!operation.success || operation.data === undefined) {
            return operation;
        }
        try {
            result = this.udb.createUser(operation.data);
        }
        catch (e) {
            return new Operation(false, undefined, errorSource.database, "internal server error");
        }
        if (result === undefined) {
            return new Operation(false, undefined, errorSource.database, "internal server error");
        }
        return new Operation(true, types.parseUser_DTO(result));
    }
}
//# sourceMappingURL=controllers.js.map