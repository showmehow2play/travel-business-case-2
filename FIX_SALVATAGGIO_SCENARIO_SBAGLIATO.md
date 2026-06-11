# Fix: Salvataggio su Scenario Sbagliato

## 🐛 Problema Risolto

Quando si modificava uno scenario di preventivo, le modifiche venivano salvate su uno scenario diverso da quello aperto.

### Sintomi
- Apri "Scenario A" per modificarlo
- Modifichi nome, destinazione, spese, ecc.
- Salvi le modifiche
- Le modifiche vengono salvate su "Scenario B" o su un altro scenario

## 🔍 Causa del Bug

Il problema aveva **DUE cause**:

### Causa 1: Salvataggio con ID sbagliato
La funzione `saveScenario()` usava `this.currentScenario.id` per identificare quale scenario salvare, ma questa variabile poteva essere sovrascritta durante la navigazione.

### Causa 2: Ricaricamento automatico con ID sbagliato (CAUSA PRINCIPALE)
In `participants.js`, quando modificavi un partecipante, il codice ricaricava automaticamente lo scenario usando `App.currentScenario.id`:

```javascript
// CODICE PROBLEMATICO (PRIMA) - participants.js
if (App.currentScenario && App.currentScenario.id) {
    const updatedScenario = await StorageManager.getScenario(App.currentScenario.id);
    App.loadScenarioForm(updatedScenario);  // ❌ Carica lo scenario sbagliato!
}
```

**Sequenza del bug:**
1. Apri Scenario A → `App.currentScenario = scenarioA`
2. Clicchi su Scenario B per visualizzarlo → `App.currentScenario = scenarioB`
3. Clicchi "Modifica" su Scenario B → Form caricato correttamente
4. Modifichi un partecipante → `participants.js` usa `App.currentScenario.id` che è ancora A
5. Ricarica Scenario A invece di B → Form mostra Scenario A ❌
6. Salvi → le modifiche vanno su Scenario A invece di B ❌

## ✅ Soluzione Implementata

L'ID dello scenario viene ora salvato **direttamente nel form HTML** come attributo `data-scenario-id`, garantendo che sia sempre corretto indipendentemente dalla navigazione.

### Modifiche Apportate

#### 1. `editScenario(id)` - Salva l'ID nel form
```javascript
async editScenario(id) {
    const scenario = await StorageManager.getScenario(id);
    if (scenario) {
        this.currentScenario = scenario;
        this.loadScenarioForm(scenario);
        
        // ✅ NUOVO: Salva l'ID nel form
        const form = document.getElementById('scenarioForm');
        if (form) {
            form.dataset.scenarioId = scenario.id;
        }
        // ...
    }
}
```

#### 2. `createNewScenario()` - Rimuove l'ID per nuovi scenari
```javascript
createNewScenario() {
    this.currentScenario = null;
    this.loadScenarioForm(ScenarioManager.createEmptyScenario());
    
    // ✅ NUOVO: Rimuovi l'ID dal form
    const form = document.getElementById('scenarioForm');
    if (form) {
        delete form.dataset.scenarioId;
    }
    // ...
}
```

#### 3. `viewScenario(id)` - Salva l'ID anche in visualizzazione
```javascript
async viewScenario(id) {
    const scenario = await StorageManager.getScenario(id);
    if (scenario) {
        this.currentScenario = scenario;
        this.loadScenarioForm(scenario);
        
        // ✅ NUOVO: Salva l'ID nel form
        const form = document.getElementById('scenarioForm');
        if (form) {
            form.dataset.scenarioId = scenario.id;
        }
        // ...
    }
}
```

