# 🎨 Mockup Sistema Accesso e Permessi

## 📋 Panoramica Sistema

Sistema semplificato con:
- **1 Superuser** (amministratore)
- **N Utenti** (accesso limitato)
- **Gruppi** associati a scenari specifici
- **Visibilità** basata su appartenenza al gruppo

---

## 🔐 Flusso di Accesso

### 1. Pagina Login

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              🧳 Business Case Viaggi                │
│                                                     │
│         ┌───────────────────────────────┐          │
│         │                               │          │
│         │   📧 Email                    │          │
│         │   ┌─────────────────────┐    │          │
│         │   │ mario@example.com   │    │          │
│         │   └─────────────────────┘    │          │
│         │                               │          │
│         │   🔒 Password                 │          │
│         │   ┌─────────────────────┐    │          │
│         │   │ ••••••••••••        │    │          │
│         │   └─────────────────────┘    │          │
│         │                               │          │
│         │   ☐ Ricordami                │          │
│         │                               │          │
│         │      ┌──────────────┐        │          │
│         │      │ 🔐 Accedi    │        │          │
│         │      └──────────────┘        │          │
│         │                               │          │
│         └───────────────────────────────┘          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 👤 Esperienza Utente Normale

### Dashboard Utente (Mario Rossi)

```
┌──────────────────────────────────────────────────────────────┐
│ 🧳 Business Case Viaggi          👤 Mario Rossi ▼  🚪 Esci  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 Dashboard    📋 I Miei Scenari                          │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📋 Scenari Accessibili                                      │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 🇳🇴 Viaggio Norvegia 2027                          │    │
│  │ Gruppo: Team Marketing                             │    │
│  │ Budget: €15,000 • 8 partecipanti                   │    │
│  │                    [👁️ Visualizza] [✏️ Modifica]   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 🇮🇹 Weekend Roma                                    │    │
│  │ Gruppo: Team Marketing                             │    │
│  │ Budget: €3,500 • 5 partecipanti                    │    │
│  │                    [👁️ Visualizza] [✏️ Modifica]   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  [➕ Nuovo Scenario per Team Marketing]                    │
│                                                              │
│  ℹ️ Puoi creare e modificare scenari del tuo gruppo        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Cosa può fare Mario (membro del gruppo):**
- ✅ Vedere scenari del "Team Marketing"
- ✅ Visualizzare dettagli e consuntivi
- ✅ **MODIFICARE** scenari del suo gruppo
- ✅ **CREARE** nuovi scenari per il suo gruppo
- ❌ NON può vedere scenari di altri gruppi
- ❌ NON può accedere al pannello admin
- ❌ NON può gestire utenti o gruppi

---

## 👑 Esperienza Superuser

### Dashboard Superuser (Admin)

```
┌──────────────────────────────────────────────────────────────┐
│ 🧳 Business Case Viaggi     👑 Admin ▼  ⚙️ Admin  🚪 Esci   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 Dashboard    📋 Scenari    👥 Utenti    👨‍👩‍👧‍👦 Gruppi      │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 Dashboard Amministratore                                │
│                                                              │
│  [📋 Scenari] [📝 Log Attività] [👥 Utenti] [👨‍👩‍👧‍👦 Gruppi]  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📋 Tutti gli Scenari (Accesso Completo)                    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 🇳🇴 Viaggio Norvegia 2027                          │    │
│  │ Gruppo: Team Marketing                             │    │
│  │ Budget: €15,000 • 8 partecipanti                   │    │
│  │                    [✏️ Modifica] [🔒 Permessi] [🗑️] │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 🇮🇹 Weekend Roma                                    │    │
│  │ Gruppo: Team Marketing                             │    │
│  │ Budget: €3,500 • 5 partecipanti                    │    │
│  │                    [✏️ Modifica] [🔒 Permessi] [🗑️] │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 🇫🇷 Parigi Business Trip                            │    │
│  │ Gruppo: Team Vendite                               │    │
│  │ Budget: €8,000 • 4 partecipanti                    │    │
│  │                    [✏️ Modifica] [🔒 Permessi] [🗑️] │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  [➕ Nuovo Scenario]                                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Cosa può fare Admin:**
- ✅ Vedere TUTTI gli scenari
- ✅ Creare, modificare, eliminare scenari
- ✅ Gestire utenti e gruppi
- ✅ Assegnare permessi
- ✅ Accedere al pannello amministrazione

