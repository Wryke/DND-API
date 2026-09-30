const express = require("express")
const argon2 = require("argon2")
const { findUserByEmail } = require("../db/userQueries")

const router = express.Router()

router.post("/login", async (req, res) => {

    const email = req.body.email
    const password = req.body.password

    if (!email || !password) {
        return res.status(400).json({
            error: "Email and password are required"
        })
    }

    const user = findUserByEmail(email)

    if(!user){
        return res.status(401).json({
            error: "Invalid email or password"
        })
    }

    const passwordMatches = await argon2.verify(user.password_hash, password)

    if(!passwordMatches){
        return res.status(401).json({
            error: "Invalid email or password"
        })
    }

    return //TODO
})

module.exports = router