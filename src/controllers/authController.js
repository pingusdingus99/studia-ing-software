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
        return res.status(400).json({ success: false, message: 'Todos los campos son requeridos.' });
    }

    // Revisar que la contraseña contenga más de 8 caracteres
    if (password.length < 8) {
        return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    try {
        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)',
            [username, email, hashedPassword]
        );

        res.status(201).json({ success: true, message: '¡Usuario registrado exitosamente!' });
    } catch (err) {
        console.error(err);
        if (err.code === '23505') { // Código de error de PostgreSQL para violación de unicidad
            return res.status(409).json({ success: false, message: 'El correo electrónico o el nombre de usuario ya existen.' });
        }
        res.status(500).json({ success: false, message: 'Error interno del servidor al registrar el usuario.' });
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
