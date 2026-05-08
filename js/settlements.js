// ===== Settlements Management (Dare/Avere) =====

const SettlementsManager = {
    currentActual: null,

    // Inizializza la view
    init() {
        this.setupEventListeners();
        this.loadActualsList();
    },

    // Carica direttamente un consuntivo (senza selettore)
    loadActualDirect(actual) {
        this.currentActual = actual;
        
        // Nascondi il selettore e mostra direttamente il contenuto
        const selectSection = document.querySelector('#settlementsView .form-section');
        if (selectSection) selectSection.style.display = 'none';
        
        document.getElementById('settlementsContent').style.display = 'block';
        document.getElementById('optimizedTransfers').style.display = 'none';

        // Aggiorna il titolo
        document.getElementById('settlementsTitle').textContent = `🔄 Dare/Avere - ${actual.name}`;

        // Aggiorna statistiche
        this.updateStats(actual);

        // Calcola e mostra i bilanci
        this.calculateBalances(actual);
    },

    // Setup event listeners
    setupEventListeners() {
        const backBtn = document.getElementById('backFromSettlementsBtn');
        const actualSelect = document.getElementById('settlementsActualSelect');
        const optimizeBtn = document.getElementById('optimizeSettlementsBtn');

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                App.showView('actualsView');
            });
        }

        if (actualSelect) {
            actualSelect.addEventListener('change', (e) => {
                const actualId = e.target.value;
                if (actualId) {
                    this.loadActual(actualId);
                } else {
                    document.getElementById('settlementsContent').style.display = 'none';
                }
            });
        }

        if (optimizeBtn) {
            optimizeBtn.addEventListener('click', () => {
                this.optimizeTransfers();
            });
        }
    },

    // Carica la lista dei consuntivi
    loadActualsList() {
        const select = document.getElementById('settlementsActualSelect');
        if (!select) return;

        const actuals = StorageManager.getActuals();
        
        select.innerHTML = '<option value="">-- Seleziona un consuntivo --</option>';
        
        actuals.forEach(actual => {
            const option = document.createElement('option');
            option.value = actual.id;
            option.textContent = `${actual.name} - ${actual.destination}`;
            select.appendChild(option);
        });
    },

    // Carica un consuntivo specifico
    loadActual(actualId) {
        const actual = StorageManager.getActual(actualId);
        if (!actual) return;

        this.currentActual = actual;
        
        // Mostra il contenuto
        document.getElementById('settlementsContent').style.display = 'block';
        document.getElementById('optimizedTransfers').style.display = 'none';

        // Aggiorna statistiche
        this.updateStats(actual);

        // Calcola e mostra i bilanci
        this.calculateBalances(actual);
    },

    // Aggiorna le statistiche generali
    updateStats(actual) {
        const totalCost = this.calculateTotalCost(actual);
        const participantsCount = actual.participants.length;
        const avgShare = participantsCount > 0 ? totalCost / participantsCount : 0;

        document.getElementById('settlementsTotalCost').textContent = `€${totalCost.toFixed(2)}`;
        document.getElementById('settlementsParticipantsCount').textContent = participantsCount;
        document.getElementById('settlementsEqualShare').textContent = `€${avgShare.toFixed(2)}`;
    },

    // Calcola il totale delle spese (usa amountEUR)
    calculateTotalCost(actual) {
        let total = 0;
        
        if (actual.expenses && Array.isArray(actual.expenses)) {
            actual.expenses.forEach(expense => {
                const amount = expense.amountEUR !== undefined ? expense.amountEUR : expense.amount;
                total += parseFloat(amount) || 0;
            });
        }
        
        return total;
    },

    // Calcola i bilanci per ogni partecipante (usa amountEUR)
    calculateBalances(actual) {
        // Inizializza contatori per ogni partecipante
        const paid = {}; // Quanto ha pagato
        const owes = {}; // Quanto deve (la sua quota delle spese condivise)
        
        actual.participants.forEach(p => {
            paid[p] = 0;
            owes[p] = 0;
        });

        // Calcola quanto ha pagato ogni partecipante e quanto deve
        if (actual.expenses && Array.isArray(actual.expenses)) {
            actual.expenses.forEach(expense => {
                // Usa amountEUR se disponibile, altrimenti amount
                const amount = expense.amountEUR !== undefined ? parseFloat(expense.amountEUR) : parseFloat(expense.amount);
                const paidBy = expense.paidBy;
                
                // Registra chi ha pagato
                if (paidBy && paid.hasOwnProperty(paidBy)) {
                    paid[paidBy] += amount || 0;
                }
                
                // Calcola la quota per ogni partecipante che condivide questa spesa
                let sharedBy = expense.sharedBy || [];
                
                // Se sharedBy è vuoto, usa tutti i partecipanti del consuntivo
                if (sharedBy.length === 0) {
                    sharedBy = actual.participants;
                }
                
                // Dividi la spesa tra chi la condivide
                const sharePerPerson = sharedBy.length > 0 ? (amount || 0) / sharedBy.length : 0;
                
                sharedBy.forEach(participant => {
                    if (owes.hasOwnProperty(participant)) {
                        owes[participant] += sharePerPerson;
                    }
                });
            });
        }

        // Calcola il bilancio (quanto ha pagato - quanto deve)
        const balances = {};
        actual.participants.forEach(p => {
            balances[p] = paid[p] - owes[p];
        });

        // Calcola la quota media per visualizzazione (non più usata per il calcolo)
        const totalCost = this.calculateTotalCost(actual);
        const avgShare = actual.participants.length > 0 ? totalCost / actual.participants.length : 0;

        // Mostra i bilanci
        this.displayBalances(balances, paid, owes, avgShare);

        // Salva i bilanci per l'ottimizzazione
        this.balances = balances;
    },

    // Ottiene la foto di un partecipante dall'anagrafica
    getParticipantPhoto(participantName) {
        if (typeof participantsRegistry === 'undefined') return null;
        const participant = participantsRegistry.getByName(participantName);
        return participant?.photo || null;
    },

    // Mostra i bilanci nell'UI
    displayBalances(balances, paid, owes, avgShare) {
        const container = document.getElementById('participantBalances');
        if (!container) return;

        container.innerHTML = '';

        Object.keys(balances).sort().forEach(participant => {
            const balance = balances[participant];
            const paidAmount = paid[participant];
            const owesAmount = owes[participant];
            
            const card = document.createElement('div');
            card.className = 'stat-card';
            card.style.border = balance > 0 ? '2px solid #28a745' : balance < 0 ? '2px solid #dc3545' : '2px solid #6c757d';
            
            const statusIcon = balance > 0 ? '🟢 ⬆️' : balance < 0 ? '🔴 ⬇️' : '✅';
            const statusText = balance > 0 ? 'Deve ricevere' : balance < 0 ? 'Deve dare' : 'In pari';
            const statusColor = balance > 0 ? '#28a745' : balance < 0 ? '#dc3545' : '#6c757d';
            
            // Ottieni foto del partecipante
            const photo = this.getParticipantPhoto(participant);
            const photoHtml = photo
                ? `<img src="${photo}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid ${statusColor}; margin-right: 0.75rem;" />`
                : '';
            
            card.innerHTML = `
                <div class="stat-content">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <div style="display: flex; align-items: center;">
                            ${photoHtml}
                            <h4 style="margin: 0; font-size: 1.1rem;">${participant}</h4>
                        </div>
                        <span style="font-size: 1.5rem;">${statusIcon}</span>
                    </div>
                    <div style="margin-bottom: 0.75rem;">
                        <div style="font-size: 0.85rem; color: #6c757d;">Ha pagato:</div>
                        <div style="font-size: 1.2rem; font-weight: bold;">€${paidAmount.toFixed(2)}</div>
                    </div>
                    <div style="margin-bottom: 0.75rem;">
                        <div style="font-size: 0.85rem; color: #6c757d;">Sua quota spese:</div>
                        <div style="font-size: 1rem;">€${owesAmount.toFixed(2)}</div>
                    </div>
                    <div style="padding-top: 0.75rem; border-top: 2px solid #dee2e6;">
                        <div style="font-size: 0.85rem; color: ${statusColor}; font-weight: 600;">${statusText}</div>
                        <div style="font-size: 1.3rem; font-weight: bold; color: ${statusColor};">
                            €${Math.abs(balance).toFixed(2)}
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(card);
        });
    },

    // Ottimizza i trasferimenti (algoritmo greedy)
    optimizeTransfers() {
        if (!this.balances) return;

        // Crea array di creditori (chi deve ricevere) e debitori (chi deve dare)
        const creditors = [];
        const debtors = [];

        Object.keys(this.balances).forEach(person => {
            const balance = this.balances[person];
            if (balance > 0.01) { // Creditori (con tolleranza per arrotondamenti)
                creditors.push({ name: person, amount: balance });
            } else if (balance < -0.01) { // Debitori
                debtors.push({ name: person, amount: -balance });
            }
        });

        // Ordina per importo decrescente
        creditors.sort((a, b) => b.amount - a.amount);
        debtors.sort((a, b) => b.amount - a.amount);

        // Calcola i trasferimenti minimi
        const transfers = [];
        let i = 0, j = 0;

        while (i < creditors.length && j < debtors.length) {
            const creditor = creditors[i];
            const debtor = debtors[j];

            const amount = Math.min(creditor.amount, debtor.amount);

            if (amount > 0.01) { // Ignora trasferimenti molto piccoli
                transfers.push({
                    from: debtor.name,
                    to: creditor.name,
                    amount: amount
                });
            }

            creditor.amount -= amount;
            debtor.amount -= amount;

            if (creditor.amount < 0.01) i++;
            if (debtor.amount < 0.01) j++;
        }

        // Mostra i trasferimenti
        this.displayTransfers(transfers);
    },

    // Mostra i trasferimenti ottimizzati
    displayTransfers(transfers) {
        const container = document.getElementById('transfersList');
        const section = document.getElementById('optimizedTransfers');
        
        if (!container || !section) return;

        section.style.display = 'block';
        container.innerHTML = '';

        if (transfers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">✅</div>
                    <h3>Tutti i conti sono in pari!</h3>
                    <p>Non sono necessari trasferimenti</p>
                </div>
            `;
            return;
        }

        transfers.forEach((transfer, index) => {
            const card = document.createElement('div');
            card.className = 'transfer-card';
            card.style.cssText = `
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border: 2px solid #dee2e6;
                border-radius: 12px;
                padding: 1.5rem;
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                transition: transform 0.2s;
            `;
            
            // Ottieni foto dei partecipanti
            const fromPhoto = this.getParticipantPhoto(transfer.from);
            const toPhoto = this.getParticipantPhoto(transfer.to);
            
            const fromPhotoHtml = fromPhoto
                ? `<img src="${fromPhoto}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #dc3545; margin-right: 0.5rem;" />`
                : '';
            const toPhotoHtml = toPhoto
                ? `<img src="${toPhoto}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #28a745; margin-left: 0.5rem;" />`
                : '';
            
            card.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #007bff, #0056b3);
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    flex-shrink: 0;
                ">
                    ${index + 1}
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 1.1rem; margin-bottom: 0.25rem; display: flex; align-items: center;">
                        ${fromPhotoHtml}
                        <strong>${transfer.from}</strong>
                        <span style="color: #6c757d; margin: 0 0.5rem;">→</span>
                        ${toPhotoHtml}
                        <strong>${transfer.to}</strong>
                    </div>
                    <div style="font-size: 0.9rem; color: #6c757d;">
                        Trasferimento
                    </div>
                </div>
                <div style="
                    background: linear-gradient(135deg, #28a745, #1e7e34);
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 50px;
                    font-size: 1.3rem;
                    font-weight: bold;
                    flex-shrink: 0;
                ">
                    €${transfer.amount.toFixed(2)}
                </div>
            `;
            
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-2px)';
                card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = 'none';
            });
            
            container.appendChild(card);
        });

        // Aggiungi riepilogo
        const totalTransfers = transfers.reduce((sum, t) => sum + t.amount, 0);
        const summary = document.createElement('div');
        summary.style.cssText = `
            margin-top: 1.5rem;
            padding: 1rem;
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            border-radius: 8px;
            text-align: center;
        `;
        summary.innerHTML = `
            <div style="font-size: 0.9rem; color: #1976d2; margin-bottom: 0.25rem;">
                Totale da trasferire
            </div>
            <div style="font-size: 1.5rem; font-weight: bold; color: #0d47a1;">
                €${totalTransfers.toFixed(2)}
            </div>
            <div style="font-size: 0.85rem; color: #1976d2; margin-top: 0.5rem;">
                in ${transfers.length} trasferiment${transfers.length === 1 ? 'o' : 'i'}
            </div>
        `;
        container.appendChild(summary);

        // Scroll alla sezione dei trasferimenti
        section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
};

// Inizializza quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SettlementsManager.init());
} else {
    SettlementsManager.init();
}

// Made with Bob
