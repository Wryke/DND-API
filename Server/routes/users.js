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
    deleteCharacterById
 } = require("../db/userQueries.js")


function isValidIndex(index, res) {
    if (!index || typeof index !== "string") {
        return false
    }
    return true
}

// --- User Routes ---
// GET /users/:id
// POST /users/
// PATCH /users/:id
// DELETE /users/:id

// --- Character Routes ---
// GET /users/:id/characters
// GET /users/:id/characters/:name
// POST /users/:id/characters
// PATCH /users/:id/characters/:name
// DELETE /users/:id/characters/:name

// --- Inventory Routes ---
// GET /users/:id/characters/:name/inventory
// GET /users/:id/characters/:name/inventory/:inventoryIndex
// PUT /users/:id/characters/:name/inventory
// PATCH /users/:id/characters/:name/inventory/:inventoryIndex
// DELETE /users/:id/characters/:name/inventory/:inventoryIndex

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

    const characterName = req.params.name

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

// GET /users/:id/characters/:name/inventory/:inventoryId - Get all items in a specific inventory
router.get("/:id/characters/:name/inventory/:inventoryId", (req, res) => {

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

    const characterName = req.params.name

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

// GET /users/:id/characters/:name/inventory/:inventoryId/items/itemIndex - Get a specific item from a characters inventory
router.get("/:id/characters/:name/inventory/:inventoryId/items/:itemIndex", (req, res) => {

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

    const characterName = req.params.name

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

// POST /users/:id/characters/:name/inventory - Add a new inventory to a character
router.post("/:id/characters/:name/inventory", (req, res) => {
    // TODO
})

// PATCH /users/:id/characters/:name/inventory/:inventoryIndex/:itemIndex - Modify an inventory/item
router.patch("/:id/characters/:name/inventory/:inventoryIndex/:itemIndex", (req, res) => {
    // TODO
})

// DELETE /users/:id/characters/:name/inventory/:inventoryIndex - Delete an inventory from a character.
router.delete("/:id/characters/:name/inventory/:inventoryIndex", (req, res) => {
    // TODO
})

module.exports = router