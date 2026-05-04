// ===== Flight Search Manager =====
// Gestisce la ricerca voli sui principali siti di prenotazione

const FlightSearchManager = {
    // Configurazione dei siti di ricerca voli
    searchSites: {
        skyscanner: {
            name: 'Skyscanner',
            baseUrl: 'https://www.skyscanner.it/transport/flights',
            buildUrl: function(params) {
                // Formato: /from/to/date/date?adults=X
                const { from, to, departDate, returnDate, passengers } = params;
                let url = `${this.baseUrl}/${from}/${to}/${departDate}`;
                if (returnDate) {
                    url += `/${returnDate}`;
                }
                url += `?adults=${passengers}&children=0&adultsv2=${passengers}&childrenv2=&infants=0&cabinclass=economy&rtn=1&preferdirects=false&outboundaltsenabled=false&inboundaltsenabled=false`;
                return url;
            }
        },
        googleFlights: {
            name: 'Google Flights',
            baseUrl: 'https://www.google.com/travel/flights',
            buildUrl: function(params) {
                const { from, to, departDate, returnDate, passengers } = params;
                let url = `${this.baseUrl}?q=flights%20from%20${encodeURIComponent(from)}%20to%20${encodeURIComponent(to)}`;
                url += `&curr=EUR&hl=it`;
                if (departDate) {
                    url += `&tfs=CBwQAhokag0IAhIJL20vMDVxdGo4EgoyMDI2LTA2LTAxcg0IAhIJL20vMDVxdGo4`;
                }
                return url;
            }
        },
        kayak: {
            name: 'Kayak',
            baseUrl: 'https://www.kayak.it/flights',
            buildUrl: function(params) {
                const { from, to, departDate, returnDate, passengers } = params;
                let url = `${this.baseUrl}/${from}-${to}/${departDate}`;
                if (returnDate) {
                    url += `/${returnDate}`;
                }
                url += `/${passengers}adults?sort=bestflight_a`;
                return url;
            }
        },
        momondo: {
            name: 'Momondo',
            baseUrl: 'https://www.momondo.it/flight-search',
            buildUrl: function(params) {
                const { from, to, departDate, returnDate, passengers } = params;
                let url = `${this.baseUrl}/${from}-${to}/${departDate}`;
                if (returnDate) {
                    url += `/${returnDate}`;
                }
                url += `?sort=bestflight_a&adults=${passengers}`;
                return url;
            }
        },
        edreams: {
            name: 'eDreams',
            baseUrl: 'https://www.edreams.it/voli',
            buildUrl: function(params) {
                const { from, to, departDate, returnDate, passengers } = params;
                let url = `${this.baseUrl}/${from}-${to}`;
                if (departDate) {
                    url += `/${departDate}`;
                    if (returnDate) {
                        url += `/${returnDate}`;
                    }
                }
                url += `/${passengers}-adulti`;
                return url;
            }
        }
    },

    // Apri il modal di ricerca voli
    openModal() {
        const modal = document.getElementById('flightSearchModal');
        if (modal) {
            modal.classList.add('active');
            this.prefillFromScenario();
        }
    },

    // Chiudi il modal
    closeModal() {
        const modal = document.getElementById('flightSearchModal');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    // Pre-compila i campi dal scenario corrente
    prefillFromScenario() {
        // Ottieni i dati dai campi del volo
        const flightDeparture = document.getElementById('flightDeparture');
        const flightArrival = document.getElementById('flightArrival');
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        const participantsCount = document.querySelectorAll('.participant-tag').length;

        // Pre-compila partenza e arrivo dai campi dedicati
        if (flightDeparture && flightDeparture.value) {
            document.getElementById('departureCity').value = flightDeparture.value;
        }

        if (flightArrival && flightArrival.value) {
            document.getElementById('arrivalCity').value = flightArrival.value;
        }

        // Se i campi volo sono vuoti, usa la destinazione dello scenario
        if ((!flightArrival || !flightArrival.value)) {
            const destinationInput = document.getElementById('destination');
            if (destinationInput && destinationInput.value) {
                document.getElementById('arrivalCity').value = destinationInput.value;
            }
        }

        if (startDateInput && startDateInput.value) {
            document.getElementById('departureDate').value = startDateInput.value;
        }

        if (endDateInput && endDateInput.value) {
            document.getElementById('returnDate').value = endDateInput.value;
        }

        if (participantsCount > 0) {
            document.getElementById('passengers').value = participantsCount;
        }

        // Aggiorna la visualizzazione della rotta
        this.updateRouteDisplay();
    },

    // Aggiorna la visualizzazione della rotta nel modal
    updateRouteDisplay() {
        const departureCity = document.getElementById('departureCity').value;
        const arrivalCity = document.getElementById('arrivalCity').value;
        const routeDisplay = document.getElementById('routeDisplay');

        if (routeDisplay) {
            if (departureCity && arrivalCity) {
                routeDisplay.textContent = `${departureCity} → ${arrivalCity}`;
            } else if (departureCity) {
                routeDisplay.textContent = `${departureCity} → ?`;
            } else if (arrivalCity) {
                routeDisplay.textContent = `? → ${arrivalCity}`;
            } else {
                routeDisplay.textContent = '-';
            }
        }
    },

    // Ottieni i parametri di ricerca dal form
    getSearchParams() {
        const departureCity = document.getElementById('departureCity').value.trim();
        const arrivalCity = document.getElementById('arrivalCity').value.trim();
        const departureDate = document.getElementById('departureDate').value;
        const returnDate = document.getElementById('returnDate').value;
        const passengers = document.getElementById('passengers').value || 1;

        // Validazione base
        if (!departureCity || !arrivalCity) {
            ExportManager.showError('Inserisci città di partenza e arrivo');
            return null;
        }

        // Converti le città in codici aeroportuali (semplificato)
        const fromCode = this.getCityCode(departureCity);
        const toCode = this.getCityCode(arrivalCity);

        // Formatta le date per i vari siti
        const formattedDepartDate = departureDate ? departureDate.replace(/-/g, '') : '';
        const formattedReturnDate = returnDate ? returnDate.replace(/-/g, '') : '';

        return {
            from: fromCode,
            to: toCode,
            fromCity: departureCity,
            toCity: arrivalCity,
            departDate: formattedDepartDate,
            returnDate: formattedReturnDate,
            passengers: passengers
        };
    },

    // Converti nome città in codice aeroportuale (semplificato)
    getCityCode(cityName) {
        const cityLower = cityName.toLowerCase().trim();
        
        // Mappa delle principali città italiane ed europee
        const cityMap = {
            // Italia
            'roma': 'ROM',
            'milano': 'MIL',
            'venezia': 'VCE',
            'firenze': 'FLR',
            'napoli': 'NAP',
            'torino': 'TRN',
            'bologna': 'BLQ',
            'palermo': 'PMO',
            'catania': 'CTA',
            'bari': 'BRI',
            'genova': 'GOA',
            'verona': 'VRN',
            'pisa': 'PSA',
            'cagliari': 'CAG',
            'trieste': 'TRS',
            // Europa
            'parigi': 'PAR',
            'londra': 'LON',
            'barcellona': 'BCN',
            'madrid': 'MAD',
            'berlino': 'BER',
            'amsterdam': 'AMS',
            'vienna': 'VIE',
            'praga': 'PRG',
            'lisbona': 'LIS',
            'atene': 'ATH',
            'dublino': 'DUB',
            'bruxelles': 'BRU',
            'zurigo': 'ZRH',
            'monaco': 'MUC',
            'copenaghen': 'CPH',
            'stoccolma': 'STO',
            'oslo': 'OSL',
            'helsinki': 'HEL',
            'varsavia': 'WAW',
            'budapest': 'BUD',
            'istanbul': 'IST',
            // Altre destinazioni popolari
            'new york': 'NYC',
            'los angeles': 'LAX',
            'tokyo': 'TYO',
            'dubai': 'DXB',
            'singapore': 'SIN',
            'bangkok': 'BKK',
            'hong kong': 'HKG'
        };

        // Cerca corrispondenza esatta
        if (cityMap[cityLower]) {
            return cityMap[cityLower];
        }

        // Cerca corrispondenza parziale
        for (const [city, code] of Object.entries(cityMap)) {
            if (cityLower.includes(city) || city.includes(cityLower)) {
                return code;
            }
        }

        // Se non trovato, usa le prime 3 lettere maiuscole
        return cityName.substring(0, 3).toUpperCase();
    },

    // Aggiorna i link di ricerca
    updateSearchLinks() {
        const params = this.getSearchParams();
        if (!params) return;

        // Aggiorna ogni link
        Object.keys(this.searchSites).forEach(siteKey => {
            const site = this.searchSites[siteKey];
            const linkElement = document.getElementById(`${siteKey}Link`);
            
            if (linkElement) {
                try {
                    const url = site.buildUrl(params);
                    linkElement.href = url;
                    
                    // Aggiungi evento click per tracking
                    linkElement.onclick = (e) => {
                        console.log(`Apertura ricerca voli su ${site.name}:`, params);
                    };
                } catch (error) {
                    console.error(`Errore nella generazione URL per ${site.name}:`, error);
                    linkElement.href = site.baseUrl;
                }
            }
        });

        ExportManager.showSuccess('Link di ricerca aggiornati! Clicca su un sito per cercare voli.');
    },

    // Inizializza il manager
    init() {
        // Event listener per il pulsante di apertura modal
        const flightSearchBtn = document.getElementById('flightSearchBtn');
        if (flightSearchBtn) {
            flightSearchBtn.addEventListener('click', () => {
                this.openModal();
            });
        }

        // Event listener per la chiusura del modal
        const closeBtn = document.getElementById('closeFlightModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Chiudi modal cliccando fuori
        const modal = document.getElementById('flightSearchModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Aggiorna i link quando cambiano i parametri nel modal
        const searchInputs = ['departureCity', 'arrivalCity', 'departureDate', 'returnDate', 'passengers'];
        searchInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => {
                    this.updateSearchLinks();
                    this.updateRouteDisplay();
                });
                input.addEventListener('change', () => {
                    this.updateSearchLinks();
                    this.updateRouteDisplay();
                });
            }
        });

        // Sincronizza i campi del volo con il modal
        const flightDeparture = document.getElementById('flightDeparture');
        const flightArrival = document.getElementById('flightArrival');

        if (flightDeparture) {
            flightDeparture.addEventListener('input', () => {
                const depCity = document.getElementById('departureCity');
                if (depCity) {
                    depCity.value = flightDeparture.value;
                }
            });
        }

        if (flightArrival) {
            flightArrival.addEventListener('input', () => {
                const arrCity = document.getElementById('arrivalCity');
                if (arrCity) {
                    arrCity.value = flightArrival.value;
                }
            });
        }

        // Inizializza i link con valori di default
        this.initializeDefaultLinks();
    },

    // Inizializza i link con URL di base
    initializeDefaultLinks() {
        Object.keys(this.searchSites).forEach(siteKey => {
            const site = this.searchSites[siteKey];
            const linkElement = document.getElementById(`${siteKey}Link`);
            if (linkElement) {
                linkElement.href = site.baseUrl;
            }
        });
    }
};

// Inizializza quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        FlightSearchManager.init();
    });
} else {
    FlightSearchManager.init();
}

// Made with Bob
