const express = require('express');
const router = express.Router();
const { showCalendar, infoHabito, checkHabitOwnership, showHabitGraphic, getHabitStats } = require('../controllers/calendarController');

// Mostrar páginas
// Usamos el middleware 'checkHabitOwnership' para proteger ambas rutas.
router.get('/calendarioHabitos', checkHabitOwnership, showCalendar); // Protege la vista
router.get('/habitGraphic', checkHabitOwnership, showHabitGraphic); // Protege la nueva vista de gráficos

// Rutas de API
router.get('/habitos/:id', checkHabitOwnership, infoHabito); // Protege la API de datos del calendario
router.get('/habitos/:id/stats', checkHabitOwnership, getHabitStats); // Protege la nueva API de estadísticas

module.exports = router;