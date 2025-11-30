document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias DOM ---
    const openHealthBtn = document.getElementById('open-health-btn');
    const healthModal = document.getElementById('health-modal');
    const closeHealthModalX = document.getElementById('close-health-modal-x');
    
    // Vistas
    const selectionView = document.getElementById('selection-view');
    const infoView = document.getElementById('info-view');
    const exerciseView = document.getElementById('exercise-view');
    
    // Elementos Interiores
    const btnSelectEquitativa = document.getElementById('btn-select-equitativa');
    const btnSelectCuadrada = document.getElementById('btn-select-cuadrada');
    
    const infoBtns = document.querySelectorAll('.info-btn');
    const btnCloseInfo = document.getElementById('btn-close-info');
    const btnStartFromInfo = document.getElementById('btn-start-from-info');
    const infoTitleDisplay = document.getElementById('info-title-display');
    const infoContentDisplay = document.getElementById('info-content-display');

    // Controles Ejercicio
    const btnToggle = document.getElementById('btn-toggle-exercise'); 
    const btnBackMenu = document.getElementById('btn-back-menu'); 
    const exerciseTitleDisplay = document.getElementById('exercise-title-display');
    const circle = document.getElementById('breath-circle');
    const timerText = document.getElementById('timer-text');
    const instructionText = document.getElementById('instruction-text');

    // Datos y Colores
    const exerciseInfoData = {
        'equitativa': {
            title: "Respiración Equitativa",
            color: "#2d5a52", // Verde
            textColor: "#2d5a52",
            content: `
                <p>La <strong>Respiración Equitativa</strong> (Sama-Vritti) iguala la duración de la inhalación y la exhalación.</p>
                <p><strong>Cómo hacerlo:</strong> Inhala contando hasta 4, exhala contando hasta 4.</p>
                <p>Ideal para reducir estrés rápidamente y calmar el sistema nervioso.</p>
            `
        },
        'cuadrada': {
            title: "Respiración Cuadrada",
            color: "#2c3e50", // Azul
            textColor: "#2c3e50",
            content: `
                <p>La <strong>Respiración Cuadrada</strong> es una técnica de control en 4 fases.</p>
                <p><strong>Cómo hacerlo:</strong> Inhala (4s), Sostén (4s), Exhala (4s), Sostén (4s).</p>
                <p>Usada por profesionales para mejorar concentración y rendimiento bajo presión.</p>
            `
        }
    };

    // Estado
    let mainInterval, countdownInterval; 
    let currentExerciseType = 'equitativa';
    let currentInfoType = 'equitativa'; 
    let isRunning = false; 

    // Configuración inicial de transición
    if (timerText) timerText.style.transition = 'transform 4s linear';

    // --- Helper de Visibilidad ---
    const setDisplay = (element, show, displayType = 'flex') => {
        if (!element) return;
        if (show) {
            element.classList.remove('hidden');
            element.style.display = displayType;
        } else {
            element.classList.add('hidden');
            element.style.display = 'none';
        }
    };

    // --- Funciones Principales ---

    const stopAll = () => {
        clearInterval(mainInterval);
        clearInterval(countdownInterval);
        isRunning = false;
        
        if (circle) circle.classList.remove('expand');
        if (timerText) {
            timerText.innerText = "Listo";
            timerText.style.transform = 'scale(1)';
        }
        if (instructionText) instructionText.innerText = "Presiona Comenzar";
        
        if (btnToggle) {
            btnToggle.innerText = "Comenzar";
            btnToggle.classList.remove('stop-mode');
        }
    };

    const resetToMenu = () => {
        stopAll();
        // Mostrar X del modal general
        if (closeHealthModalX) closeHealthModalX.style.display = 'block';
        
        // Resetear vistas
        setDisplay(selectionView, true, 'flex');
        setDisplay(infoView, false);
        setDisplay(exerciseView, false);
    };

    // Mostrar Info
    const showInfo = (type) => {
        const data = exerciseInfoData[type];
        if (data) {
            currentInfoType = type;
            infoTitleDisplay.innerText = data.title;
            infoContentDisplay.innerHTML = data.content;
            
            // Aplicar color al fondo de Info
            infoView.style.backgroundColor = data.color;
            // Aplicar color al texto del botón para que combine
            btnStartFromInfo.style.color = data.textColor;

            if (closeHealthModalX) closeHealthModalX.style.display = 'none'; // Ocultar X general para usar la de info
            
            setDisplay(selectionView, false);
            setDisplay(infoView, true, 'flex');
        }
    };

    // Iniciar Ejercicio y Cambiar Fondo
    const handleStartExercise = (type, title) => {
        currentExerciseType = type;
        const data = exerciseInfoData[type];
        
        if (exerciseTitleDisplay) exerciseTitleDisplay.innerText = title;
        // Título del ejercicio en blanco
        if (exerciseTitleDisplay) exerciseTitleDisplay.style.color = 'white';

        // *** CAMBIO DE COLOR DE FONDO ***
        // Aplicamos el color del ejercicio al contenedor principal
        if (exerciseView) {
            exerciseView.style.backgroundColor = data.color;
        }
        
        if (closeHealthModalX) closeHealthModalX.style.display = 'block'; // Mostrar X para salir

        setDisplay(selectionView, false);
        setDisplay(infoView, false);
        setDisplay(exerciseView, true, 'flex');
        stopAll();
    };

    // --- Lógica de Respiración ---
    const runPhaseTimer = (seconds, callback) => {
        let count = seconds;
        timerText.innerText = count;
        const timer = setInterval(() => {
            count--;
            if (count > 0) timerText.innerText = count;
            else { clearInterval(timer); if (callback) callback(); }
        }, 1000);
        return timer;
    };

    const runEquitativaCycle = () => {
        instructionText.innerText = "Inhala";
        circle.classList.add('expand');
        timerText.style.transform = 'scale(0.625)'; 
        mainInterval = runPhaseTimer(4, () => {
            instructionText.innerText = "Exhala";
            circle.classList.remove('expand');
            timerText.style.transform = 'scale(1)';
            mainInterval = runPhaseTimer(4, () => runEquitativaCycle());
        });
    };

    const runCuadradaCycle = () => {
        instructionText.innerText = "Inhala";
        circle.classList.add('expand');
        timerText.style.transform = 'scale(0.625)';
        mainInterval = runPhaseTimer(4, () => {
            instructionText.innerText = "Sostén";
            mainInterval = runPhaseTimer(4, () => {
                instructionText.innerText = "Exhala";
                circle.classList.remove('expand');
                timerText.style.transform = 'scale(1)';
                mainInterval = runPhaseTimer(4, () => {
                    instructionText.innerText = "Sostén";
                    mainInterval = runPhaseTimer(4, () => runCuadradaCycle());
                });
            });
        });
    };

    const startExerciseLogic = () => {
        if (currentExerciseType === 'equitativa') runEquitativaCycle();
        else runCuadradaCycle();
    };

    const startCountdownInCircle = () => {
        isRunning = true;
        btnToggle.innerText = "Parar";
        btnToggle.classList.add('stop-mode');
        instructionText.innerText = "Prepárate...";
        let prepCount = 5;
        timerText.innerText = prepCount;
        countdownInterval = setInterval(() => {
            prepCount--;
            if (prepCount > 0) timerText.innerText = prepCount;
            else { clearInterval(countdownInterval); startExerciseLogic(); }
        }, 1000);
    };

    // --- Event Listeners ---
    if (openHealthBtn) openHealthBtn.addEventListener('click', (e) => { e.preventDefault(); resetToMenu(); healthModal.classList.remove('hidden'); });

    // Tarjetas
    if (btnSelectEquitativa) btnSelectEquitativa.addEventListener('click', () => handleStartExercise('equitativa', 'Respiración Equitativa'));
    if (btnSelectCuadrada) btnSelectCuadrada.addEventListener('click', () => handleStartExercise('cuadrada', 'Respiración Cuadrada'));

    // Info
    infoBtns.forEach(btn => {
        btn.addEventListener('click', (e) => { e.stopPropagation(); showInfo(btn.dataset.info); });
    });
    if (btnCloseInfo) btnCloseInfo.addEventListener('click', () => {
        setDisplay(infoView, false);
        setDisplay(selectionView, true, 'flex');
        if (closeHealthModalX) closeHealthModalX.style.display = 'block';
    });
    if (btnStartFromInfo) btnStartFromInfo.addEventListener('click', () => handleStartExercise(currentInfoType, exerciseInfoData[currentInfoType].title));

    // Controles Ejercicio
    if (btnToggle) btnToggle.addEventListener('click', () => isRunning ? stopAll() : startCountdownInCircle());
    if (btnBackMenu) btnBackMenu.addEventListener('click', resetToMenu);

    // Cerrar Todo
    const closeTotal = () => { healthModal.classList.add('hidden'); resetToMenu(); };
    if (closeHealthModalX) closeHealthModalX.addEventListener('click', closeTotal);
    if (healthModal) healthModal.addEventListener('click', (e) => { if (e.target === healthModal) closeTotal(); });
});