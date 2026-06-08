// ===== Authentication Configuration =====
// Configurazione per attivare/disattivare il sistema di autenticazione

const AuthConfig = {
    // Imposta a true per attivare l'autenticazione
    // Imposta a false per disattivare (modalità aperta)
    enabled: false,
    
    // Se true, reindirizza a login.html quando non autenticato
    // Se false, permette accesso senza autenticazione
    requireLogin: false,
    
    // Se true, filtra scenari/consuntivi per utente
    // Se false, mostra tutti i dati (come ora)
    filterByUser: false,
    
    // Se true, registra le azioni nel log attività
    // Se false, non registra nulla
    logActivity: false
};

// Funzione helper per verificare se auth è abilitata
function isAuthEnabled() {
    return AuthConfig.enabled === true;
}

// Funzione helper per verificare se login è richiesto
function isLoginRequired() {
    return AuthConfig.enabled && AuthConfig.requireLogin;
}

// Made with Bob