/**
 * Sistema di Temi Contestuali per Destinazioni
 * Riconosce automaticamente la destinazione e applica:
 * - Bandiera del paese
 * - Immagine di sfondo
 * - Colori tematici
 *
 * NUOVO: Genera automaticamente temi per destinazioni non previste!
 */

class DestinationThemes {
    constructor() {
        // Cache per temi generati dinamicamente
        this.dynamicThemes = {};
        
        // Colori predefiniti per continenti
        this.continentColors = {
            'europe': ['from-blue-700 to-purple-700', 'from-blue-600 to-purple-600'],
            'asia': ['from-red-700 to-orange-700', 'from-red-600 to-orange-600'],
            'africa': ['from-yellow-700 to-red-700', 'from-yellow-600 to-red-600'],
            'america': ['from-green-700 to-blue-700', 'from-green-600 to-blue-600'],
            'oceania': ['from-cyan-700 to-green-700', 'from-cyan-600 to-green-600'],
            'default': ['from-indigo-700 to-purple-700', 'from-indigo-600 to-purple-600']
        };
        
        this.destinations = {
            // Norvegia
            'norway': {
                country: 'Norvegia',
                flag: '🇳🇴',
                colors: {
                    primary: 'from-blue-700 to-red-700',
                    secondary: 'from-blue-600 to-red-600'
                },
                background: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=1200&q=80', // Fiordi norvegesi
                cities: ['oslo', 'bergen', 'trondheim', 'stavanger', 'tromsø', 'ålesund', 'kristiansand']
            },
            'oslo': {
                country: 'Norvegia',
                city: 'Oslo',
                flag: '🇳🇴',
                colors: {
                    primary: 'from-blue-700 to-red-700',
                    secondary: 'from-blue-600 to-red-600'
                },
                background: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1200&q=80'
            },
            'bergen': {
                country: 'Norvegia',
                city: 'Bergen',
                flag: '🇳🇴',
                colors: {
                    primary: 'from-blue-700 to-red-700',
                    secondary: 'from-blue-600 to-red-600'
                },
                background: 'https://images.unsplash.com/photo-1601439678777-b2b3c56fa627?w=1200&q=80'
            },
            
            // Italia
            'italy': {
                country: 'Italia',
                flag: '🇮🇹',
                colors: {
                    primary: 'from-green-700 to-red-700',
                    secondary: 'from-green-600 to-red-600'
                },
                background: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200&q=80',
                cities: ['roma', 'milano', 'venezia', 'firenze', 'napoli', 'torino', 'bologna']
            },
            'rome': {
                country: 'Italia',
                city: 'Roma',
                flag: '🇮🇹',
                colors: {
                    primary: 'from-amber-700 to-red-700',
                    secondary: 'from-amber-600 to-red-600'
                },
                background: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=80'
            },
            'venice': {
                country: 'Italia',
                city: 'Venezia',
                flag: '🇮🇹',
                colors: {
                    primary: 'from-blue-700 to-cyan-700',
                    secondary: 'from-blue-600 to-cyan-600'
                },
                background: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200&q=80'
            },
            
            // Francia
            'france': {
                country: 'Francia',
                flag: '🇫🇷',
                colors: {
                    primary: 'from-blue-700 to-red-700',
                    secondary: 'from-blue-600 to-red-600'
                },
                background: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
                cities: ['paris', 'lyon', 'marseille', 'nice', 'bordeaux']
            },
            'paris': {
                country: 'Francia',
                city: 'Parigi',
                flag: '🇫🇷',
                colors: {
                    primary: 'from-indigo-700 to-pink-700',
                    secondary: 'from-indigo-600 to-pink-600'
                },
                background: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80'
            },
            
            // Spagna
            'spain': {
                country: 'Spagna',
                flag: '🇪🇸',
                colors: {
                    primary: 'from-red-700 to-yellow-600',
                    secondary: 'from-red-600 to-yellow-500'
                },
                background: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1200&q=80',
                cities: ['madrid', 'barcelona', 'valencia', 'sevilla', 'bilbao']
            },
            'barcelona': {
                country: 'Spagna',
                city: 'Barcellona',
                flag: '🇪🇸',
                colors: {
                    primary: 'from-red-700 to-amber-600',
                    secondary: 'from-red-600 to-amber-500'
                },
                background: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&q=80'
            },
            
            // Germania
            'germany': {
                country: 'Germania',
                flag: '🇩🇪',
                colors: {
                    primary: 'from-gray-800 to-red-700',
                    secondary: 'from-gray-700 to-red-600'
                },
                background: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80',
                cities: ['berlin', 'munich', 'hamburg', 'frankfurt', 'cologne']
            },
            
            // Regno Unito
            'uk': {
                country: 'Regno Unito',
                flag: '🇬🇧',
                colors: {
                    primary: 'from-blue-800 to-red-700',
                    secondary: 'from-blue-700 to-red-600'
                },
                background: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80',
                cities: ['london', 'edinburgh', 'manchester', 'liverpool', 'oxford']
            },
            'london': {
                country: 'Regno Unito',
                city: 'Londra',
                flag: '🇬🇧',
                colors: {
                    primary: 'from-gray-800 to-red-700',
                    secondary: 'from-gray-700 to-red-600'
                },
                background: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80'
            },
            
            // Grecia
            'greece': {
                country: 'Grecia',
                flag: '🇬🇷',
                colors: {
                    primary: 'from-blue-600 to-cyan-500',
                    secondary: 'from-blue-500 to-cyan-400'
                },
                background: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80',
                cities: ['athens', 'santorini', 'mykonos', 'crete', 'rhodes']
            },
            
            // Giappone
            'japan': {
                country: 'Giappone',
                flag: '🇯🇵',
                colors: {
                    primary: 'from-red-600 to-pink-600',
                    secondary: 'from-red-500 to-pink-500'
                },
                background: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80',
                cities: ['tokyo', 'kyoto', 'osaka', 'hiroshima', 'nara']
            },
            
            // USA
            'usa': {
                country: 'Stati Uniti',
                flag: '🇺🇸',
                colors: {
                    primary: 'from-blue-700 to-red-700',
                    secondary: 'from-blue-600 to-red-600'
                },
                background: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1200&q=80',
                cities: ['new york', 'los angeles', 'chicago', 'san francisco', 'miami']
            },
            'new york': {
                country: 'Stati Uniti',
                city: 'New York',
                flag: '🇺🇸',
                colors: {
                    primary: 'from-gray-800 to-yellow-600',
                    secondary: 'from-gray-700 to-yellow-500'
                },
                background: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=80'
            }
        };
    }

