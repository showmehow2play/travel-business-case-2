// ===== Accounts (Conti) Management =====
// Gestisce l'analisi delle spese e i conti dei partecipanti

const AccountsManager = {
    currentActual: null,
    participantChart: null,

    // Inizializza la vista conti
    init(actual) {
        this.currentActual = actual;
        this.loadGeneralStats();
        this.showParticipantSelection(); // Mostra selezione con schede
        this.setupEventListeners();
    },

    // Setup event listeners
    setupEventListeners() {
        const backBtn = document.getElementById('backFromAccountsBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.closeAccountsView();
            });
        }

        const viewSettlementsBtn = document.getElementById('viewSettlementsFromAccountsBtn');
        if (viewSettlementsBtn) {
            viewSettlementsBtn.addEventListener('click', () => {
                if (this.currentActual) {
                    SettlementsManager.loadActualDirect(this.currentActual);
                    App.showView('settlementsView');
                }
            });
        }
    },
    
    // Mostra la selezione dei partecipanti con schede compatte (SOLO nome e foto)
    showParticipantSelection() {
        const container = document.getElementById('participantSummary');
        if (!container) return;
        
        container.style.display = 'block';
        container.innerHTML = `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h2 style="color: #2c3e50; margin-bottom: 0.5rem;">👥 Seleziona un Partecipante</h2>
                <p style="color: #6c757d; font-size: 1rem;">Clicca su un partecipante per vedere il dettaglio delle sue spese</p>
            </div>
            <div id="participantCardsAccounts" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
            </div>
            <div style="text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 12px; border: 2px dashed #dee2e6;">
                <button class="btn btn-primary" style="font-size: 1.1rem; padding: 0.875rem 2rem;"
                        onclick="AccountsManager.showAllParticipantsView()">
                    📊 Mostra Grafico Generale
                </button>
                <p style="color: #6c757d; font-size: 0.9rem; margin-top: 1rem; margin-bottom: 0;">
                    Visualizza il grafico con tutti i partecipanti
                </p>
            </div>
        `;
        
        const cardsContainer = document.getElementById('participantCardsAccounts');
        
        // Crea una card per ogni partecipante - SOLO nome e foto
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
                    Vedi dettaglio →
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
    showParticipantDetails(participantName) {
        const container = document.getElementById('participantSummary');
        if (!container) return;
        
        container.style.display = 'block';
        
        const {
            paidAmount,
            sharedAmount,
            paymentsReceived,
            paymentsMade,
            balance,
            receivedTransfers,
            sentTransfers
        } = this.calculateParticipantFinancials(participantName);
        
        const statusColor = balance > 0 ? '#28a745' : balance < 0 ? '#dc3545' : '#6c757d';
        const statusIcon = balance > 0 ? '🟢 ⬆️' : balance < 0 ? '🔴 ⬇️' : '✅';
        const statusText = balance > 0 ? 'Deve ricevere' : balance < 0 ? 'Deve dare' : 'In pari';
        
        const photo = this.getParticipantPhoto(participantName);
        const photoHtml = photo
            ? `<img src="${photo}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 4px solid ${statusColor};" />`
            : `<div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}dd 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 2.5rem; font-weight: bold; border: 4px solid ${statusColor};">
                ${participantName.charAt(0).toUpperCase()}
               </div>`;
        
        container.innerHTML = `
            <!-- Pulsante Indietro -->
            <div style="margin-bottom: 2rem;">
                <button class="btn btn-secondary" onclick="AccountsManager.showParticipantSelection()" style="font-size: 0.95rem;">
                    ← Torna alla Selezione
                </button>
            </div>
            
            <!-- Header Partecipante -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 15px; margin-bottom: 2rem; color: white; text-align: center;">
                <div style="margin-bottom: 1rem;">
                    ${photoHtml}
                </div>
                <h2 style="margin: 0 0 0.5rem 0; font-size: 2rem; color: white;">${participantName}</h2>
                <div style="font-size: 1.1rem; opacity: 0.95;">
                    ${statusIcon} ${statusText}
                </div>
            </div>
            
            <!-- Grafici Interattivi -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                <!-- Grafico Quota Totale -->
                <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.2s;"
                     onclick="AccountsManager.showQuotaDetails('${participantName}')"
                     onmouseenter="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 4px 20px rgba(102, 126, 234, 0.3)'"
                     onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 10px rgba(0,0,0,0.1)'">
                    <div style="text-align: center; margin-bottom: 1rem;">
                        <div style="font-size: 0.85rem; color: #667eea; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                            💰 Quota Totale da Pagare
                        </div>
                    </div>
                    <canvas id="quotaChart" style="max-height: 150px;"></canvas>
                    <div style="text-align: center; margin-top: 1rem;">
                        <div style="font-size: 2rem; font-weight: bold; color: #667eea;">
                            ${this.formatCurrency(sharedAmount)}
                        </div>
                        <div style="font-size: 0.8rem; color: #6c757d; margin-top: 0.5rem;">
                            👆 Clicca per vedere il dettaglio
                        </div>
                    </div>
                </div>
                
                <!-- Grafico Ha Pagato -->
                <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.2s;"
                     onclick="AccountsManager.showPaidDetails('${participantName}')"
                     onmouseenter="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 4px 20px rgba(40, 167, 69, 0.3)'"
                     onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 10px rgba(0,0,0,0.1)'">
                    <div style="text-align: center; margin-bottom: 1rem;">
                        <div style="font-size: 0.85rem; color: #28a745; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                            💳 Ha Già Pagato
                        </div>
                    </div>
                    <canvas id="paidChart" style="max-height: 150px;"></canvas>
                    <div style="text-align: center; margin-top: 1rem;">
                        <div style="font-size: 2rem; font-weight: bold; color: #28a745;">
                            ${this.formatCurrency(paidAmount)}
                        </div>
                        <div style="font-size: 0.8rem; color: #6c757d; margin-top: 0.5rem;">
                            👆 Clicca per vedere le spese pagate
                        </div>
                    </div>
                </div>
                
                <!-- Grafico Pagamenti Versati -->
                ${paymentsMade > 0 ? `
                <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.2s;"
                     onclick="AccountsManager.showPaymentsMadeDetails('${participantName}')"
                     onmouseenter="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 4px 20px rgba(13, 71, 161, 0.3)'"
                     onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 10px rgba(0,0,0,0.1)'">
                    <div style="text-align: center; margin-bottom: 1rem;">
                        <div style="font-size: 0.85rem; color: #0d47a1; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                            📤 Pagamenti Versati
                        </div>
                    </div>
                    <canvas id="paymentsMadeChart" style="max-height: 150px;"></canvas>
                    <div style="text-align: center; margin-top: 1rem;">
                        <div style="font-size: 2rem; font-weight: bold; color: #0d47a1;">
                            ${this.formatCurrency(paymentsMade)}
                        </div>
                        <div style="font-size: 0.8rem; color: #6c757d; margin-top: 0.5rem;">
                            👆 Clicca per vedere i trasferimenti
                        </div>
                    </div>
                </div>
                ` : ''}
                
                <!-- Grafico Pagamenti Ricevuti -->
                ${paymentsReceived > 0 ? `
                <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.2s;"
                     onclick="AccountsManager.showPaymentsReceivedDetails('${participantName}')"
                     onmouseenter="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 4px 20px rgba(230, 81, 0, 0.3)'"
                     onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 10px rgba(0,0,0,0.1)'">
                    <div style="text-align: center; margin-bottom: 1rem;">
                        <div style="font-size: 0.85rem; color: #e65100; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                            📥 Pagamenti Ricevuti
                        </div>
                    </div>
                    <canvas id="paymentsReceivedChart" style="max-height: 150px;"></canvas>
                    <div style="text-align: center; margin-top: 1rem;">
    
    // Carica i grafici per il partecipante
    loadParticipantCharts(participantName, sharedAmount, paidAmount, paymentsMade, paymentsReceived) {
        // Grafico Quota Totale (Doughnut)
        const quotaCtx = document.getElementById('quotaChart');
        if (quotaCtx) {
            new Chart(quotaCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Quota da Pagare'],
                    datasets: [{
                        data: [sharedAmount],
                        backgroundColor: ['#667eea'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false }
                    },
                    cutout: '70%'
                }
            });
        }
        
        // Grafico Ha Pagato (Doughnut)
        const paidCtx = document.getElementById('paidChart');
        if (paidCtx) {
            new Chart(paidCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Già Pagato'],
                    datasets: [{
                        data: [paidAmount],
                        backgroundColor: ['#28a745'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false }
                    },
                    cutout: '70%'
                }
            });
        }
        
        // Grafico Pagamenti Versati (se presenti)
        if (paymentsMade > 0) {
            const paymentsMadeCtx = document.getElementById('paymentsMadeChart');
            if (paymentsMadeCtx) {
                new Chart(paymentsMadeCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Pagamenti Versati'],
                        datasets: [{
                            data: [paymentsMade],
                            backgroundColor: ['#0d47a1'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: { display: false },
                            tooltip: { enabled: false }
                        },
                        cutout: '70%'
                    }
                });
            }
        }
        
        // Grafico Pagamenti Ricevuti (se presenti)
        if (paymentsReceived > 0) {
            const paymentsReceivedCtx = document.getElementById('paymentsReceivedChart');
            if (paymentsReceivedCtx) {
                new Chart(paymentsReceivedCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Pagamenti Ricevuti'],
                        datasets: [{
                            data: [paymentsReceived],
                            backgroundColor: ['#e65100'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: { display: false },
                            tooltip: { enabled: false }
                        },
                        cutout: '70%'
                    }
                });
            }
        }
    },
    
    // Mostra dettaglio quota totale
    showQuotaDetails(participantName) {
        const expenses = this.currentActual.expenses || [];
        const participantExpenses = expenses.filter(exp => {
            let sharedBy = exp.sharedBy || [];
            if (sharedBy.length === 0) sharedBy = this.currentActual.participants;
            return sharedBy.includes(participantName);
        });
        
        let html = `
            <div class="modal" style="display: flex;">
                <div class="modal-content" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header">
                        <h3>💰 Dettaglio Quota Totale - ${participantName}</h3>
                        <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p style="color: #6c757d; margin-bottom: 1.5rem;">
                            Queste sono tutte le spese condivise in cui ${participantName} è coinvolto/a.
                        </p>
        `;
        
        let total = 0;
        participantExpenses.forEach(exp => {
            const amount = exp.amountEUR !== undefined ? exp.amountEUR : exp.amount;
            let sharedBy = exp.sharedBy || [];
            if (sharedBy.length === 0) sharedBy = this.currentActual.participants;
            const shareAmount = sharedBy.length > 0 ? amount / sharedBy.length : 0;
            total += shareAmount;
            
            const categoryIcon = ActualsManager.categories.find(c => c.value === exp.category)?.icon || '📝';
            
            html += `
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #667eea;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem;">
                                ${categoryIcon} ${exp.description}
                            </div>
                            <div style="font-size: 0.85rem; color: #6c757d;">
                                Totale spesa: ${this.formatCurrency(amount)} • Condivisa tra ${sharedBy.length} persone
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.3rem; font-weight: bold; color: #667eea;">
                                ${this.formatCurrency(shareAmount)}
                            </div>
                            <div style="font-size: 0.75rem; color: #6c757d;">
                                tua quota
                            </div>
                        </div>
                    </div>
                    <div style="font-size: 0.8rem; color: #6c757d; margin-top: 0.5rem;">
                        👥 Condivisa con: ${sharedBy.join(', ')}
                    </div>
                </div>
            `;
        });
        
        html += `
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1.5rem; border-radius: 10px; margin-top: 1.5rem; color: white; text-align: center;">
                            <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 0.5rem;">TOTALE QUOTA</div>
                            <div style="font-size: 2.5rem; font-weight: bold;">${this.formatCurrency(total)}</div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Chiudi</button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('detailsModalContainer').innerHTML = html;
    },
    
    // Mostra dettaglio spese pagate
    showPaidDetails(participantName) {
        const expenses = this.currentActual.expenses || [];
        const paidExpenses = expenses.filter(exp => exp.paidBy === participantName);
        
        let html = `
            <div class="modal" style="display: flex;">
                <div class="modal-content" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header">
                        <h3>💳 Spese Pagate - ${participantName}</h3>
                        <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p style="color: #6c757d; margin-bottom: 1.5rem;">
                            Queste sono tutte le spese che ${participantName} ha pagato.
                        </p>
        `;
        
        let total = 0;
        paidExpenses.forEach(exp => {
            const amount = exp.amountEUR !== undefined ? exp.amountEUR : exp.amount;
            total += amount;
            
            const categoryIcon = ActualsManager.categories.find(c => c.value === exp.category)?.icon || '📝';
            
            html += `
                <div style="background: #e8f5e9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #28a745;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem;">
                                ${categoryIcon} ${exp.description}
                            </div>
                            <div style="font-size: 0.85rem; color: #2e7d32;">
                                📅 ${exp.date ? new Date(exp.date).toLocaleDateString('it-IT') : 'Data non specificata'}
                            </div>
                            ${exp.notes ? `<div style="font-size: 0.85rem; color: #6c757d; margin-top: 0.5rem;">📝 ${exp.notes}</div>` : ''}
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.5rem; font-weight: bold; color: #28a745;">
                                ${this.formatCurrency(amount)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 1.5rem; border-radius: 10px; margin-top: 1.5rem; color: white; text-align: center;">
                            <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 0.5rem;">TOTALE PAGATO</div>
                            <div style="font-size: 2.5rem; font-weight: bold;">${this.formatCurrency(total)}</div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Chiudi</button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('detailsModalContainer').innerHTML = html;
    },
    
    // Mostra dettaglio pagamenti versati
    showPaymentsMadeDetails(participantName) {
        const payments = this.currentActual.payments || [];
        const madePayments = payments.filter(p => p.confirmed && p.from === participantName);
        
        let html = `
            <div class="modal" style="display: flex;">
                <div class="modal-content" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header">
                        <h3>📤 Pagamenti Versati - ${participantName}</h3>
                        <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p style="color: #6c757d; margin-bottom: 1.5rem;">
                            Questi sono i pagamenti che ${participantName} ha versato ad altri partecipanti.
                        </p>
        `;
        
        let total = 0;
        madePayments.forEach(payment => {
            const amount = parseFloat(payment.amount) || 0;
            total += amount;
            
            html += `
                <div style="background: #e3f2fd; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #0d47a1;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem; color: #0d47a1;">
                                💸 Pagamento a ${payment.to}
                            </div>
                            <div style="font-size: 0.85rem; color: #1565c0;">
                                📅 ${payment.date ? new Date(payment.date).toLocaleDateString('it-IT') : 'Data non specificata'}
                            </div>
                            ${payment.notes ? `<div style="font-size: 0.85rem; color: #6c757d; margin-top: 0.5rem;">📝 ${payment.notes}</div>` : ''}
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.5rem; font-weight: bold; color: #0d47a1;">
                                ${this.formatCurrency(amount)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                        <div style="background: linear-gradient(135deg, #0d47a1 0%, #1976d2 100%); padding: 1.5rem; border-radius: 10px; margin-top: 1.5rem; color: white; text-align: center;">
                            <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 0.5rem;">TOTALE VERSATO</div>
                            <div style="font-size: 2.5rem; font-weight: bold;">${this.formatCurrency(total)}</div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Chiudi</button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('detailsModalContainer').innerHTML = html;
    },
    
    // Mostra dettaglio pagamenti ricevuti
    showPaymentsReceivedDetails(participantName) {
        const payments = this.currentActual.payments || [];
        const receivedPayments = payments.filter(p => p.confirmed && p.to === participantName);
        
        let html = `
            <div class="modal" style="display: flex;">
                <div class="modal-content" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header">
                        <h3>📥 Pagamenti Ricevuti - ${participantName}</h3>
                        <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p style="color: #6c757d; margin-bottom: 1.5rem;">
                            Questi sono i pagamenti che ${participantName} ha ricevuto da altri partecipanti.
                        </p>
        `;
        
        let total = 0;
        receivedPayments.forEach(payment => {
            const amount = parseFloat(payment.amount) || 0;
            total += amount;
            
            html += `
                <div style="background: #fff3e0; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #e65100;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem; color: #e65100;">
                                💰 Pagamento da ${payment.from}
                            </div>
                            <div style="font-size: 0.85rem; color: #f57c00;">
                                📅 ${payment.date ? new Date(payment.date).toLocaleDateString('it-IT') : 'Data non specificata'}
                            </div>
                            ${payment.notes ? `<div style="font-size: 0.85rem; color: #6c757d; margin-top: 0.5rem;">📝 ${payment.notes}</div>` : ''}
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.5rem; font-weight: bold; color: #e65100;">
                                ${this.formatCurrency(amount)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                        <div style="background: linear-gradient(135deg, #e65100 0%, #ff6f00 100%); padding: 1.5rem; border-radius: 10px; margin-top: 1.5rem; color: white; text-align: center;">
                            <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 0.5rem;">TOTALE RICEVUTO</div>
                            <div style="font-size: 2.5rem; font-weight: bold;">${this.formatCurrency(total)}</div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Chiudi</button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('detailsModalContainer').innerHTML = html;
    },
                        <div style="font-size: 2rem; font-weight: bold; color: #e65100;">
                            ${this.formatCurrency(paymentsReceived)}
                        </div>
                        <div style="font-size: 0.8rem; color: #6c757d; margin-top: 0.5rem;">
                            👆 Clicca per vedere i trasferimenti
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
            
            <!-- Bilancio Finale Grande -->
            <div style="background: ${balance > 0 ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' : balance < 0 ? 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)' : 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'}; padding: 2rem; border-radius: 15px; margin-bottom: 2rem; border: 3px solid ${statusColor}; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <div style="text-align: center;">
                    <div style="font-size: 1rem; text-transform: uppercase; letter-spacing: 1.5px; color: ${statusColor}; font-weight: 700; margin-bottom: 1rem;">
                        ${balance > 0 ? '📈 Bilancio Positivo' : balance < 0 ? '📉 Bilancio Negativo' : '⚖️ Bilancio in Pari'}
                    </div>
                    <div style="font-size: 3.5rem; font-weight: bold; color: ${statusColor}; margin-bottom: 1rem;">
                        ${this.formatCurrency(Math.abs(balance))}
                    </div>
                    <div style="font-size: 1.2rem; color: ${statusColor}; font-weight: 600;">
                        ${balance > 0 ? '🟢 Deve ricevere questo importo' : balance < 0 ? '🔴 Deve dare questo importo' : '✅ È in pari!'}
                    </div>
                </div>
            </div>
            
            <!-- Modal Container per i dettagli -->
            <div id="detailsModalContainer"></div>
        `;
        
        // Carica i grafici
        this.loadParticipantCharts(participantName, sharedAmount, paidAmount, paymentsMade, paymentsReceived);
        
        // Carica i dettagli
        this.loadParticipantExpensesTable(participantName);
        this.loadParticipantCategoryChart(participantName);
        if (receivedTransfers.length > 0 || sentTransfers.length > 0) {
            this.loadParticipantTransfers(participantName, receivedTransfers, sentTransfers);
        }
    },
    
    // Mostra vista generale con grafico
    showAllParticipantsView() {
        const container = document.getElementById('participantSummary');
        if (!container) return;
        
        container.style.display = 'block';
        container.innerHTML = `
            <div style="margin-bottom: 2rem;">
                <button class="btn btn-secondary" onclick="AccountsManager.showParticipantSelection()" style="font-size: 0.95rem;">
                    ← Torna alla Selezione
                </button>
            </div>
            <h3 style="color: #2c3e50; margin-bottom: 1.5rem; font-size: 1.5rem;">📊 Grafico Generale Partecipanti</h3>
            <canvas id="participantChart" style="max-height: 400px;"></canvas>
        `;
        
        this.loadAllParticipantsChart();
    },

    // Carica statistiche generali
    loadGeneralStats() {
        if (!this.currentActual || !this.currentActual.expenses) {
            return;
        }

        const expenses = this.currentActual.expenses;
        const participants = this.currentActual.participants || [];

        // Calcola totale usando amountEUR (importi convertiti)
        const totalCost = expenses.reduce((sum, exp) => {
            const amount = exp.amountEUR !== undefined ? exp.amountEUR : exp.amount;
            return sum + (parseFloat(amount) || 0);
        }, 0);

        // Costo medio per persona
        const avgCost = participants.length > 0 ? totalCost / participants.length : 0;

        // Aggiorna UI
        document.getElementById('accountsTotalCost').textContent = this.formatCurrency(totalCost);
        document.getElementById('accountsParticipantsCount').textContent = participants.length;
        document.getElementById('accountsAvgCost').textContent = this.formatCurrency(avgCost);
        document.getElementById('accountsExpensesCount').textContent = expenses.length;
        document.getElementById('accountsTitle').textContent = `📊 Conti - ${this.currentActual.name || 'Analisi Spese'}`;
    },

    // Ottiene la foto di un partecipante dall'anagrafica
    getParticipantPhoto(participantName) {
        if (typeof participantsRegistry === 'undefined') return null;
        const participant = participantsRegistry.getByName(participantName);
        return participant?.photo || null;
    },

    // Carica selettore partecipanti
    loadParticipantSelector() {
        const select = document.getElementById('accountsParticipantSelect');
        if (!select || !this.currentActual) return;

        const participants = this.currentActual.participants || [];

        select.innerHTML = '<option value="">-- Seleziona un partecipante --</option>';
        participants.forEach(p => {
            const option = document.createElement('option');
            option.value = p;
            option.textContent = p;
            select.appendChild(option);
        });
    },

    calculateParticipantFinancials(participantName) {
        if (!this.currentActual) {
            return {
                paidAmount: 0,
                sharedAmount: 0,
                paymentsReceived: 0,
                paymentsMade: 0,
                balance: 0
            };
        }

        const expenses = this.currentActual.expenses || [];
        const payments = this.currentActual.payments || [];

        const paidAmount = expenses
            .filter(exp => exp.paidBy === participantName)
            .reduce((sum, exp) => {
                const amount = exp.amountEUR !== undefined ? exp.amountEUR : exp.amount;
                return sum + (parseFloat(amount) || 0);
            }, 0);

        let sharedAmount = 0;
        expenses.forEach(exp => {
            let sharedBy = exp.sharedBy || [];

            if (sharedBy.length === 0) {
                sharedBy = this.currentActual.participants || [];
            }

            if (sharedBy.includes(participantName)) {
                const shareCount = sharedBy.length;
                if (shareCount > 0) {
                    const amount = exp.amountEUR !== undefined ? exp.amountEUR : exp.amount;
                    sharedAmount += (parseFloat(amount) || 0) / shareCount;
                }
            }
        });

        const confirmedPayments = payments.filter(payment => payment.confirmed);
        const paymentsReceived = confirmedPayments
            .filter(payment => payment.to === participantName)
            .reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);

        const paymentsMade = confirmedPayments
            .filter(payment => payment.from === participantName)
            .reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);

        const balance = paidAmount - sharedAmount + paymentsMade - paymentsReceived;

        const receivedTransfers = confirmedPayments
            .filter(payment => payment.to === participantName)
            .sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));

        const sentTransfers = confirmedPayments
            .filter(payment => payment.from === participantName)
            .sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));

        return {
            paidAmount,
            sharedAmount,
            paymentsReceived,
            paymentsMade,
            balance,
            receivedTransfers,
            sentTransfers
        };
    },

    // Carica riepilogo per partecipante
    loadParticipantSummary(participantName) {
        if (!this.currentActual || !this.currentActual.expenses) return;

        const {
            paidAmount,
            sharedAmount,
            paymentsReceived,
            paymentsMade,
            balance,
            receivedTransfers,
            sentTransfers
        } = this.calculateParticipantFinancials(participantName);

        // Ottieni foto del partecipante
        const photo = this.getParticipantPhoto(participantName);
        const photoHtml = photo
            ? `<img src="${photo}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary-color); margin-right: 1rem; vertical-align: middle;" />`
            : '';

        const paymentsInfo = (paymentsReceived > 0 || paymentsMade > 0)
            ? `<div style="margin-top: 0.5rem; font-size: 0.95rem; color: var(--text-secondary);">
                    ${paymentsReceived > 0 ? `<div>✅ Pagamenti ricevuti: ${this.formatCurrency(paymentsReceived)}</div>` : ''}
                    ${paymentsMade > 0 ? `<div>💸 Pagamenti effettuati: ${this.formatCurrency(paymentsMade)}</div>` : ''}
               </div>`
            : '';

        // Aggiorna UI con foto
        document.getElementById('participantSummaryTitle').innerHTML = `${photoHtml}<span style="vertical-align: middle;">Riepilogo Spese - ${participantName}</span>${paymentsInfo}`;
        document.getElementById('participantPaidAmount').textContent = this.formatCurrency(paidAmount);
        document.getElementById('participantSharedAmount').textContent = this.formatCurrency(sharedAmount);
        
        const balanceElement = document.getElementById('participantBalance');
        balanceElement.textContent = this.formatCurrency(Math.abs(balance));
        
        // Colora il bilancio
        if (balance > 0) {
            balanceElement.style.color = '#10b981'; // Verde - deve ricevere
            balanceElement.parentElement.querySelector('.stat-label').textContent = '⚖️ Da Ricevere';
        } else if (balance < 0) {
            balanceElement.style.color = '#ef4444'; // Rosso - deve dare
            balanceElement.parentElement.querySelector('.stat-label').textContent = '⚖️ Da Dare';
        } else {
            balanceElement.style.color = 'var(--text-primary)';
            balanceElement.parentElement.querySelector('.stat-label').textContent = '⚖️ In Pari';
        }

        // Carica sezione trasferimenti
        this.loadParticipantTransfers(participantName, receivedTransfers, sentTransfers);

        // Carica tabella spese
        this.loadParticipantExpensesTable(participantName);

        // Carica grafico categorie
        this.loadParticipantCategoryChart(participantName);

        // Mostra sezione
        document.getElementById('participantSummary').style.display = 'block';
    },

    loadParticipantTransfers(participantName, receivedTransfers = [], sentTransfers = []) {
        const container = document.getElementById('participantTransfersSection');
        if (!container) return;

        const renderTransferCard = (transfer, type) => {
            const otherParticipant = type === 'received' ? transfer.from : transfer.to;
            const amount = parseFloat(transfer.amount) || 0;
            const date = transfer.date || '-';
            const notes = transfer.notes ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.35rem;">💬 ${transfer.notes}</div>` : '';
            const badgeStyle = type === 'received'
                ? 'background: rgba(16, 185, 129, 0.12); color: #059669;'
                : 'background: rgba(239, 68, 68, 0.12); color: #dc2626;';
            const badgeLabel = type === 'received' ? 'Ricevuto' : 'Effettuato';

            return `
                <div class="stat-card" style="margin-bottom: var(--spacing-sm);">
                    <div class="stat-content">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
                            <div>
                                <div style="font-weight: 600;">${type === 'received' ? 'Da' : 'A'} ${otherParticipant}</div>
                                <div style="font-size: 0.9rem; color: var(--text-secondary);">📅 ${date}</div>
                                ${notes}
                            </div>
                            <div style="text-align: right;">
                                <div style="padding: 0.2rem 0.5rem; border-radius: 999px; font-size: 0.8rem; font-weight: 600; ${badgeStyle}">
                                    ${badgeLabel}
                                </div>
                                <div style="margin-top: 0.4rem; font-size: 1rem; font-weight: 700;">
                                    ${this.formatCurrency(amount)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        };

        const receivedHtml = receivedTransfers.length > 0
            ? receivedTransfers.map(transfer => renderTransferCard(transfer, 'received')).join('')
            : '<div style="color: var(--text-secondary);">Nessun trasferimento ricevuto confermato</div>';

        const sentHtml = sentTransfers.length > 0
            ? sentTransfers.map(transfer => renderTransferCard(transfer, 'sent')).join('')
            : '<div style="color: var(--text-secondary);">Nessun trasferimento effettuato confermato</div>';

        container.innerHTML = `
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--spacing-md);">
                <div>
                    <h5 style="margin-top: 0; margin-bottom: var(--spacing-sm); color: #059669;">✅ Ricevuti</h5>
                    ${receivedHtml}
                </div>
                <div>
                    <h5 style="margin-top: 0; margin-bottom: var(--spacing-sm); color: #dc2626;">💸 Effettuati</h5>
                    ${sentHtml}
                </div>
            </div>
        `;
    },

    // Carica tabella spese partecipante
    loadParticipantExpensesTable(participantName) {
        const tbody = document.getElementById('participantExpensesTable');
        if (!tbody || !this.currentActual) return;

        const expenses = this.currentActual.expenses.filter(exp => 
            exp.paidBy === participantName || (exp.sharedBy && exp.sharedBy.includes(participantName))
        );

        if (expenses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: var(--spacing-md);">Nessuna spesa trovata</td></tr>';
            return;
        }

        tbody.innerHTML = expenses.map(exp => {
            // Usa amountEUR se disponibile, altrimenti amount
            const amount = exp.amountEUR !== undefined ? parseFloat(exp.amountEUR) : parseFloat(exp.amount);
            const shareCount = exp.sharedBy ? exp.sharedBy.length : 0;
            const quota = shareCount > 0 && exp.sharedBy.includes(participantName) ? amount / shareCount : 0;
            
            const categoryIcon = this.getCategoryIcon(exp.category);
            
            // Mostra valuta originale se diversa da EUR
            const currencyInfo = exp.currency && exp.currency !== 'EUR'
                ? ` <span style="font-size: 0.85em; color: #6b7280;">(${exp.amount} ${exp.currency})</span>`
                : '';
            
            return `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: var(--spacing-sm);">${exp.date || '-'}</td>
                    <td style="padding: var(--spacing-sm);">${categoryIcon} ${this.getCategoryLabel(exp.category)}</td>
                    <td style="padding: var(--spacing-sm);">${exp.description || '-'}</td>
                    <td style="padding: var(--spacing-sm); text-align: right; font-weight: 600;">${this.formatCurrency(amount)}${currencyInfo}</td>
                    <td style="padding: var(--spacing-sm);">${exp.paidBy || '-'}</td>
                    <td style="padding: var(--spacing-sm); text-align: right; ${exp.sharedBy && exp.sharedBy.includes(participantName) ? 'color: var(--primary-color); font-weight: 600;' : ''}">${quota > 0 ? this.formatCurrency(quota) : '-'}</td>
                </tr>
            `;
        }).join('');
    },

    // Carica grafico di tutti i partecipanti (vista iniziale)
    loadAllParticipantsChart() {
        const canvas = document.getElementById('participantCategoryChart');
        if (!canvas || !this.currentActual) return;

        // Distruggi grafico precedente se esiste
        if (this.participantChart) {
            this.participantChart.destroy();
        }

        const expenses = this.currentActual.expenses || [];

        // Raggruppa per categoria (tutte le spese) - usa amountEUR
        const categoryTotals = {};
        expenses.forEach(exp => {
            const category = exp.category || 'altro';
            const amount = exp.amountEUR !== undefined ? parseFloat(exp.amountEUR) : parseFloat(exp.amount);
            
            if (!categoryTotals[category]) {
                categoryTotals[category] = 0;
            }
            categoryTotals[category] += amount || 0;
        });

        // Prepara dati per il grafico
        const categories = Object.keys(categoryTotals);
        const labels = categories.map(cat => this.getCategoryLabel(cat));
        const data = Object.values(categoryTotals);
        const colors = categories.map(cat => this.getCategoryColor(cat));

        // Crea grafico con etichette dettagliate
        const ctx = canvas.getContext('2d');
        this.participantChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            generateLabels: (chart) => {
                                const data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.map((label, i) => {
                                        const value = data.datasets[0].data[i];
                                        const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                        const percentage = ((value / total) * 100).toFixed(1);
                                        return {
                                            text: `${label}: ${this.formatCurrency(value)} (${percentage}%)`,
                                            fillStyle: data.datasets[0].backgroundColor[i],
                                            hidden: false,
                                            index: i
                                        };
                                    });
                                }
                                return [];
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = this.formatCurrency(context.parsed);
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Spese per Categoria - Tutti i Partecipanti',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    }
                }
            }
        });
    },

    // Carica grafico categorie per partecipante
    loadParticipantCategoryChart(participantName) {
        const canvas = document.getElementById('participantCategoryChart');
        if (!canvas || !this.currentActual) return;

        // Distruggi grafico precedente se esiste
        if (this.participantChart) {
            this.participantChart.destroy();
        }

        // Filtra spese del partecipante
        const expenses = this.currentActual.expenses.filter(exp =>
            exp.sharedBy && exp.sharedBy.includes(participantName)
        );

        // Raggruppa per categoria - usa amountEUR
        const categoryTotals = {};
        expenses.forEach(exp => {
            const category = exp.category || 'altro';
            const shareCount = exp.sharedBy.length;
            const amount = exp.amountEUR !== undefined ? parseFloat(exp.amountEUR) : parseFloat(exp.amount);
            const quota = shareCount > 0 ? (amount || 0) / shareCount : 0;
            
            if (!categoryTotals[category]) {
                categoryTotals[category] = 0;
            }
            categoryTotals[category] += quota;
        });

        // Prepara dati per il grafico
        const categories = Object.keys(categoryTotals);
        const labels = categories.map(cat => this.getCategoryLabel(cat));
        const data = Object.values(categoryTotals);
        const colors = categories.map(cat => this.getCategoryColor(cat));

        // Crea grafico con etichette dettagliate
        const ctx = canvas.getContext('2d');
        this.participantChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            generateLabels: (chart) => {
                                const data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.map((label, i) => {
                                        const value = data.datasets[0].data[i];
                                        const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                        const percentage = ((value / total) * 100).toFixed(1);
                                        return {
                                            text: `${label}: ${this.formatCurrency(value)} (${percentage}%)`,
                                            fillStyle: data.datasets[0].backgroundColor[i],
                                            hidden: false,
                                            index: i
                                        };
                                    });
                                }
                                return [];
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = this.formatCurrency(context.parsed);
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: `Spese per Categoria - ${participantName}`,
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    }
                }
            }
        });
    },

    // Chiudi vista conti
    closeAccountsView() {
        // Distruggi grafico se esiste
        if (this.participantChart) {
            this.participantChart.destroy();
            this.participantChart = null;
        }

        // Torna alla vista dettaglio
        document.getElementById('accountsView').classList.remove('active');
        document.getElementById('actualDetailView').classList.add('active');
    },

    // Helper: Formatta valuta
    formatCurrency(amount) {
        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    },

    // Helper: Ottieni icona categoria
    getCategoryIcon(category) {
        const icons = {
            'generali': '📦',
            'viaggio': '✈️',
            'hotel': '🏨',
            'casa': '🏠',
            'ristorante': '🍽️',
            'auto': '🚗',
            'attivita': '🎭',
            'spesa': '🛒',
            'benzina': '⛽',
            'extra': '✨',
            'altro': '📌'
        };
        return icons[category] || '📌';
    },

    // Helper: Ottieni label categoria
    getCategoryLabel(category) {
        const labels = {
            'generali': 'Generali',
            'viaggio': 'Viaggio',
            'hotel': 'Hotel',
            'casa': 'Casa',
            'ristorante': 'Ristorante',
            'auto': 'Auto',
            'attivita': 'Attività',
            'spesa': 'Spesa',
            'benzina': 'Benzina',
            'extra': 'Extra',
            'altro': 'Altro'
        };
        return labels[category] || 'Altro';
    },

    // Helper: Ottieni colore categoria
    getCategoryColor(category) {
        const colors = {
            'generali': '#3b82f6',
            'viaggio': '#8b5cf6',
            'hotel': '#6366f1',
            'casa': '#10b981',
            'ristorante': '#14b8a6',
            'auto': '#06b6d4',
            'attivita': '#f97316',
            'spesa': '#10b981',
            'benzina': '#f59e0b',
            'extra': '#ec4899',
            'altro': '#64748b'
        };
        return colors[category] || '#64748b';
    }
};

// Made with Bob