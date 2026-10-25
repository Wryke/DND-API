const db = require("./connection")


// --- Equipment Queries ---

const findAllEquipmentSlotsStmt = db.prepare(`
    SELECT
        equipment_slot_id,
        equipment_slot_index,
        equipment_slot_name
    FROM equipment_slot_lookup
    ORDER BY equipment_slot_id
`)

function findAllEquipmentSlots() {
    return findAllEquipmentSlotsStmt.all()
}


const findEquipmentSlotByIdStmt = db.prepare(`
    SELECT
        equipment_slot_id,
        equipment_slot_index,
        equipment_slot_name
    FROM equipment_slot_lookup
    WHERE equipment_slot_id = ?
`)

function findEquipmentSlotById(equipmentSlotId) {
    return findEquipmentSlotByIdStmt.get(equipmentSlotId)
}


const findEquipmentEntryBySlotStmt = db.prepare(`
    SELECT
        equipment.equipment_id,
        equipment.inventory_id,

        items.item_id,
        items.item_index,
        items.name,

        equipment.equipment_slot_id,
        equipment_slot_lookup.equipment_slot_index,
        equipment_slot_lookup.equipment_slot_name
    FROM equipment
    JOIN inventory
        ON equipment.inventory_id = inventory.inventory_id
    JOIN equipment_slot_lookup
        ON equipment.equipment_slot_id = equipment_slot_lookup.equipment_slot_id
    JOIN items
        ON inventory.item_id = items.item_id
    WHERE equipment.character_id = ?
        AND equipment.equipment_slot_id = ?
`)

function findEquipmentEntryBySlot(characterId, equipmentSlotId) {
    return findEquipmentEntryBySlotStmt.get(
        characterId,
        equipmentSlotId
    )
}


const findAllEquipmentStmt = db.prepare(`
    SELECT
        equipment.equipment_id,
        equipment.inventory_id,

        items.item_id,
        items.item_index,
        items.name,

        equipment.equipment_slot_id,
        equipment_slot_lookup.equipment_slot_index,
        equipment_slot_lookup.equipment_slot_name
    FROM equipment
    JOIN inventory
        ON equipment.inventory_id = inventory.inventory_id
    JOIN equipment_slot_lookup
        ON equipment.equipment_slot_id = equipment_slot_lookup.equipment_slot_id
    JOIN items
        ON inventory.item_id = items.item_id
    WHERE equipment.character_id = ?
`)

function findAllEquipment(characterId) {
    return findAllEquipmentStmt.all(characterId)
}


const findEquipmentEntryByIdStmt = db.prepare(`
    SELECT
        equipment.equipment_id,
        equipment.inventory_id,

        items.item_id,
        items.item_index,
        items.name,

        equipment.equipment_slot_id,
        equipment_slot_lookup.equipment_slot_index,
        equipment_slot_lookup.equipment_slot_name
    FROM equipment
    JOIN inventory
        ON equipment.inventory_id = inventory.inventory_id
    JOIN equipment_slot_lookup
        ON equipment.equipment_slot_id = equipment_slot_lookup.equipment_slot_id
    JOIN items
        ON inventory.item_id = items.item_id
    WHERE equipment.character_id = ?
        AND equipment.equipment_id = ?
`)

function findEquipmentEntryById(characterId, equipmentId) {
    return findEquipmentEntryByIdStmt.get(
        characterId,
        equipmentId
    )
}


const createEquipmentEntryStmt = db.prepare(`
    INSERT INTO equipment (
        character_id,
        inventory_id,
        equipment_slot_id
    )
    VALUES (?, ?, ?)
`)

function createEquipmentEntry(characterId, inventoryId, equipmentSlotId) {
    const result = createEquipmentEntryStmt.run(
        characterId,
        inventoryId,
        equipmentSlotId
    )

    return {
        equipment_id: result.lastInsertRowid,
        character_id: characterId,
        inventory_id: inventoryId,
        equipment_slot_id: equipmentSlotId
    }
}


// TODO : DECIDE LATER IF NEEDED
// const updateEquipmentEntryByIdStmt = db.prepare(`
    
// `)

// function updateEquipmentEntryById(/*TODO*/){
//     return updateEquipmentEntryByIdStmt.run(/*TODO*/)
// }


const deleteEquipmentEntryByIdStmt = db.prepare(`
    DELETE FROM equipment
    WHERE character_id = ?
        AND equipment_id = ?
`)

function deleteEquipmentEntryById(characterId, equipmentId) {
    return deleteEquipmentEntryByIdStmt.run(
        characterId,
        equipmentId
    )
}

const isInventoryItemCompatibleWithSlotStmt = db.prepare(`
    SELECT EXISTS (
        SELECT 1
        FROM inventory
        JOIN item_to_equipment_slot
            ON inventory.item_id = item_to_equipment_slot.item_id
        WHERE inventory.inventory_id = ?
        AND item_to_equipment_slot.equipment_slot_id = ?
    ) AS is_compatible;
`)

function isInventoryItemCompatibleWithSlot(inventoryId, equipmentSlotId) {
    const object = isInventoryItemCompatibleWithSlotStmt.get(
        inventoryId,
        equipmentSlotId
    )

    if (object.is_compatible) {
        return true
    }

    return false
}

const findCompatibleInventoryStmt = db.prepare(`
    SELECT
        inventory.inventory_id,

        items.item_id,
        items.item_index,
        items.name
    FROM inventory
    JOIN items
        ON inventory.item_id = items.item_id
    JOIN item_to_equipment_slot
        ON inventory.item_id = item_to_equipment_slot.item_id
    WHERE inventory.character_id = ?
        AND item_to_equipment_slot.equipment_slot_id = ?
        AND NOT EXISTS (
            SELECT 1
            FROM equipment
            WHERE equipment.character_id = inventory.character_id
                AND equipment.inventory_id = inventory.inventory_id
        )
`)

function findCompatibleInventory(characterId, equipmentSlotId) {
    return findCompatibleInventoryStmt.all(characterId, equipmentSlotId)
}

const isInventoryItemEquippedStmt = db.prepare(`
    SELECT EXISTS (
        SELECT 1
        FROM equipment
        WHERE equipment.character_id = ?
            AND equipment.inventory_id = ?
    ) AS is_equipped;
`)

function isInventoryItemEquipped(characterId, inventoryId){
    const object = isInventoryItemEquippedStmt.get(
        characterId, 
        inventoryId
    )
    
    if (object.is_equipped) {
        return true
    }

    return false
}

module.exports = {
    findAllEquipmentSlots,
    findEquipmentSlotById,
    findEquipmentEntryBySlot,
    findAllEquipment,
    findEquipmentEntryById,
    createEquipmentEntry,
    // TODO : updateEquipmentEntryById,
    deleteEquipmentEntryById,
    isInventoryItemCompatibleWithSlot,
    findCompatibleInventory,
    isInventoryItemEquipped
}