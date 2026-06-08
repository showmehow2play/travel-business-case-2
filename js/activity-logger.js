// ===== Activity Logger =====
// Registra tutte le azioni degli utenti per il log attività

const ActivityLogger = {
    
    // Log un'azione
    async log(action, resourceType, resourceId, details = {}) {
        if (!Auth.currentUser) return;
        
        try {
            await supabaseClient
                .from('activity_log')
                .insert({
                    user_id: Auth.currentUser.id,
                    action: action,
                    resource_type: resourceType,
                    resource_id: resourceId,
                    details: details,
                    created_at: new Date().toISOString()
                });
        } catch (error) {
            console.error('Errore log attività:', error);
        }
    },
    
    // Ottieni log attività (per admin)
    async getActivityLog(filters = {}) {
        if (!Auth.isSuperuser()) {
            throw new Error('Solo i superuser possono vedere il log attività');
        }
        
        let query = supabaseClient
            .from('activity_log')
            .select(`
                *,
                user:users(full_name, email)
            `)
            .order('created_at', { ascending: false });
        
        // Applica filtri
        if (filters.userId) {
            query = query.eq('user_id', filters.userId);
        }
        
        if (filters.action) {
            query = query.eq('action', filters.action);
        }
        
        if (filters.resourceType) {
            query = query.eq('resource_type', filters.resourceType);
        }
        
        if (filters.dateFrom) {
            query = query.gte('created_at', filters.dateFrom);
        }
        
        if (filters.dateTo) {
            query = query.lte('created_at', filters.dateTo);
        }
        
        // Limita risultati
        const limit = filters.limit || 50;
        query = query.limit(limit);
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        return data || [];
    },
    
    // Formatta log per visualizzazione
    formatLogEntry(entry) {
        const actionIcons = {
            'create': '🟢',
            'update': '🟡',
            'delete': '🔴',
            'login': '🔵',
            'logout': '⚪'
        };
        
        const actionLabels = {
            'create': 'CREATO',
            'update': 'MODIFICATO',
            'delete': 'ELIMINATO',
            'login': 'LOGIN',
            'logout': 'LOGOUT'
        };
        
        return {
            icon: actionIcons[entry.action] || '⚫',
            label: actionLabels[entry.action] || entry.action.toUpperCase(),
            user: entry.user?.full_name || 'Utente sconosciuto',
            resource: this.getResourceName(entry),
            details: this.getDetailsText(entry),
            date: new Date(entry.created_at).toLocaleString('it-IT')
        };
    },
    
    // Ottieni nome risorsa
    getResourceName(entry) {
        if (entry.resource_type === 'scenario') {
            return entry.details?.scenario_name || 'Scenario';
        }
        if (entry.resource_type === 'actual') {
            return entry.details?.actual_name || 'Consuntivo';
        }
        if (entry.resource_type === 'user') {
            return entry.details?.user_name || 'Utente';
        }
        if (entry.resource_type === 'group') {
            return entry.details?.group_name || 'Gruppo';
        }
        return entry.resource_type;
    },
    
    // Ottieni testo dettagli
    getDetailsText(entry) {
        const details = entry.details || {};
        
        if (entry.action === 'update' && details.changes) {
            const changes = [];
            for (const [key, value] of Object.entries(details.changes)) {
                if (value.from !== undefined && value.to !== undefined) {
                    changes.push(`${key}: ${value.from} → ${value.to}`);
                }
            }
            return changes.join(', ');
        }
        
        if (details.description) {
            return details.description;
        }
        
        return '';
    }
};

// Made with Bob