---

## ⚙️ Pannello Amministrazione

### Tab: Log Attività (NUOVO!)

```
┌──────────────────────────────────────────────────────────────┐
│ 📝 Log Attività Utenti                                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Filtri: [Tutti gli utenti ▼] [Tutte le azioni ▼]          │
│          [Ultimi 7 giorni ▼]                    [🔍 Cerca]  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 🟢 Mario Rossi ha CREATO uno scenario              │    │
│  │ "Escursione Fiordi" • Gruppo: Team Marketing      │    │
│  │ 29/05/2026 14:23                                   │    │
│  │                                    [👁️ Dettagli]   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 🟡 Laura Bianchi ha MODIFICATO uno scenario        │    │
│  │ "Viaggio Norvegia 2027" • Gruppo: Team Marketing  │    │
│  │ Modifiche: Budget aggiornato da €14,000 a €15,000 │    │
│  │ 29/05/2026 11:45                                   │    │
│  │                                    [👁️ Dettagli]   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 🟡 Paolo Verdi ha MODIFICATO uno scenario          │    │
│  │ "Parigi Business Trip" • Gruppo: Team Vendite     │    │
│  │ Modifiche: Aggiunto partecipante "Anna Neri"      │    │
│  │ 28/05/2026 16:30                                   │    │
│  │                                    [👁️ Dettagli]   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 🟢 Giovanni Blu ha CREATO uno scenario             │    │
│  │ "Workshop Milano" • Gruppo: Team Marketing        │    │
│  │ 28/05/2026 09:15                                   │    │
│  │                                    [👁️ Dettagli]   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 🔴 Mario Rossi ha ELIMINATO uno scenario           │    │
│  │ "Test Scenario" • Gruppo: Team Marketing          │    │
│  │ 27/05/2026 18:00                                   │    │
│  │                                    [👁️ Dettagli]   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│                    [⬅️ Precedente] [Successivo ➡️]          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Legenda Colori:**
- 🟢 Verde = Creazione
- 🟡 Giallo = Modifica
- 🔴 Rosso = Eliminazione

### Tab: Gestione Utenti

```
┌──────────────────────────────────────────────────────────────┐
│ ⚙️ Pannello Amministrazione                                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [👥 Utenti]  [👨‍👩‍👧‍👦 Gruppi]  [📋 Scenari]                    │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  👥 Gestione Utenti                    [➕ Nuovo Utente]    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Nome          Email              Gruppi      Azioni│    │
│  ├────────────────────────────────────────────────────┤    │
│  │ Mario Rossi   mario@ex.com      Team Marketing    │    │
│  │                                                [⚙️] │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ Laura Bianchi laura@ex.com      Team Marketing    │    │
│  │                                 Team Vendite  [⚙️] │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ Paolo Verdi   paolo@ex.com      Team Vendite  [⚙️] │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ Anna Neri     anna@ex.com       Nessun gruppo [⚙️] │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Tab: Gestione Gruppi

