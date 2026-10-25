const db = require("./connection")


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
        return undefined
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

module.exports = {
    findCharactersByUserId,
    findCharacterByUserIdAndName,
    createCharacter,
    updateCharacterById,
    deleteCharacterById
}