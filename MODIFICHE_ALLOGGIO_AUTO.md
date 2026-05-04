# Modifiche: Opzioni Multiple per Alloggio e Auto

## Panoramica delle Modifiche

L'applicazione è stata aggiornata per supportare **5 opzioni selezionabili** sia per gli alloggi che per le auto, con link diretti ai principali siti di prenotazione.

## Nuove Funzionalità

### 🏨 Alloggio

#### Caratteristiche:
- **5 opzioni configurabili** per ogni scenario
- Ogni opzione include:
  - Nome/descrizione personalizzabile
  - Prezzo in euro
  - Selezione tramite radio button (una sola opzione attiva)
- **Link di ricerca automatici** a:
  - **Airbnb**: con destinazione, date e numero ospiti precompilati
  - **Booking.com**: con destinazione, date e numero ospiti precompilati

#### Come Funziona:
1. Inserisci nome e prezzo per ogni opzione di alloggio
2. Seleziona l'opzione desiderata tramite il radio button
3. Clicca sui pulsanti "🔍 Cerca su Airbnb" o "🔍 Cerca su Booking" per aprire la ricerca con i parametri dello scenario
4. Il prezzo dell'opzione selezionata viene automaticamente incluso nel calcolo totale

### 🚙 Auto/Noleggio

#### Caratteristiche:
- **5 opzioni configurabili** per ogni scenario
- Ogni opzione include:
  - Nome/descrizione personalizzabile (es: "Fiat 500", "SUV 7 posti")
  - Prezzo in euro
  - Selezione tramite checkbox (possibilità di selezionare più auto)
- **Link di ricerca automatici** a:
  - **RentalCars**: con destinazione e date precompilate
  - **Hertz**: con destinazione e date precompilate

#### Come Funziona:
1. Inserisci nome e prezzo per ogni opzione auto
2. Seleziona una o più opzioni tramite checkbox
3. Clicca sui pulsanti "🔍 Cerca su RentalCars" o "🔍 Cerca su Hertz" per aprire la ricerca con i parametri dello scenario
4. Il totale delle auto selezionate viene automaticamente sommato nel calcolo totale

## Dettagli Tecnici

### File Modificati

1. **index.html**
   - Sostituiti i campi singoli di alloggio e auto con sezioni multiple
   - Aggiunti pulsanti per i link di ricerca
   - Aggiunto script `accommodation-car.js`

2. **css/style.css**
   - Aggiunti stili per le nuove sezioni `.accommodation-section` e `.car-section`
   - Stili per `.options-container` e `.option-item`
   - Layout responsive per mobile

3. **js/accommodation-car.js** (NUOVO FILE)
   - Gestione delle opzioni di alloggio e auto
   - Generazione automatica dei link con parametri:
     - `generateAirbnbLink()`: crea URL per Airbnb
     - `generateBookingLink()`: crea URL per Booking.com
     - `generateRentalCarsLink()`: crea URL per RentalCars
     - `generateHertzLink()`: crea URL per Hertz
   - Funzioni di salvataggio e caricamento delle opzioni

4. **js/app.js**
   - Aggiunti event listeners per i pulsanti di ricerca
   - Modificata `loadScenarioForm()` per caricare le opzioni
   - Modificata `updateTotals()` per calcolare i prezzi dalle opzioni selezionate
   - Modificata `saveScenario()` per salvare tutte le opzioni

### Struttura Dati Scenario

Ogni scenario ora include:

```javascript
{
  // ... campi esistenti ...
  
  // Nuovi campi per alloggio
  accommodationOptions: [
    { name: "Hotel Centro", price: 150 },
    { name: "Airbnb Periferia", price: 80 },
    { name: "B&B", price: 60 },
    { name: "Ostello", price: 30 },
    { name: "Casa Vacanze", price: 120 }
  ],
  selectedAccommodationIndex: 0, // Indice dell'opzione selezionata
  
  // Nuovi campi per auto
  carOptions: [
    { name: "Fiat 500", price: 35, selected: true },
    { name: "SUV", price: 80, selected: false },
    { name: "Van 9 posti", price: 120, selected: false },
    { name: "Auto Elettrica", price: 50, selected: false },
    { name: "Auto Lusso", price: 150, selected: false }
  ]
}
```

## Parametri dei Link di Ricerca

### Airbnb
- Destinazione (dalla destinazione dello scenario)
- Check-in (dalla data inizio)
- Check-out (dalla data fine)
- Numero adulti (dal numero partecipanti)

### Booking.com
- Destinazione (ss parameter)
- Anno/mese/giorno check-in
- Anno/mese/giorno check-out
- Numero adulti

### RentalCars
- Location (destinazione)
- Data/ora ritiro (data inizio, ore 10:00)
- Data/ora riconsegna (data fine, ore 10:00)

### Hertz
- Location (destinazione)
- Data/ora ritiro (data inizio, ore 10:00)
- Data/ora riconsegna (data fine, ore 10:00)

## Vantaggi

1. **Flessibilità**: Confronta facilmente diverse opzioni di alloggio e auto
2. **Automazione**: I link si aprono con tutti i parametri già compilati
3. **Precisione**: Il calcolo totale usa sempre i prezzi delle opzioni selezionate
4. **Organizzazione**: Tutte le opzioni sono salvate nello scenario per riferimento futuro
5. **Multi-selezione**: Possibilità di noleggiare più auto contemporaneamente

## Compatibilità

- ✅ Compatibile con scenari esistenti (vengono inizializzati con opzioni vuote)
- ✅ Funziona su desktop e mobile
- ✅ Tutti i browser moderni supportati

## Note

- I link di ricerca si aprono in una nuova scheda
- Se mancano informazioni (es: date non inserite), i link funzionano comunque ma senza quei parametri
- Le opzioni non compilate hanno prezzo 0 e non influenzano il totale
- Per le auto, il totale è la somma di tutte le opzioni selezionate

---

**Data modifica**: 4 Maggio 2026  
**Versione**: 2.0