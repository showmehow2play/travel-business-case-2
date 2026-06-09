# 🔍 Debug Rimozione Partecipanti

## Test da Eseguire

### 1. **Apri la Console del Browser**
1. Apri `index.html` nel browser
2. Premi `F12` per aprire Developer Tools
3. Vai nella tab "Console"

### 2. **Vai in Preventivi**
1. Clicca su "📋 Preventivi"
2. Apri uno scenario esistente o creane uno nuovo
3. Aggiungi alcuni partecipanti

### 3. **Prova a Rimuovere un Partecipante**
1. Clicca sul pulsante **✕** accanto a un partecipante
2. Guarda nella console

### 4. **Cosa Dovresti Vedere nella Console**

#### ✅ Se Funziona:
```
Rimozione partecipante: Mario Rossi
```
E il partecipante viene rimosso dalla lista.

#### ❌ Se NON Funziona - Scenario A (Nessun Log):
Se non vedi nessun messaggio nella console, significa che:
- Il click non viene catturato
- La classe CSS non corrisponde
- L'event listener non è stato registrato

**Soluzione**: Verifica che il pulsante abbia la classe `remove-participant-btn`

#### ❌ Se NON Funziona - Scenario B (Errore JavaScript):
Se vedi un errore tipo:
```
Uncaught TypeError: this.removeParticipant is not a function
```

**Soluzione**: Problema con il contesto `this`

#### ❌ Se NON Funziona - Scenario C (Log ma nessuna rimozione):
Se vedi il log ma il partecipante non viene rimosso:
```
Rimozione partecipante: Mario Rossi
```
Ma il tag rimane visibile.

**Soluzione**: Problema nella funzione `removeParticipant()`

---

## Test Manuale nella Console

### Test 1: Verifica Event Listener
Nella console, digita:
```javascript
document.querySelectorAll('.remove-participant-btn').length
```

**Risultato Atteso**: Un numero > 0 (es: 3 se hai 3 partecipanti)

**Se è 0**: I pulsanti non hanno la classe corretta.

### Test 2: Verifica Data Attribute
```javascript
document.querySelector('.remove-participant-btn').dataset.participant
```

**Risultato Atteso**: Il nome di un partecipante (es: "Mario Rossi")

**Se è undefined**: Il data attribute non è impostato.

### Test 3: Verifica Funzione removeParticipant
```javascript
App.removeParticipant('Mario Rossi')
```

**Risultato Atteso**: Il partecipante "Mario Rossi" viene rimosso.

**Se errore**: La funzione non esiste o ha problemi.

### Test 4: Simula Click Manualmente
```javascript
document.querySelector('.remove-participant-btn').click()
```

**Risultato Atteso**: Il primo partecipante viene rimosso.

---

## Possibili Problemi e Soluzioni

### Problema 1: Pulsante Non Cliccabile
**Sintomo**: Il pulsante non risponde al click

**Verifica**:
```javascript
// Nella console
const btn = document.querySelector('.remove-participant-btn');
console.log('Pulsante trovato:', btn);
console.log('Classe:', btn.className);
console.log('Data:', btn.dataset.participant);
```

**Soluzione**: 
- Verifica che il pulsante esista
- Verifica che abbia la classe `remove-participant-btn`
- Verifica che abbia il `data-participant` attribute

### Problema 2: Event Listener Non Registrato
**Sintomo**: Nessun log nella console quando clicchi

**Verifica**:
```javascript
// Aggiungi temporaneamente questo nella console
document.addEventListener('click', (e) => {
    console.log('Click su:', e.target.className);
});
```

Poi clicca sul pulsante ✕. Dovresti vedere:
```
Click su: remove-participant-btn
```

**Soluzione**: Se non vedi questo, l'event listener non è stato registrato. Ricarica la pagina con `Ctrl+Shift+R`.

### Problema 3: Contesto `this` Perso
**Sintomo**: Errore "this.removeParticipant is not a function"

**Soluzione**: L'event listener deve usare arrow function:
```javascript
// ✅ Corretto
document.addEventListener('click', (e) => {
    this.removeParticipant(name);
});

// ❌ Sbagliato
document.addEventListener('click', function(e) {
    this.removeParticipant(name); // this non è App
});
```

### Problema 4: Caratteri Speciali nel Nome
**Sintomo**: Funziona per alcuni nomi ma non per altri

**Verifica**:
```javascript
// Nella console, dopo aver cliccato
const btn = document.querySelector('.remove-participant-btn');
console.log('Nome:', btn.dataset.participant);
console.log('Nome escaped:', btn.dataset.participant.replace(/"/g, '"'));
```

**Soluzione**: I nomi con apostrofi o virgolette devono essere escaped correttamente.

---

## Hard Reset

Se nulla funziona, prova questi passi:

### 1. Hard Refresh
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### 2. Cancella Cache
1. F12 → Application → Storage → Clear site data
2. Ricarica la pagina

### 3. Verifica File Caricati
F12 → Network → Ricarica pagina

Verifica che siano caricati:
- ✅ `app.js` (200 OK)
- ✅ `style.css` (200 OK)
- ✅ `participants.js` (200 OK)

### 4. Verifica Errori JavaScript
F12 → Console

Cerca errori in rosso. Se ci sono, riportali.

---

## Test Completo Step-by-Step

### Passo 1: Apri index.html
```
✅ Pagina caricata
✅ Console aperta (F12)
✅ Nessun errore in rosso
```

### Passo 2: Vai in Preventivi
```
✅ Click su "📋 Preventivi"
✅ Vista cambiata
```

### Passo 3: Apri/Crea Scenario
```
✅ Scenario aperto
✅ Sezione "👥 Partecipanti" visibile
```

### Passo 4: Aggiungi Partecipante
```
✅ Partecipante aggiunto
✅ Tag visibile con nome
✅ Pulsante ✕ visibile
```

### Passo 5: Verifica Pulsante
Nella console:
```javascript
document.querySelectorAll('.remove-participant-btn').length
```
Risultato: `> 0` ✅

### Passo 6: Clicca ✕
```
✅ Console mostra: "Rimozione partecipante: [nome]"
✅ Tag scompare
✅ Selettore si aggiorna
```

---

## Riporta Risultati

Se il problema persiste, riporta:

1. **Cosa vedi nella console** quando clicchi ✕
2. **Risultato di questo comando**:
   ```javascript
   document.querySelector('.remove-participant-btn')
   ```
3. **Screenshot** della sezione partecipanti
4. **Errori** in rosso nella console

---

## Workaround Temporaneo

Se proprio non funziona, puoi usare questo workaround nella console:

```javascript
// Aggiungi questo nella console per forzare la rimozione
document.querySelectorAll('.remove-participant-btn').forEach(btn => {
    btn.onclick = function() {
        const name = this.dataset.participant;
        App.removeParticipant(name);
    };
});
```

Poi prova a cliccare ✕ di nuovo.