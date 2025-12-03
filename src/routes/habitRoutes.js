const express = require('express');
const router = express.Router();
const { toggleHabit, addHabit, deleteHabit, updateHabitColor } = require('../controllers/habitController');

// Middleware para proteger rutas que requieren autenticación
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.status(401).json({ success: false, message: 'No autenticado' });
};

router.post('/toggle', isAuthenticated, toggleHabit);
router.post('/add', isAuthenticated, addHabit);
router.delete('/:id', isAuthenticated, deleteHabit);
router.put('/:id/color', isAuthenticated, updateHabitColor); // NUEVA RUTA PARA EDITAR COLOR

module.exports = router;
