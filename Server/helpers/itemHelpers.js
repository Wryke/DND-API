// helpers/userHelpers.js
const fs = require("fs")
const path = require("path")

const EQUIPMENT = path.join(__dirname, "../Database/equipment.json")
const CATEGORIES = path.join(__dirname, "../Database/Equipment-Categories.json")
const MAGIC_ITEMS = path.join(__dirname, "../Database/Magic-Items.json")

function loadItems() {
    const data = fs.readFileSync(EQUIPMENT, "utf8")
    return JSON.parse(data)
}

function findItem(item, id) {
    return EQUIPMENT.find(item => item.id === id)
}

function loadMagicItems() {
    const data = fs.readFileSync(MAGIC_ITEMS, "utf8")
    return JSON.parse(data)
}

function findMagicItem(item, id) {
    return MAGIC_ITEMS.find(item => item.id === id)
}

function loadCategories(){
    const data = fs.readFileSync(CATEGORIES, "utf8")
    return JSON.parse(data)
}

function findCategory(item, id) {
    return CATEGORIES.find(item => item.id === id)
}

module.exports = {
    loadItems,
    findItem,
    loadMagicItems,
    findMagicItem,
    loadCategories,
    findCategory
}