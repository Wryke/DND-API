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
    deleteUserById,
    findCharactersByUserId,
    findCharacterByUserIdAndName,
    createCharacter,
    deleteCharacterById
 } = require("../db/userQueries.js")

//     findUserById,
//     findUserByUsername,
//     createUser,
//     deleteUserById,
//     findCharactersByUserId,
//     createCharacter

function isValidIndex(index, res) {
    if (!index || typeof index !== "string") {
        return false
    }
    return true
}

// --- User Routes ---
// GET /users/:id
// POST /users/
// DELETE /users/:id

// --- Character Routes ---
// GET /users/:id/characters
// GET /users/:id/characters/:name
// POST /users/:id/characters
// DELETE /users/:id/characters/:name

// --- Inventory Routes ---
// GET /users/:id/characters/:name/inventory
// GET /users/:id/characters/:name/inventory/:inventoryIndex
// GET /users/:id/characters/:name/inventory/:inventoryIndex/items/:itemIndex

// PUT /users/:id/characters/:name
// PUT /users/:id/characters/:name/inventory/:inventoryIndex

// PATCH /users/:id/characters/:name/inventory/:inventoryIndex/:itemIndex

// DELETE /users/:id/characters/:name
// DELETE /users/:id/characters/:name/inventory/:inventoryIndex
// DELETE /users/:id/characters/:name/inventory/:inventoryIndex/items/:itemIndex

// --- User Routes ---

// Get specific user by id
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

// Post a new user
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

// Delete a user
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

// Get a users characters
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

// Get a specific character
router.get("/:id/characters/:name", (req, res) => {
        const userId = Number(req.params.id)
        const characterName = req.params.name

    if (
        !Number.isInteger(userId) ||
        typeof characterName !== "string" ||
        characterName.trim().length === 0
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

    const character = findCharacterByUserIdAndName(userId, characterName.trim())

    if(!character){
        return res.status(404).json({
            error: "Character not found"
        })
    }

    return res.status(200).json(character)
})

// Post a new character
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

// DELETE a character from a user
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

// Get a specific characters inventories
router.get("/:id/characters/:characterName/inventory", (req, res) => {
    const id = req.params.id

    if(!isValidIndex(id)){
        return res.status(404).json({
            err: "Invalid ID"
        })
    }

    const users = loadUsers()
    const user = findUser(users, id)

    if(!user){
        return res.status(404).json({
            err: "User not found"
        })
    }

    const characterName = req.params.characterName

    if(!isValidIndex(characterName)){
        return res.status(404).json({
            err: "Invalid character name"
        })
    }

    const character = findCharacter(user, characterName)

    if(!character){
        return res.status(404).json({
            err: "Invalid character"
        })
    }

    const inventories = character.inventories

    if(!inventories){
        return res.status(404).json({
            err: "Invalid inventory"
        })
    }

    res.json(inventories)
})

// Get all items in a specific inventory
router.get("/:id/characters/:characterName/inventory/:inventoryIndex", (req, res) => {
    const id = req.params.id

    if(!isValidIndex(id)){
        return res.status(404).json({
            err: "Invalid ID"
        })
    }

    const users = loadUsers()
    const user = findUser(users, id)

    if(!user){
        return res.status(404).json({
            err: "User not found"
        })
    }

    const characterName = req.params.characterName

    if(!isValidIndex(characterName)){
        return res.status(404).json({
            err: "Invalid character name"
        })
    }

    const character = findCharacter(user, characterName)

    if(!character){
        return res.status(404).json({
            err: "Invalid character"
        })
    }

    const inventories = character.inventories

    if(!inventories){
        return res.status(404).json({
            err: "Invalid inventory"
        })
    }

    const inventoryIndex = req.params.inventoryIndex

    if(!isValidIndex(inventoryIndex)){
        return res.status(404).json({
            err: "Invalid inventory index"
        })
    }

    const inventory = findInventory(inventories, inventoryIndex)

    if(!inventory){
        return res.status(404).json({
            err: "Invalid inventory"
        })
    }

    res.json(inventory)
})

// Get a specific item from a characters inventory
router.get("/:id/characters/:characterName/inventory/:inventoryIndex/items/:itemIndex", (req, res) => {
    const id = req.params.id

    if(!isValidIndex(id)){
        return res.status(404).json({
            err: "Invalid ID"
        })
    }

    const users = loadUsers()
    const user = findUser(users, id)

    if(!user){
        return res.status(404).json({
            err: "User not found"
        })
    }

    const characterName = req.params.characterName

    if(!isValidIndex(characterName)){
        return res.status(404).json({
            err: "Invalid character name"
        })
    }

    const character = findCharacter(user, characterName)

    if(!character){
        return res.status(404).json({
            err: "Invalid character"
        })
    }

    const inventories = character.inventories

    if(!inventories){
        return res.status(404).json({
            err: "Invalid inventory"
        })
    }

    const inventoryIndex = req.params.inventoryIndex

    if(!isValidIndex(inventoryIndex)){
        return res.status(404).json({
            err: "Invalid inventory index"
        })
    }

    const inventory = findInventory(inventories, inventoryIndex)

    if(!inventory){
        return res.status(404).json({
            err: "Invalid inventory"
        })
    }

    const itemIndex = req.params.itemIndex

    if(!isValidIndex(itemIndex)){
        return res.status(404).json({
            err: "Invalid index"
        })
    }

    const item = findItem(inventory, itemIndex)

    if(!item){
        return res.status(404).json({
            err: "Item not found"
        })
    }

    res.json(item)
})

// Post a new inventory to a character
router.post("/:id/characters/:characterName", (req, res) => {
    // TODO
})

// --- Put Routes ---

// Put replace/modify an existing character.
router.put("/:id/characters/:characterName", (req, res) => {
    // TODO
})

// Put replace/modify an existing inventory.
router.put("/:id/characters/:characterName/inventory/:inventoryIndex", (req, res) => {
    // TODO
})

// --- Patch Routes ---

// Patch new item or modify quantity
router.patch("/:id/characters/:characterName/inventory/:inventoryIndex/:itemIndex", (req, res) => {
    // TODO
})

// Delete a character from a user.
router.delete("/:id/characters/:characterName", (req, res) => {
    // TODO
})

// Delete an inventory from a character.
router.delete("/:id/characters/:characterName/inventory/:inventoryIndex", (req, res) => {
    // TODO
})

// Delete an item from an inventory.
router.delete("/:id/characters/:characterName/inventory/:inventoryIndex/items/:itemIndex", (req, res) => {
    // TODO
})

module.exports = router