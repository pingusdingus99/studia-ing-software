document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.querySelector('.container'); // Usamos un contenedor más general
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

    if (mainContainer) {
        mainContainer.addEventListener('click', async (event) => {
            const target = event.target;
            const dayCheck = target.closest('.day-check');
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

            // NUEVO: Lógica para el botón de eliminar
            const deleteButton = target.closest('.btn-delete-habit');
            if (deleteButton) {
                const habitId = deleteButton.dataset.habitId;
                // Buscamos la fila del nombre usando un selector de atributo para obtener el nombre para el confirm.
                const nameRow = document.querySelector(`.habit-name[data-row-id="${habitId}"]`);
                const habitName = nameRow ? nameRow.querySelector('.btn-ver-habito').textContent.trim() : 'este hábito';

                // Popup de confirmación
                if (confirm(`¿Estás seguro de que quieres eliminar el hábito "${habitName}"? Esta acción no se puede deshacer.`)) {
                    try {
                        const response = await fetch(`/habits/${habitId}`, {
                            method: 'DELETE',
                        });

                        if (!response.ok) {
                            throw new Error('Error al eliminar el hábito.');
                        }

                        const result = await response.json();
                        if (result.success) {
                            // Eliminar la fila del DOM para una respuesta visual inmediata
                            // Seleccionamos todas las partes de la fila por su data-row-id y las eliminamos.
                            const rowsToRemove = document.querySelectorAll(`[data-row-id="${habitId}"]`);
                            rowsToRemove.forEach(row => {
                                row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                                row.style.opacity = '0';
                                row.style.transform = 'translateX(20px)';
                                setTimeout(() => row.remove(), 300);
                            });
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        alert('No se pudo eliminar el hábito. Inténtalo de nuevo.');
                    }
                }
            }
        });
    }
});