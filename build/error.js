export class Operation {
    constructor(success, data = undefined, source = undefined, msg = undefined) {
        this.success = success;
        this.data = data;
        this.source = source;
        this.msg = msg;
    }
}
export var errorSource;
(function (errorSource) {
    errorSource[errorSource["none"] = 0] = "none";
    errorSource[errorSource["database"] = 1] = "database";
    errorSource[errorSource["validation"] = 2] = "validation";
})(errorSource || (errorSource = {}));
//# sourceMappingURL=error.js.map