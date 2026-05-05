# 📤 Guida alla Pubblicazione su GitHub Pages

## Come Funzionano i Dati nell'App

### LocalStorage
L'applicazione salva tutti i dati nel **localStorage** del browser, che è:
- ✅ Specifico per ogni dispositivo/browser
- ✅ Persistente (rimane anche dopo aver chiuso il browser)
- ❌ Non sincronizzato tra dispositivi diversi
- ❌ Non visibile ad altri utenti

### Dati di Esempio
Per mostrare l'app con dati già popolati quando viene pubblicata online, ho implementato un sistema di **dati di esempio** che vengono caricati automaticamente al primo avvio.

## File Coinvolti

### 1. `js/sample-data.js`
Contiene i dati di esempio:
- **3 scenari** (Norvegia 2027, Weekend Parigi, Tour Giappone)
- **1 consuntivo** (Norvegia 2027 con spese dettagliate)
- **6 partecipanti** nell'anagrafica

### 2. `js/storage.js`
Modificato per caricare automaticamente i dati di esempio se il localStorage è vuoto:
```javascript
init() {
    const existingData = this.getData();
    
    // Se non ci sono dati, carica i dati di esempio
    if (!existingData || (existingData.scenarios.length === 0 && existingData.actuals.length === 0)) {
        console.log('Caricamento dati di esempio...');
        
        if (typeof SampleData !== 'undefined') {
            this.saveData({
                scenarios: SampleData.scenarios || [],
                actuals: SampleData.actuals || []
            });
            
            // Carica anche i partecipanti di esempio
            if (typeof participantsRegistry !== 'undefined' && SampleData.participants) {
                localStorage.setItem('participants_registry', JSON.stringify(SampleData.participants));
            }
            
            console.log('Dati di esempio caricati con successo!');
        }
    }
}
```

### 3. `index.html`
Include `sample-data.js` prima di `storage.js`:
```html
<script src="js/sample-data.js"></script>
<script src="js/storage.js"></script>
```

## Come Pubblicare su GitHub Pages

### Opzione 1: Pubblicazione Diretta (Consigliata)

1. **Crea un repository su GitHub**
   ```bash
   # Nella cartella travel-business-case
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TUO-USERNAME/travel-business-case.git
   git push -u origin main
   ```

2. **Attiva GitHub Pages**
   - Vai su GitHub → Repository → Settings
   - Nella sezione "Pages"
   - Source: seleziona "main" branch
   - Folder: seleziona "/ (root)"
   - Clicca "Save"

3. **Accedi all'app**
   - URL: `https://TUO-USERNAME.github.io/travel-business-case/`
   - I dati di esempio verranno caricati automaticamente al primo accesso

### Opzione 2: Pubblicazione con Sottocartella

Se vuoi pubblicare in una sottocartella del tuo sito:

1. Crea una cartella `docs` nel repository
2. Sposta tutti i file dentro `docs/`
3. In GitHub Pages, seleziona "docs" come folder

## Comportamento dei Dati

### Primo Accesso
✅ L'app carica automaticamente i dati di esempio
✅ Vedi 3 scenari, 1 consuntivo, 6 partecipanti

### Accessi Successivi
✅ L'app mantiene i tuoi dati nel localStorage
✅ I dati di esempio NON vengono ricaricati
✅ Puoi modificare/eliminare i dati di esempio

### Reset dei Dati
Per ricaricare i dati di esempio:

**Metodo 1: Console del Browser**
```javascript
// Apri la console (F12) e digita:
localStorage.clear();
location.reload();
```

**Metodo 2: Developer Tools**
1. F12 → Application → Storage
2. Clear site data
3. Ricarica la pagina

## Personalizzare i Dati di Esempio

### Metodo 1: Esporta i Tuoi Dati Locali (CONSIGLIATO) 🎯

Il modo più semplice per usare i tuoi dati reali come dati di esempio:

1. **Apri il tool di esportazione**
   - Apri il file `export-to-sample-data.html` nel browser
   - Vedrai le statistiche dei tuoi dati (scenari, consuntivi, partecipanti)

