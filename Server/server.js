const express = require('express');
const fs = require("fs")

const fName = "Database/5e-SRD-Equipment.json"

try {
    const data = fs.readFileSync(
        fName,
        "utf8"
    );

    const items = JSON.parse(data);
}
catch (error) {
    console.log(error.message);
}

const app = express();
const PORT = 3000;
app.use(express.json());

app.get('/item/:index', (req, res) => {
    const index = req.params.id

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