
const {
    createUser,
    deleteUserById
} = require("./userQueries")

const {
    findCharactersByUserId,
    findCharacterByUserIdAndName,
    createCharacter,
    updateCharacterById,
    deleteCharacterById
} = require("./characterQueries")

// Integration tests: use a dedicated SQLite test database.
describe("Database Character Queries", () => {
    let testUser
    let testCharacter
    let additionalUserIds = []

    beforeEach(() => {
        const uniqueSuffix =
            `${Date.now()}_${Math.random().toString(16).slice(2)}`

        testUser = createUser({
            username: `TestUser_${uniqueSuffix}`,
            email: `test_${uniqueSuffix}@example.com`,
            passwordHash: `test-hash-${uniqueSuffix}`
        })

        testCharacter = createCharacter({
            user_id: testUser.user_id,
            name: `TestCharacter_${uniqueSuffix}`,
            max_weight: 100
        })

        additionalUserIds = []
    })

    afterEach(() => {
        deleteUserById(testUser.user_id)

        for (const userId of additionalUserIds) {
            deleteUserById(userId)
        }
    })

    describe("findCharactersByUserId", () => {
        test("returns the user's characters", () => {
            const characters =
                findCharactersByUserId(testUser.user_id)

            expect(Array.isArray(characters)).toBe(true)

            expect(
                characters.some(character =>
                    character.character_id ===
                    testCharacter.character_id
                )
            ).toBe(true)
        })

        test("returns standardized character data", () => {
            const characters =
                findCharactersByUserId(testUser.user_id)

            const character = characters.find(character =>
                character.character_id ===
                testCharacter.character_id
            )

            expect(character).toHaveProperty("character_id")
            expect(character).toHaveProperty("user_id")
            expect(character).toHaveProperty("name")
            expect(character).toHaveProperty("max_weight")
        })

        test("returns characters ordered by name", () => {
            createCharacter({
                user_id: testUser.user_id,
                name: "AAA Test Character",
                max_weight: 100
            })

            const characters =
                findCharactersByUserId(testUser.user_id)

            const names = characters.map(character => character.name)

            const sortedNames = [...names].sort(
                (a, b) => a.localeCompare(b)
            )

            expect(names).toEqual(sortedNames)
        })

        test("returns an empty array for a user with no characters", () => {
            const uniqueSuffix =
                `${Date.now()}_${Math.random().toString(16).slice(2)}`

            const additionalUser = createUser({
                username: `EmptyUser_${uniqueSuffix}`,
                email: `empty_${uniqueSuffix}@example.com`,
                passwordHash: "test-hash"
            })

            additionalUserIds.push(additionalUser.user_id)

            const characters =
                findCharactersByUserId(additionalUser.user_id)

            expect(characters).toEqual([])
        })
    })

    describe("findCharacterByUserIdAndName", () => {
        test("returns an existing character", () => {
            const character = findCharacterByUserIdAndName(
                testUser.user_id,
                testCharacter.name
            )

            expect(character).toBeDefined()
            expect(character.character_id).toBe(testCharacter.character_id)
            expect(character.user_id).toBe(testUser.user_id)
            expect(character.name).toBe(testCharacter.name)
            expect(character.max_weight).toBe(testCharacter.max_weight)
        })

        test("returns undefined for a missing character", () => {
            const character = findCharacterByUserIdAndName(
                testUser.user_id,
                "MissingCharacter"
            )

            expect(character).toBeUndefined()
        })

        test("does not return another user's character", () => {
            const uniqueSuffix =
                `${Date.now()}_${Math.random().toString(16).slice(2)}`

            const additionalUser = createUser({
                username: `OtherUser_${uniqueSuffix}`,
                email: `other_${uniqueSuffix}@example.com`,
                passwordHash: "test-hash"
            })

            additionalUserIds.push(additionalUser.user_id)

            const character = findCharacterByUserIdAndName(
                additionalUser.user_id,
                testCharacter.name
            )

            expect(character).toBeUndefined()
        })
    })

    describe("createCharacter", () => {
        test("creates a character", () => {
            const character = createCharacter({
                user_id: testUser.user_id,
                name: `AdditionalCharacter_${Date.now()}`,
                max_weight: 120
            })

            expect(character).toHaveProperty("character_id")
            expect(character.user_id).toBe(testUser.user_id)
            expect(character.max_weight).toBe(120)

            const storedCharacter = findCharacterByUserIdAndName(
                testUser.user_id,
                character.name
            )

            expect(storedCharacter).toBeDefined()
            expect(storedCharacter.character_id).toBe(character.character_id)
        })
    })

    describe("updateCharacterById", () => {
        test("updates an existing character", () => {
            const newName = `${testCharacter.name}_Updated`

            const result = updateCharacterById(
                testCharacter.character_id,
                {
                    name: newName,
                    max_weight: 150
                }
            )

            expect(result).toEqual({
                character_id: testCharacter.character_id,
                name: newName,
                max_weight: 150
            })

            const storedCharacter = findCharacterByUserIdAndName(
                testUser.user_id,
                newName
            )

            expect(storedCharacter).toBeDefined()
            expect(storedCharacter.max_weight).toBe(150)
        })

        test("returns undefined for a missing character", () => {
            const result = updateCharacterById(
                999999999,
                {
                    name: "MissingCharacter",
                    max_weight: 100
                }
            )

            expect(result).toBeUndefined()
        })
    })

    describe("deleteCharacterById", () => {
        test("deletes an existing character", () => {
            const deleted =
                deleteCharacterById(testCharacter.character_id)

            expect(deleted).toBe(true)

            expect(
                findCharacterByUserIdAndName(
                    testUser.user_id,
                    testCharacter.name
                )
            ).toBeUndefined()
        })

        test("returns false for a missing character", () => {
            const deleted = deleteCharacterById(999999999)

            expect(deleted).toBe(false)
        })
    })
})
