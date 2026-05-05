# 🧪 Test Anagrafica - Guida Rapida

## ✅ Test 1: Creazione Partecipante (Solo Nome)

### Passi:
1. Apri `index.html` nel browser
2. Clicca su "👥 Anagrafica" nella navigazione
3. Clicca "+ Aggiungi Partecipante"
4. Inserisci solo il nome: "Mario Rossi"
5. Lascia vuoti gli altri campi
6. Clicca "💾 Salva"

### Risultato Atteso:
- ✅ Il modale si chiude
- ✅ Appare notifica verde "Partecipante aggiunto con successo"
- ✅ La card di "Mario Rossi" appare nella lista
- ✅ La card mostra solo il nome (nessun dettaglio)

---

## ✅ Test 2: Creazione Partecipante (Con Dettagli)

### Passi:
1. Clicca "+ Aggiungi Partecipante"
2. Inserisci:
   - Nome: "Laura Bianchi"
   - Email: "laura@email.com"
   - Telefono: "+39 123 456 7890"
   - Documento: "CA1234567"
   - Note: "Preferisce posto finestrino"
3. Clicca "💾 Salva"

### Risultato Atteso:
- ✅ Il modale si chiude
- ✅ Notifica verde di successo
- ✅ Card con tutti i dettagli visibili

---

## ✅ Test 3: Modifica Partecipante

### Passi:
1. Passa il mouse sulla card di "Mario Rossi"
2. Clicca sul pulsante "✏️"
3. Aggiungi email: "mario@email.com"
4. Clicca "💾 Salva"

### Risultato Atteso:
- ✅ Modale si chiude
- ✅ Notifica "Partecipante aggiornato con successo"
- ✅ Card ora mostra l'email

---

## ✅ Test 4: Sincronizzazione da Preventivi

### Passi:
1. Vai in "📋 Preventivi"
2. Crea un nuovo preventivo
3. Aggiungi partecipanti manualmente: "Giovanni Verdi", "Anna Neri"
4. Salva il preventivo
5. Torna in "👥 Anagrafica"
6. Clicca "🔄 Sincronizza"

### Risultato Atteso:
- ✅ Notifica "X partecipanti aggiunti automaticamente all'anagrafica"
- ✅ Le card di "Giovanni Verdi" e "Anna Neri" appaiono

---

## ✅ Test 5: Selezione da Anagrafica in Preventivo

### Passi:
1. Vai in "📋 Preventivi"
2. Crea nuovo preventivo
3. Nella sezione "👥 Partecipanti":
   - Dovresti vedere il box "Seleziona dall'Anagrafica"
   - Dovresti vedere tutti i partecipanti creati
4. Clicca su "Mario Rossi"

### Risultato Atteso:
- ✅ "Mario Rossi" appare nella lista partecipanti del preventivo
- ✅ Nel selettore, "Mario Rossi" mostra "✓ Aggiunto"
- ✅ "Mario Rossi" diventa grigio/disabilitato nel selettore

---

## ✅ Test 6: Aggiunta Manuale in Preventivo

### Passi:
1. Nello stesso preventivo
2. Nel campo "Oppure aggiungi nuovo nome"
3. Scrivi "Paolo Blu"
4. Clicca "+ Aggiungi Manualmente"

### Risultato Atteso:
- ✅ "Paolo Blu" appare nella lista partecipanti
- ✅ Torna in "👥 Anagrafica"
- ✅ "Paolo Blu" dovrebbe essere presente nell'anagrafica

---

## ✅ Test 7: Ricerca

### Passi:
1. In "👥 Anagrafica"
2. Nella barra di ricerca digita "mario"

### Risultato Atteso:
- ✅ Mostra solo le card che contengono "mario" nel nome o email
- ✅ Cancella la ricerca → mostra tutti

---

## ✅ Test 8: Eliminazione

### Passi:
1. Passa il mouse su una card
2. Clicca "🗑️"
3. Conferma l'eliminazione

### Risultato Atteso:
- ✅ Appare conferma "Sei sicuro..."
- ✅ Dopo conferma, card scompare
- ✅ Notifica "Partecipante eliminato con successo"

---

## 🐛 Problemi Risolti

### Problema: Modale non si chiude
**Causa**: Funzione `showToast` mancante  
**Soluzione**: Aggiunta funzione showToast in participants.js  
**Stato**: ✅ Risolto

### Problema: Campi sembravano obbligatori
**Causa**: Mancava indicazione visiva  
**Soluzione**: Aggiunte note "(Opzionali)" e testo esplicativo  
**Stato**: ✅ Risolto

### Problema: Non si poteva selezionare dall'anagrafica
**Causa**: Selettore non implementato  
**Soluzione**: Aggiunto selettore completo con stati visivi  
**Stato**: ✅ Risolto

---

## 📝 Checklist Finale

Prima di considerare completo, verifica:

- [ ] Modale si apre cliccando "+ Aggiungi Partecipante"
- [ ] Modale si chiude dopo salvataggio
- [ ] Appare notifica di successo
- [ ] Card appare nella lista
- [ ] Modifica funziona (✏️)
- [ ] Eliminazione funziona (🗑️)
- [ ] Ricerca funziona
- [ ] Sincronizzazione funziona (🔄)
- [ ] Selezione da anagrafica in preventivi funziona
- [ ] Aggiunta manuale salva in anagrafica
- [ ] Nessun errore nella console del browser (F12)

---

## 🆘 Se Qualcosa Non Funziona

### 1. Apri Console Browser (F12)
Cerca errori in rosso. Potrebbero indicare:
- File JavaScript non caricato
- Funzione non definita
- Errore di sintassi

### 2. Verifica File Caricati
Nella tab "Network" (F12), verifica che siano caricati:
- `js/participants.js`
- `js/app.js`
- `css/style.css`

### 3. Verifica localStorage
Nella tab "Application" → "Local Storage", dovresti vedere:
- `participants_registry`
- `scenarios`
- `actuals`

### 4. Hard Refresh
Premi `Ctrl+Shift+R` (o `Cmd+Shift+R` su Mac) per ricaricare ignorando la cache

---

**Versione Test**: 1.0  
**Data**: 4 Maggio 2026  
**Stato**: ✅ Pronto per Test