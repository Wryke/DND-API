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

    describe("GET /items/index/:index/details", () => {
        test("returns weapon details", async () => {
            const response = await request(app)
                .get("/items/index/longsword/details")

            expect(response.status).toBe(200)
            expect(response.body.item_id).toBeDefined()
            expect(response.body.weapon_category).toBeDefined()
            expect(response.body).toHaveProperty("range_normal")
            expect(response.body).toHaveProperty("range_long")
            expect(response.body).toHaveProperty("throw_range_normal")
            expect(response.body).toHaveProperty("throw_range_long")

            expect(response.body.mastery).toBeDefined()
            expect(response.body.mastery)
                .toHaveProperty("mastery_index")
            expect(response.body.mastery)
                .toHaveProperty("mastery_name")

            expect(response.body.properties[0])
                .toHaveProperty("property_index")
            expect(response.body.properties[0])
                .toHaveProperty("property_name")
            expect(Array.isArray(response.body.damage))
                .toBe(true)
            expect(Array.isArray(response.body.properties))
                .toBe(true)

            expect(response.body.damage[0])
                .toHaveProperty("damage_dice")
            expect(response.body.damage[0])
                .toHaveProperty("damage_index")
            expect(response.body.damage[0])
                .toHaveProperty("damage_name")
            expect(response.body.damage[0])
                .toHaveProperty("damage_mode")
        })

        test("returns armor details", async () => {
            const response = await request(app)
                .get("/items/index/leather-armor/details")

            expect(response.status).toBe(200)
            expect(response.body.item_id).toBeDefined()
            expect(response.body.armor_category).toBeDefined()
            expect(response.body.base_ac).toBeDefined()
            expect(response.body).toHaveProperty("dex_bonus")
            expect(response.body).toHaveProperty("max_bonus")
            expect(response.body).toHaveProperty("strength_minimum")
            expect(response.body).toHaveProperty("stealth_disadvantage")
            expect(response.body).toHaveProperty("don_time")
            expect(response.body).toHaveProperty("don_time_unit")
            expect(response.body).toHaveProperty("doff_time")
            expect(response.body).toHaveProperty("doff_time_unit")
            expect(Array.isArray(response.body.resistances))
                .toBe(true)
        })

        test("returns container details", async () => {
            const response = await request(app)
                .get("/items/index/backpack/details")

            console.log(response.body)

            expect(response.status).toBe(200)
            expect(response.body.item_id).toBeDefined()
            expect(response.body).toHaveProperty("max_volume")
            expect(response.body).toHaveProperty("max_carry_weight")
            expect(response.body).toHaveProperty("max_item_count")
        })

        test("returns ammunition details", async () => {
            const response = await request(app)
                .get("/items/index/arrows/details")

            expect(response.status).toBe(200)
            expect(response.body.item_id).toBeDefined()
            expect(response.body.bundle_quantity).toBeDefined()
            expect(response.body).toHaveProperty("storage_item_index")
            expect(response.body).toHaveProperty("storage_item_name")
        })

        test("returns tool details", async () => {
            const response = await request(app)
                .get("/items/index/thieves-tools/details")

            expect(response.status).toBe(200)
            expect(response.body.item_id).toBeDefined()
            expect(response.body).toHaveProperty("ability_index")
            expect(response.body).toHaveProperty("ability_name")

            expect(Array.isArray(response.body.utilizes))
                .toBe(true)
            expect(Array.isArray(response.body.crafts))
                .toBe(true)

            expect(response.body.utilizes.length)
                .toBeGreaterThan(0)

            expect(response.body.utilizes[0])
                .toHaveProperty("name")
            expect(response.body.utilizes[0])
                .toHaveProperty("ability_index")
            expect(response.body.utilizes[0])
                .toHaveProperty("ability_name")
            expect(response.body.utilizes[0])
                .toHaveProperty("dc_value")
            expect(response.body.utilizes[0])
                .toHaveProperty("success_type")
        })

        test("returns equipment pack details", async () => {
            const response = await request(app)
                .get("/items/index/explorers-pack/details")

            expect(response.status).toBe(200)
            expect(response.body.item_id).toBeDefined()
            expect(Array.isArray(response.body.contents))
                .toBe(true)
            expect(response.body.contents.length)
                .toBeGreaterThan(0)
        })

        test("returns null for an item without subtype details", async () => {
            const response = await request(app)
                .get("/items/index/acid/details")

            expect(response.status).toBe(200)
            expect(response.body).toBeNull()
        })

        test("returns 404 for a missing item", async () => {
            const response = await request(app)
                .get("/items/index/flooper/details")

            expect(response.status).toBe(404)
            expect(response.body.error).toBe(
                "Item could not be found"
            )
        })
    })
})