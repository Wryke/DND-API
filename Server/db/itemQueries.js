const db = require("./connection");

const findItemByIndexStmt = db.prepare(`
    SELECT *
    FROM items
    WHERE item_index = ?
`);

function findItemByIndex(itemIndex) {
    return findItemByIndexStmt.get(itemIndex);
}

module.exports = {
    findItemByIndex,
};