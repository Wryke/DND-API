const express = require("express")
const router = express.Router()

const { 
    findUserById,
    findUserByUsername,
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
    deleteInventoryEntry,
 } = require("../db/userQueries.js")
const { findItemByIndex } = require("../db/itemQueries.js")

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

// --- User Routes ---
// GET /users/:id - Return a user by ID
// POST /users - Create a user
// PATCH /users/:id - Update a user's information
// DELETE /users/:id - Delete a user

// --- Character Routes ---
// GET /users/:id/characters - Return all characters owned by a user
// GET /users/:id/characters/:name - Return a character by name
// POST /users/:id/characters - Create a character for a user
// PATCH /users/:id/characters/:name - Update a character
// DELETE /users/:id/characters/:name - Delete a character

// --- Inventory Routes ---
// GET /users/:id/characters/:name/inventory/all - Returns a character's entire inventory
// GET /users/:id/characters/:name/inventory/root - Return a character's root inventory entries
// GET /users/:id/characters/:name/inventory/:inventoryId - Return an inventory entry
// GET /users/:id/characters/:name/inventory/:inventoryId/children - Return the direct children of an inventory entry
// POST /users/:id/characters/:name/inventory - Create an inventory entry
// PATCH /users/:id/characters/:name/inventory/:inventoryId - Update an inventory entry
// DELETE /users/:id/characters/:name/inventory/:inventoryId - Delete an inventory entry

// --- Equipment Routes ---
// GET /equipment/slots - Returns equipment slot lookup
// GET /users/:id/characters/:name/equipment/compatible/:slotId - Return all a characters inventory items that are compatible with selected slot
// GET /users/:id/characters/:name/equipment - Returns all of a characters equipped items
// GET /users/:id/characters/:name/equipment/:equipmentId - Returns a specific equipped item
// POST /users/:id/characters/:name/equipment - Create an equipment entry
// PATCH ??
// DELETE /users/:id/characters/:name/equipment/:equipmentId - Delete an equipment entry
// --- ---------------- ---

// --- User Routes ---

// GET /users/:id - Return a user by ID
router.get("/:id", (req, res) => {

    const userId = Number(req.params.id)

    if(!Number.isInteger(userId)){
        return res.status(400).json({
            error: "Invalid user ID"
        })
    }

    const user = findUserById(userId)

    if(!user){
        return res.status(404).json({
            error: "User not found"
        })
    }

    return res.status(200).json(user)
})

// POST /users - Create a user
router.post("/", (req, res) => {

    const username = req.body.username
    const password = req.body.password

    if (!username || !password) {
        return res.status(400).json({
            error: "Username and password are required"
        })
    }

    try {
        const user = createUser(req.body)
        return res.status(201).json(user)
    } catch (error) {
        if(error.message.includes("UNIQUE constraint failed")) {
            return res.status(409).json({
                error: "Username already exists"
            })
        }

        return res.status(500).json({
            error: "Internal server error"
        })
    }
})

// PATCH /users/:id - Update a user's information
router.patch("/:id", (req, res) => {

    const userId = Number(req.params.id)
    const { username } = req.body

    if(!Number.isInteger(userId)){
        return res.status(400).json({
            error: "Invalid user ID"
        })
    }

    if (
        typeof username !== "string" ||
        username.trim().length === 0
    ) {
        return res.status(400).json({
            error: "A valid username is required"
        })
    }

    try {
        const updated = updateUserById(userId, {
            username: username.trim()
        })

        if (!updated) {
            return res.status(404).json({
                error: "User not found"
            })
        }

        return res.status(200).json(updated)
    }
    catch (error) {
        if (error.message.includes("UNIQUE constraint failed")) {
            return res.status(409).json({
                error: "Username already exists"
            })
        }

        return res.status(500).json({
            error: "Internal server error"
        })
    }
})

// DELETE /users/:id - Delete a user
router.delete("/:id", (req, res) => {

    const deleted = deleteUserById(req.params.id)

    if (!deleted) {
        return res.status(404).json({
            error: "User not found"
        })
    }

    return res.status(200).json({
        deleted: true
    })
})

// --- Character Routes ---

