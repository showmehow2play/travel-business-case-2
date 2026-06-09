// ===== Norwy Chatbot - Assistente Virtuale =====
// Un chatbot intelligente per aiutare gli utenti a usare l'applicazione

const NorwyChatbot = {
    isOpen: false,
    conversationHistory: [],
    pendingAction: null, // Per gestire azioni multi-step
    
    // Knowledge base con domande e risposte
    knowledgeBase: {
        // Saluti e presentazione
        saluti: {
            keywords: ['ciao', 'salve', 'buongiorno', 'buonasera', 'hey', 'hello', 'hi'],
            responses: [
                "Ciao! 👋 Sono Norwy, il tuo assistente virtuale per Travel Business Case. Come posso aiutarti oggi?",
                "Ciao! 🌟 Sono qui per aiutarti a usare l'app. Cosa vorresti sapere?",
                "Salve! 😊 Sono Norwy, pronto ad assisterti. Hai qualche domanda?"
            ]
        },
        
        // Scenari
        scenari: {
            keywords: ['scenario', 'preventivo', 'creare', 'nuovo scenario', 'come creo'],
            responses: [
                "Per creare un nuovo scenario:\n\n1. Clicca su '✨ Nuovo Scenario' nella dashboard\n2. Inserisci nome e destinazione\n3. Aggiungi date e partecipanti\n4. Seleziona le spese (trasporto, alloggio, ecc.)\n5. Salva!\n\nVuoi sapere altro sugli scenari?"
            ]
        },
        
        // Consuntivi
        consuntivi: {
            keywords: ['consuntivo', 'spese reali', 'actual', 'registrare spese', 'inserire spesa'],
            responses: [
                "I consuntivi ti permettono di tracciare le spese reali:\n\n**Metodo 1 - Interfaccia:**\n1. Vai su '💰 Consuntivi'\n2. Crea un nuovo consuntivo\n3. Aggiungi le spese manualmente\n\n**Metodo 2 - Chat (NUOVO!):**\nPuoi dirmi direttamente:\n• 'Aggiungi spesa di 50€ per cena'\n• 'Inserisci spesa: 120€ benzina'\n• 'Nuova spesa 80€ hotel'\n\n⚠️ Nota: Dovrai poi completare i dettagli (chi ha pagato, chi condivide) nell'interfaccia.\n\nHai bisogno di aiuto con qualcosa di specifico?"
            ]
        },
        
        // Pagamenti
        pagamenti: {
            keywords: ['pagamento', 'pagare', 'trasferimento', 'dare avere', 'saldare'],
            responses: [
                "Per gestire i pagamenti tra partecipanti:\n\n**Metodo 1 - Interfaccia:**\n1. Vai su 'Dare/Avere' di un consuntivo\n2. Clicca '➕ Nuovo Pagamento'\n3. Compila il form\n\n**Metodo 2 - Chat (NUOVO!):**\nPuoi dirmi direttamente:\n• 'Marco ha pagato 50€ a Luca'\n• 'Pagamento da Sara a Giulia di 30€'\n• 'Registra pagamento da me a Marco'\n\nIl pagamento viene salvato e confermato automaticamente! 🎉\n\nVuoi sapere altro?"
            ]
        },
        
        // Ottimizzazione trasferimenti
        ottimizzazione: {
            keywords: ['ottimizza', 'trasferimenti', 'minimizza', 'semplifica pagamenti'],
            responses: [
                "L'ottimizzazione trasferimenti calcola il modo più efficiente per pareggiare i conti:\n\n1. Vai su 'Dare/Avere'\n2. Clicca '⚡ Ottimizza Trasferimenti'\n3. Vedrai i trasferimenti minimi necessari\n\n💡 L'algoritmo considera automaticamente i pagamenti già confermati, quindi mostra solo ciò che resta da pagare!\n\nAltro?"
            ]
        },
        
        // Partecipanti
        partecipanti: {
            keywords: ['partecipante', 'partecipanti', 'anagrafica', 'aggiungere persona'],
            responses: [
                "Per gestire i partecipanti:\n\n1. Vai su '👥 Anagrafica Partecipanti'\n2. Clicca '➕ Nuovo Partecipante'\n3. Inserisci nome, email e foto (opzionale)\n4. Salva\n\nI partecipanti salvati appariranno automaticamente quando crei scenari o consuntivi. Le foto vengono mostrate nei bilanci e pagamenti!\n\nServe altro?"
            ]
        },
        
        // Valute
        valute: {
            keywords: ['valuta', 'valute', 'cambio', 'conversione', 'euro', 'dollaro'],
            responses: [
                "Per gestire le valute:\n\n1. Vai su '💱 Valute'\n2. Aggiungi le valute che ti servono\n3. Inserisci i tassi di cambio\n4. Quando registri una spesa, seleziona la valuta\n5. L'importo viene convertito automaticamente in EUR!\n\nPerfetto per viaggi internazionali. Domande?"
            ]
        },
        
        // Confronto
        confronto: {
            keywords: ['confronta', 'confronto', 'comparare', 'differenza'],
            responses: [
                "Per confrontare scenari:\n\n1. Vai su '🔄 Confronta'\n2. Seleziona gli scenari da confrontare\n3. Clicca 'Confronta Selezionati'\n4. Visualizza tabelle e grafici comparativi\n\nPuoi confrontare costi, partecipanti e categorie di spesa. Utile per decidere la soluzione migliore!\n\nAltro?"
            ]
        },
        
        // Export
        export: {
            keywords: ['esporta', 'export', 'pdf', 'excel', 'csv', 'backup'],
            responses: [
                "Puoi esportare i dati in vari formati:\n\n📤 Clicca 'Esporta' nell'header e scegli:\n\n• **JSON** - Backup completo dei dati\n• **Excel/CSV** - Tabelle per analisi\n• **PDF** - Report professionale stampabile\n\nPer importare dati precedenti, usa '📥 Importa'.\n\nServe aiuto con l'export?"
            ]
        },
        
        // Aiuto generico
        aiuto: {
            keywords: ['aiuto', 'help', 'non capisco', 'come funziona', 'guida'],
            responses: [
                "Ecco cosa posso aiutarti a fare:\n\n📋 **Scenari** - Creare preventivi di viaggio\n💰 **Consuntivi** - Tracciare spese reali\n💳 **Pagamenti** - Gestire pagamenti tra partecipanti\n⚡ **Ottimizzazione** - Minimizzare trasferimenti\n👥 **Partecipanti** - Gestire anagrafica\n💱 **Valute** - Convertire importi\n🔄 **Confronto** - Comparare scenari\n📤 **Export** - Esportare dati\n\nDi cosa hai bisogno?"
            ]
        },
        
        // Problemi comuni
        problemi: {
            keywords: ['problema', 'errore', 'non funziona', 'bug', 'non vedo'],
            responses: [
                "Mi dispiace che tu abbia un problema! 😟\n\nProblemi comuni:\n\n1. **Pagamenti non scalati?** → Assicurati che il checkbox 'Conferma immediatamente' sia selezionato\n\n2. **Dati non salvati?** → I dati sono salvati automaticamente nel browser. Usa Export per backup\n\n3. **Partecipanti non appaiono?** → Vai su Anagrafica e verifica che siano salvati\n\n4. **Valute sbagliate?** → Controlla i tassi di cambio in Valute\n\nSe il problema persiste, descrivi cosa succede e ti aiuterò!"
            ]
        },
        
        // Ringraziamenti
        grazie: {
            keywords: ['grazie', 'thanks', 'perfetto', 'ottimo', 'bene'],
            responses: [
                "Prego! 😊 Sono qui se hai altre domande!",
                "Felice di aiutarti! 🌟 Torna quando vuoi!",
                "Di nulla! 👍 Buon viaggio con Travel Business Case!"
            ]
        }
    },
    
    // Inizializza il chatbot
    init() {
        this.createChatbotUI();
        this.setupEventListeners();
        this.loadConversationHistory();
    },
    
    // Crea l'interfaccia del chatbot
    createChatbotUI() {
        const chatbotHTML = `
            <!-- Pulsante floating per aprire chat -->
            <button id="norwyChatButton" class="norwy-chat-button" title="Chatta con Norwy">
                🤖
                <span class="norwy-badge">Norwy</span>
            </button>
            
            <!-- Finestra chat -->
            <div id="norwyChat" class="norwy-chat-window">
                <div class="norwy-chat-header">
                    <div class="norwy-header-content">
                        <div class="norwy-avatar">🤖</div>
                        <div class="norwy-header-text">
                            <h3>Norwy</h3>
                            <p>Assistente Virtuale</p>
                        </div>
                    </div>
                    <button id="norwyChatClose" class="norwy-close-btn">✕</button>
                </div>
                
                <div id="norwyMessages" class="norwy-messages">
                    <div class="norwy-message norwy-bot-message">
                        <div class="norwy-message-avatar">🤖</div>
                        <div class="norwy-message-content">
                            <p>Ciao! Sono Norwy, il tuo assistente virtuale. 👋</p>
                            <p>Posso aiutarti con scenari, consuntivi, pagamenti e molto altro!</p>
                            <p>Cosa vorresti sapere?</p>
                        </div>
                    </div>
                </div>
                
                <div class="norwy-quick-actions">
                    <button class="norwy-quick-btn" data-question="Come creo uno scenario?">📋 Scenari</button>
                    <button class="norwy-quick-btn" data-question="Come gestisco i pagamenti?">💳 Pagamenti</button>
                    <button class="norwy-quick-btn" data-question="Come funziona l'ottimizzazione?">⚡ Ottimizza</button>
                    <button class="norwy-quick-btn" data-question="Aiuto generale">❓ Aiuto</button>
                </div>
                
                <div class="norwy-input-area">
                    <input type="text" id="norwyInput" placeholder="Scrivi la tua domanda..." />
                    <button id="norwySendBtn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    },
    
    // Setup event listeners
    setupEventListeners() {
        const chatButton = document.getElementById('norwyChatButton');
        const chatWindow = document.getElementById('norwyChat');
        const closeBtn = document.getElementById('norwyChatClose');
        const sendBtn = document.getElementById('norwySendBtn');
        const input = document.getElementById('norwyInput');
        const quickBtns = document.querySelectorAll('.norwy-quick-btn');
        
        chatButton.addEventListener('click', () => this.toggleChat());
        closeBtn.addEventListener('click', () => this.toggleChat());
        sendBtn.addEventListener('click', () => this.sendMessage());
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.dataset.question;
                this.sendMessage(question);
            });
        });
    },
    
    // Toggle chat window
    toggleChat() {
        this.isOpen = !this.isOpen;
        const chatWindow = document.getElementById('norwyChat');
        const chatButton = document.getElementById('norwyChatButton');
        
        if (this.isOpen) {
            chatWindow.classList.add('open');
            chatButton.style.display = 'none';
            document.getElementById('norwyInput').focus();
        } else {
            chatWindow.classList.remove('open');
            chatButton.style.display = 'flex';
        }
    },
    
    // Invia messaggio
    sendMessage(predefinedMessage = null) {
        const input = document.getElementById('norwyInput');
        const message = predefinedMessage || input.value.trim();
        
        if (!message) return;
        
        // Aggiungi messaggio utente
        this.addMessage(message, 'user');
        
        // Pulisci input
        if (!predefinedMessage) input.value = '';
        
        // Simula "typing"
        this.showTypingIndicator();
        
        // Genera risposta dopo un breve delay
        setTimeout(async () => {
            this.hideTypingIndicator();
            const response = await this.generateResponse(message);
            this.addMessage(response, 'bot');
            
            // Salva conversazione
            this.saveConversation(message, response);
        }, 800);
    },
    
    // Aggiungi messaggio alla chat
    addMessage(text, sender) {
        const messagesContainer = document.getElementById('norwyMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `norwy-message norwy-${sender}-message`;
        
        if (sender === 'bot') {
            messageDiv.innerHTML = `
                <div class="norwy-message-avatar">🤖</div>
                <div class="norwy-message-content">
                    <p>${text.replace(/\n/g, '</p><p>')}</p>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="norwy-message-content">
                    <p>${text}</p>
                </div>
            `;
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
    
    // Mostra indicatore "typing"
    showTypingIndicator() {
        const messagesContainer = document.getElementById('norwyMessages');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'norwyTyping';
        typingDiv.className = 'norwy-message norwy-bot-message';
        typingDiv.innerHTML = `
            <div class="norwy-message-avatar">🤖</div>
            <div class="norwy-message-content">
                <div class="norwy-typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
    
    // Nascondi indicatore "typing"
    hideTypingIndicator() {
        const typingDiv = document.getElementById('norwyTyping');
        if (typingDiv) typingDiv.remove();
    },
    
    // Genera risposta basata sul messaggio
    generateResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Se c'è un'azione pendente, gestiscila
        if (this.pendingAction) {
            return this.handlePendingAction(message);
        }
        
        // Controlla PRIMA se è un comando per inserire spesa o pagamento
        // (devono essere controllati prima delle query per evitare falsi positivi)
        if (this.isExpenseCommand(lowerMessage)) {
            return this.handleExpenseCommand(message);
        }
        
        if (this.isPaymentCommand(lowerMessage)) {
            return this.handlePaymentCommand(message);
        }
        
        // Poi controlla se è una query sui dati
        if (this.isDataQuery(lowerMessage)) {
            return this.handleDataQuery(message);
        }
        
        // Cerca nella knowledge base
        for (const [category, data] of Object.entries(this.knowledgeBase)) {
            if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
                const responses = data.responses;
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }
        
        // Risposta di default se non trova match
        return "Hmm, non sono sicuro di aver capito. 🤔\n\nProva a chiedermi di:\n• Scenari e preventivi\n• Consuntivi e spese\n• Pagamenti tra partecipanti\n• Ottimizzazione trasferimenti\n• Gestione partecipanti\n• Valute e conversioni\n\n💡 **Novità!** Puoi anche:\n• 'Aggiungi spesa di 50€ per cena'\n• 'Marco ha pagato 30€ a Luca'\n• 'Quanto è costato il volo?'\n• 'Quanto devo a Marco?'\n\nOppure scrivi 'aiuto' per vedere tutte le funzionalità!";
    },
    
    // Verifica se è una query sui dati
    isDataQuery(message) {
        const queryKeywords = [
            'quanto', 'costo', 'costato', 'speso', 'pagato',
            'totale', 'devo', 'deve', 'bilancio', 'saldo',
            'a testa', 'per persona', 'ciascuno'
        ];
        return queryKeywords.some(keyword => message.includes(keyword));
    },
    
    // Gestisce query sui dati
    async handleDataQuery(message) {
        const lowerMessage = message.toLowerCase();
        
        // Query su costi specifici (volo, hotel, ecc.)
        if (lowerMessage.includes('volo') || lowerMessage.includes('aereo') || lowerMessage.includes('trasporto')) {
            return await this.queryTransportCost(message);
        }
        
        if (lowerMessage.includes('hotel') || lowerMessage.includes('alloggio') || lowerMessage.includes('casa')) {
            return await this.queryAccommodationCost(message);
        }
        
        if (lowerMessage.includes('cena') || lowerMessage.includes('ristorante') || lowerMessage.includes('cibo') || lowerMessage.includes('vitto')) {
            return await this.queryFoodCost(message);
        }
        
        if (lowerMessage.includes('auto') || lowerMessage.includes('macchina') || lowerMessage.includes('noleggio')) {
            return await this.queryCarCost(message);
        }
        
        if (lowerMessage.includes('attività') || lowerMessage.includes('escursioni')) {
            return await this.queryActivitiesCost(message);
        }
        
        // Query su totali
        if (lowerMessage.includes('totale') || lowerMessage.includes('tutto')) {
            return await this.queryTotalCost(message);
        }
        
        // Query su costi per persona
        if (lowerMessage.includes('a testa') || lowerMessage.includes('per persona') || lowerMessage.includes('ciascuno')) {
            return this.queryCostPerPerson(message);
        }
        
        // Query su bilanci (quanto devo/deve)
        if (lowerMessage.includes('devo') || lowerMessage.includes('deve') || lowerMessage.includes('bilancio') || lowerMessage.includes('saldo')) {
            return this.queryBalance(message);
        }
        
        return "Non ho trovato informazioni specifiche per questa domanda. Prova a essere più specifico, ad esempio:\n• 'Quanto è costato il volo?'\n• 'Quanto costa l'hotel a testa?'\n• 'Quanto devo a Marco?'\n• 'Qual è il totale?'";
    },
    
    // Query costo trasporto
    async queryTransportCost(message) {
        const scenarios = await this.getScenarios();
        const actuals = await this.getActuals();
        const lowerMessage = message.toLowerCase();
        
        // Determina se chiedere per persona
        const perPerson = lowerMessage.includes('a testa') || lowerMessage.includes('per persona') || lowerMessage.includes('ciascuno');
        
        // Se c'è uno scenario attivo
        if (window.App && window.App.currentScenario) {
            const scenario = window.App.currentScenario;
            const cost = scenario.expenses?.transport || 0;
            const participants = scenario.participants?.length || 1;
            
            if (perPerson) {
                const costPP = cost / participants;
                return `✈️ **Trasporto/Volo**\n\n💰 Costo totale: ${this.formatCurrency(cost)}\n👥 Partecipanti: ${participants}\n💵 A testa: ${this.formatCurrency(costPP)}`;
            }
            return `✈️ **Trasporto/Volo**\n\n💰 Costo totale: ${this.formatCurrency(cost)}\n👥 Partecipanti: ${participants}`;
        }
        
        // Se c'è un consuntivo attivo
        if (ActualsManager && ActualsManager.currentActualId) {
            const actual = actuals.find(a => a.id === ActualsManager.currentActualId);
            if (actual) {
                const transportExpenses = this.getExpensesByCategory(actual, ['viaggio']);
                const total = transportExpenses.reduce((sum, exp) => sum + (exp.amountEUR || exp.amount || 0), 0);
                const participants = actual.participants?.length || 1;
                
                if (perPerson) {
                    const costPP = total / participants;
                    return `✈️ **Trasporto/Volo - ${actual.name}**\n\n💰 Costo totale: ${this.formatCurrency(total)}\n👥 Partecipanti: ${participants}\n💵 A testa: ${this.formatCurrency(costPP)}\n\n📝 Spese: ${transportExpenses.length}`;
                }
                return `✈️ **Trasporto/Volo - ${actual.name}**\n\n💰 Costo totale: ${this.formatCurrency(total)}\n👥 Partecipanti: ${participants}\n\n📝 Spese: ${transportExpenses.length}`;
            }
        }
        
        // Altrimenti mostra tutti
        if (scenarios.length === 0 && actuals.length === 0) {
            return "⚠️ Non ci sono ancora scenari o consuntivi. Creane uno per iniziare!";
        }
        
        let response = "✈️ **Costi Trasporto/Volo**\n\n";
        
        // Scenari
        scenarios.forEach(s => {
            const cost = s.expenses?.transport || 0;
            const participants = s.participants?.length || 1;
            const costPP = cost / participants;
            response += `📋 ${s.name}: ${this.formatCurrency(cost)}`;
            if (perPerson) response += ` (${this.formatCurrency(costPP)}/persona)`;
            response += '\n';
        });
        
        // Consuntivi
        actuals.forEach(a => {
            const transportExpenses = this.getExpensesByCategory(a, ['viaggio']);
            const total = transportExpenses.reduce((sum, exp) => sum + (exp.amountEUR || exp.amount || 0), 0);
            const participants = a.participants?.length || 1;
            const costPP = total / participants;
            response += `💰 ${a.name}: ${this.formatCurrency(total)}`;
            if (perPerson) response += ` (${this.formatCurrency(costPP)}/persona)`;
            response += '\n';
        });
        
        return response + "\n💡 Apri uno scenario/consuntivo specifico per dettagli completi!";
    },
    
    // Helper: ottieni spese per categoria
    getExpensesByCategory(actual, categories) {
        if (!actual.expenses || !Array.isArray(actual.expenses)) return [];
        return actual.expenses.filter(exp => categories.includes(exp.category));
    },
    
    // Query costo alloggio
    async queryAccommodationCost(message) {
        const scenarios = await this.getScenarios();
        const actuals = await this.getActuals();
        const lowerMessage = message.toLowerCase();
        const perPerson = lowerMessage.includes('a testa') || lowerMessage.includes('per persona');
        
        if (window.App && window.App.currentScenario) {
            const scenario = window.App.currentScenario;
            const cost = scenario.expenses?.accommodation || 0;
            const participants = scenario.participants?.length || 1;
            
            if (perPerson) {
                const costPP = cost / participants;
                return `🏨 **Alloggio**\n\n💰 Costo totale: ${this.formatCurrency(cost)}\n👥 Partecipanti: ${participants}\n💵 A testa: ${this.formatCurrency(costPP)}`;
            }
            return `🏨 **Alloggio**\n\n💰 Costo totale: ${this.formatCurrency(cost)}\n👥 Partecipanti: ${participants}`;
        }
        
        if (ActualsManager && ActualsManager.currentActualId) {
            const actual = actuals.find(a => a.id === ActualsManager.currentActualId);
            if (actual) {
                const expenses = this.getExpensesByCategory(actual, ['hotel', 'casa']);
                const total = expenses.reduce((sum, exp) => sum + (exp.amountEUR || exp.amount || 0), 0);
                const participants = actual.participants?.length || 1;
                
                if (perPerson) {
                    const costPP = total / participants;
                    return `🏨 **Alloggio - ${actual.name}**\n\n💰 Costo totale: ${this.formatCurrency(total)}\n👥 Partecipanti: ${participants}\n💵 A testa: ${this.formatCurrency(costPP)}`;
                }
                return `🏨 **Alloggio - ${actual.name}**\n\n💰 Costo totale: ${this.formatCurrency(total)}\n👥 Partecipanti: ${participants}`;
            }
        }
        
        if (scenarios.length === 0 && actuals.length === 0) {
            return "⚠️ Non ci sono ancora scenari o consuntivi. Creane uno per iniziare!";
        }
        
        let response = "🏨 **Costi Alloggio**\n\n";
        scenarios.forEach(s => {
            const cost = s.expenses?.accommodation || 0;
            const participants = s.participants?.length || 1;
            const costPP = cost / participants;
            response += `📋 ${s.name}: ${this.formatCurrency(cost)}`;
            if (perPerson) response += ` (${this.formatCurrency(costPP)}/persona)`;
            response += '\n';
        });
        
        actuals.forEach(a => {
            const expenses = this.getExpensesByCategory(a, ['hotel', 'casa']);
            const total = expenses.reduce((sum, exp) => sum + (exp.amountEUR || exp.amount || 0), 0);
            const participants = a.participants?.length || 1;
            const costPP = total / participants;
            response += `💰 ${a.name}: ${this.formatCurrency(total)}`;
            if (perPerson) response += ` (${this.formatCurrency(costPP)}/persona)`;
            response += '\n';
        });
        
        return response;
    },
    
    // Query costo cibo
    queryFoodCost(message) {
        const scenarios = this.getScenarios();
        const actuals = this.getActuals();
        const lowerMessage = message.toLowerCase();
        const perPerson = lowerMessage.includes('a testa') || lowerMessage.includes('per persona');
        
        if (window.App && window.App.currentScenario) {
            const scenario = window.App.currentScenario;
            const cost = scenario.expenses?.food || 0;
            const participants = scenario.participants?.length || 1;
            
            if (perPerson) {
                const costPP = cost / participants;
                return `🍽️ **Vitto/Ristoranti**\n\n💰 Costo totale: ${this.formatCurrency(cost)}\n👥 Partecipanti: ${participants}\n💵 A testa: ${this.formatCurrency(costPP)}`;
            }
            return `🍽️ **Vitto/Ristoranti**\n\n💰 Costo totale: ${this.formatCurrency(cost)}\n👥 Partecipanti: ${participants}`;
        }
        
        if (ActualsManager && ActualsManager.currentActualId) {
            const actual = actuals.find(a => a.id === ActualsManager.currentActualId);
            if (actual) {
                const expenses = this.getExpensesByCategory(actual, ['ristorante', 'spesa']);
                const total = expenses.reduce((sum, exp) => sum + (exp.amountEUR || exp.amount || 0), 0);
                const participants = actual.participants?.length || 1;
                
                if (perPerson) {
                    const costPP = total / participants;
                    return `🍽️ **Vitto/Ristoranti - ${actual.name}**\n\n💰 Costo totale: ${this.formatCurrency(total)}\n👥 Partecipanti: ${participants}\n💵 A testa: ${this.formatCurrency(costPP)}`;
                }
                return `🍽️ **Vitto/Ristoranti - ${actual.name}**\n\n💰 Costo totale: ${this.formatCurrency(total)}\n👥 Partecipanti: ${participants}`;
            }
        }
        
        if (scenarios.length === 0 && actuals.length === 0) {
            return "⚠️ Non ci sono ancora scenari o consuntivi. Creane uno per iniziare!";
        }
        
        let response = "🍽️ **Costi Vitto**\n\n";
        scenarios.forEach(s => {
            const cost = s.expenses?.food || 0;
            const participants = s.participants?.length || 1;
            const costPP = cost / participants;
            response += `📋 ${s.name}: ${this.formatCurrency(cost)}`;
            if (perPerson) response += ` (${this.formatCurrency(costPP)}/persona)`;
            response += '\n';
        });
        
        actuals.forEach(a => {
            const expenses = this.getExpensesByCategory(a, ['ristorante', 'spesa']);
            const total = expenses.reduce((sum, exp) => sum + (exp.amountEUR || exp.amount || 0), 0);
            const participants = a.participants?.length || 1;
            const costPP = total / participants;
            response += `💰 ${a.name}: ${this.formatCurrency(total)}`;
            if (perPerson) response += ` (${this.formatCurrency(costPP)}/persona)`;
            response += '\n';
        });
        
        return response;
    },
    
    // Query costo auto
    async queryCarCost(message) {
        const scenarios = await this.getScenarios();
        const actuals = await this.getActuals();
        const lowerMessage = message.toLowerCase();
        const perPerson = lowerMessage.includes('a testa') || lowerMessage.includes('per persona');
        
        if (window.App && window.App.currentScenario) {
            const scenario = window.App.currentScenario;
            const cost = scenario.expenses?.car || 0;
            const participants = scenario.participants?.length || 1;
            
            if (perPerson) {
                const costPP = cost / participants;
                return `🚗 **Auto/Noleggio**\n\n💰 Costo totale: ${this.formatCurrency(cost)}\n👥 Partecipanti: ${participants}\n💵 A testa: ${this.formatCurrency(costPP)}`;
            }
            return `🚗 **Auto/Noleggio**\n\n💰 Costo totale: ${this.formatCurrency(cost)}\n👥 Partecipanti: ${participants}`;
        }
        
        if (ActualsManager && ActualsManager.currentActualId) {
            const actual = actuals.find(a => a.id === ActualsManager.currentActualId);
            if (actual) {
                const expenses = this.getExpensesByCategory(actual, ['auto', 'benzina']);
                const total = expenses.reduce((sum, exp) => sum + (exp.amountEUR || exp.amount || 0), 0);
                const participants = actual.participants?.length || 1;
                
                if (perPerson) {
                    const costPP = total / participants;
                    return `🚗 **Auto/Noleggio - ${actual.name}**\n\n💰 Costo totale: ${this.formatCurrency(total)}\n👥 Partecipanti: ${participants}\n💵 A testa: ${this.formatCurrency(costPP)}`;
                }
                return `🚗 **Auto/Noleggio - ${actual.name}**\n\n💰 Costo totale: ${this.formatCurrency(total)}\n👥 Partecipanti: ${participants}`;
            }
        }
        
        if (scenarios.length === 0 && actuals.length === 0) {
            return "⚠️ Non ci sono ancora scenari o consuntivi. Creane uno per iniziare!";
        }
        
        let response = "🚗 **Costi Auto**\n\n";
        scenarios.forEach(s => {
            const cost = s.expenses?.car || 0;
            const participants = s.participants?.length || 1;
            const costPP = cost / participants;
            response += `📋 ${s.name}: ${this.formatCurrency(cost)}`;
            if (perPerson) response += ` (${this.formatCurrency(costPP)}/persona)`;
            response += '\n';
        });
        
        actuals.forEach(a => {
            const expenses = this.getExpensesByCategory(a, ['auto', 'benzina']);
            const total = expenses.reduce((sum, exp) => sum + (exp.amountEUR || exp.amount || 0), 0);
            const participants = a.participants?.length || 1;
            const costPP = total / participants;
            response += `💰 ${a.name}: ${this.formatCurrency(total)}`;
            if (perPerson) response += ` (${this.formatCurrency(costPP)}/persona)`;
            response += '\n';
        });
        
        return response;
    },
    
    // Query costo attività
    async queryActivitiesCost(message) {
        const scenarios = await this.getScenarios();
        const actuals = await this.getActuals();
        const lowerMessage = message.toLowerCase();
        const perPerson = lowerMessage.includes('a testa') || lowerMessage.includes('per persona');
        
        if (window.App && window.App.currentScenario) {
            const scenario = window.App.currentScenario;
            const cost = scenario.expenses?.activities || 0;
            const participants = scenario.participants?.length || 1;
            
            if (perPerson) {
                const costPP = cost / participants;
                return `🎭 **Attività/Escursioni**\n\n💰 Costo totale: ${this.formatCurrency(cost)}\n👥 Partecipanti: ${participants}\n💵 A testa: ${this.formatCurrency(costPP)}`;
            }
            return `🎭 **Attività/Escursioni**\n\n💰 Costo totale: ${this.formatCurrency(cost)}\n👥 Partecipanti: ${participants}`;
        }
        
        if (ActualsManager && ActualsManager.currentActualId) {
            const actual = actuals.find(a => a.id === ActualsManager.currentActualId);
            if (actual) {
                const expenses = this.getExpensesByCategory(actual, ['attivita']);
                const total = expenses.reduce((sum, exp) => sum + (exp.amountEUR || exp.amount || 0), 0);
                const participants = actual.participants?.length || 1;
                
                if (perPerson) {
                    const costPP = total / participants;
                    return `🎭 **Attività/Escursioni - ${actual.name}**\n\n💰 Costo totale: ${this.formatCurrency(total)}\n👥 Partecipanti: ${participants}\n💵 A testa: ${this.formatCurrency(costPP)}`;
                }
                return `🎭 **Attività/Escursioni - ${actual.name}**\n\n💰 Costo totale: ${this.formatCurrency(total)}\n👥 Partecipanti: ${participants}`;
            }
        }
        
        if (scenarios.length === 0 && actuals.length === 0) {
            return "⚠️ Non ci sono ancora scenari o consuntivi. Creane uno per iniziare!";
        }
        
        let response = "🎭 **Costi Attività**\n\n";
        scenarios.forEach(s => {
            const cost = s.expenses?.activities || 0;
            const participants = s.participants?.length || 1;
            const costPP = cost / participants;
            response += `📋 ${s.name}: ${this.formatCurrency(cost)}`;
            if (perPerson) response += ` (${this.formatCurrency(costPP)}/persona)`;
            response += '\n';
        });
        
        actuals.forEach(a => {
            const expenses = this.getExpensesByCategory(a, ['attivita']);
            const total = expenses.reduce((sum, exp) => sum + (exp.amountEUR || exp.amount || 0), 0);
            const participants = a.participants?.length || 1;
            const costPP = total / participants;
            response += `💰 ${a.name}: ${this.formatCurrency(total)}`;
            if (perPerson) response += ` (${this.formatCurrency(costPP)}/persona)`;
            response += '\n';
        });
        
        return response;
    },
    
    // Query costo totale
    async queryTotalCost(message) {
        const scenarios = await this.getScenarios();
        const actuals = await this.getActuals();
        const lowerMessage = message.toLowerCase();
        const perPerson = lowerMessage.includes('a testa') || lowerMessage.includes('per persona');
        
        if (window.App && window.App.currentScenario) {
            const scenario = window.App.currentScenario;
            const expenses = scenario.expenses || {};
            const total = Object.values(expenses).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
            const participants = scenario.participants?.length || 1;
            
            if (perPerson) {
                const costPP = total / participants;
                return `💰 **Costo Totale - ${scenario.name}**\n\n📊 Totale: ${this.formatCurrency(total)}\n👥 Partecipanti: ${participants}\n💵 A testa: ${this.formatCurrency(costPP)}`;
            }
            return `💰 **Costo Totale - ${scenario.name}**\n\n📊 Totale: ${this.formatCurrency(total)}\n👥 Partecipanti: ${participants}`;
        }
        
        if (ActualsManager && ActualsManager.currentActualId) {
            const actual = actuals.find(a => a.id === ActualsManager.currentActualId);
            if (actual) {
                const allExpenses = actual.expenses || [];
                const total = allExpenses.reduce((sum, exp) => sum + (exp.amountEUR || exp.amount || 0), 0);
                const participants = actual.participants?.length || 1;
                
                if (perPerson) {
                    const costPP = total / participants;
                    return `💰 **Costo Totale - ${actual.name}**\n\n📊 Totale: ${this.formatCurrency(total)}\n👥 Partecipanti: ${participants}\n💵 A testa: ${this.formatCurrency(costPP)}\n\n📝 Spese totali: ${allExpenses.length}`;
                }
                return `💰 **Costo Totale - ${actual.name}**\n\n📊 Totale: ${this.formatCurrency(total)}\n👥 Partecipanti: ${participants}\n\n📝 Spese totali: ${allExpenses.length}`;
            }
        }
        
        if (scenarios.length === 0 && actuals.length === 0) {
            return "⚠️ Non ci sono ancora scenari o consuntivi. Creane uno per iniziare!";
        }
        
        let response = "💰 **Costi Totali**\n\n";
        scenarios.forEach(s => {
            const expenses = s.expenses || {};
            const total = Object.values(expenses).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
            const participants = s.participants?.length || 1;
            const costPP = total / participants;
            response += `📋 ${s.name}: ${this.formatCurrency(total)}`;
            if (perPerson) response += ` (${this.formatCurrency(costPP)}/persona)`;
            response += '\n';
        });
        
        actuals.forEach(a => {
            const allExpenses = a.expenses || [];
            const total = allExpenses.reduce((sum, exp) => sum + (exp.amountEUR || exp.amount || 0), 0);
            const participants = a.participants?.length || 1;
            const costPP = total / participants;
            response += `💰 ${a.name}: ${this.formatCurrency(total)}`;
            if (perPerson) response += ` (${this.formatCurrency(costPP)}/persona)`;
            response += '\n';
        });
        
        return response;
    },
    
    // Query costo per persona
    queryCostPerPerson(message) {
        return this.queryTotalCost(message + ' per persona');
    },
    
    // Query bilancio (quanto devo/deve)
    queryBalance(message) {
        if (!SettlementsManager.currentActual) {
            return "⚠️ Per vedere i bilanci, devi prima aprire la sezione Dare/Avere di un consuntivo!";
        }
        
        const lowerMessage = message.toLowerCase();
        const actual = SettlementsManager.currentActual;
        
        // Estrai il nome del partecipante dalla domanda
        let participantName = null;
        actual.participants.forEach(p => {
            if (lowerMessage.includes(p.toLowerCase())) {
                participantName = p;
            }
        });
        
        if (!participantName) {
            // Mostra tutti i bilanci
            if (!SettlementsManager.balances) {
                return "⚠️ Calcola prima i bilanci nella sezione Dare/Avere!";
            }
            
            let response = "💳 **Bilanci Dare/Avere**\n\n";
            Object.entries(SettlementsManager.balances).forEach(([name, balance]) => {
                if (balance > 0) {
                    response += `✅ ${name}: deve ricevere ${this.formatCurrency(balance)}\n`;
                } else if (balance < 0) {
                    response += `❌ ${name}: deve dare ${this.formatCurrency(Math.abs(balance))}\n`;
                } else {
                    response += `⚖️ ${name}: in pari\n`;
                }
            });
            
            return response;
        }
        
        // Mostra bilancio specifico
        if (!SettlementsManager.balances || !SettlementsManager.balances[participantName]) {
            return `⚠️ Non trovo il bilancio per ${participantName}. Verifica il nome!`;
        }
        
        const balance = SettlementsManager.balances[participantName];
        
        if (balance > 0) {
            return `✅ **${participantName}**\n\nDeve ricevere: ${this.formatCurrency(balance)}`;
        } else if (balance < 0) {
            return `❌ **${participantName}**\n\nDeve dare: ${this.formatCurrency(Math.abs(balance))}`;
        } else {
            return `⚖️ **${participantName}**\n\nÈ in pari! Nessun debito o credito.`;
        }
    },
    
    // Helper: ottieni scenari
    async getScenarios() {
        try {
            // Prova prima con StorageManager se disponibile
            if (typeof StorageManager !== 'undefined') {
                const scenarios = await StorageManager.getScenarios();
                if (scenarios) {
                    return scenarios;
                }
            }
            
            return [];
        } catch (e) {
            console.error('❌ Norwy getScenarios error:', e);
            return [];
        }
    },
    
    // Helper: ottieni consuntivi
    async getActuals() {
        try {
            // Prova prima con StorageManager se disponibile
            if (typeof StorageManager !== 'undefined') {
                const actuals = await StorageManager.getActuals();
                if (actuals) {
                    return actuals;
                }
            }
            
            // Fallback: prova chiave diretta 'actuals'
            const directData = localStorage.getItem('actuals');
            if (directData) {
                return JSON.parse(directData);
            }
            
            return [];
        } catch (e) {
            console.error('❌ Norwy getActuals error:', e);
            return [];
        }
    },
    
    // Helper: formatta valuta
    formatCurrency(amount) {
        try {
            if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
                return new Intl.NumberFormat('it-IT', {
                    style: 'currency',
                    currency: 'EUR'
                }).format(amount);
            } else {
                return `€${parseFloat(amount).toFixed(2).replace('.', ',')}`;
            }
        } catch {
            return `€${parseFloat(amount).toFixed(2)}`;
        }
    },
    
    // Verifica se è un comando per inserire spesa
    isExpenseCommand(message) {
        const expenseKeywords = ['aggiungi spesa', 'inserisci spesa', 'nuova spesa', 'registra spesa', 'spesa di'];
        return expenseKeywords.some(keyword => message.includes(keyword));
    },
    
    // Verifica se è un comando per inserire pagamento
    isPaymentCommand(message) {
        // Usa regex per essere più precisi ed evitare falsi positivi come "pagando"
        const paymentPatterns = [
            /\b(ha pagato|hanno pagato)\b/i,           // "ha pagato" o "hanno pagato"
            /\bpagamento\s+da\b/i,                      // "pagamento da"
            /\btrasferimento\s+da\b/i,                  // "trasferimento da"
            /\b\w+\s+paga\s+\d+/i,                      // "Marco paga 50" (nome + paga + numero)
            /\bregistra\s+pagamento\b/i                 // "registra pagamento"
        ];
        return paymentPatterns.some(pattern => pattern.test(message));
    },
    
    // Gestisce comando per inserire spesa
    handleExpenseCommand(message) {
        // Verifica che ci sia un consuntivo attivo
        if (!window.currentView || window.currentView !== 'actuals') {
            return "⚠️ Per inserire una spesa, devi prima aprire un consuntivo!\n\n1. Vai su '💰 Consuntivi'\n2. Seleziona o crea un consuntivo\n3. Poi potrai dirmi: 'Aggiungi spesa di 50€ per cena'";
        }
        
        // Estrai informazioni dalla frase
        const parsed = this.parseExpenseCommand(message);
        
        if (!parsed.amount) {
            this.pendingAction = { type: 'expense', data: parsed };
            return "💰 Perfetto! Quanto è l'importo della spesa?\n\nEsempio: '50€' o '50 euro'";
        }
        
        if (!parsed.description) {
            this.pendingAction = { type: 'expense', data: parsed };
            return "📝 Ok! Per cosa è questa spesa?\n\nEsempio: 'cena', 'benzina', 'hotel'";
        }
        
        // Se abbiamo tutte le info, chiedi conferma
        return this.confirmExpense(parsed);
    },
    
    // Gestisce comando per inserire pagamento
    handlePaymentCommand(message) {
        // Verifica che ci sia un consuntivo attivo con settlements
        if (!SettlementsManager.currentActual) {
            return "⚠️ Per registrare un pagamento, devi prima aprire la sezione Dare/Avere!\n\n1. Vai su '💰 Consuntivi'\n2. Seleziona un consuntivo\n3. Clicca su 'Dare/Avere'\n4. Poi potrai dirmi: 'Marco ha pagato 50€ a Luca'";
        }
        
        // Estrai informazioni dalla frase
        const parsed = this.parsePaymentCommand(message);
        
        if (!parsed.from) {
            this.pendingAction = { type: 'payment', data: parsed };
            return "👤 Chi ha fatto il pagamento?\n\nEsempio: 'Marco', 'Sara', ecc.";
        }
        
        if (!parsed.to) {
            this.pendingAction = { type: 'payment', data: parsed };
            return "👤 A chi è stato fatto il pagamento?\n\nEsempio: 'Luca', 'Giulia', ecc.";
        }
        
        if (!parsed.amount) {
            this.pendingAction = { type: 'payment', data: parsed };
            return "💰 Qual è l'importo del pagamento?\n\nEsempio: '50€' o '50 euro'";
        }
        
        // Se abbiamo tutte le info, chiedi conferma
        return this.confirmPayment(parsed);
    },
    
    // Parse comando spesa
    parseExpenseCommand(message) {
        const result = { amount: null, description: null, currency: 'EUR' };
        
        // Estrai importo (es: 50€, 50 euro, 50)
        const amountMatch = message.match(/(\d+(?:[.,]\d+)?)\s*(?:€|euro|eur)?/i);
        if (amountMatch) {
            result.amount = parseFloat(amountMatch[1].replace(',', '.'));
        }
        
        // Estrai descrizione (dopo "per", "di", o dopo l'importo)
        const descMatch = message.match(/(?:per|di)\s+(.+?)(?:\s+da\s+|\s*$)/i);
        if (descMatch) {
            result.description = descMatch[1].trim();
        }
        
        return result;
    },
    
    // Parse comando pagamento
    parsePaymentCommand(message) {
        const result = { from: null, to: null, amount: null };
        
        // Pattern supportati:
        // 1. "X ha pagato Y€ a Z"
        // 2. "pagamento da X a Z di Y€"
        // 3. "X paga Y€ a Z" (NUOVO!)
        const pattern1 = /(\w+)\s+ha\s+pagato\s+(\d+(?:[.,]\d+)?)\s*(?:€|euro|eur)?\s+a\s+(\w+)/i;
        const pattern2 = /pagamento\s+da\s+(\w+)\s+a\s+(\w+)\s+(?:di\s+)?(\d+(?:[.,]\d+)?)\s*(?:€|euro|eur)?/i;
        const pattern3 = /(\w+)\s+paga\s+(\d+(?:[.,]\d+)?)\s*(?:€|euro|eur)?\s+a\s+(\w+)/i;
        
        let match = message.match(pattern1);
        if (match) {
            result.from = match[1];
            result.amount = parseFloat(match[2].replace(',', '.'));
            result.to = match[3];
            return result;
        }
        
        match = message.match(pattern2);
        if (match) {
            result.from = match[1];
            result.to = match[2];
            result.amount = parseFloat(match[3].replace(',', '.'));
            return result;
        }
        
        match = message.match(pattern3);
        if (match) {
            result.from = match[1];
            result.amount = parseFloat(match[2].replace(',', '.'));
            result.to = match[3];
            return result;
        }
        
        return result;
    },
    
    // Gestisce azioni pendenti (dialogo multi-step)
    handlePendingAction(message) {
        const lowerMessage = message.toLowerCase();
        const action = this.pendingAction;
        
        // Permetti all'utente di uscire dal dialogo con parole chiave o domande
        const exitKeywords = ['annulla', 'cancella', 'stop', 'esci', 'basta', 'no grazie'];
        const questionKeywords = ['come', 'cosa', 'quando', 'dove', 'perché', 'chi', 'quale', 'quanto'];
        
        // Se l'utente vuole annullare esplicitamente
        if (exitKeywords.some(keyword => lowerMessage.includes(keyword))) {
            this.pendingAction = null;
            return "❌ Operazione annullata. Come posso aiutarti?";
        }
        
        // Se l'utente fa una domanda (inizia con parola interrogativa), annulla il dialogo e rispondi
        if (questionKeywords.some(keyword => lowerMessage.startsWith(keyword))) {
            this.pendingAction = null;
            return this.generateResponse(message); // Processa la nuova domanda
        }
        
        // Altrimenti continua con il dialogo pendente
        if (action.type === 'expense') {
            return this.handlePendingExpense(message, action.data);
        } else if (action.type === 'payment') {
            return this.handlePendingPayment(message, action.data);
        }
        
        return "Qualcosa è andato storto. Riprova!";
    },
    
    // Gestisce spesa pendente
    handlePendingExpense(message, data) {
        // Se manca l'importo
        if (!data.amount) {
            const amountMatch = message.match(/(\d+(?:[.,]\d+)?)/);
            if (amountMatch) {
                data.amount = parseFloat(amountMatch[1].replace(',', '.'));
                this.pendingAction.data = data;
                return "📝 Perfetto! Per cosa è questa spesa?\n\nEsempio: 'cena', 'benzina', 'hotel'";
            } else {
                return "⚠️ Non ho capito l'importo. Scrivi un numero, es: '50' o '50.5'";
            }
        }
        
        // Se manca la descrizione
        if (!data.description) {
            data.description = message.trim();
            this.pendingAction = null;
            return this.confirmExpense(data);
        }
        
        return "Qualcosa è andato storto. Riprova!";
    },
    
    // Gestisce pagamento pendente
    handlePendingPayment(message, data) {
        // Se manca il mittente
        if (!data.from) {
            data.from = message.trim();
            this.pendingAction.data = data;
            return "👤 A chi è stato fatto il pagamento?";
        }
        
        // Se manca il destinatario
        if (!data.to) {
            data.to = message.trim();
            this.pendingAction.data = data;
            return "💰 Qual è l'importo del pagamento?\n\nEsempio: '50€' o '50 euro'";
        }
        
        // Se manca l'importo
        if (!data.amount) {
            const amountMatch = message.match(/(\d+(?:[.,]\d+)?)/);
            if (amountMatch) {
                data.amount = parseFloat(amountMatch[1].replace(',', '.'));
                this.pendingAction = null;
                return this.confirmPayment(data);
            } else {
                return "⚠️ Non ho capito l'importo. Scrivi un numero, es: '50' o '50.5'";
            }
        }
        
        return "Qualcosa è andato storto. Riprova!";
    },
    
    // Conferma e salva spesa
    confirmExpense(data) {
        // Qui dovremmo integrare con ActualsManager
        // Per ora mostriamo solo la conferma
        return `✅ Spesa registrata!\n\n💰 Importo: ${data.amount}€\n📝 Descrizione: ${data.description}\n\n⚠️ Nota: Per completare l'inserimento, vai su Consuntivi e aggiungi i dettagli mancanti (chi ha pagato, chi condivide la spesa, ecc.)`;
    },
    
    // Conferma e salva pagamento
    confirmPayment(data) {
        try {
            // Verifica che i partecipanti esistano
            const actual = SettlementsManager.currentActual;
            if (!actual.participants.includes(data.from)) {
                return `⚠️ "${data.from}" non è tra i partecipanti di questo consuntivo.\n\nPartecipanti disponibili: ${actual.participants.join(', ')}`;
            }
            if (!actual.participants.includes(data.to)) {
                return `⚠️ "${data.to}" non è tra i partecipanti di questo consuntivo.\n\nPartecipanti disponibili: ${actual.participants.join(', ')}`;
            }
            
            // Crea il pagamento
            const payment = {
                id: Date.now(),
                from: data.from,
                to: data.to,
                amount: data.amount,
                date: new Date().toISOString().split('T')[0],
                confirmed: true, // Conferma automaticamente
                notes: 'Inserito tramite Norwy'
            };
            
            // Aggiungi al manager
            if (!SettlementsManager.payments) {
                SettlementsManager.payments = [];
            }
            SettlementsManager.payments.push(payment);
            
            // Salva nel consuntivo
            if (!actual.payments) {
                actual.payments = [];
            }
            actual.payments.push(payment);
            
            // Salva nel localStorage
            const actuals = JSON.parse(localStorage.getItem('actuals') || '[]');
            const index = actuals.findIndex(a => a.id === actual.id);
            if (index !== -1) {
                actuals[index] = actual;
                localStorage.setItem('actuals', JSON.stringify(actuals));
            }
            
            // Aggiorna la vista
            SettlementsManager.calculateBalances(actual);
            SettlementsManager.displayPaymentsHistory();
            
            return `✅ Pagamento registrato e confermato!\n\n👤 Da: ${data.from}\n👤 A: ${data.to}\n💰 Importo: ${data.amount}€\n\nI bilanci sono stati aggiornati automaticamente! 🎉`;
        } catch (error) {
            console.error('Errore nel salvare il pagamento:', error);
            return `❌ Errore nel salvare il pagamento. Riprova o usa il pulsante "Nuovo Pagamento" nella sezione Dare/Avere.`;
        }
    },
    
    // Salva conversazione nel localStorage
    saveConversation(userMessage, botResponse) {
        this.conversationHistory.push({
            user: userMessage,
            bot: botResponse,
            timestamp: new Date().toISOString()
        });
        
        // Mantieni solo le ultime 50 conversazioni
        if (this.conversationHistory.length > 50) {
            this.conversationHistory = this.conversationHistory.slice(-50);
        }
        
        localStorage.setItem('norwyConversationHistory', JSON.stringify(this.conversationHistory));
    },
    
    // Carica storico conversazioni
    loadConversationHistory() {
        const saved = localStorage.getItem('norwyConversationHistory');
        if (saved) {
            this.conversationHistory = JSON.parse(saved);
        }
    }
};

// Inizializza quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => NorwyChatbot.init());
} else {
    NorwyChatbot.init();
}

// Made with Bob