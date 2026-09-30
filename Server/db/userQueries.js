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

const findUserByEmailStmt = db.prepare(`
    SELECT
        user_id,
        username,
        email,
        password_hash
    FROM users
    WHERE email = ?
`)

function findUserByEmail (email) {
    return findUserByEmailStmt.get(email)
}

const createUserStmt = db.prepare(`
    INSERT INTO users (username, email, password_hash)
    VALUES (?, ?, ?)
`)

function createUser ({ username, email, passwordHash }) {
    const result = createUserStmt.run(username, email, passwordHash)

    return {
        user_id: result.lastInsertRowid,
        username,
        email
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
        return undefined
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

// --- Inventory Queries ---

const findInventoryEntryByIdStmt = db.prepare(`
    SELECT
        inventory.inventory_id,
        inventory.character_id,
        inventory.item_id,
        inventory.parent_inventory_id,
        inventory.quantity,

        items.item_index,
        items.name,
        items.description,
        items.weight,
        items.cost_quantity,

        currency_lookup.currency_code,
        currency_lookup.currency_name,
        item_type_lookup.item_type_name
    FROM inventory
    JOIN items 
        ON inventory.item_id = items.item_id
    LEFT JOIN currency_lookup
        ON items.currency_unit_id = currency_lookup.currency_unit_id
    LEFT JOIN item_type_lookup
        ON items.item_type_id = item_type_lookup.item_type_id
    WHERE inventory.character_id = ?
      AND inventory.inventory_id = ?
`)

function findInventoryEntryById(characterId, inventoryId) {
    return findInventoryEntryByIdStmt.get(characterId, inventoryId)
}
const findAllInventoryByCharacterIdStmt = db.prepare(`
    SELECT
        inventory.inventory_id,
        inventory.character_id,
        inventory.item_id,
        inventory.parent_inventory_id,
        inventory.quantity,

        items.item_index,
        items.name,
        items.description,
        items.weight,
        items.cost_quantity,

        currency_lookup.currency_code,
        currency_lookup.currency_name,
        item_type_lookup.item_type_name
    FROM inventory
    JOIN items 
        ON inventory.item_id = items.item_id
    LEFT JOIN currency_lookup
        ON items.currency_unit_id = currency_lookup.currency_unit_id
    LEFT JOIN item_type_lookup
        ON items.item_type_id = item_type_lookup.item_type_id
    WHERE inventory.character_id = ?
    ORDER BY items.name
`)

function findAllInventoryByCharacterId(characterId) {
    return findAllInventoryByCharacterIdStmt.all(characterId)
}


const findRootInventoryByCharacterIdStmt = db.prepare(`
    SELECT
        inventory.inventory_id,
        inventory.character_id,
        inventory.item_id,
        inventory.parent_inventory_id,
        inventory.quantity,

        items.item_index,
        items.name,
        items.description,
        items.weight,
        items.cost_quantity,

        currency_lookup.currency_code,
        currency_lookup.currency_name,
        item_type_lookup.item_type_name
    FROM inventory
    JOIN items 
        ON inventory.item_id = items.item_id
    LEFT JOIN currency_lookup
        ON items.currency_unit_id = currency_lookup.currency_unit_id
    LEFT JOIN item_type_lookup
        ON items.item_type_id = item_type_lookup.item_type_id
    WHERE inventory.character_id = ?
      AND inventory.parent_inventory_id IS NULL
    ORDER BY items.name
`)


function findRootInventoryByCharacterId (characterId) {
    return findRootInventoryByCharacterIdStmt.all(characterId)
}

const findInventoryChildrenStmt = db.prepare(`
    SELECT
        inventory.inventory_id,
        inventory.character_id,
        inventory.item_id,
        inventory.parent_inventory_id,
        inventory.quantity,

        items.item_index,
        items.name,
        items.description,
        items.weight,
        items.cost_quantity,

        currency_lookup.currency_code,
        currency_lookup.currency_name,
        item_type_lookup.item_type_name
    FROM inventory
    JOIN items 
        ON inventory.item_id = items.item_id
    LEFT JOIN currency_lookup
        ON items.currency_unit_id = currency_lookup.currency_unit_id
    LEFT JOIN item_type_lookup
        ON items.item_type_id = item_type_lookup.item_type_id
    WHERE inventory.character_id = ?
      AND inventory.parent_inventory_id = ?
    ORDER BY items.name
`)

function findInventoryChildren(characterId, parentInventoryId) {
    return findInventoryChildrenStmt.all(characterId, parentInventoryId)
}

const createInventoryEntryStmt = db.prepare(`
    INSERT INTO inventory (
        character_id, 
        item_id, 
        parent_inventory_id, 
        quantity
    )
    VALUES (?, ?, ?, ?)
`)

function createInventoryEntry( { character_id, item_id, parent_inventory_id, quantity } ) {
    const result = createInventoryEntryStmt.run(character_id, item_id, parent_inventory_id, quantity)

    return {
        inventory_id: result.lastInsertRowid,
        character_id,
        item_id,
        parent_inventory_id,
        quantity
    }
}

const updateInventoryQuantityStmt = db.prepare(`
    UPDATE inventory
    SET quantity = ?
    WHERE inventory_id = ?
`)

function updateInventoryQuantity(inventoryId, quantity) {
    const result = updateInventoryQuantityStmt.run(quantity, inventoryId)

    if (result.changes === 0) {
        return undefined
    }

    return {
        inventory_id: inventoryId,
        quantity
    }
}

const moveInventoryEntryStmt = db.prepare(`
    UPDATE inventory
    SET parent_inventory_id = ?
    WHERE inventory_id = ?
`)

function moveInventoryEntry(inventoryId, parentInventoryId) {
    const result = moveInventoryEntryStmt.run(parentInventoryId, inventoryId)

    if (result.changes === 0) {
        return undefined
    }

    return {
        inventory_id: inventoryId,
        parent_inventory_id: parentInventoryId
    }
}

// Atomically update an inventory entry's quantity and parent
const updateInventoryEntryTransaction = db.transaction(
    (inventoryId, {quantity, parent_inventory_id} ) => {
        
        const quantityResult = updateInventoryQuantityStmt.run(quantity, inventoryId)

        const parentResult = moveInventoryEntryStmt.run(parent_inventory_id, inventoryId)

        if (quantityResult.changes === 0 || parentResult.changes === 0) {
            throw new Error("Inventory entry not found")
        }

        return {
            inventory_id: inventoryId,
            quantity,
            parent_inventory_id
        }
    }
)

function updateInventoryEntry(inventoryId, {quantity, parent_inventory_id}) {
    return updateInventoryEntryTransaction(inventoryId, {quantity, parent_inventory_id})
}

const deleteInventoryEntryStmt = db.prepare(`
    DELETE FROM inventory
    WHERE inventory_id = ?
`)

// Promote direct children to the root before deleting a container
const moveChildrenToRootStmt = db.prepare(`
    UPDATE inventory
    SET parent_inventory_id = NULL
    WHERE parent_inventory_id = ?
`)

// Atomically delete an inventory entry while promoting its children
const deleteInventoryEntryTransaction = db.transaction(
    (inventoryId) => {
        moveChildrenToRootStmt.run(inventoryId)

        const result = deleteInventoryEntryStmt.run(inventoryId)

        return result.changes === 1
    }
)

function deleteInventoryEntry (inventoryId) {
    return deleteInventoryEntryTransaction(inventoryId)
}

module.exports = {
    findUserById,
    findUserByUsername,
    findUserByEmail,
    createUser,
    updateUserById,
    deleteUserById,

    findCharactersByUserId,
    findCharacterByUserIdAndName,
    createCharacter,
    updateCharacterById,
    deleteCharacterById,

    findInventoryEntryById,
    findAllInventoryByCharacterId,
    findRootInventoryByCharacterId,
    findInventoryChildren,
    createInventoryEntry,
    updateInventoryQuantity,
    moveInventoryEntry,
    updateInventoryEntry,
    deleteInventoryEntry
}