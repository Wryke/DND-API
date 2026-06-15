const express = require("express")
const router = express.Router()

const {
    loadUsers,
    saveUsers,
    findUser,
    findCharacter
} = require("../helpers/userHelpers.js")

function isValidIndex(index, res) {
    if (!index || typeof index !== "string") {
        return false
    }
    return true
}

// --- Routes ---

// GET /users/
// GET /users/:id
// GET /users/:id/characters
// GET /users/:id/characters/:characterName
// GET /users/:id/characters/:characterName/inventory
// GET /users/:id/characters/:characterName/inventory/:inventoryIndex
// GET /users/:id/characters/:characterName/inventory/:inventoryIndex/items/:itemIndex

// POST /users/
// POST /users/:id/characters
// POST /users/:id/characters/:characterName

// PUT /users/:id/characters/:characterName
// PUT /users/:id/characters/:characterName/inventory/:inventoryIndex

// PATCH /users/:id/characters/:characterName/inventory/:inventoryIndex/:itemIndex

// DELETE /users/:id
// DELETE /users/:id/characters/:characterName
// DELETE /users/:id/characters/:characterName/inventory/:inventoryIndex
// DELETE /users/:id/characters/:characterName/inventory/:inventoryIndex/items/:itemIndex

// --- Get Routes ---

// Get all users
router.get("/", (req, res) => {
    const users = loadUsers()
    res.json(users)
})


// Get specific user by id
router.get("/:id", (req, res) => {
    const id = req.params.id

    if(!isValidIndex(id)){
        return res.status(404).json({
            error: "Invalid ID"
        })
    }

    const users = loadUsers()

    let user = findUser(users, id)

    if(!user){
        return res.status(404).json({
            error: "User not found"
        })
    }

    res.json(user)
})

// Get a users characters
router.get("/:id/characters", (req, res) => {
    const id = req.params.id

    if(!isValidIndex(id)){
        return res.status(404).json({
            error: "Invalid ID"
        })
    }

    const users = loadUsers()

    let user = findUser(users, id)

    if(!user){
        return res.status(404).json({
            error: "User not found"
        })
    }

    const characters = user.characters

    res.json(characters)
})

// Get a specific character
router.get("/:id/characters/:characterName", (req, res) => {
    const id = req.params.id

    if(!isValidIndex(id)){
        return res.status(404).json({
            error: "Invalid ID"
        })
    }

    const users = loadUsers()

    const user = findUser(users, id)

    if(!user){
        return res.status(404).json({
            error: "User not found"
        })
    }

    const characterName = req.params.characterName

    if(!isValidIndex(characterName)){
        return res.status(404).json({
            error: "Invalid Index"
        })
    }

    const character = findCharacter(user, characterName)

    if(!character){
        return res.status(404).json({
            error: "Character not found"
        })
    }

    res.json(character)
})

// Get a specific characters inventories
router.get("/:id/characters/:characterName/inventory", (req, res) => {
    // TODO
    res.json(undefined)
})

// Get all items in a specific inventory
router.get("/:id/characters/:characterName/inventory/:inventoryIndex", (req, res) => {
    // TODO
    res.json(undefined)
})

// Get a specific item from a characters inventory
router.get("/:id/characters/:characterName/inventory/:inventoryIndex/items/:itemIndex", (req, res) => {
    // TODO
    res.json(undefined)
})

// --- Post Routes ---

// Post a new user with empty characters list
router.post("/", (req, res) => {
    const users = loadUsers()

    const newUser = {
        id: req.body.id,
        username: req.body.username,
        characters: []
    }

    if (findUser(users, newUser.id)) {
        return res.status(409).json({
            error: "User already exists"
        })
    }

    users.push(newUser)
    saveUsers(users)

    res.status(201).json(newUser)
})

// Post a new character to a character list.
router.post("/:id/characters", (req, res) => {
    const id = req.params.id

    const user = users.find(user => user.id === id)

    if (!user) {
        return res.status(404).json({
            error: "User not found"
        })
    }

    if (!Array.isArray(req.body)) {
        return res.status(400).json({
            error: "Request body must be an array of characters"
        })
    }

    user.Characters = req.body

    fs.writeFileSync(
        USERS,
        JSON.stringify(users, null, 4)
    )

    res.json(user)
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

// --- Delete Routes ---

// Delete a user
router.delete("/:id", (req, res) => {
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