```
┌──────────────────────────────────────────────────────────────┐
│ ⚙️ Pannello Amministrazione                                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [👥 Utenti]  [👨‍👩‍👧‍👦 Gruppi]  [📋 Scenari]                    │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  👨‍👩‍👧‍👦 Gestione Gruppi                    [➕ Nuovo Gruppo]   │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 📦 Team Marketing                                  │    │
│  │ 👥 3 membri • 📋 2 scenari                         │    │
│  │                                                    │    │
│  │ Membri:                                            │    │
│  │ • Mario Rossi                              [❌]    │    │
│  │ • Laura Bianchi                            [❌]    │    │
│  │ • Giovanni Blu                             [❌]    │    │
│  │                                                    │    │
│  │ Scenari Assegnati:                                 │    │
│  │ • Viaggio Norvegia 2027                    [❌]    │    │
│  │ • Weekend Roma                             [❌]    │    │
│  │                                                    │    │
│  │ [➕ Aggiungi Membro] [➕ Assegna Scenario]         │    │
│  │                                    [✏️] [🗑️]       │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 💼 Team Vendite                                    │    │
│  │ 👥 2 membri • 📋 1 scenario                        │    │
│  │                                                    │    │
│  │ Membri:                                            │    │
│  │ • Laura Bianchi                            [❌]    │    │
│  │ • Paolo Verdi                              [❌]    │    │
│  │                                                    │    │
│  │ Scenari Assegnati:                                 │    │
│  │ • Parigi Business Trip                     [❌]    │    │
│  │                                                    │    │
│  │ [➕ Aggiungi Membro] [➕ Assegna Scenario]         │    │
│  │                                    [✏️] [🗑️]       │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔒 Dialog Assegnazione Permessi Scenario

Quando l'admin clicca su "🔒 Permessi" su uno scenario:

```
┌─────────────────────────────────────────────────────┐
│ 🔒 Gestisci Accesso - Viaggio Norvegia 2027        │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 👨‍👩‍👧‍👦 Gruppi con Accesso                             │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ ✅ Team Marketing                           │   │
│ │    👥 3 membri possono vedere questo        │   │
│ │    scenario                         [❌]    │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ ☐ Team Vendite                              │   │
│ │    👥 2 membri                      [➕]    │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ ☐ Team HR                                   │   │
│ │    👥 4 membri                      [➕]    │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│                                                     │
│ ℹ️ Solo i membri dei gruppi selezionati           │
│    potranno vedere questo scenario                 │
│                                                     │
│            [💾 Salva]  [❌ Annulla]                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Esempio Pratico: Come Funziona

### Scenario: "Viaggio Norvegia 2027"

#### Setup Iniziale (fatto dall'Admin)

1. **Admin crea lo scenario** "Viaggio Norvegia 2027"
2. **Admin crea il gruppo** "Team Marketing"
3. **Admin aggiunge utenti al gruppo**:
   - Mario Rossi
   - Laura Bianchi
   - Giovanni Blu
4. **Admin assegna lo scenario al gruppo** "Team Marketing"

#### Risultato per gli Utenti

**Mario Rossi (Team Marketing):**
```
✅ Vede "Viaggio Norvegia 2027" nella sua dashboard
✅ Può aprire e visualizzare tutti i dettagli
✅ Può vedere i consuntivi
❌ Non può modificare
❌ Non può eliminare
```

**Paolo Verdi (Team Vendite):**
```
❌ NON vede "Viaggio Norvegia 2027" nella sua dashboard
❌ Anche se conosce l'URL, non può accedere
✅ Vede solo gli scenari del "Team Vendite"
```

**Admin (Superuser):**
```
✅ Vede TUTTI gli scenari
✅ Può fare qualsiasi operazione
✅ Può modificare i permessi in qualsiasi momento
```

---

## 🔄 Flusso Completo: Creazione Nuovo Scenario

### Passo 1: Admin Crea Scenario

