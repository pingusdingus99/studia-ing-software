document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos
    const predefinedColors = ['#5383cb', '#e53935', '#43a047', '#fdd835', '#fb8c00', '#8e24aa', '#00acc1', '#d81b60', '#3949ab'];

    // --- Helper para crear el SVG del check con un color específico ---
    const createCheckSvg = (color) => {
        const encodedColor = encodeURIComponent(color);
        return `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${encodedColor}' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='20 6 9 17 4 12'%3e%3c/polyline%3e%3c/svg%3e")`;
    };
    const createCrossSvg = () => {
        return `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ced4da' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cline x1='18' y1='6' x2='6' y2='18'%3e%3c/line%3e%3cline x1='6' y1='6' x2='18' y2='18'%3e%3c/line%3e%3c/svg%3e")`;
    };

    const addHabitBtn = document.getElementById('add-habit-btn');
    const modal = document.getElementById('add-habit-modal');
    const editColorModal = document.getElementById('edit-color-modal');
    const cancelEditColorBtn = document.getElementById('cancel-edit-color-btn');
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

    // Lógica para el modal de editar color
    if (editColorModal && cancelEditColorBtn) {
        cancelEditColorBtn.addEventListener('click', () => {
            editColorModal.classList.add('hidden');
        });

        editColorModal.addEventListener('click', (event) => {
            if (event.target === editColorModal) {
                editColorModal.classList.add('hidden');
            }
        });
    }

    // --- Lógica para los selectores de color ---
    const setupColorPicker = (containerId, hiddenInputId) => {
        const container = document.getElementById(containerId);
        const hiddenInput = document.getElementById(hiddenInputId);
        if (!container || !hiddenInput) return;

        // Generar las muestras de color
        container.innerHTML = ''; // Limpiar por si acaso
        predefinedColors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            swatch.dataset.color = color;
            container.appendChild(swatch);
        });

        // Marcar el color por defecto o el actual
        const currentSelected = container.querySelector(`[data-color="${hiddenInput.value}"]`);
        if (currentSelected) {
            currentSelected.classList.add('selected');
        }

        // Event listener para el contenedor
        container.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('color-swatch')) {
                // Quitar 'selected' de la muestra anterior
                const previouslySelected = container.querySelector('.color-swatch.selected');
                if (previouslySelected) {
                    previouslySelected.classList.remove('selected');
                }
                // Añadir 'selected' a la nueva y actualizar el input oculto
                target.classList.add('selected');
                hiddenInput.value = target.dataset.color;
            }
        });
    };

    setupColorPicker('add-color-swatches', 'habitColor');

    // --- LISTENER DE EVENTOS GLOBAL PARA ACCIONES DE HÁBITOS ---
    // Usamos document.body para asegurarnos de capturar todos los clics
    // dentro del dashboard, incluyendo los botones de la grilla.
    document.body.addEventListener('click', async (event) => {
            const target = event.target;
            const dayCheck = target.closest('.day-check'); // Correcta delegación de eventos

            if (dayCheck) {
                const { habitId, date } = dayCheck.dataset;

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
                        const isCompleted = result.status === 'completed';
                        dayCheck.classList.toggle('completed', isCompleted);
                        if (isCompleted) {
                            const habitColor = document.querySelector(`.btn-edit-color[data-habit-id="${habitId}"]`).dataset.currentColor;
                            dayCheck.style.backgroundImage = createCheckSvg(habitColor);
                            dayCheck.style.backgroundColor = `${habitColor}20`; // Color con 20% de opacidad
                        } else {
                            dayCheck.style.backgroundImage = createCrossSvg();
                            dayCheck.style.backgroundColor = '#f8f9fa'; // Color por defecto no completado
                        }
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

            // Lógica para el botón de editar color
            const editColorButton = target.closest('.btn-edit-color');
            if (editColorButton) {
                const habitId = editColorButton.dataset.habitId;
                const currentColor = editColorButton.dataset.currentColor;

                // Rellenar el modal con los datos del hábito
                document.getElementById('edit-color-habit-id').value = habitId;
                document.getElementById('editColorHiddenInput').value = currentColor;
                setupColorPicker('edit-color-swatches', 'editColorHiddenInput'); // Re-inicializar para marcar el color correcto

                // Mostrar el modal
                editColorModal.classList.remove('hidden');
            }
    });

    // --- LISTENER PARA EL FORMULARIO DE EDICIÓN DE COLOR ---
    const editColorForm = document.getElementById('edit-color-form');
    if (editColorForm) {
        editColorForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const habitId = document.getElementById('edit-color-habit-id').value;
            const newColor = document.getElementById('editColorHiddenInput').value;

            try {
                const response = await fetch(`/habits/${habitId}/color`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ color: newColor })
                });

                if (!response.ok) throw new Error('Error al actualizar el color');

                const result = await response.json();
                if (result.success) {
                    // Actualizar el color en el DOM
                    const habitNameButton = document.querySelector(`.habit-name[data-row-id="${habitId}"] .btn-ver-habito`);
                    const colorDot = document.querySelector(`.habit-color-dot[data-row-id="${habitId}"]`);
                    const editButton = document.querySelector(`.btn-edit-color[data-habit-id="${habitId}"]`);
                    if (habitNameButton) habitNameButton.style.color = newColor;
                    if (colorDot) colorDot.style.backgroundColor = newColor;
                    if (editButton) editButton.dataset.currentColor = newColor;

                    // Actualizar el color de los checks ya completados para ese hábito
                    const completedChecks = document.querySelectorAll(`.day-check.completed[data-habit-id="${habitId}"]`);
                    completedChecks.forEach(check => {
                        check.style.backgroundImage = createCheckSvg(newColor);
                        check.style.backgroundColor = `${newColor}20`;
                    });

                    // Cerrar modal
                    editColorModal.classList.add('hidden');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('No se pudo actualizar el color. Inténtalo de nuevo.');
            }
        });
    }


    // --- LÓGICA DE SCROLL INFINITO ---
    let isLoading = false; // Flag para evitar cargas múltiples simultáneas
    let allHabits = []; // Almacenaremos los hábitos aquí para no pedirlos de nuevo
    const gridScrollWrapper = document.querySelector('.grid-scroll-wrapper');

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