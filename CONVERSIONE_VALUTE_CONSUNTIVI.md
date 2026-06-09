# 💱 Conversione Valute nei Consuntivi

## Panoramica

È stata implementata la funzionalità di conversione automatica delle valute nella pagina dei consuntivi. Quando si inserisce una spesa in una valuta diversa dall'Euro, il sistema:

1. **Aggiorna automaticamente i tassi di cambio** prima della conversione
2. **Converte l'importo in EUR** utilizzando i tassi dalla pagina Valute
3. **Mostra l'equivalente in EUR** sotto l'importo originale
4. **Calcola i totali in EUR** per tutte le spese

## Funzionalità Implementate

### 1. Selezione Valuta Dinamica

Il dropdown delle valute viene popolato dinamicamente dalla pagina Valute con il seguente ordine:
- **EUR** (sempre prima)
- **Valuta del paese di destinazione** dello scenario (se disponibile)
- **Altre valute** in ordine alfabetico

### 2. Conversione Automatica

Quando si inserisce o modifica una spesa:
- Il sistema utilizza i tassi di cambio presenti nella pagina Valute
- Converte l'importo nella valuta selezionata in EUR
- Salva sia l'importo originale che quello convertito
- Memorizza il tasso di cambio utilizzato

**Nota:** Per aggiornare i tassi di cambio, vai alla pagina **Valute** e clicca su "🔄 Aggiorna Cambi"

### 3. Visualizzazione EUR Equivalente

Per spese in valuta diversa da EUR, viene mostrato:
```
Importo: 500 NOK
≈ €43.48 EUR
```

### 4. Calcoli in EUR

Tutti i calcoli vengono effettuati in EUR:
- **Costo per persona**: calcolato sull'importo EUR
- **Totale spese**: somma di tutti gli importi EUR
- **Statistiche**: basate sugli importi EUR

## Struttura Dati Spesa

Ogni spesa ora include:

```javascript
{
    id: 'expense_xxx',
    category: 'ristorante',
    description: 'Cena a Oslo',
    amount: 500,              // Importo originale
    currency: 'NOK',          // Valuta originale
    amountEUR: 43.48,         // Importo convertito in EUR
    exchangeRate: 11.5,       // Tasso di cambio utilizzato
    date: '2027-06-15',
    paidBy: 'Mario Rossi',
    sharedBy: ['Mario Rossi', 'Luigi Verdi'],
    notes: ''
}
```

## Metodi Aggiunti

### ActualsManager

#### `convertToEUR(amount, currency)`
Converte un importo da una valuta all'EUR.

**Parametri:**
- `amount`: Importo da convertire
- `currency`: Codice valuta (es. 'NOK', 'USD')

**Ritorna:**
```javascript
{
    amountEUR: 43.48,
    exchangeRate: 11.5
}
```

#### `calculateTotal(expenses)`
Calcola il totale delle spese in EUR.

**Nota:** Utilizza `amountEUR` se disponibile, altrimenti `amount`.

### ActualsUI

#### `convertExpenseToEUR(index)`
Converte una spesa specifica in EUR.

**Processo:**
1. Aggiorna i tassi di cambio
2. Converte l'importo usando `ActualsManager.convertToEUR()`
3. Salva `amountEUR` e `exchangeRate` nella spesa

#### `generateCurrencyOptions(selectedCurrency)`
Genera dinamicamente le opzioni del dropdown valute.

**Ordine:**
1. EUR (sempre prima)
2. Valuta del paese di destinazione
3. Altre valute (alfabetico)

#### `updateCostPerPerson(index)`
Aggiorna il costo per persona usando l'importo EUR.

## Esempio di Utilizzo

### Scenario: Viaggio in Norvegia

1. **Crea un consuntivo** per "Viaggio a Oslo"
2. **Aggiungi una spesa**:
   - Descrizione: "Cena ristorante"
   - Importo: 500
   - Valuta: NOK (Corona Norvegese)
3. **Il sistema automaticamente**:
   - Aggiorna il tasso di cambio NOK/EUR
   - Converte 500 NOK in EUR (es. €43.48)
   - Mostra "≈ €43.48 EUR" sotto l'importo
4. **Costo per persona** viene calcolato in EUR
5. **Totale spese** viene mostrato in EUR

## Test

È disponibile una pagina di test: `test-currency-conversion.html`

**Test disponibili:**
1. Inizializzazione CurrenciesManager
2. Conversione valute (USD, NOK, EUR)
3. Aggiornamento tassi di cambio
4. Creazione spesa con conversione
5. Calcolo totali in EUR

## Note Tecniche

### Aggiornamento Tassi di Cambio

I tassi di cambio devono essere aggiornati manualmente:
- Vai alla pagina **Valute** nell'applicazione
- Clicca sul pulsante **"🔄 Aggiorna Cambi"**
- I tassi vengono scaricati dall'API: `https://api.exchangerate-api.com/v4/latest/EUR`
- I tassi aggiornati sono memorizzati in `localStorage`
- Le conversioni nei consuntivi usano i tassi memorizzati

### Compatibilità

La funzionalità è retrocompatibile:
- Spese esistenti senza `amountEUR` vengono convertite al caricamento
- Se `amountEUR` non è disponibile, usa `amount`
- Se il tasso di cambio non è disponibile, usa 1:1

### Gestione Errori

In caso di errore:
- Viene mostrato un messaggio di avviso
- La conversione usa il tasso 1:1 come fallback
- L'applicazione continua a funzionare normalmente

## Vantaggi

✅ **Precisione**: Calcoli sempre in EUR per confronti accurati  
✅ **Trasparenza**: Mostra sia l'importo originale che quello convertito  
✅ **Automatico**: Aggiornamento tassi e conversione automatici  
✅ **Flessibile**: Supporta tutte le valute configurate  
✅ **Intuitivo**: Ordine valute basato sulla destinazione  

## Prossimi Sviluppi

Possibili miglioramenti futuri:
- Cache dei tassi di cambio con validità temporale
- Conversione storica (tassi alla data della spesa)
- Grafici con breakdown per valuta
- Export con dettaglio conversioni

---

**Made with Bob** 🤖