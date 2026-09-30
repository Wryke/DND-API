const express = require("express")
const cors = require("cors")
const session = require("express-session")

const userRoutes = require("./routes/users.js")
const authRoutes = require("./routes/auth.js")
const itemRoutes = require("./routes/items.js")
const equipmentRoutes = require("./routes/equipment.js")

const app = express()

app.use(express.json())

app.use(cors({
    origin: "http://localhost:5173"
}))

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

// --- Routes ---
app.use("/auth", authRoutes)
app.use("/users", userRoutes)
app.use("/items", itemRoutes)
app.use("/equipment", equipmentRoutes)

module.exports = app