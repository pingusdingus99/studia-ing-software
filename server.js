const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
const authRoutes = require('./src/routes/auth');
const habitsRoutes = require('./src/routes/habits');
app.use('/auth', authRoutes);
app.use('/habits', habitsRoutes);

// Home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));