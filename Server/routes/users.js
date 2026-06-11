const express = require("express")
const router = express.Router()

const {
    loadUsers,
    saveUsers,
    findUser,
    findCharacter
} = require("../helpers/userHelpers")

// --- Get Routes ---
router.get("/", (req, res) => {
    const users = loadUsers()
    res.json(users)
})

router.get("/:id", (req, res) => {
    const users = loadUsers()
    res.json(users)
})

// --- Post Routes ---
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
router.put("/:id/Characters/:characterName", (req, res) => {

})

// --- Patch Routes ---
router.patch("/:id/Characters/:characterName/Inventory/:itemIndex", (req, res) => {

})

// --- Delete Routes ---
router.delete("/:id/Characters/:characterName/Inventory/:itemIndex", (req, res) => {

})

module.exports = router