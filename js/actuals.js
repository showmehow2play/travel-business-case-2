// ===== Actuals Manager =====
// Gestisce i consuntivi di viaggio con spese dettagliate

const ActualsManager = {
    currentActualId: null,
    expenses: [],

    // Macro categorie disponibili
    categories: [
        { value: 'generali', label: 'Generali', icon: '📦' },
        { value: 'viaggio', label: 'Viaggio', icon: '✈️' },
        { value: 'auto', label: 'Auto', icon: '🚗' },
        { value: 'attivita', label: 'Attività', icon: '🎭' },
        { value: 'altro', label: 'Altro', icon: '📝' }
    ],

    // Crea un consuntivo vuoto
    createEmptyActual() {
        return {
            name: '',
            destination: '',
            startDate: '',
            endDate: '',
            participants: [],
            expenses: [],
            notes: '',
            type: 'actual' // Distingue dai preventivi
        };
    },

    // Crea una spesa vuota
    createEmptyExpense() {
        return {
            id: this.generateExpenseId(),
            category: 'generali',
            description: '',
            amount: 0,
            paidBy: '',
            notes: ''
        };
    },

    // Genera ID univoco per spesa
    generateExpenseId() {
        return 'expense_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Calcola il totale delle spese
    calculateTotal(expenses) {
        if (!Array.isArray(expenses)) return 0;
        return expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    },

    // Calcola il costo per partecipante
    calculateCostPerPerson(expenses, participantsCount) {
        if (participantsCount === 0) return 0;
        const total = this.calculateTotal(expenses);
        return total / participantsCount;
    },

    // Raggruppa spese per categoria
    groupByCategory(expenses) {
        const grouped = {};
        
        this.categories.forEach(cat => {
            grouped[cat.value] = {
                label: cat.label,
                icon: cat.icon,
                expenses: [],
                total: 0
            };
        });

        expenses.forEach(exp => {
            const category = exp.category || 'altro';
            if (grouped[category]) {
                grouped[category].expenses.push(exp);
                grouped[category].total += parseFloat(exp.amount) || 0;
            }
        });

        return grouped;
    },

    // Ottieni statistiche per categoria
    getCategoryStats(expenses) {
        const total = this.calculateTotal(expenses);
        const grouped = this.groupByCategory(expenses);
        const stats = [];

        Object.entries(grouped).forEach(([key, data]) => {
            if (data.total > 0) {
                stats.push({
                    category: key,
                    label: data.label,
                    icon: data.icon,
                    total: data.total,
                    count: data.expenses.length,
                    percentage: total > 0 ? (data.total / total) * 100 : 0
                });
            }
        });

        return stats.sort((a, b) => b.total - a.total);
    },

    // Formatta un numero come valuta
    formatCurrency(amount) {
        try {
            if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
                return new Intl.NumberFormat('it-IT', {
                    style: 'currency',
                    currency: 'EUR'
                }).format(amount);
            } else {
                const formatted = parseFloat(amount).toFixed(2).replace('.', ',');
                return `€${formatted}`;
            }
        } catch (error) {
            return `€${parseFloat(amount).toFixed(2)}`;
        }
    },

    // Formatta una data
    formatDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
                return new Intl.DateTimeFormat('it-IT', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }).format(date);
            } else {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            }
        } catch (error) {
            return dateString;
        }
    },

    // Calcola la durata del viaggio
    calculateDuration(startDate, endDate) {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays + 1;
    },

    // Valida un consuntivo
    validateActual(actual) {
        const errors = [];

        if (!actual.name || actual.name.trim() === '') {
            errors.push('Il nome del consuntivo è obbligatorio');
        }

        if (!actual.destination || actual.destination.trim() === '') {
            errors.push('La destinazione è obbligatoria');
        }

        if (actual.startDate && actual.endDate) {
            const start = new Date(actual.startDate);
            const end = new Date(actual.endDate);
            if (end < start) {
                errors.push('La data di fine deve essere successiva alla data di inizio');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // Genera report testuale
    generateReport(actual) {
        const total = this.calculateTotal(actual.expenses);
        const costPerPerson = this.calculateCostPerPerson(actual.expenses, actual.participants.length);
        const duration = this.calculateDuration(actual.startDate, actual.endDate);
        const categoryStats = this.getCategoryStats(actual.expenses);

        let report = `CONSUNTIVO: ${actual.name}\n`;
        report += `${'='.repeat(50)}\n\n`;
        report += `Destinazione: ${actual.destination}\n`;
        
        if (actual.startDate && actual.endDate) {
            report += `Periodo: ${this.formatDate(actual.startDate)} - ${this.formatDate(actual.endDate)} (${duration} giorni)\n`;
        }
        
        report += `Partecipanti: ${actual.participants.length}\n`;
        if (actual.participants.length > 0) {
            report += `  - ${actual.participants.join('\n  - ')}\n`;
        }
        
        report += `\nSPESE PER CATEGORIA:\n`;
        report += `${'-'.repeat(50)}\n`;
        
        categoryStats.forEach(stat => {
            report += `${stat.icon} ${stat.label}: ${this.formatCurrency(stat.total)} (${stat.count} voci, ${stat.percentage.toFixed(1)}%)\n`;
        });
        
        report += `\nDETTAGLIO SPESE:\n`;
        report += `${'-'.repeat(50)}\n`;
        
        const grouped = this.groupByCategory(actual.expenses);
        Object.entries(grouped).forEach(([key, data]) => {
            if (data.expenses.length > 0) {
                report += `\n${data.icon} ${data.label.toUpperCase()}:\n`;
                data.expenses.forEach(exp => {
                    report += `  • ${exp.description}: ${this.formatCurrency(exp.amount)}`;
                    if (exp.paidBy) report += ` (pagato da: ${exp.paidBy})`;
                    if (exp.notes) report += `\n    Note: ${exp.notes}`;
                    report += `\n`;
                });
            }
        });
        
        report += `\n${'-'.repeat(50)}\n`;
        report += `TOTALE: ${this.formatCurrency(total)}\n`;
        report += `Costo per partecipante: ${this.formatCurrency(costPerPerson)}\n`;
        
        if (actual.notes) {
            report += `\nNOTE GENERALI:\n${actual.notes}\n`;
        }
        
        return report;
    },

    // Confronta preventivo con consuntivo
    compareWithScenario(actual, scenario) {
        const actualTotal = this.calculateTotal(actual.expenses);
        const scenarioTotal = ScenarioManager.calculateTotal(scenario.expenses);
        const difference = actualTotal - scenarioTotal;
        const percentageDiff = scenarioTotal > 0 ? (difference / scenarioTotal) * 100 : 0;

        return {
            actual: {
                name: actual.name,
                total: actualTotal,
                costPerPerson: this.calculateCostPerPerson(actual.expenses, actual.participants.length)
            },
            scenario: {
                name: scenario.name,
                total: scenarioTotal,
                costPerPerson: ScenarioManager.calculateCostPerPerson(scenario.expenses, scenario.participants.length)
            },
            difference: {
                amount: difference,
                percentage: percentageDiff,
                isOver: difference > 0,
                isUnder: difference < 0
            }
        };
    }
};

// Made with Bob