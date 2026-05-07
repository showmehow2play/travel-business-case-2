# Guida Configurazione Supabase

Questa guida ti aiuterà a configurare Supabase per sincronizzare i dati della tua applicazione Travel Business Case online.

## Cos'è Supabase?

Supabase è una piattaforma open-source che fornisce:
- **Database PostgreSQL** - Database relazionale potente e scalabile
- **API REST automatica** - Accesso ai dati tramite API
- **Realtime subscriptions** - Sincronizzazione in tempo reale
- **Storage per file** - Gestione di immagini e documenti
- **Autenticazione** - Sistema di login (opzionale)

## Vantaggi rispetto a Firebase

- ✅ Database SQL (PostgreSQL) invece di NoSQL
- ✅ Open source e self-hostable
- ✅ Interfaccia SQL più familiare
- ✅ Piano gratuito generoso (500MB database, 1GB storage)
- ✅ Backup automatici
- ✅ Migrazioni database versionate

## Passo 1: Creare un Account Supabase

1. Vai su [https://supabase.com](https://supabase.com)
2. Clicca su "Start your project"
3. Registrati con GitHub, Google o email
4. Conferma la tua email

## Passo 2: Creare un Nuovo Progetto

1. Nella dashboard, clicca su "New Project"
2. Compila i campi:
   - **Name**: `travel-business-case` (o il nome che preferisci)
   - **Database Password**: Scegli una password sicura (salvala!)
   - **Region**: Scegli la regione più vicina (es. `Europe (Frankfurt)`)
   - **Pricing Plan**: Seleziona "Free" (sufficiente per iniziare)
3. Clicca su "Create new project"
4. Attendi 1-2 minuti per il provisioning del database

## Passo 3: Ottenere le Credenziali

1. Nel menu laterale, vai su **Settings** (icona ingranaggio)
2. Clicca su **API**
3. Troverai due informazioni importanti:

### Project URL
```
https://xxxxxxxxxxx.supabase.co
```

### API Keys
- **anon/public key** - Chiave pubblica (sicura da usare nel frontend)
- **service_role key** - Chiave privata (NON usare nel frontend!)

**Usa solo la chiave `anon` (public) nel tuo codice!**

## Passo 4: Creare le Tabelle

1. Nel menu laterale, vai su **SQL Editor**
2. Clicca su "New query"
3. Copia e incolla questo SQL:

```sql
-- Tabella per gli scenari
CREATE TABLE scenarios (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella per i consuntivi (actuals)
CREATE TABLE actuals (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella per l'anagrafica partecipanti
CREATE TABLE participants (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella per i dati generali dell'app
CREATE TABLE app_data (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per migliorare le performance
CREATE INDEX idx_scenarios_updated ON scenarios(updated_at);
CREATE INDEX idx_actuals_updated ON actuals(updated_at);
CREATE INDEX idx_participants_updated ON participants(updated_at);

-- Abilita Row Level Security (RLS)
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE actuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

-- Policy per permettere accesso pubblico (per ora)
-- NOTA: In produzione, dovresti implementare autenticazione
CREATE POLICY "Allow public access" ON scenarios FOR ALL USING (true);
CREATE POLICY "Allow public access" ON actuals FOR ALL USING (true);
CREATE POLICY "Allow public access" ON participants FOR ALL USING (true);
CREATE POLICY "Allow public access" ON app_data FOR ALL USING (true);
```

4. Clicca su "Run" per eseguire la query
5. Dovresti vedere "Success. No rows returned"

## Passo 5: Configurare l'Applicazione

1. Apri il file `js/supabase-config.js`
2. Sostituisci i placeholder con le tue credenziali:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://xxxxxxxxxxx.supabase.co',  // Il tuo Project URL
    anonKey: 'eyJhbGc...'  // La tua anon/public key
};
```

3. Salva il file

## Passo 6: Testare la Connessione

1. Apri l'applicazione nel browser
2. Apri la Console del browser (F12)
3. Dovresti vedere:
   - ✅ "Supabase inizializzato con successo"
   - ✅ "Connesso a Supabase"

4. Prova a creare uno scenario o modificare i dati
5. Vai su Supabase Dashboard → **Table Editor**
6. Verifica che i dati siano stati salvati nelle tabelle

## Funzionalità Implementate

### Sincronizzazione Automatica
- ✅ Tutti i dati vengono salvati automaticamente su Supabase
- ✅ Backup locale su localStorage come fallback
- ✅ Sincronizzazione in tempo reale tra dispositivi

### Gestione Offline
- ✅ L'app funziona anche senza connessione
- ✅ I dati vengono salvati localmente
- ✅ Sincronizzazione automatica quando torni online

### Multi-dispositivo
- ✅ Accedi ai tuoi dati da qualsiasi dispositivo
- ✅ Modifiche visibili in tempo reale
- ✅ Nessun conflitto di dati

## Sicurezza

### Livello Base (Attuale)
- ✅ Accesso pubblico con chiave anon
- ⚠️ Chiunque con la chiave può leggere/scrivere
- ✅ Adatto per uso personale o demo

### Livello Avanzato (Opzionale)
Per implementare autenticazione:

1. Vai su **Authentication** → **Providers**
2. Abilita Email/Password o provider social
3. Modifica le policy RLS per richiedere autenticazione:

```sql
-- Esempio: solo utenti autenticati
DROP POLICY "Allow public access" ON scenarios;
CREATE POLICY "Authenticated users only" ON scenarios 
  FOR ALL USING (auth.uid() IS NOT NULL);
