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

describe("user routes", () => {

    // GET /users/
    test("GET /users/ returns an array", async () => {
        const response = await request(app).get("/users/")

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
    })

    // GET /users/:id
        test("GET /", async () => {
        const response = await request(app).get("")

        expect(response.status).toBe(200)
        expect(response.body.index).toBe("")
    })

    test("GET /", async () => {
        const response = await request(app).get("")

        expect(response.status).toBe(404)
        expect(response.body.index).toBe(undefined)
    })

    // GET /users/:id/characters
    test("GET /users/ returns an array", async () => {
        const response = await request(app).get("/users/")

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
    })

    // GET /users/:id/characters/:characterName
        test("GET /", async () => {
        const response = await request(app).get("")

        expect(response.status).toBe(200)
        expect(response.body.index).toBe("")
    })

    test("GET /", async () => {
        const response = await request(app).get("")

        expect(response.status).toBe(404)
        expect(response.body.index).toBe(undefined)
    })

    // GET /users/:id/characters/:characterName/inventory
        test("GET /users/ returns an array", async () => {
        const response = await request(app).get("/users/")

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
    })

    // GET /users/:id/characters/:characterName/inventory/:inventoryIndex
        test("GET /", async () => {
        const response = await request(app).get("")

        expect(response.status).toBe(200)
        expect(response.body.index).toBe("")
    })

    test("GET /", async () => {
        const response = await request(app).get("")

        expect(response.status).toBe(404)
        expect(response.body.index).toBe(undefined)
    })

    // GET /users/:id/characters/:characterName/inventory/:inventoryIndex/items/:itemIndex
        test("GET /", async () => {
        const response = await request(app).get("")

        expect(response.status).toBe(200)
        expect(response.body.index).toBe("")
    })

    test("GET /", async () => {
        const response = await request(app).get("")

        expect(response.status).toBe(404)
        expect(response.body.index).toBe(undefined)
    })
})