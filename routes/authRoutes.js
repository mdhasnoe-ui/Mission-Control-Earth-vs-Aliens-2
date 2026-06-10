const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const validateRegister = require("../middlewares/validationMiddleware");

/* POST /api/auth/register */
router.post("/register", validateRegister, (req, res) => {
    const { username, password } = req.body;

    // Check if username already exists
    db.query("SELECT id FROM users WHERE username = ?", [username], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (results.length > 0) return res.status(400).json({ message: "Username already taken" });

        const hashedPassword = bcrypt.hashSync(password, 10);

        db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], (err, result) => {
            if (err) return res.status(500).json({ message: "Could not register user" });

            const token = jwt.sign(
                { id: result.insertId, username },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.json({ token, username });
        });
    });
});

/* POST /api/auth/login */
router.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    db.query("SELECT * FROM users WHERE username = ?", [username], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (results.length === 0) return res.status(401).json({ message: "Invalid username or password" });

        const user = results[0];
        const passwordMatch = bcrypt.compareSync(password, user.password);

        if (!passwordMatch) return res.status(401).json({ message: "Invalid username or password" });

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ token, username: user.username });
    });
});

module.exports = router;