// GET /users/:id/characters - Return all characters owned by a user
router.get("/:id/characters", (req, res) => {

    const userId = Number(req.params.id)

    if(!Number.isInteger(userId)){
        return res.status(400).json({
            error: "Invalid user ID"
        })
    }

    const user = findUserById(userId)

    if(!user){
        return res.status(404).json({
            error: "User not found"
        })
    }

    const characters = findCharactersByUserId(userId)

    return res.status(200).json(characters)
})

// GET /users/:id/characters/:name - Return a character by name
router.get("/:id/characters/:name", (req, res) => {

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

    return res.status(200).json(character)
})

// POST /users/:id/characters - Create a character for a user
router.post("/:id/characters", (req, res) => {

    const userId = Number(req.params.id)
    const { name, max_weight } = req.body

    if (!Number.isInteger(userId)) {
        return res.status(400).json({
            error: "Invalid user ID"
        })
    }

    const user = findUserById(userId)

    if (!user) {
        return res.status(404).json({
            error: "User not found"
        })
    }

    if (
        typeof name !== "string" ||
        name.trim().length === 0 ||
        typeof max_weight !== "number" ||
        max_weight <= 0
    ) {
        return res.status(400).json({
            error: "Name and a positive max weight are required"
        })
    }

    try {
        const character = createCharacter({
            user_id: userId,
            name: name.trim(),
            max_weight
        })

        return res.status(201).json(character)
    }
    catch (error) {
        if (error.message.includes("UNIQUE constraint failed")) {
            return res.status(409).json({
                error: "This user already has a character with that name"
            })
        }

        return res.status(500).json({
            error: "Internal server error"
        })
    }
})

