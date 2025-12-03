document.addEventListener('DOMContentLoaded', () => {
    const habitTitleElement = document.getElementById('habit-name-title');
    const ctx = document.getElementById('habitChart')?.getContext('2d');
    const periodSelector = document.querySelector('.period-selector');

    const urlParams = new URLSearchParams(window.location.search);
    const habitId = urlParams.get('id');

    let chartInstance = null;

    if (!habitId || !ctx) {
        if (habitTitleElement) habitTitleElement.textContent = "Hábito no encontrado";
        return;
    }

    const renderChart = (chartData) => {
        if (chartInstance) {
            chartInstance.destroy();
        }

        const yAxisTitle = 'Tasa de Cumplimiento (%)';

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: `Cumplimiento de "${chartData.name}"`,
                    data: chartData.data,
                    borderColor: '#5383cb',
                    backgroundColor: 'rgba(83, 131, 203, 0.1)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: yAxisTitle
                        },
                        // Asegurarse que el máximo sea 100 si los valores son porcentajes
                        max: 100 
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    };

    const fetchAndRender = async (period = 'month') => {
        try {
            const response = await fetch(`/api/habitos/${habitId}/stats?period=${period}`);
            if (!response.ok) throw new Error('Error al cargar los datos');
            
            const data = await response.json();
            
            if (habitTitleElement) {
                habitTitleElement.textContent = data.name;
                document.title = `Estadísticas: ${data.name} - Studia`;
            }
            
            renderChart(data);

            // Actualizar botón activo
            document.querySelectorAll('.period-selector button').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.period === period);
            });

        } catch (error) {
            console.error(error);
            if (habitTitleElement) habitTitleElement.textContent = "Error al cargar datos";
        }
    };

    periodSelector.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const period = e.target.dataset.period;
            fetchAndRender(period);
        }
    });

    // Carga inicial
    fetchAndRender('month');
});