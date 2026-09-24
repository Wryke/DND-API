const db = require("./connection")

// --- Equipment Quries ---

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

module.exports = {
    findAllEquipment
}