const express = require("express")
const router = express.Router()

const {
    loadItems,
    loadMagicItems,
    loadCategories,
    findItem,
    findAnyItem
} = require("../helpers/itemHelpers.js")

const {
    findAllItems,
    findItemByIndex,
    findItemsByCategory
} = require("../db/itemQueries.js")

// --- Get Routes ---

// GET /items/equipment
// GET /items/equipment/:index
// GET /items/magic
// GET /items/magic/:index
// GET /items/all/:index

// Get all equipment items of a specific category.
router.get("/equipment", (req, res) => {
    const { category } = req.query;

    const items = category
        ? findItemsByCategory(category)
        : findAllItems();

    res.json(items);
});

// Get item from equipment.
router.get('/equipment/:index', (req, res) => {
    const index = req.params.index

    let item = findItemByIndex(index)

    if(!item){
        return res.status(404).json({
            error: "Item not found"
        })
    }

    res.json(item)
})

// Get all magic items.
router.get('/magic', (req, res) => {
    const items = loadMagicItems()
    res.json(items)
})

// Get item from magic items.
router.get('/magic/:index', (req, res) => {
    const index = req.params.index
    
    const items = loadMagicItems()

    let item = findItem(items, index)

    if(!item){
        return res.status(404).json({
            error: "Item not found"
        })
    }

    res.json(item)
})

// Get item from all items.
router.get("/all/:index", (req, res) => {
    const index = req.params.index

    const item = findAnyItem(index)

    if(!item){
        return res.status(404).json({
            error: "Item not found"
        })
    }

    res.json(item)
})

// Get all existing categories.
router.get("/categories/", (req, res) => {
    const categories = loadCategories()
    res.json(categories)
})

module.exports = router