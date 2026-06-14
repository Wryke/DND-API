const express = require("express")

const itemRoutes = require("./routes/items.js")
const userRoutes = require("./routes/users.js")

const app = express()

app.use(express.json())

app.use("/items", itemRoutes)
app.use("/users", userRoutes)

module.exports = app