// ===== Export Manager =====
// Gestisce l'esportazione dei dati in vari formati

const ExportManager = {
    // Esporta in JSON
    exportJSON() {
        const data = StorageManager.exportToJSON();
        if (!data) {
            this.showError('Nessun dato da esportare');
            return;
        }

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `business-case-viaggi-${this.getDateString()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showSuccess('Dati esportati in JSON');
    },

    // Esporta in CSV/Excel
    exportCSV() {
        const scenarios = StorageManager.getScenarios();
        if (scenarios.length === 0) {
            this.showError('Nessuno scenario da esportare');
            return;
        }

        const wb = XLSX.utils.book_new();

        // Per ogni scenario, crea un foglio dettagliato
        scenarios.forEach((scenario, index) => {
            const sheetName = this.sanitizeSheetName(scenario.name || `Scenario ${index + 1}`);
            
            // Crea il foglio dettagliato per lo scenario
            const detailData = this.createDetailedScenarioSheet(scenario);
            const ws = XLSX.utils.aoa_to_sheet(detailData);
            
            // Applica formattazione
            this.applyExcelFormatting(ws, detailData);
            
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
            
            // Aggiungi foglio partecipanti per ogni scenario
            const participantsData = this.createParticipantsSheet(scenario);
            const wsParticipants = XLSX.utils.aoa_to_sheet(participantsData);
            XLSX.utils.book_append_sheet(wb, wsParticipants, `${sheetName.substring(0, 20)}-Partecipanti`);
        });

        // Aggiungi foglio riepilogo
        const summaryData = this.createSummarySheet(scenarios);
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Riepilogo');

        // Scarica il file
        XLSX.writeFile(wb, `business-case-viaggi-${this.getDateString()}.xlsx`);

        this.showSuccess('Dati esportati in Excel dettagliato');
    },

    // Crea foglio dettagliato per scenario (stile Norway 2027)
    createDetailedScenarioSheet(scenario) {
        const data = [];
        const numParticipants = scenario.participants.length || 1;
        
        // Header
        data.push(['Categorie', 'Spesa', 'Descrizione', 'link', 'Costo', 'Valuta', 'Chi ha speso', 'Seleziona', 'Costo', 'Costo a testa', '', 'Bilancio totale', 'A testa', '', 'Partecipanti']);
        
        let totalCost = 0;
        let rowIndex = 1;

        // CASA - Opzioni alloggio
        if (scenario.accommodationOptions && scenario.accommodationOptions.length > 0) {
            scenario.accommodationOptions.forEach((option, idx) => {
                if (option.name || option.price > 0) {
                    const isSelected = scenario.selectedAccommodationIndex === idx ? 'x' : '';
                    const cost = option.price || 0;
                    const costPerPerson = cost / numParticipants;
                    
                    data.push([
                        rowIndex === 1 ? 'Generali' : 'Viaggio',
                        'CASA',
                        option.name || `Opzione ${idx + 1}`,
                        option.link || '',
                        cost,
                        'EUR',
                        '',
                        isSelected,
                        isSelected ? cost : '',
                        isSelected ? costPerPerson : '',
                        '',
                        rowIndex === 1 ? ScenarioManager.calculateTotal(scenario.expenses) : '',
                        rowIndex === 1 ? ScenarioManager.calculateTotal(scenario.expenses) / numParticipants : '',
                        '',
                        rowIndex === 1 ? numParticipants : ''
                    ]);
                    
                    if (isSelected) totalCost += cost;
                    rowIndex++;
                }
            });
        }

        // VOLI
        if (scenario.expenses.transport > 0 || scenario.flightDeparture || scenario.flightArrival) {
            data.push([
                'Viaggio',
                'VOLI',
                scenario.flightDeparture && scenario.flightArrival ?
                    `${scenario.flightDeparture} → ${scenario.flightArrival}` : 'Volo',
                '',
                scenario.expenses.transport || 0,
                'EUR',
                '',
                'x',
                scenario.expenses.transport || 0,
                (scenario.expenses.transport || 0) / numParticipants,
                '',
                '',
                '',
                '',
                ''
            ]);
            totalCost += scenario.expenses.transport || 0;
        }

        // VITTO
        if (scenario.expenses.food > 0) {
            data.push([
                'Generali',
                'VITTO',
                'Spese vitto',
                '',
                scenario.expenses.food,
                'EUR',
                '',
                'x',
                scenario.expenses.food,
                scenario.expenses.food / numParticipants,
                '',
                '',
                '',
                '',
                ''
            ]);
            totalCost += scenario.expenses.food;
        }

        // AUTO - Opzioni auto
        if (scenario.carOptions && scenario.carOptions.length > 0) {
            scenario.carOptions.forEach((option, idx) => {
                if (option.selected && (option.name || option.price > 0)) {
                    const cost = option.price || 0;
                    data.push([
                        'Auto',
                        `AUTO ${idx + 1}`,
                        option.name || `Auto ${idx + 1}`,
                        option.link || '',
                        cost,
                        'EUR',
                        '',
                        'x',
                        cost,
                        cost / numParticipants,
                        '',
                        '',
                        '',
                        '',
                        ''
                    ]);
                    totalCost += cost;
                }
            });
        }

        // ATTIVITÀ
        if (scenario.expenses.activities > 0) {
            data.push([
                'Generali',
                'ATTIVITÀ',
                'Attività e visite',
                '',
                scenario.expenses.activities,
                'EUR',
                '',
                'x',
                scenario.expenses.activities,
                scenario.expenses.activities / numParticipants,
                '',
                '',
                '',
                '',
                ''
            ]);
            totalCost += scenario.expenses.activities;
        }

        // ALTRO - Spese aggiuntive
        if (scenario.otherOptions && scenario.otherOptions.length > 0) {
            scenario.otherOptions.forEach((option, idx) => {
                if (option.selected && (option.name || option.price > 0)) {
                    const cost = option.price || 0;
                    data.push([
                        'Generali',
                        'ALTRO',
                        option.name || `Spesa ${idx + 1}`,
                        option.note || '',
                        cost,
                        'EUR',
                        '',
                        'x',
                        cost,
                        cost / numParticipants,
                        '',
                        '',
                        '',
                        '',
                        ''
                    ]);
                    totalCost += cost;
                }
            });
        }

        // Riga vuota
        data.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);

        // Totale finale
        const finalTotal = ScenarioManager.calculateTotal(scenario.expenses);
        data.push([
            '',
            'Bilancio totale',
            '',
            finalTotal,
            'EUR',
            '',
            '',
            '',
            finalTotal,
            finalTotal / numParticipants,
            '',
            '',
            '',
            '',
            ''
        ]);

        return data;
    },

    // Crea foglio partecipanti
    createParticipantsSheet(scenario) {
        const data = [];
        const numParticipants = scenario.participants.length;
        
        data.push(['', numParticipants, numParticipants]);
        data.push(['Partecipanti', 'Sicuri', 'conta']);
        
        scenario.participants.forEach((participant, idx) => {
            data.push([participant, 'x', 1]);
        });

        return data;
    },

    // Crea foglio riepilogo
    createSummarySheet(scenarios) {
        const data = [];
        
        data.push(['Nome Scenario', 'Destinazione', 'Data Inizio', 'Data Fine', 'Partecipanti', 'Nomi Partecipanti',
                   'Trasporto (€)', 'Alloggio (€)', 'Vitto (€)', 'Auto (€)', 'Attività (€)', 'Altro (€)',
                   'Totale (€)', 'Costo per Persona (€)', 'Note']);
        
        scenarios.forEach(s => {
            data.push([
                s.name,
                s.destination,
                s.startDate ? ScenarioManager.formatDate(s.startDate) : '',
                s.endDate ? ScenarioManager.formatDate(s.endDate) : '',
                s.participants.length,
                s.participants.join(', '),
                s.expenses.transport || 0,
                s.expenses.accommodation || 0,
                s.expenses.food || 0,
                s.expenses.car || 0,
                s.expenses.activities || 0,
                s.expenses.other || 0,
                ScenarioManager.calculateTotal(s.expenses),
                ScenarioManager.calculateCostPerPerson(s.expenses, s.participants.length),
                s.notes || ''
            ]);
        });

        return data;
    },

    // Sanitizza nome foglio Excel
    sanitizeSheetName(name) {
        // Rimuovi caratteri non validi e limita a 31 caratteri
        return name.replace(/[:\\\/\?\*\[\]]/g, '').substring(0, 31);
    },

    // Applica formattazione Excel
    applyExcelFormatting(ws, data) {
        const range = XLSX.utils.decode_range(ws['!ref']);
        
        // Imposta larghezza colonne
        ws['!cols'] = [
            { wch: 12 }, // Categorie
            { wch: 15 }, // Spesa
            { wch: 30 }, // Descrizione
            { wch: 50 }, // link
            { wch: 10 }, // Costo
            { wch: 8 },  // Valuta
            { wch: 15 }, // Chi ha speso
            { wch: 10 }, // Seleziona
            { wch: 10 }, // Costo
            { wch: 12 }, // Costo a testa
            { wch: 5 },  // Vuoto
            { wch: 15 }, // Bilancio totale
            { wch: 12 }, // A testa
            { wch: 5 },  // Vuoto
            { wch: 12 }  // Partecipanti
        ];
    },

    // Esporta in PDF
    exportPDF() {
        const scenarios = StorageManager.getScenarios();
        if (scenarios.length === 0) {
            this.showError('Nessuno scenario da esportare');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let yPos = 20;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        const lineHeight = 7;

        // Titolo
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('Business Case Viaggi', margin, yPos);
        yPos += 10;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Report generato il ${new Date().toLocaleDateString('it-IT')}`, margin, yPos);
        yPos += 15;

        // Statistiche generali
        const stats = StorageManager.getStats();
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Statistiche Generali', margin, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Scenari totali: ${stats.totalScenarios}`, margin, yPos);
        yPos += lineHeight;
        doc.text(`Spesa media: ${ScenarioManager.formatCurrency(stats.avgCost)}`, margin, yPos);
        yPos += lineHeight;
        doc.text(`Partecipanti totali: ${stats.totalParticipants}`, margin, yPos);
        yPos += lineHeight;
        doc.text(`Destinazioni uniche: ${stats.destinations}`, margin, yPos);
        yPos += 15;

        // Dettagli scenari
        scenarios.forEach((scenario, index) => {
            // Controlla se serve una nuova pagina
            if (yPos > pageHeight - 60) {
                doc.addPage();
                yPos = 20;
            }

            // Titolo scenario
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(`${index + 1}. ${scenario.name}`, margin, yPos);
            yPos += 8;

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');

            // Informazioni base
            doc.text(`Destinazione: ${scenario.destination}`, margin + 5, yPos);
            yPos += lineHeight;

            if (scenario.startDate && scenario.endDate) {
                const duration = ScenarioManager.calculateDuration(scenario.startDate, scenario.endDate);
                doc.text(`Periodo: ${ScenarioManager.formatDate(scenario.startDate)} - ${ScenarioManager.formatDate(scenario.endDate)} (${duration} giorni)`, margin + 5, yPos);
                yPos += lineHeight;
            }

            doc.text(`Partecipanti (${scenario.participants.length}): ${scenario.participants.join(', ') || 'Nessuno'}`, margin + 5, yPos);
            yPos += lineHeight + 2;

            // Spese
            doc.setFont(undefined, 'bold');
            doc.text('Spese:', margin + 5, yPos);
            yPos += lineHeight;
            doc.setFont(undefined, 'normal');

            const labels = ScenarioManager.getCategoryLabels();
            for (const [category, amount] of Object.entries(scenario.expenses)) {
                if (amount > 0) {
                    doc.text(`  ${labels[category]}: ${ScenarioManager.formatCurrency(amount)}`, margin + 5, yPos);
                    yPos += lineHeight;
                }
            }

            // Totali
            yPos += 2;
            doc.setFont(undefined, 'bold');
            const total = ScenarioManager.calculateTotal(scenario.expenses);
            const costPerPerson = ScenarioManager.calculateCostPerPerson(scenario.expenses, scenario.participants.length);
            
            doc.text(`Totale: ${ScenarioManager.formatCurrency(total)}`, margin + 5, yPos);
            yPos += lineHeight;
            doc.text(`Costo per persona: ${ScenarioManager.formatCurrency(costPerPerson)}`, margin + 5, yPos);
            yPos += lineHeight + 5;

            // Note
            if (scenario.notes) {
                doc.setFont(undefined, 'italic');
                doc.setFontSize(9);
                const noteLines = doc.splitTextToSize(`Note: ${scenario.notes}`, 170);
                doc.text(noteLines, margin + 5, yPos);
                yPos += (noteLines.length * lineHeight) + 5;
            }

            // Linea separatrice
            if (index < scenarios.length - 1) {
                doc.setDrawColor(200);
                doc.line(margin, yPos, 190, yPos);
                yPos += 10;
            }
        });

        // Salva il PDF
        doc.save(`business-case-viaggi-${this.getDateString()}.pdf`);

        this.showSuccess('Report PDF generato');
    },

    // Importa da JSON
    importJSON(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const success = StorageManager.importFromJSON(data);
                
                if (success) {
                    this.showSuccess(`Importati ${data.scenarios.length} scenari`);
                    // Ricarica la vista corrente
                    if (typeof App !== 'undefined' && App.loadDashboard) {
                        App.loadDashboard();
                    }
                } else {
                    this.showError('Errore nell\'importazione dei dati');
                }
            } catch (error) {
                console.error('Errore nel parsing del JSON:', error);
                this.showError('File JSON non valido');
            }
        };

        reader.onerror = () => {
            this.showError('Errore nella lettura del file');
        };

        reader.readAsText(file);
    },

    // Ottieni una stringa data formattata per i nomi file
    getDateString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    },

    // Mostra messaggio di successo
    showSuccess(message) {
        this.showToast(message, 'success');
    },

    // Mostra messaggio di errore
    showError(message) {
        this.showToast(message, 'error');
    },

    // Mostra toast notification
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast ${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
};

// Made with Bob
