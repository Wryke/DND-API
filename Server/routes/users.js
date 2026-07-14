const express = require("express")
const router = express.Router()

const {
    loadUsers,
    saveUsers,
    findUser,
    findCharacter,
    findInventory,
    findItem
} = require("../helpers/userHelpers.js")

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
    findRootInventoryByCharacterId,
    findInventoryChildren,
    createInventoryEntry,
    updateInventoryQuantity,
    moveInventoryEntry,
    deleteInventoryEntry
 } = require("../db/userQueries.js")

// --- User Routes ---
// GET    /users/:id
// POST   /users/
// PATCH  /users/:id
// DELETE /users/:id

// --- Character Routes ---
// GET    /users/:id/characters
// GET    /users/:id/characters/:name
// POST   /users/:id/characters
// PATCH  /users/:id/characters/:name
// DELETE /users/:id/characters/:name

// --- Inventory Routes ---
// GET    /users/:id/characters/:name/inventory
// GET    /users/:id/characters/:name/inventory/:inventoryId
// GET    /users/:id/characters/:name/inventory/:inventoryId/children
// POST   /users/:id/characters/:name/inventory
// PATCH  /users/:id/characters/:name/inventory/:inventoryId
// DELETE /users/:id/characters/:name/inventory/:inventoryId

// --- User Routes ---

// GET /users/:id - get a user by id
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

// POST /users/ - Add a new user
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

// PATCH /users/:id - update a user
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

// DELETE /users/:id - delete a user
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

// GET /users/:id/characters - get a users list of characters
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

// GET /users/:id/characters/:name - get a user's specific character
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

// POST /users/:id/characters - Add a new character
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

// PATCH /users/:id - update a user
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

// GET /users/:id/characters/:name/inventory - get a characters entire inventory
router.get("/:id/characters/:name/inventory", (req, res) => {

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

    const character = findCharacterByUserIdAndName(userId, name.trim())

    if (!character) {
        return res.status(404).json({
            error: "Character not found"
        })
    }

    const rootInventory = findRootInventoryByCharacterId(character.character_id)

    return res.status(200).json(rootInventory)
})

// GET /users/:id/characters/:name/inventory/:inventoryId - Get a specific inventory entry
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

// GET /users/:id/characters/:name/inventory/:inventoryId/children - Get the children of a specific inventory
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

// POST /users/:id/characters/:name/inventory - Add a new inventory to a character
router.post("/:id/characters/:name/inventory", (req, res) => {
    
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

    const character = findCharacterByUserIdAndName(userId, name.trim())

    if (!character) {
        return res.status(404).json({
            error: "Character not found"
        })
    }

    try {
        const entry = createInventoryEntry({
            character_id: character.character_id,
            item_id: req.body.item_id,
            parent_inventory_id: req.body.parent_inventory_id ?? null,
            quantity: req.body.quantity
        })
        return res.status(201).json(entry)
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error"
        })
    }
})

// PATCH /users/:id/characters/:name/inventory/:inventoryId - Modify an inventory/item
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

    try {
        if (hasQuantity) {
            updateInventoryQuantity(inventoryId, quantity)
        }

        if (hasParentInventoryId) {
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

// DELETE /users/:id/characters/:name/inventory/:inventoryId - Delete an inventory from a character
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

        return res.status(200).json({
            deleted: true
        })
    } catch(error) {
        return res.status(500).json({
            error: "Internal server error"
        })
    }
})

module.exports = router