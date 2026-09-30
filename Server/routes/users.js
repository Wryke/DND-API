const express = require("express")

const argon2 = require("argon2")

const router = express.Router()

const { 
    findUserById,
    createUser,
    updateUserById,
    deleteUserById,
 } = require("../db/userQueries.js")

// --- User Routes ---
// GET /users/:id - Return a user by ID
// POST /users - Create a user
// PATCH /users/:id - Update a user's information
// DELETE /users/:id - Delete a user
// --- ----------- ---

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
router.post("/", async (req, res) => {

    const username = req.body.username
    const password = req.body.password

    if (!username || !password) {
        return res.status(400).json({
            error: "Username and password are required"
        })
    }

    try {

        if(password.length < 8 || password.length > 16){
            return res.status(400).json({
                error: "Password length must be 8-16 characters"
            })
        }

        const passwordHash = await argon2.hash(password)

        const user = createUser({
            username,
            passwordHash
        })
        
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

module.exports = router