# 🔄 Guida Sincronizzazione Automatica

## Come Funziona

Il sistema sincronizza automaticamente i dati tra dispositivi usando Supabase.

### Sincronizzazione Automatica

#### 1. All'Avvio dell'Applicazione
Quando apri la pagina, il sistema:
1. ✅ Scarica automaticamente i dati più recenti da Supabase
2. ✅ Aggiorna il localStorage con i dati scaricati
3. ✅ Ricarica l'interfaccia con i dati aggiornati

#### 2. Ad Ogni Modifica
Quando modifichi i dati (aggiungi pagamento, confermi pagamento, ecc.), il sistema:
1. ✅ Salva immediatamente in localStorage
2. ✅ Carica automaticamente su Supabase
3. ✅ I dati sono disponibili per altri dispositivi

## Flusso Completo

### Scenario: Inserimento Pagamento

**Dispositivo A (Browser 1):**
1. Vai su Dare/Avere
2. Inserisci pagamento: Lorenzo → Ilaria €423.01
3. Conferma il pagamento
4. Il sistema salva su Supabase automaticamente ✅

**Dispositivo B (Browser 2):**
1. Ricarica la pagina (F5)
2. Il sistema scarica automaticamente da Supabase ✅
3. Vedi il pagamento di Lorenzo → Ilaria
4. I bilanci sono aggiornati

## Verifica Sincronizzazione

### Console del Browser (F12)

All'avvio dovresti vedere:
```
🔄 Sincronizzazione automatica da Supabase all'avvio...
✅ Dati sincronizzati da Supabase
📊 Dati aggiornati da Supabase, ricaricamento interfaccia...
```

Quando salvi un pagamento:
```
Consuntivo salvato correttamente: {...}
```

### Verifica Manuale

1. **Dispositivo A**: Inserisci un pagamento
2. **Dispositivo B**: Ricarica la pagina
3. **Verifica**: Il pagamento deve essere visibile

## Risoluzione Problemi

### I dati non si sincronizzano

#### Verifica 1: Supabase Configurato
1. Apri la console (F12)
2. Digita: `window.isSupabaseEnabled`
3. Deve restituire `true`

#### Verifica 2: Connessione Supabase
1. Apri la console (F12)
2. Digita: `await SupabaseStorage.syncFromSupabase()`
3. Deve restituire `true`

#### Verifica 3: Dati su Supabase
1. Vai su Supabase Dashboard
2. Apri la tabella `actuals`
3. Verifica che ci siano i dati aggiornati

### I pagamenti non si vedono su altri dispositivi

#### Soluzione 1: Ricarica Pagina
- Premi F5 sul dispositivo B
- La sincronizzazione avviene all'avvio

#### Soluzione 2: Sincronizzazione Manuale
- Clicca sul pulsante "☁️ Sync Supabase"
- Questo forza la sincronizzazione

#### Soluzione 3: Verifica Conferma
- I pagamenti devono essere **confermati** (badge verde ✓)
- Solo i pagamenti confermati modificano i bilanci

### I bilanci non si aggiornano

#### Causa Possibile: Formula Bilanci
Verifica che la formula sia corretta:
```javascript
Bilancio = paid - owes + paymentsMade - paymentsReceived
```

#### Test Formula
1. Apri `test-formula-bilanci.html`
2. Verifica che tutti i test siano ✅ CORRETTO

## Sincronizzazione in Tempo Reale

### Attualmente
- ❌ Non implementata
- ✅ Sincronizzazione all'avvio
- ✅ Sincronizzazione ad ogni salvataggio

### Per Implementare Tempo Reale
Sarebbe necessario attivare le sottoscrizioni Supabase Realtime:

```javascript
// Già presente in supabase-storage.js ma non attivato
SupabaseStorage.subscribeToChanges((table) => {
    console.log(`Cambiamento rilevato in ${table}`);
    // Ricarica i dati
    SupabaseStorage.syncFromSupabase();
    // Aggiorna interfaccia
    if (table === 'actuals' && SettlementsManager.currentActual) {
        SettlementsManager.loadActual(SettlementsManager.currentActual.id);
    }
});
```

## Best Practices

### Per Utenti

1. **Ricarica la pagina** quando passi da un dispositivo all'altro
2. **Conferma sempre i pagamenti** per renderli effettivi
3. **Verifica nella console** se ci sono errori

### Per Sviluppatori

1. **Testa sempre su più dispositivi** prima di rilasciare
2. **Monitora la console** per errori di sincronizzazione
3. **Verifica Supabase Dashboard** per confermare i dati

## Limitazioni Attuali

1. ⚠️ **Non tempo reale**: Serve ricaricare la pagina
2. ⚠️ **Conflitti**: Se due utenti modificano contemporaneamente, vince l'ultimo
3. ⚠️ **Latenza**: Dipende dalla connessione internet

## Prossimi Miglioramenti

1. 🔄 Sincronizzazione in tempo reale con Supabase Realtime
2. 🔒 Gestione conflitti con timestamp
3. 📱 Notifiche push per modifiche
4. 💾 Cache offline con Service Worker

---

**Made with Bob** 🤖