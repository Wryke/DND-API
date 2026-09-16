const express = require("express")
const cors = require("cors")

const itemRoutes = require("./routes/items.js")
const userRoutes = require("./routes/users.js")

const app = express()

app.use(express.json())
app.use(cors({
    origin: "http://localhost:5173"
}))

// --- Routes ---
app.use("/items", itemRoutes)
app.use("/users", userRoutes)

module.exports = app