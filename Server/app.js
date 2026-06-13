const express = require("express")

const itemRoutes = require("./routes/items.js")
const userRoutes = require("./routes/users.js")

const app = express()

app.use(express.json())

app.use("/Items", itemRoutes)
app.use("/Users", userRoutes)

module.exports = app