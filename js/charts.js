// ===== Charts Manager =====
// Gestisce la creazione e visualizzazione dei grafici

const ChartsManager = {
    charts: {},

    // Distruggi un grafico esistente
    destroyChart(chartId) {
        if (this.charts[chartId]) {
            this.charts[chartId].destroy();
            delete this.charts[chartId];
        }
    },

    // Crea grafico a torta per la distribuzione delle spese
    createExpensePieChart(canvasId, expenses) {
        this.destroyChart(canvasId);

        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const distribution = ScenarioManager.getExpenseDistribution(expenses);
        const labels = ScenarioManager.getCategoryLabels();
        const colors = ScenarioManager.getCategoryColors();

        const data = {
            labels: Object.keys(distribution).map(key => labels[key]),
            datasets: [{
                data: Object.values(distribution).map(d => d.amount),
                backgroundColor: Object.keys(distribution).map(key => colors[key]),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };

        const config = {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = ScenarioManager.formatCurrency(context.parsed);
                                const percentage = distribution[Object.keys(distribution)[context.dataIndex]].percentage.toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, config);
        return this.charts[canvasId];
    },

    // Crea grafico a barre per confronto scenari
    createComparisonBarChart(canvasId, scenarios) {
        this.destroyChart(canvasId);

        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const labels = scenarios.map(s => s.name);
        const totals = scenarios.map(s => ScenarioManager.calculateTotal(s.expenses));
        const costsPerPerson = scenarios.map(s => 
            ScenarioManager.calculateCostPerPerson(s.expenses, s.participants.length)
        );

        const data = {
            labels: labels,
            datasets: [
                {
                    label: 'Costo Totale',
                    data: totals,
                    backgroundColor: 'rgba(37, 99, 235, 0.7)',
                    borderColor: 'rgba(37, 99, 235, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Costo per Persona',
                    data: costsPerPerson,
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2
                }
            ]
        };

        const config = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return ScenarioManager.formatCurrency(value);
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${ScenarioManager.formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, config);
        return this.charts[canvasId];
    },

    // Crea grafico a barre raggruppate per categorie di spesa
    createCategoryComparisonChart(canvasId, scenarios) {
        this.destroyChart(canvasId);

        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const labels = scenarios.map(s => s.name);
        const categories = ['transport', 'accommodation', 'food', 'car', 'activities', 'other'];
        const categoryLabels = ScenarioManager.getCategoryLabels();
        const colors = ScenarioManager.getCategoryColors();

        const datasets = categories.map(category => ({
            label: categoryLabels[category],
            data: scenarios.map(s => s.expenses[category] || 0),
            backgroundColor: colors[category],
            borderWidth: 2,
            borderColor: '#ffffff'
        }));

        const config = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return ScenarioManager.formatCurrency(value);
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 10,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${ScenarioManager.formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, config);
        return this.charts[canvasId];
    },

    // Crea grafico a linee per trend temporale
    createTimelineChart(canvasId, scenarios) {
        this.destroyChart(canvasId);

        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        // Ordina scenari per data
        const sortedScenarios = scenarios
            .filter(s => s.startDate)
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        const labels = sortedScenarios.map(s => ScenarioManager.formatDate(s.startDate));
        const totals = sortedScenarios.map(s => ScenarioManager.calculateTotal(s.expenses));

        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Costo Totale',
                    data: totals,
                    borderColor: 'rgba(37, 99, 235, 1)',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return ScenarioManager.formatCurrency(value);
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const scenario = sortedScenarios[context.dataIndex];
                                return [
                                    `${scenario.name}`,
                                    `Totale: ${ScenarioManager.formatCurrency(context.parsed.y)}`,
                                    `Destinazione: ${scenario.destination}`
                                ];
                            }
                        }
                    }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, config);
        return this.charts[canvasId];
    },

    // Crea grafico radar per confronto multi-dimensionale
    createRadarChart(canvasId, scenarios) {
        this.destroyChart(canvasId);

        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const categories = ['transport', 'accommodation', 'food', 'car', 'activities', 'other'];
        const categoryLabels = ScenarioManager.getCategoryLabels();

        const datasets = scenarios.map((scenario, index) => {
            const colors = [
                'rgba(37, 99, 235, 0.6)',
                'rgba(16, 185, 129, 0.6)',
                'rgba(245, 158, 11, 0.6)',
                'rgba(239, 68, 68, 0.6)',
                'rgba(139, 92, 246, 0.6)'
            ];
            const color = colors[index % colors.length];

            return {
                label: scenario.name,
                data: categories.map(cat => scenario.expenses[cat] || 0),
                backgroundColor: color,
                borderColor: color.replace('0.6', '1'),
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            };
        });

        const config = {
            type: 'radar',
            data: {
                labels: categories.map(cat => categoryLabels[cat]),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return ScenarioManager.formatCurrency(value);
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${ScenarioManager.formatCurrency(context.parsed.r)}`;
                            }
                        }
                    }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, config);
        return this.charts[canvasId];
    },

    // Distruggi tutti i grafici
    destroyAllCharts() {
        Object.keys(this.charts).forEach(chartId => {
            this.destroyChart(chartId);
        });
    }
};

// Made with Bob
