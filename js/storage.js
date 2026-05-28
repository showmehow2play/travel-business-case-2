// ===== Storage Manager =====
// Gestisce il salvataggio e recupero dei dati dal localStorage

const StorageManager = {
    STORAGE_KEY: 'travelBusinessCase',
    BACKUP_KEY: 'travelBusinessCase_backup',

    // Inizializza lo storage
    async init() {
        console.log('🔄 Inizializzazione StorageManager...');
        
        // Se Supabase è disponibile, prova a sincronizzare i dati
        if (window.SupabaseStorage && window.SupabaseStorage.isAvailable()) {
            console.log('☁️ Supabase disponibile, sincronizzazione dati...');
            try {
                const synced = await window.SupabaseStorage.syncFromSupabase();
                if (synced) {
                    console.log('✅ Dati sincronizzati da Supabase');
                    
                    // Verifica se ci sono dati dopo la sincronizzazione
                    const existingData = await this.getData();
                    
                    // Se ancora non ci sono dati, carica i dati di esempio
                    if (!existingData || (existingData.scenarios.length === 0 && existingData.actuals.length === 0)) {
                        console.log('📦 Nessun dato su Supabase, caricamento dati di esempio...');
                        
                        if (typeof SampleData !== 'undefined') {
                            await this.saveData({
                                scenarios: SampleData.scenarios || [],
                                actuals: SampleData.actuals || []
                            });
                            
                            // Carica anche i partecipanti di esempio nell'anagrafica
                            if (typeof participantsRegistry !== 'undefined' && SampleData.participants) {
                                localStorage.setItem('participants_registry', JSON.stringify(SampleData.participants));
                            }
                            
                            console.log('✅ Dati di esempio caricati con successo!');
                        }
                    } else {
                        console.log(`✅ Dati caricati: ${existingData.scenarios.length} scenari, ${existingData.actuals.length} consuntivi`);
                    }
                    
                    // Backup automatico ogni 5 minuti
                    setInterval(() => this.createBackup(), 5 * 60 * 1000);
                    return;
                }
            } catch (error) {
                console.warn('⚠️ Errore sincronizzazione da Supabase, uso localStorage:', error);
            }
        }
        
        // Fallback: usa localStorage
        const existingData = await this.getData();
        
        // Se non ci sono dati, carica i dati di esempio
        if (!existingData || (existingData.scenarios.length === 0 && existingData.actuals.length === 0)) {
            console.log('📦 Caricamento dati di esempio...');
            
            // Verifica se SampleData è disponibile
            if (typeof SampleData !== 'undefined') {
                await this.saveData({
                    scenarios: SampleData.scenarios || [],
                    actuals: SampleData.actuals || []
                });
                
                // Carica anche i partecipanti di esempio nell'anagrafica
                if (typeof participantsRegistry !== 'undefined' && SampleData.participants) {
                    localStorage.setItem('participants_registry', JSON.stringify(SampleData.participants));
                }
                
                console.log('✅ Dati di esempio caricati con successo!');
            } else {
                // Se SampleData non è disponibile, inizializza con dati vuoti
                await this.saveData({ scenarios: [], actuals: [] });
            }
        }
        
        // Backup automatico ogni 5 minuti
        setInterval(() => this.createBackup(), 5 * 60 * 1000);
    },

    // Ottieni tutti i dati (ora da Supabase, localStorage solo come cache)
    async getData() {
        try {
            // Se Supabase è disponibile, usa quello come fonte di verità
            if (window.SupabaseStorage && window.SupabaseStorage.isAvailable()) {
                console.log('📥 Caricamento dati da Supabase...');
                const synced = await window.SupabaseStorage.syncFromSupabase();
                if (synced) {
                    // Leggi da localStorage (appena aggiornato da Supabase)
                    const data = localStorage.getItem(this.STORAGE_KEY);
                    const parsed = data ? JSON.parse(data) : null;
                    
                    if (parsed) {
                        console.log(`✅ Dati caricati: ${parsed.scenarios?.length || 0} scenari, ${parsed.actuals?.length || 0} consuntivi`);
                        return parsed;
                    }
                }
            }
            
            // Fallback a localStorage
            const data = localStorage.getItem(this.STORAGE_KEY);
            const parsed = data ? JSON.parse(data) : null;

            if (!parsed) {
                return { scenarios: [], actuals: [] };
            }

            // Assicura che esistano entrambi gli array
            if (!Array.isArray(parsed.scenarios)) {
                parsed.scenarios = [];
            }
            if (!Array.isArray(parsed.actuals)) {
                parsed.actuals = [];
            }

            return parsed;
        } catch (error) {
            console.error('Errore nel recupero dei dati:', error);
            return { scenarios: [], actuals: [] };
        }
    },

    // Salva i dati
    async saveData(data) {
        try {
            // Salva sempre in localStorage
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            console.log('💾 Dati salvati in localStorage');
            
            // Se Supabase è disponibile, salva anche lì
            if (window.SupabaseStorage && window.SupabaseStorage.isAvailable()) {
                console.log('☁️ Salvataggio su Supabase...');
                
                // Salva il blob completo nella tabella app_data
                await window.SupabaseStorage.setItem(this.STORAGE_KEY, data);
                
                // Salva anche i singoli consuntivi nella tabella actuals
                if (data.actuals && Array.isArray(data.actuals)) {
                    for (const actual of data.actuals) {
                        await window.SupabaseStorage.saveActual(actual);
                    }
                    console.log(`✅ ${data.actuals.length} consuntivi salvati su Supabase`);
                }
                
                // Salva anche i singoli scenari nella tabella scenarios
                if (data.scenarios && Array.isArray(data.scenarios)) {
                    for (const scenario of data.scenarios) {
                        await window.SupabaseStorage.saveScenario(scenario);
                    }
                    console.log(`✅ ${data.scenarios.length} scenari salvati su Supabase`);
                }
            }
            
            return true;
        } catch (error) {
            console.error('Errore nel salvataggio dei dati:', error);
            return false;
        }
    },

    // Ottieni tutti gli scenari (sempre da Supabase)
    async getScenarios() {
        const data = await this.getData();
        return data ? data.scenarios : [];
    },

    // Salva gli scenari
    async saveScenarios(scenarios) {
        if (!Array.isArray(scenarios)) {
            console.error('Tentativo di salvare scenari in formato non valido:', scenarios);
            return false;
        }

        const data = await this.getData() || { scenarios: [], actuals: [] };
        data.scenarios = scenarios;
        return this.saveData(data);
    },

    // Aggiungi uno scenario
    async addScenario(scenario) {
        const scenarios = await this.getScenarios();
        const newScenario = {
            ...scenario,
            id: this.generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        scenarios.push(newScenario);
        const saved = await this.saveScenarios(scenarios);

        if (!saved) {
            console.error('Errore nel salvataggio del nuovo scenario');
            return null;
        }

        // Salva anche su Supabase se disponibile
        if (window.SupabaseStorage && window.SupabaseStorage.isAvailable()) {
            await window.SupabaseStorage.saveScenario(newScenario);
        }

        console.log('Scenario salvato correttamente:', newScenario);
        return newScenario;
    },

    // Aggiorna uno scenario
    async updateScenario(id, updates) {
        const scenarios = await this.getScenarios();
        const index = scenarios.findIndex(s => s.id === id);
        if (index !== -1) {
            scenarios[index] = {
                ...scenarios[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            await this.saveScenarios(scenarios);
            
            // Salva anche su Supabase se disponibile
            if (window.SupabaseStorage && window.SupabaseStorage.isAvailable()) {
                await window.SupabaseStorage.saveScenario(scenarios[index]);
            }
            
            return scenarios[index];
        }
        return null;
    },

    // Elimina uno scenario
    async deleteScenario(id) {
        const scenarios = await this.getScenarios();
        const filtered = scenarios.filter(s => s.id !== id);
        await this.saveScenarios(filtered);
        
        // Elimina anche da Supabase se disponibile
        if (window.SupabaseStorage && window.SupabaseStorage.isAvailable()) {
            await window.SupabaseStorage.deleteScenario(id);
        }
        
        return filtered.length < scenarios.length;
    },

    // Ottieni uno scenario per ID
    async getScenario(id) {
        const scenarios = await this.getScenarios();
        return scenarios.find(s => s.id === id);
    },

    // Duplica uno scenario
    async duplicateScenario(id) {
        const scenario = await this.getScenario(id);
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

    // ===== Gestione Consuntivi (Actuals) =====

    // Ottieni tutti i consuntivi (sempre da Supabase)
    async getActuals() {
        const data = await this.getData();
        return data ? (data.actuals || []) : [];
    },

    // Salva i consuntivi
    async saveActuals(actuals) {
        if (!Array.isArray(actuals)) {
            console.error('Tentativo di salvare consuntivi in formato non valido:', actuals);
            return false;
        }

        const data = await this.getData() || { scenarios: [], actuals: [] };
        data.actuals = actuals;
        return this.saveData(data);
    },

    // Aggiungi un consuntivo
    async addActual(actual) {
        const actuals = await this.getActuals();
        const newActual = {
            ...actual,
            id: this.generateId(),
            type: 'actual',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        actuals.push(newActual);
        const saved = await this.saveActuals(actuals);

        if (!saved) {
            console.error('Errore nel salvataggio del nuovo consuntivo');
            return null;
        }

        // Salva anche su Supabase se disponibile
        if (window.SupabaseStorage && window.SupabaseStorage.isAvailable()) {
            await window.SupabaseStorage.saveActual(newActual);
        }

        console.log('Consuntivo salvato correttamente:', newActual);
        return newActual;
    },

    // Aggiorna un consuntivo
    async updateActual(id, updates) {
        const actuals = await this.getActuals();
        const index = actuals.findIndex(a => a.id === id);
        if (index !== -1) {
            actuals[index] = {
                ...actuals[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            await this.saveActuals(actuals);
            
            // Salva anche su Supabase se disponibile
            if (window.SupabaseStorage && window.SupabaseStorage.isAvailable()) {
                await window.SupabaseStorage.saveActual(actuals[index]);
            }
            
            return actuals[index];
        }
        return null;
    },

    // Elimina un consuntivo
    async deleteActual(id) {
        const actuals = await this.getActuals();
        const filtered = actuals.filter(a => a.id !== id);
        await this.saveActuals(filtered);
        
        // Elimina anche da Supabase se disponibile
        if (window.SupabaseStorage && window.SupabaseStorage.isAvailable()) {
            await window.SupabaseStorage.deleteActual(id);
        }
        
        return filtered.length < actuals.length;
    },

    // Ottieni un consuntivo per ID
    async getActual(id) {
        const actuals = await this.getActuals();
        return actuals.find(a => a.id === id);
    },

    // Duplica un consuntivo
    async duplicateActual(id) {
        const actual = await this.getActual(id);
        if (actual) {
            const duplicate = {
                ...actual,
                name: `${actual.name} (Copia)`,
                id: undefined,
                createdAt: undefined,
                updatedAt: undefined
            };
            return this.addActual(duplicate);
        }
        return null;
    },

    // Genera un ID univoco
    generateId() {
        return 'scenario_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Crea un backup
    async createBackup() {
        const data = await this.getData();
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
    async exportToJSON() {
        const data = await this.getData();
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
    async importFromJSON(jsonData) {
        try {
            // Valida i dati
            if (!jsonData.scenarios || !Array.isArray(jsonData.scenarios)) {
                throw new Error('Formato dati non valido');
            }

            // Opzionale: merge con dati esistenti o sostituzione
            const currentScenarios = await this.getScenarios();
            const importedScenarios = jsonData.scenarios.map(s => ({
                ...s,
                id: this.generateId(), // Genera nuovi ID per evitare conflitti
                importedAt: new Date().toISOString()
            }));

            const allScenarios = [...currentScenarios, ...importedScenarios];
            await this.saveScenarios(allScenarios);
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
    async getStats() {
        const scenarios = await this.getScenarios();
        
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

// NOTA: L'inizializzazione viene gestita da app.js per garantire
// che la sincronizzazione Supabase sia completata prima di caricare l'interfaccia

// Made with Bob