    /**
     * Rileva la destinazione dal testo
     */
    detectDestination(text) {
        if (!text) return null;
        
        const normalized = text.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Rimuove accenti
        
        // Cerca corrispondenze esatte
        for (const [key, data] of Object.entries(this.destinations)) {
            if (normalized.includes(key)) {
                return { key, ...data };
            }
        }
        
        // Cerca nelle città
        for (const [key, data] of Object.entries(this.destinations)) {
            if (data.cities) {
                for (const city of data.cities) {
                    if (normalized.includes(city)) {
                        return { key, ...data };
                    }
                }
            }
        }
        
        // NUOVO: Se non trovato, genera tema automaticamente
        return this.generateDynamicTheme(text);
    }

    /**
     * Genera automaticamente un tema per una destinazione non prevista
     */
    async generateDynamicTheme(destination) {
        // Controlla se già generato in cache
        const cacheKey = destination.toLowerCase();
        if (this.dynamicThemes[cacheKey]) {
            return this.dynamicThemes[cacheKey];
        }

        console.log(`🌍 Generazione tema automatico per: ${destination}`);

        // Estrai paese e città
        const parts = destination.split(',').map(p => p.trim());
        const city = parts[0];
        const country = parts[1] || parts[0];

        // Genera tema base
        const theme = {
            key: cacheKey,
            country: country,
            city: city !== country ? city : null,
            flag: this.getFlagFromCountry(country),
            colors: this.generateColors(country),
            background: await this.getUnsplashImage(destination),
            isGenerated: true
        };

        // Salva in cache
        this.dynamicThemes[cacheKey] = theme;
        
        // Salva in localStorage per persistenza
        this.saveDynamicTheme(cacheKey, theme);

        return theme;
    }

    /**
     * Ottieni bandiera da nome paese (con AI/database)
     */
    getFlagFromCountry(country) {
        // Database bandiere comuni
        const flags = {
            // Europa
            'austria': '🇦🇹', 'belgium': '🇧🇪', 'bulgaria': '🇧🇬',
            'croatia': '🇭🇷', 'cyprus': '🇨🇾', 'czech': '🇨🇿',
            'denmark': '🇩🇰', 'estonia': '🇪🇪', 'finland': '🇫🇮',
            'hungary': '🇭🇺', 'iceland': '🇮🇸', 'ireland': '🇮🇪',
            'latvia': '🇱🇻', 'lithuania': '🇱🇹', 'luxembourg': '🇱🇺',
            'malta': '🇲🇹', 'netherlands': '🇳🇱', 'poland': '🇵🇱',
            'portugal': '🇵🇹', 'romania': '🇷🇴', 'slovakia': '🇸🇰',
            'slovenia': '🇸🇮', 'sweden': '🇸🇪', 'switzerland': '🇨🇭',
            
            // Asia
            'china': '🇨🇳', 'india': '🇮🇳', 'indonesia': '🇮🇩',
            'korea': '🇰🇷', 'malaysia': '🇲🇾', 'philippines': '🇵🇭',
            'singapore': '🇸🇬', 'thailand': '🇹🇭', 'vietnam': '🇻🇳',
            
            // America
            'argentina': '🇦🇷', 'brazil': '🇧🇷', 'canada': '🇨🇦',
            'chile': '🇨🇱', 'colombia': '🇨🇴', 'mexico': '🇲🇽',
            'peru': '🇵🇪',
            
            // Africa
            'egypt': '🇪🇬', 'morocco': '🇲🇦', 'south africa': '🇿🇦',
            'tunisia': '🇹🇳',
            
            // Oceania
            'australia': '🇦🇺', 'new zealand': '🇳🇿'
        };

        const normalized = country.toLowerCase();
        for (const [key, flag] of Object.entries(flags)) {
            if (normalized.includes(key)) {
                return flag;
            }
        }

        // Default: emoji globo
        return '🌍';
    }

