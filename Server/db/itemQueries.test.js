const {
    findAllItems,
    findItemByIndex,
    findItemByName, // TODO testing
    findItemsByCategory
} = require("./itemQueries")

describe("Database Item Queries", () => {
    let testItems

    beforeEach(() => {
        testItems = {
            backpack: findItemByIndex("backpack"),
            armor: findItemsByCategory("armor")
        }
    })

    describe("findItemByIndex", () => {
        test("returns the backpack item", () => {
            const item = findItemByIndex("backpack")

            expect(item).toBeDefined()
            expect(item.item_index).toBe("backpack")
            expect(item.name).toBe("Backpack")
        })

        test("returns undefined for a missing item", () => {
            const item = findItemByIndex("flooper")

            expect(item).toBeUndefined()
        })
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
                    item.item_id === testItems.backpack.item_id
                )
            ).toBe(true)
        })
    })

    describe("findItemsByCategory", () => {
        test("returns only items from the requested category", () => {
            const items = findItemsByCategory("armor")

            expect(Array.isArray(items)).toBe(true)
            expect(items.length).toBeGreaterThan(0)

            expect(
                items.every(item =>
                    item.item_category === "armor"
                )
            ).toBe(true)
        })

        test("returns the same armor items created in beforeEach", () => {
            const items = findItemsByCategory("armor")

            expect(items).toEqual(testItems.armor)
        })

        test("returns an empty array for a missing category", () => {
            const items = findItemsByCategory("flooper")

            expect(Array.isArray(items)).toBe(true)
            expect(items).toHaveLength(0)
        })
    })
})