const db = require("./connection")


// --- User Queries ---

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

const updateUserByIdStmt = db.prepare(`
    UPDATE users
    SET username = ?
    WHERE user_id = ?
`)

function updateUserById(userId, {username}) {
    const result = updateUserByIdStmt.run(username, userId)

    if (result.changes === 0) {
        return undefined;
    }

    return {
        user_id: userId,
        username
    }
}

const deleteUserByIdStmt = db.prepare(`
    DELETE FROM users
    WHERE user_id = ?
`)

function deleteUserById (userId) {
    const result = deleteUserByIdStmt.run(userId)
    return result.changes === 1
}

// --- Character Queries ---

const findCharactersByUserIdStmt = db.prepare(`
    SELECT *
    FROM characters
    WHERE user_id = ?
    ORDER BY name
`)

function findCharactersByUserId (userId) {
    return findCharactersByUserIdStmt.all(userId)
}

const findCharacterByUserIdAndNameStmt = db.prepare(`
    SELECT *
    FROM characters
    WHERE user_id = ? AND name = ?
`)

function findCharacterByUserIdAndName (userId, name) {
    return findCharacterByUserIdAndNameStmt.get(userId, name)
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

const updateCharacterByIdStmt = db.prepare(`
    UPDATE characters
    SET name = ?,
        max_weight = ?
    WHERE character_id = ?
`)

function updateCharacterById(characterId, {name, max_weight}) {
    const result = updateCharacterByIdStmt.run(name, max_weight, characterId)

    if (result.changes === 0) {
        return undefined;
    }

    return {
        character_id: characterId,
        name,
        max_weight
    }
}

const deleteCharacterByIdStmt = db.prepare(`
    DELETE FROM characters
    WHERE character_id = ?
`)

function deleteCharacterById (characterId) {
    const result = deleteCharacterByIdStmt.run(characterId)
    return result.changes === 1
}

// --- Inventory Queries ---

module.exports = {
    findUserById,
    findUserByUsername,
    createUser,
    updateUserById,
    deleteUserById,
    findCharactersByUserId,
    findCharacterByUserIdAndName,
    createCharacter,
    updateCharacterById,
    deleteCharacterById
}