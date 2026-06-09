// ===== Currencies Manager =====
// Gestisce l'anagrafica delle valute e i tassi di cambio

const CurrenciesManager = {
    STORAGE_KEY: 'currencies_registry',
    currentCurrency: null,
    // API per i tassi di cambio (European Central Bank)
    ECB_API_URL: 'https://api.exchangerate-api.com/v4/latest/EUR',

    // Database valute per paese
    countryCurrencies: {
        'Stati Uniti': { code: 'USD', name: 'Dollaro Statunitense', symbol: '$' },
        'Regno Unito': { code: 'GBP', name: 'Sterlina Britannica', symbol: '£' },
        'Giappone': { code: 'JPY', name: 'Yen Giapponese', symbol: '¥' },
        'Svizzera': { code: 'CHF', name: 'Franco Svizzero', symbol: 'CHF' },
        'Canada': { code: 'CAD', name: 'Dollaro Canadese', symbol: 'C$' },
        'Australia': { code: 'AUD', name: 'Dollaro Australiano', symbol: 'A$' },
        'Nuova Zelanda': { code: 'NZD', name: 'Dollaro Neozelandese', symbol: 'NZ$' },
        'Cina': { code: 'CNY', name: 'Yuan Cinese', symbol: '¥' },
        'India': { code: 'INR', name: 'Rupia Indiana', symbol: '₹' },
        'Brasile': { code: 'BRL', name: 'Real Brasiliano', symbol: 'R$' },
        'Messico': { code: 'MXN', name: 'Peso Messicano', symbol: '$' },
        'Sudafrica': { code: 'ZAR', name: 'Rand Sudafricano', symbol: 'R' },
        'Russia': { code: 'RUB', name: 'Rublo Russo', symbol: '₽' },
        'Corea del Sud': { code: 'KRW', name: 'Won Sudcoreano', symbol: '₩' },
        'Singapore': { code: 'SGD', name: 'Dollaro di Singapore', symbol: 'S$' },
        'Hong Kong': { code: 'HKD', name: 'Dollaro di Hong Kong', symbol: 'HK$' },
        'Norvegia': { code: 'NOK', name: 'Corona Norvegese', symbol: 'kr' },
        'Svezia': { code: 'SEK', name: 'Corona Svedese', symbol: 'kr' },
        'Danimarca': { code: 'DKK', name: 'Corona Danese', symbol: 'kr' },
        'Polonia': { code: 'PLN', name: 'Zloty Polacco', symbol: 'zł' },
        'Turchia': { code: 'TRY', name: 'Lira Turca', symbol: '₺' },
        'Thailandia': { code: 'THB', name: 'Baht Thailandese', symbol: '฿' },
        'Malesia': { code: 'MYR', name: 'Ringgit Malese', symbol: 'RM' },
        'Indonesia': { code: 'IDR', name: 'Rupia Indonesiana', symbol: 'Rp' },
        'Filippine': { code: 'PHP', name: 'Peso Filippino', symbol: '₱' },
        'Vietnam': { code: 'VND', name: 'Dong Vietnamita', symbol: '₫' },
        'Argentina': { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
        'Cile': { code: 'CLP', name: 'Peso Cileno', symbol: '$' },
        'Colombia': { code: 'COP', name: 'Peso Colombiano', symbol: '$' },
        'Perù': { code: 'PEN', name: 'Sol Peruviano', symbol: 'S/' },
        'Egitto': { code: 'EGP', name: 'Sterlina Egiziana', symbol: '£' },
        'Israele': { code: 'ILS', name: 'Shekel Israeliano', symbol: '₪' },
        'Emirati Arabi Uniti': { code: 'AED', name: 'Dirham degli Emirati', symbol: 'د.إ' },
        'Arabia Saudita': { code: 'SAR', name: 'Riyal Saudita', symbol: '﷼' },
        'Repubblica Ceca': { code: 'CZK', name: 'Corona Ceca', symbol: 'Kč' },
        'Ungheria': { code: 'HUF', name: 'Fiorino Ungherese', symbol: 'Ft' },
        'Romania': { code: 'RON', name: 'Leu Rumeno', symbol: 'lei' },
        'Bulgaria': { code: 'BGN', name: 'Lev Bulgaro', symbol: 'лв' },
        'Croazia': { code: 'HRK', name: 'Kuna Croata', symbol: 'kn' },
        'Islanda': { code: 'ISK', name: 'Corona Islandese', symbol: 'kr' }
    },

    // Inizializza il manager delle valute
    init() {
        console.log('Inizializzazione CurrenciesManager...');
        
        // Carica valute predefinite se non esistono
        const currencies = this.getCurrencies();
        if (currencies.length === 0) {
            this.loadDefaultCurrencies();
        }
    },

    // Ottieni i dati della valuta per un paese
    getCurrencyDataByCountry(country) {
        return this.countryCurrencies[country] || null;
    },

    // Ottieni lista di tutti i paesi disponibili
    getAvailableCountries() {
        return Object.keys(this.countryCurrencies).sort();
    },

    // Carica valute predefinite
    loadDefaultCurrencies() {
        const defaultCurrencies = [
            {
                id: this.generateId(),
                code: 'EUR',
                name: 'Euro',
                symbol: '€',
                exchangeRate: 1.0,
                country: 'Eurozona',
                isPrimary: true,
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                code: 'USD',
                name: 'Dollaro Statunitense',
                symbol: '$',
                exchangeRate: 1.10,
                country: 'Stati Uniti',
                isPrimary: false,
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                code: 'GBP',
                name: 'Sterlina Britannica',
                symbol: '£',
                exchangeRate: 0.86,
                country: 'Regno Unito',
                isPrimary: false,
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                code: 'CHF',
                name: 'Franco Svizzero',
                symbol: 'CHF',
                exchangeRate: 0.95,
                country: 'Svizzera',
                isPrimary: false,
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                code: 'JPY',
                name: 'Yen Giapponese',
                symbol: '¥',
                exchangeRate: 163.50,
                country: 'Giappone',
                isPrimary: false,
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                code: 'NOK',
                name: 'Corona Norvegese',
                symbol: 'kr',
                exchangeRate: 11.50,
                country: 'Norvegia',
                isPrimary: false,
                createdAt: new Date().toISOString()
            }
        ];

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultCurrencies));
        console.log('Valute predefinite caricate:', defaultCurrencies.length);
    },

    // Genera un ID univoco
    generateId() {
        return 'curr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Ottieni tutte le valute
    getCurrencies() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Errore nel recupero delle valute:', error);
            return [];
        }
    },

    // Ottieni una valuta per ID
    getCurrencyById(id) {
        const currencies = this.getCurrencies();
        return currencies.find(c => c.id === id);
    },

    // Ottieni una valuta per codice
    getCurrencyByCode(code) {
        const currencies = this.getCurrencies();
        return currencies.find(c => c.code.toUpperCase() === code.toUpperCase());
    },

    // Salva una valuta (crea o aggiorna)
    saveCurrency(currencyData) {
        const currencies = this.getCurrencies();
        
        // Verifica se il codice esiste già (per nuove valute)
        if (!currencyData.id) {
            const existing = this.getCurrencyByCode(currencyData.code);
            if (existing) {
                throw new Error(`La valuta con codice ${currencyData.code} esiste già`);
            }
        }

        if (currencyData.id) {
            // Aggiorna valuta esistente
            const index = currencies.findIndex(c => c.id === currencyData.id);
            if (index !== -1) {
                currencies[index] = {
                    ...currencies[index],
                    ...currencyData,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Nuova valuta
            const newCurrency = {
                ...currencyData,
                id: this.generateId(),
                isPrimary: false,
                createdAt: new Date().toISOString()
            };
            currencies.push(newCurrency);
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currencies));
        return true;
    },

    // Elimina una valuta
    deleteCurrency(id) {
        const currencies = this.getCurrencies();
        const currency = this.getCurrencyById(id);
        
        // Non permettere l'eliminazione dell'Euro
        if (currency && currency.code === 'EUR') {
            throw new Error('Non è possibile eliminare la valuta principale (EUR)');
        }

        const filtered = currencies.filter(c => c.id !== id);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
        return true;
    },

    // Converti un importo da una valuta all'altra
    convert(amount, fromCode, toCode) {
        const fromCurrency = this.getCurrencyByCode(fromCode);
        const toCurrency = this.getCurrencyByCode(toCode);

        if (!fromCurrency || !toCurrency) {
            console.error('Valuta non trovata');
            return amount;
        }

        // Converti prima in EUR, poi nella valuta di destinazione
        const amountInEur = amount / fromCurrency.exchangeRate;
        const convertedAmount = amountInEur * toCurrency.exchangeRate;

        return convertedAmount;
    },

    // Aggiorna i tassi di cambio da API esterna
    async updateExchangeRates() {
        try {
            console.log('Scaricamento tassi di cambio...');
            
            // Mostra loading
            if (typeof showToast !== 'undefined') {
                showToast('Scaricamento tassi di cambio in corso...', 'info');
            }

            const response = await fetch(this.ECB_API_URL);
            
            if (!response.ok) {
                throw new Error('Errore nel download dei tassi di cambio');
            }

            const data = await response.json();
            
            if (!data.rates) {
                throw new Error('Dati non validi ricevuti dall\'API');
            }

            // Aggiorna i tassi per le valute esistenti
            const currencies = this.getCurrencies();
            let updatedCount = 0;

            currencies.forEach(currency => {
                // Salta EUR (è la base)
                if (currency.code === 'EUR') return;

                // Cerca il tasso nell'API
                const newRate = data.rates[currency.code];
                
                if (newRate) {
                    currency.exchangeRate = newRate;
                    currency.lastUpdate = new Date().toISOString();
                    updatedCount++;
                }
            });

            // Salva le valute aggiornate
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currencies));

            console.log(`Aggiornati ${updatedCount} tassi di cambio`);
            
            return {
                success: true,
                updatedCount: updatedCount,
                timestamp: data.time_last_updated || new Date().toISOString()
            };

        } catch (error) {
            console.error('Errore aggiornamento tassi:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
};

// ===== UI Functions =====

// Renderizza la lista delle valute
function renderCurrenciesList() {
    const currencies = CurrenciesManager.getCurrencies();
    const container = document.getElementById('currenciesList');
    const emptyState = document.getElementById('currenciesEmptyState');

    if (!container) return;

    if (currencies.length === 0) {
        container.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    container.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    // Ordina: EUR prima, poi le altre per nome
    const sortedCurrencies = currencies.sort((a, b) => {
        if (a.code === 'EUR') return -1;
        if (b.code === 'EUR') return 1;
        return a.name.localeCompare(b.name);
    });

    container.innerHTML = sortedCurrencies.map(currency => {
        const isPrimary = currency.code === 'EUR';
        const cardClass = isPrimary ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-400' : 'bg-white';
        
        return `
            <div class="currency-card ${cardClass} rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-3">
                        <div class="text-4xl">${currency.symbol || '💱'}</div>
                        <div>
                            <h3 class="text-xl font-bold text-gray-800">${currency.code}</h3>
                            ${isPrimary ? '<span class="text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full font-semibold">Principale</span>' : ''}
                        </div>
                    </div>
                    ${!isPrimary ? `
                        <div class="flex gap-2">
                            <button onclick="deleteCurrency('${currency.id}')" class="text-red-600 hover:text-red-800 p-2" title="Elimina">
                                🗑️
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <div class="space-y-2">
                    <p class="text-gray-700 font-semibold">${currency.name}</p>
                    ${currency.country ? `<p class="text-sm text-gray-600">🌍 ${currency.country}</p>` : ''}
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <p class="text-sm text-gray-600">Tasso di cambio</p>
                        <p class="text-2xl font-bold text-purple-600">
                            ${isPrimary ? '1.00' : currency.exchangeRate.toFixed(6)}
                        </p>
                        <p class="text-xs text-gray-500 mt-1">
                            ${isPrimary ? 'Valuta di riferimento' : `1 EUR = ${currency.exchangeRate} ${currency.code}`}
                        </p>
                        ${!isPrimary && currency.lastUpdate ? `
                            <p class="text-xs text-gray-400 mt-2">
                                🕒 Aggiornato: ${new Date(currency.lastUpdate).toLocaleDateString('it-IT')}
                            </p>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Mostra il modal per aggiungere una valuta
function showAddCurrencyModal() {
    const modal = document.getElementById('currencyModal');
    const form = document.getElementById('currencyForm');
    const title = document.getElementById('currencyModalTitle');
    
    if (!modal || !form) return;

    // Reset form
    form.reset();
    document.getElementById('currencyId').value = '';
    title.textContent = 'Aggiungi Valuta';
    
    // Popola il datalist con i paesi disponibili
    const countriesList = document.getElementById('countriesList');
    if (countriesList) {
        const countries = CurrenciesManager.getAvailableCountries();
        countriesList.innerHTML = countries.map(country =>
            `<option value="${country}">`
        ).join('');
    }
    
    // Aggiungi event listener per l'autocompletamento
    const countryInput = document.getElementById('currencyCountry');
    if (countryInput) {
        // Rimuovi event listener precedenti
        countryInput.removeEventListener('input', handleCountrySelection);
        countryInput.addEventListener('input', handleCountrySelection);
    }
    
    modal.style.display = 'flex';
}

// Gestisce la selezione del paese e compila automaticamente i campi
function handleCountrySelection(event) {
    const country = event.target.value;
    const currencyData = CurrenciesManager.getCurrencyDataByCountry(country);
    
    if (currencyData) {
        // Compila automaticamente i campi
        document.getElementById('currencyCode').value = currencyData.code;
        document.getElementById('currencyName').value = currencyData.name;
        document.getElementById('currencySymbol').value = currencyData.symbol;
        
        // Scarica il tasso di cambio
        fetchExchangeRateForCurrency(currencyData.code);
    }
}

// Scarica il tasso di cambio per una specifica valuta
async function fetchExchangeRateForCurrency(currencyCode) {
    try {
        const response = await fetch(CurrenciesManager.ECB_API_URL);
        if (!response.ok) throw new Error('Errore nel download del tasso');
        
        const data = await response.json();
        const rate = data.rates[currencyCode];
        
        if (rate) {
            document.getElementById('exchangeRate').value = rate.toFixed(6);
        } else {
            document.getElementById('exchangeRate').value = '';
            showToast(`Tasso di cambio per ${currencyCode} non disponibile`, 'warning');
        }
    } catch (error) {
        console.error('Errore nel download del tasso:', error);
        document.getElementById('exchangeRate').value = '';
        showToast('Impossibile scaricare il tasso di cambio', 'error');
    }
}

// Modifica una valuta
function editCurrency(id) {
    const currency = CurrenciesManager.getCurrencyById(id);
    if (!currency) return;

    const modal = document.getElementById('currencyModal');
    const title = document.getElementById('currencyModalTitle');
    
    if (!modal) return;

    // Popola il form
    document.getElementById('currencyId').value = currency.id;
    document.getElementById('currencyCode').value = currency.code;
    document.getElementById('currencyName').value = currency.name;
    document.getElementById('currencySymbol').value = currency.symbol || '';
    document.getElementById('exchangeRate').value = currency.exchangeRate;
    document.getElementById('currencyCountry').value = currency.country || '';
    
    // Disabilita il campo codice per le modifiche
    document.getElementById('currencyCode').disabled = true;
    
    title.textContent = 'Modifica Valuta';
    modal.style.display = 'flex';
}

// Elimina una valuta
function deleteCurrency(id) {
    const currency = CurrenciesManager.getCurrencyById(id);
    if (!currency) return;

    if (confirm(`Sei sicuro di voler eliminare la valuta ${currency.name} (${currency.code})?`)) {
        try {
            CurrenciesManager.deleteCurrency(id);
            renderCurrenciesList();
            showToast('Valuta eliminata con successo', 'success');
        } catch (error) {
            showToast(error.message, 'error');
        }
    }
}

// Chiudi il modal
function closeCurrencyModal() {
    const modal = document.getElementById('currencyModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('currencyCode').disabled = false;
    }
}

// Salva la valuta dal form
function saveCurrencyFromForm(event) {
    event.preventDefault();

    const currencyData = {
        id: document.getElementById('currencyId').value || null,
        code: document.getElementById('currencyCode').value.toUpperCase().trim(),
        name: document.getElementById('currencyName').value.trim(),
        symbol: document.getElementById('currencySymbol').value.trim(),
        exchangeRate: parseFloat(document.getElementById('exchangeRate').value),
        country: document.getElementById('currencyCountry').value.trim()
    };

    // Validazione
    if (!currencyData.country) {
        showToast('Il paese è obbligatorio', 'error');
        return;
    }

    if (!currencyData.code || currencyData.code.length !== 3) {
        showToast('Il codice valuta deve essere di 3 lettere', 'error');
        return;
    }

    if (!currencyData.name) {
        showToast('Il nome della valuta è obbligatorio', 'error');
        return;
    }

    if (!currencyData.exchangeRate || currencyData.exchangeRate <= 0) {
        showToast('Il tasso di cambio deve essere maggiore di zero', 'error');
        return;
    }

    try {
        CurrenciesManager.saveCurrency(currencyData);
        closeCurrencyModal();
        renderCurrenciesList();
        showToast(
            currencyData.id ? 'Valuta aggiornata con successo' : 'Valuta aggiunta con successo',
            'success'
        );
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Aggiorna i tassi di cambio
async function updateExchangeRates() {
    const btn = document.getElementById('updateExchangeRatesBtn');
    
    // Disabilita il pulsante durante l'aggiornamento
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '⏳ Aggiornamento...';
    }

    try {
        const result = await CurrenciesManager.updateExchangeRates();
        
        if (result.success) {
            showToast(
                `✅ Aggiornati ${result.updatedCount} tassi di cambio con successo!`,
                'success'
            );
            renderCurrenciesList();
        } else {
            showToast(
                `❌ Errore: ${result.error}`,
                'error'
            );
        }
    } catch (error) {
        showToast('Errore durante l\'aggiornamento dei tassi di cambio', 'error');
        console.error(error);
    } finally {
        // Riabilita il pulsante
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '🔄 Aggiorna Cambi';
        }
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Inizializza il manager
    CurrenciesManager.init();

    // Pulsante aggiungi valuta
    const addCurrencyBtn = document.getElementById('addCurrencyBtn');
    if (addCurrencyBtn) {
        addCurrencyBtn.addEventListener('click', showAddCurrencyModal);
    }

    // Pulsante aggiorna cambi
    const updateExchangeRatesBtn = document.getElementById('updateExchangeRatesBtn');
    if (updateExchangeRatesBtn) {
        updateExchangeRatesBtn.addEventListener('click', updateExchangeRates);
    }

    // Form submit
    const currencyForm = document.getElementById('currencyForm');
    if (currencyForm) {
        currencyForm.addEventListener('submit', saveCurrencyFromForm);
    }

    // Chiudi modal con click fuori
    const currencyModal = document.getElementById('currencyModal');
    if (currencyModal) {
        currencyModal.addEventListener('click', (e) => {
            if (e.target === currencyModal) {
                closeCurrencyModal();
            }
        });
    }

    // Renderizza la lista se siamo nella view currencies
    if (document.getElementById('currenciesView')) {
        renderCurrenciesList();
    }
});

// Made with Bob
