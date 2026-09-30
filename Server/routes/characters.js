const express = require("express")
const router = express.Router()

const requireAuth = require("../middleware/requireAuth")

const { 
    findUserById,

    findCharactersByUserId,
    findCharacterByUserIdAndName,
    createCharacter,
    updateCharacterById,
    deleteCharacterById,
 } = require("../db/userQueries.js")

// --- Character Routes ---
// GET /characters/ - Return all characters owned by a user
// GET /characters/:name - Return a character by name
// POST /characters/ - Create a character for a user
// PATCH /characters/:name - Update a character
// DELETE /characters/:name - Delete a character
// --- ---------------- ---

// --- Character Routes ---

// GET /characters/ - Return all characters owned by a user
router.get("/", requireAuth, (req, res) => {

    const userId = req.session.userId

    const user = findUserById(userId)

    if (!user) {
        return res.status(404).json({
            error: "User not found"
        })
    }

    const characters = findCharactersByUserId(userId)

    return res.status(200).json(characters)
})

// GET /characters/:name - Return a character by name
router.get("/:name", requireAuth, (req, res) => {

    const userId = req.session.userId

    const user = findUserById(userId)

    if (!user) {
        return res.status(404).json({
            error: "User not found"
        })
    }

    const name = req.params.name

    if (
        typeof name !== "string" ||
        name.trim().length === 0
    ) {
        return res.status(400).json({
            error: "Invalid character name"
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

// POST /characters/ - Create a character for a user
router.post("/", requireAuth, (req, res) => {

    const userId = req.session.userId

    const user = findUserById(userId)

    if (!user) {
        return res.status(404).json({
            error: "User not found"
        })
    }

    const { name, max_weight } = req.body

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

// PATCH /characters/:name - Update a character
router.patch("/:name", requireAuth, (req, res) => {
    
    const userId = req.session.userId

    const user = findUserById(userId)

    if (!user) {
        return res.status(404).json({
            error: "User not found"
        })
    }

    const currentName = req.params.name
    const { name: newName, max_weight } = req.body

    if (
        typeof currentName !== "string" ||
        currentName.trim().length === 0
    ) {
        return res.status(400).json({
            error: "Invalid character name"
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

// DELETE /characters/:name - Delete a character
router.delete("/:name", requireAuth, (req,res) => {

    const userId = req.session.userId

    const user = findUserById(userId)

    if (!user) {
        return res.status(404).json({
            error: "User not found"
        })
    }

    const name = req.params.name

    if (
        typeof name !== "string" ||
        name.trim().length === 0
    ) {
        return res.status(400).json({
            error: "A valid character name is required"
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

module.exports = router