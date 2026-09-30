const express = require("express")
const router = express.Router()

const { 
    findUserById,
    findCharacterByUserIdAndName,
    findInventoryEntryById,
 } = require("../db/userQueries.js")

const {
    findAllEquipmentSlots,
    findEquipmentSlotById,
    findEquipmentEntryBySlot,
    findAllEquipment,
    findEquipmentEntryById,
    createEquipmentEntry,
    deleteEquipmentEntryById,
    isInventoryItemCompatibleWithSlot,
    findCompatibleInventory,
    isInventoryItemEquipped
} = require("../db/equipmentQueries.js")

// --- Equipment Routes ---
// GET /equipment/slots - Returns equipment slot lookup
// --- ---------------- ---

// --- Character Equipment Routes ---
// GET /equipment/slots - Returns equipment slot lookup
// GET /users/:id/characters/:name/equipment/compatible/:slotId - Return all a characters inventory items that are compatible with selected slot
// GET /users/:id/characters/:name/equipment - Returns all of a characters equipped items
// GET /users/:id/characters/:name/equipment/:equipmentId - Returns a specific equipped item
// POST /users/:id/characters/:name/equipment - Create an equipment entry
// PATCH ??
// DELETE /users/:id/characters/:name/equipment/:equipmentId - Delete an equipment entry
// --- -------------------------- ---

// --- Equipment Routes ---

// GET /equipment/slots - Returns equipment slot lookup
router.get("/slots", (req, res) => {
    const data = findAllEquipmentSlots()

    return res.status(200).json(data)
})

// --- Character Equipment Routes ---

// GET /users/:id/characters/:name/equipment - Returns all of a characters equipped items
router.get("/:id/characters/:name/equipment", (req, res) => {
    const userId = Number(req.params.id)
    const name = req.params.name

    if (
        !Number.isInteger(userId) ||
        typeof name !== "string" ||
        name.trim().length === 0
    ) {
        return res.status(400).json({
            error: "Invalid user ID or character name"
        })
    }

    const user = findUserById(userId)

    if(!user){
        return res.status(404).json({
            error: "User not found"
        })
    }

    const character = findCharacterByUserIdAndName(userId, name.trim())

    if(!character){
        return res.status(404).json({
            error: "Character not found"
        })
    }

    const equipment = findAllEquipment(character.character_id)

    return res.status(200).json(equipment)
})

// GET /users/:id/characters/:name/equipment/compatible/:slotId - Return all a characters inventory items that are compatible with selected slot
router.get("/:id/characters/:name/equipment/compatible/:slotId", (req, res) => {
    const userId = Number(req.params.id)
    const name = req.params.name
    const slotId = Number(req.params.slotId)

    if (
        !Number.isInteger(userId) ||
        typeof name !== "string" ||
        name.trim().length === 0 ||
        !Number.isInteger(slotId)
    ) {
        return res.status(400).json({
            error: "Invalid user ID, character name, or equipment slot ID"
        })
    }

    const user = findUserById(userId)

    if(!user){
        return res.status(404).json({
            error: "User not found"
        })
    }

    const character = findCharacterByUserIdAndName(userId, name.trim())

    if(!character){
        return res.status(404).json({
            error: "Character not found"
        })
    }

    const validSlot = findEquipmentSlotById(slotId)

    if(!validSlot){
        return res.status(404).json({
            error: "Invalid slot ID"
        })
    }

    const compatibleInventory = findCompatibleInventory(character.character_id, slotId)

    return res.status(200).json(compatibleInventory)
})

// GET /users/:id/characters/:name/equipment/:equipmentId - Returns a specific equipped item
router.get("/:id/characters/:name/equipment/:equipmentId", (req, res) => {
    const userId = Number(req.params.id)
    const name = req.params.name
    const equipmentId = Number(req.params.equipmentId)

    if (
        !Number.isInteger(userId) ||
        typeof name !== "string" ||
        name.trim().length === 0 ||
        !Number.isInteger(equipmentId)
    ) {
        return res.status(400).json({
            error: "Invalid user ID, character name, or equipment ID"
        })
    }

    const user = findUserById(userId)

    if(!user){
        return res.status(404).json({
            error: "User not found"
        })
    }

    const character = findCharacterByUserIdAndName(userId, name.trim())

    if(!character){
        return res.status(404).json({
            error: "Character not found"
        })
    }

    const equipmentEntry = findEquipmentEntryById(character.character_id, equipmentId)

    if(!equipmentEntry){
        return res.status(404).json({
            error: "Equipment entry not found"
        })
    }

    return res.status(200).json(equipmentEntry)
})

