const request = require("supertest")
const app = require("../app")

describe("Item Routes", () => {
    let testItem

    beforeAll(async () => {
        const response = await request(app)
            .get("/items/index/backpack")

        expect(response.status).toBe(200)

        testItem = response.body
    })

    describe("GET /items", () => {
        test("returns all available items", async () => {
            const response = await request(app)
                .get("/items")

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
            expect(response.body.length).toBeGreaterThan(0)

            expect(response.body[0])
                .toHaveProperty("item_id")
            expect(response.body[0])
                .toHaveProperty("item_index")
            expect(response.body[0])
                .toHaveProperty("name")
            expect(response.body[0])
                .toHaveProperty("item_category")
        })

        test("contains the backpack item", async () => {
            const response = await request(app)
                .get("/items")

            expect(
                response.body.some(item =>
                    item.item_id === testItem.item_id
                )
            ).toBe(true)
        })

        test("returns items ordered by name", async () => {
            const response = await request(app)
                .get("/items")

            const names = response.body.map(
                item => item.name
            )

            const sortedNames = [...names].sort((a, b) =>
                a.localeCompare(b)
            )

            expect(names).toEqual(sortedNames)
        })

        test("filters items by category", async () => {
            const response = await request(app)
                .get(
                    `/items?category=` +
                    encodeURIComponent(
                        testItem.item_category
                    )
                )

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
            expect(response.body.length).toBeGreaterThan(0)

            expect(
                response.body.every(item =>
                    item.item_category ===
                    testItem.item_category
                )
            ).toBe(true)
        })

        test("returns an empty array for a missing category", async () => {
            const response = await request(app)
                .get("/items?category=flooper")

            expect(response.status).toBe(200)
            expect(response.body).toEqual([])
        })
    })

    describe("GET /items/categories", () => {
        test("returns all unique item categories", async () => {
            const response = await request(app)
                .get("/items/categories")

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
            expect(response.body.length).toBeGreaterThan(0)

            expect(
                response.body.every(category =>
                    typeof category === "string"
                )
            ).toBe(true)
        })

        test("contains the backpack category", async () => {
            const response = await request(app)
                .get("/items/categories")

            expect(response.body).toContain(
                testItem.item_category
            )
        })

        test("does not contain duplicate categories", async () => {
            const response = await request(app)
                .get("/items/categories")

            const uniqueCategories =
                new Set(response.body)

            expect(uniqueCategories.size)
                .toBe(response.body.length)
        })
    })

    describe("GET /items/index/:index", () => {
        test("returns an item by index", async () => {
            const response = await request(app)
                .get("/items/index/backpack")

            expect(response.status).toBe(200)
            expect(response.body.item_id)
                .toBe(testItem.item_id)
            expect(response.body.item_index)
                .toBe("backpack")
            expect(response.body.name)
                .toBe("Backpack")
        })

        test("returns an item when index and category match", async () => {
            const response = await request(app)
                .get(
                    `/items/index/${testItem.item_index}` +
                    `?category=` +
                    encodeURIComponent(
                        testItem.item_category
                    )
                )

            expect(response.status).toBe(200)
            expect(response.body.item_id)
                .toBe(testItem.item_id)
            expect(response.body.item_category)
                .toBe(testItem.item_category)
        })

        test("returns 404 when the category does not match", async () => {
            const response = await request(app)
                .get(
                    `/items/index/${testItem.item_index}` +
                    "?category=flooper"
                )

            expect(response.status).toBe(404)
            expect(response.body.error).toBe(
                "Item could not be found"
            )
        })

        test("returns 404 for a missing index", async () => {
            const response = await request(app)
                .get("/items/index/flooper")

            expect(response.status).toBe(404)
            expect(response.body.item_index)
                .toBeUndefined()
        })
    })

    describe("GET /items/name/:name", () => {
        test("returns an item by name", async () => {
            const response = await request(app)
                .get(
                    `/items/name/` +
                    encodeURIComponent(testItem.name)
                )

            expect(response.status).toBe(200)
            expect(response.body.item_id)
                .toBe(testItem.item_id)
            expect(response.body.name)
                .toBe(testItem.name)
            expect(response.body.item_index)
                .toBe(testItem.item_index)
        })

        test("returns an item when name and category match", async () => {
            const response = await request(app)
                .get(
                    `/items/name/` +
                    encodeURIComponent(testItem.name) +
                    `?category=` +
                    encodeURIComponent(
                        testItem.item_category
                    )
                )

            expect(response.status).toBe(200)
            expect(response.body.item_id)
                .toBe(testItem.item_id)
            expect(response.body.item_category)
                .toBe(testItem.item_category)
        })

        test("returns 404 when the category does not match", async () => {
            const response = await request(app)
                .get(
                    `/items/name/` +
                    encodeURIComponent(testItem.name) +
                    "?category=flooper"
                )

            expect(response.status).toBe(404)
            expect(response.body.error).toBe(
                "Item could not be found"
            )
        })

        test("returns 404 for a missing name", async () => {
            const response = await request(app)
                .get("/items/name/Flooper")

            expect(response.status).toBe(404)
            expect(response.body.name).toBeUndefined()
        })
    })
})