2. **Genera il codice**
   - Clicca su "📤 Genera Codice per sample-data.js"
   - Il tool leggerà i tuoi dati dal localStorage

3. **Copia il codice**
   - Clicca su "📋 Copia negli Appunti"
   - Il codice JavaScript verrà copiato automaticamente

4. **Sostituisci il file**
   - Apri `js/sample-data.js` nel tuo editor
   - Cancella tutto il contenuto
   - Incolla il codice copiato
   - Salva il file

5. **Pubblica**
   - I tuoi dati saranno ora inclusi nell'app pubblicata! 🚀

### Metodo 2: Modifica Manuale

Apri `js/sample-data.js` e modifica l'array `scenarios`:

```javascript
const SampleData = {
    scenarios: [
        {
            id: 'sample-1',
            name: 'Il Tuo Viaggio',
            destination: 'La Tua Destinazione',
            // ... altri campi
        }
    ],
    // ...
};
```

### Metodo 3: Aggiungi Nuovi Scenari Manualmente
1. Crea uno scenario nell'app locale
2. Esporta i dati (📤 Esporta → JSON)
3. Copia lo scenario dal file JSON
4. Incollalo in `sample-data.js`
5. Modifica l'ID per renderlo unico (es: `sample-4`)

### Rimuovere i Dati di Esempio
Se NON vuoi dati di esempio:

**Opzione A: Rimuovi il file**
```html
<!-- In index.html, rimuovi questa riga: -->
<script src="js/sample-data.js"></script>
```

**Opzione B: Svuota il file**
```javascript
// In js/sample-data.js
const SampleData = {
    scenarios: [],
    actuals: [],
    participants: []
};
```

## Test Locale

Prima di pubblicare, testa localmente:

1. **Apri con un server locale**
   ```bash
   # Opzione 1: Python
   python3 -m http.server 8000
   
   # Opzione 2: Node.js
   npx http-server
   
   # Opzione 3: VS Code
   # Installa l'estensione "Live Server" e clicca "Go Live"
   ```

2. **Apri il browser**
   - Vai su `http://localhost:8000`
   - Verifica che i dati di esempio vengano caricati

3. **Testa in modalità incognito**
   - Apri una finestra incognito
   - Vai su `http://localhost:8000`
   - Verifica che i dati di esempio vengano caricati di nuovo

## Domande Frequenti

### Q: I dati di esempio vengono sovrascritti quando modifico qualcosa?
**A:** No, i dati di esempio vengono caricati SOLO se il localStorage è vuoto. Una volta caricati, diventano i tuoi dati personali.

### Q: Come faccio a condividere i miei dati con altri?
**A:** Usa la funzione Esporta (📤) per creare un file JSON, poi condividilo. Gli altri possono importarlo con Importa (📥).

### Q: I dati sono sincronizzati tra dispositivi?
**A:** No, il localStorage è locale. Per sincronizzare, devi esportare/importare manualmente.

### Q: Posso usare un database invece del localStorage?
**A:** Sì, ma richiede modifiche al codice. Dovresti implementare un backend con API REST e modificare `storage.js`.

### Q: Come faccio a vedere i dati nel localStorage?
**A:** F12 → Application → Local Storage → seleziona il tuo dominio → vedrai le chiavi `travelBusinessCase` e `participants_registry`.

## Aggiornamenti Futuri

Quando aggiorni l'app su GitHub:

1. **I dati degli utenti NON vengono persi**
   - Il localStorage rimane intatto
   - Solo il codice viene aggiornato

2. **Nuovi dati di esempio**
   - Se modifichi `sample-data.js`, i nuovi utenti vedranno i nuovi dati
   - Gli utenti esistenti mantengono i loro dati

3. **Migrazioni**
   - Se cambi la struttura dei dati, aggiungi codice di migrazione in `storage.js`

## Supporto

Per problemi o domande:
- Controlla la console del browser (F12) per errori
- Verifica che tutti i file JavaScript siano caricati correttamente
- Testa in modalità incognito per escludere problemi di cache

---

**Fatto con ❤️ da Bob**