const path = require('path');
const db = require('../models/db');

// Middleware para verificar que el hábito pertenece al usuario logueado
exports.checkHabitOwnership = async (req, res, next) => {
    // 1. Asegurarse de que el usuario está logueado
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    try {
        const habitId = req.params.id || req.query.id; // Funciona con /:id o con ?id=
        const userId = req.session.user.id;

        const result = await db.query('SELECT user_id FROM habits WHERE id = $1', [habitId]);

        // 2. Si el hábito no existe o no pertenece al usuario
        if (result.rows.length === 0 || result.rows[0].user_id !== userId) {
            // No damos pistas, simplemente redirigimos a la página principal.
            return res.status(403).redirect('/');
        }

        // 3. Si todo está bien, continuamos a la siguiente función (showCalendar o infoHabito)
        next();
    } catch (error) {
        console.error("Error en middleware de verificación:", error);
        return res.status(500).send("Error interno del servidor.");
    }
};

// Mostrar página del calendario (HTML estático)
exports.showCalendar = (req, res) => {
    res.sendFile(path.join(__dirname, '../../views/calendar.html'));
};

// Mostrar página de gráficos del hábito (HTML estático)
exports.showHabitGraphic = (req, res) => {
    res.sendFile(path.join(__dirname, '../../views/habitGraphic.html'));
};

// API para obtener información del hábito + completitud
exports.infoHabito = async (req, res) => {
    try {
        const id = req.params.id;
        
        // 1. Obtener el NOMBRE del hábito
        const habitQuery = 'SELECT name FROM habits WHERE id = $1';
        const habitResult = await db.query(habitQuery, [id]);

        if (habitResult.rows.length === 0) {
            return res.status(404).json({ mensaje: "Hábito no encontrado" });
        }

        const habitName = habitResult.rows[0].name;

        // 2. Obtener los REGISTROS de completitud
        const completionsQuery = 'SELECT completion_date, status FROM habit_completions WHERE habit_id = $1';
        const completionsResult = await db.query(completionsQuery, [id]);

        // 3. Enviar respuesta unificada
        // Devolvemos un objeto con ambas cosas: el nombre y el array de registros
        res.json({
            name: habitName,
            completions: completionsResult.rows
        }); 

    } catch (error) {
        console.error("Error al consultar la base de datos:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
};

// API para obtener estadísticas de un hábito
exports.getHabitStats = async (req, res) => {
    try {
        const { id } = req.params;
        const { period = 'month' } = req.query; // 'week', 'month', 'year'

        const habitResult = await db.query('SELECT name, created_at FROM habits WHERE id = $1', [id]);
        if (habitResult.rows.length === 0) {
            return res.status(404).json({ message: "Hábito no encontrado" });
        }
        const { name, created_at } = habitResult.rows[0];

        // --- CORRECCIÓN: Obtener los registros de completado ANTES de los cálculos ---
        const completionsResult = await db.query(
            'SELECT completion_date FROM habit_completions WHERE habit_id = $1 ORDER BY completion_date ASC',
            [id]
        );
        const completions = new Set(completionsResult.rows.map(r => new Date(r.completion_date).toISOString().split('T')[0]));

        let startDate;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const habitCreationDate = new Date(created_at);
        habitCreationDate.setHours(0, 0, 0, 0);

        let labels = [];
        let data = [];

        if (period === 'week') {
            // Lógica: #días_realizados / 7 * 100 para cada una de las últimas 12 semanas.
            const numWeeks = 12;
            for (let i = numWeeks - 1; i >= 0; i--) {
                // --- CAMBIO DE LÓGICA ---
                // Ahora la etiqueta representa el INICIO de la semana (ej. Lunes)
                const weekStartDate = new Date(today);
                // Ir al Lunes de la semana correspondiente
                weekStartDate.setDate(today.getDate() - today.getDay() + 1 - (i * 7));
                
                const weekEndDate = new Date(weekStartDate);
                weekEndDate.setDate(weekStartDate.getDate() + 6);

                // Contar completados en esta semana
                let completedDays = 0;
                for (let d = new Date(weekStartDate); d <= weekEndDate; d.setDate(d.getDate() + 1)) {
                    const dateString = d.toISOString().split('T')[0];
                    if (completions.has(dateString)) {
                        completedDays++;
                    }
                }

                labels.push(weekStartDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }));
                // El denominador es siempre 7
                const percentage = Math.round((completedDays / 7) * 100);
                data.push(percentage);
            }

        } else if (period === 'year') {
            // Lógica: #días_realizados / #días_en_el_año * 100 para cada uno de los últimos 5 años.
            const currentYear = today.getFullYear();
            for (let i = 4; i >= 0; i--) {
                const year = currentYear - i;
                labels.push(year.toString());

                // Lógica para año bisiesto
                const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
                const daysInYear = isLeap ? 366 : 365;

                let completedDays = 0;
                completions.forEach(dateStr => {
                    if (new Date(dateStr).getFullYear() === year) {
                        completedDays++;
                    }
                });

                const percentage = Math.round((completedDays / daysInYear) * 100);
                data.push(percentage);
            }

        } else { // 'month' por defecto
            // Lógica: #días_realizados / #días_del_mes * 100 para cada mes del año actual.
            labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const monthlyCompletions = Array(12).fill(0);
            const currentYear = today.getFullYear();

            // Contar completados por mes
            completions.forEach(dateStr => {
                const completionDate = new Date(dateStr + 'T00:00:00');
                if (completionDate.getFullYear() === currentYear) {
                    const month = completionDate.getMonth();
                    monthlyCompletions[month]++;
                }
            });

            // Calcular porcentaje para cada mes
            data = monthlyCompletions.map((completedDays, monthIndex) => {
                // Obtener el número de días de ese mes específico
                const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
                const percentage = Math.round((completedDays / daysInMonth) * 100);
                return percentage;
            });
        }

        res.json({ name, labels, data, period });
    } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};