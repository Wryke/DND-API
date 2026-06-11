// const express = require("express");

// const userRoutes = require("./routes/users");
// const itemRoutes = require("./routes/items");

// const app = express();
// app.use(express.json());

// app.use("/Users", userRoutes);
// app.use("/items", itemRoutes);

// app.listen(3000, () => {
//     console.log("Server running at http://localhost:3000");
// });

const express = require('express');
const fs = require("fs")
const path = require("path")

const app = express();
      app.use(express.json());
      
const PORT = 3000;

const EQUIPMENT            = path.join(__dirname, "../Database/5e-SRD-Equipment.json")
const EQUIPMENT_CATEGORIES = path.join(__dirname, "../Database/5e-SRD-Equipment-Categories.json")
const USERS                = path.join(__dirname, "../Database/Users.json")

let equipment = [];
let equipmentCategories = [];
let users = [];

function loadFile(path) {
    try {
        const data = fs.readFileSync(path,"utf8")
        return JSON.parse(data)
    }
    catch (error) {
        console.log(error.message)
    }
}

try {
    const data = fs.readFileSync(EQUIPMENT,"utf8");
    equipment = JSON.parse(data);
}
catch (error) {
    console.log(error.message);
}

try {
    const data = fs.readFileSync(EQUIPMENT_CATEGORIES,"utf8");
    equipmentCategories = JSON.parse(data);
}
catch (error) {
    console.log(error.message);
}

try {
    const data = fs.readFileSync(USERS,"utf8");
    users = JSON.parse(data);
}
catch (error) {
    console.log(error.message);
}

// --- Delete Routes ---
app.delete("/Users/:id/Characters/:characterName/Inventory/:itemIndex", (req, res) => {

})

// --- Patch Routes ---
app.patch("/Users/:id/Characters/:characterName/Inventory/:itemIndex", (req, res) => {

})

// --- Put Routes ---
app.put("/Users/:id/Characters/:characterName", (req, res) => {

})

// --- Post Routes ---
app.post("/Users/:id/Characters", (req, res) => {
    const id = req.params.id;

    const user = users.find(user => user.id === id);

    if (!user) {
        return res.status(404).json({
            error: "User not found"
        });
    }

    if (!Array.isArray(req.body)) {
        return res.status(400).json({
            error: "Request body must be an array of characters"
        });
    }

    user.Characters = req.body;

    fs.writeFileSync(
        USERS,
        JSON.stringify(users, null, 4)
    );

    res.json(user);
});

app.post('/Users', (req, res) => {
    const { id, username, characters } = req.body;

    if (
        typeof id !== "string" ||
        typeof username !== "string" ||
        !Array.isArray(characters)
    ) {
        return res.status(400).json({
            error: "Invalid user data"
        });
    }

    const existingUser = users.find(user => user.id === id);

    if (existingUser) {
        return res.status(409).json({
            error: "User ID already exists"
        });
    }

    users.push(req.body);

    fs.writeFileSync(
        USERS,
        JSON.stringify(users, null, 4)
    );

    res.status(201).json(req.body);
});

// --- Get Routes ---
app.get("/items/", (req, res) => {
    res.json({equipment})
})

app.get('/items/:index', (req, res) => {
    const index = req.params.index

    const item = equipment.find(i => i.index === index)
    
    if(!item){
        res.status(404).json({
            error: "Item not found"
        })

        return
    }

    res.json(item);
});

// Get a list of all the quipment categories
app.get("/categories/", (req, res) => {
    res.json({equipmentCategories})
})

app.get('/categories/:category', (req, res) => {
    const categoryIndex = req.params.category

    const category = equipmentCategories.find(i => i.index === categoryIndex)
    
    if(!category){
        res.status(404).json({
            error: "Category not found"
        })

        return
    }

    res.json(category);
});

// Get a specific an item by index from a specific category
app.get('/categories/:category/:index', (req, res) => {
    const categoryIndex = req.params.category
    const itemIndex = req.params.index

    const category = equipmentCategories.find(i => i.index === categoryIndex)
    
    if(!category){
        res.status(404).json({
            error: `Category not found`
        })

        return
    }

    const item = category.equipment.find(i => i.index === itemIndex)
    
    if(!item){
        res.status(404).json({
            error: `Item not found in ${category.index}`
        })

        return
    }

    const fullItem = equipment.find(e => e.index === itemIndex);
    res.json(fullItem);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
});