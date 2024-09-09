export class memoryUserDB {
    constructor() {
        const cdate = new Date(Date.UTC(1990, 5, 11));
        const ddate = new Date(Date.UTC(2000, 5, 11));
        this.db = [
            {
                ID: "34",
                username: "testUser",
                email: "test@gmail.com",
                createdAt: cdate.toISOString().split("T")[0],
                deleted: false,
                deletedAt: ddate.toISOString().split("T")[0],
                encriptedPassword: "encriptedPassword",
                guest: false
            },
        ];
    }
    getUserByID(id) {
        const reuslt = this.db.filter((user) => user.ID == id);
        return reuslt[0];
    }
}
//# sourceMappingURL=memory.js.map