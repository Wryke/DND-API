const request = require("supertest")
const app = require("../app")
const db = require("../db/connection.js")


describe("Equipment Routes", () => {
    let testUser
    let testCharacter
    let agent

    const TEST_PASSWORD = "testpass"


    beforeEach(async () => {
        const uniqueSuffix =
            `${Date.now()}_${Math.random().toString(16).slice(2)}`

        agent = request.agent(app)

        const userResponse = await agent
            .post("/users")
            .send({
                username: `EquipmentTestUser_${uniqueSuffix}`,
                email: `equipment_${uniqueSuffix}@example.com`,
                password: TEST_PASSWORD
            })

        expect(userResponse.status).toBe(201)

        testUser = userResponse.body

        const loginResponse = await agent
            .post("/auth/login")
            .send({
                email: testUser.email,
                password: TEST_PASSWORD
            })

        expect(loginResponse.status).toBe(200)

        const characterResponse = await agent
            .post("/characters")
            .send({
                name: `EquipmentTestCharacter_${uniqueSuffix}`,
                max_weight: 1000
            })

        expect(characterResponse.status).toBe(201)

        testCharacter = characterResponse.body
    })


    afterEach(() => {
        db.prepare(`
            DELETE FROM users
            WHERE user_id = ?
        `).run(testUser.user_id)
    })


    // --- Test Helpers ---

    const createInventoryEntry = async (
        itemIndex,
        quantity = 1,
        parentInventoryId = null
    ) => {
        const response = await agent
            .post(
                `/characters/${encodeURIComponent(testCharacter.name)}/inventory`
            )
            .send({
                item_index: itemIndex,
                parent_inventory_id: parentInventoryId,
                quantity
            })

        expect(response.status).toBe(201)

        return response.body
    }


    const equipItem = async (
        inventoryId,
        equipmentSlotId
    ) => {
        const response = await agent
            .post(
                `/characters/${encodeURIComponent(testCharacter.name)}/equipment`
            )
            .send({
                inventory_id: inventoryId,
                equipment_slot_id: equipmentSlotId
            })

        expect(response.status).toBe(201)

        return response.body
    }


    // --- GET /characters/:name/equipment ---

    describe("GET /characters/:name/equipment", () => {

        test("returns an empty array when the character has no equipment", async () => {
            const response = await agent
                .get(
                    `/characters/${encodeURIComponent(testCharacter.name)}/equipment`
                )

            expect(response.status).toBe(200)
            expect(response.body).toEqual([])
        })


        test("returns all equipment for the character", async () => {
            const longsword =
                await createInventoryEntry("longsword")

            const shield =
                await createInventoryEntry("shield")

            const mainHand =
                await equipItem(longsword.inventory_id, 1)

            const offHand =
                await equipItem(shield.inventory_id, 2)

            const response = await agent
                .get(
                    `/characters/${encodeURIComponent(testCharacter.name)}/equipment`
                )

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
            expect(response.body).toHaveLength(2)

            const returnedMainHand = response.body.find(
                entry =>
                    entry.equipment_id ===
                    mainHand.equipment_id
            )

            const returnedOffHand = response.body.find(
                entry =>
                    entry.equipment_id ===
                    offHand.equipment_id
            )

            expect(returnedMainHand).toBeDefined()
            expect(returnedOffHand).toBeDefined()

            expect(returnedMainHand.inventory_id)
                .toBe(longsword.inventory_id)

            expect(returnedMainHand.equipment_slot_id)
                .toBe(1)

            expect(returnedMainHand.equipment_slot_index)
                .toBe("main_hand")

            expect(returnedMainHand.equipment_slot_name)
                .toBe("Main Hand")

            expect(returnedOffHand.inventory_id)
                .toBe(shield.inventory_id)

            expect(returnedOffHand.equipment_slot_id)
                .toBe(2)
        })


        test("returns 404 for a missing character", async () => {
            const response = await agent
                .get(
                    "/characters/DoesNotExist/equipment"
                )

            expect(response.status).toBe(404)
            expect(response.body.error).toBe(
                "Character not found"
            )
        })


        test("rejects an unauthenticated request", async () => {
            const response = await request(app)
                .get(
                    `/characters/${encodeURIComponent(testCharacter.name)}/equipment`
                )

            expect(response.status).toBe(401)
            expect(response.body.error).toBe(
                "Not authenticated"
            )
        })

    })


    // --- GET /characters/:name/equipment/compatible/:slotId ---

    describe(
        "GET /characters/:name/equipment/compatible/:slotId",
        () => {

            test("returns compatible inventory for the selected slot", async () => {
                const longsword =
                    await createInventoryEntry("longsword")

                const response = await agent
                    .get(
                        `/characters/${encodeURIComponent(testCharacter.name)}/equipment/compatible/1`
                    )

                expect(response.status).toBe(200)
                expect(Array.isArray(response.body)).toBe(true)

                const result = response.body.find(
                    entry =>
                        entry.inventory_id ===
                        longsword.inventory_id
                )

                expect(result).toBeDefined()
            })


            test("does not return incompatible inventory", async () => {
                const torch =
                    await createInventoryEntry("torch")

                const response = await agent
                    .get(
                        `/characters/${encodeURIComponent(testCharacter.name)}/equipment/compatible/1`
                    )

                expect(response.status).toBe(200)

                const result = response.body.find(
                    entry =>
                        entry.inventory_id ===
                        torch.inventory_id
                )

                expect(result).toBeUndefined()
            })


            test("does not return an item that is already equipped", async () => {
                const longsword =
                    await createInventoryEntry("longsword")

                await equipItem(
                    longsword.inventory_id,
                    1
                )

                const response = await agent
                    .get(
                        `/characters/${encodeURIComponent(testCharacter.name)}/equipment/compatible/2`
                    )

                expect(response.status).toBe(200)

                const result = response.body.find(
                    entry =>
                        entry.inventory_id ===
                        longsword.inventory_id
                )

                expect(result).toBeUndefined()
            })


            test("returns 400 when slot ID is not an integer", async () => {
                const response = await agent
                    .get(
                        `/characters/${encodeURIComponent(testCharacter.name)}/equipment/compatible/invalid`
                    )

                expect(response.status).toBe(400)
                expect(response.body.error).toBe(
                    "Invalid character name or equipment slot ID"
                )
            })


            test("returns 404 when slot ID does not exist", async () => {
                const response = await agent
                    .get(
                        `/characters/${encodeURIComponent(testCharacter.name)}/equipment/compatible/999999999`
                    )

                expect(response.status).toBe(404)
                expect(response.body.error).toBe(
                    "Invalid slot ID"
                )
            })


            test("returns 404 for a missing character", async () => {
                const response = await agent
                    .get(
                        "/characters/DoesNotExist/equipment/compatible/1"
                    )

                expect(response.status).toBe(404)
                expect(response.body.error).toBe(
                    "Character not found"
                )
            })


            test("rejects an unauthenticated request", async () => {
                const response = await request(app)
                    .get(
                        `/characters/${encodeURIComponent(testCharacter.name)}/equipment/compatible/1`
                    )

                expect(response.status).toBe(401)
                expect(response.body.error).toBe(
                    "Not authenticated"
                )
            })

        }
    )


    // --- GET /characters/:name/equipment/:equipmentId ---

    describe(
        "GET /characters/:name/equipment/:equipmentId",
        () => {

            test("returns an existing equipment entry", async () => {
                const longsword =
                    await createInventoryEntry("longsword")

                const equipment =
                    await equipItem(
                        longsword.inventory_id,
                        1
                    )

                const response = await agent
                    .get(
                        `/characters/${encodeURIComponent(testCharacter.name)}/equipment/` +
                        equipment.equipment_id
                    )

                expect(response.status).toBe(200)

                expect(response.body.equipment_id)
                    .toBe(equipment.equipment_id)

                expect(response.body.inventory_id)
                    .toBe(longsword.inventory_id)

                expect(response.body.equipment_slot_id)
                    .toBe(1)

                expect(response.body.equipment_slot_index)
                    .toBe("main_hand")

                expect(response.body.equipment_slot_name)
                    .toBe("Main Hand")
            })


            test("returns 400 when equipment ID is not an integer", async () => {
                const response = await agent
                    .get(
                        `/characters/${encodeURIComponent(testCharacter.name)}/equipment/invalid`
                    )

                expect(response.status).toBe(400)
                expect(response.body.error).toBe(
                    "Invalid character name or equipment ID"
                )
            })


            test("returns 404 for a missing equipment entry", async () => {
                const response = await agent
                    .get(
                        `/characters/${encodeURIComponent(testCharacter.name)}/equipment/999999999`
                    )

                expect(response.status).toBe(404)
                expect(response.body.error).toBe(
                    "Equipment entry not found"
                )
            })


            test("does not return another character's equipment", async () => {
                const uniqueSuffix =
                    `${Date.now()}_${Math.random().toString(16).slice(2)}`

                const secondCharacterResponse = await agent
                    .post("/characters")
                    .send({
                        name: `SecondCharacter_${uniqueSuffix}`,
                        max_weight: 100
                    })

                expect(secondCharacterResponse.status)
                    .toBe(201)

                const secondCharacter =
                    secondCharacterResponse.body

                const inventoryResponse = await agent
                    .post(
                        `/characters/${encodeURIComponent(secondCharacter.name)}/inventory`
                    )
                    .send({
                        item_index: "longsword",
                        parent_inventory_id: null,
                        quantity: 1
                    })

                expect(inventoryResponse.status).toBe(201)

                const equipmentResponse = await agent
                    .post(
                        `/characters/${encodeURIComponent(secondCharacter.name)}/equipment`
                    )
                    .send({
                        inventory_id:
                            inventoryResponse.body.inventory_id,
                        equipment_slot_id: 1
                    })

                expect(equipmentResponse.status).toBe(201)

                const response = await agent
                    .get(
                        `/characters/${encodeURIComponent(testCharacter.name)}/equipment/` +
                        equipmentResponse.body.equipment_id
                    )

                expect(response.status).toBe(404)
                expect(response.body.error).toBe(
                    "Equipment entry not found"
                )
            })


            test("rejects an unauthenticated request", async () => {
                const response = await request(app)
                    .get(
                        `/characters/${encodeURIComponent(testCharacter.name)}/equipment/999999999`
                    )

                expect(response.status).toBe(401)
                expect(response.body.error).toBe(
                    "Not authenticated"
                )
            })

        }
    )


    // --- POST /characters/:name/equipment ---

    describe("POST /characters/:name/equipment", () => {

        test("creates an equipment entry", async () => {
            const longsword =
                await createInventoryEntry("longsword")

            const response = await agent
                .post(
                    `/characters/${encodeURIComponent(testCharacter.name)}/equipment`
                )
                .send({
                    inventory_id: longsword.inventory_id,
                    equipment_slot_id: 1
                })

            expect(response.status).toBe(201)

            expect(response.body)
                .toHaveProperty("equipment_id")

            expect(response.body.inventory_id)
                .toBe(longsword.inventory_id)

            expect(response.body.equipment_slot_id)
                .toBe(1)

            expect(response.body.equipment_slot_index)
                .toBe("main_hand")

            expect(response.body.equipment_slot_name)
                .toBe("Main Hand")
        })


        test("stores the equipment entry in the database", async () => {
            const longsword =
                await createInventoryEntry("longsword")

            const response = await agent
                .post(
                    `/characters/${encodeURIComponent(testCharacter.name)}/equipment`
                )
                .send({
                    inventory_id: longsword.inventory_id,
                    equipment_slot_id: 1
                })

            expect(response.status).toBe(201)

            const storedEquipment = db.prepare(`
                SELECT *
                FROM equipment
                WHERE equipment_id = ?
            `).get(response.body.equipment_id)

            expect(storedEquipment).toBeDefined()

            expect(storedEquipment.character_id)
                .toBe(testCharacter.character_id)

            expect(storedEquipment.inventory_id)
                .toBe(longsword.inventory_id)

            expect(storedEquipment.equipment_slot_id)
                .toBe(1)
        })


        test("returns 400 when inventory ID is not an integer", async () => {
            const response = await agent
                .post(
                    `/characters/${encodeURIComponent(testCharacter.name)}/equipment`
                )
                .send({
                    inventory_id: "invalid",
                    equipment_slot_id: 1
                })

            expect(response.status).toBe(400)
            expect(response.body.error).toBe(
                "Inventory ID and Slot ID must both be an integer"
            )
        })


        test("returns 400 when slot ID is not an integer", async () => {
            const response = await agent
                .post(
                    `/characters/${encodeURIComponent(testCharacter.name)}/equipment`
                )
                .send({
                    inventory_id: 1,
                    equipment_slot_id: "invalid"
                })

            expect(response.status).toBe(400)
            expect(response.body.error).toBe(
                "Inventory ID and Slot ID must both be an integer"
            )
        })


        test("returns 404 for a missing inventory entry", async () => {
            const response = await agent
                .post(
                    `/characters/${encodeURIComponent(testCharacter.name)}/equipment`
                )
                .send({
                    inventory_id: 999999999,
                    equipment_slot_id: 1
                })

            expect(response.status).toBe(404)
            expect(response.body.error).toBe(
                "Inventory entry not found"
            )
        })


        test("returns 404 for an invalid equipment slot", async () => {
            const longsword =
                await createInventoryEntry("longsword")

            const response = await agent
                .post(
                    `/characters/${encodeURIComponent(testCharacter.name)}/equipment`
                )
                .send({
                    inventory_id: longsword.inventory_id,
                    equipment_slot_id: 999999999
                })

            expect(response.status).toBe(404)
            expect(response.body.error).toBe(
                "Invalid slot ID"
            )
        })


        test("rejects an incompatible item", async () => {
            const torch =
                await createInventoryEntry("torch")

            const response = await agent
                .post(
                    `/characters/${encodeURIComponent(testCharacter.name)}/equipment`
                )
                .send({
                    inventory_id: torch.inventory_id,
                    equipment_slot_id: 1
                })

            expect(response.status).toBe(400)
            expect(response.body.error).toBe(
                "Item is not compatible with this equipment slot"
            )
        })


        test("rejects an item that is already equipped", async () => {
            const longsword =
                await createInventoryEntry("longsword")

            await equipItem(
                longsword.inventory_id,
                1
            )

            const response = await agent
                .post(
                    `/characters/${encodeURIComponent(testCharacter.name)}/equipment`
                )
                .send({
                    inventory_id: longsword.inventory_id,
                    equipment_slot_id: 2
                })

            expect(response.status).toBe(409)
            expect(response.body.error).toBe(
                "Item is already equipped somewhere else"
            )
        })


        test("rejects an occupied equipment slot", async () => {
            const firstLongsword =
                await createInventoryEntry("longsword")

            const secondLongsword =
                await createInventoryEntry("longsword")

            await equipItem(
                firstLongsword.inventory_id,
                1
            )

            const response = await agent
                .post(
                    `/characters/${encodeURIComponent(testCharacter.name)}/equipment`
                )
                .send({
                    inventory_id:
                        secondLongsword.inventory_id,
                    equipment_slot_id: 1
                })

            expect(response.status).toBe(409)
            expect(response.body.error).toBe(
                "Current slot is occupied"
            )
        })


        test("allows different items in different equipment slots", async () => {
            const longsword =
                await createInventoryEntry("longsword")

            const shield =
                await createInventoryEntry("shield")

            const mainHandResponse = await agent
                .post(
                    `/characters/${encodeURIComponent(testCharacter.name)}/equipment`
                )
                .send({
                    inventory_id: longsword.inventory_id,
                    equipment_slot_id: 1
                })

            const offHandResponse = await agent
                .post(
                    `/characters/${encodeURIComponent(testCharacter.name)}/equipment`
                )
                .send({
                    inventory_id: shield.inventory_id,
                    equipment_slot_id: 2
                })

            expect(mainHandResponse.status).toBe(201)
            expect(offHandResponse.status).toBe(201)
        })


        test("rejects inventory belonging to another character", async () => {
            const uniqueSuffix =
                `${Date.now()}_${Math.random().toString(16).slice(2)}`

            const secondCharacterResponse = await agent
                .post("/characters")
                .send({
                    name: `SecondCharacter_${uniqueSuffix}`,
                    max_weight: 100
                })

            expect(secondCharacterResponse.status)
                .toBe(201)

            const longsword =
                await createInventoryEntry("longsword")

            const response = await agent
                .post(
                    `/characters/${encodeURIComponent(
                        secondCharacterResponse.body.name
                    )}/equipment`
                )
                .send({
                    inventory_id: longsword.inventory_id,
                    equipment_slot_id: 1
                })

            expect(response.status).toBe(404)
            expect(response.body.error).toBe(
                "Inventory entry not found"
            )
        })


        test("returns 404 for a missing character", async () => {
            const response = await agent
                .post(
                    "/characters/DoesNotExist/equipment"
                )
                .send({
                    inventory_id: 1,
                    equipment_slot_id: 1
                })

            expect(response.status).toBe(404)
            expect(response.body.error).toBe(
                "Character not found"
            )
        })


        test("rejects an unauthenticated request", async () => {
            const response = await request(app)
                .post(
                    `/characters/${encodeURIComponent(testCharacter.name)}/equipment`
                )
                .send({
                    inventory_id: 1,
                    equipment_slot_id: 1
                })

            expect(response.status).toBe(401)
            expect(response.body.error).toBe(
                "Not authenticated"
            )
        })

    })


    // --- DELETE /characters/:name/equipment/:equipmentId ---

    describe(
        "DELETE /characters/:name/equipment/:equipmentId",
        () => {

            test("deletes an equipment entry", async () => {
                const longsword =
                    await createInventoryEntry("longsword")

                const equipment =
                    await equipItem(
                        longsword.inventory_id,
                        1
                    )

                const response = await agent
                    .delete(
                        `/characters/${encodeURIComponent(testCharacter.name)}/equipment/` +
                        equipment.equipment_id
                    )

                expect(response.status).toBe(200)
                expect(response.body.deleted).toBe(true)

                const storedEquipment = db.prepare(`
                    SELECT *
                    FROM equipment
                    WHERE equipment_id = ?
                `).get(equipment.equipment_id)

                expect(storedEquipment).toBeUndefined()
            })


            test("returns the updated equipment after deletion", async () => {
                const longsword =
                    await createInventoryEntry("longsword")

                const shield =
                    await createInventoryEntry("shield")

                const mainHand =
                    await equipItem(
                        longsword.inventory_id,
                        1
                    )

                const offHand =
                    await equipItem(
                        shield.inventory_id,
                        2
                    )

                const response = await agent
                    .delete(
                        `/characters/${encodeURIComponent(testCharacter.name)}/equipment/` +
                        mainHand.equipment_id
                    )

                expect(response.status).toBe(200)
                expect(response.body.deleted).toBe(true)

                expect(Array.isArray(response.body.equipment))
                    .toBe(true)

                expect(response.body.equipment)
                    .toHaveLength(1)

                expect(response.body.equipment[0].equipment_id)
                    .toBe(offHand.equipment_id)
            })


            test("returns 400 when equipment ID is not an integer", async () => {
                const response = await agent
                    .delete(
                        `/characters/${encodeURIComponent(testCharacter.name)}/equipment/invalid`
                    )

                expect(response.status).toBe(400)

                expect(response.body.error).toBe(
                    "A valid character name and equipment ID are required"
                )
            })


            test("returns 404 for a missing equipment entry", async () => {
                const response = await agent
                    .delete(
                        `/characters/${encodeURIComponent(testCharacter.name)}/equipment/999999999`
                    )

                expect(response.status).toBe(404)
                expect(response.body.error).toBe(
                    "Equipment entry not found"
                )
            })


            test("does not delete equipment belonging to another character", async () => {
                const uniqueSuffix =
                    `${Date.now()}_${Math.random().toString(16).slice(2)}`

                const secondCharacterResponse = await agent
                    .post("/characters")
                    .send({
                        name: `SecondCharacter_${uniqueSuffix}`,
                        max_weight: 100
                    })

                expect(secondCharacterResponse.status)
                    .toBe(201)

                const secondCharacter =
                    secondCharacterResponse.body

                const inventoryResponse = await agent
                    .post(
                        `/characters/${encodeURIComponent(secondCharacter.name)}/inventory`
                    )
                    .send({
                        item_index: "longsword",
                        parent_inventory_id: null,
                        quantity: 1
                    })

                expect(inventoryResponse.status).toBe(201)

                const equipmentResponse = await agent
                    .post(
                        `/characters/${encodeURIComponent(secondCharacter.name)}/equipment`
                    )
                    .send({
                        inventory_id:
                            inventoryResponse.body.inventory_id,
                        equipment_slot_id: 1
                    })

                expect(equipmentResponse.status).toBe(201)

                const response = await agent
                    .delete(
                        `/characters/${encodeURIComponent(testCharacter.name)}/equipment/` +
                        equipmentResponse.body.equipment_id
                    )

                expect(response.status).toBe(404)
                expect(response.body.error).toBe(
                    "Equipment entry not found"
                )

                const storedEquipment = db.prepare(`
                    SELECT *
                    FROM equipment
                    WHERE equipment_id = ?
                `).get(
                    equipmentResponse.body.equipment_id
                )

                expect(storedEquipment).toBeDefined()
            })


            test("rejects an unauthenticated request", async () => {
                const response = await request(app)
                    .delete(
                        `/characters/${encodeURIComponent(testCharacter.name)}/equipment/999999999`
                    )

                expect(response.status).toBe(401)
                expect(response.body.error).toBe(
                    "Not authenticated"
                )
            })

        }
    )

})