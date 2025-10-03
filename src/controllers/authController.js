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
    
    // Revisar que se hayan llenado los campos
    if (!username || !email || !password) {
        return res.status(400).send('Faltan campos requeridos.');
    }

    // Revisar que la contraseña contenga más de 8 caracteres
    if (!password || password.length < 8)
        return res.send('La contraseña debe tener más de 8 caracteres. <a href="/auth/register">Volver</a>')

    try {
        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)',
            [username, email, hashedPassword]
        );

        res.send('Usuario registrado! <a href="/auth/login">Ir a login</a>');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al registrar usuario. Posiblemente ya existe.');
    }
};

// Logear usuario
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email y contraseña requeridos.');
    }

    try {
        // Buscar usuario por email
        const result = await db.query('SELECT id, username, email, password_hash FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).send('Credenciales inválidas.');
        }

        const user = result.rows[0];

        // Comparar contraseñas
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).send('Credenciales inválidas.');
        }

        // Guardar info esencial en la sesión
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email
        };

        // Redirigir a home o enviar respuesta
        return res.redirect('/');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Error en el proceso de login.');
    }
};

// Logout
exports.logoutUser = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destruyendo sesión', err);
            return res.status(500).send('Error cerrando sesión.');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
};
