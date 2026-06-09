const express = require('express');
const fs = require("fs")
const path = require("path")

const app = express();
      app.use(express.json());
      
const PORT = 3000;

const EQUIPMENT = path.join(__dirname, "../Database/5e-SRD-Equipment.json")
const EQUIPMENT_CATEGORIES = path.join(__dirname, "../Database/5e-SRD-Equipment-Categories.json")

let equipment = [];
let equipmentCategories = [];

try {
    const data = fs.readFileSync(EQUIPMENT,"utf8");
    equipment = JSON.parse(data);
}
catch (error) {
    console.log(error.message);
}

try {
    const data = fs.readFileSync(EQUIPMENT_CATEGORIES,"utf8");
    equipmentCategories = JSON.parse(data);
}
catch (error) {
    console.log(error.message);
}

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

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
});