const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middlewares/authMiddleware");

/* GET leaderboard */
router.get("/", (req, res) => {
    const sql = "SELECT username, score, created_at FROM scores ORDER BY score DESC LIMIT 10";
    db.query(sql, (err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.json(result);
        }
    });
});

/* POST save score */
router.post("/", verifyToken, (req, res) => {
    const { score } = req.body;
    const username = req.user.username;

    if (score === undefined) {
        return res.status(400).json({ message: "Score is required" });
    }

    const sql = "INSERT INTO scores (username, score) VALUES (?, ?)";
    db.query(sql, [username, score], (err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.json({ message: "Score saved!", id: result.insertId });
        }
    });
});

module.exports = router;
