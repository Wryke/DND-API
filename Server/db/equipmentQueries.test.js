const {
    findAllEquipmentSlots,
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


    // --- findAllEquipmentSlots ---

    describe("findAllEquipmentSlots", () => {
        test("returns all equipment slots", () => {
            const slots = findAllEquipmentSlots()

            expect(Array.isArray(slots)).toBe(true)
            expect(slots).toHaveLength(11)
        })

        test("returns equipment slot IDs, indexes, and names", () => {
            const slots = findAllEquipmentSlots()

            const mainHand = slots.find(
                slot => slot.equipment_slot_index === "main_hand"
            )

            expect(mainHand).toBeDefined()
            expect(mainHand.equipment_slot_id).toBe(1)
            expect(mainHand.equipment_slot_index)
                .toBe("main_hand")
            expect(mainHand.equipment_slot_name)
                .toBe("Main Hand")
        })

        test("returns equipment slots ordered by ID", () => {
            const slots = findAllEquipmentSlots()

            for (let i = 1; i < slots.length; i++) {
                expect(
                    slots[i].equipment_slot_id
                ).toBeGreaterThan(
                    slots[i - 1].equipment_slot_id
                )
            }
        })
    })


    // --- findEquipmentSlotById ---

    describe("findEquipmentSlotById", () => {
        test("returns an existing equipment slot", () => {
            const slot = findEquipmentSlotById(1)

            expect(slot).toBeDefined()
            expect(slot.equipment_slot_id).toBe(1)
            expect(slot.equipment_slot_index)
                .toBe("main_hand")
            expect(slot.equipment_slot_name)
                .toBe("Main Hand")
        })

        test("returns undefined for a missing equipment slot", () => {
            const slot = findEquipmentSlotById(999999999)

            expect(slot).toBeUndefined()
        })
    })


    // --- findEquipmentEntryBySlot ---

    describe("findEquipmentEntryBySlot", () => {
        test("returns equipment occupying a slot", () => {
            const created = createEquipmentEntry(
                testCharacter.character_id,
                testInventory.longsword.inventory_id,
                1
            )

            const equipment = findEquipmentEntryBySlot(
                testCharacter.character_id,
                1
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

            expect(equipment.equipment_slot_id).toBe(1)
            expect(equipment.equipment_slot_index)
                .toBe("main_hand")
            expect(equipment.equipment_slot_name)
                .toBe("Main Hand")
        })

        test("returns undefined when the slot is empty", () => {
            const equipment = findEquipmentEntryBySlot(
                testCharacter.character_id,
                1
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

            createEquipmentEntry(
                testCharacter.character_id,
                testInventory.longsword.inventory_id,
                1
            )

            const equipment = findEquipmentEntryBySlot(
                otherCharacter.character_id,
                1
            )

            expect(equipment).toBeUndefined()
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
                1
            )

            createEquipmentEntry(
                testCharacter.character_id,
                testInventory.shield.inventory_id,
                2
            )

            const equipment =
                findAllEquipment(testCharacter.character_id)

            expect(Array.isArray(equipment)).toBe(true)
            expect(equipment).toHaveLength(2)

            const longsword = equipment.find(
                entry =>
                    entry.inventory_id ===
                    testInventory.longsword.inventory_id
            )

            const shield = equipment.find(
                entry =>
                    entry.inventory_id ===
                    testInventory.shield.inventory_id
            )

            expect(longsword).toBeDefined()
            expect(longsword.item_id)
                .toBe(testItems.longsword.item_id)
            expect(longsword.item_index)
                .toBe(testItems.longsword.item_index)
            expect(longsword.name)
                .toBe(testItems.longsword.name)
            expect(longsword.equipment_slot_id).toBe(1)
            expect(longsword.equipment_slot_index)
                .toBe("main_hand")
            expect(longsword.equipment_slot_name)
                .toBe("Main Hand")

            expect(shield).toBeDefined()
            expect(shield.item_id)
                .toBe(testItems.shield.item_id)
            expect(shield.item_index)
                .toBe(testItems.shield.item_index)
            expect(shield.name)
                .toBe(testItems.shield.name)
            expect(shield.equipment_slot_id).toBe(2)
            expect(shield.equipment_slot_index)
                .toBe("off_hand")
            expect(shield.equipment_slot_name)
                .toBe("Off Hand")
        })
    })


    // --- findEquipmentEntryById ---

    describe("findEquipmentEntryById", () => {
        test("returns an existing equipment entry", () => {
            const created = createEquipmentEntry(
                testCharacter.character_id,
                testInventory.longsword.inventory_id,
                1
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

            expect(equipment.equipment_slot_id).toBe(1)
            expect(equipment.equipment_slot_index)
                .toBe("main_hand")
            expect(equipment.equipment_slot_name)
                .toBe("Main Hand")
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
                1
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
                1
            )

            expect(equipment).toHaveProperty("equipment_id")
            expect(equipment.character_id)
                .toBe(testCharacter.character_id)
            expect(equipment.inventory_id)
                .toBe(testInventory.longsword.inventory_id)
            expect(equipment.equipment_slot_id)
                .toBe(1)

            const storedEquipment = findEquipmentEntryById(
                testCharacter.character_id,
                equipment.equipment_id
            )

            expect(storedEquipment).toBeDefined()
            expect(storedEquipment.name)
                .toBe(testItems.longsword.name)
            expect(storedEquipment.equipment_slot_id)
                .toBe(1)
            expect(storedEquipment.equipment_slot_index)
                .toBe("main_hand")
            expect(storedEquipment.equipment_slot_name)
                .toBe("Main Hand")
        })

        test("throws when the equipment slot is already occupied", () => {
            createEquipmentEntry(
                testCharacter.character_id,
                testInventory.longsword.inventory_id,
                1
            )

            expect(() => {
                createEquipmentEntry(
                    testCharacter.character_id,
                    testInventory.shield.inventory_id,
                    1
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
                    1
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
                1
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
                1
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