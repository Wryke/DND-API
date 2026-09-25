const express = require("express")
const router = express.Router()

const {
    findAllEquipmentSlots
} = require("../db/equipmentQueries.js")

// --- Equipment Routes ---
// GET /equipment/slots - Returns equipment slot lookup
// --- ---------------- ---

// GET /equipment/slots - Returns equipment slot lookup
router.get("/slots", (req, res) => {
    const data = findAllEquipmentSlots()

    return res.status(200).json(data)
})

module.exports = router