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
        this.loadAllParticipantsChart(); // Mostra grafico generale all'inizio
        this.setupEventListeners();
        
        // Nascondi il riepilogo partecipante all'inizio
        document.getElementById('participantSummary').style.display = 'none';
    },

    // Setup event listeners
    setupEventListeners() {
        const participantSelect = document.getElementById('accountsParticipantSelect');
        if (participantSelect) {
            participantSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.loadParticipantSummary(e.target.value);
                } else {
                    // Torna al grafico generale
                    document.getElementById('participantSummary').style.display = 'none';
                    this.loadAllParticipantsChart();
                }
            });
        }

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

        // Calcola totale
        const totalCost = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

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

    // Carica riepilogo per partecipante
    loadParticipantSummary(participantName) {
        if (!this.currentActual || !this.currentActual.expenses) return;

        const expenses = this.currentActual.expenses;

        // Calcola spese pagate dal partecipante
        const paidExpenses = expenses.filter(exp => exp.paidBy === participantName);
        const paidAmount = paidExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

        // Calcola quota spese condivise
        let sharedAmount = 0;
        expenses.forEach(exp => {
            if (exp.sharedBy && exp.sharedBy.includes(participantName)) {
                const shareCount = exp.sharedBy.length;
                if (shareCount > 0) {
                    sharedAmount += (parseFloat(exp.amount) || 0) / shareCount;
                }
            }
        });

        // Calcola bilancio (quanto ha pagato - quanto deve)
        const balance = paidAmount - sharedAmount;

        // Ottieni foto del partecipante
        const photo = this.getParticipantPhoto(participantName);
        const photoHtml = photo
            ? `<img src="${photo}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary-color); margin-right: 1rem; vertical-align: middle;" />`
            : '';

        // Aggiorna UI con foto
        document.getElementById('participantSummaryTitle').innerHTML = `${photoHtml}<span style="vertical-align: middle;">Riepilogo Spese - ${participantName}</span>`;
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

        // Carica tabella spese
        this.loadParticipantExpensesTable(participantName);

        // Carica grafico categorie
        this.loadParticipantCategoryChart(participantName);

        // Mostra sezione
        document.getElementById('participantSummary').style.display = 'block';
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
            const amount = parseFloat(exp.amount) || 0;
            const shareCount = exp.sharedBy ? exp.sharedBy.length : 0;
            const quota = shareCount > 0 && exp.sharedBy.includes(participantName) ? amount / shareCount : 0;
            
            const categoryIcon = this.getCategoryIcon(exp.category);
            
            return `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: var(--spacing-sm);">${exp.date || '-'}</td>
                    <td style="padding: var(--spacing-sm);">${categoryIcon} ${this.getCategoryLabel(exp.category)}</td>
                    <td style="padding: var(--spacing-sm);">${exp.description || '-'}</td>
                    <td style="padding: var(--spacing-sm); text-align: right; font-weight: 600;">${this.formatCurrency(amount)}</td>
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

        // Raggruppa per categoria (tutte le spese)
        const categoryTotals = {};
        expenses.forEach(exp => {
            const category = exp.category || 'altro';
            const amount = parseFloat(exp.amount) || 0;
            
            if (!categoryTotals[category]) {
                categoryTotals[category] = 0;
            }
            categoryTotals[category] += amount;
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

        // Raggruppa per categoria
        const categoryTotals = {};
        expenses.forEach(exp => {
            const category = exp.category || 'altro';
            const shareCount = exp.sharedBy.length;
            const quota = shareCount > 0 ? (parseFloat(exp.amount) || 0) / shareCount : 0;
            
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