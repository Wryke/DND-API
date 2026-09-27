const request = require("supertest")
const app = require("../app")
const db = require("../db/connection.js")

describe("User Routes", () => {
    let testUser
    let testCharacter
    let additionalUserIds
    let testItems

    beforeEach(async () => {
        const uniqueSuffix =
            `${Date.now()}_${Math.random().toString(16).slice(2)}`

        const userResponse = await request(app)
            .post("/users")
            .send({
                username: `TestUser_${uniqueSuffix}`,
                password: "testpass"
            })

        expect(userResponse.status).toBe(201)

        testUser = userResponse.body

        const characterResponse = await request(app)
            .post(`/users/${testUser.user_id}/characters`)
            .send({
                name: `TestCharacter_${uniqueSuffix}`,
                max_weight: 100
            })

        expect(characterResponse.status).toBe(201)

        testCharacter = characterResponse.body
        additionalUserIds = []

        testItems = {
            backpack: db.prepare(`
                SELECT *
                FROM items
                WHERE item_index = ?
            `).get("backpack"),

            pouch: db.prepare(`
                SELECT *
                FROM items
                WHERE item_index = ?
            `).get("pouch"),

            torch: db.prepare(`
                SELECT *
                FROM items
                WHERE item_index = ?
            `).get("torch"),

            longsword: db.prepare(`
                SELECT *
                FROM items
                WHERE item_index = ?
            `).get("longsword"),

            shield: db.prepare(`
                SELECT *
                FROM items
                WHERE item_index = ?
            `).get("shield")
        }

        expect(testItems.backpack).toBeDefined()
        expect(testItems.pouch).toBeDefined()
        expect(testItems.torch).toBeDefined()
        expect(testItems.longsword).toBeDefined()
        expect(testItems.shield).toBeDefined()
    })

    afterEach(() => {
        /*
         * Delete additional users first.
         * Cascading deletes remove their characters and inventory.
         */
        for (const userId of additionalUserIds) {
            db.prepare(`
                DELETE FROM users
                WHERE user_id = ?
            `).run(userId)
        }

        /*
         * Some tests explicitly delete testUser.
         * Deleting it again simply changes zero rows.
         */
        db.prepare(`
            DELETE FROM users
            WHERE user_id = ?
        `).run(testUser.user_id)
    })

    // --- User Routes ---

    describe("GET /users/:id", () => {
        test("returns the requested user", async () => {
            const response = await request(app)
                .get(`/users/${testUser.user_id}`)

            expect(response.status).toBe(200)
            expect(response.body.user_id).toBe(testUser.user_id)
            expect(response.body.username).toBe(testUser.username)
        })

        test("returns 404 for a missing user", async () => {
            const response = await request(app)
                .get("/users/999999999")

            expect(response.status).toBe(404)
            expect(response.body.username).toBeUndefined()
        })
    })

    describe("POST /users", () => {
        test("creates a valid user", async () => {
            const username = `TestUser_Additional_${Date.now()}`

            const response = await request(app)
                .post("/users")
                .send({
                    username,
                    password: "testpass"
                })

            expect(response.status).toBe(201)
            expect(response.body.username).toBe(username)
            expect(response.body).toHaveProperty("user_id")

            additionalUserIds.push(response.body.user_id)
        })

        test("rejects a duplicate username", async () => {
            const response = await request(app)
                .post("/users")
                .send({
                    username: testUser.username,
                    password: "different-password"
                })

            expect(response.status).toBe(409)
            expect(response.body.error).toBe(
                "Username already exists"
            )
        })

        test("rejects an empty username", async () => {
            const response = await request(app)
                .post("/users")
                .send({
                    username: "",
                    password: "testpass"
                })

            expect(response.status).toBe(400)
        })

        test("rejects a missing password", async () => {
            const response = await request(app)
                .post("/users")
                .send({
                    username: `TestUser_MissingPassword_${Date.now()}`
                })

            expect(response.status).toBe(400)
        })
    })

    describe("PATCH /users/:id", () => {
        test("updates an existing username", async () => {
            const newUsername = `${testUser.username}_Updated`

            const patchResponse = await request(app)
                .patch(`/users/${testUser.user_id}`)
                .send({
                    username: newUsername
                })

            expect(patchResponse.status).toBe(200)
            expect(patchResponse.body.user_id)
                .toBe(testUser.user_id)
            expect(patchResponse.body.username)
                .toBe(newUsername)

            const getResponse = await request(app)
                .get(`/users/${testUser.user_id}`)

            expect(getResponse.status).toBe(200)
            expect(getResponse.body.username)
                .toBe(newUsername)
        })

        test("returns 404 for a missing user", async () => {
            const response = await request(app)
                .patch("/users/999999999")
                .send({
                    username: `TestUser_Missing_${Date.now()}`
                })

            expect(response.status).toBe(404)
            expect(response.body.error).toBe("User not found")
        })

        test("returns 400 for an empty username", async () => {
            const response = await request(app)
                .patch(`/users/${testUser.user_id}`)
                .send({
                    username: ""
                })

            expect(response.status).toBe(400)
        })

        test("returns 409 when the username already exists", async () => {
            const secondUserResponse = await request(app)
                .post("/users")
                .send({
                    username: `TestUser_Second_${Date.now()}`,
                    password: "testpass"
                })

            expect(secondUserResponse.status).toBe(201)

            additionalUserIds.push(
                secondUserResponse.body.user_id
            )

            const patchResponse = await request(app)
                .patch(`/users/${secondUserResponse.body.user_id}`)
                .send({
                    username: testUser.username
                })

            expect(patchResponse.status).toBe(409)
            expect(patchResponse.body.error).toBe(
                "Username already exists"
            )
        })
    })

    describe("DELETE /users/:id", () => {
        test("deletes an existing user", async () => {
            const response = await request(app)
                .delete(`/users/${testUser.user_id}`)

            expect(response.status).toBe(200)
            expect(response.body.deleted).toBe(true)

            const getResponse = await request(app)
                .get(`/users/${testUser.user_id}`)

            expect(getResponse.status).toBe(404)
        })

        test("returns 404 for a missing user", async () => {
            const response = await request(app)
                .delete("/users/999999999")

            expect(response.status).toBe(404)
        })
    })

    // --- Character Routes ---

    describe("GET /users/:id/characters", () => {
        test("returns the user's characters", async () => {
            const response = await request(app)
                .get(`/users/${testUser.user_id}/characters`)

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)

            expect(
                response.body.some(character =>
                    character.character_id ===
                    testCharacter.character_id
                )
            ).toBe(true)
        })

        test("returns 404 for a missing user", async () => {
            const response = await request(app)
                .get("/users/999999999/characters")

            expect(response.status).toBe(404)
        })
    })

    describe("GET /users/:id/characters/:name", () => {
        test("returns the requested character", async () => {
            const response = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    encodeURIComponent(testCharacter.name)
                )

            expect(response.status).toBe(200)
            expect(response.body.character_id)
                .toBe(testCharacter.character_id)
            expect(response.body.name)
                .toBe(testCharacter.name)
        })

        test("returns 404 for a missing character", async () => {
            const response = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/DoesNotExist`
                )

            expect(response.status).toBe(404)
            expect(response.body.name).toBeUndefined()
        })
    })

    describe("POST /users/:id/characters", () => {
        test("creates another character for the user", async () => {
            const characterName =
                `TestCharacter_Additional_${Date.now()}`

            const response = await request(app)
                .post(`/users/${testUser.user_id}/characters`)
                .send({
                    name: characterName,
                    max_weight: 120
                })

            expect(response.status).toBe(201)
            expect(response.body.name).toBe(characterName)
            expect(response.body.user_id)
                .toBe(testUser.user_id)
            expect(response.body.max_weight).toBe(120)
        })

        test("returns 404 for a missing user", async () => {
            const response = await request(app)
                .post("/users/999999999/characters")
                .send({
                    name: `TestCharacter_Missing_${Date.now()}`,
                    max_weight: 100
                })

            expect(response.status).toBe(404)
        })

        test("returns 409 for a duplicate character name", async () => {
            const response = await request(app)
                .post(`/users/${testUser.user_id}/characters`)
                .send({
                    name: testCharacter.name,
                    max_weight: 100
                })

            expect(response.status).toBe(409)
        })
    })

    describe("PATCH /users/:id/characters/:name", () => {
        test("updates only the character name", async () => {
            const newName = `${testCharacter.name}_Updated`

            const patchResponse = await request(app)
                .patch(
                    `/users/${testUser.user_id}/characters/` +
                    encodeURIComponent(testCharacter.name)
                )
                .send({
                    name: newName
                })

            expect(patchResponse.status).toBe(200)
            expect(patchResponse.body.name).toBe(newName)
            expect(patchResponse.body.max_weight).toBe(100)

            const getResponse = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    encodeURIComponent(newName)
                )

            expect(getResponse.status).toBe(200)
            expect(getResponse.body.name).toBe(newName)
            expect(getResponse.body.max_weight).toBe(100)
        })

        test("updates only max_weight", async () => {
            const response = await request(app)
                .patch(
                    `/users/${testUser.user_id}/characters/` +
                    encodeURIComponent(testCharacter.name)
                )
                .send({
                    max_weight: 150
                })

            expect(response.status).toBe(200)
            expect(response.body.name)
                .toBe(testCharacter.name)
            expect(response.body.max_weight).toBe(150)
        })

        test("updates both name and max_weight", async () => {
            const newName = `${testCharacter.name}_Updated`

            const response = await request(app)
                .patch(
                    `/users/${testUser.user_id}/characters/` +
                    encodeURIComponent(testCharacter.name)
                )
                .send({
                    name: newName,
                    max_weight: 175
                })

            expect(response.status).toBe(200)
            expect(response.body.name).toBe(newName)
            expect(response.body.max_weight).toBe(175)
        })

        test("returns 400 when no fields are supplied", async () => {
            const response = await request(app)
                .patch(
                    `/users/${testUser.user_id}/characters/` +
                    encodeURIComponent(testCharacter.name)
                )
                .send({})

            expect(response.status).toBe(400)
            expect(response.body.error).toBe(
                "At least one field must be provided"
            )
        })

        test("returns 400 for an invalid max_weight", async () => {
            const response = await request(app)
                .patch(
                    `/users/${testUser.user_id}/characters/` +
                    encodeURIComponent(testCharacter.name)
                )
                .send({
                    max_weight: 0
                })

            expect(response.status).toBe(400)
        })

        test("returns 404 for a missing character", async () => {
            const response = await request(app)
                .patch(
                    `/users/${testUser.user_id}/characters/DoesNotExist`
                )
                .send({
                    max_weight: 150
                })

            expect(response.status).toBe(404)
        })
    })

    describe("DELETE /users/:id/characters/:name", () => {
        test("deletes an existing character", async () => {
            const deleteResponse = await request(app)
                .delete(
                    `/users/${testUser.user_id}/characters/` +
                    encodeURIComponent(testCharacter.name)
                )

            expect(deleteResponse.status).toBe(200)
            expect(deleteResponse.body.deleted).toBe(true)

            const getResponse = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    encodeURIComponent(testCharacter.name)
                )

            expect(getResponse.status).toBe(404)
        })

        test("returns 404 for a missing character", async () => {
            const response = await request(app)
                .delete(
                    `/users/${testUser.user_id}/characters/DoesNotExist`
                )

            expect(response.status).toBe(404)
            expect(response.body.error).toBe(
                "Character not found"
            )
        })
    })

    // --- Inventory Routes ---

        describe("GET /users/:id/characters/:name/inventory/root", () => {
        test("returns an empty array when the character has no inventory", async () => {
            const response = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory/root`
                )

            expect(response.status).toBe(200)
            expect(response.body).toEqual([])
        })

        test("returns only the character's root inventory entries", async () => {
            const backpackResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "backpack",
                    parent_inventory_id: null,
                    quantity: 1
                })

            expect(backpackResponse.status).toBe(201)

            const backpackId =
                backpackResponse.body.inventory_id

            const torchResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "torch",
                    parent_inventory_id: backpackId,
                    quantity: 2
                })

            expect(torchResponse.status).toBe(201)

            const response = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory/root`
                )

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
            expect(response.body).toHaveLength(1)
            expect(response.body[0].item_index).toBe("backpack")
            expect(response.body[0].name).toBe("Backpack")
            expect(response.body[0]).toHaveProperty("description")
            expect(response.body[0]).toHaveProperty("weight")
            expect(response.body[0]).toHaveProperty("cost_quantity")
            expect(response.body[0]).toHaveProperty("currency_code")
            expect(response.body[0]).toHaveProperty("currency_name")
            expect(response.body[0]).toHaveProperty("item_type_name")
            expect(response.body[0].parent_inventory_id)
                .toBeNull()
        })

        test("returns 404 for a missing character", async () => {
            const response = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    `DoesNotExist/inventory/root`
                )

            expect(response.status).toBe(404)
            expect(response.body.error).toBe(
                "Character not found"
            )
        })
    })

    describe("GET /users/:id/characters/:name/inventory/all", () => {
        test("returns an empty array when the character has no inventory", async () => {
            const response = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory/all`
                )

            expect(response.status).toBe(200)
            expect(response.body).toEqual([])
        })

        test("returns all of the character's inventory entries", async () => {
            const backpackResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "backpack",
                    parent_inventory_id: null,
                    quantity: 1
                })

            expect(backpackResponse.status).toBe(201)

            const backpackId =
                backpackResponse.body.inventory_id

            const torchResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "torch",
                    parent_inventory_id: backpackId,
                    quantity: 2
                })

            expect(torchResponse.status).toBe(201)

            const response = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory/all`
                )

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
            expect(response.body).toHaveLength(2)

            const backpack = response.body.find(
                item => item.item_index === "backpack"
            )

            const torch = response.body.find(
                item => item.item_index === "torch"
            )

            expect(backpack).toBeDefined()
            expect(backpack.parent_inventory_id).toBeNull()
            expect(backpack).toHaveProperty("description")
            expect(backpack).toHaveProperty("weight")
            expect(backpack).toHaveProperty("cost_quantity")
            expect(backpack).toHaveProperty("currency_code")
            expect(backpack).toHaveProperty("currency_name")
            expect(backpack).toHaveProperty("item_type_name")

            expect(torch).toBeDefined()
            expect(torch.parent_inventory_id).toBe(backpackId)
            expect(torch.quantity).toBe(2)
        })

        test("returns 404 for a missing character", async () => {
            const response = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    `DoesNotExist/inventory/all`
                )

            expect(response.status).toBe(404)
            expect(response.body.error).toBe(
                "Character not found"
            )
        })
    })

    describe("POST /users/:id/characters/:name/inventory", () => {
        test("creates a root inventory entry", async () => {
            const response = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "backpack",
                    parent_inventory_id: null,
                    quantity: 1
                })

            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty("inventory_id")
            expect(response.body.character_id)
                .toBe(testCharacter.character_id)
            expect(response.body.item_id)
                .toBe(testItems.backpack.item_id)
            expect(response.body.parent_inventory_id)
                .toBeNull()
            expect(response.body.quantity).toBe(1)
        })

        test("returns 400 for an empty item index", async () => {
            const response = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "   ",
                    parent_inventory_id: null,
                    quantity: 1
                })

            expect(response.status).toBe(400)
            expect(response.body.error).toBe(
                "A valid item index and positive quantity are required"
            )
        })

        test("returns 404 for a missing item index", async () => {
            const response = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "does-not-exist",
                    parent_inventory_id: null,
                    quantity: 1
                })

            expect(response.status).toBe(404)
            expect(response.body.error).toBe("Item not found")
        })

        test("trims the item index before looking up the item", async () => {
            const response = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "  backpack  ",
                    parent_inventory_id: null,
                    quantity: 1
                })

            expect(response.status).toBe(201)
            expect(response.body.item_id)
                .toBe(testItems.backpack.item_id)
        })

        test("returns 404 for a missing parent inventory entry", async () => {
            const response = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "torch",
                    parent_inventory_id: 999999999,
                    quantity: 1
                })

            expect(response.status).toBe(404)
            expect(response.body.error).toBe(
                "Parent inventory entry not found"
            )
        })

        test("creates an inventory entry inside another entry", async () => {
            const backpackResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "backpack",
                    parent_inventory_id: null,
                    quantity: 1
                })

            expect(backpackResponse.status).toBe(201)

            const torchResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "torch",
                    parent_inventory_id:
                        backpackResponse.body.inventory_id,
                    quantity: 2
                })

            expect(torchResponse.status).toBe(201)
            expect(torchResponse.body.parent_inventory_id)
                .toBe(backpackResponse.body.inventory_id)
            expect(torchResponse.body.quantity).toBe(2)
        })
    })

    describe("GET /users/:id/characters/:name/inventory/:inventoryId", () => {
        test("returns a specific inventory entry", async () => {
            const createResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "backpack",
                    parent_inventory_id: null,
                    quantity: 1
                })

            expect(createResponse.status).toBe(201)

            const response = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory/` +
                    createResponse.body.inventory_id
                )

            expect(response.status).toBe(200)
            expect(response.body.inventory_id)
                .toBe(createResponse.body.inventory_id)
            expect(response.body.item_index).toBe("backpack")
            expect(response.body.name).toBe("Backpack")
            expect(response.body).toHaveProperty("description")
            expect(response.body).toHaveProperty("weight")
            expect(response.body).toHaveProperty("cost_quantity")
            expect(response.body).toHaveProperty("currency_code")
            expect(response.body).toHaveProperty("currency_name")
            expect(response.body).toHaveProperty("item_type_name")
            expect(response.body.quantity).toBe(1)
        })

        test("returns 404 for a missing inventory entry", async () => {
            const response = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory/999999999`
                )

            expect(response.status).toBe(404)
        })
    })

    describe("GET /users/:id/characters/:name/inventory/:inventoryId/children", () => {
        test("returns the direct children of an inventory entry", async () => {
            const backpackResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "backpack",
                    parent_inventory_id: null,
                    quantity: 1
                })

            const backpackId =
                backpackResponse.body.inventory_id

            const torchResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "torch",
                    parent_inventory_id: backpackId,
                    quantity: 2
                })

            expect(torchResponse.status).toBe(201)

            const response = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory/` +
                    `${backpackId}/children`
                )

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
            expect(response.body).toHaveLength(1)
            expect(response.body[0].item_index).toBe("torch")
            expect(response.body[0].name).toBe("Torch")
            expect(response.body[0]).toHaveProperty("description")
            expect(response.body[0]).toHaveProperty("weight")
            expect(response.body[0]).toHaveProperty("cost_quantity")
            expect(response.body[0]).toHaveProperty("currency_code")
            expect(response.body[0]).toHaveProperty("currency_name")
            expect(response.body[0]).toHaveProperty("item_type_name")
            expect(response.body[0].parent_inventory_id)
                .toBe(backpackId)
        })

        test("returns an empty array when the entry has no children", async () => {
            const backpackResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "backpack",
                    parent_inventory_id: null,
                    quantity: 1
                })

            const response = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory/` +
                    `${backpackResponse.body.inventory_id}/children`
                )

            expect(response.status).toBe(200)
            expect(response.body).toEqual([])
        })
    })

    describe("PATCH /users/:id/characters/:name/inventory/:inventoryId", () => {
        test("updates only the inventory quantity", async () => {
            const createResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "torch",
                    parent_inventory_id: null,
                    quantity: 2
                })

            const inventoryId =
                createResponse.body.inventory_id

            const patchResponse = await request(app)
                .patch(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory/` +
                    inventoryId
                )
                .send({
                    quantity: 5
                })

            expect(patchResponse.status).toBe(200)
            expect(patchResponse.body.inventory_id)
                .toBe(inventoryId)
            expect(patchResponse.body.quantity).toBe(5)
            expect(patchResponse.body.parent_inventory_id)
                .toBeNull()
            expect(patchResponse.body.item_index).toBe("torch")
            expect(patchResponse.body.name).toBe("Torch")
            expect(patchResponse.body)
                .toHaveProperty("item_type_name")
        })

        test("moves an inventory entry into another entry", async () => {
            const backpackResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "backpack",
                    parent_inventory_id: null,
                    quantity: 1
                })

            const torchResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "torch",
                    parent_inventory_id: null,
                    quantity: 2
                })

            const patchResponse = await request(app)
                .patch(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory/` +
                    torchResponse.body.inventory_id
                )
                .send({
                    parent_inventory_id:
                        backpackResponse.body.inventory_id
                })

            expect(patchResponse.status).toBe(200)
            expect(patchResponse.body.parent_inventory_id)
                .toBe(backpackResponse.body.inventory_id)
            expect(patchResponse.body.quantity).toBe(2)
        })

        test("moves an inventory entry back to the root", async () => {
            const backpackResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "backpack",
                    parent_inventory_id: null,
                    quantity: 1
                })

            const torchResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "torch",
                    parent_inventory_id:
                        backpackResponse.body.inventory_id,
                    quantity: 2
                })

            const patchResponse = await request(app)
                .patch(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory/` +
                    torchResponse.body.inventory_id
                )
                .send({
                    parent_inventory_id: null
                })

            expect(patchResponse.status).toBe(200)
            expect(patchResponse.body.parent_inventory_id)
                .toBeNull()
        })

        test("returns 400 when no update fields are supplied", async () => {
            const createResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "torch",
                    parent_inventory_id: null,
                    quantity: 2
                })

            const response = await request(app)
                .patch(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory/` +
                    createResponse.body.inventory_id
                )
                .send({})

            expect(response.status).toBe(400)
            expect(response.body.error).toBe(
                "At least one update field is required"
            )
        })

        test("returns 400 when an entry is moved into itself", async () => {
            const createResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "backpack",
                    parent_inventory_id: null,
                    quantity: 1
                })

            const inventoryId =
                createResponse.body.inventory_id

            const response = await request(app)
                .patch(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory/` +
                    inventoryId
                )
                .send({
                    parent_inventory_id: inventoryId
                })

            expect(response.status).toBe(400)
            expect(response.body.error).toBe(
                "An inventory entry cannot contain itself"
            )
        })
    })

    describe("DELETE /users/:id/characters/:name/inventory/:inventoryId", () => {
        test("deletes an existing inventory entry", async () => {
            const createResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "torch",
                    parent_inventory_id: null,
                    quantity: 2
                })

            const inventoryId =
                createResponse.body.inventory_id

            const deleteResponse = await request(app)
                .delete(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory/` +
                    inventoryId
                )

            expect(deleteResponse.status).toBe(200)
            expect(deleteResponse.body.deleted).toBe(true)

            const getResponse = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory/` +
                    inventoryId
                )

            expect(getResponse.status).toBe(404)
        })

        test("promotes direct children to the root when deleting a container", async () => {
            const backpackResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "backpack",
                    parent_inventory_id: null,
                    quantity: 1
                })

            const pouchResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "pouch",
                    parent_inventory_id:
                        backpackResponse.body.inventory_id,
                    quantity: 1
                })

            const deleteResponse = await request(app)
                .delete(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory/` +
                    backpackResponse.body.inventory_id
                )

            expect(deleteResponse.status).toBe(200)

            const pouchResponseAfterDelete = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory/` +
                    pouchResponse.body.inventory_id
                )

            expect(pouchResponseAfterDelete.status).toBe(200)
            expect(
                pouchResponseAfterDelete.body.parent_inventory_id
            ).toBeNull()
        })

        test("returns 404 for a missing inventory entry", async () => {
            const response = await request(app)
                .delete(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory/999999999`
                )

            expect(response.status).toBe(404)
            expect(response.body.error).toBe(
                "Inventory entry not found"
            )
        })
    })

    // --- Equipment Routes ---

    describe("GET /users/:id/characters/:name/equipment", () => {
        test("returns an empty array when the character has no equipment", async () => {
            const response = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/equipment`
                )

            expect(response.status).toBe(200)
            expect(response.body).toEqual([])
        })

        test("returns all of the character's equipment", async () => {
            const inventoryResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "longsword",
                    parent_inventory_id: null,
                    quantity: 1
                })

            expect(inventoryResponse.status).toBe(201)

            const equipmentResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/equipment`
                )
                .send({
                    inventory_id:
                        inventoryResponse.body.inventory_id,
                    equipment_slot_id: 1
                })

            expect(equipmentResponse.status).toBe(201)

            const response = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/equipment`
                )

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
            expect(response.body).toHaveLength(1)

            expect(response.body[0].inventory_id)
                .toBe(inventoryResponse.body.inventory_id)

            expect(response.body[0].equipment_slot_id).toBe(1)
            expect(response.body[0].equipment_slot_index)
                .toBe("main_hand")
            expect(response.body[0].equipment_slot_name)
                .toBe("Main Hand")
        })

        test("returns 404 for a missing character", async () => {
            const response = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    `DoesNotExist/equipment`
                )

            expect(response.status).toBe(404)
            expect(response.body.error).toBe(
                "Character not found"
            )
        })
    })

    describe("GET /users/:id/characters/:name/equipment/compatible/:slotId", () => {
        test("returns inventory entries compatible with the equipment slot", async () => {
            const longswordResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "longsword",
                    parent_inventory_id: null,
                    quantity: 1
                })

            const torchResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "torch",
                    parent_inventory_id: null,
                    quantity: 1
                })

            expect(longswordResponse.status).toBe(201)
            expect(torchResponse.status).toBe(201)

            const response = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/equipment/` +
                    `compatible/1`
                )

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
            expect(response.body).toHaveLength(1)

            expect(response.body[0].inventory_id)
                .toBe(longswordResponse.body.inventory_id)

            expect(response.body[0].item_id)
                .toBe(testItems.longsword.item_id)

            expect(response.body[0].item_index)
                .toBe("longsword")

            expect(response.body[0].name)
                .toBe("Longsword")
        })

        test("returns an empty array when the character has no compatible inventory", async () => {
            const torchResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "torch",
                    parent_inventory_id: null,
                    quantity: 1
                })

            expect(torchResponse.status).toBe(201)

            const response = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/equipment/` +
                    `compatible/1`
                )

            expect(response.status).toBe(200)
            expect(response.body).toEqual([])
        })

        test("returns 404 for an invalid equipment slot", async () => {
            const response = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/equipment/` +
                    `compatible/999999999`
                )

            expect(response.status).toBe(404)
            expect(response.body.error).toBe(
                "Invalid slot ID"
            )
        })

        test("returns 404 for a missing character", async () => {
            const response = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    `DoesNotExist/equipment/compatible/1`
                )

            expect(response.status).toBe(404)
            expect(response.body.error).toBe(
                "Character not found"
            )
        })

        test("returns 400 when the equipment slot ID is not an integer", async () => {
            const response = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/equipment/` +
                    `compatible/invalid`
                )

            expect(response.status).toBe(400)
            expect(response.body.error).toBe(
                "Invalid user ID, character name, or equipment slot ID"
            )
        })
    })

    describe("GET /users/:id/characters/:name/equipment/:equipmentId", () => {
        test("returns a specific equipment entry", async () => {
            const inventoryResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "longsword",
                    parent_inventory_id: null,
                    quantity: 1
                })

            expect(inventoryResponse.status).toBe(201)

            const createResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/equipment`
                )
                .send({
                    inventory_id:
                        inventoryResponse.body.inventory_id,
                    equipment_slot_id: 1
                })

            expect(createResponse.status).toBe(201)

            const response = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/equipment/` +
                    createResponse.body.equipment_id
                )

            expect(response.status).toBe(200)

            expect(response.body.equipment_id)
                .toBe(createResponse.body.equipment_id)

            expect(response.body.inventory_id)
                .toBe(inventoryResponse.body.inventory_id)

            expect(response.body.equipment_slot_id).toBe(1)
            expect(response.body.equipment_slot_index)
                .toBe("main_hand")
            expect(response.body.equipment_slot_name)
                .toBe("Main Hand")
        })

        test("returns 404 for a missing equipment entry", async () => {
            const response = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/equipment/999999999`
                )

            expect(response.status).toBe(404)
            expect(response.body.error).toBe(
                "Equipment entry not found"
            )
        })
    })

    describe("POST /users/:id/characters/:name/equipment", () => {
        test("creates an equipment entry", async () => {
            const inventoryResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "longsword",
                    parent_inventory_id: null,
                    quantity: 1
                })

            expect(inventoryResponse.status).toBe(201)

            const response = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/equipment`
                )
                .send({
                    inventory_id:
                        inventoryResponse.body.inventory_id,
                    equipment_slot_id: 1
                })

            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty("equipment_id")

            expect(response.body.inventory_id)
                .toBe(inventoryResponse.body.inventory_id)

            expect(response.body.equipment_slot_id).toBe(1)
            expect(response.body.equipment_slot_index)
                .toBe("main_hand")
            expect(response.body.equipment_slot_name)
                .toBe("Main Hand")
        })

        test("returns 400 when inventory ID is not an integer", async () => {
            const response = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/equipment`
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

        test("returns 400 when equipment slot ID is not an integer", async () => {
            const response = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/equipment`
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
            const response = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/equipment`
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
            const inventoryResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "torch",
                    parent_inventory_id: null,
                    quantity: 1
                })

            expect(inventoryResponse.status).toBe(201)

            const response = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/equipment`
                )
                .send({
                    inventory_id:
                        inventoryResponse.body.inventory_id,
                    equipment_slot_id: 999999999
                })

            expect(response.status).toBe(404)
            expect(response.body.error).toBe(
                "Invalid slot ID"
            )
        })

        test("returns 409 when the equipment slot is occupied", async () => {
            const firstInventoryResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "longsword",
                    parent_inventory_id: null,
                    quantity: 1
                })

            const secondInventoryResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "shield",
                    parent_inventory_id: null,
                    quantity: 1
                })

            expect(firstInventoryResponse.status).toBe(201)
            expect(secondInventoryResponse.status).toBe(201)

            const firstEquipmentResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/equipment`
                )
                .send({
                    inventory_id:
                        firstInventoryResponse.body.inventory_id,
                    equipment_slot_id: 1
                })

            expect(firstEquipmentResponse.status).toBe(201)

            const response = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/equipment`
                )
                .send({
                    inventory_id:
                        secondInventoryResponse.body.inventory_id,
                    equipment_slot_id: 1
                })

            expect(response.status).toBe(409)
            expect(response.body.error).toBe(
                "Current slot is occupied"
            )
        })

        test("returns 400 when the item is not compatible with the equipment slot", async () => {
            const inventoryResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "torch",
                    parent_inventory_id: null,
                    quantity: 1
                })

            expect(inventoryResponse.status).toBe(201)

            const response = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/equipment`
                )
                .send({
                    inventory_id: inventoryResponse.body.inventory_id,
                    equipment_slot_id: 1
                })

            expect(response.status).toBe(400)
            expect(response.body.error).toBe(
                "Item is not compatible with this equipment slot"
            )
        })
    })

    describe("DELETE /users/:id/characters/:name/equipment/:equipmentId", () => {
        test("deletes an equipment entry", async () => {
            const inventoryResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/inventory`
                )
                .send({
                    item_index: "longsword",
                    parent_inventory_id: null,
                    quantity: 1
                })

            expect(inventoryResponse.status).toBe(201)

            const equipmentResponse = await request(app)
                .post(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/equipment`
                )
                .send({
                    inventory_id:
                        inventoryResponse.body.inventory_id,
                    equipment_slot_id: 1
                })

            expect(equipmentResponse.status).toBe(201)

            const response = await request(app)
                .delete(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/equipment/` +
                    equipmentResponse.body.equipment_id
                )

            expect(response.status).toBe(200)
            expect(response.body.deleted).toBe(true)

            const getResponse = await request(app)
                .get(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/equipment/` +
                    equipmentResponse.body.equipment_id
                )

            expect(getResponse.status).toBe(404)
        })

        test("returns 404 for a missing equipment entry", async () => {
            const response = await request(app)
                .delete(
                    `/users/${testUser.user_id}/characters/` +
                    `${encodeURIComponent(testCharacter.name)}/equipment/999999999`
                )

            expect(response.status).toBe(404)
            expect(response.body.error).toBe(
                "Equipment entry not found"
            )
        })
    })
})