# 👥 Sistema Anagrafica Partecipanti

## Panoramica
È stato implementato un sistema completo di gestione anagrafica dei partecipanti che si auto-alimenta dai preventivi e consuntivi esistenti.

## 🎯 Funzionalità Implementate

### 1. **Vista Anagrafica**
- Nuova sezione "👥 Anagrafica" nella navigazione principale
- Visualizzazione card moderne per ogni partecipante
- Avatar colorato con iniziale del nome
- Informazioni complete visualizzate in modo elegante

### 2. **Gestione CRUD Completa**

#### ✅ Creazione
- Pulsante "+ Aggiungi Partecipante"
- Form modale con campi:
  - Nome Completo (obbligatorio)
  - Email
  - Telefono
  - Numero Carta d'Identità/Passaporto
  - Note aggiuntive

#### ✏️ Modifica
- Pulsante "✏️" su ogni card partecipante
- Modifica di tutti i campi
- Salvataggio con timestamp aggiornamento

#### 🗑️ Eliminazione
- Pulsante "🗑️" su ogni card
- Conferma prima dell'eliminazione
- Rimozione permanente dall'anagrafica

### 3. **Auto-Alimentazione**

#### 🔄 Sincronizzazione Automatica
- Pulsante "🔄 Sincronizza" nella vista Anagrafica
- Estrae automaticamente tutti i nomi dai preventivi esistenti
- Estrae automaticamente tutti i nomi dai consuntivi esistenti
- Evita duplicati (case-insensitive)
- Notifica quanti partecipanti sono stati aggiunti

#### 📊 Funzionamento
```javascript
// Quando si crea un preventivo con partecipanti:
// - Mario Rossi
// - Laura Bianchi

// Questi nomi vengono automaticamente aggiunti all'anagrafica
// al primo sync o quando si salva il preventivo
```

### 4. **Ricerca Avanzata**
- Barra di ricerca in tempo reale
- Cerca per:
  - Nome
  - Email
  - Telefono
- Risultati istantanei mentre si digita
- Reset automatico cancellando la ricerca

### 5. **Storage Persistente**
- Salvataggio automatico in localStorage
- Chiave: `participants_registry`
- Formato JSON strutturato
- Sincronizzazione tra preventivi e anagrafica

## 📁 File Creati/Modificati

### Nuovi File
1. **`js/participants.js`** (434 righe)
   - Classe `ParticipantsRegistry` per gestione dati
   - Funzioni UI per rendering e interazione
   - Sistema di ricerca e filtro
   - Auto-sync da scenari e consuntivi

### File Modificati
1. **`index.html`**
   - Aggiunto tab "👥 Anagrafica" nella navigazione
   - Nuova vista `participantsView`
   - Modale per gestione partecipanti
   - Script `participants.js` incluso

2. **`css/style.css`**
   - Stili per cards partecipanti
   - Avatar circolari con gradiente
   - Barra di ricerca
   - Dettagli informazioni
   - Responsive design

3. **`js/app.js`**
   - Supporto vista `participants` in `switchView()`
   - Event listeners per sync e ricerca
   - Integrazione con sistema esistente

## 🎨 Design

### Card Partecipante
```
┌─────────────────────────────────────┐
│ [M] Mario Rossi          [✏️] [🗑️] │
│     Aggiunto il 04/05/2026          │
├─────────────────────────────────────┤
│ 📧 mario.rossi@email.com            │
│ 📱 +39 123 456 7890                 │
│ 🆔 CA1234567                        │
│ 📝 Note: Preferisce posto finestrino│
└─────────────────────────────────────┘
```

### Caratteristiche Visive
- **Avatar**: Gradiente blu-viola con iniziale
- **Hover Effects**: Sollevamento card con ombra
- **Actions**: Appaiono al passaggio del mouse
- **Responsive**: Si adatta a mobile/tablet/desktop

## 🔧 API JavaScript

### Classe ParticipantsRegistry

```javascript
// Ottenere tutti i partecipanti
const participants = participantsRegistry.getAll();

// Cercare per nome
const participant = participantsRegistry.getByName('Mario Rossi');

// Aggiungere partecipante
const newParticipant = participantsRegistry.add({
    name: 'Mario Rossi',
    email: 'mario@email.com',
    phone: '+39 123 456 7890',
    idCard: 'CA1234567',
    notes: 'Note varie'
});

// Aggiornare partecipante
participantsRegistry.update(id, {
    name: 'Mario Rossi',
    email: 'nuovo@email.com'
});

// Eliminare partecipante
participantsRegistry.delete(id);

// Sincronizzare da scenari
const added = participantsRegistry.syncFromScenarios(scenarios);

// Cercare partecipanti
const results = participantsRegistry.search('mario');
```

