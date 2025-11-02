const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para poder leer body de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// Configuración de sesiones (para desarrollo local)
// En producción, usar un session store (ej. connect-pg-simple, redis) en vez del MemoryStore por defecto.
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.SECRET_KEY || 'cambio-esto-en-produccion';
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        // secure: true en producción con HTTPS
        maxAge: 1000 * 60 * 60 * 24 // 1 día
    }
}));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
const authRoutes = require ('./src/routes/auth');
const mainRoutes = require ('./src/routes/main');
const calendarRoutes = require ('./src/routes/calendarRoutes');

app.use('/', mainRoutes);
app.use('/auth', authRoutes);
app.use('/calendar', calendarRoutes);
app.use('/api', calendarRoutes);

// Levantar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
