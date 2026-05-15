# 🤖 Come Usare Norwy - Guida Rapida

## ⚠️ IMPORTANTE

Norwy funziona **SOLO** nell'applicazione principale (`index.html`), non nelle pagine di test o debug!

## 📋 Prerequisiti

Prima di usare Norwy per le query sui dati, devi:

1. ✅ Avere almeno uno **scenario** O un **consuntivo** creato
2. ✅ Aprire l'applicazione principale (`index.html`)
3. ✅ (Opzionale) Aprire uno scenario o consuntivo specifico

## 🚀 Come Usare Norwy per Query sui Dati

### Metodo 1: Query Generali (Senza Aprire Nulla)

```
1. Apri index.html
2. Resta sulla Dashboard
3. Clicca sull'icona Norwy (🤖) in basso a destra
4. Chiedi: "Qual è il totale?"
5. Norwy mostrerà TUTTI gli scenari e consuntivi
```

**Esempio:**
```
Tu: "Qual è il totale?"
Norwy: "💰 Costi Totali
       
       📋 Scenario Oslo: €2.400,00
       💰 Consuntivo Norvegia: €2.567,89"
```

### Metodo 2: Query su Scenario Specifico

```
1. Apri index.html
2. Vai su "Scenari"
3. Clicca su uno scenario per aprirlo
4. Clicca sull'icona Norwy (🤖)
5. Chiedi: "Quanto è costato il volo?"
6. Norwy risponderà con i dati di QUEL scenario
```

**Esempio:**
```
Tu: "Quanto è costato il volo a testa?"
Norwy: "✈️ Trasporto/Volo
       💰 Costo totale: €1.200,00
       👥 Partecipanti: 4
       💵 A testa: €300,00"
```

### Metodo 3: Query su Consuntivo Specifico

```
1. Apri index.html
2. Vai su "Consuntivi"
3. Clicca su un consuntivo per aprirlo
4. Clicca sull'icona Norwy (🤖)
5. Chiedi: "Quanto è costato il volo?"
6. Norwy risponderà con i dati di QUEL consuntivo
```

**Esempio:**
```
Tu: "Quanto costa l'hotel?"
Norwy: "🏨 Alloggio - Norvegia 2027
       💰 Costo totale: €856,34
       👥 Partecipanti: 4
       📝 Spese: 2"
```

### Metodo 4: Query sui Bilanci

```
1. Apri index.html
2. Vai su "Consuntivi"
3. Apri un consuntivo
4. Clicca su "Dare/Avere"
5. Clicca sull'icona Norwy (🤖)
6. Chiedi: "Quanto devo a Marco?"
7. Norwy mostrerà il bilancio
```

**Esempio:**
```
Tu: "Quanto devo a Marco?"
Norwy: "❌ Tu
       Deve dare: €45,50"
```

## 🔍 Domande Supportate

### Costi per Categoria
- "Quanto è costato il volo?"
- "Quanto costa l'hotel?"
- "Quanto abbiamo speso per le cene?"
- "Quanto costa l'auto?"
- "Quanto costano le attività?"

### Costi per Persona
- "Quanto è costato il volo a testa?"
- "Quanto costa l'hotel per persona?"
- "Quanto costa tutto a ciascuno?"

### Totali
- "Qual è il totale?"
- "Quanto abbiamo speso in tutto?"
- "Quanto costa tutto?"

### Bilanci
- "Quanto devo a [nome]?"
- "Quanto deve [nome]?"
- "Mostrami i bilanci"

## ❌ Errori Comuni

### Errore: "Non ci sono ancora scenari o consuntivi"

**Causa:** Non hai creato nessuno scenario o consuntivo

**Soluzione:**
1. Vai su "Scenari" o "Consuntivi"
2. Clicca "Nuovo Scenario" o "Nuovo Consuntivo"
3. Compila i dati e salva
4. Poi usa Norwy

### Errore: Norwy non risponde

**Causa:** Stai usando Norwy in una pagina di test/debug

**Soluzione:**
- Usa Norwy SOLO in `index.html`
- Non usarlo in `debug-norwy-query.html` o altre pagine di test

### Errore: "Devi aprire Dare/Avere"

**Causa:** Stai chiedendo bilanci senza essere nella sezione corretta

**Soluzione:**
1. Apri un consuntivo
2. Clicca su "Dare/Avere"
3. Poi chiedi i bilanci a Norwy

## 📊 Verifica Dati

Se Norwy dice che non ci sono dati:

1. **Apri debug-norwy-query.html**
2. **Controlla** la sezione "Actuals Data"
3. **Se mostra 0 actuals:**
   - Vai su index.html
   - Crea un consuntivo
   - Aggiungi spese
   - Salva
   - Riprova

## 💡 Suggerimenti

1. **Crea prima i dati** (scenari o consuntivi)
2. **Apri l'app principale** (index.html)
3. **Usa Norwy dall'app**, non da pagine di test
4. **Sii specifico** nelle domande
5. **Apri uno scenario/consuntivo** per query dettagliate

## 🎯 Workflow Consigliato

```
1. Apri index.html
2. Crea un consuntivo
3. Aggiungi spese
4. Salva
5. Clicca Norwy
6. Chiedi: "Qual è il totale?"
7. ✅ Norwy risponde con i dati!
```

## 📞 Supporto

Se Norwy continua a non vedere i dati:

1. Apri la console del browser (F12)
2. Scrivi: `localStorage.getItem('actuals')`
3. Se mostra `null` o `[]`, non ci sono consuntivi salvati
4. Crea un consuntivo e riprova

---

**Ricorda:** Norwy è un assistente che legge i dati dall'applicazione. Devi prima creare i dati nell'app, poi Norwy potrà leggerli e rispondere alle tue domande! 🤖✨