const db = require("./connection")

// --- Equipment Queries ---
const findAllEquipmentSlotsStmt = db.prepare(`
    SELECT
        equipment_slot_id,
        equipment_slot_name
    FROM equipment_slot_lookup
    ORDER BY equipment_slot_id
`)

function findAllEquipmentSlots(){
    return findAllEquipmentSlotsStmt.all()
}

const findEquipmentSlotByIdStmt = db.prepare(`
    SELECT
        equipment_slot_id,
        equipment_slot_name
    FROM equipment_slot_lookup
    WHERE equipment_slot_id = ?
`)

function findEquipmentSlotById(equipmentSlotId){
    return findEquipmentSlotByIdStmt.get(equipmentSlotId)
}

const findEquipmentEntryBySlotStmt = db.prepare(`
    SELECT
        equipment.equipment_id,
        equipment.inventory_id,

        items.item_id,
        items.item_index,
        items.name,

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

function findEquipmentEntryBySlot(characterId, equipmentSlotId){
    return findEquipmentEntryBySlotStmt.get(characterId, equipmentSlotId)
}

const findAllEquipmentStmt = db.prepare(`
    SELECT
        equipment.equipment_id,
        equipment.inventory_id,

        items.item_id,
        items.item_index,
        items.name,

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

function findAllEquipment(characterId){
    return findAllEquipmentStmt.all(characterId)
}

const findEquipmentEntryByIdStmt = db.prepare(`
    SELECT
        equipment.equipment_id,
        equipment.inventory_id,

        items.item_id,
        items.item_index,
        items.name,

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

function findEquipmentEntryById(characterId, equipmentId){
    return findEquipmentEntryByIdStmt.get(characterId, equipmentId)
}

const createEquipmentEntryStmt = db.prepare(`
    INSERT INTO equipment (
        character_id,
        inventory_id,
        equipment_slot_id
    )
    VALUES (?, ?, ?)
`)

function createEquipmentEntry(characterId, inventoryId, equipmentSlotId){
    const result = createEquipmentEntryStmt.run(characterId, inventoryId, equipmentSlotId)

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

function deleteEquipmentEntryById(characterId, equipmentId){
    return deleteEquipmentEntryByIdStmt.run(characterId, equipmentId)
}

module.exports = {
    findAllEquipmentSlots,
    findEquipmentSlotById,
    findEquipmentEntryBySlot,
    findAllEquipment,
    findEquipmentEntryById,
    createEquipmentEntry,
    // TODO : updateEquipmentEntryById,
    deleteEquipmentEntryById
}