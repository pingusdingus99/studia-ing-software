const db = require('../models/db');

const toggleHabit = async (req, res) => {
    const { habitId, date } = req.body;
    const userId = req.session.user.id;

    if (!habitId || !date) {
        return res.status(400).json({ success: false, message: 'Faltan datos (habitId, date).' });
    }

    try {
        // Primero, verificar que el hábito pertenece al usuario logueado por seguridad
        const habitCheck = await db.query('SELECT id FROM habits WHERE id = $1 AND user_id = $2', [habitId, userId]);
        if (habitCheck.rows.length === 0) {
            return res.status(403).json({ success: false, message: 'Acción no permitida.' });
        }

        // Intentar borrar primero (desmarcar)
        const deleteResult = await db.query(
            'DELETE FROM habit_completions WHERE habit_id = $1 AND completion_date = $2',
            [habitId, date]
        );

        // Si no se borró ninguna fila, significa que no existía, entonces la insertamos (marcar)
        if (deleteResult.rowCount === 0) {
            await db.query('INSERT INTO habit_completions (habit_id, completion_date) VALUES ($1, $2)', [habitId, date]);
            return res.json({ success: true, status: 'completed' });
        }

        res.json({ success: true, status: 'not-completed' });
    } catch (err) {
        console.error('Error al cambiar el estado del hábito:', err);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

const addHabit = async (req, res) => {
    const { habitName, habitDescription = '', habitColor = '#5383cb' } = req.body; // Color por defecto
    const userId = req.session.user.id;

    if (!habitName || habitName.trim().length < 3) {
        return res.redirect('/');
    }

    try {
        await db.query(
            'INSERT INTO habits (user_id, name, description, color) VALUES ($1, $2, $3, $4)',
            [userId, habitName.trim(), habitDescription.trim(), habitColor]
        );
        res.redirect('/');
    } catch (err) {
        console.error('Error al agregar el hábito:', err);
        res.status(500).send('Error interno del servidor al intentar agregar el hábito.');
    }
};

const deleteHabit = async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.id;

    if (!id) {
        return res.status(400).json({ success: false, message: 'ID del hábito no proporcionado.' });
    }

    try {
        const deleteResult = await db.query(
            'DELETE FROM habits WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (deleteResult.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Hábito no encontrado o no autorizado para eliminar.' });
        }

        res.json({ success: true, message: 'Hábito eliminado correctamente.' });
    } catch (err) {
        console.error('Error al eliminar el hábito:', err);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

const updateHabitColor = async (req, res) => {
    const { id } = req.params;
    const { color } = req.body;
    const userId = req.session.user.id;

    if (!color) {
        return res.status(400).json({ success: false, message: 'Color no proporcionado.' });
    }

    try {
        const updateResult = await db.query(
            'UPDATE habits SET color = $1 WHERE id = $2 AND user_id = $3',
            [color, id, userId]
        );

        if (updateResult.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Hábito no encontrado o no autorizado.' });
        }
        res.json({ success: true, message: 'Color actualizado.' });
    } catch (err) {
        console.error('Error al actualizar el color del hábito:', err);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

module.exports = { toggleHabit, addHabit, deleteHabit, updateHabitColor };
