const db = require("./connection")

const findUserByIdStmt = db.prepare(`
    SELECT user_id, username
    FROM users
    WHERE user_id = ?
`)

function findUserById (userId) {
    return findUserByIdStmt.get(userId)
}

const findUserByUsernameStmt = db.prepare(`
    SELECT user_id, username
    FROM users
    WHERE username = ?
`)

function findUserByUsername (username) {
    return findUserByUsernameStmt.get(username)
}

const createUserStmt = db.prepare(`
    INSERT INTO users (username, password)
    VALUES (?, ?)
`)

function createUser ({ username, password }) {
    const result = createUserStmt.run(username, password)

    return {
        user_id: result.lastInsertRowid,
        username
    }
}

const deleteUserByStmt = db.prepare(`
    DELETE FROM users
    WHERE user_id = ?
`)

function deleteUserById (userId) {
    const result = deleteUserByStmt.run(userId)
    return result.changes === 1
}

const findCharacterByUserIdStmt = db.prepare(`
    SELECT *
    FROM characters
    WHERE user_id = ?
    ORDER BY name
`)

function findCharacterByUserId (userId) {
    return findCharacterByUserIdStmt.all(userId)
}

const createCharacterStmt = db.prepare(`
    INSERT INTO characters (user_id, name, max_weight)
    VALUES (?, ?, ?)
`)

function createCharacter ({ user_id, name, max_weight }) {
    const result = createCharacterStmt.run(user_id, name, max_weight)

    return {
        character_id: result.lastInsertRowid,
        user_id,
        name,
        max_weight
    }
}

module.exports = {
    findUserById,
    findUserByUsername,
    createUser,
    deleteUserById,
    findCharacterByUserId,
    createCharacter
}