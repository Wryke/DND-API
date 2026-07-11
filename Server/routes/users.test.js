const request = require("supertest")
const app = require("../app")
const db = require("../db/connection.js")

describe("User Routes", () => {

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

    // --- User Routes ---

    // GET /users/:id
    test("GET /users/:id returns respective user", async () => {
        const username = `TestUser_${Date.now()}`

        const userResponse = await request(app)
            .post("/users/")
            .send({
                username,
                password: "testpass"
            })

        expect(userResponse.status).toBe(201)
        const userId = userResponse.body.user_id

        const findUserResponse = await request(app).get(`/users/${userId}`)

        expect(findUserResponse.status).toBe(200)
        expect(findUserResponse.body.username).toBe(username)
    })

    test("GET /users/987654321 returns 404 undefined", async () => {
        
        const response = await request(app).get("/users/987654321")

        expect(response.status).toBe(404)
        expect(response.body.username).toBe(undefined)
    })

    // POST /users/
    test("POST /users/ inserts a new valid user into the db", async () => {
        
        const username = `TestUser_${Date.now()}`
        const payload = {
            "username": username,
            "password": `testpass`
        }

        const response = await request(app).post("/users/").send(payload)
        
        expect(response.status).toBe(201)
        expect(response.body.username).toBe(username)
    })

    test("POST /users/ rejects insert attempt of duplicate user", async () => {
        
        const username = `TestUser_${Date.now()}`
        const payload1 = {
            "username": username,
            "password": `testpass`
        }

        const response1 = await request(app).post("/users/").send(payload1)
        
        expect(response1.status).toBe(201)
        
        const payload2 = {
            "username": username,
            "password": `testpass`
        }

        const response2 = await request(app).post("/users/").send(payload2)
        
        expect(response2.status).toBe(409)
    })

    test("POST /users/ inserts attempt fails with empty user", async () => {
        
        const username = ``
        const payload = {
            "username": username,
            "password": `testpass`
        }

        const response = await request(app).post("/users/").send(payload)
        
        expect(response.status).toBe(400)
    })

    test("POST /users/ inserts attempt fails with no password", async () => {
        
        const username = ``
        const payload = {
            "username": username
        }

        const response = await request(app).post("/users/").send(payload)
        
        expect(response.status).toBe(400)
    })

    // PATCH /users/:id
    test("PATCH /users/:id updates an existing username", async () => {
        const originalUsername = `TestUser_${Date.now()}`
        const newUsername = `${originalUsername}_Updated`

        const createResponse = await request(app)
            .post("/users")
            .send({
                username: originalUsername,
                password: "testpass"
            })

        expect(createResponse.status).toBe(201)

        const userId = createResponse.body.user_id

        const patchResponse = await request(app)
            .patch(`/users/${userId}`)
            .send({
                username: newUsername
            })

        expect(patchResponse.status).toBe(200)
        expect(patchResponse.body.user_id).toBe(userId)
        expect(patchResponse.body.username).toBe(newUsername)

        const getResponse = await request(app)
            .get(`/users/${userId}`)

        expect(getResponse.status).toBe(200)
        expect(getResponse.body.username).toBe(newUsername)
    })

    test("PATCH /users/:id returns 404 for a missing user", async () => {
        const response = await request(app)
            .patch("/users/999999999")
            .send({
                username: `TestUser_${Date.now()}`
            })

        expect(response.status).toBe(404)
        expect(response.body.error).toBe("User not found")
    })

    test("PATCH /users/:id returns 400 for an empty username", async () => {
        const username = `TestUser_${Date.now()}`

        const createResponse = await request(app)
            .post("/users")
            .send({
                username,
                password: "testpass"
            })

        const userId = createResponse.body.user_id

        const patchResponse = await request(app)
            .patch(`/users/${userId}`)
            .send({
                username: ""
            })

        expect(patchResponse.status).toBe(400)
    })

    test("PATCH /users/:id returns 409 when username already exists", async () => {
        const username1 = `TestUser_${Date.now()}_1`
        const username2 = `TestUser_${Date.now()}_2`

        const firstUserResponse = await request(app)
            .post("/users")
            .send({
                username: username1,
                password: "testpass"
            })

        const secondUserResponse = await request(app)
            .post("/users")
            .send({
                username: username2,
                password: "testpass"
            })

        const secondUserId = secondUserResponse.body.user_id

        const patchResponse = await request(app)
            .patch(`/users/${secondUserId}`)
            .send({
                username: firstUserResponse.body.username
            })

        expect(patchResponse.status).toBe(409)
        expect(patchResponse.body.error).toBe("Username already exists")
    })

    // DELETE /users/:id
    test("DELETE /users/:id deletes an existing user from the db", async () => {
        const username = `TestUser_${Date.now()}`

        const createResponse = await request(app)
            .post("/users/")
            .send({
                username,
                password: "testpass"
            })

        expect(createResponse.status).toBe(201)

        const userId = createResponse.body.user_id

        const deleteResponse = await request(app)
            .delete(`/users/${userId}`)

        expect(deleteResponse.status).toBe(200)
        expect(deleteResponse.body.deleted).toBe(true)
    })

    // --- Character Routes ---

    // GET /users/:id/characters
    test("GET /users/:id/characters returns the user's characters", async () => {
        const username = `TestUser_${Date.now()}`

        const userResponse = await request(app)
            .post("/users/")
            .send({
                username,
                password: "testpass"
            })

        const userId = userResponse.body.user_id

        expect(userResponse.status).toBe(201)
        
        await request(app)
            .post(`/users/${userId}/characters`)
            .send({
                name: "TestCharacter",
                max_weight: 100
            })

        const response = await request(app).get(`/users/${userId}/characters`)

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
        expect(
            response.body.some(character => character.name === "TestCharacter")
        ).toBe(true)
    })

    // GET /users/:id/characters/:name
    test("GET /users/:id/characters/:name returns the user's characters by name", async () => {
        const username = `TestUser_${Date.now()}`

        const userResponse = await request(app)
            .post("/users/")
            .send({
                username,
                password: "testpass"
            })

        const userId = userResponse.body.user_id

        expect(userResponse.status).toBe(201)
        
        const characterName = "TestCharacter"
        await request(app)
            .post(`/users/${userId}/characters`)
            .send({
                name: characterName,
                max_weight: 100
            })

        const response = await request(app).get(`/users/${userId}/characters/${characterName}`)

        expect(response.status).toBe(200)
        expect(response.body.name).toBe(characterName)
    })

    test("GET /users/123456789/characters/flooper returns 404 undefined", async () => {
        
        const response = await request(app).get("/users/123456789/characters/flooper")

        expect(response.status).toBe(404)
        expect(response.body.name).toBe(undefined)
    })

    // POST /users/:id/characters
    test("POST /users/:id/characters creates a character", async () => {
        const username = `TestUser_${Date.now()}`

        const userResponse = await request(app)
            .post("/users/")
            .send({
                username,
                password: "testpass"
            })

        expect(userResponse.status).toBe(201)

        const characterResponse = await request(app)
            .post(`/users/${userResponse.body.user_id}/characters`)
            .send({
                name: "TestCharacter",
                max_weight: 100
            })

        expect(characterResponse.status).toBe(201)
        expect(characterResponse.body.name).toBe("TestCharacter")
        expect(characterResponse.body.user_id).toBe(userResponse.body.user_id)
    })

    // PATCH /users/:id/characters/:name
    test("PATCH /users/:id/characters/:name updates only the character name", async () => {
        const username = `TestUser_${Date.now()}`
        const originalName = `TestCharacter_${Date.now()}`
        const newName = `${originalName}_Updated`

        const userResponse = await request(app)
            .post("/users")
            .send({
                username,
                password: "testpass"
            })

        const userId = userResponse.body.user_id

        const createCharacterResponse = await request(app)
            .post(`/users/${userId}/characters`)
            .send({
                name: originalName,
                max_weight: 100
            })

        expect(createCharacterResponse.status).toBe(201)

        const patchResponse = await request(app)
            .patch(
                `/users/${userId}/characters/${encodeURIComponent(originalName)}`
            )
            .send({
                name: newName
            })

        expect(patchResponse.status).toBe(200)
        expect(patchResponse.body.name).toBe(newName)
        expect(patchResponse.body.max_weight).toBe(100)

        const getResponse = await request(app)
            .get(
                `/users/${userId}/characters/${encodeURIComponent(newName)}`
            )

        expect(getResponse.status).toBe(200)
        expect(getResponse.body.name).toBe(newName)
        expect(getResponse.body.max_weight).toBe(100)
    })

    test("PATCH /users/:id/characters/:name updates only max_weight", async () => {
        const username = `TestUser_${Date.now()}`
        const characterName = `TestCharacter_${Date.now()}`

        const userResponse = await request(app)
            .post("/users")
            .send({
                username,
                password: "testpass"
            })

        const userId = userResponse.body.user_id

        await request(app)
            .post(`/users/${userId}/characters`)
            .send({
                name: characterName,
                max_weight: 100
            })

        const patchResponse = await request(app)
            .patch(
                `/users/${userId}/characters/${encodeURIComponent(characterName)}`
            )
            .send({
                max_weight: 150
            })

        expect(patchResponse.status).toBe(200)
        expect(patchResponse.body.name).toBe(characterName)
        expect(patchResponse.body.max_weight).toBe(150)
    })

    test("PATCH /users/:id/characters/:name updates name and max_weight", async () => {
        const username = `TestUser_${Date.now()}`
        const originalName = `TestCharacter_${Date.now()}`
        const newName = `${originalName}_Updated`

        const userResponse = await request(app)
            .post("/users")
            .send({
                username,
                password: "testpass"
            })

        const userId = userResponse.body.user_id

        await request(app)
            .post(`/users/${userId}/characters`)
            .send({
                name: originalName,
                max_weight: 100
            })

        const patchResponse = await request(app)
            .patch(
                `/users/${userId}/characters/${encodeURIComponent(originalName)}`
            )
            .send({
                name: newName,
                max_weight: 175
            })

        expect(patchResponse.status).toBe(200)
        expect(patchResponse.body.name).toBe(newName)
        expect(patchResponse.body.max_weight).toBe(175)
    })

    test("PATCH /users/:id/characters/:name returns 400 when no fields are provided", async () => {
        const username = `TestUser_${Date.now()}`
        const characterName = `TestCharacter_${Date.now()}`

        const userResponse = await request(app)
            .post("/users")
            .send({
                username,
                password: "testpass"
            })

        const userId = userResponse.body.user_id

        await request(app)
            .post(`/users/${userId}/characters`)
            .send({
                name: characterName,
                max_weight: 100
            })

        const patchResponse = await request(app)
            .patch(
                `/users/${userId}/characters/${encodeURIComponent(characterName)}`
            )
            .send({})

        expect(patchResponse.status).toBe(400)
        expect(patchResponse.body.error).toBe(
            "At least one field must be provided"
        )
    })

    test("PATCH /users/:id/characters/:name returns 400 for invalid max_weight", async () => {
        const username = `TestUser_${Date.now()}`
        const characterName = `TestCharacter_${Date.now()}`

        const userResponse = await request(app)
            .post("/users")
            .send({
                username,
                password: "testpass"
            })

        const userId = userResponse.body.user_id

        await request(app)
            .post(`/users/${userId}/characters`)
            .send({
                name: characterName,
                max_weight: 100
            })

        const patchResponse = await request(app)
            .patch(
                `/users/${userId}/characters/${encodeURIComponent(characterName)}`
            )
            .send({
                max_weight: 0
            })

        expect(patchResponse.status).toBe(400)
    })

    // DELETE /users/:id/characters/:name
    test("DELETE /users/:id/characters/:name deletes an existing character", async () => {
        const username = `TestUser_${Date.now()}`
        const characterName = `TestCharacter_${Date.now()}`

        const userResponse = await request(app)
            .post("/users")
            .send({
                username,
                password: "testpass"
            })

        expect(userResponse.status).toBe(201)

        const userId = userResponse.body.user_id

        const characterResponse = await request(app)
            .post(`/users/${userId}/characters`)
            .send({
                name: characterName,
                max_weight: 100
            })

        expect(characterResponse.status).toBe(201)

        const deleteResponse = await request(app)
            .delete(
                `/users/${userId}/characters/${encodeURIComponent(characterName)}`
            )

        expect(deleteResponse.status).toBe(200)
        expect(deleteResponse.body.deleted).toBe(true)

        const getResponse = await request(app)
            .get(
                `/users/${userId}/characters/${encodeURIComponent(characterName)}`
            )

        expect(getResponse.status).toBe(404)
    })

    test("DELETE /users/:id/characters/:name returns 404 for a missing character", async () => {
        const username = `TestUser_${Date.now()}`

        const userResponse = await request(app)
            .post("/users")
            .send({
                username,
                password: "testpass"
            })

        const userId = userResponse.body.user_id

        const deleteResponse = await request(app)
            .delete(`/users/${userId}/characters/DoesNotExist`)

        expect(deleteResponse.status).toBe(404)
        expect(deleteResponse.body.error).toBe("Character not found")
    })
    // --- Inventory Routes ---

    // GET /users/:id/characters/:characterName/inventory
    test("GET /users/123456789/characters/Kcos/inventory returns an array", async () => {
        
        const response = await request(app).get("/users/123456789/characters/Kcos/inventory")

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
    })

    // GET /users/:id/characters/:characterName/inventory/:inventoryIndex
    test("GET /users/123456789/characters/Kcos/inventory/backpack returns backpack", async () => {
        
        const response = await request(app).get("/users/123456789/characters/Kcos/inventory/backpack")

        expect(response.status).toBe(200)
        expect(response.body.index).toBe("backpack")
    })

    test("GET /users/123456789/characters/Kcos/inventory/flooper returns 404 and undefined", async () => {
        
        const response = await request(app).get("/users/123456789/characters/Kcos/inventory/flooper")

        expect(response.status).toBe(404)
        expect(response.body.index).toBe(undefined)
    })

    // GET /users/:id/characters/:characterName/inventory/:inventoryIndex/items/:itemIndex
    test("GET /users/123456789/characters/Kcos/inventory/backpack/items/ink-pen returns ink pen", async () => {
        
        const response = await request(app).get("/users/123456789/characters/Kcos/inventory/backpack/items/ink-pen")

        expect(response.status).toBe(200)
        expect(response.body.index).toBe("ink-pen")
    })

    test("GET /users/123456789/characters/Kcos/inventory/backpack/items/flooper returns 404 and undefined", async () => {
        
        const response = await request(app).get("/users/123456789/characters/Kcos/inventory/backpack/items/flooper")

        expect(response.status).toBe(404)
        expect(response.body.index).toBe(undefined)
    })
})