const { findUserById, findUserByUsername } = require("./userQueries");

describe("Database User Queries", () => {
    // findUserById
    test("findUserById returns undefined for missing user", () => {
        const user = findUserById(999);
        expect(user).toBeUndefined();
    });

    // findUserByUsername
    test("findUserByUsername returns undefined for missing user", () => {
        const username = findUserByUsername('FortuneFinder');
        expect(username).toBeUndefined();
    });
});