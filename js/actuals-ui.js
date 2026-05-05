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
        App.showView('actualDetailView');
        
        ExportManager.showSuccess(`Dati caricati dal preventivo "${scenario.name}"`);
    },

    // Converti spese preventivo in spese consuntivo
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

        // Alloggio
        if (scenario.expenses.accommodation > 0) {
            const accommodationName = scenario.accommodationOptions &&
                                     scenario.selectedAccommodationIndex !== undefined &&
                                     scenario.accommodationOptions[scenario.selectedAccommodationIndex] ?
                                     scenario.accommodationOptions[scenario.selectedAccommodationIndex].name : 'Alloggio';
            
            expenses.push({
                id: ActualsManager.generateExpenseId(),
                category: 'generali',
                description: accommodationName || 'Alloggio',
                amount: scenario.expenses.accommodation,
                paidBy: '',
                notes: ''
            });
        }

        // Vitto
        if (scenario.expenses.food > 0) {
            expenses.push({
                id: ActualsManager.generateExpenseId(),
                category: 'generali',
                description: 'Vitto',
                amount: scenario.expenses.food,
                paidBy: '',
                notes: ''
            });
        }

        // Auto
        if (scenario.expenses.car > 0) {
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

        // Altro
        if (scenario.expenses.other > 0) {
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

    // Carica spese
    loadExpenses(expenses) {
        this.currentExpenses = expenses;
        const container = document.getElementById('expensesActualList');
        
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

        container.innerHTML = expenses.map((exp, index) => this.createExpenseItem(exp, index)).join('');
        this.attachExpenseListeners();
    },

    // Crea elemento spesa
    createExpenseItem(expense, index) {
        const categories = ActualsManager.categories;
        const categoryOptions = categories.map(cat => 
            `<option value="${cat.value}" ${expense.category === cat.value ? 'selected' : ''}>
                ${cat.icon} ${cat.label}
            </option>`
        ).join('');

        return `
            <div class="expense-item expense-item-new" data-index="${index}">
                <div class="expense-field">
                    <label>Categoria</label>
                    <select class="expense-category" data-index="${index}">
                        ${categoryOptions}
                    </select>
                </div>
                <div class="expense-field">
                    <label>Descrizione *</label>
                    <input type="text" class="expense-description" data-index="${index}" 
                           value="${expense.description || ''}" placeholder="es: Cena ristorante" required>
                </div>
                <div class="expense-field">
                    <label>Importo (€) *</label>
                    <input type="number" class="expense-amount" data-index="${index}" 
                           value="${expense.amount || 0}" min="0" step="0.01" required>
                </div>
                <div class="expense-field">
                    <label>Pagato da</label>
                    <input type="text" class="expense-paidby" data-index="${index}" 
                           value="${expense.paidBy || ''}" placeholder="Nome">
                </div>
                <div class="expense-actions">
                    <button type="button" class="btn-icon btn-delete" onclick="ActualsUI.removeExpense(${index})" title="Elimina spesa">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    },

    // Aggiungi spesa
    addExpense() {
        const newExpense = ActualsManager.createEmptyExpense();
        this.currentExpenses.push(newExpense);
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

    // Attach listeners alle spese
    attachExpenseListeners() {
        const inputs = document.querySelectorAll('.expense-category, .expense-description, .expense-amount, .expense-paidby');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                const field = e.target.className.split(' ')[0].replace('expense-', '');
                
                if (this.currentExpenses[index]) {
                    if (field === 'category') {
                        this.currentExpenses[index].category = e.target.value;
                    } else if (field === 'description') {
                        this.currentExpenses[index].description = e.target.value;
                    } else if (field === 'amount') {
                        this.currentExpenses[index].amount = parseFloat(e.target.value) || 0;
                    } else if (field === 'paidby') {
                        this.currentExpenses[index].paidBy = e.target.value;
                    }
                    
                    if (field === 'amount') {
                        this.updateTotals();
                    }
                }
            });
        });
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

    // Elimina dalla lista
    deleteActualFromList(id) {
        const actual = StorageManager.getActual(id);
        if (!actual) return;

        if (confirm(`Sei sicuro di voler eliminare il consuntivo "${actual.name}"?`)) {
            StorageManager.deleteActual(id);
            ExportManager.showSuccess('Consuntivo eliminato');
            this.loadActualsList();
        }
    }
};

// Inizializza quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    ActualsUI.init();
});

// Made with Bob