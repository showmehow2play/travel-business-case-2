// ===== Accommodation Comparison Manager =====
// Gestisce il confronto tra opzioni di alloggio con analisi pro/contro e generazione sondaggio WhatsApp

const AccommodationComparison = {
    currentStep: 1,
    groupComposition: {
        couples: 0,
        singleMen: 0,
        singleWomen: 0,
        characteristics: [],
        notes: ''
    },
    selectedOptions: [],
    selectedCriteria: [],

    // Inizializza il modal di confronto
    init() {
        this.setupEventListeners();
    },

    // Configura gli event listeners
    setupEventListeners() {
        // Pulsante per aprire il confronto
        const openBtn = document.getElementById('openComparisonBtn');
        if (openBtn) {
            openBtn.addEventListener('click', () => this.openComparisonModal());
        }

        // Pulsanti di navigazione
        document.getElementById('comparisonNextStep1')?.addEventListener('click', () => this.goToStep2());
        document.getElementById('comparisonBackStep2')?.addEventListener('click', () => this.goToStep1());
        document.getElementById('comparisonNextStep2')?.addEventListener('click', () => this.generateComparison());
        document.getElementById('comparisonBackStep3')?.addEventListener('click', () => this.goToStep2());
        
        // Pulsanti chiudi modal
        document.getElementById('closeComparisonModal')?.addEventListener('click', () => this.closeComparisonModal());
        document.getElementById('closeComparisonModal2')?.addEventListener('click', () => this.closeComparisonModal());
        
        // Pulsanti +/- per composizione gruppo
        document.getElementById('couplesPlus')?.addEventListener('click', () => this.adjustCount('couples', 1));
        document.getElementById('couplesMinus')?.addEventListener('click', () => this.adjustCount('couples', -1));
        document.getElementById('singleMenPlus')?.addEventListener('click', () => this.adjustCount('singleMen', 1));
        document.getElementById('singleMenMinus')?.addEventListener('click', () => this.adjustCount('singleMen', -1));
        document.getElementById('singleWomenPlus')?.addEventListener('click', () => this.adjustCount('singleWomen', 1));
        document.getElementById('singleWomenMinus')?.addEventListener('click', () => this.adjustCount('singleWomen', -1));

        // Pulsante copia WhatsApp
        document.getElementById('copyWhatsAppBtn')?.addEventListener('click', () => this.copyWhatsAppText());

        // Click fuori dal modal per chiudere
        document.getElementById('accommodationComparisonModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'accommodationComparisonModal') {
                this.closeComparisonModal();
            }
        });
    },

    // Apre il modal di confronto
    openComparisonModal() {
        const modal = document.getElementById('accommodationComparisonModal');
        if (modal) {
            modal.style.display = 'flex';
            this.currentStep = 1;
            this.showStep(1);
            this.loadGroupComposition();
            // Forza aggiornamento summary per mostrare validazione
            this.updateGroupSummary();
        }
    },

    // Chiude il modal
    closeComparisonModal() {
        const modal = document.getElementById('accommodationComparisonModal');
        if (modal) {
            modal.style.display = 'none';
            // Reset allo step 1 per la prossima apertura
            this.currentStep = 1;
            this.showStep(1);
        }
    },

    // Mostra uno step specifico
    showStep(step) {
        document.querySelectorAll('.comparison-step').forEach(el => {
            el.style.display = 'none';
        });
        const stepEl = document.getElementById(`comparisonStep${step}`);
        if (stepEl) {
            stepEl.style.display = 'block';
        }
        this.currentStep = step;
    },

    // Naviga allo step 2
    goToStep2() {
        this.saveGroupComposition();
        this.loadAccommodationOptions();
        this.showStep(2);
    },
    
    // Ottieni il numero di partecipanti dallo scenario
    getScenarioParticipantsCount() {
        const participantsInput = document.getElementById('participants');
        if (participantsInput) {
            return parseInt(participantsInput.value) || 0;
        }
        return 0;
    },
    
    // Genera descrizione automatica dal link
    generateDescriptionFromLink(link, name) {
        if (!link) {
            return `Per maggiori dettagli su "${name}", visita il link fornito.`;
        }
        
        // Estrai informazioni dal link se possibile
        let description = '';
        
        // Identifica il tipo di piattaforma
        if (link.includes('airbnb')) {
            description = `🏠 Alloggio su Airbnb`;
        } else if (link.includes('booking')) {
            description = `🏨 Alloggio su Booking.com`;
        } else if (link.includes('vrbo') || link.includes('homeaway')) {
            description = `🏡 Alloggio su VRBO`;
        } else {
            description = `🔗 Alloggio disponibile online`;
        }
        
        // Prova a estrarre la città dal link
        const cityMatch = link.match(/\/([A-Za-z-]+)(?:\/|$)/i);
        if (cityMatch && cityMatch[1] && cityMatch[1].length > 2) {
            const city = cityMatch[1].replace(/-/g, ' ');
            description += ` - ${city}`;
        }
        
        description += `\n\n📋 Per dettagli completi (numero camere, servizi, foto, recensioni), visita:\n🔗 ${link}`;
        
        return description;
    },

    // Naviga allo step 1
    goToStep1() {
        this.showStep(1);
    },

    // Carica la composizione del gruppo
    loadGroupComposition() {
        document.getElementById('couplesCount').textContent = this.groupComposition.couples;
        document.getElementById('singleMenCount').textContent = this.groupComposition.singleMen;
        document.getElementById('singleWomenCount').textContent = this.groupComposition.singleWomen;
        document.getElementById('groupNotes').value = this.groupComposition.notes;
        this.updateGroupSummary();
    },

    // Salva la composizione del gruppo
    saveGroupComposition() {
        this.groupComposition.couples = parseInt(document.getElementById('couplesCount').textContent) || 0;
        this.groupComposition.singleMen = parseInt(document.getElementById('singleMenCount').textContent) || 0;
        this.groupComposition.singleWomen = parseInt(document.getElementById('singleWomenCount').textContent) || 0;
        this.groupComposition.notes = document.getElementById('groupNotes').value;
        
        // Salva caratteristiche selezionate
        this.groupComposition.characteristics = [];
        document.querySelectorAll('.group-characteristic:checked').forEach(checkbox => {
            this.groupComposition.characteristics.push(checkbox.value);
        });
    },

    // Aggiusta il contatore
    adjustCount(type, delta) {
        const countEl = document.getElementById(`${type}Count`);
        if (countEl) {
            let current = parseInt(countEl.textContent) || 0;
            current = Math.max(0, current + delta);
            countEl.textContent = current;
            this.updateGroupSummary();
        }
    },

    // Aggiorna il riepilogo del gruppo
    updateGroupSummary() {
        const couples = parseInt(document.getElementById('couplesCount').textContent) || 0;
        const singleMen = parseInt(document.getElementById('singleMenCount').textContent) || 0;
        const singleWomen = parseInt(document.getElementById('singleWomenCount').textContent) || 0;
        
        const total = (couples * 2) + singleMen + singleWomen;
        const singles = singleMen + singleWomen;
        
        // Ottieni partecipanti scenario per validazione
        const scenarioParticipants = this.getScenarioParticipantsCount();
        const isValid = scenarioParticipants === 0 || total === scenarioParticipants;
        
        const summaryEl = document.getElementById('groupSummary');
        if (summaryEl) {
            let html = `
                • Totale partecipanti: <strong style="color: ${isValid ? 'inherit' : '#dc2626'}">${total} persone</strong>
            `;
            
            if (scenarioParticipants > 0) {
                html += `<br>• Partecipanti scenario: <strong>${scenarioParticipants} persone</strong>`;
                if (!isValid && total > 0) {
                    html += `<br><span style="color: #dc2626; font-weight: 600;">⚠️ Il totale deve corrispondere ai partecipanti dello scenario!</span>`;
                } else if (isValid && total > 0) {
                    html += `<br><span style="color: #16a34a; font-weight: 600;">✅ Numero corretto!</span>`;
                }
            }
            
            html += `<br>`;
            if (couples > 0) {
                html += `• ${couples} ${couples === 1 ? 'coppia' : 'coppie'} (${couples * 2} persone)<br>`;
            }
            if (singles > 0) {
                html += `• ${singles} single (${singleMen} ${singleMen === 1 ? 'uomo' : 'uomini'}, ${singleWomen} ${singleWomen === 1 ? 'donna' : 'donne'})`;
            }
            
            summaryEl.innerHTML = html;
        }
        
        // Abilita/disabilita pulsante Avanti
        const nextBtn = document.getElementById('comparisonNextStep1');
        if (nextBtn) {
            if (total === 0) {
                nextBtn.disabled = true;
                nextBtn.style.opacity = '0.5';
                nextBtn.style.cursor = 'not-allowed';
            } else if (!isValid) {
                nextBtn.disabled = true;
                nextBtn.style.opacity = '0.5';
                nextBtn.style.cursor = 'not-allowed';
            } else {
                nextBtn.disabled = false;
                nextBtn.style.opacity = '1';
                nextBtn.style.cursor = 'pointer';
            }
        }
    },

    // Carica le opzioni di alloggio disponibili
    loadAccommodationOptions() {
        const container = document.getElementById('accommodationOptionsCheckboxes');
        if (!container) return;

        container.innerHTML = '';
        
        for (let i = 0; i < 5; i++) {
            const nameInput = document.querySelector(`#accommodationOptions .option-name[data-index="${i}"]`);
            const priceInput = document.querySelector(`#accommodationOptions .option-price[data-index="${i}"]`);
            const linkInput = document.querySelector(`#accommodationOptions .option-link[data-index="${i}"]`);
            
            const name = nameInput?.value || `Opzione ${i + 1}`;
            const price = parseFloat(priceInput?.value) || 0;
            const link = linkInput?.value || '';
            
            if (name && price > 0) {
                const div = document.createElement('div');
                div.className = 'comparison-option-item';
                div.innerHTML = `
                    <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background: var(--bg-secondary); border-radius: var(--radius-md); cursor: pointer; transition: var(--transition-base);">
                        <input type="checkbox" class="accommodation-option-checkbox" value="${i}" data-name="${name}" data-price="${price}" data-link="${link}">
                        <span style="flex: 1; font-weight: 500;">${name}</span>
                        <span style="color: var(--primary-color); font-weight: 600;">€${price.toFixed(2)}</span>
                    </label>
                `;
                container.appendChild(div);
            }
        }
    },

    // Genera il confronto
    generateComparison() {
        // Raccogli opzioni selezionate
        this.selectedOptions = [];
        document.querySelectorAll('.accommodation-option-checkbox:checked').forEach(checkbox => {
            const index = parseInt(checkbox.value);
            const link = checkbox.dataset.link;
            
            // Genera descrizione automatica dal link
            const description = this.generateDescriptionFromLink(link, checkbox.dataset.name);
            
            this.selectedOptions.push({
                index: index,
                name: checkbox.dataset.name,
                price: parseFloat(checkbox.dataset.price),
                link: link,
                description: description
            });
        });

        if (this.selectedOptions.length < 2) {
            alert('⚠️ Seleziona almeno 2 appartamenti da confrontare');
            return;
        }

        // Raccogli criteri selezionati
        this.selectedCriteria = [];
        document.querySelectorAll('.comparison-criteria:checked').forEach(checkbox => {
            this.selectedCriteria.push(checkbox.value);
        });

        if (this.selectedCriteria.length === 0) {
            alert('⚠️ Seleziona almeno un criterio di confronto');
            return;
        }

        // Genera la tabella di confronto
        this.renderComparisonTable();
        
        // Genera analisi pro/contro
        this.renderProsCons();
        
        // Genera raccomandazione
        this.renderRecommendation();
        
        // Genera sondaggio WhatsApp
        this.renderWhatsAppSurvey();
        
        // Mostra step 3
        this.showStep(3);
    },

    // Renderizza la tabella di confronto
    renderComparisonTable() {
        const container = document.getElementById('comparisonTableContainer');
        if (!container) return;

        const totalPeople = (this.groupComposition.couples * 2) + this.groupComposition.singleMen + this.groupComposition.singleWomen;
        
        let html = '<table class="comparison-table">';
        html += '<thead><tr><th>Criterio</th>';
        
        this.selectedOptions.forEach(opt => {
            html += `<th>${opt.name}</th>`;
        });
        html += '</tr></thead><tbody>';

        // Riga prezzo totale
        if (this.selectedCriteria.includes('price')) {
            html += '<tr><td><strong>💰 Prezzo Totale</strong></td>';
            const minPrice = Math.min(...this.selectedOptions.map(o => o.price));
            this.selectedOptions.forEach(opt => {
                const isBest = opt.price === minPrice;
                html += `<td class="${isBest ? 'best-option' : ''}">€${opt.price.toFixed(2)}${isBest ? ' 🏆' : ''}</td>`;
            });
            html += '</tr>';

            // Riga prezzo per persona
            html += '<tr><td><strong>💵 Prezzo/Persona</strong></td>';
            const minPricePerPerson = Math.min(...this.selectedOptions.map(o => o.price / totalPeople));
            this.selectedOptions.forEach(opt => {
                const pricePerPerson = opt.price / totalPeople;
                const isBest = Math.abs(pricePerPerson - minPricePerPerson) < 0.01;
                html += `<td class="${isBest ? 'best-option' : ''}">€${pricePerPerson.toFixed(2)}${isBest ? ' 🏆' : ''}</td>`;
            });
            html += '</tr>';
        }

        // Riga link
        html += '<tr><td><strong>🔗 Link</strong></td>';
        this.selectedOptions.forEach(opt => {
            if (opt.link) {
                html += `<td><button class="btn-link-small" onclick="window.open('${opt.link}', '_blank')">Apri 🔗</button></td>`;
            } else {
                html += '<td>-</td>';
            }
        });
        html += '</tr>';

        // Riga idoneità gruppo
        if (this.selectedCriteria.includes('composition')) {
            html += '<tr><td><strong>👥 Idoneità Gruppo</strong></td>';
            const suitabilities = this.selectedOptions.map(opt => this.calculateSuitability(opt, totalPeople));
            const maxSuitability = Math.max(...suitabilities);
            
            this.selectedOptions.forEach((opt, idx) => {
                const suitability = suitabilities[idx];
                const isBest = suitability === maxSuitability;
                let label = '';
                if (suitability >= 80) label = '✅ Ottimo';
                else if (suitability >= 60) label = '✅ Buono';
                else if (suitability >= 40) label = '⚠️ Accettabile';
                else label = '❌ Limitato';
                
                html += `<td class="${isBest ? 'best-option' : ''}">${label}${isBest ? ' 🏆' : ''}</td>`;
            });
            html += '</tr>';
        }

        html += '</tbody></table>';
        container.innerHTML = html;
    },

    // Calcola l'idoneità dell'alloggio per il gruppo
    calculateSuitability(option, totalPeople) {
        let score = 100;
        
        // Penalità per prezzo troppo basso (potrebbe essere piccolo)
        const avgPrice = this.selectedOptions.reduce((sum, o) => sum + o.price, 0) / this.selectedOptions.length;
        if (option.price < avgPrice * 0.7) {
            score -= 20;
        }
        
        // Bonus per prezzo medio-alto (probabilmente più spazioso)
        if (option.price > avgPrice * 1.1) {
            score += 10;
        }
        
        // Penalità se ci sono molte persone e prezzo basso
        if (totalPeople > 4 && option.price < avgPrice) {
            score -= 15;
        }
        
        return Math.max(0, Math.min(100, score));
    },

    // Renderizza pro e contro
    renderProsCons() {
        const container = document.getElementById('prosConsContainer');
        if (!container) return;

        const totalPeople = (this.groupComposition.couples * 2) + this.groupComposition.singleMen + this.groupComposition.singleWomen;
        const avgPrice = this.selectedOptions.reduce((sum, o) => sum + o.price, 0) / this.selectedOptions.length;

        let html = '';
        
        this.selectedOptions.forEach(opt => {
            // Calcola caratteristiche
            const pricePerPerson = opt.price / totalPeople;
            const priceDiff = opt.price - avgPrice;
            const priceCategory = priceDiff < -50 ? 'Economico' : priceDiff < 0 ? 'Sotto la media' : priceDiff > 50 ? 'Premium' : 'Nella media';
            const suitability = this.calculateSuitability(opt, totalPeople);
            const suitabilityLabel = suitability >= 80 ? 'Ottimo' : suitability >= 60 ? 'Buono' : suitability >= 40 ? 'Accettabile' : 'Limitato';
            
            // Summary caratteristiche
            const summaryHtml = `
                <div class="option-summary">
                    <div class="summary-grid">
                        <div class="summary-item">
                            <span class="summary-label">💰 Categoria Prezzo:</span>
                            <span class="summary-value">${priceCategory}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">💵 Costo per Persona:</span>
                            <span class="summary-value">€${pricePerPerson.toFixed(2)}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">👥 Idoneità Gruppo:</span>
                            <span class="summary-value">${suitabilityLabel} (${suitability}%)</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">📊 Rispetto alla Media:</span>
                            <span class="summary-value">${priceDiff >= 0 ? '+' : ''}€${priceDiff.toFixed(0)}</span>
                        </div>
                    </div>
                </div>
            `;
            
            const pros = [];
            const cons = [];
            
            // Analisi prezzo
            if (this.selectedCriteria.includes('price')) {
                const priceDiff = opt.price - avgPrice;
                if (priceDiff < -50) {
                    pros.push(`Prezzo molto economico (-€${Math.abs(priceDiff).toFixed(0)} vs media)`);
                } else if (priceDiff < 0) {
                    pros.push(`Prezzo sotto la media (-€${Math.abs(priceDiff).toFixed(0)})`);
                } else if (priceDiff > 50) {
                    cons.push(`Prezzo sopra la media (+€${priceDiff.toFixed(0)})`);
                }
                
                if (opt.price === Math.min(...this.selectedOptions.map(o => o.price))) {
                    pros.push('Ottimo rapporto qualità/prezzo');
                }
            }
            
            // Analisi composizione gruppo
            if (this.selectedCriteria.includes('composition')) {
                if (opt.price > avgPrice * 1.1) {
                    pros.push(`Spazioso, ideale per ${totalPeople} persone`);
                    if (this.groupComposition.singleMen > 0 && this.groupComposition.singleWomen > 0) {
                        pros.push('Camere sufficienti per coppie e single separati');
                    }
                    pros.push('Adatto alla composizione del gruppo');
                } else if (opt.price < avgPrice * 0.8 && totalPeople > 4) {
                    cons.push(`Potrebbe essere stretto per ${totalPeople} persone`);
                    if (this.groupComposition.singleMen > 0 || this.groupComposition.singleWomen > 0) {
                        cons.push('Poche camere per garantire privacy ai single');
                    }
                } else {
                    pros.push('Adeguato per il gruppo');
                    pros.push('Buon compromesso spazio/prezzo');
                }
            }
            
            // Se non ci sono pro o contro, aggiungi placeholder
            if (pros.length === 0) {
                pros.push('Opzione valida');
            }
            if (cons.length === 0) {
                cons.push('Nessun particolare svantaggio');
            }
            
            // Descrizione breve (se presente) con link cliccabile
            let descriptionHtml = '';
            if (opt.description) {
                // Converti il link in HTML cliccabile
                let descriptionWithLink = opt.description;
                if (opt.link) {
                    // Sostituisci il link testuale con un tag <a>
                    descriptionWithLink = opt.description.replace(
                        opt.link,
                        `<a href="${opt.link}" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline; font-weight: 600;">${opt.link}</a>`
                    );
                }
                
                descriptionHtml = `
                    <div class="option-description-box" style="background: #f8f9fa; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; border-left: 4px solid var(--primary-color);">
                        <strong style="display: block; margin-bottom: 0.5rem; color: var(--primary-color);">📝 Descrizione:</strong>
                        <p style="margin: 0; line-height: 1.6; color: var(--text-primary); white-space: pre-line;">${descriptionWithLink}</p>
                    </div>
                `;
            }
            
            html += `
                <div class="pros-cons-card">
                    <h4>🏠 ${opt.name}</h4>
                    ${descriptionHtml}
                    ${summaryHtml}
                    <div class="pros-section">
                        <strong>✅ PRO:</strong>
                        <ul>
                            ${pros.map(p => `<li>${p}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="cons-section">
                        <strong>❌ CONTRO:</strong>
                        <ul>
                            ${cons.map(c => `<li>${c}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    },

    // Renderizza la raccomandazione
    renderRecommendation() {
        const container = document.getElementById('recommendationContainer');
        if (!container) return;

        const totalPeople = (this.groupComposition.couples * 2) + this.groupComposition.singleMen + this.groupComposition.singleWomen;
        
        // Calcola punteggio per ogni opzione con priorità all'idoneità gruppo
        const scores = this.selectedOptions.map(opt => {
            let score = 0;
            const avgPrice = this.selectedOptions.reduce((sum, o) => sum + o.price, 0) / this.selectedOptions.length;
            const suitability = this.calculateSuitability(opt, totalPeople);
            
            // PRIORITÀ 1: Idoneità gruppo (peso 50%)
            if (this.selectedCriteria.includes('composition')) {
                score += suitability * 0.5; // Max 50 punti (priorità massima)
                
                // Bonus per caratteristiche gruppo specifiche
                if (this.groupComposition.characteristics.length > 0) {
                    // Bonus se l'appartamento è spazioso (prezzo alto = più spazio)
                    if (opt.price > avgPrice * 1.1) {
                        score += 10; // Bonus per spazio extra
                    }
                    
                    // Bonus per camere separate se necessario
                    if (this.groupComposition.characteristics.includes('separate_rooms')) {
                        if (this.groupComposition.singleMen > 0 && this.groupComposition.singleWomen > 0) {
                            score += 15; // Bonus importante per privacy
                        }
                    }
                    
                    // Bonus per accessibilità
                    if (this.groupComposition.characteristics.includes('accessibility')) {
                        score += 10;
                    }
                    
                    // Bonus per bambini
                    if (this.groupComposition.characteristics.includes('children')) {
                        if (opt.price > avgPrice) {
                            score += 8; // Spazio extra per bambini
                        }
                    }
                }
            }
            
            // PRIORITÀ 2: Prezzo (peso 30%)
            if (this.selectedCriteria.includes('price')) {
                const priceDiff = opt.price - avgPrice;
                score += (avgPrice - opt.price) / avgPrice * 30; // Max 30 punti
                
                // Bonus per miglior prezzo assoluto
                if (opt.price === Math.min(...this.selectedOptions.map(o => o.price))) {
                    score += 10;
                }
            }
            
            // PRIORITÀ 3: Caratteristiche (peso 20%)
            if (this.selectedCriteria.includes('features')) {
                // Valuta in base al rapporto qualità/prezzo
                if (opt.price > avgPrice * 0.9 && opt.price < avgPrice * 1.1) {
                    score += 20; // Bonus per prezzo equilibrato
                } else if (opt.price > avgPrice * 1.2) {
                    score += 15; // Presumibilmente più caratteristiche
                }
            }
            
            return { option: opt, score, suitability };
        });
        
        // Trova la migliore
        scores.sort((a, b) => b.score - a.score);
        const best = scores[0].option;
        
        const reasons = [];
        const avgPrice = this.selectedOptions.reduce((sum, o) => sum + o.price, 0) / this.selectedOptions.length;
        
        if (best.price < avgPrice) {
            const savings = avgPrice - best.price;
            const savingsPercent = (savings / avgPrice * 100).toFixed(0);
            reasons.push(`Prezzo più basso del ${savingsPercent}% rispetto alla media`);
        }
        
        if (this.selectedCriteria.includes('composition')) {
            if (best.price > avgPrice * 1.1) {
                reasons.push('Ideale per la composizione del gruppo');
                reasons.push('Spazio sufficiente per garantire privacy');
                if (this.groupComposition.singleMen > 0 && this.groupComposition.singleWomen > 0) {
                    reasons.push('Camere separate per single uomini e donne');
                }
            } else {
                reasons.push('Buon compromesso tra prezzo e spazio');
            }
        }
        
        const maxPrice = Math.max(...this.selectedOptions.map(o => o.price));
        if (best.price < maxPrice) {
            const savings = maxPrice - best.price;
            reasons.push(`Risparmio di €${savings.toFixed(0)} rispetto all'opzione più costosa`);
        }
        
        container.innerHTML = `
            <div class="recommendation-card">
                <p style="margin-bottom: 1rem;">Basato sui criteri selezionati, l'opzione migliore è:</p>
                <div class="recommended-option">
                    🏆 ${best.name} (€${best.price.toFixed(2)})
                </div>
                <div style="margin-top: 1rem;">
                    <strong>Motivi:</strong>
                    <ul>
                        ${reasons.map(r => `<li>${r}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    },

    // Renderizza il sondaggio WhatsApp
    renderWhatsAppSurvey() {
        const container = document.getElementById('whatsappSurveyContainer');
        if (!container) return;

        const totalPeople = (this.groupComposition.couples * 2) + this.groupComposition.singleMen + this.groupComposition.singleWomen;
        const avgPrice = this.selectedOptions.reduce((sum, o) => sum + o.price, 0) / this.selectedOptions.length;
        
        // Calcola punteggio per trovare il consigliato
        const scores = this.selectedOptions.map(opt => {
            let score = 50;
            if (this.selectedCriteria.includes('price')) {
                score += (avgPrice - opt.price) / avgPrice * 30;
            }
            if (this.selectedCriteria.includes('composition')) {
                score += this.calculateSuitability(opt, totalPeople) * 0.2;
            }
            return { option: opt, score };
        });
        scores.sort((a, b) => b.score - a.score);
        const recommended = scores[0].option;

        let text = `🏠 *SONDAGGIO ALLOGGIO - ${document.getElementById('destination')?.value || 'Viaggio'}*\n\n`;
        text += `Ciao a tutti! 👋\n`;
        text += `Ho confrontato ${this.selectedOptions.length} opzioni per l'alloggio.\n`;
        text += `Gruppo: `;
        
        const groupParts = [];
        if (this.groupComposition.couples > 0) {
            groupParts.push(`${this.groupComposition.couples} ${this.groupComposition.couples === 1 ? 'coppia' : 'coppie'}`);
        }
        if (this.groupComposition.singleMen > 0) {
            groupParts.push(`${this.groupComposition.singleMen} single ${this.groupComposition.singleMen === 1 ? 'uomo' : 'uomini'}`);
        }
        if (this.groupComposition.singleWomen > 0) {
            groupParts.push(`${this.groupComposition.singleWomen} single ${this.groupComposition.singleWomen === 1 ? 'donna' : 'donne'}`);
        }
        text += groupParts.join(' + ') + ` (${totalPeople} pax)\n\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        this.selectedOptions.forEach((opt, idx) => {
            const isRecommended = opt.name === recommended.name;
            text += `*OPZIONE ${idx + 1}: ${opt.name}*${isRecommended ? ' 🌟 CONSIGLIATO' : ''}\n`;
            text += `💰 Prezzo: €${opt.price.toFixed(2)} (€${(opt.price / totalPeople).toFixed(2)}/persona)\n`;
            text += `🔗 Link: ${opt.link || '[da inserire]'}\n\n`;
            
            // Pro
            text += `✅ PRO:\n`;
            const priceDiff = opt.price - avgPrice;
            if (priceDiff < 0) {
                text += `• Prezzo sotto la media (-€${Math.abs(priceDiff).toFixed(0)})\n`;
            }
            if (opt.price === Math.min(...this.selectedOptions.map(o => o.price))) {
                text += `• Ottimo rapporto qualità/prezzo\n`;
            }
            if (opt.price > avgPrice * 1.1) {
                text += `• Spazioso, ideale per ${totalPeople} persone\n`;
                text += `• Adatto alla composizione del gruppo\n`;
            } else if (opt.price >= avgPrice * 0.9) {
                text += `• Buon compromesso spazio/prezzo\n`;
            }
            
            // Contro
            text += `\n❌ CONTRO:\n`;
            if (priceDiff > 50) {
                text += `• Prezzo sopra la media (+€${priceDiff.toFixed(0)})\n`;
            }
            if (opt.price < avgPrice * 0.8 && totalPeople > 4) {
                text += `• Potrebbe essere stretto per ${totalPeople} persone\n`;
            }
            if (opt.price < avgPrice * 0.8 && (this.groupComposition.singleMen > 0 || this.groupComposition.singleWomen > 0)) {
                text += `• Poche camere per garantire privacy ai single\n`;
            }
            if (priceDiff <= 0 && opt.price >= avgPrice * 0.9) {
                text += `• Nessun particolare svantaggio\n`;
            }
            
            text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        });

        text += `💡 *RACCOMANDAZIONE*: ${recommended.name}\n`;
        const reasons = [];
        if (recommended.price < avgPrice) {
            reasons.push('Miglior rapporto qualità/prezzo');
        }
        if (recommended.price > avgPrice * 1.1) {
            reasons.push('Ideale per la composizione del gruppo');
            reasons.push('Spazio sufficiente per garantire privacy');
        }
        if (reasons.length > 0) {
            text += reasons.join(', ') + '.\n\n';
        }
        
        text += `📊 *Votate la vostra preferenza:*\n`;
        this.selectedOptions.forEach((opt, idx) => {
            text += `${idx + 1}️⃣ ${opt.name}\n`;
        });

        container.innerHTML = `<pre class="whatsapp-text">${text}</pre>`;
        
        // Salva il testo per la copia
        this.whatsappText = text;
    },

    // Copia il testo WhatsApp negli appunti
    async copyWhatsAppText() {
        if (!this.whatsappText) return;
        
        try {
            await navigator.clipboard.writeText(this.whatsappText);
            const btn = document.getElementById('copyWhatsAppBtn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '✅ Testo copiato!';
            btn.style.background = 'var(--success-color)';
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
            }, 2000);
        } catch (err) {
            console.error('Errore nella copia:', err);
            alert('❌ Errore nella copia del testo. Copia manualmente dalla casella sopra.');
        }
    }
};

// Inizializza quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    AccommodationComparison.init();
});

// Made with Bob