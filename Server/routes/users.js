const express = require("express");
const router = express.Router();

const {
    loadUsers,
    saveUsers,
    findUser
} = require("../helpers/userHelpers");

router.get("/", (req, res) => {
    const users = loadUsers();
    res.json(users);
});

router.post("/", (req, res) => {
    const users = loadUsers();

    const newUser = {
        id: req.body.id,
        username: req.body.username,
        characters: []
    };

    if (findUser(users, newUser.id)) {
        return res.status(409).json({
            error: "User already exists"
        });
    }

    users.push(newUser);
    saveUsers(users);

    res.status(201).json(newUser);
});

module.exports = router;