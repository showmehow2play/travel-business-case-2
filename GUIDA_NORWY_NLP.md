# 🤖 Guida Norwy - Natural Language Processing

## Panoramica

Norwy è il chatbot intelligente di Travel Business Case che supporta:
- 📝 **Inserimento spese e pagamenti** tramite linguaggio naturale
- 📊 **Query sui dati** per interrogare costi e bilanci
- 💬 **Assistenza contestuale** su tutte le funzionalità

## 🚀 Funzionalità NLP

### 0. Query sui Dati (NUOVO! 🆕)

Puoi chiedere a Norwy informazioni sui tuoi scenari e consuntivi!

#### Esempi di Query

**Costi Specifici:**
```
Quanto è costato il volo?
Quanto costa l'hotel?
Quanto abbiamo speso per le cene?
Quanto costa l'auto a noleggio?
Quanto costano le attività?
```

**Costi per Persona:**
```
Quanto è costato il volo a testa?
Quanto costa l'hotel per persona?
Quanto costa tutto a ciascuno?
```

**Totali:**
```
Qual è il totale?
Quanto abbiamo speso in tutto?
Quanto costa tutto per persona?
```

**Bilanci:**
```
Quanto devo a Marco?
Quanto deve Luca?
Mostrami i bilanci
Chi deve dare soldi?
```

#### Come Funziona

1. **Apri uno scenario o consuntivo** (opzionale - se non lo fai, Norwy mostra tutti gli scenari)
2. **Clicca sull'icona Norwy**
3. **Fai la tua domanda** in linguaggio naturale
4. Norwy analizza i dati e risponde con:
   - 💰 Importi formattati
   - 👥 Numero partecipanti
   - 💵 Costi per persona (se richiesto)
   - ✅/❌ Stato bilanci (crediti/debiti)

#### Contesto Intelligente

- **Scenario Attivo**: Norwy risponde con i dati dello scenario corrente
- **Nessuno Scenario Attivo**: Norwy mostra un riepilogo di tutti gli scenari
- **Sezione Dare/Avere**: Norwy accede ai bilanci calcolati

---

### 1. Inserimento Pagamenti via Chat

Puoi registrare pagamenti tra partecipanti semplicemente scrivendo nella chat di Norwy.

#### Esempi di Comandi

```
Marco ha pagato 50€ a Luca
Sara ha pagato 30 euro a Giulia
Pagamento da Giovanni a Marco di 100€
Registra pagamento da me a Sara
```

#### Come Funziona

1. **Apri la sezione Dare/Avere** di un consuntivo
2. **Clicca sull'icona Norwy** (🤖) in basso a destra
3. **Scrivi il comando** nella chat
4. Norwy riconosce automaticamente:
   - Chi ha pagato (mittente)
   - Chi ha ricevuto (destinatario)
   - L'importo
5. Il pagamento viene **salvato e confermato automaticamente**
6. I **bilanci vengono aggiornati** immediatamente

#### Dialogo Guidato

Se non fornisci tutte le informazioni, Norwy te le chiederà:

```
Tu: "Registra pagamento"
Norwy: "Chi ha fatto il pagamento?"
Tu: "Marco"
Norwy: "A chi è stato fatto il pagamento?"
Tu: "Luca"
Norwy: "Qual è l'importo del pagamento?"
Tu: "50€"
Norwy: "✅ Pagamento registrato!"
```

#### Validazioni

- Verifica che i partecipanti esistano nel consuntivo
- Controlla che l'importo sia valido
- Mostra errori chiari se qualcosa non va

---

### 2. Inserimento Spese via Chat (In Sviluppo)

Puoi iniziare a registrare spese tramite chat.

#### Esempi di Comandi

```
Aggiungi spesa di 50€ per cena
Inserisci spesa: 120€ benzina
Nuova spesa 80€ hotel
Registra spesa di 45 euro per supermercato
```

#### Come Funziona

1. **Apri un consuntivo** (sezione Consuntivi)
2. **Clicca sull'icona Norwy**
3. **Scrivi il comando**
4. Norwy estrae:
   - Importo
   - Descrizione
5. **Nota**: Dovrai poi completare i dettagli nell'interfaccia (chi ha pagato, chi condivide la spesa)

#### Dialogo Guidato

```
Tu: "Aggiungi spesa"
Norwy: "Quanto è l'importo della spesa?"
Tu: "50€"
Norwy: "Per cosa è questa spesa?"
Tu: "cena"
Norwy: "✅ Spesa registrata! Completa i dettagli nell'interfaccia."
```

---

## 🎯 Pattern Riconosciuti

### Query sui Dati

| Pattern | Esempio |
|---------|---------|
| `Quanto [categoria]?` | Quanto è costato il volo? |
| `Quanto [categoria] a testa?` | Quanto costa l'hotel a testa? |
| `Quanto [categoria] per persona?` | Quanto costa tutto per persona? |
| `Qual è il totale?` | Qual è il totale? |
| `Quanto devo a [nome]?` | Quanto devo a Marco? |
| `Quanto deve [nome]?` | Quanto deve Luca? |
| `Mostrami i bilanci` | Mostrami i bilanci |

**Categorie Supportate:**
- Volo/Trasporto/Aereo
- Hotel/Alloggio/Casa
- Cena/Ristorante/Cibo/Vitto
- Auto/Macchina/Noleggio
- Attività/Escursioni
- Totale/Tutto

### Pagamenti

| Pattern | Esempio |
|---------|---------|
| `[Nome] ha pagato [importo] a [Nome]` | Marco ha pagato 50€ a Luca |
| `Pagamento da [Nome] a [Nome] di [importo]` | Pagamento da Sara a Giulia di 30€ |
| `Registra pagamento da [Nome] a [Nome]` | Registra pagamento da me a Marco |

