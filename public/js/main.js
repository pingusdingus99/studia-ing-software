document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.querySelector('.container'); // Usamos un contenedor más general
    const gridScrollWrapper = document.querySelector('.grid-scroll-wrapper');
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

    // --- LÓGICA DE SCROLL INFINITO ---
    let isLoading = false; // Flag para evitar cargas múltiples simultáneas
    let allHabits = []; // Almacenaremos los hábitos aquí para no pedirlos de nuevo

    if (gridScrollWrapper) {
        // Guardamos los hábitos iniciales que vienen de EJS
        document.querySelectorAll('.habit-row.habit-name').forEach(row => {
            allHabits.push({
                id: row.dataset.rowId,
                name: row.querySelector('.btn-ver-habito').textContent.trim()
            });
        });

        gridScrollWrapper.addEventListener('scroll', async () => {
            // Si ya estamos cargando o no hay hábitos, no hacemos nada
            if (isLoading || allHabits.length === 0) return;

            const { scrollLeft, scrollWidth, clientWidth } = gridScrollWrapper;

            // Detectamos si el usuario está cerca del final del scroll (ej. a 300px del final)
            if (scrollWidth - scrollLeft - clientWidth < 300) {
                isLoading = true;

                // Contamos cuántos días ya están cargados en la cabecera
                const currentDayCount = document.querySelectorAll('.days-header .day-label').length;

                try {
                    // Pedimos más datos a nuestra nueva API, indicando el offset
                    const response = await fetch(`/api/more-habits-data?offset=${currentDayCount}`);
                    if (!response.ok) {
                        throw new Error('No se pudieron cargar más días.');
                    }
                    const data = await response.json();

                    if (data.success && data.dates.length > 0) {
                        // Referencias a los contenedores donde añadiremos el nuevo HTML
                        const daysHeader = document.querySelector('.days-header');
                        
                        // 1. Añadir las nuevas cabeceras de días
                        data.dates.forEach(dateString => {
                            const date = new Date(dateString + 'T00:00:00');
                            const isFirstDayOfMonth = date.getDate() === 1;
                            const monthOrWeekday = isFirstDayOfMonth ? date.toLocaleDateString('es-ES', { month: 'short' }) : date.toLocaleDateString('es-ES', { weekday: 'short' });
                            const dayLabelHTML = `
                                <div class="day-label ${isFirstDayOfMonth ? 'new-month-start' : ''}">
                                    <span class="day-label-text">
                                        ${monthOrWeekday}
                                    </span>
                                    <span class="day-label-day">${date.getDate()}</span>
                                </div>
                            `;
                            daysHeader.insertAdjacentHTML('beforeend', dayLabelHTML);
                        });

                        // 2. Añadir los nuevos `day-check` a cada fila de hábito
                        allHabits.forEach(habit => {
                            const habitDaysRow = document.querySelector(`.habit-days[data-row-id="${habit.id}"] .habit-days`);
                            if (habitDaysRow) {
                                let daysHTML = '';
                                data.dates.forEach(dateString => {
                                    const date = new Date(dateString + 'T00:00:00');
                                    const isCompleted = data.completionsMap[`${habit.id}-${dateString}`];
                                    daysHTML += `
                                        <div 
                                            class="day-check ${isCompleted ? 'completed' : ''} ${date.getDate() === 1 ? 'new-month-start' : ''}"
                                            data-habit-id="${habit.id}"
                                            data-date="${dateString}"
                                            role="button"
                                            tabindex="0"
                                        ></div>
                                    `;
                                });
                                habitDaysRow.insertAdjacentHTML('beforeend', daysHTML);
                            }
                        });
                    }
                } catch (error) {
                    console.error("Error en scroll infinito:", error);
                    // Podrías mostrar un mensaje al usuario si falla la carga
                } finally {
                    // Esperamos un poco antes de permitir la siguiente carga para evitar llamadas muy seguidas
                    setTimeout(() => {
                        isLoading = false;
                    }, 200);
                }
            }
        });
    }
});