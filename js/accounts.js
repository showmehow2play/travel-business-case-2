// ===== Accounts (Conti) Management =====
// Gestisce l'analisi delle spese e i conti dei partecipanti

const AccountsManager = {
    currentActual: null,
    participantChart: null,

    // Inizializza la vista conti
    init(actual) {
        this.currentActual = actual;
        this.loadGeneralStats();
        this.loadParticipantSelector();
        this.setupEventListeners();
        
        // Nascondi il riepilogo partecipante all'inizio
        const summaryEl = document.getElementById('participantSummary');
        if (summaryEl) summaryEl.style.display = 'none';
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

    // Carica selettore partecipanti con schede
    loadParticipantSelector() {
        const container = document.getElementById('accountsParticipantSelect');
        if (!container || !this.currentActual) return;

        const participants = this.currentActual.participants || [];

        // Crea griglia di schede partecipanti
        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin: 1.5rem 0;">';
        
        participants.forEach(participantName => {
            const photo = this.getParticipantPhoto(participantName);
            const photoHtml = photo
                ? `<img src="${photo}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 0.75rem;" />`
                : `<div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 2rem; color: white; margin-bottom: 0.75rem;">${participantName.charAt(0)}</div>`;
            
            html += `
                <div class="participant-card" onclick="AccountsManager.loadParticipantSummary('${participantName}')"
                     style="background: white; border: 2px solid #e0e0e0; border-radius: 12px; padding: 1.5rem; text-align: center; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
                     onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'; this.style.borderColor='#667eea';"
                     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)'; this.style.borderColor='#e0e0e0';">
                    ${photoHtml}
                    <div style="font-weight: 600; font-size: 1.1rem; color: #2c3e50;">${participantName}</div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    },

    // Torna alla selezione dei partecipanti
    backToParticipantSelection() {
        // Nascondi il riepilogo partecipante
        const summaryEl = document.getElementById('participantSummary');
        if (summaryEl) summaryEl.style.display = 'none';
        
        // Mostra le schede di selezione
        const selectorContainer = document.getElementById('accountsParticipantSelect');
        if (selectorContainer) selectorContainer.style.display = 'block';
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

        // Salva il nome del partecipante corrente
        this.currentParticipant = participantName;

        const {
            paidAmount,
            sharedAmount,
            paymentsReceived,
            paymentsMade,
            balance,
            receivedTransfers,
            sentTransfers
        } = this.calculateParticipantFinancials(participantName);

        // Nascondi le schede di selezione
        const selectorContainer = document.getElementById('accountsParticipantSelect');
        if (selectorContainer) selectorContainer.style.display = 'none';

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

        // Aggiorna UI con foto e pulsante indietro
        document.getElementById('participantSummaryTitle').innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                <button onclick="AccountsManager.backToParticipantSelection()" class="btn btn-secondary" style="padding: 0.5rem 1rem;">
                    ← Torna alla Selezione
                </button>
            </div>
            <div>${photoHtml}<span style="vertical-align: middle;">Riepilogo Spese - ${participantName}</span>${paymentsInfo}</div>
        `;
        document.getElementById('participantPaidAmount').textContent = this.formatCurrency(paidAmount);
        document.getElementById('participantSharedAmount').textContent = this.formatCurrency(sharedAmount);
        
        const balanceElement = document.getElementById('participantBalance');
        const balanceLabel = document.getElementById('balanceLabel');
        balanceElement.textContent = this.formatCurrency(Math.abs(balance));
        
        // Colora il bilancio
        if (balance > 0) {
            balanceElement.style.color = '#10b981'; // Verde - deve ricevere
            balanceLabel.textContent = '⚖️ Da Ricevere';
        } else if (balance < 0) {
            balanceElement.style.color = '#ef4444'; // Rosso - deve dare
            balanceLabel.textContent = '⚖️ Da Dare';
        } else {
            balanceElement.style.color = 'var(--text-primary)';
            balanceLabel.textContent = '⚖️ In Pari';
        }

        // Carica sezione trasferimenti
        this.loadParticipantTransfers(participantName, receivedTransfers, sentTransfers);

        // Carica tabella spese (mostra tutte)
        this.loadParticipantExpensesTable(participantName);

        // Carica grafico categorie
        this.loadParticipantCategoryChart(participantName);

        // Ripristina la visibilità delle sezioni (nel caso si torni dalla vista trasferimenti)
        const expensesSection = document.querySelector('#participantSummary h4');
        const expensesTable = expensesSection?.nextElementSibling;
        const chartSection = document.getElementById('participantCategoryChart')?.parentElement?.parentElement;
        
        if (expensesSection) expensesSection.style.display = '';
        if (expensesTable) expensesTable.style.display = '';
        if (chartSection) chartSection.style.display = '';

        // Mostra sezione
        document.getElementById('participantSummary').style.display = 'block';
        
        // Reset filtro
        this.currentFilter = null;
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

    // Filtra spese per quelle pagate dal partecipante
    filterExpensesByPaidBy() {
        if (!this.currentParticipant) return;
        
        this.currentFilter = 'paidBy';
        const tbody = document.getElementById('participantExpensesTable');
        if (!tbody || !this.currentActual) return;

        const expenses = this.currentActual.expenses.filter(exp =>
            exp.paidBy === this.currentParticipant
        );

        // Aggiorna titolo della tabella
        const tableTitle = document.querySelector('#participantSummary h4');
        if (tableTitle) {
            tableTitle.innerHTML = `
                Dettaglio Spese - Spese Effettuate
                <button onclick="AccountsManager.loadParticipantExpensesTable('${this.currentParticipant}')"
                        class="btn btn-secondary"
                        style="margin-left: 1rem; padding: 0.25rem 0.75rem; font-size: 0.85rem;">
                    🔄 Mostra Tutte
                </button>
            `;
        }

        if (expenses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: var(--spacing-md);">Nessuna spesa effettuata trovata</td></tr>';
            return;
        }

        tbody.innerHTML = expenses.map(exp => {
            const amount = exp.amountEUR !== undefined ? parseFloat(exp.amountEUR) : parseFloat(exp.amount);
            const shareCount = exp.sharedBy ? exp.sharedBy.length : 0;
            const quota = shareCount > 0 && exp.sharedBy.includes(this.currentParticipant) ? amount / shareCount : 0;
            
            const categoryIcon = this.getCategoryIcon(exp.category);
            const currencyInfo = exp.currency && exp.currency !== 'EUR'
                ? ` <span style="font-size: 0.85em; color: #6b7280;">(${exp.amount} ${exp.currency})</span>`
                : '';
            
            return `
                <tr style="border-bottom: 1px solid var(--border-color); background: rgba(139, 92, 246, 0.05);">
                    <td style="padding: var(--spacing-sm);">${exp.date || '-'}</td>
                    <td style="padding: var(--spacing-sm);">${categoryIcon} ${this.getCategoryLabel(exp.category)}</td>
                    <td style="padding: var(--spacing-sm);">${exp.description || '-'}</td>
                    <td style="padding: var(--spacing-sm); text-align: right; font-weight: 600;">${this.formatCurrency(amount)}${currencyInfo}</td>
                    <td style="padding: var(--spacing-sm); font-weight: 600; color: var(--primary-color);">${exp.paidBy || '-'}</td>
                    <td style="padding: var(--spacing-sm); text-align: right; ${exp.sharedBy && exp.sharedBy.includes(this.currentParticipant) ? 'color: var(--primary-color); font-weight: 600;' : ''}">${quota > 0 ? this.formatCurrency(quota) : '-'}</td>
                </tr>
            `;
        }).join('');

        // Scroll alla tabella
        document.querySelector('#participantSummary h4').scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    // Filtra spese per quelle in cui il partecipante è coinvolto
    filterExpensesByShared() {
        if (!this.currentParticipant) return;
        
        this.currentFilter = 'shared';
        const tbody = document.getElementById('participantExpensesTable');
        if (!tbody || !this.currentActual) return;

        const expenses = this.currentActual.expenses.filter(exp =>
            exp.sharedBy && exp.sharedBy.includes(this.currentParticipant)
        );

        // Aggiorna titolo della tabella
        const tableTitle = document.querySelector('#participantSummary h4');
        if (tableTitle) {
            tableTitle.innerHTML = `
                Dettaglio Spese - Costo Personale del Viaggio
                <button onclick="AccountsManager.loadParticipantExpensesTable('${this.currentParticipant}')"
                        class="btn btn-secondary"
                        style="margin-left: 1rem; padding: 0.25rem 0.75rem; font-size: 0.85rem;">
                    🔄 Mostra Tutte
                </button>
            `;
        }

        if (expenses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: var(--spacing-md);">Nessuna spesa condivisa trovata</td></tr>';
            return;
        }

        tbody.innerHTML = expenses.map(exp => {
            const amount = exp.amountEUR !== undefined ? parseFloat(exp.amountEUR) : parseFloat(exp.amount);
            const shareCount = exp.sharedBy ? exp.sharedBy.length : 0;
            const quota = shareCount > 0 && exp.sharedBy.includes(this.currentParticipant) ? amount / shareCount : 0;
            
            const categoryIcon = this.getCategoryIcon(exp.category);
            const currencyInfo = exp.currency && exp.currency !== 'EUR'
                ? ` <span style="font-size: 0.85em; color: #6b7280;">(${exp.amount} ${exp.currency})</span>`
                : '';
            
            return `
                <tr style="border-bottom: 1px solid var(--border-color); background: rgba(16, 185, 129, 0.05);">
                    <td style="padding: var(--spacing-sm);">${exp.date || '-'}</td>
                    <td style="padding: var(--spacing-sm);">${categoryIcon} ${this.getCategoryLabel(exp.category)}</td>
                    <td style="padding: var(--spacing-sm);">${exp.description || '-'}</td>
                    <td style="padding: var(--spacing-sm); text-align: right; font-weight: 600;">${this.formatCurrency(amount)}${currencyInfo}</td>
                    <td style="padding: var(--spacing-sm);">${exp.paidBy || '-'}</td>
                    <td style="padding: var(--spacing-sm); text-align: right; color: #10b981; font-weight: 700;">${quota > 0 ? this.formatCurrency(quota) : '-'}</td>
                </tr>
            `;
        }).join('');

        // Scroll alla tabella
        document.querySelector('#participantSummary h4').scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    // Mostra riepilogo trasferimenti
    showTransfersSummary() {
        if (!this.currentParticipant || !this.currentActual) return;

        this.currentFilter = 'transfers';
        
        // Ottieni i trasferimenti confermati
        const payments = this.currentActual.payments || [];
        const confirmedPayments = payments.filter(payment => payment.confirmed);
        
        const receivedTransfers = confirmedPayments
            .filter(payment => payment.to === this.currentParticipant)
            .sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));

        const sentTransfers = confirmedPayments
            .filter(payment => payment.from === this.currentParticipant)
            .sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));

        // Nascondi la tabella spese e il grafico
        const expensesSection = document.querySelector('#participantSummary h4');
        const expensesTable = expensesSection?.nextElementSibling;
        const chartSection = document.getElementById('participantCategoryChart')?.parentElement?.parentElement;
        
        if (expensesSection) expensesSection.style.display = 'none';
        if (expensesTable) expensesTable.style.display = 'none';
        if (chartSection) chartSection.style.display = 'none';

        // Crea una vista dedicata ai trasferimenti
        const transfersSection = document.getElementById('participantTransfersSection');
        if (!transfersSection) return;

        const totalReceived = receivedTransfers.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        const totalSent = sentTransfers.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        const netBalance = totalReceived - totalSent;

        const renderTransferCard = (transfer, type) => {
            const otherParticipant = type === 'received' ? transfer.from : transfer.to;
            const amount = parseFloat(transfer.amount) || 0;
            const date = transfer.date || '-';
            const notes = transfer.notes ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.35rem;">💬 ${transfer.notes}</div>` : '';
            const badgeStyle = type === 'received'
                ? 'background: rgba(16, 185, 129, 0.12); color: #059669;'
                : 'background: rgba(239, 68, 68, 0.12); color: #dc2626;';
            const badgeLabel = type === 'received' ? 'Ricevuto' : 'Effettuato';
            const arrow = type === 'received' ? '⬅️' : '➡️';

            return `
                <div class="stat-card" style="margin-bottom: var(--spacing-sm); border-left: 4px solid ${type === 'received' ? '#10b981' : '#ef4444'};">
                    <div class="stat-content">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
                            <div style="flex: 1;">
                                <div style="font-weight: 600; font-size: 1.1rem; margin-bottom: 0.25rem;">
                                    ${arrow} ${type === 'received' ? 'Da' : 'A'} ${otherParticipant}
                                </div>
                                <div style="font-size: 0.9rem; color: var(--text-secondary);">📅 ${date}</div>
                                ${notes}
                            </div>
                            <div style="text-align: right;">
                                <div style="padding: 0.3rem 0.7rem; border-radius: 999px; font-size: 0.8rem; font-weight: 600; ${badgeStyle} margin-bottom: 0.5rem;">
                                    ${badgeLabel}
                                </div>
                                <div style="font-size: 1.3rem; font-weight: 700; color: ${type === 'received' ? '#10b981' : '#ef4444'};">
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
            : '<div style="padding: 1.5rem; text-align: center; color: var(--text-secondary); background: #f9fafb; border-radius: 8px; border: 2px dashed #e5e7eb;">Nessun trasferimento ricevuto</div>';

        const sentHtml = sentTransfers.length > 0
            ? sentTransfers.map(transfer => renderTransferCard(transfer, 'sent')).join('')
            : '<div style="padding: 1.5rem; text-align: center; color: var(--text-secondary); background: #f9fafb; border-radius: 8px; border: 2px dashed #e5e7eb;">Nessun trasferimento effettuato</div>';

        // Aggiorna il titolo della sezione trasferimenti
        const transfersTitle = transfersSection.parentElement.querySelector('h4');
        if (transfersTitle) {
            transfersTitle.innerHTML = `
                Riepilogo Trasferimenti - ${this.currentParticipant}
                <button onclick="AccountsManager.loadParticipantSummary('${this.currentParticipant}')"
                        class="btn btn-secondary"
                        style="margin-left: 1rem; padding: 0.25rem 0.75rem; font-size: 0.85rem;">
                    ← Torna al Riepilogo
                </button>
            `;
        }

        transfersSection.innerHTML = `
            <!-- Statistiche Trasferimenti -->
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-md); margin-bottom: var(--spacing-lg);">
                <div class="stat-card" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white;">
                    <div class="stat-content">
                        <div class="stat-label" style="color: rgba(255,255,255,0.9);">✅ Totale Ricevuto</div>
                        <div class="stat-value" style="color: white;">${this.formatCurrency(totalReceived)}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.8);">${receivedTransfers.length} trasferiment${receivedTransfers.length !== 1 ? 'i' : 'o'}</div>
                    </div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white;">
                    <div class="stat-content">
                        <div class="stat-label" style="color: rgba(255,255,255,0.9);">💸 Totale Effettuato</div>
                        <div class="stat-value" style="color: white;">${this.formatCurrency(totalSent)}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.8);">${sentTransfers.length} trasferiment${sentTransfers.length !== 1 ? 'i' : 'o'}</div>
                    </div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white;">
                    <div class="stat-content">
                        <div class="stat-label" style="color: rgba(255,255,255,0.9);">⚖️ Bilancio Netto</div>
                        <div class="stat-value" style="color: white;">${this.formatCurrency(Math.abs(netBalance))}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.8);">
                            ${netBalance > 0 ? '📈 In credito' : netBalance < 0 ? '📉 In debito' : '✅ In pari'}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Lista Trasferimenti -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: var(--spacing-lg);">
                <div>
                    <h5 style="margin-top: 0; margin-bottom: var(--spacing-md); color: #059669; font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.5rem;">✅</span> Trasferimenti Ricevuti
                    </h5>
                    ${receivedHtml}
                </div>
                <div>
                    <h5 style="margin-top: 0; margin-bottom: var(--spacing-md); color: #dc2626; font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.5rem;">💸</span> Trasferimenti Effettuati
                    </h5>
                    ${sentHtml}
                </div>
            </div>
        `;

        // Scroll alla sezione trasferimenti
        transfersSection.parentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    // Carica tabella spese partecipante
    loadParticipantExpensesTable(participantName) {
        const tbody = document.getElementById('participantExpensesTable');
        if (!tbody || !this.currentActual) return;

        // Reset filtro
        this.currentFilter = null;

        // Ripristina titolo originale
        const tableTitle = document.querySelector('#participantSummary h4');
        if (tableTitle) {
            tableTitle.textContent = 'Dettaglio Spese';
        }

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