const db = require("./connection");

const findUserByIdStmt = db.prepare(`
    SELECT user_id, username
    FROM users
    WHERE user_id = ?
`);

function findUserById(userId) {
    return findUserByIdStmt.get(userId);
}

module.exports = {
    findUserById,
};