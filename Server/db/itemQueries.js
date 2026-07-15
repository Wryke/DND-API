const db = require("./connection")

// --- Item Queries ---

const findAllItemsStmt = db.prepare(`
    SELECT *
    FROM items
    ORDER BY name
`)

function findAllItems() {
    return findAllItemsStmt.all()
}

const findItemsByCategoryStmt = db.prepare(`
    SELECT *
    FROM items
    WHERE item_category = ?
    ORDER BY name
`)

function findItemsByCategory(category) {
    return findItemsByCategoryStmt.all(category)
}

const findItemByIndexStmt = db.prepare(`
    SELECT *
    FROM items
    WHERE item_index = ?
`)

function findItemByIndex(itemIndex) {
    return findItemByIndexStmt.get(itemIndex)
}

const findItemByNameStmt = db.prepare(`
    SELECT *
    FROM items
    where name = ? COLLATE NOCASE
`)

// TODO: name is not unique in db schema
function findItemByName(name) {
    return findItemByNameStmt.get(name)
}

const findAllItemCategoriesStmt = db.prepare(`
    SELECT DISTINCT item_category
    FROM items
    ORDER BY item_category
`)

function findAllItemCategories() {
    return findAllItemCategoriesStmt.all().map(row => row.item_category)
}

const findItemByIndexAndCategoryStmt = db.prepare(`
    SELECT *
    FROM items
    WHERE item_index = ?
      AND item_category = ?
`)

function findItemByIndexAndCategory(itemIndex, category) {
    return findItemByIndexAndCategoryStmt.get(itemIndex, category)
}

const findItemByNameAndCategoryStmt = db.prepare(`
    SELECT *
    FROM items
    where name = ? COLLATE NOCASE
      AND item_category = ?
`)

function findItemByNameAndCategory(name, category) {
    return findItemByNameAndCategoryStmt.get(name, category)
}

module.exports = {
    findAllItems,
    findItemsByCategory,
    findItemByIndex,
    findItemByName,
    findAllItemCategories,
    findItemByIndexAndCategory,
    findItemByNameAndCategory
}