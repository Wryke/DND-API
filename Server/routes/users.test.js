const request = require("supertest")
const app = require("../app")
const db = require("../db/connection.js")
// --- Routes ---

// GET /users/
// GET /users/:id
// GET /users/:id/characters
// GET /users/:id/characters/:characterName
// GET /users/:id/characters/:characterName/inventory
// GET /users/:id/characters/:characterName/inventory/:inventoryIndex
// GET /users/:id/characters/:characterName/inventory/:inventoryIndex/items/:itemIndex

// POST /users/
// POST /users/:id/characters
// POST /users/:id/characters/:characterName

// PUT /users/:id/characters/:characterName
// PUT /users/:id/characters/:characterName/inventory/:inventoryIndex

// PATCH /users/:id/characters/:characterName/inventory/:inventoryIndex/:itemIndex

// DELETE /users/:id
// DELETE /users/:id/characters/:characterName
// DELETE /users/:id/characters/:characterName/inventory/:inventoryIndex
// DELETE /users/:id/characters/:characterName/inventory/:inventoryIndex/items/:itemIndex

describe("User Routes", () => {

    afterEach(() => {
        db.prepare(`
            DELETE FROM users
            WHERE username LIKE 'TestUser_%'
            OR username LIKE 'DuplicateUser_%'
        `).run()
    })

    // GET /users/
    test("GET /users/ returns an array", async () => {
        
        const response = await request(app).get("/users/")

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
    })

    // GET /users/:id
    test("GET /users/123456789 returns Wryke", async () => {
        
        const response = await request(app).get("/users/123456789")

        expect(response.status).toBe(200)
        expect(response.body.username).toBe("Wryke")
    })

    test("GET /users/987654321 returns 404 undefined", async () => {
        
        const response = await request(app).get("/users/987654321")

        expect(response.status).toBe(404)
        expect(response.body.username).toBe(undefined)
    })

    // GET /users/:id/characters
    test("GET /users/123456789/characters returns an array", async () => {
        
        const response = await request(app).get("/users/123456789/characters")

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
    })

    // GET /users/:id/characters/:characterName
    test("GET /users/123456789/characters/Kcos returns Kcos", async () => {
        
        const response = await request(app).get("/users/123456789/characters/Kcos")

        expect(response.status).toBe(200)
        expect(response.body.character_name).toBe("Kcos")
    })

    test("GET /users/123456789/characters/flooper returns 404 undefined", async () => {
        
        const response = await request(app).get("/users/123456789/characters/flooper")

        expect(response.status).toBe(404)
        expect(response.body.character_name).toBe(undefined)
    })

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
})