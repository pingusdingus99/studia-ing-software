const express = require('express');
const path = require('path');
const authMiddleware = require('../middlewares/authMiddleware');
const habitsController = require('../controllers/habitsController');

const router = express.Router();

// --- RUTA PARA SERVIR LA VISTA DEL PANEL ---
// Esta ruta está protegida por el middleware
router.get('/dashboard', authMiddleware, (req, res) => {
    // Servimos el archivo HTML del dashboard
    res.sendFile(path.join(__dirname, '../../views/dashboard.html'));
});

// --- RUTAS API PARA GESTIONAR HÁBITOS ---
// Todas protegidas por el middleware
router.get('/api/habits', authMiddleware, habitsController.getUserHabits);
router.post('/api/habits', authMiddleware, habitsController.createHabit);

module.exports = router;