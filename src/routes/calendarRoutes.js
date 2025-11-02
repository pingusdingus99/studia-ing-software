const express = require('express');
const router = express.Router();
const { showCalendar, infoHabito } = require('../controllers/calendarController');

// Mostrar páginas
router.get('/calendarioHabitos', showCalendar); // se mostrará el calendario cuando cliqueen el boton en la página del ariel
router.get('/habitos/:id', infoHabito); // se calcularán los días a pintar en el calendario

module.exports = router;