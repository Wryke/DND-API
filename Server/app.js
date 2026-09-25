const express = require("express")
const cors = require("cors")

const itemRoutes = require("./routes/items.js")
const userRoutes = require("./routes/users.js")
const equipmentRoutes = require("./routes/equipment.js")

const app = express()

app.use(express.json())
app.use(cors({
    origin: "http://localhost:5173"
}))

// --- Routes ---
app.use("/items", itemRoutes)
app.use("/users", userRoutes)
app.use("/equipment", equipmentRoutes)

module.exports = app