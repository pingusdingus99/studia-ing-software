const express = require('express');
const path = require('path');
const dotenv = require('dotenv')

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para poder leer body de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// Servir archivos estáticos css
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
const authRoutes = require ('./src/routes/auth');
const mainRoutes = require ('./src/routes/main');

app.use('/', mainRoutes);
app.use('/auth', authRoutes);

// Levantar el servidor
app.listen(PORT, () => {
    console.log('Servidor corriendo en http://localhost:${PORT}');
});