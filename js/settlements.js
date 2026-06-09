// ===== Settlements Management (Dare/Avere) =====

const SettlementsManager = {
    currentActual: null,
    payments: [], // Array per tracciare i pagamenti
    sourceActualId: null, // ID del consuntivo da cui si è arrivati

    // Inizializza la view
    init() {
        this.setupEventListeners();
        this.loadActualsList();
    },

    // Carica direttamente un consuntivo (senza selettore)
    loadActualDirect(actual) {
        this.currentActual = actual;
        this.sourceActualId = actual.id; // Salva l'ID del consuntivo di origine
        
        // Inizializza i pagamenti se non esistono
        if (!this.currentActual.payments) {
            this.currentActual.payments = [];
        }
        this.payments = this.currentActual.payments;
        
        // Nascondi il selettore e mostra la selezione partecipanti
        const selectSection = document.querySelector('#settlementsView .form-section');
        if (selectSection) selectSection.style.display = 'none';
        
        // Aggiorna il titolo
        document.getElementById('settlementsTitle').textContent = `🔄 Dare/Avere - ${actual.name}`;

        // Mostra la selezione partecipanti
        this.showParticipantSelection();
    },

    // Setup event listeners
    setupEventListeners() {
        const backBtn = document.getElementById('backFromSettlementsBtn');
        const actualSelect = document.getElementById('settlementsActualSelect');
        const optimizeBtn = document.getElementById('optimizeSettlementsBtn');

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                // Se siamo arrivati da un consuntivo specifico, torna al dettaglio
                if (this.sourceActualId) {
                    ActualsUI.editActual(this.sourceActualId);
                    this.sourceActualId = null; // Reset dopo l'uso
                } else {
                    // Altrimenti torna alla lista dei consuntivi
                    App.showView('actualsView');
                }
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
        
        // Aggiorna il titolo
        document.getElementById('settlementsTitle').textContent = `🔄 Dare/Avere - ${actual.name}`;

        // Mostra la selezione partecipanti
        this.showParticipantSelection();
    },
    
    // Mostra la selezione dei partecipanti con schede compatte
    showParticipantSelection() {
        const container = document.getElementById('participantBalances');
        if (!container) return;
        
        // Nascondi altri contenuti
        document.getElementById('settlementsContent').style.display = 'block';
        document.getElementById('optimizedTransfers').style.display = 'none';
        
        container.innerHTML = `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h2 style="color: #2c3e50; margin-bottom: 0.5rem;">👥 Seleziona un Partecipante</h2>
                <p style="color: #6c757d; font-size: 1rem;">Clicca su un partecipante per vedere i suoi conti</p>
            </div>
            <div id="participantCards" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
            </div>
            <div style="text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 12px; border: 2px dashed #dee2e6;">
                <button class="btn btn-primary" style="font-size: 1.1rem; padding: 0.875rem 2rem;"
                        onclick="SettlementsManager.showAllParticipants()">
                    👁️ Mostra Tutti i Partecipanti
                </button>
                <p style="color: #6c757d; font-size: 0.9rem; margin-top: 1rem; margin-bottom: 0;">
                    Visualizza i bilanci di tutti insieme
                </p>
            </div>
        `;
        
        const cardsContainer = document.getElementById('participantCards');
        
        // Crea una card per ogni partecipante
        this.currentActual.participants.forEach(participant => {
            const photo = this.getParticipantPhoto(participant);
            
            const card = document.createElement('div');
            card.className = 'participant-select-card';
            card.style.cssText = `
                background: white;
                border-radius: 12px;
                padding: 1.5rem;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
                border: 2px solid #e9ecef;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            `;
            
            card.innerHTML = `
                <div style="margin-bottom: 1rem;">
                    ${photo
                        ? `<img src="${photo}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #667eea;" />`
                        : `<div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; margin: 0 auto; color: white; font-size: 2rem; font-weight: bold; border: 3px solid #667eea;">
                            ${participant.charAt(0).toUpperCase()}
                           </div>`
                    }
                </div>
                <div style="font-size: 1.1rem; font-weight: 600; color: #2c3e50; margin-bottom: 0.5rem;">
                    ${participant}
                </div>
                <div style="font-size: 0.85rem; color: #667eea; font-weight: 500;">
                    Vedi conti →
                </div>
            `;
            
            // Hover effects
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                card.style.borderColor = '#667eea';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                card.style.borderColor = '#e9ecef';
            });
            
            // Click per selezionare
            card.addEventListener('click', () => {
                this.showParticipantDetails(participant);
            });
            
            cardsContainer.appendChild(card);
        });
    },
    
    // Mostra i dettagli di un singolo partecipante
    showParticipantDetails(participant) {
        const container = document.getElementById('participantBalances');
        if (!container) return;
        
        // Calcola i bilanci per avere i dati aggiornati
        this.calculateBalances(this.currentActual);
        
        // Ottieni i dati del partecipante
        const balance = this.balances[participant];
        const paid = this.calculatePaidByParticipant(participant);
        const owes = this.calculateOwedByParticipant(participant);
        const received = this.calculatePaymentsReceived(participant);
        const made = this.calculatePaymentsMade(participant);
        
        const statusIcon = balance > 0 ? '🟢 ⬆️' : balance < 0 ? '🔴 ⬇️' : '✅';
        const statusText = balance > 0 ? 'Deve ricevere' : balance < 0 ? 'Deve dare' : 'In pari';
        const statusColor = balance > 0 ? '#28a745' : balance < 0 ? '#dc3545' : '#6c757d';
        
        const photo = this.getParticipantPhoto(participant);
        const photoHtml = photo
            ? `<img src="${photo}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 4px solid ${statusColor};" />`
            : `<div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}dd 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 2.5rem; font-weight: bold; border: 4px solid ${statusColor};">
                ${participant.charAt(0).toUpperCase()}
               </div>`;
        
        container.innerHTML = `
            <!-- Pulsante Indietro -->
            <div style="margin-bottom: 2rem;">
                <button class="btn btn-secondary" onclick="SettlementsManager.showParticipantSelection()" style="font-size: 0.95rem;">
                    ← Torna alla Selezione
                </button>
            </div>
            
            <!-- Header Partecipante -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 15px; margin-bottom: 2rem; color: white; text-align: center;">
                <div style="margin-bottom: 1rem;">
                    ${photoHtml}
                </div>
                <h2 style="margin: 0 0 0.5rem 0; font-size: 2rem; color: white;">${participant}</h2>
                <div style="font-size: 1.1rem; opacity: 0.95;">
                    ${statusIcon} ${statusText}
                </div>
            </div>
            
            <!-- Sezione QUOTA TOTALE DEL VIAGGIO -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; color: white; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                <div style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.9; margin-bottom: 0.5rem;">
                    💰 Quota Totale Viaggio
                </div>
                <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 0.5rem;">
                    €${owes.toFixed(2)}
                </div>
                <div style="font-size: 0.95rem; opacity: 0.9;">
                    La tua parte delle spese condivise
                </div>
            </div>
            
            <!-- Grid con Anticipato e Pagamenti -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                <!-- ANTICIPATO -->
                <div style="background: #e8f5e9; padding: 1.5rem; border-radius: 12px; border-left: 5px solid #28a745;">
                    <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: #2e7d32; margin-bottom: 0.5rem; font-weight: 600;">
                        💳 Hai Anticipato
                    </div>
                    <div style="font-size: 2rem; font-weight: bold; color: #1b5e20; margin-bottom: 0.5rem;">
                        €${paid.toFixed(2)}
                    </div>
                    <div style="font-size: 0.8rem; color: #2e7d32;">
                        Totale spese pagate
                    </div>
                </div>
                
                <!-- PAGAMENTI -->
                <div style="background: ${received > 0 || made > 0 ? '#fff3e0' : '#f8f9fa'}; padding: 1.5rem; border-radius: 12px; border-left: 5px solid ${received > 0 || made > 0 ? '#ff9800' : '#dee2e6'};">
                    <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: ${received > 0 || made > 0 ? '#e65100' : '#6c757d'}; margin-bottom: 0.5rem; font-weight: 600;">
                        💸 Pagamenti
                    </div>
                    ${received > 0 ? `
                        <div style="margin-bottom: 0.75rem;">
                            <div style="font-size: 0.75rem; color: #e65100;">📥 Ricevuti</div>
                            <div style="font-size: 1.3rem; font-weight: bold; color: #e65100;">€${received.toFixed(2)}</div>
                        </div>
                    ` : ''}
                    ${made > 0 ? `
                        <div>
                            <div style="font-size: 0.75rem; color: #0d47a1;">📤 Effettuati</div>
                            <div style="font-size: 1.3rem; font-weight: bold; color: #0d47a1;">€${made.toFixed(2)}</div>
                        </div>
                    ` : ''}
                    ${received === 0 && made === 0 ? `
                        <div style="font-size: 1.5rem; color: #6c757d; text-align: center; padding: 1rem 0;">
                            Nessun pagamento
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- BILANCIO FINALE -->
            <div style="background: ${balance > 0 ? '#e8f5e9' : balance < 0 ? '#ffebee' : '#f5f5f5'}; padding: 2rem; border-radius: 15px; border: 3px solid ${statusColor}; margin-bottom: 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <div style="text-align: center;">
                    <div style="font-size: 1rem; text-transform: uppercase; letter-spacing: 1.5px; color: ${statusColor}; font-weight: 700; margin-bottom: 1rem;">
                        ${balance > 0 ? '📈 Bilancio Positivo' : balance < 0 ? '📉 Bilancio Negativo' : '⚖️ Bilancio in Pari'}
                    </div>
                    <div style="font-size: 3rem; font-weight: bold; color: ${statusColor}; margin-bottom: 1rem;">
                        €${Math.abs(balance).toFixed(2)}
                    </div>
                    <div style="font-size: 1.1rem; color: ${statusColor}; font-weight: 600;">
                        ${balance > 0 ? '🟢 Devi ricevere questo importo' : balance < 0 ? '🔴 Devi dare questo importo' : '✅ Sei in pari!'}
                    </div>
                </div>
            </div>
            
            <!-- Pulsanti Azione -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                <button class="btn ${balance !== 0 ? 'btn-primary' : 'btn-secondary'}"
                        style="font-size: 1rem; padding: 1rem; font-weight: 600;"
                        onclick="SettlementsManager.showPaymentModal('${participant}', ${balance})">
                    ${balance > 0 ? '📥 Registra Incasso' : balance < 0 ? '📤 Registra Pagamento' : '💳 Registra Pagamento'}
                </button>
                <button class="btn btn-outline-primary"
                        style="font-size: 1rem; padding: 1rem; font-weight: 600;"
                        onclick="SettlementsManager.showExpenseDetails('${participant}')">
                    📋 Dettaglio Spese
                </button>
            </div>
        `;
    },
    
    // Funzioni helper per calcolare i valori
    calculatePaidByParticipant(participant) {
        let total = 0;
        if (this.currentActual.expenses) {
            this.currentActual.expenses.forEach(expense => {
                if (expense.paidBy === participant) {
                    const amount = expense.amountEUR !== undefined ? expense.amountEUR : expense.amount;
                    total += parseFloat(amount) || 0;
                }
            });
        }
        return total;
    },
    
    calculateOwedByParticipant(participant) {
        let total = 0;
        if (this.currentActual.expenses) {
            this.currentActual.expenses.forEach(expense => {
                const amount = expense.amountEUR !== undefined ? expense.amountEUR : expense.amount;
                let sharedBy = expense.sharedBy || [];
                if (sharedBy.length === 0) {
                    sharedBy = this.currentActual.participants;
                }
                if (sharedBy.includes(participant)) {
                    const sharePerPerson = sharedBy.length > 0 ? (amount || 0) / sharedBy.length : 0;
                    total += sharePerPerson;
                }
            });
        }
        return total;
    },
    
    calculatePaymentsReceived(participant) {
        let total = 0;
        if (this.payments) {
            this.payments.forEach(payment => {
                if (payment.confirmed && payment.to === participant) {
                    total += parseFloat(payment.amount) || 0;
                }
            });
        }
        return total;
    },
    
    calculatePaymentsMade(participant) {
        let total = 0;
        if (this.payments) {
            this.payments.forEach(payment => {
                if (payment.confirmed && payment.from === participant) {
                    total += parseFloat(payment.amount) || 0;
                }
            });
        }
        return total;
    },
    
    // Mostra tutti i partecipanti insieme (vista originale)
    showAllParticipants() {
        // Aggiorna statistiche
        this.updateStats(this.currentActual);
        
        // Calcola e mostra i bilanci di tutti
        this.calculateBalances(this.currentActual);
        
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
        if (!actual || !actual.participants) {
            console.warn('calculateBalances: actual o participants non validi');
            return;
        }
        
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
                
                // Salta spese con importo 0 o non valido
                if (!amount || amount <= 0) return;
                
                const paidBy = expense.paidBy;
                
                // Registra chi ha pagato
                if (paidBy && paid.hasOwnProperty(paidBy)) {
                    paid[paidBy] += amount;
                }
                
                // Calcola la quota per ogni partecipante che condivide questa spesa
                let sharedBy = expense.sharedBy || [];
                
                // Se sharedBy è vuoto, usa tutti i partecipanti del consuntivo
                if (sharedBy.length === 0) {
                    sharedBy = actual.participants;
                }
                
                // Filtra solo i partecipanti validi (che esistono nell'actual)
                sharedBy = sharedBy.filter(p => actual.participants.includes(p));
                
                // Dividi la spesa tra chi la condivide
                const sharePerPerson = sharedBy.length > 0 ? amount / sharedBy.length : 0;
                
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
                ? `<img src="${photo}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 3px solid ${statusColor}; margin-right: 1rem;" />`
                : '';
            
            card.innerHTML = `
                <div class="stat-content">
                    <!-- Header con foto e nome -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 2px solid #e9ecef;">
                        <div style="display: flex; align-items: center;">
                            ${photoHtml}
                            <div>
                                <h4 style="margin: 0; font-size: 1.3rem; font-weight: 700;">${participant}</h4>
                                <div style="font-size: 0.85rem; color: ${statusColor}; font-weight: 600; margin-top: 0.25rem;">
                                    ${statusIcon} ${statusText}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Sezione QUOTA TOTALE DEL VIAGGIO -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1rem; border-radius: 10px; margin-bottom: 1rem; color: white;">
                        <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9; margin-bottom: 0.25rem;">
                            💰 Quota Totale Viaggio
                        </div>
                        <div style="font-size: 1.8rem; font-weight: bold;">
                            €${owesAmount.toFixed(2)}
                        </div>
                        <div style="font-size: 0.8rem; opacity: 0.85; margin-top: 0.25rem;">
                            La tua parte delle spese condivise
                        </div>
                    </div>
                    
                    <!-- Sezione ANTICIPATO -->
                    <div style="background: #e8f5e9; padding: 1rem; border-radius: 10px; margin-bottom: 1rem; border-left: 4px solid #28a745;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #2e7d32; margin-bottom: 0.25rem;">
                                    💳 Hai Anticipato
                                </div>
                                <div style="font-size: 1.5rem; font-weight: bold; color: #1b5e20;">
                                    €${paidAmount.toFixed(2)}
                                </div>
                            </div>
                            <div style="font-size: 2rem;">✅</div>
                        </div>
                        <div style="font-size: 0.75rem; color: #2e7d32; margin-top: 0.5rem;">
                            Totale spese pagate da te
                        </div>
                    </div>
                    
                    <!-- Sezione PAGAMENTI RICEVUTI (se presenti) -->
                    ${received > 0 ? `
                        <div style="background: #fff3e0; padding: 1rem; border-radius: 10px; margin-bottom: 1rem; border-left: 4px solid #ff9800;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #e65100; margin-bottom: 0.25rem;">
                                        📥 Pagamenti Ricevuti
                                    </div>
                                    <div style="font-size: 1.5rem; font-weight: bold; color: #e65100;">
                                        €${received.toFixed(2)}
                                    </div>
                                </div>
                                <div style="font-size: 2rem;">💰</div>
                            </div>
                            <div style="font-size: 0.75rem; color: #e65100; margin-top: 0.5rem;">
                                Soldi ricevuti da altri partecipanti
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Sezione PAGAMENTI EFFETTUATI (se presenti) -->
                    ${made > 0 ? `
                        <div style="background: #e3f2fd; padding: 1rem; border-radius: 10px; margin-bottom: 1rem; border-left: 4px solid #2196f3;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #0d47a1; margin-bottom: 0.25rem;">
                                        📤 Pagamenti Effettuati
                                    </div>
                                    <div style="font-size: 1.5rem; font-weight: bold; color: #0d47a1;">
                                        €${made.toFixed(2)}
                                    </div>
                                </div>
                                <div style="font-size: 2rem;">💸</div>
                            </div>
                            <div style="font-size: 0.75rem; color: #0d47a1; margin-top: 0.5rem;">
                                Soldi pagati ad altri partecipanti
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- BILANCIO FINALE -->
                    <div style="background: ${balance > 0 ? '#e8f5e9' : balance < 0 ? '#ffebee' : '#f5f5f5'}; padding: 1.25rem; border-radius: 10px; border: 2px solid ${statusColor};">
                        <div style="text-align: center;">
                            <div style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; color: ${statusColor}; font-weight: 600; margin-bottom: 0.5rem;">
                                ${balance > 0 ? '📈 Bilancio Positivo' : balance < 0 ? '📉 Bilancio Negativo' : '⚖️ Bilancio in Pari'}
                            </div>
                            <div style="font-size: 2.2rem; font-weight: bold; color: ${statusColor}; margin-bottom: 0.5rem;">
                                €${Math.abs(balance).toFixed(2)}
                            </div>
                            <div style="font-size: 0.9rem; color: ${statusColor}; font-weight: 600;">
                                ${balance > 0 ? '🟢 Devi ricevere questo importo' : balance < 0 ? '🔴 Devi dare questo importo' : '✅ Sei in pari!'}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Pulsante azione -->
                    <button class="btn ${balance !== 0 ? 'btn-primary' : 'btn-secondary'}"
                            style="width: 100%; margin-top: 1rem; font-size: 1rem; padding: 0.875rem; font-weight: 600;"
                            onclick="SettlementsManager.showPaymentModal('${participant}', ${balance})">
                        ${balance > 0 ? '📥 Registra Incasso' : balance < 0 ? '📤 Registra Pagamento' : '💳 Registra Pagamento'}
                    </button>
                    
                    <!-- Link al dettaglio spese -->
                    <button class="btn btn-outline-secondary"
                            style="width: 100%; margin-top: 0.5rem; font-size: 0.9rem; padding: 0.625rem;"
                            onclick="SettlementsManager.showExpenseDetails('${participant}')">
                        📋 Vedi Dettaglio Spese
                    </button>
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
                    <button class="btn btn-primary" id="saveNewPaymentBtn">
                        💾 Salva Pagamento
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Aggiungi event listener per il pulsante salva
        document.getElementById('saveNewPaymentBtn').addEventListener('click', async (e) => {
            const btn = e.target;
            const originalText = btn.innerHTML;
            
            try {
                // Disabilita il pulsante durante il salvataggio
                btn.disabled = true;
                btn.innerHTML = '⏳ Salvataggio...';
                
                await this.saveNewPayment();
                
                // Chiudi il modal dopo il salvataggio
                modal.remove();
            } catch (error) {
                console.error('Errore salvataggio pagamento:', error);
                alert('Errore durante il salvataggio del pagamento: ' + error.message);
                
                // Riabilita il pulsante in caso di errore
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        });
        
        setTimeout(() => {
            document.getElementById('paymentFrom').focus();
        }, 100);
    },

    // Mostra dettaglio spese per un partecipante
    showExpenseDetails(participant) {
        if (!this.currentActual || !this.currentActual.expenses) {
            alert('Nessuna spesa disponibile');
            return;
        }
        
        // Filtra le spese che coinvolgono questo partecipante
        const participantExpenses = this.currentActual.expenses.filter(expense => {
            // Spese pagate dal partecipante
            const isPayer = expense.paidBy === participant;
            // Spese condivise dal partecipante
            const isSharer = expense.sharedBy && expense.sharedBy.includes(participant);
            return isPayer || isSharer;
        });
        
        if (participantExpenses.length === 0) {
            alert(`Nessuna spesa trovata per ${participant}`);
            return;
        }
        
        // Calcola totali
        let totalPaid = 0;
        let totalOwed = 0;
        
        participantExpenses.forEach(expense => {
            const amount = expense.amountEUR !== undefined ? expense.amountEUR : expense.amount;
            
            if (expense.paidBy === participant) {
                totalPaid += amount;
            }
            
            if (expense.sharedBy && expense.sharedBy.includes(participant)) {
                const sharePerPerson = expense.sharedBy.length > 0 ? amount / expense.sharedBy.length : 0;
                totalOwed += sharePerPerson;
            }
        });
        
        // Crea il modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        // Genera HTML per le spese
        const expensesHtml = participantExpenses.map(expense => {
            const amount = expense.amountEUR !== undefined ? expense.amountEUR : expense.amount;
            const isPayer = expense.paidBy === participant;
            const isSharer = expense.sharedBy && expense.sharedBy.includes(participant);
            const shareAmount = isSharer && expense.sharedBy.length > 0 
                ? amount / expense.sharedBy.length 
                : 0;
            
            // Icona categoria
            const categoryIcon = ActualsManager.categories.find(c => c.value === expense.category)?.icon || '📝';
            
            return `
                <div style="background: white; padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem; border-left: 4px solid ${isPayer ? '#28a745' : '#2196f3'};">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem;">
                                ${categoryIcon} ${expense.description}
                            </div>
                            <div style="font-size: 0.8rem; color: #6c757d;">
                                ${expense.date ? new Date(expense.date).toLocaleDateString('it-IT') : ''}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.1rem; font-weight: bold; color: #2c3e50;">
                                €${amount.toFixed(2)}
                            </div>
                        </div>
                    </div>
                    
                    ${isPayer ? `
                        <div style="background: #e8f5e9; padding: 0.5rem; border-radius: 5px; margin-bottom: 0.5rem;">
                            <div style="font-size: 0.75rem; color: #2e7d32; font-weight: 600;">
                                💳 HAI PAGATO: €${amount.toFixed(2)}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${isSharer ? `
                        <div style="background: #e3f2fd; padding: 0.5rem; border-radius: 5px;">
                            <div style="font-size: 0.75rem; color: #0d47a1; font-weight: 600;">
                                📊 TUA QUOTA: €${shareAmount.toFixed(2)}
                            </div>
                            <div style="font-size: 0.7rem; color: #1565c0; margin-top: 0.25rem;">
                                Condivisa con: ${expense.sharedBy.join(', ')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${expense.notes ? `
                        <div style="margin-top: 0.5rem; padding: 0.5rem; background: #f8f9fa; border-radius: 5px; font-size: 0.8rem; color: #6c757d;">
                            📝 ${expense.notes}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h3>📋 Dettaglio Spese - ${participant}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <!-- Riepilogo -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 1rem; border-radius: 10px; color: white;">
                            <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9; margin-bottom: 0.25rem;">
                                💳 Totale Pagato
                            </div>
                            <div style="font-size: 1.8rem; font-weight: bold;">
                                €${totalPaid.toFixed(2)}
                            </div>
                        </div>
                        <div style="background: linear-gradient(135deg, #2196f3 0%, #21cbf3 100%); padding: 1rem; border-radius: 10px; color: white;">
                            <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9; margin-bottom: 0.25rem;">
                                📊 Totale Quote
                            </div>
                            <div style="font-size: 1.8rem; font-weight: bold;">
                                €${totalOwed.toFixed(2)}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Lista spese -->
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 10px;">
                        <h4 style="margin: 0 0 1rem 0; color: #2c3e50; font-size: 1.1rem;">
                            📝 Elenco Spese (${participantExpenses.length})
                        </h4>
                        ${expensesHtml}
                    </div>
                    
                    <!-- Legenda -->
                    <div style="margin-top: 1.5rem; padding: 1rem; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                        <div style="font-size: 0.85rem; color: #856404;">
                            <strong>💡 Legenda:</strong><br>
                            <div style="margin-top: 0.5rem;">
                                🟢 Bordo verde = Hai pagato questa spesa<br>
                                🔵 Bordo blu = Condividi questa spesa con altri<br>
                                💳 HAI PAGATO = Importo totale che hai anticipato<br>
                                📊 TUA QUOTA = La tua parte di questa spesa condivisa
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        Chiudi
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Chiudi modal cliccando fuori
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
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
                    <button class="btn btn-primary" id="savePaymentBtn">
                        💾 Salva Pagamento
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Aggiungi event listener per il pulsante salva
        document.getElementById('savePaymentBtn').addEventListener('click', async (e) => {
            const btn = e.target;
            const originalText = btn.innerHTML;
            
            try {
                // Disabilita il pulsante durante il salvataggio
                btn.disabled = true;
                btn.innerHTML = '⏳ Salvataggio...';
                
                await this.savePayment(participant, isReceiving);
                
                // Chiudi il modal dopo il salvataggio
                modal.remove();
            } catch (error) {
                console.error('Errore salvataggio pagamento:', error);
                alert('Errore durante il salvataggio del pagamento: ' + error.message);
                
                // Riabilita il pulsante in caso di errore
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        });
        
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
            throw new Error('Pagatore non selezionato');
        }
        
        if (!to) {
            alert('Seleziona chi riceve il pagamento.');
            throw new Error('Destinatario non selezionato');
        }
        
        if (from === to) {
            alert('Il pagatore e il destinatario devono essere diversi.');
            throw new Error('Pagatore e destinatario uguali');
        }
        
        if (!amount || amount <= 0) {
            alert('Inserisci un importo valido.');
            throw new Error('Importo non valido');
        }
        
        if (!date) {
            alert('Inserisci una data.');
            throw new Error('Data non inserita');
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
        
        
        // Aggiorna l'oggetto completo
        this.currentActual.payments = this.payments;
        this.currentActual.updatedAt = new Date().toISOString();
        
        // Salva l'intero consuntivo
        await StorageManager.updateActual(this.currentActual.id, this.currentActual);
        
        
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
        
        // Aggiorna l'oggetto completo
        this.currentActual.updatedAt = new Date().toISOString();
        
        // Salva l'intero consuntivo
        await StorageManager.updateActual(this.currentActual.id, this.currentActual);
        
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
            
            // Aggiorna l'oggetto completo del consuntivo
            this.currentActual.payments = this.payments;
            this.currentActual.updatedAt = new Date().toISOString();
            
            
            // Salva l'intero consuntivo su Supabase
            await StorageManager.updateActual(this.currentActual.id, this.currentActual);
            
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
        if (!confirm('Eliminare questo pagamento?')) {
            return;
        }
        
        try {
            
            // Rimuovi il pagamento dall'array
            this.payments = this.payments.filter(p => p.id !== paymentId);
            this.currentActual.payments = this.payments;
            
            
            // Aggiorna l'oggetto completo
            this.currentActual.payments = this.payments;
            this.currentActual.updatedAt = new Date().toISOString();
            
            // Salva l'intero consuntivo
            await StorageManager.updateActual(this.currentActual.id, this.currentActual);
            
            
            // Invalida la cache per forzare ricaricamento da Supabase
            await StorageManager.invalidateCache();
            
            
            // Ricarica il consuntivo da Supabase
            this.currentActual = await StorageManager.getActual(this.currentActual.id);
            this.payments = this.currentActual.payments || [];
            
            
            // Aggiorna la vista
            this.calculateBalances(this.currentActual);
            this.displayPaymentsHistory();
            
            
            this.showNotification('🗑️ Pagamento eliminato e sincronizzato su Supabase.', 'success');
        } catch (error) {
            console.error('❌ Errore eliminazione pagamento:', error);
            alert('Errore durante l\'eliminazione del pagamento: ' + error.message);
            this.showNotification('❌ Errore eliminazione pagamento', 'error');
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
                                <button class="btn btn-primary payment-confirm-btn" style="font-size: 0.85rem; padding: 0.25rem 0.75rem;"
                                        data-payment-id="${payment.id}">
                                    ✓ Conferma
                                </button>
                            ` : ''}
                            <button class="btn btn-danger payment-delete-btn" style="font-size: 0.85rem; padding: 0.25rem 0.75rem;"
                                    data-payment-id="${payment.id}">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Aggiungi event listeners ai bottoni dopo aver creato l'HTML
        container.querySelectorAll('.payment-confirm-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const paymentId = e.target.dataset.paymentId;
                const originalText = e.target.innerHTML;
                try {
                    e.target.disabled = true;
                    e.target.innerHTML = '⏳';
                    await this.confirmPayment(paymentId);
                } catch (error) {
                    console.error('❌ Errore conferma:', error);
                    alert('Errore: ' + error.message);
                    e.target.disabled = false;
                    e.target.innerHTML = originalText;
                }
            });
        });
        
        container.querySelectorAll('.payment-delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const paymentId = e.target.dataset.paymentId;
                const originalText = e.target.innerHTML;
                try {
                    e.target.disabled = true;
                    e.target.innerHTML = '⏳';
                    await this.deletePayment(paymentId);
                } catch (error) {
                    console.error('❌ Errore eliminazione:', error);
                    alert('Errore: ' + error.message);
                    e.target.disabled = false;
                    e.target.innerHTML = originalText;
                }
            });
        });
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
