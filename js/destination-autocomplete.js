/**
 * Sistema di Autocomplete per Destinazioni
 * Suggerisce città e nazioni mentre l'utente digita
 */

class DestinationAutocomplete {
    constructor() {
        this.destinations = this.buildDestinationsList();
        this.currentInput = null;
        this.suggestionsList = null;
    }

    /**
     * Costruisce lista completa di destinazioni
     */
    buildDestinationsList() {
        return [
            // Norvegia
            { city: 'Oslo', country: 'Norway', display: 'Oslo, Norway' },
            { city: 'Bergen', country: 'Norway', display: 'Bergen, Norway' },
            { city: 'Trondheim', country: 'Norway', display: 'Trondheim, Norway' },
            { city: 'Stavanger', country: 'Norway', display: 'Stavanger, Norway' },
            { city: 'Tromsø', country: 'Norway', display: 'Tromsø, Norway' },
            
            // Italia
            { city: 'Roma', country: 'Italia', display: 'Roma, Italia' },
            { city: 'Milano', country: 'Italia', display: 'Milano, Italia' },
            { city: 'Venezia', country: 'Italia', display: 'Venezia, Italia' },
            { city: 'Firenze', country: 'Italia', display: 'Firenze, Italia' },
            { city: 'Napoli', country: 'Italia', display: 'Napoli, Italia' },
            { city: 'Torino', country: 'Italia', display: 'Torino, Italia' },
            { city: 'Bologna', country: 'Italia', display: 'Bologna, Italia' },
            
            // Francia
            { city: 'Parigi', country: 'Francia', display: 'Parigi, Francia' },
            { city: 'Lione', country: 'Francia', display: 'Lione, Francia' },
            { city: 'Marsiglia', country: 'Francia', display: 'Marsiglia, Francia' },
            { city: 'Nizza', country: 'Francia', display: 'Nizza, Francia' },
            { city: 'Bordeaux', country: 'Francia', display: 'Bordeaux, Francia' },
            
            // Spagna
            { city: 'Madrid', country: 'Spagna', display: 'Madrid, Spagna' },
            { city: 'Barcellona', country: 'Spagna', display: 'Barcellona, Spagna' },
            { city: 'Valencia', country: 'Spagna', display: 'Valencia, Spagna' },
            { city: 'Siviglia', country: 'Spagna', display: 'Siviglia, Spagna' },
            { city: 'Bilbao', country: 'Spagna', display: 'Bilbao, Spagna' },
            
            // Germania
            { city: 'Berlino', country: 'Germania', display: 'Berlino, Germania' },
            { city: 'Monaco', country: 'Germania', display: 'Monaco, Germania' },
            { city: 'Amburgo', country: 'Germania', display: 'Amburgo, Germania' },
            { city: 'Francoforte', country: 'Germania', display: 'Francoforte, Germania' },
            { city: 'Colonia', country: 'Germania', display: 'Colonia, Germania' },
            
            // Regno Unito
            { city: 'Londra', country: 'Regno Unito', display: 'Londra, Regno Unito' },
            { city: 'Edimburgo', country: 'Scozia', display: 'Edimburgo, Scozia' },
            { city: 'Manchester', country: 'Regno Unito', display: 'Manchester, Regno Unito' },
            { city: 'Liverpool', country: 'Regno Unito', display: 'Liverpool, Regno Unito' },
            
            // Grecia
            { city: 'Atene', country: 'Grecia', display: 'Atene, Grecia' },
            { city: 'Santorini', country: 'Grecia', display: 'Santorini, Grecia' },
            { city: 'Mykonos', country: 'Grecia', display: 'Mykonos, Grecia' },
            { city: 'Creta', country: 'Grecia', display: 'Creta, Grecia' },
            
            // Portogallo
            { city: 'Lisbona', country: 'Portogallo', display: 'Lisbona, Portogallo' },
            { city: 'Porto', country: 'Portogallo', display: 'Porto, Portogallo' },
            
            // Paesi Bassi
            { city: 'Amsterdam', country: 'Paesi Bassi', display: 'Amsterdam, Paesi Bassi' },
            { city: 'Rotterdam', country: 'Paesi Bassi', display: 'Rotterdam, Paesi Bassi' },
            
            // Belgio
            { city: 'Bruxelles', country: 'Belgio', display: 'Bruxelles, Belgio' },
            { city: 'Bruges', country: 'Belgio', display: 'Bruges, Belgio' },
            
            // Svizzera
            { city: 'Zurigo', country: 'Svizzera', display: 'Zurigo, Svizzera' },
            { city: 'Ginevra', country: 'Svizzera', display: 'Ginevra, Svizzera' },
            
            // Austria
            { city: 'Vienna', country: 'Austria', display: 'Vienna, Austria' },
            { city: 'Salisburgo', country: 'Austria', display: 'Salisburgo, Austria' },
            
            // Repubblica Ceca
            { city: 'Praga', country: 'Repubblica Ceca', display: 'Praga, Repubblica Ceca' },
            
            // Ungheria
            { city: 'Budapest', country: 'Ungheria', display: 'Budapest, Ungheria' },
            
            // Polonia
            { city: 'Varsavia', country: 'Polonia', display: 'Varsavia, Polonia' },
            { city: 'Cracovia', country: 'Polonia', display: 'Cracovia, Polonia' },
            
            // Islanda
            { city: 'Reykjavik', country: 'Islanda', display: 'Reykjavik, Islanda' },
            
            // Irlanda
            { city: 'Dublino', country: 'Irlanda', display: 'Dublino, Irlanda' },
            
            // Danimarca
            { city: 'Copenaghen', country: 'Danimarca', display: 'Copenaghen, Danimarca' },
            
            // Svezia
            { city: 'Stoccolma', country: 'Svezia', display: 'Stoccolma, Svezia' },
            { city: 'Göteborg', country: 'Svezia', display: 'Göteborg, Svezia' },
            
            // Finlandia
            { city: 'Helsinki', country: 'Finlandia', display: 'Helsinki, Finlandia' },
            
            // Asia
            { city: 'Tokyo', country: 'Giappone', display: 'Tokyo, Giappone' },
            { city: 'Kyoto', country: 'Giappone', display: 'Kyoto, Giappone' },
            { city: 'Osaka', country: 'Giappone', display: 'Osaka, Giappone' },
            { city: 'Bangkok', country: 'Thailandia', display: 'Bangkok, Thailandia' },
            { city: 'Singapore', country: 'Singapore', display: 'Singapore, Singapore' },
            { city: 'Dubai', country: 'Emirati Arabi', display: 'Dubai, Emirati Arabi' },
            { city: 'Bali', country: 'Indonesia', display: 'Bali, Indonesia' },
            
            // America
            { city: 'New York', country: 'USA', display: 'New York, USA' },
            { city: 'Los Angeles', country: 'USA', display: 'Los Angeles, USA' },
            { city: 'San Francisco', country: 'USA', display: 'San Francisco, USA' },
            { city: 'Miami', country: 'USA', display: 'Miami, USA' },
            { city: 'Toronto', country: 'Canada', display: 'Toronto, Canada' },
            { city: 'Vancouver', country: 'Canada', display: 'Vancouver, Canada' },
            { city: 'Città del Messico', country: 'Messico', display: 'Città del Messico, Messico' },
            
            // Sud America
            { city: 'Rio de Janeiro', country: 'Brasile', display: 'Rio de Janeiro, Brasile' },
            { city: 'Buenos Aires', country: 'Argentina', display: 'Buenos Aires, Argentina' },
            
            // Oceania
            { city: 'Sydney', country: 'Australia', display: 'Sydney, Australia' },
            { city: 'Melbourne', country: 'Australia', display: 'Melbourne, Australia' },
            { city: 'Auckland', country: 'Nuova Zelanda', display: 'Auckland, Nuova Zelanda' }
        ];
    }