### Spese

| Pattern | Esempio |
|---------|---------|
| `Aggiungi spesa di [importo] per [descrizione]` | Aggiungi spesa di 50€ per cena |
| `Inserisci spesa: [importo] [descrizione]` | Inserisci spesa: 120€ benzina |
| `Nuova spesa [importo] [descrizione]` | Nuova spesa 80€ hotel |

### Importi Supportati

- Con simbolo euro: `50€`, `50.5€`
- Con parola: `50 euro`, `50 eur`
- Solo numero: `50`, `50.5`
- Decimali con punto o virgola: `50.5` o `50,5`

---

## 💡 Suggerimenti

### Per Pagamenti

✅ **Consigliato:**
- Usa nomi esatti dei partecipanti
- Specifica sempre l'importo
- Usa comandi completi quando possibile

❌ **Evita:**
- Nomi abbreviati o nickname non registrati
- Importi senza numero
- Comandi ambigui

### Per Spese

✅ **Consigliato:**
- Descrizioni brevi e chiare
- Importi precisi
- Completa sempre i dettagli nell'interfaccia

❌ **Evita:**
- Descrizioni troppo lunghe
- Dimenticare di completare i dettagli

---

## 🔧 Comandi Speciali

| Comando | Azione |
|---------|--------|
| `annulla` | Annulla l'operazione corrente |
| `cancella` | Annulla l'operazione corrente |
| `aiuto` | Mostra tutte le funzionalità |

---

## 🐛 Risoluzione Problemi

### "Partecipante non trovato"

**Problema:** Il nome inserito non corrisponde a un partecipante del consuntivo.

**Soluzione:** 
- Verifica i nomi esatti in Anagrafica Partecipanti
- Usa il nome completo come registrato
- Controlla maiuscole/minuscole

### "Devi aprire Dare/Avere"

**Problema:** Stai cercando di registrare un pagamento senza essere nella sezione corretta.

**Soluzione:**
1. Vai su Consuntivi
2. Seleziona un consuntivo
3. Clicca su "Dare/Avere"
4. Poi usa Norwy

### "Non ho capito l'importo"

**Problema:** L'importo non è stato riconosciuto.

**Soluzione:**
- Usa numeri: `50` o `50.5`
- Aggiungi il simbolo: `50€`
- Evita testo: ~~"cinquanta euro"~~

---

## 📊 Vantaggi del NLP

### Velocità ⚡
Registra pagamenti in pochi secondi senza aprire form

### Naturalezza 💬
Scrivi come parleresti normalmente

### Conferma Automatica ✅
I pagamenti vengono confermati e i bilanci aggiornati subito

### Storico 📝
Tutte le conversazioni sono salvate

### Accessibilità 📱
Funziona su desktop e mobile

---

## 🔮 Prossimi Sviluppi

- [ ] Inserimento completo spese con tutti i dettagli
- [ ] Modifica/cancellazione pagamenti via chat
- [ ] Supporto per più valute
- [ ] Riconoscimento date ("ieri", "oggi", "lunedì scorso")
- [ ] Comandi vocali
- [ ] Suggerimenti intelligenti basati sullo storico

---

## 📚 Esempi Pratici

### Scenario 1: Pagamento Rapido

```
Situazione: Marco ha appena pagato 50€ a Luca per la cena

1. Apri Dare/Avere
2. Clicca su Norwy
3. Scrivi: "Marco ha pagato 50€ a Luca"
4. ✅ Fatto! Il bilancio è aggiornato
```

### Scenario 2: Dialogo Guidato

```
Situazione: Vuoi registrare un pagamento ma non ricordi il formato

1. Apri Dare/Avere
2. Clicca su Norwy
3. Scrivi: "Registra pagamento"
4. Segui le domande di Norwy
5. ✅ Pagamento completato
```

### Scenario 3: Spesa Veloce

```
Situazione: Hai appena fatto benzina per 45€

1. Apri un Consuntivo
2. Clicca su Norwy

### Scenario 4: Query sui Costi

```
Situazione: Vuoi sapere quanto è costato il volo per persona

1. Apri uno scenario o consuntivo (opzionale)
2. Clicca su Norwy
3. Scrivi: "Quanto è costato il volo a testa?"
4. ✅ Norwy risponde con il costo per persona
```

### Scenario 5: Verifica Bilanci

```
Situazione: Vuoi sapere quanto devi a Marco

1. Vai su Dare/Avere di un consuntivo
2. Clicca su Norwy
3. Scrivi: "Quanto devo a Marco?"
4. ✅ Norwy mostra il tuo bilancio con Marco
```
3. Scrivi: "Aggiungi spesa di 45€ per benzina"
4. Vai su Consuntivi e completa i dettagli
5. ✅ Spesa registrata
```

---

## 🎓 Best Practices

1. **Usa Norwy per operazioni rapide** - Perfetto per pagamenti veloci
2. **Usa l'interfaccia per operazioni complesse** - Meglio per spese con molti dettagli
3. **Verifica sempre i risultati** - Controlla che i dati siano corretti
4. **Sfrutta il dialogo guidato** - Se non ricordi il formato, lascia che Norwy ti guidi
5. **Mantieni nomi coerenti** - Usa sempre gli stessi nomi in Anagrafica

---

## 📞 Supporto

Per domande o problemi:
- Chiedi a Norwy: "aiuto"
- Consulta la documentazione completa
- Verifica le guide specifiche (GUIDA_PAGAMENTI.md)

---

**Made with ❤️ by Bob**