// POST /users/:id/characters/:name/equipment - Create an equipment entry
router.post("/:id/characters/:name/equipment", (req, res) => {
    const userId = Number(req.params.id)
    const name = req.params.name
    const { inventory_id, equipment_slot_id } = req.body

    if (
        !Number.isInteger(userId) ||
        typeof name !== "string" ||
        name.trim().length === 0
    ) {
        return res.status(400).json({
            error: "A valid user ID and character name are required"
        })
    }

    const user = findUserById(userId)

    if(!user){
        return res.status(404).json({
            error: "User not found"
        })
    }

    const character = findCharacterByUserIdAndName(
        userId, 
        name.trim()
    )

    if (!character) {
        return res.status(404).json({
            error: "Character not found"
        })
    }

    if (
        !Number.isInteger(inventory_id) || 
        !Number.isInteger(equipment_slot_id)
    ) {
        return res.status(400).json({
            error: "Inventory ID and Slot ID must both be an integer"
        })
    }

    // Ensure inventory entry exists
    const inventoryEntry = findInventoryEntryById(
        character.character_id, 
        inventory_id
    )

    if(!inventoryEntry) {
        return res.status(404).json({
            error: "Inventory entry not found"
        })
    }

    // Ensure equipment slot exists
    const validSlot = findEquipmentSlotById(equipment_slot_id)

    if(!validSlot){
        return res.status(404).json({
            error: "Invalid slot ID"
        })
    }

    // Ensure item is compatible with said slot
    if(!isInventoryItemCompatibleWithSlot(inventory_id, equipment_slot_id)){
        return res.status(400).json({
            "error": "Item is not compatible with this equipment slot"
        })
    }

    // Ensure the item isn't already equipped somewhere else
    if(isInventoryItemEquipped(character.character_id, inventory_id)){
        return res.status(409).json({
            "error": "Item is already equipped somewhere else"
        })
    }

    // Ensure the current slot isnt already being used
    const currentSlot = findEquipmentEntryBySlot(
        character.character_id, 
        equipment_slot_id
    )

    if(currentSlot) {
        return res.status(409).json({
            error: "Current slot is occupied"
        })
    }

    try {
        const entry = createEquipmentEntry(
            character.character_id,
            inventory_id,
            equipment_slot_id
        )
        
        const fullEntry = findEquipmentEntryById(
            entry.character_id, 
            entry.equipment_id
        )

        return res.status(201).json(fullEntry)
    }
    catch (error) {
        return res.status(500).json({
            error: "Internal server error"
        })
    }

})

// PATCH ??

// DELETE /users/:id/characters/:name/equipment/:equipmentId - Delete an equipment entry
router.delete("/:id/characters/:name/equipment/:equipmentId", (req, res) => {

    const userId = Number(req.params.id)
    const name = req.params.name
    const equipmentId = Number(req.params.equipmentId)

    if (
        !Number.isInteger(userId) ||
        typeof name !== "string" ||
        name.trim().length === 0 ||
        !Number.isInteger(equipmentId)
    ) {
        return res.status(400).json({
            error: "A valid user ID, character name, and equipment ID are required"
        })
    }

    const user = findUserById(userId)

    if(!user){
        return res.status(404).json({
            error: "User not found"
        })
    }

    const character = findCharacterByUserIdAndName(userId, name.trim())

    if (!character) {
        return res.status(404).json({
            error: "Character not found"
        })
    }

    const existingEntry = findEquipmentEntryById(
        character.character_id, 
        equipmentId
    )

    if (!existingEntry) {
        return res.status(404).json({
            error: "Equipment entry not found"
        })
    }

    try {
        const deleted = deleteEquipmentEntryById(
            character.character_id, 
            equipmentId
        )

        if (deleted.changes === 0) {
            return res.status(500).json({
                error: "Entry could not be deleted"
            })
        }

        const updatedEquipment = findAllEquipment(character.character_id)

        return res.status(200).json({
            deleted: true,
            equipment: updatedEquipment
        })
    } catch(error) {
        return res.status(500).json({
            error: "Internal server error"
        })
    }
})

module.exports = router