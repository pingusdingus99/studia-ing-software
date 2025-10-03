const path = require('path');
const db = require('../models/db');
const bcrypt = require('bcrypt');

// Mostrar páginas
// Registro
exports.showRegister = (req, res) => {
    res.sendFile(path.join(__dirname, '../../views/register.html'));
};

// Login
exports.showLogin = (req, res) => {
    res.sendFile(path.join(__dirname, '../../views/login.html'));
};

// Registrar usuario
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Encriptar password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar en DB
        await db.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)',
            [username, email, hashedPassword]
        );

        res.send('Usuario registrado! <a href="/auth/login">Ir a login</a>');
    } catch (err) {
        console.error(err);
        res.send('Error al registrar usuario. Posiblemente ya existe.');
    }
};

// Logear usuario TO-DO
exports.loginUser = (req, res) => {
    res.send('Login aún no implementado');
};