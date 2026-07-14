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

const {
    findItemByIndex
} = require("./itemQueries")

describe("Database User Queries", () => {
    let testUser
    let testCharacter
    let testItems
    let additionalUserIds

    beforeEach(() => {
        const uniqueSuffix =
            `${Date.now()}_${Math.random().toString(16).slice(2)}`

        testUser = createUser({
            username: `TestUser_${uniqueSuffix}`,
            password: "testpass"
        })

        testCharacter = createCharacter({
            user_id: testUser.user_id,
            name: `TestCharacter_${uniqueSuffix}`,
            max_weight: 100
        })

        /*
         * These are existing item definitions from the seeded items table.
         * They are not owned inventory entries yet, so they should not be
         * deleted after each test.
         */
        testItems = {
            backpack: findItemByIndex("backpack"),
            pouch: findItemByIndex("pouch"),
            torch: findItemByIndex("torch")
        }

        additionalUserIds = []
    })

    afterEach(() => {
        /*
         * This also removes the test character and any future inventory
         * entries through ON DELETE CASCADE.
         *
         * If a test already deleted testUser, this simply returns false.
         */
        deleteUserById(testUser.user_id)

        for (const userId of additionalUserIds) {
            deleteUserById(userId)
        }
    })

    // --- User Queries ---

    describe("findUserById", () => {
        test("returns an existing user", () => {
            const user = findUserById(testUser.user_id)

            expect(user).toBeDefined()
            expect(user.user_id).toBe(testUser.user_id)
            expect(user.username).toBe(testUser.username)
        })

        test("returns undefined for a missing user", () => {
            const user = findUserById(999999999)

            expect(user).toBeUndefined()
        })
    })

    describe("findUserByUsername", () => {
        test("returns an existing user", () => {
            const user = findUserByUsername(testUser.username)

            expect(user).toBeDefined()
            expect(user.user_id).toBe(testUser.user_id)
        })

        test("returns undefined for a missing user", () => {
            const user = findUserByUsername("FortuneFinder")

            expect(user).toBeUndefined()
        })
    })

    describe("createUser", () => {
        test("creates a new user", () => {
            const user = createUser({
                username: `TestUser_Additional_${Date.now()}`,
                password: "testpass"
            })

            additionalUserIds.push(user.user_id)

            expect(user).toHaveProperty("user_id")
            expect(user.username).toContain("TestUser_Additional_")
        })

        test("throws for a duplicate username", () => {
            expect(() => {
                createUser({
                    username: testUser.username,
                    password: "different-password"
                })
            }).toThrow("UNIQUE constraint failed")
        })
    })

    describe("updateUserById", () => {
        test("updates the username of an existing user", () => {
            const newUsername = `${testUser.username}_Updated`

            const result = updateUserById(testUser.user_id, {
                username: newUsername
            })

            expect(result.user_id).toBe(testUser.user_id)
            expect(result.username).toBe(newUsername)

            const storedUser = findUserById(testUser.user_id)

            expect(storedUser.username).toBe(newUsername)
        })

        test("returns undefined for a missing user", () => {
            const result = updateUserById(999999999, {
                username: "MissingUser"
            })

            expect(result).toBeUndefined()
        })
    })

    describe("deleteUserById", () => {
        test("deletes an existing user", () => {
            const deleted = deleteUserById(testUser.user_id)

            expect(deleted).toBe(true)
            expect(findUserById(testUser.user_id)).toBeUndefined()
        })

        test("returns false for a missing user", () => {
            const deleted = deleteUserById(999999999)

            expect(deleted).toBe(false)
        })
    })

    // --- Character Queries ---

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

        test("returns an empty array for a user with no characters", () => {
            const additionalUser = createUser({
                username: `TestUser_Empty_${Date.now()}`,
                password: "testpass"
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
            expect(character.character_id)
                .toBe(testCharacter.character_id)
            expect(character.user_id).toBe(testUser.user_id)
            expect(character.name).toBe(testCharacter.name)
        })

        test("returns undefined for a missing character", () => {
            const character = findCharacterByUserIdAndName(
                testUser.user_id,
                "MissingCharacter"
            )

            expect(character).toBeUndefined()
        })
    })

    describe("createCharacter", () => {
        test("creates another character for the user", () => {
            const character = createCharacter({
                user_id: testUser.user_id,
                name: `TestCharacter_Additional_${Date.now()}`,
                max_weight: 120
            })

            expect(character).toHaveProperty("character_id")
            expect(character.user_id).toBe(testUser.user_id)
            expect(character.max_weight).toBe(120)
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

            expect(result.character_id)
                .toBe(testCharacter.character_id)
            expect(result.name).toBe(newName)
            expect(result.max_weight).toBe(150)

            const storedCharacter =
                findCharacterByUserIdAndName(
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
            const deleted = deleteCharacterById(
                testCharacter.character_id
            )

            expect(deleted).toBe(true)

            const foundCharacter =
                findCharacterByUserIdAndName(
                    testUser.user_id,
                    testCharacter.name
                )

            expect(foundCharacter).toBeUndefined()
        })

        test("returns false for a missing character", () => {
            const deleted = deleteCharacterById(999999999)

            expect(deleted).toBe(false)
        })
    })

    // Inventory-query tests can be added here later.
})