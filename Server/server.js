const express = require('express');
const fs = require("fs")
const path = require("path")

const app = express();
      app.use(express.json());
      
const PORT = 3000;

const fName = path.join(__dirname, "../Database/5e-SRD-Equipment.json")

let items = [];

try {
    const data = fs.readFileSync(fName,"utf8");
    items = JSON.parse(data);
}
catch (error) {
    console.log(error.message);
}

app.get("/items/", (req, res) => {
    res.json({items})
})

app.get('/items/:index', (req, res) => {
    const index = req.params.index

    const item = items.find(i => i.index === index)
    
    if(!item){
        res.status(404).json({
            error: "Item not found"
        })

        return
    }

    res.json(item);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
});