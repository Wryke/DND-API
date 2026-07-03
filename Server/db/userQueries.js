const db = require("./connection");

const findUserByIdStmt = db.prepare(`
    SELECT user_id, username
    FROM users
    WHERE user_id = ?
`)

function findUserById(userId) {
    return findUserByIdStmt.get(userId)
}

const findUserByUsernameStmt = db.prepare(`
    SELECT user_id, username
    FROM users
    WHERE username = ?
`)

function findUserByUsername(username) {
    return findUserByUsernameStmt.get(username)
}

module.exports = {
    findUserById,
    findUserByUsername
};