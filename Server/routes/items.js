const express = require("express")
const router = express.Router()

const {
    loadItems,
    loadMagicItems,
    loadCategories,
    findItem,
    findAnyItem
} = require("../helpers/itemHelpers.js")

function isValidIndex(index, res) {
    if (!index || typeof index !== "string") {
        return false
    }
    return true
}

// --- Get Routes ---

// GET /items/equipment
// GET /items/equipment/:index

// GET /items/magic
// GET /items/magic/:index

// GET /items/all/:index

// GET /items/categories
// GET /items/categories/:category
// GET /items/categories/:category/:index

// Get all equipment items.
router.get("/equipment", (req, res) => {
    const items = loadItems()

    res.json(items)
})

// Get item from equipment.
router.get('/equipment/:index', (req, res) => {
    const index = req.params.index

    if(!isValidIndex(index)){
        return res.status(404).json({
            error: "Invalid Index"
        })
    }

    const items = loadItems()

    let item = findItem(items, index)

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

    if(!isValidIndex(index)){
        return res.status(404).json({
            error: "Invalid Index"
        })
    }
    
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
    
    if(!isValidIndex(index)){
        return res.status(404).json({
            error: "Invlid Index"
        })
    }

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

// Get a specific category by index.
router.get('/categories/:category', (req, res) => {
    const categoryIndex = req.params.category

    if(!isValidIndex(categoryIndex)){
        return res.status(404).json({
            error: "Invalid Index"
        })
    }

    const categories = loadCategories()
    const category = findItem(categories, categoryIndex)
    
    if(!category){
        return res.status(404).json({
            error: "Category not found"
        })
    }

    res.json(category)
})

// Get a specific item from a specific category
router.get('/categories/:category/:index', (req, res) => {
    const categoryIndex = req.params.category
    const itemIndex = req.params.index

    if(!isValidIndex(categoryIndex)){
        return res.status(404).json({
            error: "Invalid Index"
        })
    }
    
    if(!isValidIndex(itemIndex)){
        return res.status(404).json({
            error: "Invalid Index"
        })
    }


    const categories = loadCategories()
    const category = findItem(categories, categoryIndex)
    
    if(!category){
        return res.status(404).json({
            error: `Category not found`
        })
    }

    const itemReference = findItem(category.equipment, itemIndex)
    
    if(!itemReference){
        return res.status(404).json({
            error: `Item not found in ${category.index}`
        })
    }

    let items
    if(category.index === "magic-items"){
        items = loadMagicItems()
    } else {
        items = loadItems()
    }

    const item = findItem(items, itemIndex)

    if(!item){
        return res.status(404).json({
            error: `Item not found in ${category.index}`
        })
    }

    res.json(item)
})

module.exports = router