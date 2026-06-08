// ===== Authentication Manager =====
// Gestisce autenticazione, sessioni e permessi utente

const Auth = {
    currentUser: null,
    sessionToken: null,
    
    // Inizializza e verifica sessione
    async init() {
        const token = localStorage.getItem('session_token');
        if (!token) return false;
        
        try {
            const { data, error } = await supabaseClient
                .from('user_sessions')
                .select(`
                    *,
                    user:users(*)
                `)
                .eq('token', token)
                .gt('expires_at', new Date().toISOString())
                .single();
            
            if (error || !data) {
                this.logout();
                return false;
            }
            
            this.currentUser = data.user;
            this.sessionToken = token;
            
            // Carica gruppi utente
            await this.loadUserGroups();
            
            return true;
        } catch (error) {
            console.error('Errore verifica sessione:', error);
            return false;
        }
    },
    
    // Carica gruppi dell'utente
    async loadUserGroups() {
        if (!this.currentUser) return;
        
        const { data, error } = await supabaseClient
            .from('user_groups')
            .select(`
                *,
                group:groups(*)
            `)
            .eq('user_id', this.currentUser.id);
        
        if (!error && data) {
            this.currentUser.groups = data.map(ug => ug.group);
        }
    },
    
    // Login
    async login(email, password) {
        try {
            // Verifica credenziali usando funzione Supabase
            const { data: user, error } = await supabaseClient
                .rpc('verify_user_credentials', {
                    p_email: email,
                    p_password: password
                });
            
            if (error || !user || user.length === 0) {
                throw new Error('Credenziali non valide');
            }
            
            const userData = Array.isArray(user) ? user[0] : user;
            
            // Crea sessione
            const token = this.generateToken();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7); // 7 giorni
            
            await supabaseClient
                .from('user_sessions')
                .insert({
                    user_id: userData.id,
                    token: token,
                    expires_at: expiresAt.toISOString()
                });
            
            // Aggiorna last_login
            await supabaseClient
                .from('users')
                .update({ last_login: new Date().toISOString() })
                .eq('id', userData.id);
            
            // Salva sessione
            localStorage.setItem('session_token', token);
            this.currentUser = userData;
            this.sessionToken = token;
            
            // Carica gruppi
            await this.loadUserGroups();
            
            // Log attività
            await ActivityLogger.log('login', 'auth', null, {
                email: userData.email
            });
            
            return userData;
        } catch (error) {
            console.error('Errore login:', error);
            throw error;
        }
    },
    
    // Logout
    async logout() {
        if (this.sessionToken) {
            // Log attività prima di logout
            await ActivityLogger.log('logout', 'auth', null);
            
            await supabaseClient
                .from('user_sessions')
                .delete()
                .eq('token', this.sessionToken);
        }
        
        localStorage.removeItem('session_token');
        this.currentUser = null;
        this.sessionToken = null;
        window.location.href = 'login.html';
    },
    
    // Verifica se utente è superuser
    isSuperuser() {
        return this.currentUser?.is_superuser === true;
    },
    
    // Verifica se utente appartiene a un gruppo
    isInGroup(groupId) {
        if (!this.currentUser || !this.currentUser.groups) return false;
        return this.currentUser.groups.some(g => g.id === groupId);
    },
    
    // Ottieni gruppi utente
    getUserGroups() {
        return this.currentUser?.groups || [];
    },
    
    // Genera token casuale
    generateToken() {
        return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
    },
    
    // Richiedi login se non autenticato
    requireAuth() {
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },
    
    // Richiedi superuser
    requireSuperuser() {
        if (!this.isSuperuser()) {
            alert('Accesso negato: solo i superuser possono accedere a questa sezione');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }
};

// Made with Bob