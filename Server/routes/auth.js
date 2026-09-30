const express = require("express")
const router = express.Router()

const argon2 = require("argon2")

const requireAuth = require("../middleware/requireAuth")

const {
    findUserByEmail,
    findUserById
} = require("../db/userQueries")

// --- Authentication Routes ---
// POST /auth/login - Logs a user in
// GET /auth/me - Verifies a user has a session
// POST /auth/logout - Logs a user out
// --- --------------------- ---

router.post("/login", async (req, res) => {

    const email = req.body.email
    const password = req.body.password

    if (!email || !password) {
        return res.status(400).json({
            error: "Email and password are required"
        })
    }

    try {
        const user = findUserByEmail(email)

        if (!user) {
            return res.status(401).json({
                error: "Invalid email or password"
            })
        }

        const passwordMatches = await argon2.verify(
            user.password_hash,
            password
        )

        if (!passwordMatches) {
            return res.status(401).json({
                error: "Invalid email or password"
            })
        }

        req.session.userId = user.user_id

        return res.status(200).json({
            user_id: user.user_id,
            username: user.username,
            email: user.email
        })

    } catch (error) {
        console.error("Login error:", error)

        return res.status(500).json({
            error: "Internal server error"
        })
    }
})

router.get("/me", requireAuth, (req, res) => {

    const userId = req.session.userId

    const user = findUserById(userId)

    if (!user) {
        return res.status(404).json({
            error: "User not found"
        })
    }

    return res.status(200).json(user)
})

router.post("/logout", (req, res) => {

    req.session.destroy((error) => {

        if (error) {
            return res.status(500).json({
                error: "Internal server error"
            })
        }

        res.clearCookie("connect.sid")

        return res.status(200).json({
            "message": "Logged out successfully"
        })
    })
})

module.exports = router