const { loadItems } = require("../helpers/itemHelpers");
const db = require("./connection");

const tables = db.prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table';
`).all();

const findAllItemsStmt = db.prepare(`
    SELECT *
    FROM items
    ORDER by name
`).all()

function findAllItems() {
    return findAllItemsStmt;
}

const findItemByIndexStmt = db.prepare(`
    SELECT *
    FROM items
    WHERE item_index = ?
`)

function findItemByIndex(itemIndex) {
    return findItemByIndexStmt.get(itemIndex);
}

const findItemByNameStmt = db.prepare(`
    SELECT *
    FROM items
    WHERE name = ?
`)

function findItemByName(name) {
    return findItemByNameStmt.get(name);
}

const findItemsByCategoryStmt = db.prepare(`
    SELECT *
    FROM items
    WHERE item_category = ?
    ORDER by name
`)

function findItemsByCategory(category) {
    return findItemsByCategoryStmt.all(category);
}

module.exports = {
    findAllItems,
    findItemByIndex,
    findItemByName,
    findItemsByCategory
};