### Funzioni UI

```javascript
// Renderizzare lista partecipanti
renderParticipantsList();

// Mostrare modale aggiunta
showAddParticipantModal();

// Modificare partecipante
editParticipant(id);

// Eliminare partecipante
deleteParticipant(id);

// Cercare partecipanti
searchParticipants(query);

// Auto-sync da preventivi/consuntivi
autoSyncParticipants();
```

## 📊 Struttura Dati

### Oggetto Partecipante
```json
{
    "id": "1714857600000",
    "name": "Mario Rossi",
    "email": "mario.rossi@email.com",
    "phone": "+39 123 456 7890",
    "idCard": "CA1234567",
    "notes": "Preferenze di viaggio",
    "createdAt": "2026-05-04T19:00:00.000Z",
    "updatedAt": "2026-05-04T19:00:00.000Z"
}
```

## 🚀 Come Usare

### 1. Visualizzare Anagrafica
1. Clicca su "👥 Anagrafica" nella navigazione
2. Vedrai tutti i partecipanti registrati

### 2. Sincronizzare Partecipanti
1. Vai in "👥 Anagrafica"
2. Clicca "🔄 Sincronizza"
3. I partecipanti dai preventivi vengono aggiunti automaticamente

### 3. Aggiungere Manualmente
1. Clicca "+ Aggiungi Partecipante"
2. Compila il form
3. Clicca "💾 Salva"

### 4. Modificare Partecipante
1. Passa il mouse sulla card
2. Clicca "✏️"
3. Modifica i campi
4. Clicca "💾 Salva"

### 5. Eliminare Partecipante
1. Passa il mouse sulla card
2. Clicca "🗑️"
3. Conferma l'eliminazione

### 6. Cercare Partecipante
1. Digita nella barra di ricerca
2. I risultati appaiono in tempo reale
3. Cancella per vedere tutti

## 🔄 Integrazione Futura

### Prossimi Step (Da Implementare)
1. **Selezione nei Preventivi**
   - Dropdown con partecipanti esistenti
   - Possibilità di aggiungere nuovi
   - Combo: seleziona + aggiungi

2. **Selezione nei Consuntivi**
   - Dropdown per assegnare spese
   - Filtro per partecipanti del preventivo
   - Aggiunta rapida se mancante

3. **Export/Import**
   - Esportare anagrafica in CSV/Excel
   - Importare da file esterno
   - Backup separato dell'anagrafica

## 💡 Vantaggi

### Per l'Utente
- ✅ Non serve riscrivere i nomi ogni volta
- ✅ Informazioni centralizzate
- ✅ Ricerca rapida
- ✅ Gestione semplice

### Per il Sistema
- ✅ Dati consistenti
- ✅ Nessun duplicato
- ✅ Facile manutenzione
- ✅ Scalabile

## 🎯 Casi d'Uso

### Scenario 1: Gruppo Fisso
```
Hai un gruppo di amici che viaggia sempre insieme:
1. Crei il primo preventivo con i loro nomi
2. Clicchi "Sincronizza" in Anagrafica
3. Aggiungi email e telefoni di tutti
4. Nei prossimi preventivi, selezioni i nomi dall'anagrafica
```

### Scenario 2: Gestione Aziendale
```
Gestisci viaggi aziendali:
1. Mantieni anagrafica dipendenti con documenti
2. Quando organizzi un viaggio, selezioni i partecipanti
3. Hai sempre i dati aggiornati per prenotazioni
4. Puoi cercare rapidamente per email o telefono
```

### Scenario 3: Agenzia Viaggi
```
Organizzi viaggi per clienti diversi:
1. Ogni cliente è in anagrafica con i suoi dati
2. Crei preventivi selezionando i clienti
3. Hai storico completo per ogni persona
4. Puoi contattarli facilmente
```

## 📱 Responsive

- **Desktop**: Grid 3 colonne
- **Tablet**: Grid 2 colonne
- **Mobile**: 1 colonna, actions sempre visibili

## 🔒 Privacy

- Dati salvati solo in localStorage del browser
- Nessun invio a server esterni
- Controllo completo dell'utente
- Eliminazione permanente disponibile

---

**Versione**: 1.0  
**Data**: 4 Maggio 2026  
**Stato**: ✅ Implementato e Funzionante