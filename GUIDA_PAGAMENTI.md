# 💳 Guida ai Pagamenti tra Partecipanti

## Panoramica

La nuova funzionalità di **Gestione Pagamenti** permette di tracciare i pagamenti effettuati tra i partecipanti di un viaggio, aggiornando automaticamente i bilanci Dare/Avere.

## Come Funziona

### 1. Visualizzazione Bilanci

Nella vista **Dare/Avere**, ogni partecipante ha una card che mostra:
- 💰 **Ha pagato**: Totale spese sostenute
- 📊 **Sua quota spese**: Quanto deve per le spese condivise
- ✅ **Pagamenti ricevuti**: Importo totale ricevuto da altri
- 💸 **Pagamenti effettuati**: Importo totale pagato ad altri
- ⚖️ **Bilancio finale**: Saldo considerando tutti i pagamenti

### 2. Registrare un Pagamento

Ci sono **due modi** per registrare un pagamento:

#### Metodo A: Nuovo Pagamento Generico
1. Clicca sul pulsante **"➕ Nuovo Pagamento"** in cima alla sezione bilanci
2. Seleziona chi effettua il pagamento (Da chi)
3. Seleziona chi riceve il pagamento (A chi)
4. Inserisci importo, data e note opzionali
5. Clicca **"💾 Salva Pagamento"**
6. Il modal si chiude automaticamente

#### Metodo B: Dalla Card Partecipante
Ogni card partecipante ha un pulsante:
- **"💳 Registra Pagamento"** - se il partecipante deve dare
- **"💳 Registra Incasso"** - se il partecipante deve ricevere

Passi:
1. Clicca sul pulsante nella card del partecipante
2. Nel modal che si apre, seleziona l'altro partecipante
3. Conferma o modifica l'importo (pre-compilato con il bilancio)
4. Inserisci data e note opzionali
5. **Scegli se confermare subito** (checkbox selezionato di default)
6. Clicca **"💾 Salva Pagamento"**
7. Il modal si chiude automaticamente

### ⚡ Conferma Immediata (Novità!)

Quando inserisci un pagamento, puoi scegliere se:
- ✅ **Confermare immediatamente** (checkbox selezionato) → Il pagamento viene scalato subito dai bilanci e appare nei trasferimenti ottimizzati
- ⏳ **Confermare dopo** (checkbox deselezionato) → Il pagamento resta in attesa e dovrai confermarlo manualmente

**Consiglio**: Lascia il checkbox selezionato per confermare subito e vedere i bilanci aggiornati immediatamente!

**Nota**: Il modal si chiude automaticamente dopo il salvataggio in entrambi i metodi.

### 3. Confermare un Pagamento Manualmente

Se hai deselezionato il checkbox "Conferma pagamento immediatamente", il pagamento avrà lo stato **"⏳ In attesa"**.

Per confermare un pagamento in attesa:
1. Vai alla sezione **"📋 Storico Pagamenti"**
2. Trova il pagamento da confermare
3. Clicca sul pulsante **"✓ Conferma"**

**Importante**: Solo i pagamenti confermati vengono considerati nel calcolo dei bilanci e nei trasferimenti ottimizzati!

### 4. Storico Pagamenti

La sezione **"📋 Storico Pagamenti"** mostra tutti i pagamenti registrati:

#### Pagamenti Confermati (✓)
- Sfondo grigio chiaro
- Badge verde "✓ Confermato"
- Vengono scalati dai bilanci

#### Pagamenti In Attesa (⏳)
- Sfondo giallo chiaro
- Badge giallo "⏳ In attesa"
- NON vengono ancora scalati dai bilanci

Ogni pagamento mostra:
- 👤 Da chi → A chi (con foto se disponibili)
- 💰 Importo
- 📅 Data
- 💬 Note (se presenti)
- Pulsanti per confermare o eliminare

### 5. Eliminare un Pagamento

Per eliminare un pagamento:
1. Trova il pagamento nello storico
2. Clicca sul pulsante **"🗑️"**
3. Conferma l'eliminazione

## Esempio Pratico

### Scenario Iniziale
- **Alice** ha pagato €300 per l'hotel
- **Bob** ha pagato €150 per il ristorante
- **Charlie** non ha pagato nulla
- Spese condivise tra tutti e tre

### Bilanci Iniziali
- Alice: Deve ricevere €100 (ha pagato €300, deve €150)
- Bob: In pari (ha pagato €150, deve €150)
- Charlie: Deve dare €150 (ha pagato €0, deve €150)

### Registrazione Pagamento
1. Charlie clicca su **"Registra Pagamento"** nella sua card
2. Seleziona **"Alice"** come destinatario
3. Inserisce **€100** come importo
4. Aggiunge nota: "Pagamento per hotel"
5. Salva il pagamento

### Stato: In Attesa
- Il pagamento appare nello storico con badge giallo
- I bilanci NON cambiano ancora
- Alice: Deve ricevere €100
- Charlie: Deve dare €150

### Conferma Pagamento
1. Alice (o chiunque) clicca su **"✓ Conferma"**
2. Il pagamento viene confermato

