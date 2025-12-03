const express = require('express');
const router = express.Router();
const { createCheckin, checkinPage } = require('../controllers/checkinController');

// Ruta GET para mostrar la página del check-in
router.get('/', checkinPage);

// Ruta POST para guardar el check-in
router.post('/', createCheckin);

module.exports = router;
