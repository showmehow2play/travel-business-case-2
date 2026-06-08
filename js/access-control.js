// ===== Access Control Manager =====
// Gestisce i permessi di accesso a scenari e consuntivi

const AccessControl = {
    
    // Verifica se utente può accedere a uno scenario
    async canAccessScenario(scenarioId, action = 'view') {
        if (!Auth.currentUser) return false;
        
        // Superuser ha sempre accesso
        if (Auth.isSuperuser()) return true;
        
        // Verifica se scenario è assegnato a uno dei gruppi dell'utente
        const userGroups = Auth.getUserGroups();
        if (userGroups.length === 0) return false;
        
        const groupIds = userGroups.map(g => g.id);
        
        const { data, error } = await supabaseClient
            .from('scenario_groups')
            .select('*')
            .eq('scenario_id', scenarioId)
            .in('group_id', groupIds);
        
        if (error || !data || data.length === 0) return false;
        
        // Utenti del gruppo possono fare tutto (view, edit, delete)
        return true;
    },
    
    // Verifica se utente può accedere a un consuntivo
    async canAccessActual(actualId, action = 'view') {
        if (!Auth.currentUser) return false;
        
        // Superuser ha sempre accesso
        if (Auth.isSuperuser()) return true;
        
        // Verifica se consuntivo è assegnato a uno dei gruppi dell'utente
        const userGroups = Auth.getUserGroups();
        if (userGroups.length === 0) return false;
        
        const groupIds = userGroups.map(g => g.id);
        
        const { data, error } = await supabaseClient
            .from('actual_groups')
            .select('*')
            .eq('actual_id', actualId)
            .in('group_id', groupIds);
        
        if (error || !data || data.length === 0) return false;
        
        return true;
    },
    
    // Ottieni scenari accessibili all'utente
    async getAccessibleScenarios(allScenarios) {
        if (!Auth.currentUser) return [];
        
        // Superuser vede tutto
        if (Auth.isSuperuser()) {
            return allScenarios.map(s => ({
                ...s,
                _canView: true,
                _canEdit: true,
                _canDelete: true,
                _isSuperuser: true
            }));
        }
        
        // Ottieni gruppi utente
        const userGroups = Auth.getUserGroups();
        if (userGroups.length === 0) return [];
        
        const groupIds = userGroups.map(g => g.id);
        
        // Ottieni scenari assegnati ai gruppi dell'utente
        const { data: scenarioGroups, error } = await supabaseClient
            .from('scenario_groups')
            .select('scenario_id, group_id')
            .in('group_id', groupIds);
        
        if (error || !scenarioGroups) return [];
        
        // Crea mappa scenari accessibili
        const accessibleScenarioIds = new Set(
            scenarioGroups.map(sg => sg.scenario_id)
        );
        
        // Filtra e aggiungi metadati permessi
        return allScenarios
            .filter(s => accessibleScenarioIds.has(s.id))
            .map(s => ({
                ...s,
                _canView: true,
                _canEdit: true,
                _canDelete: true,
                _isSuperuser: false
            }));
    },
    
    // Ottieni consuntivi accessibili all'utente
    async getAccessibleActuals(allActuals) {
        if (!Auth.currentUser) return [];
        
        // Superuser vede tutto
        if (Auth.isSuperuser()) {
            return allActuals.map(a => ({
                ...a,
                _canView: true,
                _canEdit: true,
                _canDelete: true,
                _isSuperuser: true
            }));
        }
        
        // Ottieni gruppi utente
        const userGroups = Auth.getUserGroups();
        if (userGroups.length === 0) return [];
        
        const groupIds = userGroups.map(g => g.id);
        
        // Ottieni consuntivi assegnati ai gruppi dell'utente
        const { data: actualGroups, error } = await supabaseClient
            .from('actual_groups')
            .select('actual_id, group_id')
            .in('group_id', groupIds);
        
        if (error || !actualGroups) return [];
        
        // Crea mappa consuntivi accessibili
        const accessibleActualIds = new Set(
            actualGroups.map(ag => ag.actual_id)
        );
        
        // Filtra e aggiungi metadati permessi
        return allActuals
            .filter(a => accessibleActualIds.has(a.id))
            .map(a => ({
                ...a,
                _canView: true,
                _canEdit: true,
                _canDelete: true,
                _isSuperuser: false
            }));
    },
    
    // Assegna scenario a gruppo (solo superuser)
    async assignScenarioToGroup(scenarioId, groupId) {
        if (!Auth.isSuperuser()) {
            throw new Error('Solo i superuser possono assegnare permessi');
        }
        
        const { error } = await supabaseClient
            .from('scenario_groups')
            .insert({
                scenario_id: scenarioId,
                group_id: groupId
            });
        
        if (error) throw error;
        
        // Log attività
        await ActivityLogger.log('assign_permission', 'scenario', scenarioId, {
            group_id: groupId,
            scenario_name: 'Scenario'
        });
    },
    
    // Rimuovi scenario da gruppo (solo superuser)
    async removeScenarioFromGroup(scenarioId, groupId) {
        if (!Auth.isSuperuser()) {
            throw new Error('Solo i superuser possono rimuovere permessi');
        }
        
        const { error } = await supabaseClient
            .from('scenario_groups')
            .delete()
            .eq('scenario_id', scenarioId)
            .eq('group_id', groupId);
        
        if (error) throw error;
        
        // Log attività
        await ActivityLogger.log('remove_permission', 'scenario', scenarioId, {
            group_id: groupId
        });
    },
    
    // Ottieni gruppi con accesso a uno scenario
    async getScenarioGroups(scenarioId) {
        const { data, error } = await supabaseClient
            .from('scenario_groups')
            .select(`
                *,
                group:groups(*)
            `)
            .eq('scenario_id', scenarioId);
        
        if (error) throw error;
        
        return data?.map(sg => sg.group) || [];
    }
};

// Made with Bob