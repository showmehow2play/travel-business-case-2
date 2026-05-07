// ===== Supabase Configuration Example =====
// Questo è un file di esempio. Copia questo file come "supabase-config.js"
// e inserisci le tue credenziali Supabase.

const SUPABASE_CONFIG = {
    // IMPORTANTE: Sostituisci questi valori con le tue credenziali Supabase
    // Ottienile da: Supabase Dashboard → Settings → API
    
    url: 'YOUR_SUPABASE_PROJECT_URL',  // Es: https://xxxxxxxxxxx.supabase.co
    anonKey: 'YOUR_SUPABASE_ANON_KEY'  // La chiave pubblica (anon/public key)
};

// Verifica che la configurazione sia stata personalizzata
const isConfigured = 
    SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_PROJECT_URL' && 
    SUPABASE_CONFIG.anonKey !== 'YOUR_SUPABASE_ANON_KEY';

// Inizializza Supabase solo se configurato
let supabaseClient = null;
let isSupabaseEnabled = false;

if (isConfigured) {
    try {
        // Crea il client Supabase
        supabaseClient = supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey
        );
        
        isSupabaseEnabled = true;
        console.log('✅ Supabase inizializzato con successo');
        
        // Test connessione
        supabaseClient
            .from('app_data')
            .select('count')
            .limit(1)
            .then(({ error }) => {
                if (error) {
                    console.warn('⚠️ Errore connessione Supabase:', error.message);
                    isSupabaseEnabled = false;
                } else {
                    console.log('✅ Connesso a Supabase');
                }
            });
            
    } catch (error) {
        console.error('❌ Errore inizializzazione Supabase:', error);
        isSupabaseEnabled = false;
    }
} else {
    console.warn('⚠️ Supabase non configurato. Usando solo localStorage.');
    console.warn('📖 Leggi GUIDA_SUPABASE.md per configurare il database online.');
}

// Esporta per uso globale
window.supabaseClient = supabaseClient;
window.isSupabaseEnabled = isSupabaseEnabled;

// Made with Bob