### Bilanci Aggiornati
- Alice: In pari (€100 ricevuti - €100 da ricevere = €0)
- Bob: In pari
- Charlie: Deve dare €50 (€150 - €100 pagati = €50)

## Vantaggi

✅ **Tracciabilità**: Storico completo di tutti i pagamenti  
✅ **Conferma**: Sistema di conferma per evitare errori  
✅ **Aggiornamento Automatico**: I bilanci si aggiornano automaticamente  
✅ **Flessibilità**: Possibilità di pagamenti parziali  
✅ **Note**: Aggiungi contesto ai pagamenti  
✅ **Foto**: Visualizzazione foto partecipanti per identificazione rapida

## Integrazione con Trasferimenti Ottimizzati

Il pulsante **"⚡ Ottimizza Trasferimenti"** calcola i trasferimenti minimi necessari per pareggiare tutti i conti.

### Come Funziona
L'algoritmo considera automaticamente:
- ✅ Le spese sostenute da ogni partecipante
- ✅ Le quote spese dovute da ognuno
- ✅ **I pagamenti già confermati** (ricevuti ed effettuati)

Quindi i trasferimenti ottimizzati mostrano **solo i pagamenti ancora necessari** per chiudere definitivamente tutti i conti, escludendo ciò che è già stato pagato e confermato.

### 🎯 Pagamenti Custom (Tra Persone Diverse)

**IMPORTANTE**: Il sistema gestisce correttamente i pagamenti tra **qualsiasi coppia di partecipanti**, anche se diversi da quelli suggeriti dall'ottimizzazione.

#### Come Funziona
Quando inserisci un pagamento tra due persone:
1. Il pagamento viene **sottratto** dal bilancio di chi paga
2. Il pagamento viene **aggiunto** al bilancio di chi riceve
3. L'ottimizzazione **ricalcola automaticamente** i trasferimenti necessari

#### Esempio Pratico
**Situazione iniziale:**
- Alice deve ricevere €100
- Bob deve ricevere €50
- Charlie deve dare €150

**Sistema suggerisce:**
- Charlie → Alice: €100
- Charlie → Bob: €50

**Ma tu inserisci un pagamento custom:**
- Charlie → Bob: €50 (confermato)

**Bilanci aggiornati:**
- Alice deve ricevere €100 (invariato)
- Bob in pari (€50 - €50 = €0)
- Charlie deve dare €100 (€150 - €50 = €100)

**Nuovi trasferimenti ottimizzati:**
- Charlie → Alice: €100 (il pagamento a Bob è già stato fatto!)

### Esempio Standard
**Prima dei pagamenti:**
- Alice deve ricevere €100
- Bob in pari
- Charlie deve dare €100

**Dopo pagamento confermato** (Charlie → Alice €50):
- Alice deve ricevere €50
- Bob in pari
- Charlie deve dare €50

**Trasferimenti ottimizzati** mostrerà solo:
- Charlie → Alice: €50 (il resto è già stato pagato!)

## Note Tecniche

### Struttura Dati
Ogni pagamento è salvato con:
```javascript
{
  id: "timestamp",
  from: "Nome Pagatore",
  to: "Nome Destinatario",
  amount: 100.00,
  date: "2026-05-12",
  notes: "Note opzionali",
  confirmed: false,
  createdAt: "2026-05-12T13:00:00.000Z",
  confirmedAt: "2026-05-12T14:00:00.000Z" // solo se confermato
}
```

### Calcolo Bilanci
Il bilancio finale di ogni partecipante è:
```
Bilancio = (Spese Pagate) - (Quota Spese) + (Pagamenti Effettuati) - (Pagamenti Ricevuti)
```

**IMPORTANTE:** I pagamenti tra partecipanti sono trasferimenti che saldano i debiti:
- **Chi paga**: il pagamento riduce il suo debito (+paymentsMade)
- **Chi riceve**: il pagamento riduce il suo credito (-paymentsReceived)

Solo i pagamenti con `confirmed: true` vengono considerati nel calcolo.

## Risoluzione Problemi

### Il pagamento non appare nello storico
- Verifica di aver salvato correttamente
- Ricarica la pagina
- Controlla la console del browser per errori

### I bilanci non si aggiornano
- Verifica che il pagamento sia **confermato** (badge verde)
- Solo i pagamenti confermati modificano i bilanci
- Ricarica la vista Dare/Avere

### Non vedo il pulsante "Registra Pagamento"
- Il pulsante appare solo se il partecipante ha un bilancio diverso da zero
- Se il bilancio è €0, il partecipante è già in pari

## Test

Per testare la funzionalità:
1. Apri `test-payments.html` nel browser
2. Esegui i test uno per uno o tutti insieme
3. Verifica che tutti i test passino con successo

## Supporto

Per problemi o domande sulla funzionalità pagamenti, consulta:
- Questo documento
- Il file `test-payments.html` per esempi pratici
- Il codice sorgente in `js/settlements.js`

---

**Made with Bob** 🤖