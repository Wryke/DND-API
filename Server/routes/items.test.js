const request = require("supertest")
const app = require("../app")

// GET /items/equipment
// GET /items/equipment/:index

// GET /items/magic
// GET /items/magic/:index

// GET /items/all/:index

// GET /items/categories
// GET /items/categories/:category
// GET /items/categories/:category/:index

describe("item routes", () => {

    // GET /items/equipment
    test("GET /items/equipment returns an array", async () => {
        const response = await request(app).get("/items/equipment")

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
    })

    // GET /items/equipment/:index
    test("GET /items/equipment/backpack returns backpack", async () => {
        const response = await request(app).get("/items/equipment/backpack")

        expect(response.status).toBe(200)
        expect(response.body.index).toBe("backpack")
    })

    test("GET /items/equipment/flooper returns 404 and undefined", async () => {
        const response = await request(app).get("/items/equipment/flooper")

        expect(response.status).toBe(404)
        expect(response.body.index).toBe(undefined)
    })

    // GET /items/magic
    test("GET /items/magic returns an array", async () => {
        const response = await request(app).get("/items/magic")

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
    })

    // GET /items/magic/:index
    test("GET /items/magic/bag-of-holding returns bag of holding", async () => {
        const response = await request(app).get("/items/magic/bag-of-holding")

        expect(response.status).toBe(200)
        expect(response.body.index).toBe("bag-of-holding")
    })

    test("GET /items/magic/flooper returns 404 and undefined", async () => {
        const response = await request(app).get("/items/equipment/flooper")

        expect(response.status).toBe(404)
        expect(response.body.index).toBe(undefined)
    })

    // GET /items/all/:index
    test("GET /items/all/backpack returns backpack", async () => {
        const response = await request(app).get("/items/all/backpack")

        expect(response.status).toBe(200)
        expect(response.body.index).toBe("backpack")
    })

    test("GET /items/all/bag-of-holding returns bag of holding", async () => {
        const response = await request(app).get("/items/all/bag-of-holding")

        expect(response.status).toBe(200)
        expect(response.body.index).toBe("bag-of-holding")
    })

    test("GET /items/all/flooper returns 404 and undefined", async () => {
        const response = await request(app).get("/items/all/flooper")

        expect(response.status).toBe(404)
        expect(response.body.index).toBe(undefined)
    })

    // GET /items/categories
    test("GET /items/categores returns an array", async () => {
        const response = await request(app).get("/items/categories")

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
    })

    // GET /items/categories/:category
    test("GET /items/categories/adventuring-gear returns backpack", async () => {
        const response = await request(app).get("/items/categories/adventuring-gear")

        expect(response.status).toBe(200)
        expect(response.body.index).toBe("adventuring-gear")
    })

    test("GET /items/categories/flooper returns 404 and undefined", async () => {
        const response = await request(app).get("/items/categories/flooper")

        expect(response.status).toBe(404)
        expect(response.body.index).toBe(undefined)
    })

    // GET /items/categories/:category/:index
    test("GET /items/categories/adventuring-gear/backpack returns backpack", async () => {
        const response = await request(app).get("/items/categories/adventuring-gear/backpack")

        expect(response.status).toBe(200)
        expect(response.body.index).toBe("backpack")
    })

    test("GET /items/categories/adventuring-gear/flooper returns 404 and undefined", async () => {
        const response = await request(app).get("/items/categories/adventuring-gear/flooper")

        expect(response.status).toBe(404)
        expect(response.body.index).toBe(undefined)
    })
})