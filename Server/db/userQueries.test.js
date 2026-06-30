const { findUserById } = require("./userQueries");

describe("Database User Queries", () => {
    test("findUserById returns undefined for missing user", () => {
        const user = findUserById(999);
        expect(user).toBeUndefined();
    });
});