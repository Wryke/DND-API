const {
    loadItems,
    findItem,
    loadMagicItems,
    loadCategories,
    findAnyItem
} = require("./itemHelpers.js")

describe("Item helper functions", () => {

    test("loadItems returns an array", () => {
        const items = loadItems()

        expect(Array.isArray(items)).toBe(true)
    })

    test("findItem returns matching item", () => {
        const items = loadItems()

        const item = findItem(items, "backpack")

        expect(item).toBeDefined()
        expect(item.index).toBe("backpack")
    })

    test("findItem returns undefined for missing item", () => {
        const items = loadItems()

        const item = findItem(items, "not-a-real-item")

        expect(item).toBeUndefined()
    })

    test("loadMagicItems returns an array", () => {
        const items = loadMagicItems()

        expect(Array.isArray(items)).toBe(true)
    })

    test("loadCategories returns an array", () => {
        const categories = loadCategories()

        expect(Array.isArray(categories)).toBe(true)
    })

    test("findItem returns matching category", () => {
        const categories = loadCategories()

        const category = findItem(
            categories,
            "adventuring-gear"
        )

        expect(category).toBeDefined()
        expect(category.index).toBe("adventuring-gear")
    })

    //TODO: test findAnyItem
})