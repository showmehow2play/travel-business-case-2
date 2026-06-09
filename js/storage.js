// ===== Storage Manager - SOLO SUPABASE =====
// Gestisce il salvataggio e recupero dei dati ESCLUSIVAMENTE da Supabase
// localStorage è usato SOLO come cache temporanea per performance

const StorageManager = {
    STORAGE_KEY: 'travelBusinessCase',
    CACHE_KEY: 'travelBusinessCase_cache', // Solo per cache locale
    cacheData: null, // Cache in memoria

    // Inizializza lo storage
    async init() {
        console.log('🔄 Inizializzazione StorageManager (SOLO SUPABASE)...');
        
        // Verifica che Supabase sia disponibile
        if (!window.SupabaseStorage || !window.SupabaseStorage.isAvailable()) {
            console.error('❌ ERRORE: Supabase non è disponibile! L\'app richiede Supabase per funzionare.');
            alert('Errore: Supabase non configurato. L\'applicazione richiede Supabase per funzionare.');
            return;
        }

        console.log('✅ Supabase disponibile');
        
        // Carica i dati da Supabase
        try {
            await this.loadFromSupabase();
            console.log('✅ Dati caricati da Supabase');
        } catch (error) {
            console.error('❌ Errore caricamento da Supabase:', error);
            
            // Se non ci sono dati, carica i dati di esempio
            const data = await this.getData();
            if (!data || (data.scenarios.length === 0 && data.actuals.length === 0)) {
                console.log('📦 Caricamento dati di esempio...');
                await this.loadSampleData();
            }
        }
    },

    // Carica i dati da Supabase
    async loadFromSupabase() {
        if (!window.SupabaseStorage || !window.SupabaseStorage.isAvailable()) {
            throw new Error('Supabase non disponibile');
        }

        console.log('📥 Caricamento dati da Supabase...');
        
        // Carica scenari
        const scenarios = await window.SupabaseStorage.getAllScenarios();
        console.log(`📋 ${scenarios.length} scenari caricati`);
        
        // Carica consuntivi
        const actuals = await window.SupabaseStorage.getAllActuals();
        console.log(`💰 ${actuals.length} consuntivi caricati`);
        
        // Aggiorna cache in memoria
        this.cacheData = {
            scenarios: scenarios || [],
            actuals: actuals || []
        };
        
        // Aggiorna cache localStorage (solo per performance)
        try {
            localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.cacheData));
        } catch (e) {
            console.warn('⚠️ Impossibile aggiornare cache localStorage:', e);
        }
        
        return this.cacheData;
    },

    // Carica dati di esempio
    async loadSampleData() {
        if (typeof SampleData === 'undefined') {
            console.warn('⚠️ SampleData non disponibile');
            return;
        }

        console.log('📦 Caricamento dati di esempio su Supabase...');
        
        // Salva scenari di esempio
        if (SampleData.scenarios && Array.isArray(SampleData.scenarios)) {
            for (const scenario of SampleData.scenarios) {
                await this.addScenario(scenario);
            }
            console.log(`✅ ${SampleData.scenarios.length} scenari di esempio caricati`);
        }
        
        // Salva consuntivi di esempio
        if (SampleData.actuals && Array.isArray(SampleData.actuals)) {
            for (const actual of SampleData.actuals) {
                await this.addActual(actual);
            }
            console.log(`✅ ${SampleData.actuals.length} consuntivi di esempio caricati`);
        }
        
        // Ricarica i dati
        await this.loadFromSupabase();
    },

    // Ottieni tutti i dati (da cache o Supabase)
    async getData() {
        // Se abbiamo cache in memoria, usala
        if (this.cacheData) {
            return this.cacheData;
        }
        
        // Altrimenti carica da Supabase
        try {
            return await this.loadFromSupabase();
        } catch (error) {
            console.error('Errore nel recupero dei dati:', error);
            return { scenarios: [], actuals: [] };
        }
    },

    // Invalida la cache (forza ricaricamento da Supabase)
    async invalidateCache() {
        this.cacheData = null;
        try {
            localStorage.removeItem(this.CACHE_KEY);
        } catch (e) {
            console.warn('⚠️ Impossibile rimuovere cache localStorage:', e);
        }
        return await this.loadFromSupabase();
    },

    // ===== SCENARI =====

    // Ottieni tutti gli scenari
    async getScenarios() {
        const data = await this.getData();
        return data.scenarios || [];
    },

    // Ottieni uno scenario per ID
    async getScenario(id) {
        if (!window.SupabaseStorage || !window.SupabaseStorage.isAvailable()) {
            const scenarios = await this.getScenarios();
            return scenarios.find(s => s.id === id);
        }
        
        return await window.SupabaseStorage.getScenario(id);
    },

    // Aggiungi uno scenario
    async addScenario(scenario) {
        if (!window.SupabaseStorage || !window.SupabaseStorage.isAvailable()) {
            throw new Error('Supabase non disponibile');
        }

        const newScenario = {
            ...scenario,
            id: scenario.id || this.generateId(),
            createdAt: scenario.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Salva su Supabase
        const saved = await window.SupabaseStorage.saveScenario(newScenario);
        
        if (saved) {
            // Invalida cache per ricaricare
            await this.invalidateCache();
            console.log('✅ Scenario salvato su Supabase:', newScenario.name);
            return newScenario;
        }
        
        throw new Error('Errore nel salvataggio dello scenario');
    },

    // Aggiorna uno scenario
    async updateScenario(id, updates) {
        if (!window.SupabaseStorage || !window.SupabaseStorage.isAvailable()) {
            throw new Error('Supabase non disponibile');
        }

        const scenario = await this.getScenario(id);
        if (!scenario) {
            throw new Error('Scenario non trovato');
        }

        const updatedScenario = {
            ...scenario,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        // Salva su Supabase
        const saved = await window.SupabaseStorage.saveScenario(updatedScenario);
        
        if (saved) {
            // Invalida cache per ricaricare
            await this.invalidateCache();
            console.log('✅ Scenario aggiornato su Supabase:', updatedScenario.name);
            return updatedScenario;
        }
        
        throw new Error('Errore nell\'aggiornamento dello scenario');
    },

    // Elimina uno scenario
    async deleteScenario(id) {
        if (!window.SupabaseStorage || !window.SupabaseStorage.isAvailable()) {
            throw new Error('Supabase non disponibile');
        }

        const deleted = await window.SupabaseStorage.deleteScenario(id);
        
        if (deleted) {
            // Invalida cache per ricaricare
            await this.invalidateCache();
            console.log('✅ Scenario eliminato da Supabase');
            return true;
        }
        
        return false;
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

    // ===== CONSUNTIVI (ACTUALS) =====

    // Ottieni tutti i consuntivi
    async getActuals() {
        const data = await this.getData();
        return data.actuals || [];
    },

    // Ottieni un consuntivo per ID
    async getActual(id) {
        if (!window.SupabaseStorage || !window.SupabaseStorage.isAvailable()) {
            const actuals = await this.getActuals();
            return actuals.find(a => a.id === id);
        }
        
        return await window.SupabaseStorage.getActual(id);
    },

    // Aggiungi un consuntivo
    async addActual(actual) {
        if (!window.SupabaseStorage || !window.SupabaseStorage.isAvailable()) {
            throw new Error('Supabase non disponibile');
        }

        const newActual = {
            ...actual,
            id: actual.id || this.generateId(),
            type: 'actual',
            createdAt: actual.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Salva su Supabase
        const saved = await window.SupabaseStorage.saveActual(newActual);
        
        if (saved) {
            // Invalida cache per ricaricare
            await this.invalidateCache();
            console.log('✅ Consuntivo salvato su Supabase:', newActual.name);
            return newActual;
        }
        
        throw new Error('Errore nel salvataggio del consuntivo');
    },

    // Aggiorna un consuntivo
    async updateActual(id, updates) {
        if (!window.SupabaseStorage || !window.SupabaseStorage.isAvailable()) {
            throw new Error('Supabase non disponibile');
        }

        const actual = await this.getActual(id);
        if (!actual) {
            throw new Error('Consuntivo non trovato');
        }

        const updatedActual = {
            ...actual,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        // Salva su Supabase
        const saved = await window.SupabaseStorage.saveActual(updatedActual);
        
        if (saved) {
            // Invalida cache per ricaricare
            await this.invalidateCache();
            console.log('✅ Consuntivo aggiornato su Supabase:', updatedActual.name);
            return updatedActual;
        }
        
        throw new Error('Errore nell\'aggiornamento del consuntivo');
    },

    // Elimina un consuntivo
    async deleteActual(id) {
        if (!window.SupabaseStorage || !window.SupabaseStorage.isAvailable()) {
            throw new Error('Supabase non disponibile');
        }

        const deleted = await window.SupabaseStorage.deleteActual(id);
        
        if (deleted) {
            // Invalida cache per ricaricare
            await this.invalidateCache();
            console.log('✅ Consuntivo eliminato da Supabase');
            return true;
        }
        
        return false;
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

    // ===== UTILITY =====

    // Genera un ID univoco
    generateId() {
        return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
    },

    // Esporta i dati in JSON (per backup)
    async exportToJSON() {
        const data = await this.getData();
        if (data) {
            return {
                ...data,
                exportDate: new Date().toISOString(),
                version: '2.0',
                source: 'supabase'
            };
        }
        return null;
    },

    // Importa dati da JSON (carica su Supabase)
    async importFromJSON(jsonData) {
        try {
            if (!jsonData.scenarios || !Array.isArray(jsonData.scenarios)) {
                throw new Error('Formato dati non valido');
            }

            // Importa scenari
            for (const scenario of jsonData.scenarios) {
                await this.addScenario({
                    ...scenario,
                    id: undefined, // Genera nuovo ID
                    importedAt: new Date().toISOString()
                });
            }

            // Importa consuntivi se presenti
            if (jsonData.actuals && Array.isArray(jsonData.actuals)) {
                for (const actual of jsonData.actuals) {
                    await this.addActual({
                        ...actual,
                        id: undefined, // Genera nuovo ID
                        importedAt: new Date().toISOString()
                    });
                }
            }

            // Ricarica i dati
            await this.invalidateCache();
            
            return true;
        } catch (error) {
            console.error('Errore nell\'importazione:', error);
            return false;
        }
    },

    // Cancella tutti i dati (ATTENZIONE: elimina tutto da Supabase!)
    async clearAll() {
        if (!confirm('ATTENZIONE: Questa operazione eliminerà TUTTI i dati da Supabase in modo permanente. Sei sicuro?')) {
            return false;
        }

        try {
            // Elimina tutti gli scenari
            const scenarios = await this.getScenarios();
            for (const scenario of scenarios) {
                await this.deleteScenario(scenario.id);
            }

            // Elimina tutti i consuntivi
            const actuals = await this.getActuals();
            for (const actual of actuals) {
                await this.deleteActual(actual.id);
            }

            // Invalida cache
            await this.invalidateCache();
            
            console.log('✅ Tutti i dati eliminati da Supabase');
            return true;
        } catch (error) {
            console.error('Errore nella cancellazione dei dati:', error);
            return false;
        }
    }
};

// Made with Bob - SUPABASE ONLY VERSION
