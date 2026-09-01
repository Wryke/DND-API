const request = require("supertest")
const app = require("../app")

describe("Item Routes", () => {
    let testItem
    let testCategory

    beforeAll(async () => {
        const itemResponse = await request(app)
            .get("/items/index/backpack")

        expect(itemResponse.status).toBe(200)

        testItem = itemResponse.body

        const categoryResponse = await request(app)
            .get("/items/categories")

        expect(categoryResponse.status).toBe(200)

        testCategory = categoryResponse.body.find(
            category =>
                category.category_index === "adventuring-gear"
        )

        expect(testCategory).toBeDefined()
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
                .toHaveProperty("description")
            expect(response.body[0])
                .toHaveProperty("weight")
            expect(response.body[0])
                .toHaveProperty("cost_quantity")
            expect(response.body[0])
                .toHaveProperty("currency_code")
            expect(response.body[0])
                .toHaveProperty("currency_name")
            expect(response.body[0])
                .toHaveProperty("item_type_name")
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

        test("filters items by category index", async () => {
            const response = await request(app)
                .get(
                    `/items?category=` +
                    encodeURIComponent(
                        testCategory.category_index
                    )
                )

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
            expect(response.body.length).toBeGreaterThan(0)

            expect(
                response.body.some(item =>
                    item.item_id === testItem.item_id
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

            expect(response.body[0])
                .toHaveProperty("category_id")
            expect(response.body[0])
                .toHaveProperty("category_index")
            expect(response.body[0])
                .toHaveProperty("category_name")
        })

        test("contains the adventuring gear category", async () => {
            const response = await request(app)
                .get("/items/categories")

            expect(
                response.body.some(category =>
                    category.category_index ===
                    testCategory.category_index
                )
            ).toBe(true)
        })

        test("does not contain duplicate category indexes", async () => {
            const response = await request(app)
                .get("/items/categories")

            const categoryIndexes = response.body.map(
                category => category.category_index
            )

            const uniqueCategories =
                new Set(categoryIndexes)

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

        test("returns standardized item data", async () => {
            const response = await request(app)
                .get("/items/index/backpack")

            expect(response.status).toBe(200)
            expect(response.body)
                .toHaveProperty("description")
            expect(response.body)
                .toHaveProperty("weight")
            expect(response.body)
                .toHaveProperty("cost_quantity")
            expect(response.body)
                .toHaveProperty("currency_code")
            expect(response.body)
                .toHaveProperty("currency_name")
            expect(response.body)
                .toHaveProperty("item_type_name")
        })

        test("returns an item when index and category match", async () => {
            const response = await request(app)
                .get(
                    `/items/index/${testItem.item_index}` +
                    `?category=` +
                    encodeURIComponent(
                        testCategory.category_index
                    )
                )

            expect(response.status).toBe(200)
            expect(response.body.item_id)
                .toBe(testItem.item_id)
            expect(response.body.item_index)
                .toBe(testItem.item_index)
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
        test("returns items by name", async () => {
            const response = await request(app)
                .get(
                    `/items/name/` +
                    encodeURIComponent(testItem.name)
                )

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
            expect(response.body.length).toBeGreaterThan(0)

            expect(
                response.body.some(item =>
                    item.item_id === testItem.item_id
                )
            ).toBe(true)
        })

        test("returns items when name and category match", async () => {
            const response = await request(app)
                .get(
                    `/items/name/` +
                    encodeURIComponent(testItem.name) +
                    `?category=` +
                    encodeURIComponent(
                        testCategory.category_index
                    )
                )

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
            expect(response.body.length).toBeGreaterThan(0)

            expect(
                response.body.some(item =>
                    item.item_id === testItem.item_id
                )
            ).toBe(true)
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
            expect(response.body.error).toBe(
                "Item could not be found"
            )
        })
    })
})