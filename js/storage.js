// ===== Storage Manager =====
// Gestisce il salvataggio e recupero dei dati dal localStorage

const StorageManager = {
    STORAGE_KEY: 'travelBusinessCase',
    BACKUP_KEY: 'travelBusinessCase_backup',

    // Inizializza lo storage
    init() {
        if (!this.getData()) {
            this.saveData({ scenarios: [] });
        }
        // Backup automatico ogni 5 minuti
        setInterval(() => this.createBackup(), 5 * 60 * 1000);
    },

    // Ottieni tutti i dati
    getData() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            const parsed = data ? JSON.parse(data) : null;

            if (!parsed) {
                return null;
            }

            if (!Array.isArray(parsed.scenarios)) {
                console.warn('Dati storage non validi o incompleti, inizializzazione automatica eseguita');
                const normalized = { scenarios: [] };
                this.saveData(normalized);
                return normalized;
            }

            return parsed;
        } catch (error) {
            console.error('Errore nel recupero dei dati:', error);

            try {
                const normalized = { scenarios: [] };
                this.saveData(normalized);
                return normalized;
            } catch (saveError) {
                console.error('Errore nel ripristino automatico dello storage:', saveError);
                return null;
            }
        }
    },

    // Salva i dati
    saveData(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Errore nel salvataggio dei dati:', error);
            return false;
        }
    },

    // Ottieni tutti gli scenari
    getScenarios() {
        const data = this.getData();
        return data ? data.scenarios : [];
    },

    // Salva gli scenari
    saveScenarios(scenarios) {
        if (!Array.isArray(scenarios)) {
            console.error('Tentativo di salvare scenari in formato non valido:', scenarios);
            return false;
        }

        return this.saveData({ scenarios });
    },

    // Aggiungi uno scenario
    addScenario(scenario) {
        const scenarios = this.getScenarios();
        const newScenario = {
            ...scenario,
            id: this.generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        scenarios.push(newScenario);
        const saved = this.saveScenarios(scenarios);

        if (!saved) {
            console.error('Errore nel salvataggio del nuovo scenario');
            return null;
        }

        console.log('Scenario salvato correttamente:', newScenario);
        return newScenario;
    },

    // Aggiorna uno scenario
    updateScenario(id, updates) {
        const scenarios = this.getScenarios();
        const index = scenarios.findIndex(s => s.id === id);
        if (index !== -1) {
            scenarios[index] = {
                ...scenarios[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveScenarios(scenarios);
            return scenarios[index];
        }
        return null;
    },

    // Elimina uno scenario
    deleteScenario(id) {
        const scenarios = this.getScenarios();
        const filtered = scenarios.filter(s => s.id !== id);
        this.saveScenarios(filtered);
        return filtered.length < scenarios.length;
    },

    // Ottieni uno scenario per ID
    getScenario(id) {
        const scenarios = this.getScenarios();
        return scenarios.find(s => s.id === id);
    },

    // Duplica uno scenario
    duplicateScenario(id) {
        const scenario = this.getScenario(id);
        if (scenario) {
            const duplicate = {
                ...scenario,
                name: `${scenario.name} (Copia)`,
                id: undefined,
                createdAt: undefined,
                updatedAt: undefined
            };
            return this.addScenario(duplicate);
        }
        return null;
    },

    // Genera un ID univoco
    generateId() {
        return 'scenario_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Crea un backup
    createBackup() {
        const data = this.getData();
        if (data) {
            try {
                localStorage.setItem(this.BACKUP_KEY, JSON.stringify({
                    ...data,
                    backupDate: new Date().toISOString()
                }));
            } catch (error) {
                console.error('Errore nella creazione del backup:', error);
            }
        }
    },

    // Ripristina dal backup
    restoreBackup() {
        try {
            const backup = localStorage.getItem(this.BACKUP_KEY);
            if (backup) {
                const data = JSON.parse(backup);
                delete data.backupDate;
                this.saveData(data);
                return true;
            }
        } catch (error) {
            console.error('Errore nel ripristino del backup:', error);
        }
        return false;
    },

    // Esporta i dati in JSON
    exportToJSON() {
        const data = this.getData();
        if (data) {
            return {
                ...data,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
        }
        return null;
    },

    // Importa dati da JSON
    importFromJSON(jsonData) {
        try {
            // Valida i dati
            if (!jsonData.scenarios || !Array.isArray(jsonData.scenarios)) {
                throw new Error('Formato dati non valido');
            }

            // Opzionale: merge con dati esistenti o sostituzione
            const currentScenarios = this.getScenarios();
            const importedScenarios = jsonData.scenarios.map(s => ({
                ...s,
                id: this.generateId(), // Genera nuovi ID per evitare conflitti
                importedAt: new Date().toISOString()
            }));

            const allScenarios = [...currentScenarios, ...importedScenarios];
            this.saveScenarios(allScenarios);
            return true;
        } catch (error) {
            console.error('Errore nell\'importazione:', error);
            return false;
        }
    },

    // Cancella tutti i dati
    clearAll() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            localStorage.removeItem(this.BACKUP_KEY);
            this.init();
            return true;
        } catch (error) {
            console.error('Errore nella cancellazione dei dati:', error);
            return false;
        }
    },

    // Ottieni statistiche
    getStats() {
        const scenarios = this.getScenarios();
        
        if (scenarios.length === 0) {
            return {
                totalScenarios: 0,
                avgCost: 0,
                totalParticipants: 0,
                destinations: 0
            };
        }

        const totalCost = scenarios.reduce((sum, s) => sum + this.calculateTotal(s.expenses), 0);
        const allParticipants = new Set();
        const allDestinations = new Set();

        scenarios.forEach(s => {
            if (s.participants) {
                s.participants.forEach(p => allParticipants.add(p));
            }
            if (s.destination) {
                allDestinations.add(s.destination);
            }
        });

        return {
            totalScenarios: scenarios.length,
            avgCost: totalCost / scenarios.length,
            totalParticipants: allParticipants.size,
            destinations: allDestinations.size
        };
    },

    // Calcola il totale delle spese
    calculateTotal(expenses) {
        if (!expenses) return 0;
        return Object.values(expenses).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    }
};

// Inizializza lo storage al caricamento
if (typeof window !== 'undefined') {
    StorageManager.init();
}

// Made with Bob
