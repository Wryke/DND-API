const express = require("express");
const router = express.Router();

const {
    loadItems,
    findItem,
    loadMagicItems,
    findMagicItem,
    loadCategories,
    findCategory
} = require("../helpers/itemHelpers")

// --- Get Routes ---
router.get("/", (req, res) => {
    const items = loadItems();
    res.json(items)
});

app.get("/items/", (req, res) => {
    res.json({equipment})
})

app.get('/items/:index', (req, res) => {
    const index = req.params.index

    const item = equipment.find(i => i.index === index)
    
    if(!item){
        res.status(404).json({
            error: "Item not found"
        })

        return
    }

    res.json(item);
});

app.get("/categories/", (req, res) => {
    res.json({equipmentCategories})
})

app.get('/categories/:category', (req, res) => {
    const categoryIndex = req.params.category

    const category = equipmentCategories.find(i => i.index === categoryIndex)
    
    if(!category){
        res.status(404).json({
            error: "Category not found"
        })

        return
    }

    res.json(category);
});

app.get('/categories/:category/:index', (req, res) => {
    const categoryIndex = req.params.category
    const itemIndex = req.params.index

    const category = equipmentCategories.find(i => i.index === categoryIndex)
    
    if(!category){
        res.status(404).json({
            error: `Category not found`
        })

        return
    }

    const item = category.equipment.find(i => i.index === itemIndex)
    
    if(!item){
        res.status(404).json({
            error: `Item not found in ${category.index}`
        })

        return
    }

    const fullItem = equipment.find(e => e.index === itemIndex);
    res.json(fullItem);
});

module.exports = router;