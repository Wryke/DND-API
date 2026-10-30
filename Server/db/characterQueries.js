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

// // --- Class Queries ---
// const findAllClassesStmt = db.prepare(`
//     SELECT *
//     FROM class_lookup
//     ORDER BY class_name
// `)

// const findSubclassByClassIDStmt = db.prepare(`
//     SELECT *
//     FROM subclass_lookup
//     WHERE class_id = ?    
// `)

// // --- Species Queries ---
// const findAllSpeciesStmt = db.prepare(`
//     SELECT *
//     FROM species_lookup
// `)

// // --- Background Queries ---
// const findAllBackgroundsStmt = db.prepare(`
//     SELECT *
//     FROM background_lookup
// `)

// // --- Proficiency Queries ---
// const findCharacterProficienciesStmt = db.prepare(`
//     SELECT
//         c.character_id,

//         c.proficiency_id,
//         p.proficiency_index,
//         p.proficiency_name,

//         t.proficiency_type_id,
//         t.type_index,
//         t.type_name,
        
//         a.ability_index,
//         a.ability_name,

//         w.weapon_type_id,
//         w.weapon_type_index,
//         w.weapon_type_name,
//         w.weapon_category
//     FROM character_to_proficiency AS c
//     JOIN proficiency_lookup AS p
//         ON c.proficiency_id = p.proficiency_id
//     JOIN proficiency_type_lookup AS t
//         ON p.proficiency_type_id = t.proficiency_type_id
//     LEFT JOIN ability_lookup AS a
//         ON p.ability_score_id = a.ability_score_id
//     LEFT JOIN weapon_type_lookup AS w
//         ON p.weapon_type_id = w.weapon_type_id
//     WHERE c.character_id = ?
// `)

// // --- Mastery Queries ---
// const findCharacterMasteriesStmt = db.prepare(`
//     SELECT *
//     FROM character_to_wepaon_mastery
//     WHERE character_id = ?
// `)

module.exports = {
    findCharactersByUserId,
    findCharacterByUserIdAndName,
    createCharacter,
    updateCharacterById,
    deleteCharacterById
}