# 🔄 Sincronizzazione Manuale Supabase

## Procedura Completa

### 1. Apri l'App Principale
Apri `index.html` nel browser

### 2. Apri la Console del Browser
- **Windows/Linux**: Premi `F12` o `Ctrl+Shift+J`
- **Mac**: Premi `Cmd+Option+J`

### 3. Copia e Incolla Questo Codice

```javascript
// ===== SINCRONIZZAZIONE MANUALE SUPABASE =====
(async function syncToSupabase() {
    console.log('🔄 Inizio sincronizzazione...');
    
    try {
        // 1. Carica dati locali
        const participants = JSON.parse(localStorage.getItem('participants_registry') || '[]');
        const scenarios = JSON.parse(localStorage.getItem('scenarios') || '[]');
        const actuals = JSON.parse(localStorage.getItem('actuals') || '[]');
        
        console.log(`📊 Trovati: ${scenarios.length} scenari, ${actuals.length} consuntivi, ${participants.length} partecipanti`);
        
        // 2. Normalizza nomi usando anagrafica
        const nameMap = new Map();
        participants.forEach(p => nameMap.set(p.name.toLowerCase(), p.name));
        
        let totalChanges = 0;
        
        // Normalizza scenari
        scenarios.forEach(s => {
            if (s.participants) {
                s.participants = s.participants.map(name => {
                    const correct = nameMap.get(name.toLowerCase());
                    if (correct && correct !== name) {
                        console.log(`  📝 Scenario "${s.name}": "${name}" → "${correct}"`);
                        totalChanges++;
                        return correct;
                    }
                    return name;
                });
            }
        });
        
        // Normalizza consuntivi
        actuals.forEach(a => {
            if (a.participants) {
                a.participants = a.participants.map(name => {
                    const correct = nameMap.get(name.toLowerCase());
                    if (correct && correct !== name) {
                        console.log(`  📝 Consuntivo "${a.name}": "${name}" → "${correct}"`);
                        totalChanges++;
                        return correct;
                    }
                    return name;
                });
            }
        });
        
        console.log(`✅ Normalizzati ${totalChanges} nomi`);
        
        // 3. Salva su localStorage
        localStorage.setItem('scenarios', JSON.stringify(scenarios));
        localStorage.setItem('actuals', JSON.stringify(actuals));
        console.log('💾 Salvato su localStorage');
        
        // 4. Verifica Supabase
        if (!window.supabaseClient) {
            throw new Error('❌ Supabase non disponibile. Assicurati che js/supabase-config.js sia configurato.');
        }
        console.log('✅ Supabase connesso');
        
        // 5. Sincronizza scenari su Supabase
        console.log('☁️ Sincronizzazione scenari su Supabase...');
        for (const scenario of scenarios) {
            try {
                const { error } = await window.supabaseClient
                    .from('scenarios')
                    .upsert({
                        id: scenario.id,
                        data: scenario,
                        updated_at: new Date().toISOString()
                    });
                
                if (error) throw error;
                console.log(`  ✅ Scenario "${scenario.name}" sincronizzato`);
            } catch (err) {
                console.error(`  ❌ Errore scenario "${scenario.name}":`, err.message);
            }
        }
        
        // 6. Sincronizza consuntivi su Supabase
        console.log('☁️ Sincronizzazione consuntivi su Supabase...');
        for (const actual of actuals) {
            try {
                const { error } = await window.supabaseClient
                    .from('actuals')
                    .upsert({
                        id: actual.id,
                        data: actual,
                        updated_at: new Date().toISOString()
                    });
                
                if (error) throw error;
                console.log(`  ✅ Consuntivo "${actual.name}" sincronizzato`);
            } catch (err) {
                console.error(`  ❌ Errore consuntivo "${actual.name}":`, err.message);
            }
        }
        
        // 7. Sincronizza partecipanti su Supabase
        console.log('☁️ Sincronizzazione partecipanti su Supabase...');
        for (const participant of participants) {
            try {
                const { error } = await window.supabaseClient
                    .from('participants')
                    .upsert({
                        id: participant.id,
                        data: participant,
                        updated_at: new Date().toISOString()
                    });
                
                if (error) throw error;
                console.log(`  ✅ Partecipante "${participant.name}" sincronizzato`);
            } catch (err) {
                console.error(`  ❌ Errore partecipante "${participant.name}":`, err.message);
            }
        }
        
        console.log('🎉 SINCRONIZZAZIONE COMPLETATA!');
        console.log(`📊 Riepilogo:`);
        console.log(`   - ${totalChanges} nomi normalizzati`);
        console.log(`   - ${scenarios.length} scenari sincronizzati`);
        console.log(`   - ${actuals.length} consuntivi sincronizzati`);
        console.log(`   - ${participants.length} partecipanti sincronizzati`);
        
        alert('✅ Sincronizzazione completata!\n\nRicarica la pagina per vedere i nomi aggiornati.');
        
    } catch (error) {
        console.error('❌ ERRORE:', error);
        alert('❌ Errore durante la sincronizzazione:\n' + error.message + '\n\nControlla la console per dettagli.');
    }
})();
```

### 4. Premi Invio

Il codice:
- Normalizza tutti i nomi usando l'anagrafica
- Salva su localStorage
- Sincronizza tutto su Supabase
- Mostra log dettagliato di ogni operazione

### 5. Ricarica la Pagina

Dopo che vedi il messaggio "✅ Sincronizzazione completata!", ricarica la pagina (F5 o Cmd+R).

## ✅ Risultato

Ora:
- I nomi sono normalizzati (es: "Luca Ramponi" → "Luca Rampo")
- Tutto è sincronizzato su Supabase
- Il sito su GitHub Pages vedrà i dati aggiornati

## 🔍 Troubleshooting

### Se dice "Supabase non disponibile"
Significa che `js/supabase-config.js` non è configurato. Verifica che il file esista e contenga le credenziali corrette.

### Se alcuni elementi danno errore
Controlla la console per vedere quali elementi hanno dato problemi. Potrebbero esserci problemi di permessi su Supabase.

### Se vuoi ripetere la sincronizzazione
Puoi eseguire il codice più volte senza problemi. Usa `upsert` quindi aggiorna i record esistenti.

---

**Nota**: Questo è un fix temporaneo. Per una soluzione permanente, è necessario un refactoring del sistema di storage per sincronizzare automaticamente con Supabase ad ogni modifica.