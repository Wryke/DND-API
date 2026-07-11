const {
    findUserById,
    findUserByUsername,
    createUser,
    updateUserById,
    deleteUserById,
    findCharactersByUserId,
    findCharacterByUserIdAndName,
    createCharacter,
    updateCharacterById,
    deleteCharacterById
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
    
    // --- User Queries ---

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

    // updateUserById
    test("updateUserById updates the username of an existing user", () => {
        const username = `TestUser_${Date.now()}`

        const user = createUser({
            username: username,
            password: "testpass"
        })

        const newUsername = `${username}9090`
        const result = updateUserById(
            user.user_id, 
            {
                username: newUsername
            })

        expect(result.user_id).toBe(user.user_id)
        expect(result.username).toBe(newUsername)
    })

    test("deleteUserById returns false for missing user", () => {
        const result = deleteUserById(999999)

        expect(result).toBe(false)
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

    // --- Character Queries ---

    // findCharactersByUserId
    test("findCharactersByUserId returns an array", () => {
        const characters = findCharactersByUserId(1)

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

        const characters = findCharactersByUserId(user.user_id)

        expect(Array.isArray(characters)).toBe(true)

        expect(
            characters.some(c => c.character_id === character.character_id)
        ).toBe(true)

        expect(
            characters.some(c => c.name === "TestCharacter")
        ).toBe(true)
    })

    // findCharacterByUserIdAndName
    test("findCharacterByUserIdAndName returns an existing character for a user", () => {
        const username = `TestUser_${Date.now()}`

        const user = createUser({
            username: username,
            password: "testpass"
        })

        const characterName = "TestCharacter"

        const newCharacter = createCharacter({
            user_id: user.user_id,
            name: characterName,
            max_weight: 100
        })

        const character = findCharacterByUserIdAndName(user.user_id, characterName)

        expect(character.name).toBe(characterName)
        expect(character.user_id).toBe(user.user_id)
    })

    // createCharacter
    test("updateUserById updates the username of an existing user", () => {
        const username = `TestUser_${Date.now()}`

        const user = createUser({
            username: username,
            password: "testpass"
        })

        const name = "TestCharacter"
        const character = createCharacter({
            user_id: user.user_id,
            name: name,
            max_weight: 100
        })
        
        expect(character.user_id).toBe(user.user_id)
        expect(character.name).toBe(name)
    })

    // updateCharacterById
    test("updateCharacterById updates the name of an existing character", () => {
        const username = `TestUser_${Date.now()}`

        const user = createUser({
            username: username,
            password: "testpass"
        })

        const name = "TestCharacter"
        const character = createCharacter({
            user_id: user.user_id,
            name: name,
            max_weight: 100
        })

        const newName = `${name}9090`
        const result = updateCharacterById(
            user.user_id, 
            {
                name: newName,
                max_weight: character.max_weight
            })

        expect(result.character_id).toBe(character.character_id)
        expect(result.name).toBe(newName)
        expect(result.max_weight).toBe(character.max_weight)
    })

    // deleteCharacterById
    test("deleteCharacterById deletes an existing character", () => {
        const user = createUser({
            username: `TestUser_${Date.now()}`,
            password: "testpass"
        })

        const character = createCharacter({
            user_id: user.user_id,
            name: "TestCharacter",
            max_weight: 100
        })

        const deleted = deleteCharacterById(character.character_id)

        expect(deleted).toBe(true)

        const foundCharacter = findCharacterByUserIdAndName(
            user.user_id,
            "TestCharacter"
        )

        expect(foundCharacter).toBeUndefined()
    })

    test("deleteCharacterById returns false for a missing character", () => {
        const deleted = deleteCharacterById(999999999)

        expect(deleted).toBe(false)
    })

    // --- Inventory Queries ---
})