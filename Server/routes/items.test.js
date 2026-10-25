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
                category.category_index ===
                "adventuring-gear"
        )

        expect(testCategory).toBeDefined()
    })


    // --- GET /items ---

    describe("GET /items", () => {

        test("returns all available items", async () => {
            const response = await request(app)
                .get("/items")

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
            expect(response.body.length).toBeGreaterThan(0)
        })


        test("returns standardized item data", async () => {
            const response = await request(app)
                .get("/items")

            expect(response.status).toBe(200)

            const item = response.body[0]

            expect(item).toHaveProperty("item_id")
            expect(item).toHaveProperty("item_index")
            expect(item).toHaveProperty("name")
            expect(item).toHaveProperty("description")
            expect(item).toHaveProperty("weight")
            expect(item).toHaveProperty("cost_quantity")
            expect(item).toHaveProperty("currency_code")
            expect(item).toHaveProperty("currency_name")
            expect(item).toHaveProperty("item_type_name")
        })


        test("contains the backpack item", async () => {
            const response = await request(app)
                .get("/items")

            expect(response.status).toBe(200)

            const backpack = response.body.find(
                item =>
                    item.item_id === testItem.item_id
            )

            expect(backpack).toBeDefined()
            expect(backpack.item_index).toBe("backpack")
            expect(backpack.name).toBe("Backpack")
        })


        test("returns items ordered by name", async () => {
            const response = await request(app)
                .get("/items")

            expect(response.status).toBe(200)

            const names = response.body.map(
                item => item.name
            )

            const sortedNames = [...names].sort(
                (a, b) => a.localeCompare(b)
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

            const backpack = response.body.find(
                item =>
                    item.item_id === testItem.item_id
            )

            expect(backpack).toBeDefined()
        })


        test("trims the category query parameter", async () => {
            const response = await request(app)
                .get(
                    "/items?category=" +
                    encodeURIComponent(
                        `  ${testCategory.category_index}  `
                    )
                )

            expect(response.status).toBe(200)
            expect(response.body.length).toBeGreaterThan(0)

            const backpack = response.body.find(
                item =>
                    item.item_id === testItem.item_id
            )

            expect(backpack).toBeDefined()
        })


        test("returns an empty array for a missing category", async () => {
            const response = await request(app)
                .get("/items?category=flooper")

            expect(response.status).toBe(200)
            expect(response.body).toEqual([])
        })


        test("treats an empty category as no filter", async () => {
            const response = await request(app)
                .get("/items?category=")

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
            expect(response.body.length).toBeGreaterThan(0)
        })

    })


    // --- GET /items/categories ---

    describe("GET /items/categories", () => {

        test("returns all item categories", async () => {
            const response = await request(app)
                .get("/items/categories")

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
            expect(response.body.length).toBeGreaterThan(0)
        })


        test("returns standardized category data", async () => {
            const response = await request(app)
                .get("/items/categories")

            expect(response.status).toBe(200)

            const category = response.body[0]

            expect(category).toHaveProperty("category_id")
            expect(category).toHaveProperty("category_index")
            expect(category).toHaveProperty("category_name")
        })


        test("contains the adventuring gear category", async () => {
            const response = await request(app)
                .get("/items/categories")

            const category = response.body.find(
                category =>
                    category.category_index ===
                    testCategory.category_index
            )

            expect(category).toBeDefined()
        })


        test("does not contain duplicate category indexes", async () => {
            const response = await request(app)
                .get("/items/categories")

            const categoryIndexes = response.body.map(
                category => category.category_index
            )

            const uniqueCategoryIndexes =
                new Set(categoryIndexes)

            expect(uniqueCategoryIndexes.size)
                .toBe(categoryIndexes.length)
        })

    })


    // --- GET /items/name/:name ---

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

            const backpack = response.body.find(
                item =>
                    item.item_id === testItem.item_id
            )

            expect(backpack).toBeDefined()
        })


        test("returns standardized item data", async () => {
            const response = await request(app)
                .get(
                    `/items/name/` +
                    encodeURIComponent(testItem.name)
                )

            expect(response.status).toBe(200)

            const item = response.body[0]

            expect(item).toHaveProperty("item_id")
            expect(item).toHaveProperty("item_index")
            expect(item).toHaveProperty("name")
            expect(item).toHaveProperty("description")
            expect(item).toHaveProperty("weight")
            expect(item).toHaveProperty("cost_quantity")
            expect(item).toHaveProperty("currency_code")
            expect(item).toHaveProperty("currency_name")
            expect(item).toHaveProperty("item_type_name")
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

            const backpack = response.body.find(
                item =>
                    item.item_id === testItem.item_id
            )

            expect(backpack).toBeDefined()
        })


        test("trims the category query parameter", async () => {
            const response = await request(app)
                .get(
                    `/items/name/` +
                    encodeURIComponent(testItem.name) +
                    "?category=" +
                    encodeURIComponent(
                        `  ${testCategory.category_index}  `
                    )
                )

            expect(response.status).toBe(200)
            expect(response.body.length).toBeGreaterThan(0)
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


        test("returns 404 for a missing item name", async () => {
            const response = await request(app)
                .get("/items/name/Flooper")

            expect(response.status).toBe(404)
            expect(response.body.error).toBe(
                "Item could not be found"
            )
        })

    })


    // --- GET /items/index/:index ---

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
                .toHaveProperty("item_id")

            expect(response.body)
                .toHaveProperty("item_index")

            expect(response.body)
                .toHaveProperty("name")

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


        test("trims the category query parameter", async () => {
            const response = await request(app)
                .get(
                    `/items/index/${testItem.item_index}` +
                    "?category=" +
                    encodeURIComponent(
                        `  ${testCategory.category_index}  `
                    )
                )

            expect(response.status).toBe(200)

            expect(response.body.item_id)
                .toBe(testItem.item_id)
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


        test("returns 404 for a missing item index", async () => {
            const response = await request(app)
                .get("/items/index/flooper")

            expect(response.status).toBe(404)
            expect(response.body.error).toBe(
                "Item could not be found"
            )
        })

    })


    // --- GET /items/index/:index/details ---

    describe("GET /items/index/:index/details", () => {

        test("returns weapon details", async () => {
            const response = await request(app)
                .get("/items/index/longsword/details")

            expect(response.status).toBe(200)

            expect(response.body)
                .toHaveProperty("item_id")

            expect(response.body)
                .toHaveProperty("weapon_category")

            expect(response.body)
                .toHaveProperty("range_normal")

            expect(response.body)
                .toHaveProperty("range_long")

            expect(response.body)
                .toHaveProperty("throw_range_normal")

            expect(response.body)
                .toHaveProperty("throw_range_long")

            expect(response.body)
                .toHaveProperty("mastery_name")

            expect(response.body.mastery)
                .toHaveProperty("mastery_index")

            expect(response.body.mastery)
                .toHaveProperty("mastery_name")

            expect(Array.isArray(response.body.damage))
                .toBe(true)

            expect(Array.isArray(response.body.properties))
                .toBe(true)

            expect(response.body.damage.length)
                .toBeGreaterThan(0)

            expect(response.body.damage[0])
                .toHaveProperty("damage_dice")

            expect(response.body.damage[0])
                .toHaveProperty("damage_index")

            expect(response.body.damage[0])
                .toHaveProperty("damage_name")

            expect(response.body.damage[0])
                .toHaveProperty("damage_mode")
        })


        test("returns weapon properties", async () => {
            const response = await request(app)
                .get("/items/index/longsword/details")

            expect(response.status).toBe(200)

            expect(Array.isArray(response.body.properties))
                .toBe(true)

            expect(response.body.properties.length)
                .toBeGreaterThan(0)

            expect(response.body.properties[0])
                .toHaveProperty("property_index")

            expect(response.body.properties[0])
                .toHaveProperty("property_name")
        })


        test("returns armor details", async () => {
            const response = await request(app)
                .get("/items/index/leather-armor/details")

            expect(response.status).toBe(200)

            expect(response.body)
                .toHaveProperty("item_id")

            expect(response.body)
                .toHaveProperty("armor_category")

            expect(response.body)
                .toHaveProperty("base_ac")

            expect(response.body)
                .toHaveProperty("dex_bonus")

            expect(response.body)
                .toHaveProperty("max_bonus")

            expect(response.body)
                .toHaveProperty("strength_minimum")

            expect(response.body)
                .toHaveProperty("stealth_disadvantage")

            expect(response.body)
                .toHaveProperty("don_time")

            expect(response.body)
                .toHaveProperty("don_time_unit")

            expect(response.body)
                .toHaveProperty("doff_time")

            expect(response.body)
                .toHaveProperty("doff_time_unit")

            expect(Array.isArray(response.body.resistances))
                .toBe(true)
        })


        test("returns container details", async () => {
            const response = await request(app)
                .get("/items/index/backpack/details")

            expect(response.status).toBe(200)

            expect(response.body)
                .toHaveProperty("item_id")

            expect(response.body)
                .toHaveProperty("max_volume")

            expect(response.body)
                .toHaveProperty("max_carry_weight")

            expect(response.body)
                .toHaveProperty("max_item_count")
        })


        test("returns ammunition details", async () => {
            const response = await request(app)
                .get("/items/index/arrows/details")

            expect(response.status).toBe(200)

            expect(response.body)
                .toHaveProperty("item_id")

            expect(response.body)
                .toHaveProperty("bundle_quantity")

            expect(response.body)
                .toHaveProperty("storage_item_index")

            expect(response.body)
                .toHaveProperty("storage_item_name")
        })


        test("returns tool details", async () => {
            const response = await request(app)
                .get("/items/index/thieves-tools/details")

            expect(response.status).toBe(200)

            expect(response.body)
                .toHaveProperty("item_id")

            expect(response.body)
                .toHaveProperty("ability_index")

            expect(response.body)
                .toHaveProperty("ability_name")

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
                .get(
                    "/items/index/explorers-pack/details"
                )

            expect(response.status).toBe(200)

            expect(response.body)
                .toHaveProperty("item_id")

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


    // --- GET /items/equipment-slots ---

    describe("GET /items/equipment-slots", () => {

        test("returns all equipment slots", async () => {
            const response = await request(app)
                .get("/items/equipment-slots")

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
            expect(response.body.length).toBeGreaterThan(0)
        })


        test("returns standardized equipment slot data", async () => {
            const response = await request(app)
                .get("/items/equipment-slots")

            expect(response.status).toBe(200)

            const slot = response.body[0]

            expect(slot)
                .toHaveProperty("equipment_slot_id")

            expect(slot)
                .toHaveProperty("equipment_slot_index")

            expect(slot)
                .toHaveProperty("equipment_slot_name")
        })


        test("contains the main hand equipment slot", async () => {
            const response = await request(app)
                .get("/items/equipment-slots")

            const mainHand = response.body.find(
                slot =>
                    slot.equipment_slot_index ===
                    "main_hand"
            )

            expect(mainHand).toBeDefined()

            expect(mainHand.equipment_slot_name)
                .toBe("Main Hand")
        })


        test("contains the off hand equipment slot", async () => {
            const response = await request(app)
                .get("/items/equipment-slots")

            const offHand = response.body.find(
                slot =>
                    slot.equipment_slot_index ===
                    "off_hand"
            )

            expect(offHand).toBeDefined()

            expect(offHand.equipment_slot_name)
                .toBe("Off Hand")
        })

    })

})