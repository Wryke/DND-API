const express = require("express")
const router = express.Router()

const {
    loadItems,
    findItem,
    loadMagicItems,
    loadCategories,
} = require("../helpers/itemHelpers")

// --- Get Routes ---

// Return all equipment items.
router.get("/", (req, res) => {
    const items = loadItems()
    res.json(items)
})

// Search equipment for an item.
router.get('/:index', (req, res) => {
    const items = loadItems()
    const magicItems = loadMagicItems()
    
    const index = req.params.index

    let item = findItem(items, index)
    if(!item){
        item = findItem(magicItems, index)
    }

    if(!item){
        res.status(404).json({
            error: "Item not found"
        })

        return
    }

    res.json(item)
})

// Return all existing categories
router.get("/categories/", (req, res) => {
    const categories = loadCategories()
    res.json(categories)
})

// Return a specific category by index
router.get('/categories/:category', (req, res) => {
    const categoryIndex = req.params.category
    const categories = loadCategories()
    const category = findItem(categories, categoryIndex)
    
    if(!category){
        res.status(404).json({
            error: "Category not found"
        })

        return
    }

    res.json(category)
})

// Return a specific item from a specific category
router.get('/categories/:category/:index', (req, res) => {
    const categoryIndex = req.params.category
    const itemIndex = req.params.index
    const categories = loadCategories()
    const category = findCategory(categories, itemIndex)
    
    if(!category){
        res.status(404).json({
            error: `Category not found`
        })

        return
    }

    const item = findItem(category, itemIndex)
    
    if(!item){
        res.status(404).json({
            error: `Item not found in ${category.index}`
        })

        return
    }

    let items
    if(category.index === "magic-items"){
        items = loadMagicItems()
    }
    items = loadItems()

    const fullItem = findItem(items, itemIndex)
    res.json(fullItem)
})

module.exports = router