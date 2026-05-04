# 🧳 Business Case Viaggi

Un'applicazione web moderna e completa per la gestione di business case per viaggi, con funzionalità di confronto scenari, calcoli automatici e esportazione multi-formato.

## 📋 Caratteristiche Principali

### ✨ Funzionalità Core
- **Gestione Scenari**: Crea, modifica, duplica ed elimina scenari di viaggio illimitati
- **Categorie di Spesa**: Traccia spese per trasporto, alloggio, vitto, auto, attività e altro
- **Gestione Partecipanti**: Aggiungi partecipanti e calcola automaticamente i costi per persona
- **Confronto Scenari**: Confronta più scenari con tabelle e grafici interattivi
- **Dashboard Visuale**: Statistiche aggregate e panoramica completa dei tuoi viaggi

### 🔍 Ricerca Voli Integrata
- **Ricerca Rapida**: Cerca voli direttamente dall'app
- **Link Diretti**: Collegamenti ai principali siti di prenotazione
- **Pre-compilazione Automatica**: I dati dello scenario vengono utilizzati automaticamente
- **Supporto Multi-sito**: Skyscanner, Google Flights, Kayak, Momondo, eDreams

### 💾 Gestione Dati
- **Salvataggio Automatico**: Tutti i dati vengono salvati automaticamente nel browser
- **Backup Automatico**: Backup automatico ogni 5 minuti per sicurezza
- **Esportazione Multi-formato**:
  - **JSON**: Backup completo dei dati
  - **Excel/CSV**: Tabelle comparative per analisi
  - **PDF**: Report professionali stampabili
- **Importazione**: Carica dati precedentemente esportati

### 📊 Visualizzazioni
- Grafici a torta per distribuzione spese
- Grafici a barre per confronto scenari
- Grafici a barre raggruppate per categorie
- Statistiche in tempo reale

## 🚀 Come Iniziare

### Requisiti
- Un browser web moderno (Chrome, Firefox, Safari, Edge)
- Nessuna installazione richiesta!

### Avvio Rapido
1. Apri il file `index.html` nel tuo browser
2. Inizia creando il tuo primo scenario di viaggio
3. Aggiungi destinazione, partecipanti e spese
4. Confronta diversi scenari per prendere decisioni informate

## 📖 Guida all'Uso

### Creare un Nuovo Scenario

1. **Clicca su "+ Nuovo Scenario"** dalla dashboard o dalla vista scenari
2. **Compila le informazioni generali**:
   - Nome dello scenario (es: "Viaggio Roma 2026")
   - Destinazione (es: "Roma, Italia")
   - Date di inizio e fine (opzionale)

3. **Aggiungi i partecipanti**:
   - Inserisci il nome nel campo "Nome partecipante"
   - Clicca "+ Aggiungi" o premi Invio
   - Rimuovi partecipanti cliccando sulla ✕

4. **Inserisci le spese** per categoria:
   - 🚗 Trasporto (voli, treni, taxi) - **Clicca "✈️ Cerca voli" per trovare le migliori offerte!**
   - 🏨 Alloggio (hotel, appartamenti)
   - 🍽️ Vitto (ristoranti, supermercati)
   - 🚙 Auto/Noleggio
   - 🎭 Attività (musei, tour, eventi)
   - 📦 Altro (spese varie)

5. **Aggiungi note** (opzionale) per det agli aggiuntivi

6. **Salva lo scenario** - I totali vengono calcolati automaticamente

### Cercare Voli

1. Nel form dello scenario, clicca **"✈️ Cerca voli"** sotto il campo Trasporto
2. **Compila i dati di ricerca**:
   - Città di partenza (es: Milano)
   - Città di arrivo (viene pre-compilata dalla destinazione)
   - Date (vengono pre-compilate dalle date dello scenario)
   - Numero passeggeri (viene pre-compilato dai partecipanti)
3. **Clicca su uno dei siti** per aprire la ricerca:
   - 🔍 **Skyscanner** - Confronta centinaia di compagnie
   - 🌐 **Google Flights** - Ricerca veloce e intuitiva
   - 🛫 **Kayak** - Trova le migliori offerte
   - 💰 **Momondo** - Prezzi trasparenti
   - ✈️ **eDreams** - Voli low cost
4. **Confronta i prezzi** su più siti
5. **Inserisci il costo** nel campo Trasporto una volta trovato il volo migliore

### Confrontare Scenari

1. Vai alla sezione **"🔄 Confronta"**
2. **Seleziona almeno 2 scenari** dalle checkbox
3. Clicca **"Confronta Selezionati"**
4. Visualizza:
   - Statistiche comparative (min, max, media)
   - Tabella dettagliata con tutti i dati
   - Grafici interattivi per analisi visuale

### Esportare i Dati

1. Clicca su **"📤 Esporta"** nell'header
2. Scegli il formato desiderato:
   - **JSON**: Per backup completo o trasferimento dati
   - **Excel/CSV**: Per analisi in fogli di calcolo
   - **PDF**: Per report stampabili e presentazioni

### Importare Dati

1. Clicca su **"📥 Importa"** nell'header
2. Seleziona un file JSON precedentemente esportato
3. I dati verranno aggiunti a quelli esistenti

## 💡 Suggerimenti e Best Practices

