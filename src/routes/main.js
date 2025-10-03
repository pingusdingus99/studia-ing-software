const express = require('express');
const router = express.Router();
const { homePage } = require('../controllers/mainController');

// Página principal (home)
router.get('/', homePage);

module.exports = router;