```

## Monitoraggio

### Dashboard Supabase
- **Table Editor**: Visualizza e modifica i dati
- **SQL Editor**: Esegui query personalizzate
- **Logs**: Monitora le richieste API
- **Database**: Statistiche e performance

### Limiti Piano Gratuito
- 500 MB database
- 1 GB storage file
- 2 GB bandwidth/mese
- 50,000 richieste API/mese

**Più che sufficiente per uso personale!**

## Backup e Migrazione

### Backup Automatico
Supabase fa backup automatici giornalieri (piano gratuito: 7 giorni di retention)

### Backup Manuale
1. Vai su **Database** → **Backups**
2. Clicca su "Create backup"
3. Scarica il backup quando necessario

### Esportare Dati
```sql
-- Esporta tutti gli scenari
SELECT * FROM scenarios;

-- Esporta in formato JSON
SELECT jsonb_agg(data) FROM scenarios;
```

## Troubleshooting

### Errore: "Invalid API key"
- Verifica di aver copiato la chiave `anon` (non `service_role`)
- Controlla che non ci siano spazi extra

### Errore: "Failed to fetch"
- Verifica la connessione internet
- Controlla che il Project URL sia corretto
- Verifica che le policy RLS permettano l'accesso

### Dati non sincronizzati
- Apri la Console del browser (F12)
- Cerca errori nella tab Console
- Verifica che le tabelle esistano in Supabase

### Performance lente
- Verifica la regione del server (scegli la più vicina)
- Controlla il piano (free tier ha limiti)
- Ottimizza le query se necessario

## Risorse Utili

- 📚 [Documentazione Supabase](https://supabase.com/docs)
- 🎓 [Tutorial JavaScript](https://supabase.com/docs/guides/getting-started/tutorials/with-javascript)
- 💬 [Community Discord](https://discord.supabase.com)
- 🐛 [GitHub Issues](https://github.com/supabase/supabase/issues)

## Prossimi Passi

1. ✅ Configura Supabase seguendo questa guida
2. ✅ Testa la sincronizzazione
3. 🔄 (Opzionale) Implementa autenticazione
4. 🔄 (Opzionale) Aggiungi storage per foto partecipanti
5. 🔄 (Opzionale) Configura backup automatici

## Note Importanti

- ⚠️ **Non committare le credenziali su Git!** Aggiungi `supabase-config.js` al `.gitignore`
- ✅ L'app continua a funzionare anche senza Supabase configurato
- ✅ I dati locali vengono sempre mantenuti come backup
- ✅ Puoi passare da localStorage a Supabase in qualsiasi momento

---

**Hai bisogno di aiuto?** Apri un issue su GitHub o contatta il supporto Supabase.