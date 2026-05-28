// ===== Settlements Management (Dare/Avere) =====

const SettlementsManager = {
    currentActual: null,
    payments: [], // Array per tracciare i pagamenti

    // Inizializza la view
    init() {
        this.setupEventListeners();
        this.loadActualsList();
    },

    // Carica direttamente un consuntivo (senza selettore)
    loadActualDirect(actual) {
        this.currentActual = actual;
        
        // Inizializza i pagamenti se non esistono
        if (!this.currentActual.payments) {
            this.currentActual.payments = [];
        }
        this.payments = this.currentActual.payments;
        
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
        
        // Mostra storico pagamenti
        this.displayPaymentsHistory();
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
    async loadActual(actualId) {
        const actual = await StorageManager.getActual(actualId);
        if (!actual) return;

        this.currentActual = actual;
        
        // Inizializza i pagamenti se non esistono
        if (!this.currentActual.payments) {
            this.currentActual.payments = [];
        }
        this.payments = this.currentActual.payments;
        
        // Mostra il contenuto
        document.getElementById('settlementsContent').style.display = 'block';
        document.getElementById('optimizedTransfers').style.display = 'none';

        // Aggiorna statistiche
        this.updateStats(actual);

        // Calcola e mostra i bilanci
        this.calculateBalances(actual);
        
        // Mostra storico pagamenti
        this.displayPaymentsHistory();
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
        const paymentsReceived = {}; // Pagamenti ricevuti
        const paymentsMade = {}; // Pagamenti effettuati
        
        actual.participants.forEach(p => {
            paid[p] = 0;
            owes[p] = 0;
            paymentsReceived[p] = 0;
            paymentsMade[p] = 0;
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

        // Calcola i pagamenti confermati tra partecipanti
        // IMPORTANTE: I pagamenti tra partecipanti sono TRASFERIMENTI che saldano i debiti
        // - Chi paga: il pagamento RIDUCE il suo debito (quindi si AGGIUNGE al bilancio)
        // - Chi riceve: il pagamento RIDUCE il suo credito (quindi si SOTTRAE dal bilancio)
        if (this.payments && Array.isArray(this.payments)) {
            this.payments.forEach(payment => {
                if (payment.confirmed) {
                    const amount = parseFloat(payment.amount) || 0;
                    // Chi riceve: sottrai dal bilancio (riduce il credito)
                    if (paymentsReceived.hasOwnProperty(payment.to)) {
                        paymentsReceived[payment.to] += amount;
                    }
                    // Chi paga: aggiungi al bilancio (riduce il debito)
                    if (paymentsMade.hasOwnProperty(payment.from)) {
                        paymentsMade[payment.from] += amount;
                    }
                }
            });
        }

        // Calcola il bilancio finale
        // Formula corretta: paid - owes + paymentsMade - paymentsReceived
        // - paid: quanto ha pagato per le spese
        // - owes: quanto deve per le spese condivise
        // - paymentsMade: pagamenti fatti ad altri (RIDUCONO il debito, quindi +)
        // - paymentsReceived: pagamenti ricevuti da altri (RIDUCONO il credito, quindi -)
        const balances = {};
        actual.participants.forEach(p => {
            balances[p] = paid[p] - owes[p] + paymentsMade[p] - paymentsReceived[p];
        });

        // Calcola la quota media per visualizzazione (non più usata per il calcolo)
        const totalCost = this.calculateTotalCost(actual);
        const avgShare = actual.participants.length > 0 ? totalCost / actual.participants.length : 0;

        // Mostra i bilanci
        this.displayBalances(balances, paid, owes, avgShare, paymentsReceived, paymentsMade);

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
    displayBalances(balances, paid, owes, avgShare, paymentsReceived = {}, paymentsMade = {}) {
        const container = document.getElementById('participantBalances');
        if (!container) return;

        container.innerHTML = '';
        
        // Aggiungi pulsante per nuovo pagamento generico
        const newPaymentBtn = document.createElement('div');
        newPaymentBtn.style.cssText = 'grid-column: 1 / -1; margin-bottom: 1rem;';
        newPaymentBtn.innerHTML = `
            <button class="btn btn-primary" style="width: 100%; font-size: 1.1rem; padding: 0.75rem;"
                    onclick="SettlementsManager.showNewPaymentModal()">
                ➕ Nuovo Pagamento
            </button>
        `;
        container.appendChild(newPaymentBtn);

        Object.keys(balances).sort().forEach(participant => {
            const balance = balances[participant];
            const paidAmount = paid[participant];
            const owesAmount = owes[participant];
            const received = paymentsReceived[participant] || 0;
            const made = paymentsMade[participant] || 0;
            
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
            
            // Mostra info pagamenti se presenti
            const paymentsInfo = (received > 0 || made > 0) ? `
                <div style="margin-bottom: 0.75rem; padding: 0.5rem; background: #f8f9fa; border-radius: 6px;">
                    ${received > 0 ? `<div style="font-size: 0.85rem; color: #28a745;">✅ Ricevuti: €${received.toFixed(2)}</div>` : ''}
                    ${made > 0 ? `<div style="font-size: 0.85rem; color: #dc3545;">💸 Pagati: €${made.toFixed(2)}</div>` : ''}
                </div>
            ` : '';
            
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
                    ${paymentsInfo}
                    <div style="padding-top: 0.75rem; border-top: 2px solid #dee2e6;">
                        <div style="font-size: 0.85rem; color: ${statusColor}; font-weight: 600;">${statusText}</div>
                        <div style="font-size: 1.3rem; font-weight: bold; color: ${statusColor};">
                            €${Math.abs(balance).toFixed(2)}
                        </div>
                    </div>
                    <button class="btn ${balance !== 0 ? 'btn-primary' : 'btn-secondary'}"
                            style="width: 100%; margin-top: 0.75rem; font-size: 0.9rem;"
                            onclick="SettlementsManager.showPaymentModal('${participant}', ${balance})">
                        💳 ${balance > 0 ? 'Registra Incasso' : balance < 0 ? 'Registra Pagamento' : 'Registra Pagamento'}
                    </button>
                </div>
            `;
            
            container.appendChild(card);
        });
    },

    // Ottimizza i trasferimenti (algoritmo greedy)
    // NOTA: Usa this.balances che è già calcolato considerando:
    // - Spese pagate da ogni partecipante
    // - Quote spese dovute
    // - Pagamenti confermati ricevuti/effettuati
    optimizeTransfers() {
        // IMPORTANTE: Ricalcola sempre i bilanci prima di ottimizzare
        // per assicurarsi che i pagamenti confermati siano considerati
        if (!this.currentActual) return;
        
        this.calculateBalances(this.currentActual);
        
        if (!this.balances) return;

        // Crea array di creditori (chi deve ricevere) e debitori (chi deve dare)
        // basandosi sui bilanci già aggiornati con i pagamenti confermati
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

        // Salva i trasferimenti e apri il modal
        this.currentTransfers = transfers;
        this.showTransfersModal(transfers);
    },

    // Mostra modal con i trasferimenti ottimizzati
    showTransfersModal(transfers) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'transfersModal';
        modal.style.cssText = 'display: flex; align-items: center; justify-content: center;';
        
        const totalTransfers = transfers.reduce((sum, t) => sum + t.amount, 0);
        
        let transfersHtml = '';
        
        if (transfers.length === 0) {
            transfersHtml = `
                <div class="empty-state" style="text-align: center; padding: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 0.5rem;">✅</div>
                    <h3 style="margin-bottom: 0.25rem;">Tutti i conti sono in pari!</h3>
                    <p style="color: #6c757d; font-size: 0.9rem;">Non sono necessari trasferimenti</p>
                </div>
            `;
        } else {
            transfersHtml = transfers.map((transfer, index) => {
                const fromPhoto = this.getParticipantPhoto(transfer.from);
                const toPhoto = this.getParticipantPhoto(transfer.to);
                
                const fromPhotoHtml = fromPhoto
                    ? `<img src="${fromPhoto}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid #dc3545; margin-right: 0.4rem;" />`
                    : '';
                const toPhotoHtml = toPhoto
                    ? `<img src="${toPhoto}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid #28a745; margin-left: 0.4rem;" />`
                    : '';
                
                return `
                    <div class="transfer-card" style="
                        background: #f8f9fa;
                        border: 1px solid #dee2e6;
                        border-radius: 8px;
                        padding: 0.75rem;
                        margin-bottom: 0.5rem;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                    ">
                        <div style="
                            background: #007bff;
                            color: white;
                            width: 28px;
                            height: 28px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-weight: bold;
                            font-size: 0.85rem;
                            flex-shrink: 0;
                        ">
                            ${index + 1}
                        </div>
                        <div style="flex: 1; display: flex; align-items: center; font-size: 0.95rem;">
                            ${fromPhotoHtml}
                            <strong>${transfer.from}</strong>
                            <span style="color: #6c757d; margin: 0 0.4rem;">→</span>
                            ${toPhotoHtml}
                            <strong>${transfer.to}</strong>
                        </div>
                        <div style="
                            background: #28a745;
                            color: white;
                            padding: 0.4rem 1rem;
                            border-radius: 20px;
                            font-size: 1.1rem;
                            font-weight: bold;
                            flex-shrink: 0;
                        ">
                            €${transfer.amount.toFixed(2)}
                        </div>
                    </div>
                `;
            }).join('');
            
            // Aggiungi riepilogo compatto
            transfersHtml += `
                <div style="
                    margin-top: 1rem;
                    padding: 0.75rem;
                    background: #e3f2fd;
                    border-radius: 6px;
                    text-align: center;
                ">
                    <div style="font-size: 0.85rem; color: #1976d2; margin-bottom: 0.25rem;">
                        Totale: <strong style="font-size: 1.2rem; color: #0d47a1;">€${totalTransfers.toFixed(2)}</strong>
                        <span style="margin-left: 0.5rem;">in ${transfers.length} trasferiment${transfers.length === 1 ? 'o' : 'i'}</span>
                    </div>
                </div>
            `;
        }
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px; max-height: 85vh; overflow-y: auto;">
                <div class="modal-header" style="padding: 1rem 1.5rem;">
                    <h3 style="font-size: 1.3rem; margin: 0;">🔄 Trasferimenti Ottimizzati</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body" style="padding: 1rem 1.5rem;">
                    <div style="background: #e7f3ff; border-left: 3px solid #007bff; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem; font-size: 0.9rem;">
                        <strong style="color: #0056b3;">ℹ️</strong>
                        <span style="color: #004085;">Trasferimenti minimi per pareggiare i conti</span>
                    </div>
                    ${transfersHtml}
                </div>
                <div class="modal-footer" style="display: flex; gap: 0.5rem; justify-content: flex-end; padding: 1rem 1.5rem;">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        Chiudi
                    </button>
                    ${transfers.length > 0 ? `
                        <button class="btn btn-success" onclick="SettlementsManager.exportTransfersToExcel()">
                            📊 Esporta Excel
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },

    // Esporta i trasferimenti in Excel (formato XLSX)
    exportTransfersToExcel() {
        if (!this.currentTransfers || this.currentTransfers.length === 0) {
            alert('Nessun trasferimento da esportare.');
            return;
        }
        
        // Verifica che la libreria XLSX sia disponibile
        if (typeof XLSX === 'undefined') {
            alert('Libreria XLSX non disponibile. Impossibile esportare.');
            return;
        }
        
        // Prepara i dati per Excel
        const data = [];
        
        // Header con stile
        data.push(['#', 'Da', 'A', 'Importo (€)', 'Data Suggerita', 'Note']);
        
        // Dati trasferimenti
        this.currentTransfers.forEach((transfer, index) => {
            data.push([
                index + 1,
                transfer.from,
                transfer.to,
                parseFloat(transfer.amount.toFixed(2)),
                new Date().toLocaleDateString('it-IT'),
                'Trasferimento ottimizzato'
            ]);
        });
        
        // Aggiungi riga vuota
        data.push([]);
        
        // Aggiungi riga totale
        const total = this.currentTransfers.reduce((sum, t) => sum + t.amount, 0);
        data.push(['', '', 'TOTALE', parseFloat(total.toFixed(2)), '', '']);
        
        // Crea il workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        
        // Imposta larghezza colonne
        ws['!cols'] = [
            { wch: 5 },   // #
            { wch: 20 },  // Da
            { wch: 20 },  // A
            { wch: 12 },  // Importo
            { wch: 15 },  // Data
            { wch: 25 }   // Note
        ];
        
        // Aggiungi il worksheet al workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Trasferimenti');
        
        // Nome file con data e nome consuntivo
        const actualName = this.currentActual ? this.currentActual.name.replace(/[^a-z0-9]/gi, '_') : 'consuntivo';
        const date = new Date().toISOString().split('T')[0];
        const filename = `trasferimenti_${actualName}_${date}.xlsx`;
        
        // Scarica il file
        XLSX.writeFile(wb, filename);
        
        // Mostra notifica
        this.showNotification('📊 File Excel esportato con successo!', 'success');
    },


    // ===== Gestione Pagamenti =====

    // Mostra modal per nuovo pagamento generico
    showNewPaymentModal() {
        if (!this.currentActual || !this.currentActual.participants || this.currentActual.participants.length < 2) {
            alert('Servono almeno 2 partecipanti per registrare un pagamento.');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>➕ Nuovo Pagamento</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Da chi (pagatore)</label>
                        <select id="paymentFrom" class="form-control">
                            <option value="">-- Seleziona --</option>
                            ${this.currentActual.participants.map(p => `<option value="${p}">${p}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>A chi (destinatario)</label>
                        <select id="paymentTo" class="form-control">
                            <option value="">-- Seleziona --</option>
                            ${this.currentActual.participants.map(p => `<option value="${p}">${p}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Importo (€)</label>
                        <input type="number" id="paymentAmount" class="form-control"
                               min="0" step="0.01" value=""
                               placeholder="Inserisci importo">
                    </div>
                    <div class="form-group">
                        <label>Data</label>
                        <input type="date" id="paymentDate" class="form-control"
                               value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label>Note (opzionale)</label>
                        <textarea id="paymentNotes" class="form-control" rows="2"
                                  placeholder="Aggiungi note sul pagamento..."></textarea>
                    </div>
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="paymentConfirmed" checked>
                            <span>Conferma pagamento immediatamente</span>
                        </label>
                        <small style="color: #6c757d; display: block; margin-top: 0.25rem;">
                            Se selezionato, il pagamento verrà confermato e scalato subito dai bilanci
                        </small>
                    </div>
                </div>
                <div class="modal-footer" style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        Annulla
                    </button>
                    <button class="btn btn-primary" onclick="SettlementsManager.saveNewPayment()">
                        💾 Salva Pagamento
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        setTimeout(() => {
            document.getElementById('paymentFrom').focus();
        }, 100);
    },

    // Mostra modal per registrare un pagamento da una card specifica
    showPaymentModal(participant, balance) {
        const isReceiving = balance > 0;
        const amount = Math.abs(balance);
        
        // Ottieni lista degli altri partecipanti
        const otherParticipants = this.currentActual.participants.filter(p => p !== participant);
        
        if (otherParticipants.length === 0) {
            alert('Non ci sono altri partecipanti per effettuare pagamenti.');
            return;
        }
        
        // Crea il modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>${isReceiving ? '💰 Registra Incasso' : '💸 Registra Pagamento'}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>${isReceiving ? 'Da chi ricevi?' : 'A chi paghi?'}</label>
                        <select id="paymentParticipant" class="form-control">
                            <option value="">-- Seleziona --</option>
                            ${otherParticipants.map(p => `<option value="${p}">${p}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Importo (€)</label>
                        <input type="number" id="paymentAmount" class="form-control"
                               min="0" step="0.01" value="${amount > 0 ? amount.toFixed(2) : ''}"
                               placeholder="Inserisci importo">
                    </div>
                    <div class="form-group">
                        <label>Data</label>
                        <input type="date" id="paymentDate" class="form-control"
                               value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label>Note (opzionale)</label>
                        <textarea id="paymentNotes" class="form-control" rows="2"
                                  placeholder="Aggiungi note sul pagamento..."></textarea>
                    </div>
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="paymentConfirmed" checked>
                            <span>Conferma pagamento immediatamente</span>
                        </label>
                        <small style="color: #6c757d; display: block; margin-top: 0.25rem;">
                            Se selezionato, il pagamento verrà confermato e scalato subito dai bilanci
                        </small>
                    </div>
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                        <p style="margin: 0; font-size: 0.9rem; color: #6c757d;">
                            ${isReceiving
                                ? `<strong>${participant}</strong> riceverà il pagamento da un altro partecipante.`
                                : `<strong>${participant}</strong> effettuerà il pagamento verso un altro partecipante.`
                            }
                        </p>
                    </div>
                </div>
                <div class="modal-footer" style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        Annulla
                    </button>
                    <button class="btn btn-primary" onclick="SettlementsManager.savePayment('${participant}', ${isReceiving})">
                        💾 Salva Pagamento
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Focus sul primo campo
        setTimeout(() => {
            document.getElementById('paymentParticipant').focus();
        }, 100);
    },

    // Salva un nuovo pagamento generico
    async saveNewPayment() {
        const from = document.getElementById('paymentFrom').value;
        const to = document.getElementById('paymentTo').value;
        const amount = parseFloat(document.getElementById('paymentAmount').value);
        const date = document.getElementById('paymentDate').value;
        const notes = document.getElementById('paymentNotes').value;
        const confirmed = document.getElementById('paymentConfirmed').checked;
        
        // Validazione
        if (!from) {
            alert('Seleziona chi effettua il pagamento.');
            return;
        }
        
        if (!to) {
            alert('Seleziona chi riceve il pagamento.');
            return;
        }
        
        if (from === to) {
            alert('Il pagatore e il destinatario devono essere diversi.');
            return;
        }
        
        if (!amount || amount <= 0) {
            alert('Inserisci un importo valido.');
            return;
        }
        
        if (!date) {
            alert('Inserisci una data.');
            return;
        }
        
        // Crea oggetto pagamento
        const payment = {
            id: Date.now().toString(),
            from: from,
            to: to,
            amount: amount,
            date: date,
            notes: notes,
            confirmed: confirmed,
            createdAt: new Date().toISOString()
        };
        
        // Aggiungi timestamp di conferma se confermato
        if (confirmed) {
            payment.confirmedAt = new Date().toISOString();
        }
        
        // Aggiungi al array dei pagamenti
        this.payments.push(payment);
        this.currentActual.payments = this.payments;
        
        // Salva nel storage e invalida cache
        await StorageManager.updateActual(this.currentActual.id, {
            payments: this.payments
        });
        
        // Invalida la cache per forzare ricaricamento da Supabase
        await StorageManager.invalidateCache();
        
        // Chiudi tutti i modal aperti
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.remove());
        
        // Aggiorna la vista
        this.calculateBalances(this.currentActual);
        this.displayPaymentsHistory();
        
        // Mostra messaggio di successo
        const message = confirmed
            ? '✅ Pagamento registrato, confermato e sincronizzato su Supabase!'
            : '✅ Pagamento registrato e sincronizzato su Supabase!';
        this.showNotification(message, 'success');
    },

    // Salva un nuovo pagamento
    async savePayment(participant, isReceiving) {
        const otherParticipant = document.getElementById('paymentParticipant').value;
        const amount = parseFloat(document.getElementById('paymentAmount').value);
        const date = document.getElementById('paymentDate').value;
        const notes = document.getElementById('paymentNotes').value;
        const confirmed = document.getElementById('paymentConfirmed').checked;
        
        // Validazione
        if (!otherParticipant) {
            alert('Seleziona il partecipante.');
            return;
        }
        
        if (!amount || amount <= 0) {
            alert('Inserisci un importo valido.');
            return;
        }
        
        if (!date) {
            alert('Inserisci una data.');
            return;
        }
        
        // Crea oggetto pagamento
        const payment = {
            id: Date.now().toString(),
            from: isReceiving ? otherParticipant : participant,
            to: isReceiving ? participant : otherParticipant,
            amount: amount,
            date: date,
            notes: notes,
            confirmed: confirmed,
            createdAt: new Date().toISOString()
        };
        
        // Aggiungi timestamp di conferma se confermato
        if (confirmed) {
            payment.confirmedAt = new Date().toISOString();
        }
        
        // Aggiungi al array dei pagamenti
        this.payments.push(payment);
        this.currentActual.payments = this.payments;
        
        // Salva nel storage e invalida cache
        await StorageManager.updateActual(this.currentActual.id, {
            payments: this.payments
        });
        
        // Invalida la cache per forzare ricaricamento da Supabase
        await StorageManager.invalidateCache();
        
        // Chiudi tutti i modal aperti
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.remove());
        
        // Aggiorna la vista
        this.calculateBalances(this.currentActual);
        this.displayPaymentsHistory();
        
        // Mostra messaggio di successo
        const message = confirmed
            ? '✅ Pagamento registrato, confermato e sincronizzato su Supabase!'
            : '✅ Pagamento registrato e sincronizzato su Supabase!';
        this.showNotification(message, 'success');
    },

    // Conferma un pagamento
    async confirmPayment(paymentId) {
        const payment = this.payments.find(p => p.id === paymentId);
        if (!payment) return;
        
        if (confirm(`Confermare il pagamento di €${payment.amount.toFixed(2)} da ${payment.from} a ${payment.to}?`)) {
            payment.confirmed = true;
            payment.confirmedAt = new Date().toISOString();
            
            // Salva nel storage e invalida cache
            await StorageManager.updateActual(this.currentActual.id, {
                payments: this.payments
            });
            
            // Invalida la cache per forzare ricaricamento da Supabase
            await StorageManager.invalidateCache();
            
            // Aggiorna la vista
            this.calculateBalances(this.currentActual);
            this.displayPaymentsHistory();
            
            this.showNotification('✅ Pagamento confermato e sincronizzato su Supabase!', 'success');
        }
    },

    // Elimina un pagamento
    async deletePayment(paymentId) {
        if (confirm('Eliminare questo pagamento?')) {
            this.payments = this.payments.filter(p => p.id !== paymentId);
            this.currentActual.payments = this.payments;
            
            // Salva nel storage e invalida cache
            await StorageManager.updateActual(this.currentActual.id, {
                payments: this.payments
            });
            
            // Invalida la cache per forzare ricaricamento da Supabase
            await StorageManager.invalidateCache();
            
            // Ricarica il consuntivo da Supabase
            this.currentActual = await StorageManager.getActual(this.currentActual.id);
            this.payments = this.currentActual.payments || [];
            
            // Aggiorna la vista
            this.calculateBalances(this.currentActual);
            this.displayPaymentsHistory();
            
            this.showNotification('🗑️ Pagamento eliminato e sincronizzato su Supabase.', 'success');
        }
    },

    // Mostra storico pagamenti
    displayPaymentsHistory() {
        let container = document.getElementById('paymentsHistory');
        
        // Se il container non esiste, crealo
        if (!container) {
            const settlementsContent = document.getElementById('settlementsContent');
            if (!settlementsContent) return;
            
            const section = document.createElement('div');
            section.className = 'form-section';
            section.style.marginTop = 'var(--spacing-lg)';
            section.innerHTML = `
                <h3>📋 Storico Pagamenti</h3>
                <div id="paymentsHistory"></div>
            `;
            
            // Inserisci prima della sezione trasferimenti ottimizzati
            const optimizedSection = document.getElementById('optimizedTransfers');
            if (optimizedSection) {
                optimizedSection.parentNode.insertBefore(section, optimizedSection);
            } else {
                settlementsContent.appendChild(section);
            }
            
            container = document.getElementById('paymentsHistory');
        }
        
        if (!this.payments || this.payments.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #6c757d;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">💳</div>
                    <p>Nessun pagamento registrato</p>
                    <p style="font-size: 0.9rem;">I pagamenti tra partecipanti appariranno qui</p>
                </div>
            `;
            return;
        }
        
        // Ordina per data (più recenti prima)
        const sortedPayments = [...this.payments].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        container.innerHTML = sortedPayments.map(payment => {
            const fromPhoto = this.getParticipantPhoto(payment.from);
            const toPhoto = this.getParticipantPhoto(payment.to);
            
            const fromPhotoHtml = fromPhoto
                ? `<img src="${fromPhoto}" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover; border: 2px solid #dc3545; margin-right: 0.5rem;" />`
                : '';
            const toPhotoHtml = toPhoto
                ? `<img src="${toPhoto}" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover; border: 2px solid #28a745; margin-left: 0.5rem;" />`
                : '';
            
            const statusBadge = payment.confirmed
                ? '<span style="background: #28a745; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">✓ Confermato</span>'
                : '<span style="background: #ffc107; color: #000; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">⏳ In attesa</span>';
            
            return `
                <div style="
                    background: ${payment.confirmed ? 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' : 'linear-gradient(135deg, #fff3cd 0%, #fff8e1 100%)'};
                    border: 2px solid ${payment.confirmed ? '#dee2e6' : '#ffc107'};
                    border-radius: 12px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: transform 0.2s;
                " onmouseenter="this.style.transform='translateY(-2px)'" onmouseleave="this.style.transform='translateY(0)'">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                            ${fromPhotoHtml}
                            <strong>${payment.from}</strong>
                            <span style="margin: 0 0.5rem; color: #6c757d;">→</span>
                            ${toPhotoHtml}
                            <strong>${payment.to}</strong>
                        </div>
                        <div style="font-size: 0.9rem; color: #6c757d; margin-bottom: 0.25rem;">
                            📅 ${new Date(payment.date).toLocaleDateString('it-IT')}
                        </div>
                        ${payment.notes ? `<div style="font-size: 0.85rem; color: #6c757d; font-style: italic;">💬 ${payment.notes}</div>` : ''}
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #28a745; margin-bottom: 0.5rem;">
                            €${payment.amount.toFixed(2)}
                        </div>
                        <div style="margin-bottom: 0.5rem;">
                            ${statusBadge}
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            ${!payment.confirmed ? `
                                <button class="btn btn-primary" style="font-size: 0.85rem; padding: 0.25rem 0.75rem;" 
                                        onclick="SettlementsManager.confirmPayment('${payment.id}')">
                                    ✓ Conferma
                                </button>
                            ` : ''}
                            <button class="btn btn-danger" style="font-size: 0.85rem; padding: 0.25rem 0.75rem;" 
                                    onclick="SettlementsManager.deletePayment('${payment.id}')">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Mostra notifica
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Inizializza quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SettlementsManager.init());
} else {
    SettlementsManager.init();
}

// Aggiungi animazioni CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Made with Bob
