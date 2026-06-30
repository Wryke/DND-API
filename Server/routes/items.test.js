const request = require("supertest")
const app = require("../app")

// --- Routes ---

// GET /items/equipment
// GET /items/equipment/:index

// GET /items/magic
// GET /items/magic/:index

// GET /items/all/:index

describe("Item Routes", () => {

    // GET /items/equipment?category=""
    test("GET /items/equipment returns an array", async () => {
        const response = await request(app).get("/items/equipment")

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
        expect(response.body.length).toBeGreaterThan(0);

        expect(response.body[0]).toHaveProperty("item_id");
        expect(response.body[0]).toHaveProperty("item_index");
        expect(response.body[0]).toHaveProperty("name");
        expect(response.body[0]).toHaveProperty("item_category");
    })

    test("GET /items/equipment?category=armor returns an aray where all items have category = armor", async () => {
        const response = await request(app).get("/items/equipment?category=armor")

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
        expect(response.body.length).toBeGreaterThan(0);

        expect(
            response.body.every(item => item.item_category === "armor")
        ).toBe(true);
    })

    test("GET /items/equipment?category=floopers returns an empty aray", async () => {
        const response = await request(app).get("/items/equipment?category=floopers")

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
        expect(response.body).toHaveLength(0);
    })

    // GET /items/equipment/:index
    test("GET /items/equipment/backpack returns backpack", async () => {
        const response = await request(app).get("/items/equipment/backpack")

        expect(response.status).toBe(200)
        expect(response.body.item_index).toBe("backpack")
    })

    test("GET /items/equipment/flooper returns 404 and undefined", async () => {
        const response = await request(app).get("/items/equipment/flooper")

        expect(response.status).toBe(404)
        expect(response.body.item_index).toBeUndefined()
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
        expect(response.body.index).toBeUndefined()
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
        expect(response.body.index).toBeUndefined()
    })
})