### Organizzazione degli Scenari
- **Usa nomi descrittivi**: "Viaggio Roma Marzo 2026" invece di "Scenario 1"
- **Includi sempre le date** per un migliore tracking temporale
- **Sii preciso nelle categorie** di spesa per analisi più accurate

### Ricerca Voli
- **Usa la funzione integrata** invece di cercare manualmente
- **Confronta sempre più siti** per trovare il prezzo migliore
- **Considera voli con scalo** per risparmiare
- **Cerca in modalità incognito** sui siti per evitare aumenti di prezzo
- **Prenota in anticipo** per prezzi migliori (2-3 mesi prima)

### Gestione Partecipanti
- **Aggiungi tutti i partecipanti** anche se non pagano direttamente
- **Usa nomi completi** per evitare confusione
- **Considera partecipanti parziali** (es: chi si unisce solo per alcuni giorni)

### Confronto Efficace
- **Confronta scenari simili** (stessa destinazione, periodo simile)
- **Usa i grafici** per identificare rapidamente le differenze
- **Analizza il costo per persona** oltre al totale

### Backup e Sicurezza
- **Esporta regolarmente** i tuoi dati in JSON
- **Salva i file di backup** in un luogo sicuro
- **Testa l'importazione** periodicamente

## 🔧 Funzionalità Avanzate

### Calcoli Automatici
- **Totale spese**: Somma automatica di tutte le categorie
- **Costo per persona**: Divisione equa tra tutti i partecipanti
- **Durata viaggio**: Calcolo automatico dei giorni
- **Statistiche aggregate**: Media, min, max su tutti gli scenari

### Validazione Dati
- **Campi obbligatori**: Nome scenario e destinazione
- **Validazione date**: La data fine deve essere successiva all'inizio
- **Controllo numeri**: Solo valori numerici positivi per le spese

### Responsive Design
- **Ottimizzato per desktop**: Esperienza completa su schermi grandi
- **Compatibile mobile**: Interfaccia adattiva per smartphone e tablet
- **Touch-friendly**: Controlli ottimizzati per dispositivi touch

## 🎨 Personalizzazione

### Categorie di Spesa
Le categorie predefinite coprono la maggior parte dei casi d'uso:
- **Trasporto**: Tutti i mezzi di trasporto
- **Alloggio**: Hotel, B&B, appartamenti
- **Vitto**: Ristoranti, bar, supermercati
- **Auto**: Noleggio, carburante, parcheggi
- **Attività**: Musei, tour, eventi, shopping
- **Altro**: Spese varie non categorizzabili

### Valuta
- Attualmente supporta **Euro (€)**
- Formattazione automatica secondo lo standard italiano
- Separatori decimali e migliaia corretti

## 🔍 Risoluzione Problemi

### Dati Non Salvati
- **Controlla il browser**: Assicurati che localStorage sia abilitato
- **Spazio disponibile**: Libera spazio nel browser se necessario
- **Modalità privata**: I dati potrebbero non persistere in modalità incognito

### Problemi di Esportazione
- **Popup bloccati**: Abilita i popup per il download dei file
- **Browser obsoleto**: Aggiorna il browser all'ultima versione
- **Estensioni**: Disabilita temporaneamente ad-blocker o estensioni

### Problemi di Importazione
- **Formato file**: Assicurati che sia un file JSON valido
- **Dimensione file**: File troppo grandi potrebbero causare problemi
- **Struttura dati**: Usa solo file esportati dall'applicazione

## 📱 Compatibilità

### Browser Supportati
- ✅ **Chrome** 90+
- ✅ **Firefox** 88+
- ✅ **Safari** 14+
- ✅ **Edge** 90+

### Dispositivi
- ✅ **Desktop** (Windows, macOS, Linux)
- ✅ **Tablet** (iPad, Android)
- ✅ **Smartphone** (iOS, Android)

## 🔒 Privacy e Sicurezza

### Dati Locali
- **Tutti i dati rimangono sul tuo dispositivo**
- **Nessun server esterno** coinvolto
- **Nessun tracking** o raccolta dati

### Backup
- **Responsabilità dell'utente**: Esporta regolarmente i tuoi dati
- **Nessun cloud automatico**: Massima privacy e controllo
- **Crittografia locale**: I dati sono protetti dalle funzionalità del browser

## 🆘 Supporto

### FAQ Rapide

**Q: Posso usare l'app offline?**
A: Sì, una volta caricata la pagina, l'app funziona completamente offline.

**Q: I miei dati sono al sicuro?**
A: Sì, tutti i dati rimangono sul tuo dispositivo. Ricorda di fare backup regolari.

**Q: Posso condividere i miei scenari?**
A: Sì, esporta in JSON e condividi il file, oppure usa PDF per presentazioni.

**Q: Quanti scenari posso creare?**
A: Non c'è limite, dipende solo dallo spazio disponibile nel browser.

**Q: Posso modificare le categorie di spesa?**
A: Attualmente le categorie sono fisse, ma puoi usare "Altro" per spese non categorizzabili.

---

## 🎯 Sviluppo Futuro

Possibili miglioramenti futuri:
- Supporto per multiple valute
- Categorie di spesa personalizzabili
- Sincronizzazione cloud opzionale
- Grafici più avanzati
- Esportazione in altri formati
- Modalità collaborativa

---

**Versione**: 1.0  
**Ultimo aggiornamento**: Maggio 2026  
**Licenza**: Uso personale e commerciale consentito