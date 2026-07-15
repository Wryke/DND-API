const express = require("express")
const router = express.Router()

const {
    findAllItems,
    findItemsByCategory,
    findItemByIndex,
    findItemByName,
    findAllItemCategories,
    findItemByIndexAndCategory,
    findItemByNameAndCategory
} = require("../db/itemQueries.js")

// --- Item Routes ---
// GET /items
// GET /items?category=armor
// GET /items/categories
// GET /items/index/:index
// GET /items/index/:index?category=armor
// GET /items/name/:name
// GET /items/name/:name?category=armor

// GET /items
// Optional: ?category=armor
router.get("/", (req, res) => {
    const category =
        typeof req.query.category === "string"
            ? req.query.category.trim()
            : undefined

    const items = category
        ? findItemsByCategory(category)
        : findAllItems()

    return res.status(200).json(items)
})

// GET /items/categories
router.get("/categories", (req, res) => {
    const categories = findAllItemCategories()

    return res.status(200).json(categories)
})

// GET /items/name/:name
// Optional: ?category=armor
router.get("/name/:name", (req, res) => {
    const name = req.params.name
    const category =
        typeof req.query.category === "string"
            ? req.query.category.trim()
            : undefined

    if (
        typeof name !== "string" ||
        name.trim().length === 0
    ) {
        return res.status(400).json({
            error: "A valid item name is required"
        })
    }

    const item = category
        ? findItemByNameAndCategory(name.trim(), category)
        : findItemByName(name.trim())

    if (!item) {
        return res.status(404).json({
            error: "Item could not be found"
        })
    }

    return res.status(200).json(item)
})

// GET /items/index/:index
// Optional: ?category=armor
router.get("/index/:index", (req, res) => {
    const index = req.params.index
    const category =
        typeof req.query.category === "string"
            ? req.query.category.trim()
            : undefined

    if (
        typeof index !== "string" ||
        index.trim().length === 0
    ) {
        return res.status(400).json({
            error: "A valid item index is required"
        })
    }

    const item = category
        ? findItemByIndexAndCategory(index.trim(), category)
        : findItemByIndex(index.trim())

    if (!item) {
        return res.status(404).json({
            error: "Item could not be found"
        })
    }

    return res.status(200).json(item)
})

module.exports = router