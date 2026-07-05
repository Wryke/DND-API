const {
    findUserById,
    findUserByUsername,
    createUser,
    deleteUserById,
    findCharacterByUserId,
    createCharacter
} = require("./userQueries")

const db = require("./connection")

describe("Database User Queries", () => {

    afterEach(() => {
        db.prepare(`
            DELETE FROM characters
            WHERE name LIKE 'TestCharacter%'
        `).run()

        db.prepare(`
            DELETE FROM users
            WHERE username LIKE 'TestUser_%'
            OR username LIKE 'DuplicateUser_%'
        `).run()
    })
    
    // findUserById
    test("findUserById returns undefined for missing user", () => {
        const user = findUserById(999)
        expect(user).toBeUndefined()
    })

    // findUserByUsername
    test("findUserByUsername returns undefined for missing user", () => {
        const username = findUserByUsername('FortuneFinder')
        expect(username).toBeUndefined()
    })

    // createUser
    test("createUser creates a new user", () => {
        const username = `TestUser_${Date.now()}`

        const user = createUser({
            username,
            password: "testpass"
        })

        expect(user).toHaveProperty("user_id")
        expect(user.username).toBe(username)
    })

    test("duplicate username throws", () => {
        const username = `DuplicateUser_${Date.now()}`

        createUser({ username, password: "one" })

        expect(() => {
            createUser({ username, password: "two" })
        }).toThrow("UNIQUE constraint failed")
    })

    // deleteUserById
    test("deleteUserById deletes an existing user", () => {
        const username = `TestUser_${Date.now()}`

        const user = createUser({
            username: username,
            password: "testpass"
        })

        const result = deleteUserById(user.user_id)

        expect(result).toBe(true)
    })

    test("deleteUserById returns false for missing user", () => {
        const result = deleteUserById(999999)

        expect(result).toBe(false)
    })

    // findCharactersByUserId
    test("findCharactersByUserId returns an array", () => {
        const characters = findCharacterByUserId(1)

        expect(Array.isArray(characters)).toBe(true)
    })

    test("findCharactersByUserId returns characters for a user", () => {
        const username = `TestUser_${Date.now()}`

        const user = createUser({
            username: username,
            password: "testpass"
        })

        const character = createCharacter({
            user_id: user.user_id,
            name: "TestCharacter",
            max_weight: 100
        })

        const characters = findCharacterByUserId(user.user_id)

        expect(Array.isArray(characters)).toBe(true)

        expect(
            characters.some(c => c.character_id === character.character_id)
        ).toBe(true)

        expect(
            characters.some(c => c.name === "TestCharacter")
        ).toBe(true)
    })
})