const {
    findEquipmentSlotById,
    findEquipmentEntryBySlot,
    findAllEquipment,
    findEquipmentEntryById,
    createEquipmentEntry,
    deleteEquipmentEntryById
} = require("./equipmentQueries")

const {
    createUser,
    deleteUserById,
    createCharacter,
    createInventoryEntry
} = require("./userQueries")

const {
    findItemByIndex
} = require("./itemQueries")


describe("Database Equipment Queries", () => {
    let testUser
    let testCharacter
    let testItems
    let testInventory

    beforeEach(() => {
        const uniqueSuffix =
            `${Date.now()}_${Math.random().toString(16).slice(2)}`

        testUser = createUser({
            username: `EquipmentTestUser_${uniqueSuffix}`,
            password: "testpass"
        })

        testCharacter = createCharacter({
            user_id: testUser.user_id,
            name: `EquipmentTestCharacter_${uniqueSuffix}`,
            max_weight: 100
        })

        /*
         * Use existing seeded item definitions.
         */
        testItems = {
            longsword: findItemByIndex("longsword"),
            shield: findItemByIndex("shield")
        }

        expect(testItems.longsword).toBeDefined()
        expect(testItems.shield).toBeDefined()

        /*
         * Create inventory entries owned by our test character.
         */
        testInventory = {
            longsword: createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.longsword.item_id,
                parent_inventory_id: null,
                quantity: 1
            }),

            shield: createInventoryEntry({
                character_id: testCharacter.character_id,
                item_id: testItems.shield.item_id,
                parent_inventory_id: null,
                quantity: 1
            })
        }
    })

    afterEach(() => {
        /*
         * Deleting the user cascades through:
         *
         * user
         *   -> character
         *       -> inventory
         *           -> equipment
         *
         * so no manual equipment cleanup is necessary.
         */
        deleteUserById(testUser.user_id)
    })

    // --- find equipment by slot ---

    describe("findEquipmentSlotById", () => {
        test("returns an existing equipment slot", () => {
            const slot = findEquipmentSlotById(10)

            expect(slot).toBeDefined()
            expect(slot.equipment_slot_id).toBe(10)
            expect(slot.equipment_slot_name).toBe("main_hand")
        })

        test("returns undefined for a missing equipment slot", () => {
            const slot = findEquipmentSlotById(999999999)

            expect(slot).toBeUndefined()
        })
    })

    // --- findAllEquipment ---

    describe("findAllEquipment", () => {
        test("returns an empty array when the character has no equipment", () => {
            const equipment =
                findAllEquipment(testCharacter.character_id)

            expect(Array.isArray(equipment)).toBe(true)
            expect(equipment).toHaveLength(0)
        })

        test("returns all equipment belonging to a character", () => {
            createEquipmentEntry(
                testCharacter.character_id,
                testInventory.longsword.inventory_id,
                10
            )

            createEquipmentEntry(
                testCharacter.character_id,
                testInventory.shield.inventory_id,
                11
            )

            const equipment =
                findAllEquipment(testCharacter.character_id)

            expect(Array.isArray(equipment)).toBe(true)
            expect(equipment).toHaveLength(2)

            expect(
                equipment.some(entry =>
                    entry.inventory_id ===
                    testInventory.longsword.inventory_id
                )
            ).toBe(true)

            expect(
                equipment.some(entry =>
                    entry.inventory_id ===
                    testInventory.shield.inventory_id
                )
            ).toBe(true)
        })
    })


    // --- findEquipmentEntryById ---

    describe("findEquipmentEntryById", () => {
        test("returns an existing equipment entry", () => {
            const created = createEquipmentEntry(
                testCharacter.character_id,
                testInventory.longsword.inventory_id,
                10
            )

            const equipment = findEquipmentEntryById(
                testCharacter.character_id,
                created.equipment_id
            )

            expect(equipment).toBeDefined()
            expect(equipment.equipment_id)
                .toBe(created.equipment_id)
            expect(equipment.inventory_id)
                .toBe(testInventory.longsword.inventory_id)
            expect(equipment.item_id)
                .toBe(testItems.longsword.item_id)
            expect(equipment.item_index)
                .toBe(testItems.longsword.item_index)
            expect(equipment.name)
                .toBe(testItems.longsword.name)
            expect(equipment.equipment_slot_name)
                .toBe("main_hand")
        })

        test("returns undefined for a missing equipment entry", () => {
            const equipment = findEquipmentEntryById(
                testCharacter.character_id,
                999999999
            )

            expect(equipment).toBeUndefined()
        })

        test("does not return equipment belonging to another character", () => {
            const uniqueSuffix =
                `${Date.now()}_${Math.random().toString(16).slice(2)}`

            const otherCharacter = createCharacter({
                user_id: testUser.user_id,
                name: `OtherEquipmentCharacter_${uniqueSuffix}`,
                max_weight: 100
            })

            const created = createEquipmentEntry(
                testCharacter.character_id,
                testInventory.longsword.inventory_id,
                10
            )

            const equipment = findEquipmentEntryById(
                otherCharacter.character_id,
                created.equipment_id
            )

            expect(equipment).toBeUndefined()
        })
    })


    // --- createEquipmentEntry ---

    describe("createEquipmentEntry", () => {
        test("creates a new equipment entry", () => {
            const equipment = createEquipmentEntry(
                testCharacter.character_id,
                testInventory.longsword.inventory_id,
                10
            )

            expect(equipment).toHaveProperty("equipment_id")
            expect(equipment.character_id)
                .toBe(testCharacter.character_id)
            expect(equipment.inventory_id)
                .toBe(testInventory.longsword.inventory_id)
            expect(equipment.equipment_slot_id)
                .toBe(10)

            const storedEquipment = findEquipmentEntryById(
                testCharacter.character_id,
                equipment.equipment_id
            )

            expect(storedEquipment).toBeDefined()
            expect(storedEquipment.name)
                .toBe(testItems.longsword.name)
            expect(storedEquipment.equipment_slot_name)
                .toBe("main_hand")
        })

        test("throws when the equipment slot is already occupied", () => {
            createEquipmentEntry(
                testCharacter.character_id,
                testInventory.longsword.inventory_id,
                10
            )

            expect(() => {
                createEquipmentEntry(
                    testCharacter.character_id,
                    testInventory.shield.inventory_id,
                    10
                )
            }).toThrow("UNIQUE constraint failed")
        })

        test("throws when the inventory belongs to another character", () => {
            const uniqueSuffix =
                `${Date.now()}_${Math.random().toString(16).slice(2)}`

            const otherCharacter = createCharacter({
                user_id: testUser.user_id,
                name: `OtherEquipmentCharacter_${uniqueSuffix}`,
                max_weight: 100
            })

            expect(() => {
                createEquipmentEntry(
                    otherCharacter.character_id,
                    testInventory.longsword.inventory_id,
                    10
                )
            }).toThrow("FOREIGN KEY constraint failed")
        })

        test("throws when the equipment slot does not exist", () => {
            expect(() => {
                createEquipmentEntry(
                    testCharacter.character_id,
                    testInventory.longsword.inventory_id,
                    999999999
                )
            }).toThrow("FOREIGN KEY constraint failed")
        })
    })


    // --- deleteEquipmentEntryById ---

    describe("deleteEquipmentEntryById", () => {
        test("deletes an existing equipment entry", () => {
            const created = createEquipmentEntry(
                testCharacter.character_id,
                testInventory.longsword.inventory_id,
                10
            )

            const result = deleteEquipmentEntryById(
                testCharacter.character_id,
                created.equipment_id
            )

            expect(result.changes).toBe(1)

            const deleted = findEquipmentEntryById(
                testCharacter.character_id,
                created.equipment_id
            )

            expect(deleted).toBeUndefined()
        })

        test("does not delete equipment belonging to another character", () => {
            const uniqueSuffix =
                `${Date.now()}_${Math.random().toString(16).slice(2)}`

            const otherCharacter = createCharacter({
                user_id: testUser.user_id,
                name: `OtherEquipmentCharacter_${uniqueSuffix}`,
                max_weight: 100
            })

            const created = createEquipmentEntry(
                testCharacter.character_id,
                testInventory.longsword.inventory_id,
                10
            )

            const result = deleteEquipmentEntryById(
                otherCharacter.character_id,
                created.equipment_id
            )

            expect(result.changes).toBe(0)

            const equipment = findEquipmentEntryById(
                testCharacter.character_id,
                created.equipment_id
            )

            expect(equipment).toBeDefined()
        })

        test("returns zero changes for a missing equipment entry", () => {
            const result = deleteEquipmentEntryById(
                testCharacter.character_id,
                999999999
            )

            expect(result.changes).toBe(0)
        })
    })
})