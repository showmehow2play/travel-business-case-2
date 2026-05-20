// ===== Actuals UI Manager =====
// Gestisce l'interfaccia utente per i consuntivi

const ActualsUI = {
    currentActualId: null,
    currentExpenses: [],

    // Inizializza l'interfaccia consuntivi
    init() {
        this.setupEventListeners();
    },

    // Configura event listeners
    setupEventListeners() {
        // Nuovo consuntivo
        const newActualBtn = document.getElementById('newActualBtn');
        if (newActualBtn) {
            newActualBtn.addEventListener('click', () => {
                this.createNewActual();
            });
        }

        // Form consuntivo
        const actualForm = document.getElementById('actualForm');
        if (actualForm) {
            actualForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveActual();
            });
        }

        // Pulsanti navigazione
        const backActualBtn = document.getElementById('backActualBtn');
        if (backActualBtn) {
            backActualBtn.addEventListener('click', () => {
                App.switchView('actuals');
            });
        }

        const cancelActualBtn = document.getElementById('cancelActualBtn');
        if (cancelActualBtn) {
            cancelActualBtn.addEventListener('click', () => {
                App.switchView('actuals');
            });
        }

        // Elimina consuntivo
        const deleteActualBtn = document.getElementById('deleteActualBtn');
        if (deleteActualBtn) {
            deleteActualBtn.addEventListener('click', () => {
                this.deleteCurrentActual();
            });
        }

        // Visualizza Conti (dalla lista principale)
        const viewAccountsFromListBtn = document.getElementById('viewAccountsFromListBtn');
        if (viewAccountsFromListBtn) {
            viewAccountsFromListBtn.addEventListener('click', () => {
                this.viewAccountsFromList();
            });
        }

        // Visualizza Dare/Avere (dal dettaglio consuntivo)
        const viewSettlementsFromActualBtn = document.getElementById('viewSettlementsFromActualBtn');
        if (viewSettlementsFromActualBtn) {
            viewSettlementsFromActualBtn.addEventListener('click', () => {
                if (this.currentActual) {
                    this.viewSettlements(this.currentActual.id);
                } else if (this.currentActualId) {
                    // Fallback: usa currentActualId se currentActual non è disponibile
                    this.viewSettlements(this.currentActualId);
                }
            });
        }

        // Visualizza Conti (dal dettaglio consuntivo)
        const viewAccountsBtn = document.getElementById('viewAccountsBtn');
        if (viewAccountsBtn) {
            viewAccountsBtn.addEventListener('click', () => {
                this.viewAccounts();
            });
        }

        // Aggiungi partecipante
        const addActualParticipantBtn = document.getElementById('addActualParticipantBtn');
        if (addActualParticipantBtn) {
            addActualParticipantBtn.addEventListener('click', () => {
                this.addParticipant();
            });
        }

        const newActualParticipant = document.getElementById('newActualParticipant');
        if (newActualParticipant) {
            newActualParticipant.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addParticipant();
                }
            });
        }

        // Aggiungi spesa
        const addExpenseBtn = document.getElementById('addExpenseBtn');
        if (addExpenseBtn) {
            addExpenseBtn.addEventListener('click', () => {
                this.addExpense();
            });
        }

        // Pulsante aggiorna cambi nei consuntivi
        const updateExchangeRatesActualBtn = document.getElementById('updateExchangeRatesActualBtn');
        if (updateExchangeRatesActualBtn) {
            updateExchangeRatesActualBtn.addEventListener('click', () => {
                this.updateExchangeRatesAndRefresh();
            });
        }
    },

    // Carica lista consuntivi
    loadActualsList() {
        const actuals = StorageManager.getActuals() || [];
        const list = document.getElementById('actualsList');

        if (!list) return;

        if (actuals.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💰</div>
                    <h3>Nessun consuntivo disponibile</h3>
                    <p>Crea il tuo primo consuntivo di viaggio</p>
                    <button class="btn btn-primary" onclick="ActualsUI.createNewActual()">
                        + Crea Primo Consuntivo
                    </button>
                </div>
            `;
            return;
        }

        list.innerHTML = actuals.map(actual => this.createActualCard(actual)).join('');

        // Aggiungi event listeners
        list.querySelectorAll('.scenario-card').forEach(card => {
            const cardId = card.dataset.id;
            
            card.addEventListener('click', (e) => {
                if (e.target.closest('.scenario-action-btn')) {
                    return;
                }
                e.preventDefault();
                this.editActual(cardId);
            });

            // Pulsanti azione
            const actionButtons = card.querySelectorAll('.scenario-action-btn');
            actionButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const action = btn.dataset.action;
                    const id = btn.dataset.id;
                    
                    if (action === 'delete') {
                        this.deleteActualFromList(id);
                    } else if (action === 'edit') {
                        this.editActual(id);
                    }
                });
            });
        });
    },

    // Crea card consuntivo
    createActualCard(actual) {
        const total = ActualsManager.calculateTotal(actual.expenses);
        const costPerPerson = ActualsManager.calculateCostPerPerson(actual.expenses, actual.participants.length);
        const duration = ActualsManager.calculateDuration(actual.startDate, actual.endDate);

        return `
            <div class="scenario-card" data-id="${actual.id}">
                <div class="scenario-card-actions">
                    <button class="scenario-action-btn edit-btn" data-action="edit" data-id="${actual.id}" title="Modifica consuntivo">
                        ✏️
                    </button>
                    <button class="scenario-action-btn delete-btn" data-action="delete" data-id="${actual.id}" title="Elimina consuntivo">
                        🗑️
                    </button>
                </div>
                <div class="scenario-card-header">
                    <h3>${actual.name}</h3>
                    <div class="destination">📍 ${actual.destination}</div>
                </div>
                <div class="scenario-card-body">
                    <div class="scenario-info">
                        ${actual.startDate ? `
                            <div class="info-row">
                                <span class="info-label">📅 Periodo:</span>
                                <span class="info-value">${ActualsManager.formatDate(actual.startDate)} - ${ActualsManager.formatDate(actual.endDate)}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">⏱️ Durata:</span>
                                <span class="info-value">${duration} giorni</span>
                            </div>
                        ` : ''}
                        <div class="info-row">
                            <span class="info-label">👥 Partecipanti:</span>
                            <span class="info-value">${actual.participants.length}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">📝 Spese:</span>
                            <span class="info-value">${actual.expenses.length} voci</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">💰 Per persona:</span>
                            <span class="info-value">${ActualsManager.formatCurrency(costPerPerson)}</span>
                        </div>
                        ${actual.notes ? `
                            <div class="info-row" style="grid-column: 1 / -1; margin-top: 0.5rem;">
                                <div style="font-size: 0.875rem; color: #6b7280; line-height: 1.5;">
                                    ${typeof linkifyText !== 'undefined' ? linkifyText(actual.notes) : actual.notes.replace(/\n/g, '<br>')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="scenario-total">
                        <span class="total-label">Totale:</span>
                        <span class="total-amount">${ActualsManager.formatCurrency(total)}</span>
                    </div>
                </div>
            </div>
        `;
    },

    // Crea nuovo consuntivo
    createNewActual() {
        this.currentActualId = null;
        this.currentExpenses = [];
        
        // Chiedi se vuole partire da un preventivo
        const scenarios = StorageManager.getScenarios();
        
        if (scenarios.length > 0) {
            this.showScenarioSelectionModal();
        } else {
            this.loadActualForm(ActualsManager.createEmptyActual());
            document.getElementById('actualTitle').textContent = 'Nuovo Consuntivo';
            document.getElementById('deleteActualBtn').style.display = 'none';
            document.getElementById('viewAccountsBtn').style.display = 'none';
            document.getElementById('viewSettlementsFromActualBtn').style.display = 'none';
            App.showView('actualDetailView');
        }
    },

    // Mostra modal per selezione preventivo
    showScenarioSelectionModal() {
        const scenarios = StorageManager.getScenarios();
        
        const modalHTML = `
            <div id="scenarioSelectionModal" class="modal active">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>🎯 Vuoi partire da un preventivo?</h3>
                        <button class="modal-close" onclick="ActualsUI.closeScenarioSelectionModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p style="margin-bottom: 1.5rem; color: var(--text-secondary);">
                            Puoi pre-caricare i dati da un preventivo esistente per velocizzare l'inserimento.
                        </p>
                        <div class="scenario-selection-list">
                            ${scenarios.map(s => `
                                <div class="scenario-selection-item" onclick="ActualsUI.loadFromScenario('${s.id}')">
                                    <div class="scenario-selection-info">
                                        <strong>${s.name}</strong>
                                        <small>📍 ${s.destination} • ${s.participants.length} partecipanti</small>
                                    </div>
                                    <div class="scenario-selection-cost">
                                        ${ScenarioManager.formatCurrency(ScenarioManager.calculateTotal(s.expenses))}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div style="margin-top: 1.5rem; text-align: center;">
                            <button class="btn btn-secondary" onclick="ActualsUI.startFromScratch()">
                                📝 Inizia da Zero
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Aggiungi modal al body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild);
    },

    // Chiudi modal selezione
    closeScenarioSelectionModal() {
        const modal = document.getElementById('scenarioSelectionModal');
        if (modal) {
            modal.remove();
        }
    },

    // Carica da preventivo
    loadFromScenario(scenarioId) {
        this.closeScenarioSelectionModal();
        
        const scenario = StorageManager.getScenario(scenarioId);
        if (!scenario) {
            this.startFromScratch();
            return;
        }

        // Converti preventivo in consuntivo
        const actualData = {
            name: `${scenario.name} - Consuntivo`,
            destination: scenario.destination,
            startDate: scenario.startDate,
            endDate: scenario.endDate,
            participants: [...scenario.participants],
            expenses: this.convertScenarioExpensesToActual(scenario),
            notes: scenario.notes ? `Basato sul preventivo: ${scenario.name}\n\n${scenario.notes}` : `Basato sul preventivo: ${scenario.name}`
        };

        this.currentExpenses = actualData.expenses;
        this.loadActualForm(actualData);
        document.getElementById('actualTitle').textContent = 'Nuovo Consuntivo (da preventivo)';
        document.getElementById('deleteActualBtn').style.display = 'none';
        document.getElementById('viewAccountsBtn').style.display = 'none';
        document.getElementById('viewSettlementsFromActualBtn').style.display = 'none';
        App.showView('actualDetailView');
        
        ExportManager.showSuccess(`Dati caricati dal preventivo "${scenario.name}"`);
    },

    // Converti spese preventivo in spese consuntivo (mantenendo le spese separate)
    convertScenarioExpensesToActual(scenario) {
        const expenses = [];
        
        // Trasporto/Voli
        if (scenario.expenses.transport > 0) {
            expenses.push({
                id: ActualsManager.generateExpenseId(),
                category: 'viaggio',
                description: scenario.flightDeparture && scenario.flightArrival ?
                    `Volo ${scenario.flightDeparture} → ${scenario.flightArrival}` : 'Volo',
                amount: scenario.expenses.transport,
                paidBy: '',
                notes: ''
            });
        }

        // Alloggio - Crea spese separate per ogni opzione selezionata
        if (scenario.accommodationOptions && scenario.accommodationOptions.length > 0) {
            scenario.accommodationOptions.forEach((option, index) => {
                // Aggiungi solo l'opzione selezionata o tutte se non c'è selezione
                if (option.price > 0 && (scenario.selectedAccommodationIndex === index || scenario.selectedAccommodationIndex === undefined)) {
                    expenses.push({
                        id: ActualsManager.generateExpenseId(),
                        category: 'hotel',
                        description: option.name || `Alloggio ${index + 1}`,
                        amount: option.price,
                        paidBy: '',
                        notes: option.link ? `Link: ${option.link}` : ''
                    });
                }
            });
        } else if (scenario.expenses.accommodation > 0) {
            // Fallback se non ci sono opzioni dettagliate
            expenses.push({
                id: ActualsManager.generateExpenseId(),
                category: 'hotel',
                description: 'Alloggio',
                amount: scenario.expenses.accommodation,
                paidBy: '',
                notes: ''
            });
        }

        // Vitto
        if (scenario.expenses.food > 0) {
            expenses.push({
                id: ActualsManager.generateExpenseId(),
                category: 'ristorante',
                description: 'Vitto',
                amount: scenario.expenses.food,
                paidBy: '',
                notes: ''
            });
        }

        // Auto - Crea spese separate per ogni auto selezionata
        if (scenario.carOptions && scenario.carOptions.length > 0) {
            scenario.carOptions.forEach((option, index) => {
                if (option.selected && option.price > 0) {
                    expenses.push({
                        id: ActualsManager.generateExpenseId(),
                        category: 'auto',
                        description: option.name || `Auto ${index + 1}`,
                        amount: option.price,
                        paidBy: '',
                        notes: option.link ? `Link: ${option.link}` : ''
                    });
                }
            });
        } else if (scenario.expenses.car > 0) {
            // Fallback se non ci sono opzioni dettagliate
            expenses.push({
                id: ActualsManager.generateExpenseId(),
                category: 'auto',
                description: 'Noleggio auto',
                amount: scenario.expenses.car,
                paidBy: '',
                notes: ''
            });
        }

        // Attività
        if (scenario.expenses.activities > 0) {
            expenses.push({
                id: ActualsManager.generateExpenseId(),
                category: 'attivita',
                description: 'Attività e visite',
                amount: scenario.expenses.activities,
                paidBy: '',
                notes: ''
            });
        }

        // Altro - Crea spese separate per ogni opzione "altro"
        if (scenario.otherOptions && scenario.otherOptions.length > 0) {
            scenario.otherOptions.forEach((option, index) => {
                if (option.price > 0) {
                    expenses.push({
                        id: ActualsManager.generateExpenseId(),
                        category: 'altro',
                        description: option.name || `Altra spesa ${index + 1}`,
                        amount: option.price,
                        paidBy: '',
                        notes: option.link ? `Link: ${option.link}` : ''
                    });
                }
            });
        } else if (scenario.expenses.other > 0) {
            // Fallback se non ci sono opzioni dettagliate
            expenses.push({
                id: ActualsManager.generateExpenseId(),
                category: 'altro',
                description: 'Altre spese',
                amount: scenario.expenses.other,
                paidBy: '',
                notes: ''
            });
        }

        return expenses;
    },

    // Inizia da zero
    startFromScratch() {
        this.closeScenarioSelectionModal();
        this.loadActualForm(ActualsManager.createEmptyActual());
        document.getElementById('actualTitle').textContent = 'Nuovo Consuntivo';
        document.getElementById('deleteActualBtn').style.display = 'none';
        document.getElementById('viewAccountsBtn').style.display = 'none';
        document.getElementById('viewSettlementsFromActualBtn').style.display = 'none';
        App.showView('actualDetailView');
    },

    // Modifica consuntivo
    editActual(id) {
        const actual = StorageManager.getActual(id);
        if (actual) {
            this.currentActualId = id;
            this.currentExpenses = actual.expenses || [];
            this.loadActualForm(actual);
            document.getElementById('actualTitle').textContent = `Modifica: ${actual.name}`;
            document.getElementById('deleteActualBtn').style.display = 'inline-flex';
            document.getElementById('viewAccountsBtn').style.display = 'inline-flex';
            document.getElementById('viewSettlementsFromActualBtn').style.display = 'inline-flex';
            App.showView('actualDetailView');
        } else {
            ExportManager.showError('Consuntivo non trovato');
        }
    },

    // Carica form consuntivo
    loadActualForm(actual) {
        document.getElementById('actualName').value = actual.name || '';
        document.getElementById('actualDestination').value = actual.destination || '';
        document.getElementById('actualStartDate').value = actual.startDate || '';
        document.getElementById('actualEndDate').value = actual.endDate || '';
        document.getElementById('actualNotes').value = actual.notes || '';

        this.loadParticipants(actual.participants || []);
        this.loadExpenses(actual.expenses || []);
        this.updateTotals();
    },

    // Carica partecipanti
    loadParticipants(participants) {
        const list = document.getElementById('actualParticipantsList');
        list.innerHTML = participants.map(p => `
            <div class="participant-tag">
                <span>${p}</span>
                <button type="button" onclick="ActualsUI.removeParticipant('${p}')">✕</button>
            </div>
        `).join('');
    },

    // Aggiungi partecipante
    addParticipant() {
        const input = document.getElementById('newActualParticipant');
        const name = input.value.trim();
        
        if (name) {
            const list = document.getElementById('actualParticipantsList');
            const tag = document.createElement('div');
            tag.className = 'participant-tag';
            tag.innerHTML = `
                <span>${name}</span>
                <button type="button" onclick="ActualsUI.removeParticipant('${name}')">✕</button>
            `;
            list.appendChild(tag);
            input.value = '';
            this.updateTotals();
        }
    },

    // Rimuovi partecipante
    removeParticipant(name) {
        const tags = document.querySelectorAll('#actualParticipantsList .participant-tag');
        tags.forEach(tag => {
            if (tag.textContent.includes(name)) {
                tag.remove();
            }
        });
        this.updateTotals();
    },

    // Carica spese raggruppate per categoria
    loadExpenses(expenses, preserveFocus = false) {
        this.currentExpenses = expenses;
        const container = document.getElementById('expensesActualList');
        
        // Converti tutte le spese in EUR se necessario
        for (let i = 0; i < this.currentExpenses.length; i++) {
            const expense = this.currentExpenses[i];
            if (expense.amountEUR === undefined || expense.exchangeRate === undefined) {
                this.convertExpenseToEUR(i);
            }
        }
        
        // Salva l'elemento con focus prima del reload
        let focusedElement = null;
        let focusedIndex = null;
        let focusedField = null;
        let cursorPosition = null;
        
        if (preserveFocus && document.activeElement) {
            focusedElement = document.activeElement;
            if (focusedElement.dataset && focusedElement.dataset.index) {
                focusedIndex = parseInt(focusedElement.dataset.index);
                focusedField = focusedElement.className;
                if (focusedElement.selectionStart !== undefined) {
                    cursorPosition = focusedElement.selectionStart;
                }
            }
        }
        
        if (expenses.length === 0) {
            container.innerHTML = `
                <div class="expenses-empty-state">
                    <div class="expenses-empty-state-icon">💸</div>
                    <h4>Nessuna spesa registrata</h4>
                    <p>Clicca su "Aggiungi Spesa" per iniziare</p>
                </div>
            `;
            return;
        }

        // Non raggruppa le spese, mantieni l'ordine originale
        // Genera HTML senza raggruppamento per categoria
        let html = '';
        expenses.forEach((exp, index) => {
            html += this.createExpenseItem(exp, index);
        });

        container.innerHTML = html;
        this.attachExpenseListeners();
        
        // Ripristina il focus se richiesto
        if (preserveFocus && focusedIndex !== null && focusedField) {
            setTimeout(() => {
                const newFocusedElement = container.querySelector(`.${focusedField.split(' ')[0]}[data-index="${focusedIndex}"]`);
                if (newFocusedElement) {
                    newFocusedElement.focus();
                    if (cursorPosition !== null && newFocusedElement.setSelectionRange) {
                        newFocusedElement.setSelectionRange(cursorPosition, cursorPosition);
                    }
                }
            }, 0);
        }
    },

    // Crea elemento spesa
    createExpenseItem(expense, index) {
        const categories = ActualsManager.categories;
        const categoryOptions = categories.map(cat =>
            `<option value="${cat.value}" ${expense.category === cat.value ? 'selected' : ''}>
                ${cat.icon} ${cat.label}
            </option>`
        ).join('');

        // Ottieni lista partecipanti
        const participants = Array.from(document.querySelectorAll('#actualParticipantsList .participant-tag span'))
            .map(span => span.textContent);

        const paidByOptions = participants.map(p =>
            `<option value="${p}" ${expense.paidBy === p ? 'selected' : ''}>${p}</option>`
        ).join('');

        // Inizializza sharedBy se non esiste
        if (!expense.sharedBy) {
            expense.sharedBy = [...participants];
            expense.splitEqually = true;
        }

        // Inizializza data se non esiste
        if (!expense.date) {
            expense.date = new Date().toISOString().split('T')[0];
        }

        const sharedByCheckboxes = participants.map(p => {
            const isChecked = expense.sharedBy && expense.sharedBy.includes(p);
            return `
                <label class="participant-checkbox-compact">
                    <input type="checkbox" class="expense-sharedby" data-index="${index}" data-participant="${p}" ${isChecked ? 'checked' : ''}>
                    <span>${p}</span>
                </label>
            `;
        }).join('');

        // Calcola costo per persona in EUR
        const amountEUR = expense.amountEUR !== undefined ? expense.amountEUR : expense.amount;
        const costPerPerson = expense.sharedBy && expense.sharedBy.length > 0
            ? (amountEUR / expense.sharedBy.length).toFixed(2)
            : '0.00';

        // Ottieni simbolo valuta
        const currencySymbol = this.getCurrencySymbol(expense.currency || 'EUR');

        // Genera opzioni valute dinamicamente
        const currencyOptions = this.generateCurrencyOptions(expense.currency);

        const isSaved = expense.saved === true;
        const disabledAttr = isSaved ? 'disabled' : '';
        const opacityStyle = isSaved ? 'opacity: 0.7;' : '';

        // Mostra equivalente EUR se la valuta non è EUR
        const showEUREquivalent = expense.currency && expense.currency !== 'EUR';
        const eurEquivalent = showEUREquivalent && expense.amountEUR !== undefined && expense.amountEUR > 0
            ? `<div style="font-size: 0.85rem; color: #6b7280; margin-top: 0.25rem;">≈ €${expense.amountEUR.toFixed(2)} EUR (tasso: ${expense.exchangeRate ? expense.exchangeRate.toFixed(4) : '1.0000'})</div>`
            : '';

        return `
            <div class="expense-item-wrapper" style="position: relative; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
                <!-- Pulsanti azione a sinistra del box -->
                <div style="display: flex; flex-direction: column; gap: 0.3rem;">
                    <!-- Elimina (rosso) - sempre visibile -->
                    <button type="button" class="btn-icon" onclick="ActualsUI.removeExpense(${index})"
                            title="Elimina spesa"
                            style="background: #ef4444; color: white; width: 28px; height: 28px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.95rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        🗑️
                    </button>
                    
                    <!-- Salva (verde) - visibile solo se non salvata -->
                    <button type="button" class="btn-icon" onclick="ActualsUI.saveExpense(${index})"
                            title="Salva spesa"
                            style="background: #10b981; color: white; width: 28px; height: 28px; border-radius: 50%; border: none; cursor: pointer; display: ${isSaved ? 'none' : 'flex'}; align-items: center; justify-content: center; font-size: 0.95rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        ✓
                    </button>
                    
                    <!-- Modifica (blu) - visibile solo se salvata -->
                    <button type="button" class="btn-icon" onclick="ActualsUI.editExpense(${index})"
                            title="Modifica spesa"
                            style="background: #3b82f6; color: white; width: 28px; height: 28px; border-radius: 50%; border: none; cursor: pointer; display: ${isSaved ? 'flex' : 'none'}; align-items: center; justify-content: center; font-size: 0.95rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        ✏️
                    </button>
                </div>
                
                <div class="expense-item expense-item-new" data-index="${index}" style="flex: 1; display: grid; grid-template-columns: 1fr 1fr 1fr 2fr; grid-template-rows: auto auto auto; gap: 0.5rem; ${opacityStyle}">
                    
                    <!-- Colonna 1: Descrizione (riga 1) e Categoria (riga 2) -->
                    <div class="expense-field" style="grid-column: 1; grid-row: 1;">
                        <label>Descrizione</label>
                        <input type="text" class="expense-description" data-index="${index}"
                               value="${expense.description || ''}" placeholder="es: Cena ristorante" required ${disabledAttr}>
                    </div>
                    <div class="expense-field" style="grid-column: 1; grid-row: 2;">
                        <label>Categoria</label>
                        <select class="expense-category" data-index="${index}" ${disabledAttr}>
                            ${categoryOptions}
                        </select>
                    </div>
                    
                    <!-- Colonna 2: Importo (riga 1) e Data (riga 2) -->
                    <div class="expense-field" style="grid-column: 2; grid-row: 1;">
                        <label>Importo</label>
                        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                            <div style="display: flex; gap: 0.5rem;">
                                <input type="number" class="expense-amount" data-index="${index}"
                                       value="${expense.amount || 0}" min="0" step="0.01" required ${disabledAttr}
                                       style="flex: 1;">
                                <select class="expense-currency" data-index="${index}" ${disabledAttr}
                                        style="width: 80px; font-size: 0.9rem;">
                                    ${currencyOptions}
                                </select>
                            </div>
                            ${eurEquivalent}
                        </div>
                    </div>
                    <div class="expense-field" style="grid-column: 2; grid-row: 2;">
                        <label>Data</label>
                        <input type="date" class="expense-date" data-index="${index}"
                               value="${expense.date || ''}" required ${disabledAttr}>
                    </div>
                    
                    <!-- Colonna 3: Pagato da (span 2 righe) -->
                    <div class="expense-field" style="grid-column: 3; grid-row: 1 / 3; display: flex; flex-direction: column;">
                        <label>Pagato da</label>
                        <select class="expense-paidby-select" data-index="${index}" style="flex: 1;" ${disabledAttr}>
                            <option value="">Seleziona...</option>
                            ${paidByOptions}
                        </select>
                    </div>
                    
                    <!-- Colonna 4: Partecipanti (span 2 righe) -->
                    <div class="expense-row-split" style="grid-column: 4; grid-row: 1 / 3; display: flex; flex-direction: column;">
                        <div class="expense-split-header" style="margin-bottom: 0.5rem;">
                            <span class="split-label">👥 Diviso tra:</span>
                            <button type="button" class="btn-link-small" onclick="ActualsUI.toggleAllParticipants(${index})" ${disabledAttr}>
                                ${expense.sharedBy && expense.sharedBy.length === participants.length ? 'Deseleziona' : 'Tutti'}
                            </button>
                            <div class="split-summary">
                                <span class="split-count">${expense.sharedBy ? expense.sharedBy.length : 0} pers.</span>
                                <span class="split-divider">•</span>
                                <span class="split-amount">€${costPerPerson}</span>
                            </div>
                        </div>
                        <div class="expense-participants-grid" style="flex: 1; overflow-y: auto;">
                            ${participants.map(p => {
                                const isChecked = expense.sharedBy && expense.sharedBy.includes(p);
                                return `
                                    <label class="participant-checkbox-compact">
                                        <input type="checkbox" class="expense-sharedby" data-index="${index}" data-participant="${p}" ${isChecked ? 'checked' : ''} ${disabledAttr}>
                                        <span>${p}</span>
                                    </label>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    
                    <!-- Riga 3: Note (span tutte le colonne) -->
                    ${expense.notes ? `
                        <div class="expense-field" style="grid-column: 1 / 5; grid-row: 3;">
                            <label>📝 Note</label>
                            <div style="padding: 0.5rem; background: #f9fafb; border-radius: 0.375rem; font-size: 0.875rem; line-height: 1.5; color: #374151;">
                                ${typeof linkifyText !== 'undefined' ? linkifyText(expense.notes) : expense.notes.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    // Aggiungi spesa
    addExpense() {
        const newExpense = ActualsManager.createEmptyExpense();
        this.currentExpenses.push(newExpense);
        
        // Converti in EUR se necessario
        const index = this.currentExpenses.length - 1;
        this.convertExpenseToEUR(index);
        
        this.loadExpenses(this.currentExpenses);
        this.updateTotals();
    },

    // Rimuovi spesa
    removeExpense(index) {
        if (confirm('Sei sicuro di voler eliminare questa spesa?')) {
            this.currentExpenses.splice(index, 1);
            this.loadExpenses(this.currentExpenses);
            this.updateTotals();
        }
    },

    // Salva spesa (conferma e blocca modifica)
    saveExpense(index) {
        const expense = this.currentExpenses[index];
        
        // Validazione base
        if (!expense.description || !expense.category || !expense.amount || !expense.paidBy) {
            alert('Compila tutti i campi obbligatori: Descrizione, Categoria, Importo e Pagato da');
            return;
        }
        
        if (!expense.sharedBy || expense.sharedBy.length === 0) {
            alert('Seleziona almeno un partecipante per la divisione della spesa');
            return;
        }
        
        // Marca la spesa come salvata
        expense.saved = true;
        
        // Ricarica per disabilitare i campi
        this.loadExpenses(this.currentExpenses);
        this.updateTotals();
        
        // Feedback visivo
        if (typeof showToast !== 'undefined') {
            showToast('Spesa salvata con successo', 'success');
        }
    },

    // Modifica spesa (riabilita modifica)
    editExpense(index) {
        const expense = this.currentExpenses[index];
        
        // Rimuovi il flag saved per permettere la modifica
        expense.saved = false;
        
        // Ricarica per riabilitare i campi
        this.loadExpenses(this.currentExpenses);
        
        // Feedback visivo
        if (typeof showToast !== 'undefined') {
            showToast('Spesa in modalità modifica', 'info');
        }
    },

    // Attach listeners alle spese
    attachExpenseListeners() {
        // Input fields
        const inputs = document.querySelectorAll('.expense-category, .expense-description, .expense-amount, .expense-currency, .expense-paidby-select, .expense-date');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                const classList = e.target.className;
                
                if (this.currentExpenses[index]) {
                    if (classList.includes('expense-category')) {
                        this.currentExpenses[index].category = e.target.value;
                    } else if (classList.includes('expense-description')) {
                        this.currentExpenses[index].description = e.target.value;
                    } else if (classList.includes('expense-amount')) {
                        this.currentExpenses[index].amount = parseFloat(e.target.value) || 0;
                        // Converti in EUR
                        this.convertExpenseToEUR(index);
                        // Aggiorna l'equivalente EUR e il costo per persona
                        this.updateEUREquivalent(index);
                        this.updateCostPerPerson(index);
                        this.updateTotals();
                    } else if (classList.includes('expense-currency')) {
                        this.currentExpenses[index].currency = e.target.value;
                        // Converti in EUR quando cambia la valuta
                        this.convertExpenseToEUR(index);
                        // Aggiorna l'equivalente EUR e il costo per persona
                        this.updateEUREquivalent(index);
                        this.updateCostPerPerson(index);
                        this.updateTotals();
                    } else if (classList.includes('expense-paidby-select')) {
                        this.currentExpenses[index].paidBy = e.target.value;
                    } else if (classList.includes('expense-date')) {
                        this.currentExpenses[index].date = e.target.value;
                    }
                }
            });
        });

        // Checkboxes per sharedBy
        const checkboxes = document.querySelectorAll('.expense-sharedby');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                const participant = e.target.dataset.participant;
                
                if (this.currentExpenses[index]) {
                    if (!this.currentExpenses[index].sharedBy) {
                        this.currentExpenses[index].sharedBy = [];
                    }
                    
                    if (e.target.checked) {
                        if (!this.currentExpenses[index].sharedBy.includes(participant)) {
                            this.currentExpenses[index].sharedBy.push(participant);
                        }
                    } else {
                        this.currentExpenses[index].sharedBy = this.currentExpenses[index].sharedBy.filter(p => p !== participant);
                    }
                    
                    // Aggiorna solo il costo per persona senza ricaricare
                    this.updateCostPerPerson(index);
                }
            });
        });
    },

    // Aggiorna solo il costo per persona di una spesa specifica
    updateCostPerPerson(index) {
        const expense = this.currentExpenses[index];
        if (!expense) return;
        
        // Usa amountEUR per il calcolo
        const amountEUR = expense.amountEUR !== undefined ? expense.amountEUR : expense.amount;
        const costPerPerson = expense.sharedBy && expense.sharedBy.length > 0
            ? (amountEUR / expense.sharedBy.length).toFixed(2)
            : '0.00';
        
        // Trova e aggiorna solo l'elemento del costo per persona (sempre in EUR)
        const expenseItem = document.querySelector(`.expense-item[data-index="${index}"]`);
        if (expenseItem) {
            const splitAmount = expenseItem.querySelector('.split-amount');
            if (splitAmount) {
                splitAmount.textContent = `€${costPerPerson}`;
            }
        }
    },

    // Aggiorna l'equivalente EUR visualizzato
    updateEUREquivalent(index) {
        const expense = this.currentExpenses[index];
        if (!expense) return;

        // Trova l'elemento della spesa
        const expenseItem = document.querySelector(`.expense-item[data-index="${index}"]`);
        if (!expenseItem) return;

        // Trova il campo dell'importo (input con classe expense-amount)
        const amountInput = expenseItem.querySelector(`.expense-amount[data-index="${index}"]`);
        if (!amountInput) return;

        // Trova il contenitore parent del campo importo
        const amountContainer = amountInput.closest('div[style*="flex-direction: column"]');
        if (!amountContainer) return;

        // Rimuovi l'equivalente EUR esistente se presente
        const existingEur = amountContainer.querySelector('.eur-equivalent');
        if (existingEur) {
            existingEur.remove();
        }

        // Aggiungi il nuovo equivalente EUR se la valuta non è EUR
        const showEUREquivalent = expense.currency && expense.currency !== 'EUR';
        
        if (showEUREquivalent && expense.amountEUR !== undefined && expense.amountEUR > 0) {
            const eurDiv = document.createElement('div');
            eurDiv.className = 'eur-equivalent';
            eurDiv.style.cssText = 'font-size: 0.85rem; color: #6b7280; margin-top: 0.25rem;';
            eurDiv.textContent = `≈ €${expense.amountEUR.toFixed(2)} EUR (tasso: ${expense.exchangeRate ? expense.exchangeRate.toFixed(4) : '1.0000'})`;
            amountContainer.appendChild(eurDiv);
        }
    },

    // Converti una spesa in EUR
    convertExpenseToEUR(index) {
        const expense = this.currentExpenses[index];
        if (!expense) return;

        // Se la valuta è EUR, non serve conversione
        if (!expense.currency || expense.currency === 'EUR') {
            expense.amountEUR = expense.amount;
            expense.exchangeRate = 1.0;
            return;
        }

        // Converti usando ActualsManager (usa i tassi già in memoria)
        const conversion = ActualsManager.convertToEUR(expense.amount, expense.currency);
        expense.amountEUR = conversion.amountEUR;
        expense.exchangeRate = conversion.exchangeRate;
    },

    // Aggiorna i tassi di cambio e riconverte tutte le spese
    async updateExchangeRatesAndRefresh() {
        const btn = document.getElementById('updateExchangeRatesActualBtn');
        
        // Disabilita il pulsante durante l'aggiornamento
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '⏳ Aggiornamento...';
        }

        try {
            // Aggiorna i tassi di cambio
            if (typeof CurrenciesManager === 'undefined') {
                throw new Error('CurrenciesManager non disponibile');
            }

            const result = await CurrenciesManager.updateExchangeRates();
            
            if (result.success) {
                // Riconverti tutte le spese con i nuovi tassi
                for (let i = 0; i < this.currentExpenses.length; i++) {
                    this.convertExpenseToEUR(i);
                }

                // Ricarica la lista per mostrare i nuovi valori
                this.loadExpenses(this.currentExpenses);
                this.updateTotals();

                // Mostra messaggio di successo
                if (typeof showToast !== 'undefined') {
                    showToast(`✅ Aggiornati ${result.updatedCount} tassi di cambio!`, 'success');
                } else {
                    alert(`✅ Aggiornati ${result.updatedCount} tassi di cambio!`);
                }
            } else {
                throw new Error(result.error || 'Errore sconosciuto');
            }
        } catch (error) {
            console.error('Errore aggiornamento tassi:', error);
            if (typeof showToast !== 'undefined') {
                showToast(`❌ Errore: ${error.message}`, 'error');
            } else {
                alert(`❌ Errore: ${error.message}`);
            }
        } finally {
            // Riabilita il pulsante
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '🔄 Aggiorna Cambi';
            }
        }
    },

    // Genera opzioni valute dinamicamente
    generateCurrencyOptions(selectedCurrency) {
        // Ottieni la destinazione dello scenario corrente
        const destination = document.getElementById('actualDestination')?.value || '';
        
        // Ottieni tutte le valute disponibili
        let currencies = [];
        if (typeof CurrenciesManager !== 'undefined') {
            currencies = CurrenciesManager.getCurrencies();
        }

        // Trova la valuta del paese di destinazione
        let destinationCurrency = null;
        if (destination && typeof CurrenciesManager !== 'undefined') {
            const currencyData = CurrenciesManager.getCurrencyDataByCountry(destination);
            if (currencyData) {
                destinationCurrency = currencies.find(c => c.code === currencyData.code);
            }
        }

        // Ordina: EUR prima, poi valuta destinazione, poi le altre
        const sortedCurrencies = currencies.sort((a, b) => {
            if (a.code === 'EUR') return -1;
            if (b.code === 'EUR') return 1;
            if (destinationCurrency && a.code === destinationCurrency.code) return -1;
            if (destinationCurrency && b.code === destinationCurrency.code) return 1;
            return a.name.localeCompare(b.name);
        });

        // Genera le opzioni
        return sortedCurrencies.map(currency => {
            const isSelected = currency.code === (selectedCurrency || 'EUR');
            return `<option value="${currency.code}" ${isSelected ? 'selected' : ''}>${currency.symbol} ${currency.code}</option>`;
        }).join('');
    },

    // Toggle tutti i partecipanti per una spesa
    toggleAllParticipants(index) {
        if (!this.currentExpenses[index]) return;
        
        const participants = Array.from(document.querySelectorAll('#actualParticipantsList .participant-tag span'))
            .map(span => span.textContent);
        
        const allSelected = this.currentExpenses[index].sharedBy &&
                           this.currentExpenses[index].sharedBy.length === participants.length;
        
        if (allSelected) {
            this.currentExpenses[index].sharedBy = [];
        } else {
            this.currentExpenses[index].sharedBy = [...participants];
        }
        
        this.loadExpenses(this.currentExpenses);
    },

    // Aggiorna totali
    updateTotals() {
        const participants = document.querySelectorAll('#actualParticipantsList .participant-tag').length;
        const total = ActualsManager.calculateTotal(this.currentExpenses);
        const costPerPerson = ActualsManager.calculateCostPerPerson(this.currentExpenses, participants);

        document.getElementById('actualTotalCost').textContent = ActualsManager.formatCurrency(total);
        document.getElementById('actualCostPerPerson').textContent = ActualsManager.formatCurrency(costPerPerson);
    },

    // Salva consuntivo
    saveActual() {
        const participants = Array.from(document.querySelectorAll('#actualParticipantsList .participant-tag span'))
            .map(span => span.textContent);

        const actualData = {
            name: document.getElementById('actualName').value,
            destination: document.getElementById('actualDestination').value,
            startDate: document.getElementById('actualStartDate').value,
            endDate: document.getElementById('actualEndDate').value,
            participants: participants,
            expenses: this.currentExpenses,
            notes: document.getElementById('actualNotes').value
        };

        const validation = ActualsManager.validateActual(actualData);
        if (!validation.isValid) {
            ExportManager.showError(validation.errors.join(', '));
            return;
        }

        if (this.currentActualId) {
            StorageManager.updateActual(this.currentActualId, actualData);
            ExportManager.showSuccess('Consuntivo aggiornato');
        } else {
            StorageManager.addActual(actualData);
            ExportManager.showSuccess('Consuntivo creato');
        }

        App.switchView('actuals');
        this.loadActualsList();
    },

    // Elimina consuntivo corrente
    deleteCurrentActual() {
        if (!this.currentActualId) return;

        const actual = StorageManager.getActual(this.currentActualId);
        if (confirm(`Sei sicuro di voler eliminare il consuntivo "${actual.name}"?`)) {
            StorageManager.deleteActual(this.currentActualId);
            ExportManager.showSuccess('Consuntivo eliminato');
            App.switchView('actuals');
            this.loadActualsList();
        }
    },

    // Visualizza pagina Conti dalla lista principale
    viewAccountsFromList() {
        const actuals = StorageManager.getActuals() || [];
        
        if (actuals.length === 0) {
            App.showToast('Crea prima un consuntivo per visualizzare i conti', 'warning');
            return;
        }

        // Se c'è un solo consuntivo, aprilo direttamente
        if (actuals.length === 1) {
            AccountsManager.init(actuals[0]);
            App.showView('accountsView');
            return;
        }

        // Se ci sono più consuntivi, chiedi quale aprire
        const actualNames = actuals.map(a => `${a.name} (${a.destination || 'N/A'})`).join('\n');
        App.showToast('Apri un consuntivo per visualizzare i suoi conti', 'info');
    },

    // Visualizza pagina Dare/Avere per un consuntivo specifico
    viewSettlements(actualId) {
        const actual = StorageManager.getActual(actualId);
        if (!actual) {
            App.showToast('Consuntivo non trovato', 'error');
            return;
        }

        // Carica direttamente il consuntivo nella view settlements
        SettlementsManager.loadActualDirect(actual);
        App.showView('settlementsView');
    },

    // Visualizza pagina Conti dal dettaglio consuntivo
    viewAccounts() {
        if (!this.currentActualId) return;

        const actual = StorageManager.getActual(this.currentActualId);
        if (!actual) return;

        // Inizializza AccountsManager con il consuntivo corrente
        AccountsManager.init(actual);

        // Mostra la vista Conti
        App.showView('accountsView');
    },

    // Elimina dalla lista
    deleteActualFromList(id) {
        const actual = StorageManager.getActual(id);
        if (!actual) return;

        if (confirm(`Sei sicuro di voler eliminare il consuntivo "${actual.name}"?`)) {
            StorageManager.deleteActual(id);
            ExportManager.showSuccess('Consuntivo eliminato');
            this.loadActualsList();
        }
    },

    // Helper: Ottieni simbolo valuta
    getCurrencySymbol(currency) {
        const symbols = {
            'EUR': '€',
            'USD': '$',
            'GBP': '£',
            'CHF': '₣',
            'JPY': '¥',
            'CNY': '¥',
            'CAD': '$',
            'AUD': '$',
            'NOK': 'kr',
            'SEK': 'kr',
            'DKK': 'kr'
        };
        return symbols[currency] || '€';
    }
};

// Inizializza quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    ActualsUI.init();
});

// Made with Bob