const db = require("./connection");

const findItemByIndexStmt = db.prepare(`
    SELECT *
    FROM items
    WHERE item_index = ?
`)

const findItemByNameStmt = db.prepare(`
    SELECT *
    FROM items
    WHERE name = ?
`)

function findItemByIndex(itemIndex) {
    return findItemByIndexStmt.get(itemIndex);
}

function findItemByName(name) {
    return findItemByNameStmt.get(name);
}

module.exports = {
    findItemByIndex,
    findItemByName
};