// PATCH /users/:id/characters/:name - Update a character
router.patch("/:id/characters/:name", (req, res) => {
    
    const userId = Number(req.params.id)
    const currentName = req.params.name
    const { name: newName, max_weight } = req.body

    if (
        !Number.isInteger(userId) ||
        typeof currentName !== "string" ||
        currentName.trim().length === 0
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

    const character = findCharacterByUserIdAndName(userId, currentName.trim())

    if (!character) {
        return res.status(404).json({
            error: "Character not found"
        })
    }

    const hasName = newName !== undefined
    const hasMaxWeight = max_weight !== undefined

    if (!hasName && !hasMaxWeight) {
        return res.status(400).json({
            error: "At least one field must be provided"
        })
    }

    if (hasName && (typeof newName !== "string" || newName.trim().length === 0)) {
        return res.status(400).json({
            error: "Name must be a non-empty string"
        })
    }

    if (hasMaxWeight && (typeof max_weight !== "number" || max_weight <= 0)) {
        return res.status(400).json({
            error: "Max weight must be a positive number"
        })
    }

    try {
        const updated = updateCharacterById(
            character.character_id,
            {
                name: hasName ? newName.trim() : character.name,
                max_weight: hasMaxWeight ? max_weight : character.max_weight 
            })

        if (!updated) {
            return res.status(404).json({
                error: "Character not found"
            })
        }

        return res.status(200).json(updated)
    }
    catch (error) {
        if (error.message.includes("UNIQUE constraint failed")) {
            return res.status(409).json({
                error: "This user already has a character with that name"
            })
        }

        return res.status(500).json({
            error: "Internal server error"
        })
    }
})

// DELETE /users/:id/characters/:name - Delete a character
router.delete("/:id/characters/:name", (req,res) => {

    const userId = Number(req.params.id)
    const name = req.params.name

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

    const character = findCharacterByUserIdAndName(userId, name)

    if (!character) {
        return res.status(404).json({
            error: "Character not found"
        });
    }

    const deleted = deleteCharacterById(character.character_id)

    if (!deleted) {
        return res.status(404).json({
            error: "Character not found"
        })
    }

    return res.status(200).json({
        deleted: true
    })
})

// --- Inventory Routes ---

// GET /users/:id/characters/:name/inventory/all - Returns a character's entire inventory
router.get("/:id/characters/:name/inventory/all", (req, res) => {
    const userId = Number(req.params.id)
    const name = req.params.name

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

    const character = findCharacterByUserIdAndName(userId, name.trim())

    if (!character) {
        return res.status(404).json({
            error: "Character not found"
        })
    }

    const inventory = findAllInventoryByCharacterId(character.character_id)

    return res.status(200).json(inventory)
})

// GET /users/:id/characters/:name/inventory/root - Return a character's root inventory entries
router.get("/:id/characters/:name/inventory/root", (req, res) => {

    const userId = Number(req.params.id)
    const name = req.params.name

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

    const character = findCharacterByUserIdAndName(userId, name.trim())

    if (!character) {
        return res.status(404).json({
            error: "Character not found"
        })
    }

    const rootInventory = findRootInventoryByCharacterId(character.character_id)

    return res.status(200).json(rootInventory)
})

// GET /users/:id/characters/:name/inventory/:inventoryId - Return an inventory entry
router.get("/:id/characters/:name/inventory/:inventoryId", (req, res) => {
    
    const userId = Number(req.params.id)
    const name = req.params.name
    const inventoryId = Number(req.params.inventoryId)

    if (
        !Number.isInteger(userId) ||
        typeof name !== "string" ||
        name.trim().length === 0 ||
        !Number.isInteger(inventoryId)
    ) {
        return res.status(400).json({
            error: "A valid user ID, character name, and inventory ID are required"
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

    const inventory = findInventoryEntryById(character.character_id, inventoryId)

    if (!inventory) {
        return res.status(404).json({
            error: "Inventory not found"
        })
    }

    return res.status(200).json(inventory)
})

// GET /users/:id/characters/:name/inventory/:inventoryId/children - Return the direct children of an inventory entry
router.get("/:id/characters/:name/inventory/:inventoryId/children", (req, res) => {

    const userId = Number(req.params.id)
    const name = req.params.name
    const inventoryId = Number(req.params.inventoryId)

    if (
        !Number.isInteger(userId) ||
        typeof name !== "string" ||
        name.trim().length === 0 ||
        !Number.isInteger(inventoryId)
    ) {
        return res.status(400).json({
            error: "A valid user ID, character name, and inventory ID are required"
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

    const parentEntry = findInventoryEntryById(character.character_id, inventoryId)

    if (!parentEntry) {
        return res.status(404).json({
            error: "Inventory entry not found"
        })
    }

    const inventory = findInventoryChildren(character.character_id, inventoryId)

    return res.status(200).json(inventory)
})

// POST /users/:id/characters/:name/inventory - Create an inventory entry
router.post("/:id/characters/:name/inventory", (req, res) => {
    
    const userId = Number(req.params.id)
    const name = req.params.name
    const { item_index, parent_inventory_id, quantity } = req.body

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

    const character = findCharacterByUserIdAndName(userId, name.trim())

    if (!character) {
        return res.status(404).json({
            error: "Character not found"
        })
    }

    if (
        typeof item_index !== "string" || 
        item_index.trim().length === 0 ||
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {
        return res.status(400).json({
            error: "A valid item index and positive quantity are required"
        })
    }

    const parentInventoryId = parent_inventory_id ?? null

    if (parentInventoryId !== null && !Number.isInteger(parentInventoryId)) {
        return res.status(400).json({
            error: "Parent inventory ID must be an integer or null"
        })
    }

    // Ensure parent exists
    if (parentInventoryId !== null) {
        const parentEntry = findInventoryEntryById(character.character_id, parentInventoryId)

        if (!parentEntry) {
            return res.status(404).json({
                error: "Parent inventory entry not found"
            })
        }
    }

    // Ensure new item exists
    const newItem = findItemByIndex(item_index.trim())
    if(!newItem) {
        return res.status(404).json({
            error: "Item not found"
        })
    }

    try {
        const entry = createInventoryEntry({
            character_id: character.character_id,
            item_id: newItem.item_id,
            parent_inventory_id: parentInventoryId,
            quantity
        })
        
        const fullEntry = findInventoryEntryById(
            entry.character_id, 
            entry.inventory_id
        )

        return res.status(201).json(fullEntry)
    }
    catch (error) {
        return res.status(500).json({
            error: "Internal server error"
        })
    }
})

// PATCH /users/:id/characters/:name/inventory/:inventoryId - Update an inventory entry
router.patch("/:id/characters/:name/inventory/:inventoryId", (req, res) => {
    
    const userId = Number(req.params.id)
    const name = req.params.name
    const inventoryId = Number(req.params.inventoryId)
    const { quantity, parent_inventory_id } = req.body

    if (
        !Number.isInteger(userId) ||
        typeof name !== "string" ||
        name.trim().length === 0 ||
        !Number.isInteger(inventoryId)
    ) {
        return res.status(400).json({
            error: "A valid user ID, character name, and inventory ID are required"
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

    const existingEntry = findInventoryEntryById( character.character_id, inventoryId)

    if (!existingEntry) {
        return res.status(404).json({
            error: "Inventory entry not found"
        })
    }

    const hasQuantity = quantity !== undefined
    const hasParentInventoryId = parent_inventory_id !== undefined

    // No arguments provided
    if (!hasQuantity && !hasParentInventoryId) {
        return res.status(400).json({
            error: "At least one update field is required"
        })
    }

    // Invalid quantity arg
    if (hasQuantity && (!Number.isInteger(quantity) || quantity <= 0)) {
        return res.status(400).json({
            error: "Quantity must be a positive integer"
        })
    }

    // Invalid parentId arg
    if (hasParentInventoryId && parent_inventory_id !== null && !Number.isInteger(parent_inventory_id)) {
        return res.status(400).json({
            error: "Parent inventory ID must be an integer or null"
        })
    }

    // Invalid self reference
    if (parent_inventory_id === inventoryId) {
        return res.status(400).json({
            error: "An inventory entry cannot contain itself"
        })
    }

    // Check if the new parent entry exists
    if (hasParentInventoryId && parent_inventory_id !== null) {
        const parentEntry = findInventoryEntryById(character.character_id, parent_inventory_id)

        if (!parentEntry) {
            return res.status(404).json({
                error: "Parent inventory entry not found"
            })
        }
    }

    // Check to ensure no descendants can be parents of their ancestors
    if (
        wouldCreateInventoryCycle(character.character_id, inventoryId, parent_inventory_id)
    ) {
        return res.status(400).json({
            error: "An inventory entry cannot be moved into one of its descendants"
        })
    }

    try {
        if(hasQuantity && hasParentInventoryId) {
            updateInventoryEntry(inventoryId, {quantity, parent_inventory_id})
        } else if (hasQuantity) {
            updateInventoryQuantity(inventoryId, quantity)
        } else {
            moveInventoryEntry(inventoryId, parent_inventory_id)
        }

        const updatedEntry = findInventoryEntryById(character.character_id, inventoryId)

        return res.status(200).json(updatedEntry)
    }
    catch (error) {
        console.error(error)

        return res.status(500).json({
            error: "Internal server error"
        })
    }
})

// Helper for patch route to ensure decendant inventory cannot be parent of any ancestor
function wouldCreateInventoryCycle(characterId, inventoryId, proposedParentId) {
    
    let currentParentId = proposedParentId

    while (currentParentId !== null) {
        if (currentParentId === inventoryId) {
            return true
        }

        const currentEntry = findInventoryEntryById(
            characterId,
            currentParentId
        )

        if (!currentEntry) {
            return false
        }

        currentParentId = currentEntry.parent_inventory_id
    }

    return false
}

// DELETE /users/:id/characters/:name/inventory/:inventoryId - Delete an inventory entry
router.delete("/:id/characters/:name/inventory/:inventoryId", (req, res) => {

    const userId = Number(req.params.id)
    const name = req.params.name
    const inventoryId = Number(req.params.inventoryId)

    if (
        !Number.isInteger(userId) ||
        typeof name !== "string" ||
        name.trim().length === 0 ||
        !Number.isInteger(inventoryId)
    ) {
        return res.status(400).json({
            error: "A valid user ID, character name, and inventory ID are required"
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

    const existingEntry = findInventoryEntryById( character.character_id, inventoryId)

    if (!existingEntry) {
        return res.status(404).json({
            error: "Inventory entry not found"
        })
    }

    try {
        const deleted = deleteInventoryEntry(inventoryId)

        if (!deleted) {
            return res.status(500).json({
                error: "Entry could not be deleted"
            })
        }

        const updatedInventory = findAllInventoryByCharacterId(
            character.character_id
        )

        return res.status(200).json({
            deleted: true,
            inventory: updatedInventory
        })
    } catch(error) {
        return res.status(500).json({
            error: "Internal server error"
        })
    }
})

// --- Equipment Routes ---

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