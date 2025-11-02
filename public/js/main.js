document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.habits-grid');
    const addHabitBtn = document.getElementById('add-habit-btn');
    const modal = document.getElementById('add-habit-modal');
    const cancelBtn = document.getElementById('cancel-btn');

    // Lógica para mostrar/ocultar el modal de agregar hábito
    if (addHabitBtn && modal && cancelBtn) {
        addHabitBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
        });

        cancelBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        // Opcional: cerrar el modal si se hace clic en el fondo
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }

    if (grid) {
        grid.addEventListener('click', async (event) => {
            const target = event.target;
            if (target.classList.contains('day-check')) {
                const habitId = target.dataset.habitId;
                const date = target.dataset.date;

                try {
                    const response = await fetch('/habits/toggle', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ habitId, date }),
                    });

                    if (!response.ok) {
                        throw new Error('Falló la respuesta del servidor');
                    }

                    const result = await response.json();
                    if (result.success) {
                        target.classList.toggle('completed', result.status === 'completed');
                    }
                } catch (error) {
                    console.error('Error al marcar el hábito:', error);
                }
            }
        });
    }
});