    /**
     * Inizializza autocomplete su un input
     */
    init(inputElement) {
        if (!inputElement) return;

        this.currentInput = inputElement;
        
        // Crea container suggerimenti
        this.createSuggestionsContainer();
        
        // Event listeners
        inputElement.addEventListener('input', (e) => this.handleInput(e));
        inputElement.addEventListener('focus', (e) => this.handleInput(e));
        inputElement.addEventListener('blur', () => {
            // Ritardo per permettere il click sui suggerimenti
            setTimeout(() => this.hideSuggestions(), 200);
        });
        
        // Navigazione con tastiera
        inputElement.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    /**
     * Crea container per i suggerimenti
     */
    createSuggestionsContainer() {
        // Rimuovi container esistente
        const existing = document.getElementById('destination-suggestions');
        if (existing) existing.remove();

        // Crea nuovo container
        this.suggestionsList = document.createElement('div');
        this.suggestionsList.id = 'destination-suggestions';
        this.suggestionsList.className = 'absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto hidden';
        
        // Inserisci dopo l'input
        this.currentInput.parentNode.style.position = 'relative';
        this.currentInput.parentNode.appendChild(this.suggestionsList);
    }

    /**
     * Gestisce input utente
     */
    handleInput(e) {
        const value = e.target.value.trim();
        
        if (value.length < 2) {
            this.hideSuggestions();
            return;
        }

        const matches = this.searchDestinations(value);
        this.showSuggestions(matches);
    }

    /**
     * Cerca destinazioni che corrispondono
     */
    searchDestinations(query) {
        const normalized = query.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        return this.destinations.filter(dest => {
            const cityMatch = dest.city.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .includes(normalized);
            const countryMatch = dest.country.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .includes(normalized);
            
            return cityMatch || countryMatch;
        }).slice(0, 10); // Max 10 risultati
    }

    /**
     * Mostra suggerimenti
     */
    showSuggestions(matches) {
        if (matches.length === 0) {
            this.hideSuggestions();
            return;
        }

        this.suggestionsList.innerHTML = '';
        this.suggestionsList.classList.remove('hidden');

        matches.forEach((dest, index) => {
            const item = document.createElement('div');
            item.className = 'px-4 py-3 hover:bg-indigo-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0';
            item.dataset.index = index;
            
            item.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="text-2xl">${this.getCityEmoji(dest.country)}</span>
                    <div>
                        <div class="font-semibold text-gray-800">${dest.city}</div>
                        <div class="text-sm text-gray-500">${dest.country}</div>
                    </div>
                </div>
            `;
            
            item.addEventListener('click', () => this.selectDestination(dest));
            this.suggestionsList.appendChild(item);
        });
    }

    /**
     * Nascondi suggerimenti
     */
    hideSuggestions() {
        if (this.suggestionsList) {
            this.suggestionsList.classList.add('hidden');
        }
    }

    /**
     * Seleziona una destinazione
     */
    selectDestination(dest) {
        if (this.currentInput) {
            this.currentInput.value = dest.display;
            this.hideSuggestions();
            
            // Trigger change event
            const event = new Event('change', { bubbles: true });
            this.currentInput.dispatchEvent(event);
        }
    }

    /**
     * Gestisce navigazione con tastiera
     */
    handleKeyboard(e) {
        const items = this.suggestionsList.querySelectorAll('[data-index]');
        if (items.length === 0) return;

        const current = this.suggestionsList.querySelector('.bg-indigo-100');
        let index = current ? parseInt(current.dataset.index) : -1;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            index = (index + 1) % items.length;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            index = index <= 0 ? items.length - 1 : index - 1;
        } else if (e.key === 'Enter' && index >= 0) {
            e.preventDefault();
            items[index].click();
            return;
        } else if (e.key === 'Escape') {
            this.hideSuggestions();
            return;
        } else {
            return;
        }

        // Rimuovi highlight precedente
        items.forEach(item => item.classList.remove('bg-indigo-100'));
        
        // Aggiungi nuovo highlight
        items[index].classList.add('bg-indigo-100');
        items[index].scrollIntoView({ block: 'nearest' });
    }

    /**
     * Ottieni emoji per paese
     */
    getCityEmoji(country) {
        const emojis = {
            'Norway': '🇳🇴', 'Italia': '🇮🇹', 'Francia': '🇫🇷', 'Spagna': '🇪🇸',
            'Germania': '🇩🇪', 'Regno Unito': '🇬🇧', 'Scozia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Grecia': '🇬🇷',
            'Portogallo': '🇵🇹', 'Paesi Bassi': '🇳🇱', 'Belgio': '🇧🇪', 'Svizzera': '🇨🇭',
            'Austria': '🇦🇹', 'Repubblica Ceca': '🇨🇿', 'Ungheria': '🇭🇺', 'Polonia': '🇵🇱',
            'Islanda': '🇮🇸', 'Irlanda': '🇮🇪', 'Danimarca': '🇩🇰', 'Svezia': '🇸🇪',
            'Finlandia': '🇫🇮', 'Giappone': '🇯🇵', 'Thailandia': '🇹🇭', 'Singapore': '🇸🇬',
            'Emirati Arabi': '🇦🇪', 'Indonesia': '🇮🇩', 'USA': '🇺🇸', 'Canada': '🇨🇦',
            'Messico': '🇲🇽', 'Brasile': '🇧🇷', 'Argentina': '🇦🇷', 'Australia': '🇦🇺',
            'Nuova Zelanda': '🇳🇿'
        };
        return emojis[country] || '🌍';
    }

    /**
     * Distruggi l'istanza e rimuovi event listeners
     */
    destroy() {
        if (this.input) {
            this.input.removeEventListener('input', this.handleInput);
            this.input.removeEventListener('focus', this.handleFocus);
            this.input.removeEventListener('blur', this.handleBlur);
            this.input.removeEventListener('keydown', this.handleKeydown);
        }
        this.hideSuggestions();
        if (this.dropdown && this.dropdown.parentNode) {
            this.dropdown.parentNode.removeChild(this.dropdown);
        }
    }
}

// Inizializza autocomplete quando il DOM è pronto
const destinationAutocomplete = new DestinationAutocomplete();

// Esporta per uso globale
window.destinationAutocomplete = destinationAutocomplete;

// Made with Bob
