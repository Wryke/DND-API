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
// GET /items - Return all items, optionally filtered by category
// GET /items/categories - Return all unique item categories
// GET /items/name/:name - Return an item by name, optionally filtered by category
// GET /items/index/:index - Return an item by index, optionally filtered by category
// --- ----------- ---

// GET /items - Return all items, optionally filtered by category
router.get("/", (req, res) => {
    const categoryIndex =
        typeof req.query.category === "string"
            ? req.query.category.trim()
            : undefined

    const items = categoryIndex
        ? findItemsByCategory(categoryIndex)
        : findAllItems()

    return res.status(200).json(items)
})

// GET /items/categories - Return all unique item categories
router.get("/categories", (req, res) => {
    const categories = findAllItemCategories()

    return res.status(200).json(categories)
})

// GET /items/name/:name - Return an item by name, optionally filtered by category
router.get("/name/:name", (req, res) => {
    const name = req.params.name
    const categoryIndex =
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

    const item = categoryIndex
        ? findItemByNameAndCategory(name.trim(), categoryIndex)
        : findItemByName(name.trim())

    if (!Array.isArray(item) || item.length === 0) {
        return res.status(404).json({
            error: "Item could not be found"
        })
    }

    return res.status(200).json(item)
})

// GET /items/index/:index - Return an item by index, optionally filtered by category
router.get("/index/:index", (req, res) => {
    const index = req.params.index
    const categoryIndex =
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

    const item = categoryIndex
        ? findItemByIndexAndCategory(index.trim(), categoryIndex)
        : findItemByIndex(index.trim())

    if (!item) {
        return res.status(404).json({
            error: "Item could not be found"
        })
    }

    return res.status(200).json(item)
})

module.exports = router