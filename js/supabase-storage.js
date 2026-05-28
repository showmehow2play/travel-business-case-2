// ===== Supabase Storage Manager =====
// Gestisce il salvataggio e sincronizzazione dei dati con Supabase

const SupabaseStorage = {
    
    // Verifica se Supabase è disponibile
    isAvailable() {
        return window.isSupabaseEnabled && window.supabaseClient !== null;
    },

    // Salva un valore (chiave-valore generico)
    async setItem(key, value) {
        // Salva sempre in localStorage come backup
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Errore salvataggio localStorage:', e);
        }

        // Se Supabase è disponibile, salva anche lì
        if (this.isAvailable()) {
            try {
                const { error } = await window.supabaseClient
                    .from('app_data')
                    .upsert({
                        key: key,
                        value: value,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'key'
                    });

                if (error) {
                    console.error('Errore salvataggio Supabase:', error);
                    return false;
                }
                
                return true;
            } catch (error) {
                console.error('Errore salvataggio Supabase:', error);
                return false;
            }
        }
        
        return true; // localStorage salvato con successo
    },

    // Recupera un valore
    async getItem(key) {
        // Se Supabase è disponibile, prova a recuperare da lì
        if (this.isAvailable()) {
            try {
                const { data, error } = await window.supabaseClient
                    .from('app_data')
                    .select('value')
                    .eq('key', key)
                    .single();

                if (!error && data) {
                    // Aggiorna anche localStorage
                    try {
                        localStorage.setItem(key, JSON.stringify(data.value));
                    } catch (e) {
                        console.error('Errore aggiornamento localStorage:', e);
                    }
                    return data.value;
                }
            } catch (error) {
                console.warn('Errore recupero da Supabase, uso localStorage:', error);
            }
        }

        // Fallback a localStorage
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Errore lettura localStorage:', e);
            return null;
        }
    },

    // Rimuovi un valore
    async removeItem(key) {
        // Rimuovi da localStorage
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Errore rimozione localStorage:', e);
        }

        // Se Supabase è disponibile, rimuovi anche da lì
        if (this.isAvailable()) {
            try {
                const { error } = await window.supabaseClient
                    .from('app_data')
                    .delete()
                    .eq('key', key);

                if (error) {
                    console.error('Errore rimozione Supabase:', error);
                    return false;
                }
                
                return true;
            } catch (error) {
                console.error('Errore rimozione Supabase:', error);
                return false;
            }
        }
        
        return true;
    },

    // Salva uno scenario
    async saveScenario(scenario) {
        // Salva in localStorage
        const data = await this.getItem('travelBusinessCase') || { scenarios: [], actuals: [] };
        const index = data.scenarios.findIndex(s => s.id === scenario.id);
        
        if (index >= 0) {
            data.scenarios[index] = scenario;
        } else {
            data.scenarios.push(scenario);
        }
        
        await this.setItem('travelBusinessCase', data);

        // Se Supabase è disponibile, salva anche lì
        if (this.isAvailable()) {
            try {
                const { error } = await window.supabaseClient
                    .from('scenarios')
                    .upsert({
                        id: scenario.id,
                        data: scenario,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'id'
                    });

                if (error) {
                    console.error('Errore salvataggio scenario su Supabase:', error);
                }
            } catch (error) {
                console.error('Errore salvataggio scenario su Supabase:', error);
            }
        }
    },

    // Elimina uno scenario
    async deleteScenario(scenarioId) {
        // Elimina da localStorage
        const data = await this.getItem('travelBusinessCase') || { scenarios: [], actuals: [] };
        data.scenarios = data.scenarios.filter(s => s.id !== scenarioId);
        await this.setItem('travelBusinessCase', data);

        // Se Supabase è disponibile, elimina anche da lì
        if (this.isAvailable()) {
            try {
                const { error } = await window.supabaseClient
                    .from('scenarios')
                    .delete()
                    .eq('id', scenarioId);

                if (error) {
                    console.error('Errore eliminazione scenario da Supabase:', error);
                }
            } catch (error) {
                console.error('Errore eliminazione scenario da Supabase:', error);
            }
        }
    },

    // Salva un consuntivo (actual)
    async saveActual(actual) {
        // Salva in localStorage
        const data = await this.getItem('travelBusinessCase') || { scenarios: [], actuals: [] };
        const index = data.actuals.findIndex(a => a.id === actual.id);
        
        if (index >= 0) {
            data.actuals[index] = actual;
        } else {
            data.actuals.push(actual);
        }
        
        await this.setItem('travelBusinessCase', data);

        // Se Supabase è disponibile, salva anche lì
        if (this.isAvailable()) {
            try {
                const { error } = await window.supabaseClient
                    .from('actuals')
                    .upsert({
                        id: actual.id,
                        data: actual,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'id'
                    });

                if (error) {
                    console.error('Errore salvataggio consuntivo su Supabase:', error);
                }
            } catch (error) {
                console.error('Errore salvataggio consuntivo su Supabase:', error);
            }
        }
    },

    // Elimina un consuntivo
    async deleteActual(actualId) {
        // Elimina da localStorage
        const data = await this.getItem('travelBusinessCase') || { scenarios: [], actuals: [] };
        data.actuals = data.actuals.filter(a => a.id !== actualId);
        await this.setItem('travelBusinessCase', data);

        // Se Supabase è disponibile, elimina anche da lì
        if (this.isAvailable()) {
            try {
                const { error } = await window.supabaseClient
                    .from('actuals')
                    .delete()
                    .eq('id', actualId);

                if (error) {
                    console.error('Errore eliminazione consuntivo da Supabase:', error);
                }
            } catch (error) {
                console.error('Errore eliminazione consuntivo da Supabase:', error);
            }
        }
    },

    // Salva l'anagrafica partecipanti
    async saveParticipants(participants) {
        // Salva in localStorage
        await this.setItem('participants_registry', participants);

        // Se Supabase è disponibile, salva anche lì
        if (this.isAvailable()) {
            try {
                // Elimina tutti i partecipanti esistenti
                await window.supabaseClient
                    .from('participants')
                    .delete()
                    .neq('id', '');

                // Inserisci i nuovi partecipanti
                const participantsData = participants.map(p => ({
                    id: p.id,
                    data: p,
                    updated_at: new Date().toISOString()
                }));

                const { error } = await window.supabaseClient
                    .from('participants')
                    .insert(participantsData);

                if (error) {
                    console.error('Errore salvataggio partecipanti su Supabase:', error);
                }
            } catch (error) {
                console.error('Errore salvataggio partecipanti su Supabase:', error);
            }
        }
    },

    // Recupera tutti i dati da Supabase
    async syncFromSupabase() {
        if (!this.isAvailable()) {
            console.warn('Supabase non disponibile per la sincronizzazione');
            return false;
        }

        try {
            // Recupera scenari
            const { data: scenariosData, error: scenariosError } = await window.supabaseClient
                .from('scenarios')
                .select('data');

            if (scenariosError) throw scenariosError;

            // Recupera consuntivi
            const { data: actualsData, error: actualsError } = await window.supabaseClient
                .from('actuals')
                .select('data');

            if (actualsError) throw actualsError;

            // Recupera partecipanti
            const { data: participantsData, error: participantsError } = await window.supabaseClient
                .from('participants')
                .select('data');

            if (participantsError) throw participantsError;

            // Aggiorna localStorage
            const scenarios = scenariosData ? scenariosData.map(s => s.data) : [];
            const actuals = actualsData ? actualsData.map(a => a.data) : [];
            const participants = participantsData ? participantsData.map(p => p.data) : [];

            localStorage.setItem('travelBusinessCase', JSON.stringify({ scenarios, actuals }));
            localStorage.setItem('participants_registry', JSON.stringify(participants));

            console.log('✅ Dati sincronizzati da Supabase');
            return true;

        } catch (error) {
            console.error('❌ Errore sincronizzazione da Supabase:', error);
            return false;
        }
    },

    // Carica tutti i dati locali su Supabase
    async syncToSupabase() {
        if (!this.isAvailable()) {
            console.warn('Supabase non disponibile per la sincronizzazione');
            return false;
        }

        try {
            // Recupera dati da localStorage
            const data = JSON.parse(localStorage.getItem('travelBusinessCase') || '{"scenarios":[],"actuals":[]}');
            const participants = JSON.parse(localStorage.getItem('participants_registry') || '[]');

            // Carica scenari
            if (data.scenarios && data.scenarios.length > 0) {
                const scenariosData = data.scenarios.map(s => ({
                    id: s.id,
                    data: s,
                    updated_at: new Date().toISOString()
                }));

                const { error: scenariosError } = await window.supabaseClient
                    .from('scenarios')
                    .upsert(scenariosData, { onConflict: 'id' });

                if (scenariosError) throw scenariosError;
            }

            // Carica consuntivi
            if (data.actuals && data.actuals.length > 0) {
                const actualsData = data.actuals.map(a => ({
                    id: a.id,
                    data: a,
                    updated_at: new Date().toISOString()
                }));

                const { error: actualsError } = await window.supabaseClient
                    .from('actuals')
                    .upsert(actualsData, { onConflict: 'id' });

                if (actualsError) throw actualsError;
            }

            // Carica partecipanti
            if (participants && participants.length > 0) {
                await this.saveParticipants(participants);
            }

            console.log('✅ Dati locali caricati su Supabase');
            return true;

        } catch (error) {
            console.error('❌ Errore caricamento dati su Supabase:', error);
            return false;
        }
    },

    // Sottoscrivi ai cambiamenti in tempo reale
    subscribeToChanges(callback) {
        if (!this.isAvailable()) {
            console.warn('Supabase non disponibile per le sottoscrizioni');
            return null;
        }

        // Sottoscrivi a tutte le tabelle
        const subscription = window.supabaseClient
            .channel('db-changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'scenarios' },
                () => callback('scenarios')
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'actuals' },
                () => callback('actuals')
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'participants' },
                () => callback('participants')
            )
            .subscribe();

        return subscription;
    },

    // Ottieni tutti gli scenari da Supabase
    async getAllScenarios() {
        if (!this.isAvailable()) {
            console.warn('Supabase non disponibile');
            return [];
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('scenarios')
                .select('data')
                .order('updated_at', { ascending: false });

            if (error) throw error;

            return data ? data.map(s => s.data) : [];
        } catch (error) {
            console.error('Errore recupero scenari da Supabase:', error);
            return [];
        }
    },

    // Ottieni tutti i consuntivi da Supabase
    async getAllActuals() {
        if (!this.isAvailable()) {
            console.warn('Supabase non disponibile');
            return [];
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('actuals')
                .select('data')
                .order('updated_at', { ascending: false });

            if (error) throw error;

            return data ? data.map(a => a.data) : [];
        } catch (error) {
            console.error('Errore recupero consuntivi da Supabase:', error);
            return [];
        }
    },

    // Ottieni uno scenario specifico da Supabase
    async getScenario(id) {
        if (!this.isAvailable()) {
            console.warn('Supabase non disponibile');
            return null;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('scenarios')
                .select('data')
                .eq('id', id)
                .single();

            if (error) throw error;

            return data ? data.data : null;
        } catch (error) {
            console.error('Errore recupero scenario da Supabase:', error);
            return null;
        }
    },

    // Ottieni un consuntivo specifico da Supabase
    async getActual(id) {
        if (!this.isAvailable()) {
            console.warn('Supabase non disponibile');
            return null;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('actuals')
                .select('data')
                .eq('id', id)
                .single();

            if (error) throw error;

            return data ? data.data : null;
        } catch (error) {
            console.error('Errore recupero consuntivo da Supabase:', error);
            return null;
        }
    }
};

// Esporta per uso globale
window.SupabaseStorage = SupabaseStorage;

// Made with Bob
