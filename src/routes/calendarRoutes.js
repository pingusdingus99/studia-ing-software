const express = require('express');
const router = express.Router();
const { showCalendar, infoHabito } = require('../controllers/calendarController');

// Mostrar páginas
router.get('/calendarioHabitos', showCalendar); //boton hábitos
router.get('/habitos/:id', infoHabito); // se calcularán los días a pintar en el calendario

module.exports = router;