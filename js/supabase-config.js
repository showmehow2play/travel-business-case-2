// ===== Supabase Configuration =====
// Configurazione per la connessione a Supabase

const SUPABASE_CONFIG = {
    // IMPORTANTE: Sostituisci questi valori con le tue credenziali Supabase
    // Ottienile da: Supabase Dashboard → Settings → API
    
    url: 'https://moiywlzfymhokvirljgo.supabase.co',  // Es: https://xxxxxxxxxxx.supabase.co
anonKey:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vaXl3bHpmeW1ob2t2aXJsamdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzI0ODcsImV4cCI6MjA5Mzc0ODQ4N30.Ovi5sJ6U38t70SMHRrFjBZO8hgz-sXWZuEajDk0jqpI'  // La chiave pubblica (anon/public key)
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
