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
    deleteCharacterById,

    findInventoryEntryById,
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
            password: "testpass"
        })

        testCharacter = createCharacter({
            user_id: testUser.user_id,
            name: `TestCharacter_${uniqueSuffix}`,
            max_weight: 100
        })

        /*
         * These are existing item definitions from the seeded items table.
         * They are not owned inventory entries and should not be deleted
         * after each test.
         */
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
         * Deleting the test user also deletes the test character and
         * inventory entries through ON DELETE CASCADE.
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
            expect(user.username).toBe(testUser.username)
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
            expect(user.username)
                .toContain("TestUser_Additional_")

            const storedUser = findUserById(user.user_id)

            expect(storedUser).toBeDefined()
            expect(storedUser.username).toBe(user.username)
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
            expect(findUserById(testUser.user_id))
                .toBeUndefined()
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

        test("returns characters ordered by name", () => {
            createCharacter({
                user_id: testUser.user_id,
                name: "AAA Test Character",
                max_weight: 100
            })

            const characters =
                findCharactersByUserId(testUser.user_id)

            const names = characters.map(
                character => character.name
            )

            const sortedNames = [...names].sort((a, b) =>
                a.localeCompare(b)
            )

            expect(names).toEqual(sortedNames)
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
            expect(character.max_weight)
                .toBe(testCharacter.max_weight)
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

            const storedCharacter =
                findCharacterByUserIdAndName(
                    testUser.user_id,
                    character.name
                )

            expect(storedCharacter).toBeDefined()
            expect(storedCharacter.character_id)
                .toBe(character.character_id)
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

    // --- Inventory Queries ---

    describe("createInventoryEntry", () => {
        test("creates a root inventory entry", () => {
            const entry = createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.backpack.item_id,
                parent_inventory_id: null,
                quantity: 1
            })

            expect(entry).toHaveProperty("inventory_id")
            expect(entry.character_id)
                .toBe(testCharacter.character_id)
            expect(entry.item_id)
                .toBe(testItems.backpack.item_id)
            expect(entry.parent_inventory_id).toBeNull()
            expect(entry.quantity).toBe(1)
        })

        test("creates an inventory entry inside a container", () => {
            const backpack = createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.backpack.item_id,
                parent_inventory_id: null,
                quantity: 1
            })

            const torch = createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.torch.item_id,
                parent_inventory_id: backpack.inventory_id,
                quantity: 2
            })

            expect(torch.parent_inventory_id)
                .toBe(backpack.inventory_id)
            expect(torch.quantity).toBe(2)
        })
    })

    describe("findInventoryEntryById", () => {
        test("returns an existing inventory entry", () => {
            const createdEntry = createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.backpack.item_id,
                parent_inventory_id: null,
                quantity: 1
            })

            const entry = findInventoryEntryById(
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
            expect(entry.parent_inventory_id).toBeNull()
            expect(entry.quantity).toBe(1)

            expect(entry.item_index).toBe("backpack")
            expect(entry.name).toBe("Backpack")
        })

        test("returns standardized item data", () => {
            const createdEntry = createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.backpack.item_id,
                parent_inventory_id: null,
                quantity: 1
            })

            const entry = findInventoryEntryById(
                testCharacter.character_id,
                createdEntry.inventory_id
            )

            expect(entry).toHaveProperty("item_index")
            expect(entry).toHaveProperty("name")
            expect(entry).toHaveProperty("description")
            expect(entry).toHaveProperty("weight")
            expect(entry).toHaveProperty("cost_quantity")
            expect(entry).toHaveProperty("currency_code")
            expect(entry).toHaveProperty("currency_name")
            expect(entry).toHaveProperty("item_type_name")
        })

        test("returns undefined for a missing inventory entry", () => {
            const entry = findInventoryEntryById(
                testCharacter.character_id,
                999999999
            )

            expect(entry).toBeUndefined()
        })

        test("does not return an entry owned by another character", () => {
            const entry = createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.backpack.item_id,
                parent_inventory_id: null,
                quantity: 1
            })

            const foundEntry = findInventoryEntryById(
                999999999,
                entry.inventory_id
            )

            expect(foundEntry).toBeUndefined()
        })
    })

    describe("findRootInventoryByCharacterId", () => {
        test("returns only root inventory entries", () => {
            const backpack = createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.backpack.item_id,
                parent_inventory_id: null,
                quantity: 1
            })

            createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.torch.item_id,
                parent_inventory_id: backpack.inventory_id,
                quantity: 2
            })

            const rootInventory =
                findRootInventoryByCharacterId(
                    testCharacter.character_id
                )

            expect(Array.isArray(rootInventory)).toBe(true)
            expect(rootInventory).toHaveLength(1)
            expect(rootInventory[0].item_index)
                .toBe("backpack")
            expect(rootInventory[0].parent_inventory_id)
                .toBeNull()
        })

        test("returns standardized item data", () => {
            createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.backpack.item_id,
                parent_inventory_id: null,
                quantity: 1
            })

            const rootInventory =
                findRootInventoryByCharacterId(
                    testCharacter.character_id
                )

            expect(rootInventory[0])
                .toHaveProperty("inventory_id")
            expect(rootInventory[0])
                .toHaveProperty("character_id")
            expect(rootInventory[0])
                .toHaveProperty("item_id")
            expect(rootInventory[0])
                .toHaveProperty("parent_inventory_id")
            expect(rootInventory[0])
                .toHaveProperty("quantity")

            expect(rootInventory[0])
                .toHaveProperty("item_index")
            expect(rootInventory[0])
                .toHaveProperty("name")
            expect(rootInventory[0])
                .toHaveProperty("description")
            expect(rootInventory[0])
                .toHaveProperty("weight")
            expect(rootInventory[0])
                .toHaveProperty("cost_quantity")
            expect(rootInventory[0])
                .toHaveProperty("currency_code")
            expect(rootInventory[0])
                .toHaveProperty("currency_name")
            expect(rootInventory[0])
                .toHaveProperty("item_type_name")
        })

        test("returns an empty array when the character has no inventory", () => {
            const rootInventory =
                findRootInventoryByCharacterId(
                    testCharacter.character_id
                )

            expect(rootInventory).toEqual([])
        })

        test("returns root inventory ordered by name", () => {
            createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.torch.item_id,
                parent_inventory_id: null,
                quantity: 1
            })

            createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.backpack.item_id,
                parent_inventory_id: null,
                quantity: 1
            })

            const rootInventory =
                findRootInventoryByCharacterId(
                    testCharacter.character_id
                )

            const names = rootInventory.map(
                entry => entry.name
            )

            const sortedNames = [...names].sort((a, b) =>
                a.localeCompare(b)
            )

            expect(names).toEqual(sortedNames)
        })
    })

    describe("findInventoryChildren", () => {
        test("returns the direct children of a container", () => {
            const backpack = createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.backpack.item_id,
                parent_inventory_id: null,
                quantity: 1
            })

            createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.torch.item_id,
                parent_inventory_id: backpack.inventory_id,
                quantity: 2
            })

            createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.pouch.item_id,
                parent_inventory_id: backpack.inventory_id,
                quantity: 1
            })

            const children = findInventoryChildren(
                testCharacter.character_id,
                backpack.inventory_id
            )

            expect(Array.isArray(children)).toBe(true)
            expect(children).toHaveLength(2)

            expect(
                children.every(entry =>
                    entry.parent_inventory_id ===
                    backpack.inventory_id
                )
            ).toBe(true)
        })

        test("returns standardized item data", () => {
            const backpack = createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.backpack.item_id,
                parent_inventory_id: null,
                quantity: 1
            })

            createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.torch.item_id,
                parent_inventory_id: backpack.inventory_id,
                quantity: 2
            })

            const children = findInventoryChildren(
                testCharacter.character_id,
                backpack.inventory_id
            )

            expect(children[0]).toHaveProperty("item_index")
            expect(children[0]).toHaveProperty("name")
            expect(children[0]).toHaveProperty("description")
            expect(children[0]).toHaveProperty("weight")
            expect(children[0]).toHaveProperty("cost_quantity")
            expect(children[0]).toHaveProperty("currency_code")
            expect(children[0]).toHaveProperty("currency_name")
            expect(children[0]).toHaveProperty("item_type_name")
        })

        test("returns an empty array when the container has no children", () => {
            const backpack = createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.backpack.item_id,
                parent_inventory_id: null,
                quantity: 1
            })

            const children = findInventoryChildren(
                testCharacter.character_id,
                backpack.inventory_id
            )

            expect(children).toEqual([])
        })

        test("returns children ordered by name", () => {
            const backpack = createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.backpack.item_id,
                parent_inventory_id: null,
                quantity: 1
            })

            createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.torch.item_id,
                parent_inventory_id: backpack.inventory_id,
                quantity: 1
            })

            createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.pouch.item_id,
                parent_inventory_id: backpack.inventory_id,
                quantity: 1
            })

            const children = findInventoryChildren(
                testCharacter.character_id,
                backpack.inventory_id
            )

            const names = children.map(
                entry => entry.name
            )

            const sortedNames = [...names].sort((a, b) =>
                a.localeCompare(b)
            )

            expect(names).toEqual(sortedNames)
        })
    })

    describe("updateInventoryQuantity", () => {
        test("updates an existing inventory quantity", () => {
            const torch = createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.torch.item_id,
                parent_inventory_id: null,
                quantity: 2
            })

            const updated = updateInventoryQuantity(
                torch.inventory_id,
                5
            )

            expect(updated).toEqual({
                inventory_id: torch.inventory_id,
                quantity: 5
            })

            const storedEntry = findInventoryEntryById(
                testCharacter.character_id,
                torch.inventory_id
            )

            expect(storedEntry.quantity).toBe(5)
        })

        test("returns undefined for a missing inventory entry", () => {
            const updated = updateInventoryQuantity(
                999999999,
                5
            )

            expect(updated).toBeUndefined()
        })
    })

    describe("moveInventoryEntry", () => {
        test("moves an inventory entry into a container", () => {
            const backpack = createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.backpack.item_id,
                parent_inventory_id: null,
                quantity: 1
            })

            const torch = createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.torch.item_id,
                parent_inventory_id: null,
                quantity: 2
            })

            const moved = moveInventoryEntry(
                torch.inventory_id,
                backpack.inventory_id
            )

            expect(moved).toEqual({
                inventory_id: torch.inventory_id,
                parent_inventory_id: backpack.inventory_id
            })

            const storedEntry = findInventoryEntryById(
                testCharacter.character_id,
                torch.inventory_id
            )

            expect(storedEntry.parent_inventory_id)
                .toBe(backpack.inventory_id)
        })

        test("moves an inventory entry back to the root", () => {
            const backpack = createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.backpack.item_id,
                parent_inventory_id: null,
                quantity: 1
            })

            const torch = createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.torch.item_id,
                parent_inventory_id: backpack.inventory_id,
                quantity: 2
            })

            const moved = moveInventoryEntry(
                torch.inventory_id,
                null
            )

            expect(moved).toEqual({
                inventory_id: torch.inventory_id,
                parent_inventory_id: null
            })

            const storedEntry = findInventoryEntryById(
                testCharacter.character_id,
                torch.inventory_id
            )

            expect(storedEntry.parent_inventory_id)
                .toBeNull()
        })

        test("returns undefined for a missing inventory entry", () => {
            const moved = moveInventoryEntry(
                999999999,
                null
            )

            expect(moved).toBeUndefined()
        })
    })

    describe("updateInventoryEntry", () => {
        test("updates quantity and parent inventory together", () => {
            const backpack = createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.backpack.item_id,
                parent_inventory_id: null,
                quantity: 1
            })

            const torch = createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.torch.item_id,
                parent_inventory_id: null,
                quantity: 2
            })

            const updated = updateInventoryEntry(
                torch.inventory_id,
                {
                    quantity: 5,
                    parent_inventory_id:
                        backpack.inventory_id
                }
            )

            expect(updated).toEqual({
                inventory_id: torch.inventory_id,
                quantity: 5,
                parent_inventory_id:
                    backpack.inventory_id
            })

            const storedEntry = findInventoryEntryById(
                testCharacter.character_id,
                torch.inventory_id
            )

            expect(storedEntry.quantity).toBe(5)
            expect(storedEntry.parent_inventory_id)
                .toBe(backpack.inventory_id)
        })

        test("updates quantity and moves an entry back to root", () => {
            const backpack = createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.backpack.item_id,
                parent_inventory_id: null,
                quantity: 1
            })

            const torch = createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.torch.item_id,
                parent_inventory_id:
                    backpack.inventory_id,
                quantity: 2
            })

            const updated = updateInventoryEntry(
                torch.inventory_id,
                {
                    quantity: 7,
                    parent_inventory_id: null
                }
            )

            expect(updated).toEqual({
                inventory_id: torch.inventory_id,
                quantity: 7,
                parent_inventory_id: null
            })

            const storedEntry = findInventoryEntryById(
                testCharacter.character_id,
                torch.inventory_id
            )

            expect(storedEntry.quantity).toBe(7)
            expect(storedEntry.parent_inventory_id)
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
            }).toThrow("Inventory entry not found")
        })
    })

    describe("deleteInventoryEntry", () => {
        test("deletes an existing inventory entry", () => {
            const torch = createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.torch.item_id,
                parent_inventory_id: null,
                quantity: 2
            })

            const deleted = deleteInventoryEntry(
                torch.inventory_id
            )

            expect(deleted).toBe(true)

            const storedEntry = findInventoryEntryById(
                testCharacter.character_id,
                torch.inventory_id
            )

            expect(storedEntry).toBeUndefined()
        })

        test("promotes direct children to the root when deleting a container", () => {
            const backpack = createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.backpack.item_id,
                parent_inventory_id: null,
                quantity: 1
            })

            const pouch = createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.pouch.item_id,
                parent_inventory_id: backpack.inventory_id,
                quantity: 1
            })

            const deleted = deleteInventoryEntry(
                backpack.inventory_id
            )

            expect(deleted).toBe(true)

            const storedPouch = findInventoryEntryById(
                testCharacter.character_id,
                pouch.inventory_id
            )

            expect(storedPouch).toBeDefined()
            expect(storedPouch.parent_inventory_id)
                .toBeNull()
        })

        test("preserves nested children when their parent is promoted", () => {
            const backpack = createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.backpack.item_id,
                parent_inventory_id: null,
                quantity: 1
            })

            const pouch = createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.pouch.item_id,
                parent_inventory_id: backpack.inventory_id,
                quantity: 1
            })

            const torch = createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.torch.item_id,
                parent_inventory_id: pouch.inventory_id,
                quantity: 2
            })

            deleteInventoryEntry(backpack.inventory_id)

            const storedPouch = findInventoryEntryById(
                testCharacter.character_id,
                pouch.inventory_id
            )

            const storedTorch = findInventoryEntryById(
                testCharacter.character_id,
                torch.inventory_id
            )

            expect(storedPouch.parent_inventory_id)
                .toBeNull()

            expect(storedTorch.parent_inventory_id)
                .toBe(pouch.inventory_id)
        })

        test("returns false for a missing inventory entry", () => {
            const deleted = deleteInventoryEntry(999999999)

            expect(deleted).toBe(false)
        })
    })
})