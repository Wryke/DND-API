const {
    findUserById,
    findUserByUsername,
    findUserByEmail,
    findPasswordHashByUserId,
    createUser,
    updateUserById,
    deleteUserById,

    findCharactersByUserId,
    findCharacterByUserIdAndName,
    createCharacter,
    updateCharacterById,
    deleteCharacterById,

    findInventoryEntryById,
    findAllInventoryByCharacterId,
    findRootInventoryByCharacterId,
    findInventoryChildren,
    createInventoryEntry,
    updateInventoryQuantity,
    moveInventoryEntry,
    updateInventoryEntry,
    deleteInventoryEntry
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
            email: `test_${uniqueSuffix}@example.com`,
            passwordHash: `test-hash-${uniqueSuffix}`
        })

        testCharacter = createCharacter({
            user_id: testUser.user_id,
            name: `TestCharacter_${uniqueSuffix}`,
            max_weight: 100
        })

        testItems = {
            backpack: findItemByIndex("backpack"),
            pouch: findItemByIndex("pouch"),
            torch: findItemByIndex("torch")
        }

        expect(testItems.backpack).toBeDefined()
        expect(testItems.pouch).toBeDefined()
        expect(testItems.torch).toBeDefined()

        additionalUserIds = []
    })


    afterEach(() => {
        /*
         * Characters and inventory entries are removed through
         * the user's ON DELETE CASCADE relationships.
         */
        deleteUserById(testUser.user_id)

        for (const userId of additionalUserIds) {
            deleteUserById(userId)
        }
    })


    // --- User Queries ---

    describe("findUserById", () => {

        test("returns an existing user", () => {
            const user =
                findUserById(testUser.user_id)

            expect(user).toEqual({
                user_id: testUser.user_id,
                username: testUser.username,
                email: testUser.email
            })
        })


        test("does not return the password hash", () => {
            const user =
                findUserById(testUser.user_id)

            expect(user)
                .not.toHaveProperty("password_hash")
        })


        test("returns undefined for a missing user", () => {
            const user =
                findUserById(999999999)

            expect(user).toBeUndefined()
        })

    })


    describe("findUserByUsername", () => {

        test("returns an existing user", () => {
            const user =
                findUserByUsername(testUser.username)

            expect(user).toEqual({
                user_id: testUser.user_id,
                username: testUser.username
            })
        })


        test("only returns safe username lookup data", () => {
            const user =
                findUserByUsername(testUser.username)

            expect(user)
                .not.toHaveProperty("email")

            expect(user)
                .not.toHaveProperty("password_hash")
        })


        test("returns undefined for a missing username", () => {
            const user =
                findUserByUsername("FortuneFinder")

            expect(user).toBeUndefined()
        })

    })


    describe("findUserByEmail", () => {

        test("returns an existing user by email", () => {
            const user =
                findUserByEmail(testUser.email)

            expect(user).toBeDefined()

            expect(user.user_id)
                .toBe(testUser.user_id)

            expect(user.username)
                .toBe(testUser.username)

            expect(user.email)
                .toBe(testUser.email)
        })


        test("returns the password hash for authentication", () => {
            const user =
                findUserByEmail(testUser.email)

            expect(user)
                .toHaveProperty("password_hash")

            expect(user.password_hash)
                .toContain("test-hash-")
        })


        test("returns undefined for a missing email", () => {
            const user =
                findUserByEmail(
                    "missing-user@example.com"
                )

            expect(user).toBeUndefined()
        })

    })


    describe("findPasswordHashByUserId", () => {

        test("returns the password hash for an existing user", () => {
            const passwordHash =
                findPasswordHashByUserId(
                    testUser.user_id
                )

            expect(passwordHash)
                .toContain("test-hash-")
        })


        test("returns the hash string instead of an object", () => {
            const passwordHash =
                findPasswordHashByUserId(
                    testUser.user_id
                )

            expect(typeof passwordHash)
                .toBe("string")
        })


        test("returns undefined for a missing user", () => {
            const passwordHash =
                findPasswordHashByUserId(
                    999999999
                )

            expect(passwordHash)
                .toBeUndefined()
        })

    })


    describe("createUser", () => {

        test("creates a new user", () => {
            const uniqueSuffix =
                `${Date.now()}_${Math.random().toString(16).slice(2)}`

            const user = createUser({
                username: `AdditionalUser_${uniqueSuffix}`,
                email: `additional_${uniqueSuffix}@example.com`,
                passwordHash: "additional-test-hash"
            })

            additionalUserIds.push(user.user_id)

            expect(user).toEqual({
                user_id: expect.any(Number),
                username: `AdditionalUser_${uniqueSuffix}`,
                email: `additional_${uniqueSuffix}@example.com`
            })

            const storedUser =
                findUserById(user.user_id)

            expect(storedUser).toEqual(user)
        })


        test("stores the supplied password hash", () => {
            const uniqueSuffix =
                `${Date.now()}_${Math.random().toString(16).slice(2)}`

            const user = createUser({
                username: `HashUser_${uniqueSuffix}`,
                email: `hash_${uniqueSuffix}@example.com`,
                passwordHash: "my-test-password-hash"
            })

            additionalUserIds.push(user.user_id)

            expect(
                findPasswordHashByUserId(user.user_id)
            ).toBe("my-test-password-hash")
        })


        test("does not return the password hash", () => {
            const uniqueSuffix =
                `${Date.now()}_${Math.random().toString(16).slice(2)}`

            const user = createUser({
                username: `SafeUser_${uniqueSuffix}`,
                email: `safe_${uniqueSuffix}@example.com`,
                passwordHash: "secret-test-hash"
            })

            additionalUserIds.push(user.user_id)

            expect(user)
                .not.toHaveProperty("password_hash")
        })


        test("throws for a duplicate username", () => {
            expect(() => {
                createUser({
                    username: testUser.username,
                    email: `different_${Date.now()}@example.com`,
                    passwordHash: "different-hash"
                })
            }).toThrow("UNIQUE constraint failed")
        })


        test("throws for a duplicate email", () => {
            expect(() => {
                createUser({
                    username: `DifferentUser_${Date.now()}`,
                    email: testUser.email,
                    passwordHash: "different-hash"
                })
            }).toThrow("UNIQUE constraint failed")
        })

    })


    describe("updateUserById", () => {

        test("updates an existing user", () => {
            const newUsername =
                `${testUser.username}_Updated`

            const newEmail =
                `updated_${Date.now()}@example.com`

            const newPasswordHash =
                "updated-password-hash"

            const result = updateUserById(
                testUser.user_id,
                {
                    username: newUsername,
                    email: newEmail,
                    passwordHash: newPasswordHash
                }
            )

            expect(result).toEqual({
                user_id: testUser.user_id,
                username: newUsername,
                email: newEmail
            })

            const storedUser =
                findUserById(testUser.user_id)

            expect(storedUser).toEqual(result)

            expect(
                findPasswordHashByUserId(
                    testUser.user_id
                )
            ).toBe(newPasswordHash)
        })


        test("does not return the password hash", () => {
            const result = updateUserById(
                testUser.user_id,
                {
                    username: testUser.username,
                    email: testUser.email,
                    passwordHash: "new-test-hash"
                }
            )

            expect(result)
                .not.toHaveProperty("password_hash")
        })


        test("returns undefined for a missing user", () => {
            const result = updateUserById(
                999999999,
                {
                    username: "MissingUser",
                    email: "missing@example.com",
                    passwordHash: "missing-hash"
                }
            )

            expect(result).toBeUndefined()
        })

    })


    describe("deleteUserById", () => {

        test("deletes an existing user", () => {
            const deleted =
                deleteUserById(testUser.user_id)

            expect(deleted).toBe(true)

            expect(
                findUserById(testUser.user_id)
            ).toBeUndefined()
        })


        test("deletes the user's characters through cascade", () => {
            const characterId =
                testCharacter.character_id

            const characterName =
                testCharacter.name

            const deleted =
                deleteUserById(testUser.user_id)

            expect(deleted).toBe(true)

            expect(
                findCharacterByUserIdAndName(
                    testUser.user_id,
                    characterName
                )
            ).toBeUndefined()

            /*
             * characterId is intentionally retained here
             * so this test also documents that the character
             * existed before the user was deleted.
             */
            expect(characterId).toBeDefined()
        })


        test("returns false for a missing user", () => {
            const deleted =
                deleteUserById(999999999)

            expect(deleted).toBe(false)
        })

    })


    // --- Character Queries ---

    describe("findCharactersByUserId", () => {

        test("returns the user's characters", () => {
            const characters =
                findCharactersByUserId(
                    testUser.user_id
                )

            expect(Array.isArray(characters))
                .toBe(true)

            expect(
                characters.some(
                    character =>
                        character.character_id ===
                        testCharacter.character_id
                )
            ).toBe(true)
        })


        test("returns standardized character data", () => {
            const characters =
                findCharactersByUserId(
                    testUser.user_id
                )

            const character = characters.find(
                character =>
                    character.character_id ===
                    testCharacter.character_id
            )

            expect(character)
                .toHaveProperty("character_id")

            expect(character)
                .toHaveProperty("user_id")

            expect(character)
                .toHaveProperty("name")

            expect(character)
                .toHaveProperty("max_weight")
        })


        test("returns characters ordered by name", () => {
            createCharacter({
                user_id: testUser.user_id,
                name: "AAA Test Character",
                max_weight: 100
            })

            const characters =
                findCharactersByUserId(
                    testUser.user_id
                )

            const names = characters.map(
                character => character.name
            )

            const sortedNames = [...names].sort(
                (a, b) => a.localeCompare(b)
            )

            expect(names).toEqual(sortedNames)
        })


        test("returns an empty array for a user with no characters", () => {
            const uniqueSuffix =
                `${Date.now()}_${Math.random().toString(16).slice(2)}`

            const additionalUser =
                createUser({
                    username: `EmptyUser_${uniqueSuffix}`,
                    email: `empty_${uniqueSuffix}@example.com`,
                    passwordHash: "test-hash"
                })

            additionalUserIds.push(
                additionalUser.user_id
            )

            const characters =
                findCharactersByUserId(
                    additionalUser.user_id
                )

            expect(characters).toEqual([])
        })

    })


    describe("findCharacterByUserIdAndName", () => {

        test("returns an existing character", () => {
            const character =
                findCharacterByUserIdAndName(
                    testUser.user_id,
                    testCharacter.name
                )

            expect(character).toBeDefined()

            expect(character.character_id)
                .toBe(testCharacter.character_id)

            expect(character.user_id)
                .toBe(testUser.user_id)

            expect(character.name)
                .toBe(testCharacter.name)

            expect(character.max_weight)
                .toBe(testCharacter.max_weight)
        })


        test("returns undefined for a missing character", () => {
            const character =
                findCharacterByUserIdAndName(
                    testUser.user_id,
                    "MissingCharacter"
                )

            expect(character).toBeUndefined()
        })


        test("does not return another user's character", () => {
            const uniqueSuffix =
                `${Date.now()}_${Math.random().toString(16).slice(2)}`

            const additionalUser =
                createUser({
                    username: `OtherUser_${uniqueSuffix}`,
                    email: `other_${uniqueSuffix}@example.com`,
                    passwordHash: "test-hash"
                })

            additionalUserIds.push(
                additionalUser.user_id
            )

            const character =
                findCharacterByUserIdAndName(
                    additionalUser.user_id,
                    testCharacter.name
                )

            expect(character).toBeUndefined()
        })

    })


    describe("createCharacter", () => {

        test("creates a character", () => {
            const character =
                createCharacter({
                    user_id: testUser.user_id,
                    name: `AdditionalCharacter_${Date.now()}`,
                    max_weight: 120
                })

            expect(character)
                .toHaveProperty("character_id")

            expect(character.user_id)
                .toBe(testUser.user_id)

            expect(character.max_weight)
                .toBe(120)

            const storedCharacter =
                findCharacterByUserIdAndName(
                    testUser.user_id,
                    character.name
                )

            expect(storedCharacter)
                .toBeDefined()

            expect(storedCharacter.character_id)
                .toBe(character.character_id)
        })

    })


    describe("updateCharacterById", () => {

        test("updates an existing character", () => {
            const newName =
                `${testCharacter.name}_Updated`

            const result =
                updateCharacterById(
                    testCharacter.character_id,
                    {
                        name: newName,
                        max_weight: 150
                    }
                )

            expect(result).toEqual({
                character_id:
                    testCharacter.character_id,
                name: newName,
                max_weight: 150
            })

            const storedCharacter =
                findCharacterByUserIdAndName(
                    testUser.user_id,
                    newName
                )

            expect(storedCharacter)
                .toBeDefined()

            expect(storedCharacter.max_weight)
                .toBe(150)
        })


        test("returns undefined for a missing character", () => {
            const result =
                updateCharacterById(
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
                deleteCharacterById(
                    testCharacter.character_id
                )

            expect(deleted).toBe(true)

            expect(
                findCharacterByUserIdAndName(
                    testUser.user_id,
                    testCharacter.name
                )
            ).toBeUndefined()
        })


        test("returns false for a missing character", () => {
            const deleted =
                deleteCharacterById(999999999)

            expect(deleted).toBe(false)
        })

    })


    // --- Inventory Queries ---

    describe("createInventoryEntry", () => {

        test("creates a root inventory entry", () => {
            const entry =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.backpack.item_id,
                    parent_inventory_id: null,
                    quantity: 1
                })

            expect(entry)
                .toHaveProperty("inventory_id")

            expect(entry.character_id)
                .toBe(testCharacter.character_id)

            expect(entry.item_id)
                .toBe(testItems.backpack.item_id)

            expect(entry.parent_inventory_id)
                .toBeNull()

            expect(entry.quantity).toBe(1)
        })


        test("creates an inventory entry inside a container", () => {
            const backpack =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.backpack.item_id,
                    parent_inventory_id: null,
                    quantity: 1
                })

            const torch =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.torch.item_id,
                    parent_inventory_id:
                        backpack.inventory_id,
                    quantity: 2
                })

            expect(torch.parent_inventory_id)
                .toBe(backpack.inventory_id)

            expect(torch.quantity).toBe(2)
        })

    })


    describe("findInventoryEntryById", () => {

        test("returns an existing inventory entry", () => {
            const createdEntry =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.backpack.item_id,
                    parent_inventory_id: null,
                    quantity: 1
                })

            const entry =
                findInventoryEntryById(
                    testCharacter.character_id,
                    createdEntry.inventory_id
                )

            expect(entry).toBeDefined()

            expect(entry.inventory_id)
                .toBe(createdEntry.inventory_id)

            expect(entry.character_id)
                .toBe(testCharacter.character_id)

            expect(entry.item_id)
                .toBe(testItems.backpack.item_id)

            expect(entry.parent_inventory_id)
                .toBeNull()

            expect(entry.quantity).toBe(1)

            expect(entry.item_index)
                .toBe("backpack")

            expect(entry.name)
                .toBe("Backpack")
        })


        test("returns standardized inventory and item data", () => {
            const createdEntry =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.backpack.item_id,
                    parent_inventory_id: null,
                    quantity: 1
                })

            const entry =
                findInventoryEntryById(
                    testCharacter.character_id,
                    createdEntry.inventory_id
                )

            expect(entry)
                .toHaveProperty("inventory_id")

            expect(entry)
                .toHaveProperty("character_id")

            expect(entry)
                .toHaveProperty("item_id")

            expect(entry)
                .toHaveProperty("parent_inventory_id")

            expect(entry)
                .toHaveProperty("quantity")

            expect(entry)
                .toHaveProperty("item_index")

            expect(entry)
                .toHaveProperty("name")

            expect(entry)
                .toHaveProperty("description")

            expect(entry)
                .toHaveProperty("weight")

            expect(entry)
                .toHaveProperty("cost_quantity")

            expect(entry)
                .toHaveProperty("currency_code")

            expect(entry)
                .toHaveProperty("currency_name")

            expect(entry)
                .toHaveProperty("item_type_name")
        })


        test("returns undefined for a missing inventory entry", () => {
            const entry =
                findInventoryEntryById(
                    testCharacter.character_id,
                    999999999
                )

            expect(entry).toBeUndefined()
        })


        test("does not return another character's entry", () => {
            const entry =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.backpack.item_id,
                    parent_inventory_id: null,
                    quantity: 1
                })

            const foundEntry =
                findInventoryEntryById(
                    999999999,
                    entry.inventory_id
                )

            expect(foundEntry).toBeUndefined()
        })

    })


    describe("findAllInventoryByCharacterId", () => {

        test("returns root and nested inventory entries", () => {
            const backpack =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.backpack.item_id,
                    parent_inventory_id: null,
                    quantity: 1
                })

            const pouch =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.pouch.item_id,
                    parent_inventory_id:
                        backpack.inventory_id,
                    quantity: 1
                })

            createInventoryEntry({
                character_id:
                    testCharacter.character_id,
                item_id:
                    testItems.torch.item_id,
                parent_inventory_id:
                    pouch.inventory_id,
                quantity: 2
            })

            const inventory =
                findAllInventoryByCharacterId(
                    testCharacter.character_id
                )

            expect(inventory).toHaveLength(3)

            expect(
                inventory.map(
                    entry => entry.item_index
                )
            ).toEqual(
                expect.arrayContaining([
                    "backpack",
                    "pouch",
                    "torch"
                ])
            )
        })


        test("returns inventory ordered by item name", () => {
            createInventoryEntry({
                character_id:
                    testCharacter.character_id,
                item_id:
                    testItems.torch.item_id,
                parent_inventory_id: null,
                quantity: 1
            })

            createInventoryEntry({
                character_id:
                    testCharacter.character_id,
                item_id:
                    testItems.backpack.item_id,
                parent_inventory_id: null,
                quantity: 1
            })

            const inventory =
                findAllInventoryByCharacterId(
                    testCharacter.character_id
                )

            const names = inventory.map(
                entry => entry.name
            )

            const sortedNames = [...names].sort(
                (a, b) => a.localeCompare(b)
            )

            expect(names).toEqual(sortedNames)
        })


        test("returns an empty array for no inventory", () => {
            const inventory =
                findAllInventoryByCharacterId(
                    testCharacter.character_id
                )

            expect(inventory).toEqual([])
        })

    })


    describe("findRootInventoryByCharacterId", () => {

        test("returns only root inventory entries", () => {
            const backpack =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.backpack.item_id,
                    parent_inventory_id: null,
                    quantity: 1
                })

            createInventoryEntry({
                character_id:
                    testCharacter.character_id,
                item_id:
                    testItems.torch.item_id,
                parent_inventory_id:
                    backpack.inventory_id,
                quantity: 2
            })

            const inventory =
                findRootInventoryByCharacterId(
                    testCharacter.character_id
                )

            expect(inventory).toHaveLength(1)

            expect(inventory[0].item_index)
                .toBe("backpack")

            expect(inventory[0].parent_inventory_id)
                .toBeNull()
        })


        test("returns root inventory ordered by name", () => {
            createInventoryEntry({
                character_id:
                    testCharacter.character_id,
                item_id:
                    testItems.torch.item_id,
                parent_inventory_id: null,
                quantity: 1
            })

            createInventoryEntry({
                character_id:
                    testCharacter.character_id,
                item_id:
                    testItems.backpack.item_id,
                parent_inventory_id: null,
                quantity: 1
            })

            const inventory =
                findRootInventoryByCharacterId(
                    testCharacter.character_id
                )

            const names = inventory.map(
                entry => entry.name
            )

            const sortedNames = [...names].sort(
                (a, b) => a.localeCompare(b)
            )

            expect(names).toEqual(sortedNames)
        })


        test("returns an empty array for no inventory", () => {
            const inventory =
                findRootInventoryByCharacterId(
                    testCharacter.character_id
                )

            expect(inventory).toEqual([])
        })

    })


    describe("findInventoryChildren", () => {

        test("returns direct children of a container", () => {
            const backpack =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.backpack.item_id,
                    parent_inventory_id: null,
                    quantity: 1
                })

            createInventoryEntry({
                character_id:
                    testCharacter.character_id,
                item_id:
                    testItems.torch.item_id,
                parent_inventory_id:
                    backpack.inventory_id,
                quantity: 2
            })

            createInventoryEntry({
                character_id:
                    testCharacter.character_id,
                item_id:
                    testItems.pouch.item_id,
                parent_inventory_id:
                    backpack.inventory_id,
                quantity: 1
            })

            const children =
                findInventoryChildren(
                    testCharacter.character_id,
                    backpack.inventory_id
                )

            expect(children).toHaveLength(2)

            expect(
                children.every(
                    entry =>
                        entry.parent_inventory_id ===
                        backpack.inventory_id
                )
            ).toBe(true)
        })


        test("does not return grandchildren", () => {
            const backpack =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.backpack.item_id,
                    parent_inventory_id: null,
                    quantity: 1
                })

            const pouch =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.pouch.item_id,
                    parent_inventory_id:
                        backpack.inventory_id,
                    quantity: 1
                })

            createInventoryEntry({
                character_id:
                    testCharacter.character_id,
                item_id:
                    testItems.torch.item_id,
                parent_inventory_id:
                    pouch.inventory_id,
                quantity: 2
            })

            const children =
                findInventoryChildren(
                    testCharacter.character_id,
                    backpack.inventory_id
                )

            expect(children).toHaveLength(1)

            expect(children[0].item_index)
                .toBe("pouch")
        })


        test("returns children ordered by name", () => {
            const backpack =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.backpack.item_id,
                    parent_inventory_id: null,
                    quantity: 1
                })

            createInventoryEntry({
                character_id:
                    testCharacter.character_id,
                item_id:
                    testItems.torch.item_id,
                parent_inventory_id:
                    backpack.inventory_id,
                quantity: 1
            })

            createInventoryEntry({
                character_id:
                    testCharacter.character_id,
                item_id:
                    testItems.pouch.item_id,
                parent_inventory_id:
                    backpack.inventory_id,
                quantity: 1
            })

            const children =
                findInventoryChildren(
                    testCharacter.character_id,
                    backpack.inventory_id
                )

            const names = children.map(
                entry => entry.name
            )

            const sortedNames = [...names].sort(
                (a, b) => a.localeCompare(b)
            )

            expect(names).toEqual(sortedNames)
        })


        test("returns an empty array for no children", () => {
            const backpack =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.backpack.item_id,
                    parent_inventory_id: null,
                    quantity: 1
                })

            const children =
                findInventoryChildren(
                    testCharacter.character_id,
                    backpack.inventory_id
                )

            expect(children).toEqual([])
        })

    })


    describe("updateInventoryQuantity", () => {

        test("updates an inventory quantity", () => {
            const torch =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.torch.item_id,
                    parent_inventory_id: null,
                    quantity: 2
                })

            const updated =
                updateInventoryQuantity(
                    torch.inventory_id,
                    5
                )

            expect(updated).toEqual({
                inventory_id:
                    torch.inventory_id,
                quantity: 5
            })

            const stored =
                findInventoryEntryById(
                    testCharacter.character_id,
                    torch.inventory_id
                )

            expect(stored.quantity).toBe(5)
        })


        test("returns undefined for a missing entry", () => {
            const updated =
                updateInventoryQuantity(
                    999999999,
                    5
                )

            expect(updated).toBeUndefined()
        })

    })


    describe("moveInventoryEntry", () => {

        test("moves an inventory entry into a container", () => {
            const backpack =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.backpack.item_id,
                    parent_inventory_id: null,
                    quantity: 1
                })

            const torch =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.torch.item_id,
                    parent_inventory_id: null,
                    quantity: 2
                })

            const moved =
                moveInventoryEntry(
                    torch.inventory_id,
                    backpack.inventory_id
                )

            expect(moved).toEqual({
                inventory_id:
                    torch.inventory_id,
                parent_inventory_id:
                    backpack.inventory_id
            })

            const stored =
                findInventoryEntryById(
                    testCharacter.character_id,
                    torch.inventory_id
                )

            expect(stored.parent_inventory_id)
                .toBe(backpack.inventory_id)
        })


        test("moves an inventory entry back to root", () => {
            const backpack =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.backpack.item_id,
                    parent_inventory_id: null,
                    quantity: 1
                })

            const torch =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.torch.item_id,
                    parent_inventory_id:
                        backpack.inventory_id,
                    quantity: 2
                })

            const moved =
                moveInventoryEntry(
                    torch.inventory_id,
                    null
                )

            expect(moved).toEqual({
                inventory_id:
                    torch.inventory_id,
                parent_inventory_id: null
            })

            const stored =
                findInventoryEntryById(
                    testCharacter.character_id,
                    torch.inventory_id
                )

            expect(stored.parent_inventory_id)
                .toBeNull()
        })


        test("returns undefined for a missing entry", () => {
            const moved =
                moveInventoryEntry(
                    999999999,
                    null
                )

            expect(moved).toBeUndefined()
        })

    })


    describe("updateInventoryEntry", () => {

        test("updates quantity and parent atomically", () => {
            const backpack =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.backpack.item_id,
                    parent_inventory_id: null,
                    quantity: 1
                })

            const torch =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.torch.item_id,
                    parent_inventory_id: null,
                    quantity: 2
                })

            const updated =
                updateInventoryEntry(
                    torch.inventory_id,
                    {
                        quantity: 5,
                        parent_inventory_id:
                            backpack.inventory_id
                    }
                )

            expect(updated).toEqual({
                inventory_id:
                    torch.inventory_id,
                quantity: 5,
                parent_inventory_id:
                    backpack.inventory_id
            })

            const stored =
                findInventoryEntryById(
                    testCharacter.character_id,
                    torch.inventory_id
                )

            expect(stored.quantity).toBe(5)

            expect(stored.parent_inventory_id)
                .toBe(backpack.inventory_id)
        })


        test("updates quantity and moves entry back to root", () => {
            const backpack =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.backpack.item_id,
                    parent_inventory_id: null,
                    quantity: 1
                })

            const torch =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.torch.item_id,
                    parent_inventory_id:
                        backpack.inventory_id,
                    quantity: 2
                })

            const updated =
                updateInventoryEntry(
                    torch.inventory_id,
                    {
                        quantity: 7,
                        parent_inventory_id: null
                    }
                )

            expect(updated).toEqual({
                inventory_id:
                    torch.inventory_id,
                quantity: 7,
                parent_inventory_id: null
            })

            const stored =
                findInventoryEntryById(
                    testCharacter.character_id,
                    torch.inventory_id
                )

            expect(stored.quantity).toBe(7)

            expect(stored.parent_inventory_id)
                .toBeNull()
        })


        test("throws for a missing inventory entry", () => {
            expect(() => {
                updateInventoryEntry(
                    999999999,
                    {
                        quantity: 5,
                        parent_inventory_id: null
                    }
                )
            }).toThrow(
                "Inventory entry not found"
            )
        })

    })


    describe("deleteInventoryEntry", () => {

        test("deletes an inventory entry", () => {
            const torch =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.torch.item_id,
                    parent_inventory_id: null,
                    quantity: 2
                })

            const deleted =
                deleteInventoryEntry(
                    torch.inventory_id
                )

            expect(deleted).toBe(true)

            expect(
                findInventoryEntryById(
                    testCharacter.character_id,
                    torch.inventory_id
                )
            ).toBeUndefined()
        })


        test("promotes direct children to root when deleting a container", () => {
            const backpack =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.backpack.item_id,
                    parent_inventory_id: null,
                    quantity: 1
                })

            const pouch =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.pouch.item_id,
                    parent_inventory_id:
                        backpack.inventory_id,
                    quantity: 1
                })

            const deleted =
                deleteInventoryEntry(
                    backpack.inventory_id
                )

            expect(deleted).toBe(true)

            const storedPouch =
                findInventoryEntryById(
                    testCharacter.character_id,
                    pouch.inventory_id
                )

            expect(storedPouch)
                .toBeDefined()

            expect(storedPouch.parent_inventory_id)
                .toBeNull()
        })


        test("preserves deeper nesting when parent is promoted", () => {
            const backpack =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.backpack.item_id,
                    parent_inventory_id: null,
                    quantity: 1
                })

            const pouch =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.pouch.item_id,
                    parent_inventory_id:
                        backpack.inventory_id,
                    quantity: 1
                })

            const torch =
                createInventoryEntry({
                    character_id:
                        testCharacter.character_id,
                    item_id:
                        testItems.torch.item_id,
                    parent_inventory_id:
                        pouch.inventory_id,
                    quantity: 2
                })

            deleteInventoryEntry(
                backpack.inventory_id
            )

            const storedPouch =
                findInventoryEntryById(
                    testCharacter.character_id,
                    pouch.inventory_id
                )

            const storedTorch =
                findInventoryEntryById(
                    testCharacter.character_id,
                    torch.inventory_id
                )

            expect(storedPouch.parent_inventory_id)
                .toBeNull()

            expect(storedTorch.parent_inventory_id)
                .toBe(pouch.inventory_id)
        })


        test("returns false for a missing inventory entry", () => {
            const deleted =
                deleteInventoryEntry(999999999)

            expect(deleted).toBe(false)
        })

    })

})