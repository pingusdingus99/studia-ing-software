const monthYearElement = document.getElementById('monthYear');
const datesElement = document.getElementById('dates');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentDate = new Date();

function updateCalendar() {
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
    datesHTML += `<div class="date ${activeClass}">${i}</div>`;
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