    /**
     * Genera colori basati sul paese/continente
     */
    generateColors(country) {
        const normalized = country.toLowerCase();
        
        // Determina continente
        let continent = 'default';
        
        if (['norway', 'sweden', 'finland', 'denmark', 'iceland', 'germany', 'france', 
             'italy', 'spain', 'portugal', 'uk', 'ireland', 'netherlands', 'belgium',
             'switzerland', 'austria', 'greece', 'poland', 'czech', 'hungary'].some(c => normalized.includes(c))) {
            continent = 'europe';
        } else if (['japan', 'china', 'korea', 'thailand', 'vietnam', 'singapore',
                    'malaysia', 'indonesia', 'india', 'philippines'].some(c => normalized.includes(c))) {
            continent = 'asia';
        } else if (['egypt', 'morocco', 'tunisia', 'south africa', 'kenya', 'tanzania'].some(c => normalized.includes(c))) {
            continent = 'africa';
        } else if (['usa', 'canada', 'mexico', 'brazil', 'argentina', 'chile', 'peru', 'colombia'].some(c => normalized.includes(c))) {
            continent = 'america';
        } else if (['australia', 'new zealand', 'fiji'].some(c => normalized.includes(c))) {
            continent = 'oceania';
        }

        const colors = this.continentColors[continent];
        return {
            primary: colors[0],
            secondary: colors[1]
        };
    }

    /**
     * Ottieni immagine da Unsplash (API gratuita)
     */
    async getUnsplashImage(destination) {
        try {
            // Usa Unsplash Source API (no key required)
            const query = encodeURIComponent(destination);
            const url = `https://source.unsplash.com/1200x800/?${query},travel,landmark`;
            
            // Verifica che l'immagine esista
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                return url;
            }
        } catch (error) {
            console.log('⚠️ Impossibile caricare immagine Unsplash:', error);
        }

        // Fallback: immagine generica viaggio
        return 'https://source.unsplash.com/1200x800/?travel,destination';
    }

    /**
     * Salva tema dinamico in localStorage
     */
    saveDynamicTheme(key, theme) {
        try {
            const saved = JSON.parse(localStorage.getItem('dynamic_themes') || '{}');
            saved[key] = theme;
            localStorage.setItem('dynamic_themes', JSON.stringify(saved));
        } catch (error) {
            console.log('⚠️ Impossibile salvare tema:', error);
        }
    }

    /**
     * Carica temi dinamici salvati
     */
    loadDynamicThemes() {
        try {
            const saved = JSON.parse(localStorage.getItem('dynamic_themes') || '{}');
            this.dynamicThemes = saved;
            console.log(`✅ Caricati ${Object.keys(saved).length} temi dinamici dalla cache`);
        } catch (error) {
            console.log('⚠️ Impossibile caricare temi salvati:', error);
        }
        return null;
    }

    /**
     * Applica il tema a una card scenario
     */
    applyThemeToCard(cardElement, destination) {
        const theme = this.detectDestination(destination);
        if (!theme) return;

        // Rimuovi lo sfondo bianco della card
        cardElement.classList.remove('bg-white');
        cardElement.style.backgroundColor = 'transparent';

        // Aggiungi bandiera
        const titleElement = cardElement.querySelector('.scenario-title, h3');
        if (titleElement && !titleElement.querySelector('.flag-icon')) {
            const flagSpan = document.createElement('span');
            flagSpan.className = 'flag-icon text-2xl mr-2';
            flagSpan.textContent = theme.flag;
            titleElement.prepend(flagSpan);
        }
    }

    /**
     * Ottieni emoji bandiera da codice paese
     */
    getFlagEmoji(countryCode) {
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt());
        return String.fromCodePoint(...codePoints);
    }

    /**
     * Inizializza i temi per tutte le card esistenti
     */
    initializeThemes() {
        // Applica temi alle card scenario esistenti
        document.querySelectorAll('.scenario-card').forEach(card => {
            const destination = card.querySelector('[data-destination]')?.dataset.destination ||
                              card.querySelector('.scenario-destination')?.textContent;
            if (destination) {
                this.applyThemeToCard(card, destination);
            }
        });
    }
    
    /**
     * Ottieni solo la bandiera per una destinazione (metodo veloce)
     */
    getFlag(destination) {
        if (!destination) return '';
        
        const theme = this.getTheme(destination);
        return theme && theme.flag ? theme.flag + ' ' : '';
    }
}

// Inizializza il sistema di temi
const destinationThemes = new DestinationThemes();

// Carica temi dinamici salvati
destinationThemes.loadDynamicThemes();

// Applica temi quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        destinationThemes.initializeThemes();
    });
} else {
    destinationThemes.initializeThemes();
}

// Esporta per uso globale
window.destinationThemes = destinationThemes;

// Made with Bob
