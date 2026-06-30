const request = require("supertest")
const app = require("../app")

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
})