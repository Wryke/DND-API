const fs = require("fs")
const path = require("path")

const EQUIPMENT = path.join(__dirname, "../../Database/Equipment.json")
const CATEGORIES = path.join(__dirname, "../../Database/Equipment-Categories.json")
const MAGIC_ITEMS = path.join(__dirname, "../../Database/Magic-Items.json")

function loadItems() {
    const data = fs.readFileSync(EQUIPMENT, "utf8")
    return JSON.parse(data)
}

function loadMagicItems() {
    const data = fs.readFileSync(MAGIC_ITEMS, "utf8")
    return JSON.parse(data)
}

function loadCategories(){
    const data = fs.readFileSync(CATEGORIES, "utf8")
    return JSON.parse(data)
}

function findItem(items, index) {
    return items.find(item => item.index === index)
}

module.exports = {
    loadItems,
    loadMagicItems,
    loadCategories,
    findItem
}