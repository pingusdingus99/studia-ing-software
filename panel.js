document.addEventListener("DOMContentLoaded", () => {
  const habitContainer = document.getElementById("habit-container");
  const addHabitBtn = document.getElementById("add-habit");
  const usernameSpan = document.getElementById("username");

  // Simulación: datos temporales (luego vendrán de la BD)
  const user = { username: "Estudiante123" };
  const habits = [
    { id: 1, name: "Hacer ejercicio", done: false },
    { id: 2, name: "Leer 20 min", done: true },
  ];

  // Mostrar usuario
  usernameSpan.textContent = user.username;

  // Renderizar hábitos
  function renderHabits() {
    habitContainer.innerHTML = "";
    habits.forEach(habit => {
      const div = document.createElement("div");
      div.classList.add("habit");
      div.innerHTML = `
        <input type="checkbox" ${habit.done ? "checked" : ""} data-id="${habit.id}" />
        <span class="habit-name">${habit.name}</span>
      `;
      habitContainer.appendChild(div);
    });
    attachCheckboxHandlers();
  }

  function attachCheckboxHandlers() {
    habitContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener("change", (e) => {
        const id = Number(e.target.dataset.id);
        const h = habits.find(x => x.id === id);
        if (h) h.done = e.target.checked;
      });
    });
  }

  renderHabits();

  // Agregar hábito básico
  addHabitBtn.addEventListener("click", () => {
    const name = prompt("Nombre del hábito:");
    if (name) {
      habits.push({ id: Date.now(), name, done: false });
      renderHabits();
    }
  });
});
