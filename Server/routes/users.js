const express = require("express")
const router = express.Router()

const {
    loadUsers,
    saveUsers,
    findUser,
    findCharacter
} = require("../helpers/userHelpers")

// --- Get Routes ---

// Load all users
router.get("/", (req, res) => {
    const users = loadUsers()
    res.json(users)
})

// Load user of specific ID
router.get("/:id", (req, res) => {
    const users = loadUsers()

    // TODO

    res.json(users)
})

// --- Post Routes ---

// Create a new user with empty Characters
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

// Create/add a new character for an existing user.
router.post("/:id/Characters", (req, res) => {
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

// --- Put Routes ---

// Replace/modify an existing character.
router.put("/:id/Characters/:characterName", (req, res) => {

})

// --- Patch Routes ---

// Add item or increment quantity if it already exists.
router.patch("/:id/Characters/:characterName/Inventory/:itemIndex&:quantity", (req, res) => {

})

// Decrement quantity if it already exists.
router.patch("/:id/Characters/:characterName/Inventory/:itemIndex&:quantity", (req, res) => {

})

// --- Delete Routes ---

// Remove item if it already exists.
router.delete("/:id/Characters/:characterName/Inventory/:itemIndex", (req, res) => {

})

module.exports = router