const express = require('express');
const router = express.Router();
const { getMoreHabitsData } = require('../controllers/apiController');

// Middleware para proteger rutas que requieren autenticación
const isAuthenticated = (req, res, next) => req.session.user ? next() : res.status(401).json({ success: false, message: 'No autenticado' });

router.get('/more-habits-data', isAuthenticated, getMoreHabitsData);

module.exports = router;