// ===== Scenario Manager =====
// Gestisce la logica degli scenari e i calcoli

const ScenarioManager = {
    currentScenarioId: null,

    // Crea un nuovo scenario vuoto
    createEmptyScenario() {
        return {
            name: '',
            destination: '',
            startDate: '',
            endDate: '',
            participants: [],
            expenses: {
                transport: 0,
                accommodation: 0,
                food: 0,
                car: 0,
                activities: 0,
                other: 0
            },
            notes: ''
        };
    },

    // Calcola il totale delle spese
    calculateTotal(expenses) {
        return Object.values(expenses).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    },

    // Calcola il costo per partecipante
    calculateCostPerPerson(expenses, participantsCount) {
        if (participantsCount === 0) return 0;
        const total = this.calculateTotal(expenses);
        return total / participantsCount;
    },

    // Formatta un numero come valuta
    formatCurrency(amount) {
        try {
            // Fallback per browser che non supportano Intl
            if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
                return new Intl.NumberFormat('it-IT', {
                    style: 'currency',
                    currency: 'EUR'
                }).format(amount);
            } else {
                // Formattazione manuale
                const formatted = parseFloat(amount).toFixed(2).replace('.', ',');
                return `€${formatted}`;
            }
        } catch (error) {
            console.error('Errore nella formattazione della valuta:', error);
            return `€${parseFloat(amount).toFixed(2)}`;
        }
    },

    // Formatta una data
    formatDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            // Fallback per browser che non supportano Intl
            if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
                return new Intl.DateTimeFormat('it-IT', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }).format(date);
            } else {
                // Formattazione manuale
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            }
        } catch (error) {
            console.error('Errore nella formattazione della data:', error);
            return dateString;
        }
    },

    // Calcola la durata del viaggio in giorni
    calculateDuration(startDate, endDate) {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays + 1; // Include il giorno di partenza
    },

    // Valida uno scenario
    validateScenario(scenario) {
        const errors = [];

        if (!scenario.name || scenario.name.trim() === '') {
            errors.push('Il nome dello scenario è obbligatorio');
        }

        if (!scenario.destination || scenario.destination.trim() === '') {
            errors.push('La destinazione è obbligatoria');
        }

        if (scenario.startDate && scenario.endDate) {
            const start = new Date(scenario.startDate);
            const end = new Date(scenario.endDate);
            if (end < start) {
                errors.push('La data di fine deve essere successiva alla data di inizio');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // Confronta scenari
    compareScenarios(scenarioIds) {
        const scenarios = scenarioIds.map(id => StorageManager.getScenario(id)).filter(s => s);
        
        if (scenarios.length === 0) {
            return null;
        }

        const comparison = {
            scenarios: scenarios.map(s => ({
                id: s.id,
                name: s.name,
                destination: s.destination,
                participants: s.participants.length,
                total: this.calculateTotal(s.expenses),
                costPerPerson: this.calculateCostPerPerson(s.expenses, s.participants.length),
                expenses: s.expenses,
                duration: this.calculateDuration(s.startDate, s.endDate)
            })),
            summary: {
                minCost: 0,
                maxCost: 0,
                avgCost: 0,
                minCostPerPerson: 0,
                maxCostPerPerson: 0,
                avgCostPerPerson: 0
            }
        };

        // Calcola statistiche di confronto
        const totals = comparison.scenarios.map(s => s.total);
        const costsPerPerson = comparison.scenarios.map(s => s.costPerPerson);

        comparison.summary.minCost = Math.min(...totals);
        comparison.summary.maxCost = Math.max(...totals);
        comparison.summary.avgCost = totals.reduce((a, b) => a + b, 0) / totals.length;
        comparison.summary.minCostPerPerson = Math.min(...costsPerPerson);
        comparison.summary.maxCostPerPerson = Math.max(...costsPerPerson);
        comparison.summary.avgCostPerPerson = costsPerPerson.reduce((a, b) => a + b, 0) / costsPerPerson.length;

        return comparison;
    },

    // Ottieni la distribuzione delle spese per categoria
    getExpenseDistribution(expenses) {
        const total = this.calculateTotal(expenses);
        if (total === 0) return {};

        const distribution = {};
        for (const [category, amount] of Object.entries(expenses)) {
            distribution[category] = {
                amount: parseFloat(amount) || 0,
                percentage: ((parseFloat(amount) || 0) / total) * 100
            };
        }
        return distribution;
    },

    // Ottieni le etichette delle categorie in italiano
    getCategoryLabels() {
        return {
            transport: '🚗 Trasporto',
            accommodation: '🏨 Alloggio',
            food: '🍽️ Vitto',
            car: '🚙 Auto/Noleggio',
            activities: '🎭 Attività',
            other: '📦 Altro'
        };
    },

    // Ottieni i colori per le categorie (per i grafici)
    getCategoryColors() {
        return {
            transport: '#3b82f6',
            accommodation: '#8b5cf6',
            food: '#10b981',
            car: '#f59e0b',
            activities: '#ec4899',
            other: '#6366f1'
        };
    },

    // Genera un report testuale dello scenario
    generateReport(scenario) {
        const total = this.calculateTotal(scenario.expenses);
        const costPerPerson = this.calculateCostPerPerson(scenario.expenses, scenario.participants.length);
        const duration = this.calculateDuration(scenario.startDate, scenario.endDate);
        const distribution = this.getExpenseDistribution(scenario.expenses);

        let report = `BUSINESS CASE: ${scenario.name}\n`;
        report += `${'='.repeat(50)}\n\n`;
        report += `Destinazione: ${scenario.destination}\n`;
        
        if (scenario.startDate && scenario.endDate) {
            report += `Periodo: ${this.formatDate(scenario.startDate)} - ${this.formatDate(scenario.endDate)} (${duration} giorni)\n`;
        }
        
        report += `Partecipanti: ${scenario.participants.length}\n`;
        if (scenario.participants.length > 0) {
            report += `  - ${scenario.participants.join('\n  - ')}\n`;
        }
        
        report += `\nSPESE:\n`;
        report += `${'-'.repeat(50)}\n`;
        
        const labels = this.getCategoryLabels();
        for (const [category, data] of Object.entries(distribution)) {
            if (data.amount > 0) {
                report += `${labels[category]}: ${this.formatCurrency(data.amount)} (${data.percentage.toFixed(1)}%)\n`;
            }
        }
        
        report += `${'-'.repeat(50)}\n`;
        report += `TOTALE: ${this.formatCurrency(total)}\n`;
        report += `Costo per partecipante: ${this.formatCurrency(costPerPerson)}\n`;
        
        if (scenario.notes) {
            report += `\nNOTE:\n${scenario.notes}\n`;
        }
        
        return report;
    },

    // Cerca scenari
    searchScenarios(query) {
        const scenarios = StorageManager.getScenarios();
        const lowerQuery = query.toLowerCase();
        
        return scenarios.filter(s => 
            s.name.toLowerCase().includes(lowerQuery) ||
            s.destination.toLowerCase().includes(lowerQuery) ||
            s.participants.some(p => p.toLowerCase().includes(lowerQuery))
        );
    },

    // Ordina scenari
    sortScenarios(scenarios, sortBy = 'date', order = 'desc') {
        const sorted = [...scenarios];
        
        sorted.sort((a, b) => {
            let compareValue = 0;
            
            switch (sortBy) {
                case 'name':
                    compareValue = a.name.localeCompare(b.name);
                    break;
                case 'destination':
                    compareValue = a.destination.localeCompare(b.destination);
                    break;
                case 'cost':
                    compareValue = this.calculateTotal(a.expenses) - this.calculateTotal(b.expenses);
                    break;
                case 'participants':
                    compareValue = a.participants.length - b.participants.length;
                    break;
                case 'date':
                default:
                    compareValue = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
                    break;
            }
            
            return order === 'asc' ? compareValue : -compareValue;
        });
        
        return sorted;
    },

    // Filtra scenari per data
    filterByDateRange(scenarios, startDate, endDate) {
        return scenarios.filter(s => {
            if (!s.startDate) return false;
            const scenarioDate = new Date(s.startDate);
            const start = startDate ? new Date(startDate) : new Date(0);
            const end = endDate ? new Date(endDate) : new Date();
            return scenarioDate >= start && scenarioDate <= end;
        });
    },

    // Filtra scenari per range di costo
    filterByCostRange(scenarios, minCost, maxCost) {
        return scenarios.filter(s => {
            const total = this.calculateTotal(s.expenses);
            return total >= (minCost || 0) && total <= (maxCost || Infinity);
        });
    }
};

// Made with Bob
