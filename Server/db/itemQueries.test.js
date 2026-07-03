const {
    findAllItems,
    findItemByIndex,
    findItemsByCategory
} = require("./itemQueries")

describe("Database Item Quieres", () => {
    // findItemByIndex
    test("findItemByIndex with arg 'backpack' returns backpack", () => {
        const item = findItemByIndex("backpack")
        expect(item.item_index).toBe("backpack")
    })

    test("findItemByIndex with arg 'flooper' returns undefined", () => {
        const item = findItemByIndex("flooper")
        expect(item).toBeUndefined()
    })

    // findAllItems
    test("findAllItems returns an array greater than 0 with all relavent columns", () => {
        const items = findAllItems()
        expect(Array.isArray(items)).toBe(true)
        expect(items.length).toBeGreaterThan(0)

        expect(items[0]).toHaveProperty("item_id")
        expect(items[0]).toHaveProperty("item_index")
        expect(items[0]).toHaveProperty("name")
        expect(items[0]).toHaveProperty("item_category")
    })

    // findItemsByCategory
    test("findItemsByCategory with arg 'armor' returns a list of items with category armor", () => {
        const items = findItemsByCategory("armor")
        expect(Array.isArray(items)).toBe(true)
        expect(items.length).toBeGreaterThan(0)

        expect(
            items.every(item => item.item_category === "armor")
        ).toBe(true)
    })

    test("findItemsByCategory with bad arg 'flooper' returns an empty array", () => {
        const items = findItemsByCategory("flooper")
        expect(Array.isArray(items)).toBe(true)
        expect(items).toHaveLength(0)
    })
})