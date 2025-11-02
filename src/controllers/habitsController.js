const { Habit } = require('../models/db');

// Obtener los hábitos del usuario logueado
const getUserHabits = async (req, res) => {
    try {
        const userId = req.user.id; // Viene del authMiddleware

        const habits = await Habit.findAll({
            where: { userId: userId },
            order: [['createdAt', 'ASC']]
        });

        res.status(200).json(habits);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los hábitos.', error: error.message });
    }
};

// Crear un nuevo hábito
const createHabit = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id; // Del middleware

        if (!name) {
            return res.status(400).json({ message: 'El nombre del hábito es requerido.' });
        }

        const newHabit = await Habit.create({
            name: name,
            userId: userId
        });

        res.status(201).json(newHabit);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el hábito.', error: error.message });
    }
};

module.exports = {
    getUserHabits,
    createHabit
};