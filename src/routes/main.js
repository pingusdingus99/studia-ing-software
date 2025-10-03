const express = require('express');
const router = express.Router();
const path = require("path");
const { homePage } = require('../controllers/mainController');

// Página principal (home)
router.get('/', homePage);
router.get("/panel", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/panel.html"));
});
module.exports = router;
