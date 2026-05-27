# 🔄 Guida alla Sincronizzazione Supabase

## 📋 Problema Risolto

**Problema**: Gli scenari creati in Chrome non erano visibili in Firefox (e viceversa) perché venivano salvati solo nel localStorage del browser specifico.

**Soluzione**: Ora l'applicazione salva automaticamente tutti i dati sia su localStorage che su Supabase, e li carica da Supabase all'avvio.

---

## ✅ Come Funziona Ora

### 1. **All'Avvio dell'Applicazione**
Quando apri `index.html`, l'app:
1. ✅ Si connette a Supabase
2. ✅ Scarica tutti gli scenari dal database
3. ✅ Li salva nel localStorage locale
4. ✅ Li mostra nell'interfaccia

### 2. **Quando Crei/Modifichi uno Scenario**
Ogni operazione viene salvata **automaticamente** in entrambi i posti:
- 💾 **localStorage** (per accesso veloce offline)
- ☁️ **Supabase** (per sincronizzazione cross-device)

### 3. **Quando Cambi Browser/Dispositivo**
Aprendo l'app da un altro browser o dispositivo:
- ✅ I dati vengono scaricati automaticamente da Supabase
- ✅ Vedi tutti gli scenari creati da qualsiasi dispositivo

---

## 🚀 Come Sincronizzare i Dati Esistenti

Se hai già degli scenari salvati solo in localStorage (creati prima di questa modifica):

### Metodo 1: Pulsante Sync nell'App
1. Apri `index.html` nel browser dove hai gli scenari
2. Clicca sul pulsante **"☁️ Sync Supabase"** nell'header
3. Tutti i dati locali verranno caricati su Supabase
4. Apri l'app da un altro browser per verificare

### Metodo 2: Pagina di Test
1. Apri `test-supabase-sync.html`
2. Clicca su **"🔄 Sincronizzazione Completa"**
3. Verifica con **"🌐 Verifica Dati"**

---

## 🧪 Come Testare la Sincronizzazione

### Test Completo Cross-Browser

1. **In Chrome:**
   ```
   1. Apri index.html
   2. Crea un nuovo scenario (es: "Test Chrome")
   3. Verifica che appaia nella lista
   ```

2. **In Firefox:**
   ```
   1. Apri index.html
   2. Dovresti vedere "Test Chrome" nella lista
   3. Crea un nuovo scenario (es: "Test Firefox")
   ```

3. **Torna in Chrome:**
   ```
   1. Ricarica la pagina (F5)
   2. Dovresti vedere anche "Test Firefox"
   ```

### Verifica Tecnica

Apri `test-supabase-sync.html` per:
- ✅ Verificare la connessione a Supabase
- ✅ Testare creazione/lettura scenari
- ✅ Vedere i log delle operazioni
- ✅ Verificare sincronizzazione cross-device

---

## 🔧 Modifiche Tecniche Effettuate

### 1. `storage.js`
- ✅ Funzione `init()` ora carica dati da Supabase all'avvio
- ✅ Tutte le funzioni di salvataggio sono async
- ✅ Ogni operazione salva su localStorage + Supabase

### 2. Funzioni Modificate
```javascript
// Ora sono async e salvano su Supabase
- addScenario()
- updateScenario()
- deleteScenario()
- addActual()
- updateActual()
- deleteActual()
- saveData()
```

### 3. Flusso di Sincronizzazione
```
Avvio App
    ↓
Supabase disponibile?
    ↓ Sì
Scarica dati da Supabase
    ↓
Salva in localStorage
    ↓
Mostra nell'interfaccia
```

---

## ⚠️ Note Importanti

### Conflitti di Dati
Se hai dati diversi in localStorage e Supabase:
- **All'avvio**: Supabase sovrascrive localStorage
- **Al salvataggio**: Entrambi vengono aggiornati

### Primo Utilizzo
La prima volta che apri l'app dopo questa modifica:
1. Se hai dati solo in localStorage → Usa il pulsante "Sync Supabase"
2. Se hai dati solo in Supabase → Verranno scaricati automaticamente
3. Se non hai dati → Verranno caricati i dati di esempio

### Offline
- ✅ L'app funziona anche offline (usa localStorage)
- ⚠️ I dati offline non saranno visibili su altri dispositivi
- ✅ Alla riconnessione, i dati vengono sincronizzati automaticamente

---

## 🐛 Risoluzione Problemi

### "Non vedo gli scenari da un altro browser"

**Soluzione:**
1. Apri `test-supabase-sync.html`
2. Verifica che Supabase sia connesso (✅ verde)
3. Clicca "Leggi da Supabase" per vedere quanti scenari ci sono
4. Se ci sono 0 scenari, usa "Sincronizza Tutto" dal browser con i dati

### "Errore connessione Supabase"

**Verifica:**
1. Controlla `js/supabase-config.js`
2. Verifica che URL e anonKey siano corretti
3. Controlla la console del browser per errori
4. Verifica che le tabelle esistano su Supabase

### "I dati non si sincronizzano"

**Controlla:**
1. Console del browser (F12) per errori
2. Apri `test-supabase-sync.html` per diagnostica
3. Verifica la connessione internet
4. Controlla i permessi delle tabelle su Supabase

---

## 📊 Struttura Database Supabase

Le tabelle necessarie:

### `scenarios`
```sql
- id (text, primary key)
- data (jsonb)
- updated_at (timestamp)
```

### `actuals`
```sql
- id (text, primary key)
- data (jsonb)
- updated_at (timestamp)
```

### `participants`
```sql
- id (text, primary key)
- data (jsonb)
- updated_at (timestamp)
```

---

## 🎯 Prossimi Passi

1. ✅ Sincronizza i dati esistenti usando il pulsante "Sync Supabase"
2. ✅ Testa la sincronizzazione cross-browser
3. ✅ Verifica che tutto funzioni con `test-supabase-sync.html`
4. 🎉 Goditi la sincronizzazione automatica!

---

## 💡 Suggerimenti

- **Backup**: I dati sono salvati sia localmente che su Supabase (doppia sicurezza)
- **Performance**: Il caricamento iniziale potrebbe richiedere 1-2 secondi
- **Privacy**: Solo tu puoi accedere ai tuoi dati (tramite le credenziali Supabase)
- **Collaborazione**: Puoi condividere le credenziali Supabase per lavorare in team

---

Made with ❤️ by Bob