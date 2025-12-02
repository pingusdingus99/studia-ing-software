const express = require('express');
const router = express.Router();
const { showCalendar, infoHabito, checkHabitOwnership } = require('../controllers/calendarController');

// Mostrar páginas
// Usamos el middleware 'checkHabitOwnership' para proteger ambas rutas.
router.get('/calendarioHabitos', checkHabitOwnership, showCalendar); // Protege la vista
router.get('/habitos/:id', checkHabitOwnership, infoHabito); // Protege la API de datos

module.exports = router;