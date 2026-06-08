const express = require('express');
const fs = require("fs")

const fName = ""

const app = express();
app.use(express.json());

const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});