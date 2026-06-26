const db = require("./connection");

function findItemByIndex(itemIndex) {
    const stmt = db.prepare(`
        SELECT *
        FROM items
        WHERE item_index = ?
    `);

    return stmt.get(itemIndex);
}

module.exports = {
    findItemByIndex,
};