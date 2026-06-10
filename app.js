const express = require("express");

const path = require("path");

const app = express();

const PORT = 3000;

/* Static files */

app.use(express.static(__dirname));

/* Homepage */

app.get("/", (req, res) => {

    res.sendFile(path.join(__dirname, "public", "index.html"));

});

/* Server */

app.listen(PORT, () => {

    console.log(`🚀 Mission Control running on port ${PORT}`);

});