const db = require("./connection")


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