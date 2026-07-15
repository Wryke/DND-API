const {
    findAllItems,
    findItemsByCategory,
    findItemByIndex,
    findItemByName,
    findAllItemCategories,
    findItemByIndexAndCategory,
    findItemByNameAndCategory
} = require("./itemQueries")

describe("Database Item Queries", () => {
    let testItem

    beforeAll(() => {
        testItem = findItemByIndex("backpack")

        expect(testItem).toBeDefined()
    })

    describe("findAllItems", () => {
        test("returns a non-empty array of item objects", () => {
            const items = findAllItems()

            expect(Array.isArray(items)).toBe(true)
            expect(items.length).toBeGreaterThan(0)

            expect(items[0]).toHaveProperty("item_id")
            expect(items[0]).toHaveProperty("item_index")
            expect(items[0]).toHaveProperty("name")
            expect(items[0]).toHaveProperty("item_category")
        })

        test("contains the backpack item", () => {
            const items = findAllItems()

            expect(
                items.some(item =>
                    item.item_id === testItem.item_id
                )
            ).toBe(true)
        })

        test("returns items ordered by name", () => {
            const items = findAllItems()
            const names = items.map(item => item.name)

            const sortedNames = [...names].sort((a, b) =>
                a.localeCompare(b)
            )

            expect(names).toEqual(sortedNames)
        })
    })

    describe("findItemByIndex", () => {
        test("returns an existing item by index", () => {
            const item = findItemByIndex("backpack")

            expect(item).toBeDefined()
            expect(item.item_index).toBe("backpack")
            expect(item.name).toBe("Backpack")
        })

        test("returns undefined for a missing index", () => {
            const item = findItemByIndex("flooper")

            expect(item).toBeUndefined()
        })
    })

    describe("findItemByName", () => {
        test("returns an existing item by name", () => {
            const item = findItemByName("Backpack")

            expect(item).toBeDefined()
            expect(item.name).toBe("Backpack")
            expect(item.item_index).toBe("backpack")
        })

        test("returns undefined for a missing name", () => {
            const item = findItemByName("Flooper")

            expect(item).toBeUndefined()
        })
    })

    describe("findAllItemCategories", () => {
        test("returns a non-empty array of category strings", () => {
            const categories = findAllItemCategories()

            expect(Array.isArray(categories)).toBe(true)
            expect(categories.length).toBeGreaterThan(0)

            expect(
                categories.every(category =>
                    typeof category === "string"
                )
            ).toBe(true)
        })

        test("contains the backpack category", () => {
            const categories = findAllItemCategories()

            expect(categories).toContain(
                testItem.item_category
            )
        })

        test("does not return duplicate categories", () => {
            const categories = findAllItemCategories()
            const uniqueCategories = new Set(categories)

            expect(uniqueCategories.size)
                .toBe(categories.length)
        })
    })
    describe("findItemsByCategory", () => {
        test("returns only items from the requested category", () => {
            const items = findItemsByCategory(
                testItem.item_category
            )

            expect(Array.isArray(items)).toBe(true)
            expect(items.length).toBeGreaterThan(0)

            expect(
                items.every(item =>
                    item.item_category ===
                    testItem.item_category
                )
            ).toBe(true)
        })

        test("contains the backpack when filtering by its category", () => {
            const items = findItemsByCategory(
                testItem.item_category
            )

            expect(
                items.some(item =>
                    item.item_id === testItem.item_id
                )
            ).toBe(true)
        })

        test("returns an empty array for a missing category", () => {
            const items = findItemsByCategory("flooper")

            expect(Array.isArray(items)).toBe(true)
            expect(items).toEqual([])
        })

        test("returns items ordered by name", () => {
            const items = findItemsByCategory(
                testItem.item_category
            )

            const names = items.map(item => item.name)

            const sortedNames = [...names].sort((a, b) =>
                a.localeCompare(b)
            )

            expect(names).toEqual(sortedNames)
        })
    })
    
    describe("findItemByIndexAndCategory", () => {
        test("returns an item when index and category both match", () => {
            const item = findItemByIndexAndCategory(
                testItem.item_index,
                testItem.item_category
            )

            expect(item).toBeDefined()
            expect(item.item_id).toBe(testItem.item_id)
            expect(item.item_index)
                .toBe(testItem.item_index)
            expect(item.item_category)
                .toBe(testItem.item_category)
        })

        test("returns undefined when the category does not match", () => {
            const item = findItemByIndexAndCategory(
                testItem.item_index,
                "flooper"
            )

            expect(item).toBeUndefined()
        })

        test("returns undefined when the index does not exist", () => {
            const item = findItemByIndexAndCategory(
                "flooper",
                testItem.item_category
            )

            expect(item).toBeUndefined()
        })
    })

    describe("findItemByNameAndCategory", () => {
        test("returns an item when name and category both match", () => {
            const item = findItemByNameAndCategory(
                testItem.name,
                testItem.item_category
            )

            expect(item).toBeDefined()
            expect(item.item_id).toBe(testItem.item_id)
            expect(item.name).toBe(testItem.name)
            expect(item.item_category)
                .toBe(testItem.item_category)
        })

        test("returns undefined when the category does not match", () => {
            const item = findItemByNameAndCategory(
                testItem.name,
                "flooper"
            )

            expect(item).toBeUndefined()
        })

        test("returns undefined when the name does not exist", () => {
            const item = findItemByNameAndCategory(
                "Flooper",
                testItem.item_category
            )

            expect(item).toBeUndefined()
        })
    })
})