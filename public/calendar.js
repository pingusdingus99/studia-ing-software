const monthYearElement = document.getElementById('monthYear');
const datesElement = document.getElementById('dates');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentDate = new Date();
let currentRegistros = [];

function updateCalendar() { // calcula y muestra los días que hay en cada mes
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-based

  // Obtener el ÚLTIMO día del MES ANTERIOR
  const lastDayOfPrevMonth = new Date(currentYear, currentMonth, 0); // se obtiene toda la metadata de ese dia

  // Obtener el índice del día de la semana (0=Dom, 1=Lun, 2=Mar...) de ESE DÍA
  const prevMonthLastDayIndex = lastDayOfPrevMonth.getDay();

  // Último día del mes y su índice
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const totalDays = lastDay.getDate();
  const lastDayIndex = lastDay.getDay();

  // Último día del mes anterior (número)
  const prevLastDate = new Date(currentYear, currentMonth, 0).getDate(); // se obtiene la fecha del último día del mes anterior

  // Calcular cuántos "next days" necesitamos (0..6)
  // Resume: (prevMonthLastDayIndex + totalDays) % 7 = número de celdas ocupadas en la última fila
  // nextDays = 7 - ocupadas; si ocupadas === 0 => nextDays = 0
  const occupied = (prevMonthLastDayIndex + totalDays) % 7;
  const nextDays = (7 - occupied) % 7;

  // Mes y año en texto
  const monthYearString = currentDate.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  if (monthYearElement) monthYearElement.textContent = monthYearString;

  let datesHTML = '';

  // Días del mes anterior
  for (let i = prevMonthLastDayIndex; i > 0; i--) {
    const day = prevLastDate - i + 1;
    datesHTML += `<div class="date inactive">${day}</div>`;
  }

  // Días del mes actual
  const today = new Date();
  const todayY = today.getFullYear();
  const todayM = today.getMonth();
  const todayD = today.getDate();

  for (let i = 1; i <= totalDays; i++) {
    const isToday = (currentYear === todayY && currentMonth === todayM && i === todayD);
    const activeClass = isToday ? 'active' : '';

    // --- INICIO DE LA MODIFICACIÓN ---

    // 1. Crear un string de fecha "YYYY-MM-DD" para el día actual del bucle
    const dayStr = i.toString().padStart(2, '0');
    const monthStr = (currentMonth + 1).toString().padStart(2, '0'); // +1 porque getMonth() es 0-based
    const dateString = `${currentYear}-${monthStr}-${dayStr}`;

    // 2. Buscar esta fecha en nuestros registros guardados
    // Usamos .find() que es rápido y devuelve el primer registro que coincida
    const registroDelDia = currentRegistros.find(reg => {
        // --- ¡ESTA ES LA CORRECCIÓN! ---
        // reg.date es "2025-11-01T03:00:00.000Z"
        // Extraemos solo la parte "YYYY-MM-DD"
        const registroDateStr = reg.date.substring(0, 10);
        // Comparamos "2025-11-01" === "2025-11-01"
        return registroDateStr === dateString;
    });

    // 3. Añadir la clase de hábito si se encuentra un registro
    let habitClass = '';
    if (registroDelDia) {
        // Asumiendo que tu DB devuelve 'status: true' para completado
        habitClass = registroDelDia.status ? 'completado' : 'no-completado';
    }
    
    // 4. Añadir las nuevas clases y un ID al HTML
    // (El ID `id="date-${dateString}"` es muy útil para el futuro)
    datesHTML += `<div class="date ${activeClass} ${habitClass}" id="date-${dateString}">${i}</div>`;
    //datesHTML += `<div class="date ${activeClass}">${i}</div>`;
    // --- FIN DE LA MODIFICACIÓN ---
  }

  // Días del siguiente mes
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

updateCalendar();

//la siguiente función se utilizará cuando se implemente botonVerHabito:
/*const boton = document.getElementById('botonVerHabito')
boton.addEventListener('click', () => {
  const idHabito = boton.dataset.idHabito;
  if (idHabito) {
    cargarYpintarHabito(idHabito);
  } else { console.error("No se pudo encontrar el ID del hábito en el botón.")}

});*/

async function cargarYpintarHabito(id) {
    try {
        const respuesta = await fetch(`/api/habitos/${id}`); 
        
        if (respuesta.ok) {
            currentRegistros = await respuesta.json(); // Guarda los registros globalmente
            console.log("currentRegistros:", currentRegistros); // para identificar si se guardan correctamente
        } else {
            console.error("Error al cargar hábitos:", respuesta.status);
            currentRegistros = []; // Limpia en caso de error
        }
    } catch (error) {
        console.error("Error de fetch (red):", error);
        currentRegistros = [];
    }
    
    // Llama a updateCalendar para que vuelva a dibujar el mes
    updateCalendar();
}

const idPrueba = 1;
cargarYpintarHabito(idPrueba);