// ===== Main Application =====
// Gestisce l'interfaccia utente e le interazioni

const App = {
    currentView: 'dashboard',
    currentScenario: null,

    // Inizializza l'applicazione
    init() {
        // La sincronizzazione è già stata fatta da StorageManager.init()
        // Non serve duplicarla qui
        
        this.setupEventListeners();
        this.loadDashboard();
        this.loadScenariosList();
    },

    // Configura gli event listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Event delegation per i pulsanti di rimozione partecipanti
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-participant-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const participantName = e.target.dataset.participant;
                console.log('Rimozione partecipante:', participantName);
                this.removeParticipant(participantName);
            }
        });

        // Dashboard stats navigation
        const totalScenariosCard = document.getElementById('totalScenariosCard');
        if (totalScenariosCard) {
            totalScenariosCard.addEventListener('click', () => {
                this.switchView('scenarios');
            });

            totalScenariosCard.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.switchView('scenarios');
                }
            });
        }

        // New scenario button
        document.getElementById('newScenarioBtn').addEventListener('click', () => {
            this.createNewScenario();
        });

        // Export buttons
        document.getElementById('exportMenuBtn').addEventListener('click', () => {
            this.showExportModal();
        });

        document.querySelectorAll('.export-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const format = e.currentTarget.dataset.format;
                this.exportData(format);
                this.hideExportModal();
            });
        });

        // Import button
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                ExportManager.importJSON(file);
                e.target.value = ''; // Reset input
            }
        });

        // Sync to Supabase button
        const syncToSupabaseBtn = document.getElementById('syncToSupabaseBtn');
        if (syncToSupabaseBtn) {
            syncToSupabaseBtn.addEventListener('click', async () => {
                if (typeof SupabaseStorage === 'undefined' || !window.isSupabaseEnabled) {
                    ExportManager.showError('Supabase non configurato o non disponibile');
                    return;
                }

                const originalText = syncToSupabaseBtn.innerHTML;
                syncToSupabaseBtn.disabled = true;
                syncToSupabaseBtn.innerHTML = '⏳ Sync...';

                try {
                    const success = await SupabaseStorage.syncToSupabase();

                    if (success) {
                        ExportManager.showSuccess('Scenari e consuntivi locali esportati su Supabase');
                    } else {
                        ExportManager.showError('Errore durante la sincronizzazione verso Supabase');
                    }
                } catch (error) {
                    console.error('Errore sync Supabase:', error);
                    ExportManager.showError('Errore durante la sincronizzazione verso Supabase');
                } finally {
                    syncToSupabaseBtn.disabled = false;
                    syncToSupabaseBtn.innerHTML = originalText;
                }
            });
        }

        // Modal close
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideExportModal();
            });
        });

        // Participants view buttons
        const syncParticipantsBtn = document.getElementById('syncParticipantsBtn');
        if (syncParticipantsBtn) {
            syncParticipantsBtn.addEventListener('click', () => {
                autoSyncParticipants();
                renderParticipantsList();
            });
        }

        const participantSearch = document.getElementById('participantSearch');
        if (participantSearch) {
            participantSearch.addEventListener('input', (e) => {
                const query = e.target.value;
                if (query.trim()) {
                    searchParticipants(query);
                } else {
                    renderParticipantsList();
                }
            });
        }

        // Scenario form
        document.getElementById('scenarioForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveScenario();
        });

        // Back button
        document.getElementById('backBtn').addEventListener('click', () => {
            this.switchView(this.currentView);
        });

        // Cancel button
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.switchView(this.currentView);
        });

        // Delete scenario button
        document.getElementById('deleteScenarioBtn').addEventListener('click', () => {
            this.deleteCurrentScenario();
        });

        // Duplicate scenario button
        document.getElementById('duplicateScenarioBtn').addEventListener('click', () => {
            this.duplicateCurrentScenario();
        });

        // Add participant
        document.getElementById('addParticipantBtn').addEventListener('click', () => {
            this.addParticipant();
        });

        document.getElementById('newParticipant').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addParticipant();
            }
        });

        // Accommodation and Car search buttons
        const airbnbBtn = document.getElementById('airbnbSearchBtn');
        if (airbnbBtn) {
            airbnbBtn.addEventListener('click', () => {
                AccommodationCarManager.openAirbnbSearch();
            });
        }

        const bookingBtn = document.getElementById('bookingSearchBtn');
        if (bookingBtn) {
            bookingBtn.addEventListener('click', () => {
                AccommodationCarManager.openBookingSearch();
            });
        }

        const rentalcarsBtn = document.getElementById('rentalcarsSearchBtn');
        if (rentalcarsBtn) {
            rentalcarsBtn.addEventListener('click', () => {
                AccommodationCarManager.openRentalCarsSearch();
            });
        }

        const hertzBtn = document.getElementById('hertzSearchBtn');
        if (hertzBtn) {
            hertzBtn.addEventListener('click', () => {
                AccommodationCarManager.openHertzSearch();
            });
        }

        // Inizializza autocomplete anche sui campi volo della pagina preventivi
        if (window.destinationAutocomplete) {
            const destinationInput = document.getElementById('destination');
            const flightDepartureInput = document.getElementById('flightDeparture');
            const flightArrivalInput = document.getElementById('flightArrival');

            if (destinationInput) window.destinationAutocomplete.init(destinationInput);
            if (flightDepartureInput) window.destinationAutocomplete.init(flightDepartureInput);
            if (flightArrivalInput) window.destinationAutocomplete.init(flightArrivalInput);
        }

        // Gestione vincoli date scenario
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');

        if (startDateInput && endDateInput) {
            startDateInput.addEventListener('change', () => {
                if (startDateInput.value) {
                    endDateInput.min = startDateInput.value;

                    if (!endDateInput.value || endDateInput.value < startDateInput.value) {
                        endDateInput.value = startDateInput.value;
                    }
                } else {
                    endDateInput.min = '';
                }
            });

            endDateInput.addEventListener('focus', () => {
                if (startDateInput.value) {
                    endDateInput.min = startDateInput.value;
                }
            });
        }

        // Update totals when expenses change
        const expenseInputs = ['transport', 'food', 'activities'];
        expenseInputs.forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.updateTotals();
            });
        });

        // Update totals when accommodation, car, or other options change
        document.querySelectorAll('#accommodationOptions input').forEach(input => {
            input.addEventListener('input', () => {
                this.updateTotals();
            });
            input.addEventListener('change', () => {
                this.updateTotals();
            });
        });

        document.querySelectorAll('#carOptions input').forEach(input => {
            // Skip checkbox inputs - they have their own handler
            if (input.type === 'checkbox') {
                input.addEventListener('change', () => {
                    this.updateTotals();
                });
                return;
            }
            
            input.addEventListener('input', () => {
                // Auto-check the checkbox when user enters data in price or name fields
                if (input.classList.contains('option-price') || input.classList.contains('option-name')) {
                    const index = input.dataset.index;
                    const checkbox = document.querySelector(`input[name="car"][data-index="${index}"]`);
                    const priceInput = document.querySelector(`#carOptions .option-price[data-index="${index}"]`);
                    const nameInput = document.querySelector(`#carOptions .option-name[data-index="${index}"]`);
                    
                    // Check the checkbox if either name or price has a value (without triggering change event)
                    if (checkbox && !checkbox.checked && ((priceInput && parseFloat(priceInput.value) > 0) || (nameInput && nameInput.value.trim() !== ''))) {
                        checkbox.checked = true;
                    }
                }
                this.updateTotals();
            });
            input.addEventListener('change', () => {
                // Auto-check the checkbox when user enters data in price or name fields
                if (input.classList.contains('option-price') || input.classList.contains('option-name')) {
                    const index = input.dataset.index;
                    const checkbox = document.querySelector(`input[name="car"][data-index="${index}"]`);
                    const priceInput = document.querySelector(`#carOptions .option-price[data-index="${index}"]`);
                    const nameInput = document.querySelector(`#carOptions .option-name[data-index="${index}"]`);
                    
                    // Check the checkbox if either name or price has a value (without triggering change event)
                    if (checkbox && !checkbox.checked && ((priceInput && parseFloat(priceInput.value) > 0) || (nameInput && nameInput.value.trim() !== ''))) {
                        checkbox.checked = true;
                    }
                }
                this.updateTotals();
            });
        });

        document.querySelectorAll('#otherOptions input, #otherOptions textarea').forEach(input => {
            // Skip checkbox inputs - they have their own handler
            if (input.type === 'checkbox') {
                input.addEventListener('change', () => {
                    this.updateTotals();
                });
                return;
            }
            
            input.addEventListener('input', () => {
                // Auto-check the checkbox when user enters data in price or name fields
                if (input.classList.contains('option-price') || input.classList.contains('option-name')) {
                    const index = input.dataset.index;
                    const checkbox = document.querySelector(`input[name="other"][data-index="${index}"]`);
                    const priceInput = document.querySelector(`#otherOptions .option-price[data-index="${index}"]`);
                    const nameInput = document.querySelector(`#otherOptions .option-name[data-index="${index}"]`);
                    
                    // Check the checkbox if either name or price has a value (without triggering change event)
                    if (checkbox && !checkbox.checked && ((priceInput && parseFloat(priceInput.value) > 0) || (nameInput && nameInput.value.trim() !== ''))) {
                        checkbox.checked = true;
                    }
                }
                this.updateTotals();
            });
            input.addEventListener('change', () => {
                // Auto-check the checkbox when user enters data in price or name fields
                if (input.classList.contains('option-price') || input.classList.contains('option-name')) {
                    const index = input.dataset.index;
                    const checkbox = document.querySelector(`input[name="other"][data-index="${index}"]`);
                    const priceInput = document.querySelector(`#otherOptions .option-price[data-index="${index}"]`);
                    const nameInput = document.querySelector(`#otherOptions .option-name[data-index="${index}"]`);
                    
                    // Check the checkbox if either name or price has a value (without triggering change event)
                    if (checkbox && !checkbox.checked && ((priceInput && parseFloat(priceInput.value) > 0) || (nameInput && nameInput.value.trim() !== ''))) {
                        checkbox.checked = true;
                    }
                }
                this.updateTotals();
            });
        });

        // Compare button
        document.getElementById('compareBtn').addEventListener('click', () => {
            this.compareSelectedScenarios();
        });
    },

    // Cambia vista
    switchView(viewName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === viewName) {
                btn.classList.add('active');
            }
        });

        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        const targetView = document.getElementById(`${viewName}View`);
        if (targetView) {
            targetView.classList.add('active');
            this.currentView = viewName;

            // Load view-specific content
            switch (viewName) {
                case 'dashboard':
                    this.loadDashboard();
                    break;
                case 'scenarios':
                    this.loadScenariosList();
                    break;
                case 'actuals':
                    if (typeof ActualsUI !== 'undefined') {
                        ActualsUI.loadActualsList();
                    }
                    break;
                case 'participants':
                    if (typeof renderParticipantsList !== 'undefined') {
                        renderParticipantsList();
                    }
                    break;
                case 'currencies':
                    if (typeof renderCurrenciesList !== 'undefined') {
                        renderCurrenciesList();
                    }
                    break;
                case 'compare':
                    this.loadCompareView();
                    break;
            }
        }
    },

    // Carica la dashboard
    async loadDashboard() {
        const stats = await StorageManager.getStats();
        const scenarios = await StorageManager.getScenarios() || [];

        // Update stats
        document.getElementById('totalScenarios').textContent = stats.totalScenarios;
        document.getElementById('avgCost').textContent = ScenarioManager.formatCurrency(stats.avgCost);
        document.getElementById('totalParticipants').textContent = stats.totalParticipants;
        document.getElementById('totalDestinations').textContent = stats.destinations;

        // Update scenarios grid
        const grid = document.getElementById('scenariosGrid');
        
        if (scenarios.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🧳</div>
                    <h3>Nessuno scenario creato</h3>
                    <p>Inizia creando il tuo primo business case per un viaggio</p>
                    <button class="btn btn-primary" onclick="App.createNewScenario()">
                        + Crea Primo Scenario
                    </button>
                </div>
            `;
        } else {
            grid.innerHTML = scenarios.map(scenario => this.createScenarioCard(scenario)).join('');
            
            // Applica temi alle card
            if (typeof destinationThemes !== 'undefined') {
                grid.querySelectorAll('.scenario-card').forEach(card => {
                    const destination = card.dataset.destination;
                    if (destination) {
                        destinationThemes.applyThemeToCard(card, destination);
                    }
                });
            }
            
            // Add click handlers for cards and action buttons
            grid.querySelectorAll('.scenario-card').forEach(card => {
                const cardId = card.dataset.id;
                
                // Handler per il click sulla card (visualizza lo scenario in sola lettura)
                card.addEventListener('click', (e) => {
                    // Ignora il click se è su un pulsante di azione
                    if (e.target.closest('.scenario-action-btn')) {
                        return;
                    }
                    e.preventDefault();
                    console.log('Click su scenario (visualizzazione):', cardId);
                    this.viewScenario(cardId);
                });

                // Handler per i pulsanti di azione
                const actionButtons = card.querySelectorAll('.scenario-action-btn');
                actionButtons.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation(); // Previene il click sulla card
                        
                        const action = btn.dataset.action;
                        const id = btn.dataset.id;
                        
                        console.log('🖱️ Click su pulsante azione (Dashboard):', action, 'ID:', id);
                        
                        if (action === 'delete') {
                            this.deleteScenarioFromDashboard(id);
                        } else if (action === 'edit') {
                            console.log('✏️ Chiamata editScenario con ID:', id);
                            this.editScenario(id);
                        }
                    });
                });
            });
        }
    },

    // Elimina uno scenario dalla dashboard
    async deleteScenarioFromDashboard(id) {
        const scenario = await StorageManager.getScenario(id);
        if (!scenario) return;

        if (confirm(`Sei sicuro di voler eliminare lo scenario "${scenario.name}"?\n\nQuesta operazione non può essere annullata.`)) {
            const deleted = await StorageManager.deleteScenario(id);
            if (deleted) {
                ExportManager.showSuccess('Scenario eliminato con successo');
                this.loadDashboard(); // Ricarica la dashboard
            } else {
                ExportManager.showError('Errore nell\'eliminazione dello scenario');
            }
        }
    },

    // Crea una card per lo scenario
    createScenarioCard(scenario) {
        const total = ScenarioManager.calculateTotal(scenario.expenses);
        const costPerPerson = ScenarioManager.calculateCostPerPerson(scenario.expenses, scenario.participants.length);
        const duration = ScenarioManager.calculateDuration(scenario.startDate, scenario.endDate);
        
        // Ottieni la bandiera per la destinazione
        const flag = typeof destinationThemes !== 'undefined' && scenario.destination
            ? destinationThemes.getFlag(scenario.destination)
            : '';

        return `
            <div class="scenario-card" data-id="${scenario.id}" data-destination="${scenario.destination || ''}">
                <div class="scenario-card-actions">
                    <button class="scenario-action-btn edit-btn" data-action="edit" data-id="${scenario.id}" title="Modifica scenario">
                        ✏️
                    </button>
                    <button class="scenario-action-btn delete-btn" data-action="delete" data-id="${scenario.id}" title="Elimina scenario">
                        🗑️
                    </button>
                </div>
                <div class="scenario-card-header">
                    <h3 class="scenario-title">${flag}${scenario.name}</h3>
                    <div class="destination scenario-destination">📍 ${scenario.destination}</div>
                </div>
                <div class="scenario-card-body">
                    <div class="scenario-info">
                        ${scenario.startDate ? `
                            <div class="info-row">
                                <span class="info-label">📅 Periodo:</span>
                                <span class="info-value">${ScenarioManager.formatDate(scenario.startDate)} - ${ScenarioManager.formatDate(scenario.endDate)}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">⏱️ Durata:</span>
                                <span class="info-value">${duration} giorni</span>
                            </div>
                        ` : ''}
                        <div class="info-row">
                            <span class="info-label">👥 Partecipanti:</span>
                            <span class="info-value">${scenario.participants.length}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">💰 Per persona:</span>
                            <span class="info-value">${ScenarioManager.formatCurrency(costPerPerson)}</span>
                        </div>
                        ${scenario.notes ? `
                            <div class="info-row" style="grid-column: 1 / -1; margin-top: 0.5rem;">
                                <div style="font-size: 0.875rem; color: #6b7280; line-height: 1.5;">
                                    ${typeof linkifyText !== 'undefined' ? linkifyText(scenario.notes) : scenario.notes.replace(/\n/g, '<br>')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="scenario-total">
                        <span class="total-label">Totale:</span>
                        <span class="total-amount">${ScenarioManager.formatCurrency(total)}</span>
                    </div>
                </div>
            </div>
        `;
    },

    // Carica la lista degli scenari
    async loadScenariosList() {
        const scenarios = await StorageManager.getScenarios() || [];
        const list = document.getElementById('scenariosList');

        console.log('loadScenariosList - scenari trovati:', scenarios.length, scenarios);

        if (!list) {
            console.error('Elemento scenariosList non trovato nel DOM');
            return;
        }

        if (scenarios.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <h3>Nessuno scenario disponibile</h3>
                    <p>Crea il tuo primo scenario per iniziare</p>
                    <button class="btn btn-primary" onclick="App.createNewScenario()">
                        + Crea Primo Scenario
                    </button>
                </div>
            `;
            return;
        }

        // Genera le card degli scenari
        const cardsHTML = scenarios.map(scenario => {
            const safeScenario = {
                ...scenario,
                participants: Array.isArray(scenario.participants) ? scenario.participants : [],
                expenses: scenario.expenses || {
                    transport: 0,
                    accommodation: 0,
                    food: 0,
                    car: 0,
                    activities: 0,
                    other: 0
                }
            };

            const total = ScenarioManager.calculateTotal(safeScenario.expenses);
            const costPerPerson = ScenarioManager.calculateCostPerPerson(safeScenario.expenses, safeScenario.participants.length);
            const duration = ScenarioManager.calculateDuration(safeScenario.startDate, safeScenario.endDate);
            
            // Ottieni la bandiera per la destinazione
            const flag = typeof destinationThemes !== 'undefined' && safeScenario.destination
                ? destinationThemes.getFlag(safeScenario.destination)
                : '';

            return `
                <div class="scenario-card" data-id="${safeScenario.id}" data-destination="${safeScenario.destination || ''}" role="button" tabindex="0" aria-label="Apri scenario ${safeScenario.name || 'senza nome'}">
                    <div class="scenario-card-actions">
                        <button class="scenario-action-btn edit-btn" data-action="edit" data-id="${safeScenario.id}" title="Modifica scenario">
                            ✏️
                        </button>
                        <button class="scenario-action-btn delete-btn" data-action="delete" data-id="${safeScenario.id}" title="Elimina scenario">
                            🗑️
                        </button>
                    </div>
                    <div class="scenario-card-header">
                        <h3 class="scenario-title">${flag}${safeScenario.name || 'Scenario senza nome'}</h3>
                        <div class="destination scenario-destination">📍 ${safeScenario.destination || 'Destinazione non indicata'}</div>
                    </div>
                    <div class="scenario-card-body">
                        <div class="scenario-info">
                            ${safeScenario.startDate ? `
                                <div class="info-row">
                                    <span class="info-label">📅 Periodo:</span>
                                    <span class="info-value">${ScenarioManager.formatDate(safeScenario.startDate)}${safeScenario.endDate ? ` - ${ScenarioManager.formatDate(safeScenario.endDate)}` : ''}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">⏱️ Durata:</span>
                                    <span class="info-value">${duration} giorni</span>
                                </div>
                            ` : ''}
                            <div class="info-row">
                                <span class="info-label">👥 Partecipanti:</span>
                                <span class="info-value">${safeScenario.participants.length}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">💰 Per persona:</span>
                                <span class="info-value">${ScenarioManager.formatCurrency(costPerPerson)}</span>
                            </div>
                            ${safeScenario.notes ? `
                                <div class="info-row" style="grid-column: 1 / -1; margin-top: 0.5rem;">
                                    <div style="font-size: 0.875rem; color: #6b7280; line-height: 1.5;">
                                        ${typeof linkifyText !== 'undefined' ? linkifyText(safeScenario.notes) : safeScenario.notes.replace(/\n/g, '<br>')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        <div class="scenario-total">
                            <span class="total-label">Totale:</span>
                            <span class="total-amount">${ScenarioManager.formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        list.innerHTML = cardsHTML;

        // Applica temi alle card
        if (typeof destinationThemes !== 'undefined') {
            list.querySelectorAll('.scenario-card').forEach(card => {
                const destination = card.dataset.destination;
                if (destination) {
                    destinationThemes.applyThemeToCard(card, destination);
                }
            });
        }

        // Aggiungi event listeners alle card e ai pulsanti di azione
        list.querySelectorAll('.scenario-card').forEach(card => {
            const cardId = card.dataset.id;
            
            // Handler per il click sulla card (visualizza lo scenario in sola lettura)
            const openScenario = (e) => {
                // Ignora il click se è su un pulsante di azione
                if (e.target.closest('.scenario-action-btn')) {
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                console.log('Visualizzazione scenario con ID:', cardId);
                this.viewScenario(cardId);
            };

            card.addEventListener('click', openScenario);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    if (!e.target.closest('.scenario-action-btn')) {
                        e.preventDefault();
                        openScenario(e);
                    }
                }
            });

            // Handler per i pulsanti di azione
            const actionButtons = card.querySelectorAll('.scenario-action-btn');
            actionButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation(); // Previene il click sulla card
                    
                    const action = btn.dataset.action;
                    const id = btn.dataset.id;
                    
                    console.log('🖱️ Click su pulsante azione (Lista Scenari):', action, 'ID:', id);
                    
                    if (action === 'delete') {
                        this.deleteScenarioFromList(id);
                    } else if (action === 'edit') {
                        console.log('✏️ Chiamata editScenario con ID:', id);
                        this.editScenario(id);
                    }
                });
            });
        });

        console.log('Scenari caricati e event listeners aggiunti');
    },

    // Elimina uno scenario dalla lista scenari
    async deleteScenarioFromList(id) {
        const scenario = await StorageManager.getScenario(id);
        if (!scenario) return;

        if (confirm(`Sei sicuro di voler eliminare lo scenario "${scenario.name}"?\n\nQuesta operazione non può essere annullata.`)) {
            const deleted = await StorageManager.deleteScenario(id);
            if (deleted) {
                ExportManager.showSuccess('Scenario eliminato con successo');
                this.loadScenariosList(); // Ricarica la lista
            } else {
                ExportManager.showError('Errore nell\'eliminazione dello scenario');
            }
        }
    },

    // Carica la vista di confronto
    async loadCompareView() {
        const scenarios = await StorageManager.getScenarios();
        const checkboxes = document.getElementById('compareCheckboxes');

        if (scenarios.length === 0) {
            checkboxes.innerHTML = '<p>Nessuno scenario disponibile per il confronto</p>';
            document.getElementById('compareBtn').disabled = true;
            return;
        }

        checkboxes.innerHTML = scenarios.map(scenario => `
            <label class="checkbox-item">
                <input type="checkbox" value="${scenario.id}">
                <span>${scenario.name} - ${scenario.destination}</span>
            </label>
        `).join('');

        document.getElementById('compareBtn').disabled = false;
        document.getElementById('compareResults').innerHTML = '';
    },

    // Confronta gli scenari selezionati
    compareSelectedScenarios() {
        const checkboxes = document.querySelectorAll('#compareCheckboxes input[type="checkbox"]:checked');
        const selectedIds = Array.from(checkboxes).map(cb => cb.value);

        if (selectedIds.length < 2) {
            ExportManager.showError('Seleziona almeno 2 scenari da confrontare');
            return;
        }

        const comparison = ScenarioManager.compareScenarios(selectedIds);
        this.displayComparison(comparison);
    },

    // Visualizza il confronto
    async displayComparison(comparison) {
        const results = document.getElementById('compareResults');
        
        let html = '<h3>Risultati del Confronto</h3>';

        // Summary stats
        html += `
            <div class="comparison-summary">
                <div class="comparison-summary-item">
                    <div class="comparison-summary-label">💰 Costo Minimo</div>
                    <div class="comparison-summary-value">${ScenarioManager.formatCurrency(comparison.summary.minCost)}</div>
                </div>
                <div class="comparison-summary-item">
                    <div class="comparison-summary-label">💸 Costo Massimo</div>
                    <div class="comparison-summary-value">${ScenarioManager.formatCurrency(comparison.summary.maxCost)}</div>
                </div>
                <div class="comparison-summary-item">
                    <div class="comparison-summary-label">📊 Costo Medio</div>
                    <div class="comparison-summary-value">${ScenarioManager.formatCurrency(comparison.summary.avgCost)}</div>
                </div>
                <div class="comparison-summary-item">
                    <div class="comparison-summary-label">👤 Min per Persona</div>
                    <div class="comparison-summary-value">${ScenarioManager.formatCurrency(comparison.summary.minCostPerPerson)}</div>
                </div>
            </div>
        `;

        // Find best value scenario
        const bestValueIndex = comparison.scenarios.findIndex(s => s.total === comparison.summary.minCost);

        // E-commerce style comparison cards
        html += '<div class="comparison-cards-container">';
        
        comparison.scenarios.forEach((s, index) => {
            const isBestValue = index === bestValueIndex;
            const categoryLabels = ScenarioManager.getCategoryLabels();
            
            html += `
                <div class="comparison-card ${isBestValue ? 'best-value' : ''}">
                    <div class="comparison-card-header">
                        <div class="comparison-card-title">${s.name}</div>
                        <div class="comparison-card-destination">
                            📍 ${s.destination}
                        </div>
                    </div>
                    
                    <div class="comparison-price-section">
                        <div class="comparison-total-price">${ScenarioManager.formatCurrency(s.total)}</div>
                        <div class="comparison-per-person">
                            <span class="comparison-per-person-price">${ScenarioManager.formatCurrency(s.costPerPerson)}</span>
                            per persona
                        </div>
                    </div>
                    
                    <div class="comparison-details">
                        <div class="comparison-detail-row">
                            <span class="comparison-detail-label">👥 Partecipanti</span>
                            <span class="comparison-detail-value">${s.participants}</span>
                        </div>
                        <div class="comparison-detail-row">
                            <span class="comparison-detail-label">📅 Durata</span>
                            <span class="comparison-detail-value">${s.duration} giorni</span>
                        </div>
                        <div class="comparison-detail-row">
                            <span class="comparison-detail-label">💵 Costo/Giorno</span>
                            <span class="comparison-detail-value">${ScenarioManager.formatCurrency(s.total / s.duration)}</span>
                        </div>
                    </div>
                    
                    <div class="comparison-expenses">
                        <div class="comparison-expenses-title">Dettaglio Spese</div>
            `;
            
            // Add expense breakdown
            for (const [category, amount] of Object.entries(s.expenses)) {
                if (amount > 0) {
                    const perPerson = s.participants > 0 ? amount / s.participants : 0;
                    html += `
                        <div class="comparison-expense-item">
                            <span class="comparison-expense-label">${categoryLabels[category]}</span>
                            <span class="comparison-expense-value">
                                ${ScenarioManager.formatCurrency(amount)}
                                <span class="comparison-expense-per-person">
                                    (${ScenarioManager.formatCurrency(perPerson)}/p)
                                </span>
                            </span>
                        </div>
                    `;
                }
            }
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += '</div>';

        // Collapsible charts section
        html += `
            <div class="comparison-charts-section">
                <div class="comparison-charts-toggle" onclick="this.classList.toggle('collapsed'); document.getElementById('chartsContent').classList.toggle('hidden');">
                    <h4>
                        <span class="comparison-charts-toggle-icon">▼</span>
                        Grafici di Confronto (clicca per mostrare/nascondere)
                    </h4>
                </div>
                <div id="chartsContent" class="comparison-charts-content hidden">
                    <div class="chart-container">
                        <h4>📊 Confronto Costi Totali</h4>
                        <canvas id="comparisonBarChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h4>🎯 Distribuzione per Categoria</h4>
                        <canvas id="categoryComparisonChart"></canvas>
                    </div>
                </div>
            </div>
        `;

        results.innerHTML = html;

        // Create charts (they'll be hidden initially)
        const scenarios = await Promise.all(comparison.scenarios.map(async s => {
            const fullScenario = await StorageManager.getScenario(s.id);
            return fullScenario;
        }));

        setTimeout(() => {
            ChartsManager.createComparisonBarChart('comparisonBarChart', scenarios);
            ChartsManager.createCategoryComparisonChart('categoryComparisonChart', scenarios);
        }, 100);
    },

    // Crea un nuovo scenario
    createNewScenario() {
        this.currentScenario = null;
        this.loadScenarioForm(ScenarioManager.createEmptyScenario());
        
        // IMPORTANTE: Rimuovi l'ID dello scenario dal form per indicare che è nuovo
        const form = document.getElementById('scenarioForm');
        if (form) {
            delete form.dataset.scenarioId;
        }
        
        document.getElementById('scenarioTitle').textContent = 'Nuovo Scenario';
        document.getElementById('deleteScenarioBtn').style.display = 'none';
        document.getElementById('duplicateScenarioBtn').style.display = 'none';

        const saveBtn = document.querySelector('#scenarioForm button[type="submit"]');
        if (saveBtn) {
            saveBtn.textContent = '💾 Salva Scenario';
        }

        const saveAsNewBtn = document.getElementById('saveAsNewBtn');
        if (saveAsNewBtn) {
            saveAsNewBtn.style.display = 'none';
        }

        this.showView('scenarioDetailView');
    },

    // Modifica uno scenario esistente
    async editScenario(id) {
        console.log('🔧 editScenario chiamato con ID:', id);
        try {
            const scenario = await StorageManager.getScenario(id);
            console.log('📋 Scenario caricato:', scenario ? scenario.name : 'NON TROVATO', 'ID:', scenario?.id);

            if (scenario) {
                this.currentScenario = scenario;
                console.log('✅ this.currentScenario impostato:', this.currentScenario.name, 'ID:', this.currentScenario.id);
                
                this.loadScenarioForm(scenario);
                
                // IMPORTANTE: Salva l'ID dello scenario nel form per evitare confusione
                const form = document.getElementById('scenarioForm');
                if (form) {
                    form.dataset.scenarioId = scenario.id;
                    console.log('✅ ID salvato nel form:', form.dataset.scenarioId);
                }
                
                document.getElementById('scenarioTitle').textContent = `✏️ Modifica Scenario: ${scenario.name}`;
                document.getElementById('deleteScenarioBtn').style.display = 'inline-flex';
                document.getElementById('duplicateScenarioBtn').style.display = 'inline-flex';

                // Nascondi il pulsante "Modifica" dell'header (se esiste)
                const editHeaderBtn = document.getElementById('editHeaderBtn');
                if (editHeaderBtn) {
                    editHeaderBtn.style.display = 'none';
                }

                const saveBtn = document.querySelector('#scenarioForm button[type="submit"]');
                if (saveBtn) {
                    saveBtn.textContent = '💾 Salva Modifiche';
                    // Ripristina il comportamento normale del submit
                    saveBtn.onclick = null;
                }

                let saveAsNewBtn = document.getElementById('saveAsNewBtn');
                if (!saveAsNewBtn) {
                    saveAsNewBtn = document.createElement('button');
                    saveAsNewBtn.id = 'saveAsNewBtn';
                    saveAsNewBtn.type = 'button';
                    saveAsNewBtn.className = 'btn btn-secondary';
                    saveAsNewBtn.textContent = '📋 Salva come Nuovo';
                    saveAsNewBtn.addEventListener('click', () => {
                        this.saveAsNewScenario();
                    });
                    const formActions = document.querySelector('.form-actions');
                    formActions.insertBefore(saveAsNewBtn, formActions.firstChild);
                }
                saveAsNewBtn.style.display = 'inline-flex';

                // Abilita tutti i campi del form per la modifica
                this.setFormReadOnly(false);

                this.showView('scenarioDetailView');
            } else {
                ExportManager.showError('Scenario non trovato');
            }
        } catch (error) {
            console.error('Errore nel caricamento dello scenario:', error);
            ExportManager.showError('Errore nel caricamento dello scenario: ' + error.message);
        }
    },

    // Visualizza uno scenario in modalità sola lettura
    async viewScenario(id) {
        try {
            const scenario = await StorageManager.getScenario(id);

            if (scenario) {
                this.currentScenario = scenario;
                this.loadScenarioForm(scenario);
                
                // IMPORTANTE: Salva l'ID dello scenario nel form
                const form = document.getElementById('scenarioForm');
                if (form) {
                    form.dataset.scenarioId = scenario.id;
                }
                
                document.getElementById('scenarioTitle').textContent = `📋 ${scenario.name}`;
                
                // Nascondi pulsanti di eliminazione e duplicazione
                document.getElementById('deleteScenarioBtn').style.display = 'none';
                document.getElementById('duplicateScenarioBtn').style.display = 'none';

                // Aggiungi o mostra il pulsante "Modifica Scenario" a destra del titolo
                let editHeaderBtn = document.getElementById('editHeaderBtn');
                if (!editHeaderBtn) {
                    editHeaderBtn = document.createElement('button');
                    editHeaderBtn.id = 'editHeaderBtn';
                    editHeaderBtn.className = 'btn btn-primary';
                    editHeaderBtn.textContent = '✏️ Modifica Scenario';
                    // Inserisci il pulsante dopo il titolo (h2)
                    const scenarioTitle = document.getElementById('scenarioTitle');
                    scenarioTitle.parentNode.insertBefore(editHeaderBtn, scenarioTitle.nextSibling);
                }
                
                // CORREZIONE BUG: Aggiorna sempre il data-id e ricrea l'event listener
                editHeaderBtn.dataset.scenarioId = id;
                editHeaderBtn.onclick = () => {
                    const scenarioId = editHeaderBtn.dataset.scenarioId;
                    console.log('🖱️ Click su pulsante Modifica Header, ID:', scenarioId);
                    this.editScenario(scenarioId);
                };
                editHeaderBtn.style.display = 'inline-flex';

                // Nascondi il pulsante "Salva come Nuovo"
                const saveAsNewBtn = document.getElementById('saveAsNewBtn');
                if (saveAsNewBtn) {
                    saveAsNewBtn.style.display = 'none';
                }

                // Cambia il pulsante submit in "Modifica"
                const saveBtn = document.querySelector('#scenarioForm button[type="submit"]');
                if (saveBtn) {
                    saveBtn.textContent = '✏️ Modifica Scenario';
                    saveBtn.dataset.scenarioId = id;
                    saveBtn.onclick = (e) => {
                        e.preventDefault();
                        const scenarioId = saveBtn.dataset.scenarioId;
                        console.log('🖱️ Click su pulsante Modifica Form, ID:', scenarioId);
                        this.editScenario(scenarioId);
                    };
                }

                // Disabilita tutti i campi del form
                this.setFormReadOnly(true);

                this.showView('scenarioDetailView');
            } else {
                ExportManager.showError('Scenario non trovato');
            }
        } catch (error) {
            console.error('Errore nel caricamento dello scenario:', error);
            ExportManager.showError('Errore nel caricamento dello scenario: ' + error.message);
        }
    },

    // Imposta il form in modalità sola lettura o modifica
    setFormReadOnly(readOnly) {
        // Disabilita/abilita tutti gli input, textarea e select
        const formElements = document.querySelectorAll('#scenarioForm input, #scenarioForm textarea, #scenarioForm select, #scenarioForm button:not([type="submit"])');
        formElements.forEach(element => {
            if (readOnly) {
                element.setAttribute('readonly', 'readonly');
                element.setAttribute('disabled', 'disabled');
                element.style.pointerEvents = 'none';
                element.style.opacity = '0.7';
            } else {
                element.removeAttribute('readonly');
                element.removeAttribute('disabled');
                element.style.pointerEvents = '';
                element.style.opacity = '';
            }
        });

        // Gestisci i pulsanti di azione nelle sezioni
        const actionButtons = document.querySelectorAll('.add-option-btn, .remove-option-btn, .select-option-btn, #addParticipantBtn, .remove-participant-btn');
        actionButtons.forEach(btn => {
            btn.style.display = readOnly ? 'none' : '';
        });
    },

    // Carica il form dello scenario
    loadScenarioForm(scenario) {
        console.log('=== loadScenarioForm INIZIO ===');
        console.log('📝 Scenario ricevuto:', scenario ? scenario.name : 'NULL', 'ID:', scenario?.id);
        console.log('👥 Partecipanti nello scenario:', scenario?.participants);
        console.log('💰 Spese nello scenario:', scenario?.expenses);
        try {
            document.getElementById('scenarioName').value = scenario.name || '';
            document.getElementById('destination').value = scenario.destination || '';
            document.getElementById('startDate').value = scenario.startDate || '';
            document.getElementById('endDate').value = scenario.endDate || '';
            
            // Carica i dati del volo se presenti
            document.getElementById('flightDeparture').value = scenario.flightDeparture || '';
            document.getElementById('flightArrival').value = scenario.flightArrival || '';
            document.getElementById('flightNotes').value = scenario.flightNotes || '';
            
            document.getElementById('transport').value = scenario.expenses?.transport || 0;
            document.getElementById('food').value = scenario.expenses?.food || 0;
            document.getElementById('activities').value = scenario.expenses?.activities || 0;
            document.getElementById('notes').value = scenario.notes || '';

            // Carica le opzioni di alloggio
            AccommodationCarManager.loadAccommodationOptions(scenario.accommodationOptions || []);
            if (scenario.selectedAccommodationIndex !== undefined) {
                AccommodationCarManager.setSelectedAccommodationIndex(scenario.selectedAccommodationIndex);
            }

            // Carica le opzioni auto
            AccommodationCarManager.loadCarOptions(scenario.carOptions || []);

            // Carica le opzioni "Altro"
            AccommodationCarManager.loadOtherOptions(scenario.otherOptions || []);

            // IMPORTANTE: Prima pulisci completamente la lista partecipanti
            const list = document.getElementById('participantsList');
            if (list) {
                list.innerHTML = '';
            }
            
            // Poi carica i partecipanti dello scenario
            this.loadParticipants(scenario.participants || []);
            
            // Infine carica il selettore dall'anagrafica
            this.loadParticipantSelector();
            
            // Inizializza l'autocomplete per la destinazione
            this.initDestinationAutocomplete();
            
            this.updateTotals();
            
            console.log('=== loadScenarioForm FINE ===');
        } catch (error) {
            console.error('Errore nel caricamento del form:', error);
            ExportManager.showError('Errore nel caricamento dello scenario');
        }
    },

    // Carica i partecipanti
    loadParticipants(participants) {
        const list = document.getElementById('participantsList');
        const emptyState = document.getElementById('participantsEmptyState');
        const clearBtn = document.getElementById('clearParticipantsBtn');
        
        // SEMPRE pulisci la lista prima di caricare i partecipanti
        list.innerHTML = '';
        
        if (participants.length === 0) {
            list.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            if (clearBtn) clearBtn.style.display = 'none';
        } else {
            // Normalizza i nomi usando l'anagrafica con fuzzy matching
            const normalizedParticipants = participants.map(p => {
                if (typeof participantsRegistry !== 'undefined') {
                    // Prima prova match esatto
                    let registryParticipant = participantsRegistry.getByName(p);
                    
                    // Se non trovato, prova fuzzy match
                    if (!registryParticipant && participantsRegistry.getByNameFuzzy) {
                        registryParticipant = participantsRegistry.getByNameFuzzy(p);
                        if (registryParticipant) {
                            console.log(`Fuzzy match: "${p}" → "${registryParticipant.name}"`);
                        }
                    }
                    
                    if (registryParticipant) {
                        return registryParticipant.name; // Usa il nome dall'anagrafica
                    }
                }
                return p; // Fallback al nome originale se non trovato
            });

            list.innerHTML = normalizedParticipants.map(p => {
                const escapedName = p.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
                return `
                    <div class="participant-tag">
                        <span>${escapedName}</span>
                        <button type="button" class="remove-participant-btn" data-participant="${p}" title="Rimuovi ${escapedName}">×</button>
                    </div>
                `;
            }).join('');
            list.style.display = 'grid';
            if (emptyState) emptyState.style.display = 'none';
            if (clearBtn) clearBtn.style.display = 'inline-block';
        }
    },

    // Aggiungi partecipante
    addParticipant() {
        const input = document.getElementById('newParticipant');
        const name = input.value.trim();
        
        if (name) {
            this.addParticipantToList(name);
            input.value = '';
            
            // Aggiungi all'anagrafica se non esiste
            if (typeof participantsRegistry !== 'undefined') {
                participantsRegistry.addOrGet(name);
            }
        }
    },

    // Aggiungi partecipante alla lista (helper)
    addParticipantToList(name) {
        // Verifica se già presente
        const existing = Array.from(document.querySelectorAll('.participant-tag span'))
            .find(span => span.textContent === name);
        
        if (existing) {
            showToast('Partecipante già aggiunto', 'error');
            return;
        }

        const list = document.getElementById('participantsList');
        const emptyState = document.getElementById('participantsEmptyState');
        const clearBtn = document.getElementById('clearParticipantsBtn');
        
        // Nascondi lo stato vuoto e mostra la lista e il pulsante azzera
        list.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';
        if (clearBtn) clearBtn.style.display = 'inline-block';
        
        // Escape HTML per sicurezza ma mantieni il nome originale nel data attribute
        const escapedName = name.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
        
        const tag = document.createElement('div');
        tag.className = 'participant-tag';
        tag.innerHTML = `
            <span>${escapedName}</span>
            <button type="button" class="remove-participant-btn" data-participant="${name}" title="Rimuovi ${escapedName}">×</button>
        `;
        list.appendChild(tag);
        this.updateTotals();
    },

    // Carica il selettore partecipanti dall'anagrafica
    loadParticipantSelector() {
        const container = document.getElementById('participantSelectorList');
        if (!container || typeof participantsRegistry === 'undefined') return;

        const participants = participantsRegistry.getAllSorted();
        
        if (participants.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
                    Nessun partecipante in anagrafica.<br>
                    <a href="#" onclick="App.switchView('participants'); return false;" style="color: var(--primary-color);">
                        Vai all'Anagrafica
                    </a> per aggiungerne.
                </div>
            `;
            return;
        }

        // Ottieni i partecipanti già aggiunti
        const addedParticipants = Array.from(document.querySelectorAll('.participant-tag span'))
            .map(span => span.textContent);

        container.innerHTML = participants.map(p => {
            const isAdded = addedParticipants.includes(p.name);
            return `
                <div class="participant-option ${isAdded ? 'disabled' : ''}" onclick="App.selectParticipantFromRegistry('${p.name.replace(/'/g, "\\'")}')">
                    <span class="participant-option-name">${p.name}</span>
                    ${p.email ? `<span class="participant-option-info">📧 ${p.email}</span>` : ''}
                    ${isAdded ? '<span class="participant-option-added">✓ Aggiunto</span>' : ''}
                </div>
            `;
        }).join('');
    },

    // Seleziona partecipante dall'anagrafica
    selectParticipantFromRegistry(name) {
        this.addParticipantToList(name);
        this.loadParticipantSelector(); // Ricarica per aggiornare lo stato
    },

    // Aggiorna il selettore partecipanti
    refreshParticipantSelector() {
        if (typeof autoSyncParticipants !== 'undefined') {
            autoSyncParticipants();
        }
        this.loadParticipantSelector();
        showToast('Anagrafica aggiornata', 'success');
    },

    // Rimuovi partecipante
    removeParticipant(name) {
        console.log('Tentativo rimozione partecipante:', name);
        
        const tags = document.querySelectorAll('.participant-tag');
        let removed = false;
        
        tags.forEach(tag => {
            const nameSpan = tag.querySelector('span');
            const removeBtn = tag.querySelector('.remove-participant-btn');
            
            // Confronta sia con textContent che con data-participant per gestire caratteri escaped
            if (nameSpan && (nameSpan.textContent === name ||
                (removeBtn && removeBtn.dataset.participant === name))) {
                console.log('Rimozione tag per:', nameSpan.textContent);
                tag.remove();
                removed = true;
            }
        });
        
        if (removed) {
            // Mostra lo stato vuoto e nascondi il pulsante azzera se non ci sono più partecipanti
            const list = document.getElementById('participantsList');
            const emptyState = document.getElementById('participantsEmptyState');
            const clearBtn = document.getElementById('clearParticipantsBtn');
            
            if (list && list.children.length === 0) {
                list.style.display = 'none';
                if (emptyState) emptyState.style.display = 'block';
                if (clearBtn) clearBtn.style.display = 'none';
            }
            
            this.updateTotals();
            this.loadParticipantSelector(); // Aggiorna il selettore
            showToast('Partecipante rimosso', 'success');
        } else {
            console.warn('Partecipante non trovato:', name);
        }
    },

    // Azzera tutti i partecipanti
    clearAllParticipants() {
        if (confirm('Sei sicuro di voler rimuovere tutti i partecipanti?')) {
            const list = document.getElementById('participantsList');
            const emptyState = document.getElementById('participantsEmptyState');
            const clearBtn = document.getElementById('clearParticipantsBtn');
            
            // Rimuovi tutti i tag
            if (list) {
                list.innerHTML = '';
                list.style.display = 'none';
            }
            
            // Mostra lo stato vuoto e nascondi il pulsante azzera
            if (emptyState) emptyState.style.display = 'block';
            if (clearBtn) clearBtn.style.display = 'none';
            
            this.updateTotals();
            this.loadParticipantSelector(); // Aggiorna il selettore
            showToast('Tutti i partecipanti sono stati rimossi', 'success');
        }
    },

    // Aggiorna i totali
    updateTotals() {
        const accommodationTotal = AccommodationCarManager.calculateAccommodationTotal();
        const carTotal = AccommodationCarManager.calculateCarTotal();
        const otherTotal = AccommodationCarManager.calculateOtherTotal();

        const expenses = {
            transport: parseFloat(document.getElementById('transport').value) || 0,
            accommodation: accommodationTotal,
            food: parseFloat(document.getElementById('food').value) || 0,
            car: carTotal,
            activities: parseFloat(document.getElementById('activities').value) || 0,
            other: otherTotal
        };

        const participants = document.querySelectorAll('.participant-tag').length;
        const total = ScenarioManager.calculateTotal(expenses);
        const costPerPerson = ScenarioManager.calculateCostPerPerson(expenses, participants);

        document.getElementById('totalCost').textContent = ScenarioManager.formatCurrency(total);
        document.getElementById('costPerPerson').textContent = ScenarioManager.formatCurrency(costPerPerson);
    },

    // Salva lo scenario
    saveScenario() {
        const participants = Array.from(document.querySelectorAll('.participant-tag span')).map(span => span.textContent);
        
        // Rimuovi duplicati dai partecipanti (protezione aggiuntiva)
        const uniqueParticipants = [...new Set(participants)];
        
        if (participants.length !== uniqueParticipants.length) {
            console.warn('Trovati partecipanti duplicati, rimossi automaticamente');
        }
        
        const accommodationTotal = AccommodationCarManager.calculateAccommodationTotal();
        const carTotal = AccommodationCarManager.calculateCarTotal();
        const otherTotal = AccommodationCarManager.calculateOtherTotal();

        const scenarioData = {
            name: document.getElementById('scenarioName').value,
            destination: document.getElementById('destination').value,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            flightDeparture: document.getElementById('flightDeparture').value,
            flightArrival: document.getElementById('flightArrival').value,
            flightNotes: document.getElementById('flightNotes').value,
            participants: uniqueParticipants,
            expenses: {
                transport: parseFloat(document.getElementById('transport').value) || 0,
                accommodation: accommodationTotal,
                food: parseFloat(document.getElementById('food').value) || 0,
                car: carTotal,
                activities: parseFloat(document.getElementById('activities').value) || 0,
                other: otherTotal
            },
            notes: document.getElementById('notes').value,
            accommodationOptions: AccommodationCarManager.saveAccommodationOptions(),
            selectedAccommodationIndex: AccommodationCarManager.getSelectedAccommodationIndex(),
            carOptions: AccommodationCarManager.saveCarOptions(),
            otherOptions: AccommodationCarManager.saveOtherOptions()
        };

        const validation = ScenarioManager.validateScenario(scenarioData);
        if (!validation.isValid) {
            ExportManager.showError(validation.errors.join(', '));
            return;
        }

        // CORREZIONE BUG: Usa l'ID salvato nel form invece di this.currentScenario
        const form = document.getElementById('scenarioForm');
        const scenarioId = form ? form.dataset.scenarioId : null;
        
        console.log('💾 Salvataggio scenario - ID dal form:', scenarioId);
        console.log('💾 Salvataggio scenario - this.currentScenario:', this.currentScenario);

        if (scenarioId) {
            // Scenario esistente - chiedi conferma per sovrascrivere
            const overwriteExisting = confirm(
                `Vuoi sovrascrivere lo scenario esistente "${scenarioData.name}"?\n\n` +
                `Premi OK per sovrascrivere.\n` +
                `Premi Annulla per salvare come nuovo scenario.`
            );

            if (overwriteExisting) {
                console.log('✅ Aggiornamento scenario con ID:', scenarioId);
                StorageManager.updateScenario(scenarioId, scenarioData);
                ExportManager.showSuccess('Scenario sovrascritto');
            } else {
                StorageManager.addScenario({
                    ...scenarioData,
                    name: `${scenarioData.name} (Copia)`
                });
                ExportManager.showSuccess('Nuovo scenario creato');
            }
        } else {
            // Nuovo scenario
            console.log('✅ Creazione nuovo scenario');
            StorageManager.addScenario(scenarioData);
            ExportManager.showSuccess('Scenario creato');
        }

        this.switchView('scenarios');
    },

    // Salva come nuovo scenario
    saveAsNewScenario() {
        const participants = Array.from(document.querySelectorAll('.participant-tag span')).map(span => span.textContent);
        
        // Rimuovi duplicati dai partecipanti (protezione aggiuntiva)
        const uniqueParticipants = [...new Set(participants)];
        
        if (participants.length !== uniqueParticipants.length) {
            console.warn('Trovati partecipanti duplicati, rimossi automaticamente');
        }
        
        const accommodationTotal = AccommodationCarManager.calculateAccommodationTotal();
        const carTotal = AccommodationCarManager.calculateCarTotal();
        const otherTotal = AccommodationCarManager.calculateOtherTotal();

        const scenarioData = {
            name: document.getElementById('scenarioName').value + ' (Copia)',
            destination: document.getElementById('destination').value,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            flightDeparture: document.getElementById('flightDeparture').value,
            flightArrival: document.getElementById('flightArrival').value,
            flightNotes: document.getElementById('flightNotes').value,
            participants: uniqueParticipants,
            expenses: {
                transport: parseFloat(document.getElementById('transport').value) || 0,
                accommodation: accommodationTotal,
                food: parseFloat(document.getElementById('food').value) || 0,
                car: carTotal,
                activities: parseFloat(document.getElementById('activities').value) || 0,
                other: otherTotal
            },
            notes: document.getElementById('notes').value,
            accommodationOptions: AccommodationCarManager.saveAccommodationOptions(),
            selectedAccommodationIndex: AccommodationCarManager.getSelectedAccommodationIndex(),
            carOptions: AccommodationCarManager.saveCarOptions(),
            otherOptions: AccommodationCarManager.saveOtherOptions()
        };

        const validation = ScenarioManager.validateScenario(scenarioData);
        if (!validation.isValid) {
            ExportManager.showError(validation.errors.join(', '));
            return;
        }

        StorageManager.addScenario(scenarioData);
        ExportManager.showSuccess('Nuovo scenario creato');
        this.switchView('scenarios');
    },

    // Elimina lo scenario corrente
    deleteCurrentScenario() {
        if (!this.currentScenario) return;

        if (confirm(`Sei sicuro di voler eliminare lo scenario "${this.currentScenario.name}"?`)) {
            StorageManager.deleteScenario(this.currentScenario.id);
            ExportManager.showSuccess('Scenario eliminato');
            this.switchView('scenarios');
        }
    },

    // Duplica lo scenario corrente
    duplicateCurrentScenario() {
        if (!this.currentScenario) return;

        const duplicate = StorageManager.duplicateScenario(this.currentScenario.id);
        if (duplicate) {
            ExportManager.showSuccess('Scenario duplicato');
            this.editScenario(duplicate.id);
        }
    },

    // Mostra una vista specifica
    showView(viewId) {
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(viewId).classList.add('active');

        // Mantieni il tab attivo per le sotto-view
        if (viewId === 'actualDetailView' || viewId === 'accountsView' || viewId === 'settlementsView') {
            // Attiva il tab Consuntivi
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.view === 'actuals') {
                    btn.classList.add('active');
                }
            });
        } else if (viewId === 'scenarioDetailView' || viewId === 'compareView') {
            // Attiva il tab Preventivi per scenarioDetailView
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.view === 'scenarios') {
                    btn.classList.add('active');
                }
            });
        } else {
            // Per le view principali, attiva il tab corrispondente
            const mainView = viewId.replace('View', ''); // dashboardView -> dashboard
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.view === mainView) {
                    btn.classList.add('active');
                }
            });
        }
    },

    // Mostra il modal di export
    showExportModal() {
        document.getElementById('exportModal').classList.add('active');
    },

    // Nascondi il modal di export
    hideExportModal() {
        document.getElementById('exportModal').classList.remove('active');
    },

    // Esporta i dati
    exportData(format) {
        switch (format) {
            case 'json':
                ExportManager.exportJSON();
                break;
            case 'csv':
                ExportManager.exportCSV();
                break;
            case 'pdf':
                ExportManager.exportPDF();
                break;
        }
    },

    // Inizializza l'autocomplete per la destinazione
    initDestinationAutocomplete() {
        const destinationInput = document.getElementById('destination');
        if (destinationInput && typeof destinationAutocomplete !== 'undefined') {
            // Usa l'istanza globale già creata
            destinationAutocomplete.init(destinationInput);
        }
    }
};

// Inizializza l'app quando il DOM è pronto
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inizializzazione app...');
    
    // Aspetta che StorageManager abbia completato la sincronizzazione
    if (typeof StorageManager !== 'undefined' && StorageManager.init) {
        console.log('⏳ Attendo sincronizzazione StorageManager...');
        await StorageManager.init();
        console.log('✅ StorageManager pronto');
    }
    
    // Ora inizializza l'interfaccia
    App.init();
    console.log('✅ App inizializzata');
});

// Made with Bob
