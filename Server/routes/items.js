const express = require("express")
const router = express.Router()

const {
    findAllItems,
    findAllItemCategories,
    findItemByIndex,
    findItemByName,
    findItemsByIdAndCategory,
    findItemsByNameAndCategory
} = require("../db/itemQueries.js")

// --- Get Routes ---
// GET /items
//     Get all items
//     Optional: ?category=armor

// GET /items/categories
//     Get all category names

// GET /items/name/:name
//     Find item by display name
//     Optional: ?category=armor

// GET /items/:index
//     Find item by stable item index
//     Optional: ?category=armor

// GET /items?category - Get a list of all existing items in a category 
router.get('/', (req, res) => {
    const { category } = req.query

    const items = category
        ? findItemsByCategory(category)
        : findAllItems()

    return res.status(200).json(items)
})

// GET /items/categories - Get a list of all unique categories
router.get('/categories/', (req, res) => {
    const categories = findAllItemCategories()

    return res.status(200).json(categories)
})

// GET /items/:index?category - Get an item with specified index
router.get('/:index', (req, res) => {
    
    const index = Number(req.params.index)
    const { category } = req.query

    const item = findItemByIndex(index)

    if(!item){
        return res.status(404).json({
            error: "Item could not be found"
        })
    }

    return res.status(200).json(item)
})

// Get /items/name/:name - Get an item with a specific name
router.get('/name/:name', (req, res) => {

    const name = req.params.name
    

    const item = findItemByName(name)

    if(!item){
        return res.status(404).json({
            error: "Item could not be found"
        })
    }

    return res.status(200).json(item)
})

module.exports = router