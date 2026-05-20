// ===== Google Maps API Configuration =====
// Configurazione per l'integrazione con Google Maps Distance Matrix API

const GoogleMapsConfig = {
    // IMPORTANTE: Inserisci qui la tua API key di Google Maps
    // Per ottenere una API key:
    // 1. Vai su https://console.cloud.google.com/
    // 2. Crea un nuovo progetto o seleziona uno esistente
    // 3. Abilita "Distance Matrix API" e "Geocoding API"
    // 4. Crea credenziali (API key)
    // 5. Copia la chiave qui sotto
    
    apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
    
    // Verifica se l'API key è configurata
    isConfigured() {
        return this.apiKey && this.apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY';
    },
    
    // Ottieni l'API key
    getApiKey() {
        if (!this.isConfigured()) {
            console.warn('⚠️ Google Maps API key non configurata in js/google-maps-config.js');
            return null;
        }
        return this.apiKey;
    }
};

// Esporta la configurazione
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoogleMapsConfig;
}

// Made with Bob