const express = require('express');
const router = express.Router();
const { showRegister, showLogin, registerUser, loginUser, logoutUser } = require('../controllers/authController');

// Mostrar páginas
router.get('/register', showRegister);
router.get('/login', showLogin);
router.get('/logout', logoutUser);

// Manejar formularios
router.post('/register', registerUser);
router.post('/login', loginUser)

module.exports = router;