#### 4. `saveScenario()` - Usa l'ID dal form
```javascript
saveScenario() {
    // ... raccolta dati ...
    
    // ✅ NUOVO: Usa l'ID dal form invece di this.currentScenario
    const form = document.getElementById('scenarioForm');
    const scenarioId = form ? form.dataset.scenarioId : null;
    
    console.log('💾 Salvataggio scenario - ID dal form:', scenarioId);
    
    if (scenarioId) {
        // Scenario esistente - aggiorna
        const overwriteExisting = confirm(
            `Vuoi sovrascrivere lo scenario esistente "${scenarioData.name}"?`
        );
        
        if (overwriteExisting) {
            StorageManager.updateScenario(scenarioId, scenarioData);
            ExportManager.showSuccess('Scenario sovrascritto');
        } else {
            // Salva come nuovo
            StorageManager.addScenario({
                ...scenarioData,
                name: `${scenarioData.name} (Copia)`
            });
            ExportManager.showSuccess('Nuovo scenario creato');
        }
    } else {
        // Nuovo scenario
        StorageManager.addScenario(scenarioData);
        ExportManager.showSuccess('Scenario creato');
    }
}
```

## 🧪 Come Testare

### Test Automatico
Apri il file `test-scenario-save-fix.html` nel browser per eseguire i test unitari.

### Test Manuale

1. **Crea due scenari di test:**
   - Scenario A: "Viaggio Roma"
   - Scenario B: "Viaggio Milano"

2. **Test del bug risolto:**
   - Apri "Scenario A" per modificarlo
   - Cambia il nome in "Viaggio Roma Modificato"
   - Cambia la destinazione
   - Salva
   - ✅ Verifica che le modifiche siano su "Scenario A" e non su "Scenario B"

3. **Test navigazione multipla:**
   - Apri "Scenario A"
   - Visualizza "Scenario B" (senza modificare)
   - Torna a "Scenario A" e modificalo
   - Salva
   - ✅ Verifica che le modifiche siano su "Scenario A"

4. **Test nuovo scenario:**
   - Clicca "Nuovo Scenario"
   - Compila i campi
   - Salva
   - ✅ Verifica che venga creato un nuovo scenario senza sovrascrivere esistenti

## 📊 Vantaggi della Soluzione

1. **Affidabilità**: L'ID è sempre corretto, indipendentemente dalla navigazione
2. **Tracciabilità**: Console log mostrano quale ID viene usato per il salvataggio
3. **Semplicità**: Usa attributi HTML standard (`data-*`)
4. **Compatibilità**: Non richiede modifiche al database o alla struttura dati
5. **Debug**: Facile verificare quale scenario è in modifica ispezionando il form

## 🔧 File Modificati

- `travel-business-case/js/app.js`
  - Funzione `editScenario()` - Salva ID nel form
  - Funzione `createNewScenario()` - Rimuove ID dal form
  - Funzione `viewScenario()` - Salva ID nel form
  - Funzione `saveScenario()` - Usa ID dal form invece di this.currentScenario
  - Aggiunto logging dettagliato per debug

- `travel-business-case/js/participants.js` ⭐ **FIX PRINCIPALE**
  - Funzione `saveParticipantForm()` - Usa ID dal form invece di App.currentScenario.id
  - Questo era il bug principale che causava il ricaricamento dello scenario sbagliato

- `travel-business-case/index.html`
  - Incrementata versione app.js (v18)
  - Incrementata versione participants.js (v3)

## 📝 Note Tecniche

### Perché `data-scenario-id` invece di `this.currentScenario`?

- **HTML dataset**: Persistente nel DOM, non può essere sovrascritto accidentalmente
- **Variabile JavaScript**: Può essere modificata da qualsiasi funzione
- **Scope**: Il dataset è legato al form specifico, la variabile è globale all'oggetto

### Logging per Debug

Il codice ora include logging nella console:
```javascript
console.log('💾 Salvataggio scenario - ID dal form:', scenarioId);
console.log('💾 Salvataggio scenario - this.currentScenario:', this.currentScenario);
```

Questo permette di verificare facilmente quale scenario viene salvato.

## ✅ Stato

- [x] Bug identificato
- [x] Soluzione implementata
- [x] Test creati
- [x] Documentazione aggiornata
- [x] Logging aggiunto per debug

## 🎯 Risultato

Il bug è stato completamente risolto. Le modifiche vengono ora salvate sempre sullo scenario corretto, indipendentemente dalla navigazione nell'applicazione.

---

**Data Fix**: 11 Giugno 2026  
**Versione**: 2.1  
**Made with Bob** 🤖