```
┌─────────────────────────────────────────────────────┐
│ ✨ Nuovo Scenario                                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Nome: [Conferenza Milano 2027____________]         │
│                                                     │
│ Destinazione: [Milano, Italia___________]          │
│                                                     │
│ Date: [01/06/2027] - [05/06/2027]                  │
│                                                     │
│ ... altri campi ...                                │
│                                                     │
│ 🔒 Assegna a Gruppo:                               │
│ ┌─────────────────────────────────────────────┐   │
│ │ ☐ Team Marketing                            │   │
│ │ ☑ Team Vendite                              │   │
│ │ ☐ Team HR                                   │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│            [💾 Crea Scenario]                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Passo 2: Scenario Creato

Lo scenario "Conferenza Milano 2027" è ora visibile a:
- ✅ Admin (sempre)
- ✅ Membri del "Team Vendite" (Laura Bianchi, Paolo Verdi)
- ❌ Altri utenti NON lo vedono

---

## 🎯 Matrice Permessi

| Azione | Superuser | Utente Normale |
|--------|-----------|----------------|
| **Login** | ✅ | ✅ |
| **Vedere propri scenari** | ✅ Tutti | ✅ Solo del gruppo |
| **Creare scenario** | ✅ | ❌ |
| **Modificare scenario** | ✅ | ❌ |
| **Eliminare scenario** | ✅ | ❌ |
| **Gestire utenti** | ✅ | ❌ |
| **Creare gruppi** | ✅ | ❌ |
| **Assegnare permessi** | ✅ | ❌ |
| **Accesso pannello admin** | ✅ | ❌ |

---

## 💾 Struttura Dati Semplificata

### Tabella: users
```
id          | email              | password_hash | full_name      | is_superuser
------------|--------------------|--------------|-----------------|--------------
uuid-1      | admin@ex.com       | hash123      | Admin          | true
uuid-2      | mario@ex.com       | hash456      | Mario Rossi    | false
uuid-3      | laura@ex.com       | hash789      | Laura Bianchi  | false
```

### Tabella: groups
```
id          | name            | description
------------|-----------------|---------------------------
uuid-g1     | Team Marketing  | Gruppo marketing
uuid-g2     | Team Vendite    | Gruppo vendite
```

### Tabella: user_groups (chi appartiene a quale gruppo)
```
user_id     | group_id
------------|------------
uuid-2      | uuid-g1     (Mario → Team Marketing)
uuid-3      | uuid-g1     (Laura → Team Marketing)
uuid-3      | uuid-g2     (Laura → Team Vendite)
```

### Tabella: scenario_groups (quali scenari vede ogni gruppo)
```
scenario_id        | group_id
-------------------|------------
scenario_norvegia  | uuid-g1     (Norvegia → Team Marketing)
scenario_roma      | uuid-g1     (Roma → Team Marketing)
scenario_parigi    | uuid-g2     (Parigi → Team Vendite)
```

---

## 🔍 Query Logica

### Quando Mario fa login:

1. **Sistema trova i gruppi di Mario:**
   ```
   Mario appartiene a: [Team Marketing]
   ```

2. **Sistema trova gli scenari di quei gruppi:**
   ```
   Team Marketing ha accesso a:
   - Viaggio Norvegia 2027
   - Weekend Roma
   ```

3. **Mario vede solo questi 2 scenari**

### Quando Admin fa login:

1. **Sistema riconosce che è superuser**
2. **Admin vede TUTTI gli scenari** (nessun filtro)

---

## ✨ Vantaggi di Questo Sistema

✅ **Semplicissimo da capire**: Gruppi → Scenari  
✅ **Facile da gestire**: Admin controlla tutto da un pannello  
✅ **Scalabile**: Aggiungi utenti e gruppi facilmente  
✅ **Sicuro**: Utenti vedono solo ciò che devono vedere  
✅ **Flessibile**: Un utente può essere in più gruppi  
✅ **Manutenibile**: Logica chiara e lineare  

---

## 🚀 Prossimi Passi

1. ✅ **Hai visto il mockup** - ora sai come funziona
2. 📝 **Conferma che ti piace** questo approccio
3. 💻 **Passa a Code mode** per implementare
4. 🗄️ **Setup database** con le 4 tabelle
5. 🎨 **Crea le interfacce** come nel mockup

---

**Ti piace questo sistema? È quello che avevi in mente?**

Se sì, posso passare a Code mode e iniziare l'implementazione! 🚀