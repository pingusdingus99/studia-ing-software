const monthYearElement = document.getElementById('monthYear');
const datesElement = document.getElementById('dates');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const habitTitleElement = document.getElementById('habit-name-title'); // Referencia al título

let currentDate = new Date();
let currentRegistros = [];

function updateCalendar() { 
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); 

  const lastDayOfPrevMonth = new Date(currentYear, currentMonth, 0); 
  const prevMonthLastDayIndex = lastDayOfPrevMonth.getDay();
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const totalDays = lastDay.getDate();
  const prevLastDate = new Date(currentYear, currentMonth, 0).getDate();
  const occupied = (prevMonthLastDayIndex + totalDays) % 7;
  const nextDays = (7 - occupied) % 7;

  const monthYearString = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  if (monthYearElement) monthYearElement.textContent = monthYearString.charAt(0).toUpperCase() + monthYearString.slice(1);

  let datesHTML = '';

  // Días mes anterior
  for (let i = prevMonthLastDayIndex; i > 0; i--) {
    const day = prevLastDate - i + 1;
    datesHTML += `<div class="date inactive">${day}</div>`;
  }

  // Días mes actual
  const today = new Date();
  for (let i = 1; i <= totalDays; i++) {
    const isToday = (currentYear === today.getFullYear() && currentMonth === today.getMonth() && i === today.getDate());
    const activeClass = isToday ? 'active' : '';

    const dayStr = i.toString().padStart(2, '0');
    const monthStr = (currentMonth + 1).toString().padStart(2, '0');
    const dateString = `${currentYear}-${monthStr}-${dayStr}`;

    const registroDelDia = currentRegistros.find(reg => {
        // Aseguramos compatibilidad con fecha ISO o string simple
        const fechaReg = reg.completion_date ? reg.completion_date.toString().substring(0, 10) : '';
        return fechaReg === dateString;
    });

    let habitClass = '';
    if (registroDelDia) {
        habitClass = registroDelDia.status ? 'no-completado' : 'completado';
    }
    
    datesHTML += `<div class="date ${activeClass} ${habitClass}" id="date-${dateString}">${i}</div>`;
  }

  // Días mes siguiente
  for (let i = 1; i <= nextDays; i++) {
    datesHTML += `<div class="date inactive">${i}</div>`;
  }

  if (datesElement) datesElement.innerHTML = datesHTML;
}

prevBtn?.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  updateCalendar();
});

nextBtn?.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  updateCalendar();
});

// --- FUNCIÓN ACTUALIZADA ---
async function cargarYpintarHabito(id) {
    try {
        console.log(`Cargando datos para el hábito ID: ${id}...`);
        
        const respuesta = await fetch(`/api/habitos/${id}`); 
        
        if (respuesta.ok) {
            const data = await respuesta.json();
            
            // 1. Actualizamos el título con el nombre que viene de la BD
            if (habitTitleElement && data.name) {
                habitTitleElement.textContent = data.name;
                document.title = `Calendario: ${data.name} - Studia`; // Actualizar título pestaña
            }

            // 2. Guardamos los registros para el calendario
            // Nota: data.completions es el array que viene del controlador modificado
            currentRegistros = data.completions || [];
            
            console.log("Datos cargados:", data);
        } else {
            console.error("Error al cargar hábitos:", respuesta.status);
            if(habitTitleElement) habitTitleElement.textContent = "Hábito no encontrado";
            currentRegistros = [];
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        if(habitTitleElement) habitTitleElement.textContent = "Error de conexión";
        currentRegistros = [];
    }
    
    updateCalendar();
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    updateCalendar(); // Dibuja vacío primero

    // Leer ID de la URL (ej: /calendar?id=5)
    const urlParams = new URLSearchParams(window.location.search);
    const habitId = urlParams.get('id');

    if (habitId) {
        cargarYpintarHabito(habitId);
    } else {
        if(habitTitleElement) habitTitleElement.textContent = "Selecciona un hábito";
    }
});