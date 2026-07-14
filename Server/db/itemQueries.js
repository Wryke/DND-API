const db = require("./connection")

const tables = db.prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
`).all()

const findAllItemsStmt = db.prepare(`
    SELECT *
    FROM items
    ORDER by name
`).all()

function findAllItems() {
    return findAllItemsStmt.all()
}

const findAllItemCategoriesStmt = db.prepare(`
    SELECT DISTINCT item_category
    FROM items
    ORDER BY item_category
`)

function findAllItemCategories() {
    return findAllItemCategoriesStmt.all().map(row => row.item_category)
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
    WHERE name = ?
`)

function findItemByName(name) {
    return findItemByNameStmt.get(name)
}

const findItemByIndexAndCategoryStmt = db.prepare(`
    SELECT *
    FROM items
    WHERE item_id= ?
      AND item_category = ?
`)

function findItemByIndexAndCategory(itemId, category) {
    return findItemByIndexAndCategoryStmt.get(itemId, category)
}

const findItemByNameAndCategoryStmt = db.prepare(`
    SELECT *
    FROM items
    WHERE name = ?
      AND item_category = ?
`)

function findItemByNameAndCategory(itemId, category) {
    return findItemByNameAndCategoryStmt.get(itemId, category)
}

module.exports = {
    findAllItems,
    findAllItemCategories,
    findItemByIndex,
    findItemByName,
    findItemByIndexAndCategory,
    findItemByNameAndCategory
}