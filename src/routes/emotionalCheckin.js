const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const checkinController = require('../controllers/emotionalCheckinController');

// --- RUTAS API PARA CHECK-IN EMOCIONAL ---

// (POST) Crear o actualizar el check-in del día
router.post('/api/checkin', authMiddleware, checkinController.createOrUpdateCheckin);

// (GET) Obtener el check-in del día actual
router.get('/api/checkin/today', authMiddleware, checkinController.getTodayCheckin);

module.exports = router;