# 💱 Guida Anagrafica Valute

## Panoramica

La pagina **Valute** permette di gestire un'anagrafica delle valute utilizzate nei viaggi, con i relativi tassi di cambio rispetto all'Euro (valuta principale).

## Caratteristiche Principali

### 1. Valuta Principale: Euro (EUR)
- L'Euro è la valuta di riferimento con tasso di cambio fisso a 1.0
- Non può essere eliminata dal sistema
- Tutte le conversioni vengono calcolate rispetto all'Euro

### 2. Valute Predefinite

Al primo avvio, il sistema carica automaticamente le seguenti valute:

| Codice | Nome | Simbolo | Tasso Iniziale |
|--------|------|---------|----------------|
| EUR | Euro | € | 1.00 |
| USD | Dollaro Statunitense | $ | 1.10 |
| GBP | Sterlina Britannica | £ | 0.86 |
| CHF | Franco Svizzero | CHF | 0.95 |
| JPY | Yen Giapponese | ¥ | 163.50 |
| NOK | Corona Norvegese | kr | 11.50 |

### 3. Gestione Valute

#### Aggiungere una Nuova Valuta
1. Clicca sul pulsante **"+ Aggiungi Valuta"**
2. Compila i campi obbligatori:
   - **Codice Valuta**: Codice ISO 4217 a 3 lettere (es: USD, GBP)
   - **Nome Valuta**: Nome completo (es: Dollaro Statunitense)
   - **Tasso di Cambio**: Quanto vale 1 EUR in questa valuta
3. Campi opzionali:
   - **Simbolo**: Simbolo della valuta (es: $, £)
   - **Paese/Regione**: Dove viene utilizzata
4. Clicca **"Salva"**

**Nota**: Una volta aggiunta, una valuta non può essere modificata manualmente. Usa il pulsante "🔄 Aggiorna Cambi" per aggiornare i tassi di cambio.

#### Eliminare una Valuta
1. Clicca sull'icona 🗑️ sulla card della valuta
2. Conferma l'eliminazione
3. **Nota**: L'Euro non può essere eliminato

### 4. Tassi di Cambio

#### Come Funzionano
I tassi di cambio sono espressi rispetto all'Euro:
- Se 1 EUR = 1.10 USD, inserisci **1.10** come tasso di cambio per USD
- Se 1 EUR = 0.86 GBP, inserisci **0.86** come tasso di cambio per GBP

#### Aggiornamento Automatico
Clicca sul pulsante **"🔄 Aggiorna Cambi"** per scaricare automaticamente i tassi di cambio più recenti:
1. Il sistema si connette all'API di Exchange Rate
2. Scarica i tassi aggiornati per tutte le valute presenti
3. Aggiorna automaticamente i tassi nel database locale
4. Mostra un messaggio con il numero di valute aggiornate
5. Visualizza la data dell'ultimo aggiornamento su ogni card

**Nota**: È necessaria una connessione internet attiva per questa funzionalità.

## Struttura Dati

Ogni valuta è memorizzata con i seguenti campi:

```javascript
{
    id: "curr_1234567890_abc123",      // ID univoco generato automaticamente
    code: "USD",                        // Codice ISO 4217 (3 lettere)
    name: "Dollaro Statunitense",       // Nome completo
    symbol: "$",                        // Simbolo (opzionale)
    exchangeRate: 1.10,                 // Tasso rispetto a EUR
    country: "Stati Uniti",             // Paese/Regione (opzionale)
    isPrimary: false,                   // true solo per EUR
    createdAt: "2026-05-08T10:00:00Z",  // Data creazione
    updatedAt: "2026-05-08T12:00:00Z"   // Data ultimo aggiornamento
}
```

## Conversione Valute

Il sistema include una funzione di conversione:

```javascript
// Converti 100 EUR in USD
const amountInUSD = CurrenciesManager.convert(100, 'EUR', 'USD');

// Converti 110 USD in EUR
const amountInEUR = CurrenciesManager.convert(110, 'USD', 'EUR');
```

### Come Funziona la Conversione
1. L'importo viene prima convertito in EUR (se necessario)
2. Poi viene convertito nella valuta di destinazione
3. Formula: `importo_destinazione = (importo_origine / tasso_origine) * tasso_destinazione`

## Storage

Le valute sono memorizzate nel localStorage del browser con la chiave `currencies_registry`.

### Backup e Ripristino
- Le valute sono incluse nell'esportazione JSON completa dell'applicazione
- Possono essere ripristinate importando un file JSON di backup

## API JavaScript

### CurrenciesManager

```javascript
// Inizializza il manager
CurrenciesManager.init();

// Ottieni tutte le valute
const currencies = CurrenciesManager.getCurrencies();

// Ottieni una valuta per ID
const currency = CurrenciesManager.getCurrencyById('curr_123');

// Ottieni una valuta per codice
const usd = CurrenciesManager.getCurrencyByCode('USD');

// Salva una nuova valuta
CurrenciesManager.saveCurrency({
    code: 'CAD',
    name: 'Dollaro Canadese',
    symbol: 'C$',
    exchangeRate: 1.45,
    country: 'Canada'
});

// Aggiorna una valuta esistente
CurrenciesManager.saveCurrency({
    id: 'curr_123',
    code: 'USD',
    name: 'Dollaro USA',
    exchangeRate: 1.12
});

// Elimina una valuta
CurrenciesManager.deleteCurrency('curr_123');

// Converti importi
const converted = CurrenciesManager.convert(100, 'EUR', 'USD');
```

## Test

È disponibile una pagina di test dedicata: `test-currencies.html`

### Test Disponibili
1. ✅ Inizializzazione del manager
2. ✅ Caricamento valute predefinite
3. ✅ Aggiunta nuova valuta
4. ✅ Modifica valuta esistente
5. ✅ Eliminazione valuta
6. ✅ Conversione tra valute
7. ✅ Protezione della valuta EUR

## Utilizzo Futuro

### Integrazione con Preventivi e Consuntivi
In futuro, le valute potranno essere utilizzate per:
- Inserire spese in valute diverse dall'Euro
- Convertire automaticamente gli importi
- Visualizzare totali in più valute
- Generare report multi-valuta

### Download Automatico Tassi
Sarà possibile integrare servizi come:
- European Central Bank API
- Fixer.io
- Open Exchange Rates
- Currency Layer

## Risoluzione Problemi

### Le valute non vengono visualizzate
- Verifica che il file `js/currencies.js` sia caricato
- Controlla la console del browser per errori
- Prova a ricaricare la pagina

### Errore "Valuta già esistente"
- Ogni codice valuta deve essere univoco
- Usa la funzione di modifica per aggiornare una valuta esistente

### Non riesco a eliminare l'Euro
- Questo è il comportamento corretto
- L'Euro è la valuta principale e non può essere eliminata

## File Coinvolti

- `index.html` - Contiene la view Valute e il modal
- `js/currencies.js` - Logica di gestione valute
- `css/style.css` - Stili per le card valute
- `js/app.js` - Integrazione con la navigazione
- `test-currencies.html` - Pagina di test

## Prossimi Sviluppi

- [x] Download automatico tassi di cambio ✅
- [ ] Storico tassi di cambio
- [ ] Grafici andamento valute
- [ ] Integrazione con preventivi/consuntivi
- [ ] Supporto per criptovalute
- [ ] Alert per variazioni significative dei tassi
- [ ] Selezione di diverse API per i tassi

---

**Versione**: 1.0  
**Data**: Maggio 2026  
**Autore**: Travel Business Case Team