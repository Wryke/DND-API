const express = require("express");

const userRoutes = require("./routes/users");
const itemRoutes = require("./routes/items");

const app = express();
app.use(express.json());

app.use("/Users", userRoutes);
app.use("/Items", itemRoutes);

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});