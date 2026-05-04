# 🌐 Guida alla Distribuzione - Business Case Viaggi

Questa guida ti spiega come rendere l'applicazione disponibile ad altre persone in modo semplice e gratuito.

---

## 📋 Opzioni di Distribuzione

### 🎯 **Opzione 1: GitHub Pages (CONSIGLIATA - Gratuita)**

La soluzione più semplice e gratuita per condividere l'app con pochi utenti.

#### Vantaggi:
- ✅ **Completamente gratuito**
- ✅ **Facile da configurare** (5 minuti)
- ✅ **URL pubblico** (es: `tuonome.github.io/travel-business-case`)
- ✅ **Aggiornamenti automatici** quando modifichi il codice
- ✅ **HTTPS incluso** (sicuro)
- ✅ **Nessun limite di utenti**

#### Come fare:

1. **Crea un account GitHub** (se non ce l'hai)
   - Vai su https://github.com
   - Clicca "Sign up" e segui le istruzioni

2. **Crea un nuovo repository**
   - Clicca sul "+" in alto a destra → "New repository"
   - Nome: `travel-business-case`
   - Seleziona "Public"
   - Clicca "Create repository"

3. **Carica i file**
   - Clicca "uploading an existing file"
   - Trascina tutti i file e cartelle del progetto
   - Clicca "Commit changes"

4. **Attiva GitHub Pages**
   - Vai su "Settings" del repository
   - Nella barra laterale, clicca "Pages"
   - In "Source", seleziona "main" branch
   - Clicca "Save"
   - Dopo 1-2 minuti, l'app sarà disponibile su: `https://tuonome.github.io/travel-business-case`

---

### 🖥️ **Con GitHub Desktop (Ancora più facile!)**

Se hai già GitHub Desktop installato, è ancora più semplice:

#### Passo 1: Crea il Repository

1. **Apri GitHub Desktop**
2. Clicca **"File"** → **"New Repository"**
3. Compila:
   - **Name**: `travel-business-case`
   - **Local Path**: Scegli dove salvare (es: Documenti)
   - **Initialize with README**: ✅ Spunta
4. Clicca **"Create Repository"**

#### Passo 2: Aggiungi i File

1. **Apri la cartella** del repository appena creato
2. **Copia tutti i file** del progetto `travel-business-case` nella cartella
3. **Torna su GitHub Desktop**
4. Vedrai tutti i file nella sezione "Changes"
5. In basso a sinistra:
   - **Summary**: scrivi "Prima versione app"
   - Clicca **"Commit to main"**

#### Passo 3: Pubblica su GitHub

1. In alto, clicca **"Publish repository"**
2. **Deseleziona** "Keep this code private" (per renderlo pubblico)
3. Clicca **"Publish repository"**
4. Aspetta che finisca l'upload

#### Passo 4: Attiva GitHub Pages

1. **Apri il browser** e vai su https://github.com
2. Clicca sul tuo **repository** `travel-business-case`
3. Clicca **"Settings"** (in alto)
4. Nel menu laterale, clicca **"Pages"**
5. In **"Source"**, seleziona **"main"** branch
6. Clicca **"Save"**
7. Dopo 1-2 minuti, vedrai l'URL: `https://tuonome.github.io/travel-business-case`

#### Passo 5: Aggiornamenti Futuri

Quando modifichi l'app:

1. **Salva le modifiche** nei file
2. **Apri GitHub Desktop**
3. Vedrai i file modificati in "Changes"
4. Scrivi un messaggio (es: "Aggiunto export Excel")
5. Clicca **"Commit to main"**
6. Clicca **"Push origin"** (in alto)
7. L'app online si aggiorna automaticamente!

#### 🎯 Vantaggi GitHub Desktop:
- ✅ **Interfaccia grafica** (niente comandi)
- ✅ **Aggiornamenti facili** (commit e push)
- ✅ **Cronologia modifiche** visibile
- ✅ **Sincronizzazione automatica**


5. **Condividi il link**
   - Copia l'URL e condividilo con chi vuoi
   - Tutti potranno usare l'app dal browser

#### ⚠️ Nota importante:
- I dati sono salvati **localmente** nel browser di ogni utente
- Ogni persona avrà i **propri scenari** (non condivisi)
- Per condividere scenari, usa la funzione **Esporta/Importa JSON**

---

### 🎯 **Opzione 2: Netlify (Alternativa Gratuita)**

Simile a GitHub Pages, ma con interfaccia più user-friendly.

#### Come fare:

1. **Vai su** https://www.netlify.com
2. **Registrati** gratuitamente
3. **Trascina la cartella** del progetto nella pagina
4. **Ottieni l'URL** (es: `nome-app.netlify.app`)
5. **Condividi** il link

---

### 🎯 **Opzione 3: Vercel (Alternativa Gratuita)**

Ottima per progetti più avanzati.

#### Come fare:

1. **Vai su** https://vercel.com
2. **Registrati** con GitHub
3. **Importa** il repository
4. **Deploy automatico**
5. **Ottieni l'URL** (es: `travel-business-case.vercel.app`)

---

### 🎯 **Opzione 4: Condivisione File Locale**

Per uso offline o in rete locale.

#### Come fare:

1. **Comprimi la cartella** in un file ZIP
2. **Condividi** il file via email/cloud
3. **Gli utenti** estraggono il file e aprono `index.html`
4. **Funziona offline** senza internet

#### Vantaggi:
- ✅ Nessuna configurazione
- ✅ Funziona offline
- ✅ Privacy totale

#### Svantaggi:
- ❌ Ogni utente deve scaricare i file
- ❌ Aggiornamenti manuali

---

## 🔄 Condivisione Dati tra Utenti

Poiché i dati sono salvati localmente, per condividere scenari:

### Metodo 1: Export/Import JSON

1. **Utente A** esporta i dati:
   - Clicca "📤 Esporta" → "JSON"
   - Salva il file

2. **Condivide** il file JSON via email/cloud

3. **Utente B** importa i dati:
   - Clicca "📥 Importa"
   - Seleziona il file JSON
   - Gli scenari vengono aggiunti

### Metodo 2: Export Excel

1. **Esporta** in Excel
2. **Condividi** il file Excel
3. Gli altri possono **visualizzare** i dati in Excel
4. Per importare nell'app, serve convertire in JSON

---

## 🚀 Configurazione Avanzata (Opzionale)

### Aggiungere un Database Condiviso

Se vuoi che più utenti vedano gli **stessi dati in tempo reale**, serve un backend:

#### Opzioni:
1. **Firebase** (Google - Gratuito fino a 10GB)
2. **Supabase** (Alternativa open-source)
3. **MongoDB Atlas** (Database cloud gratuito)

#### Cosa serve:
- Modificare il codice per usare API invece di localStorage
- Aggiungere autenticazione utenti
- Gestire permessi di lettura/scrittura

**Nota**: Questa è una modifica avanzata che richiede conoscenze di programmazione.

---

## 📱 Rendere l'App Installabile (PWA)

Per permettere agli utenti di "installare" l'app sul telefono:

1. **Aggiungi un file** `manifest.json`:
```json
{
  "name": "Business Case Viaggi",
  "short_name": "BC Viaggi",
  "description": "Gestione business case per viaggi",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

2. **Aggiungi** nel `<head>` di `index.html`:
```html
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#2563eb">
```

3. **Crea le icone** (192x192 e 512x512 pixel)

4. **Aggiungi Service Worker** per funzionamento offline

---

## 💡 Raccomandazioni

### Per Pochi Utenti (2-10 persone):
✅ **GitHub Pages** + Export/Import JSON
- Gratuito
- Facile da configurare
- Ogni utente gestisce i propri dati
- Condivisione tramite file JSON

### Per Team Piccolo (10-50 persone):
✅ **Netlify/Vercel** + Database condiviso (Firebase)
- Dati sincronizzati
- Collaborazione in tempo reale
- Richiede configurazione backend

### Per Uso Personale/Offline:
✅ **File locale** (ZIP)
- Nessuna configurazione
- Privacy totale
- Funziona ovunque

---

## 🔒 Sicurezza e Privacy

### Dati Locali (GitHub Pages/Netlify):
- I dati sono salvati **solo nel browser** dell'utente
- **Nessun server** memorizza i dati
- **Privacy totale**: nessuno può vedere i tuoi scenari
- **Backup manuale**: usa Export JSON regolarmente

### Con Database Condiviso:
- I dati sono sul server
- Serve **autenticazione** (login/password)
- Configura **permessi** appropriati
- Usa **HTTPS** sempre

---

## 📞 Supporto

Se hai bisogno di aiuto per la distribuzione:

1. **GitHub Pages**: https://docs.github.com/pages
2. **Netlify**: https://docs.netlify.com
3. **Vercel**: https://vercel.com/docs

---

## 🎯 Prossimi Passi

1. **Scegli** l'opzione di distribuzione
2. **Segui** la guida passo-passo
3. **Testa** l'app online
4. **Condividi** il link con gli utenti
5. **Spiega** come usare Export/Import per condividere dati

---

**Made with Bob** 🤖

*Ultimo aggiornamento: Maggio 2026*