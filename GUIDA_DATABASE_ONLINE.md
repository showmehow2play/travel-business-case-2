# 🌐 Guida: Database Online per Sincronizzazione Dati

## Panoramica delle Soluzioni

Per avere dati sincronizzati online, hai bisogno di un **backend** (server) che gestisca un database. Ecco le opzioni dalla più semplice alla più complessa.

---

## 🎯 Opzione 1: Firebase (Google) - CONSIGLIATA per Iniziare

### ✅ Vantaggi
- **Gratuito** fino a 1GB di dati e 50k letture/giorno
- **Facile da configurare** (poche ore)
- **Real-time** (aggiornamenti istantanei)
- **Autenticazione inclusa** (Google, email, etc.)
- **Hosting gratuito** incluso

### 📋 Come Implementare

#### 1. Setup Firebase
```bash
# Installa Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inizializza progetto
firebase init
```

#### 2. Configurazione (firebase-config.js)
```javascript
// Ottieni queste credenziali dalla console Firebase
const firebaseConfig = {
  apiKey: "TUA_API_KEY",
  authDomain: "tuo-progetto.firebaseapp.com",
  projectId: "tuo-progetto",
  storageBucket: "tuo-progetto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Inizializza Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
```

#### 3. Modifica storage.js
```javascript
// Invece di localStorage, usa Firestore
const StorageManager = {
    // Salva scenario
    async addScenario(scenario) {
        const docRef = await db.collection('scenarios').add({
            ...scenario,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { ...scenario, id: docRef.id };
    },

    // Ottieni scenari
    async getScenarios() {
        const snapshot = await db.collection('scenarios').get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    },

    // Aggiorna scenario
    async updateScenario(id, data) {
        await db.collection('scenarios').doc(id).update(data);
    },

    // Elimina scenario
    async deleteScenario(id) {
        await db.collection('scenarios').doc(id).delete();
    }
};
```

#### 4. Real-time Updates
```javascript
// Ascolta cambiamenti in tempo reale
db.collection('scenarios').onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
            console.log('Nuovo scenario:', change.doc.data());
            // Aggiorna UI
        }
        if (change.type === 'modified') {
            console.log('Scenario modificato:', change.doc.data());
            // Aggiorna UI
        }
        if (change.type === 'removed') {
            console.log('Scenario eliminato:', change.doc.data());
            // Aggiorna UI
        }
    });
});
```

### 💰 Costi Firebase
- **Gratuito**: 1GB storage, 50k letture/giorno, 20k scritture/giorno
- **Pay-as-you-go**: $0.18 per 100k operazioni

---

## 🎯 Opzione 2: Supabase - Alternativa Open Source

### ✅ Vantaggi
- **PostgreSQL** completo (più potente di Firebase)
- **Gratuito** fino a 500MB e 50k richieste/mese
- **SQL queries** native
- **Real-time** incluso
- **Open source**

### 📋 Setup Rapido
```javascript
// 1. Installa Supabase
npm install @supabase/supabase-js

// 2. Configurazione
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tuo-progetto.supabase.co'
const supabaseKey = 'TUA_ANON_KEY'
const supabase = createClient(supabaseUrl, supabaseKey)

// 3. Operazioni database
// Inserisci
const { data, error } = await supabase
  .from('scenarios')
  .insert([{ name: 'Nuovo Scenario', destination: 'Roma' }])

// Leggi
const { data, error } = await supabase
  .from('scenarios')
  .select('*')

// Aggiorna
const { data, error } = await supabase
  .from('scenarios')
  .update({ name: 'Nome Aggiornato' })
  .eq('id', 1)
```

---

## 🎯 Opzione 3: Airtable - No-Code Database

### ✅ Vantaggi
- **Interfaccia grafica** per gestire dati
- **API REST** automatica
- **Gratuito** fino a 1200 record per base
- **Facile da usare** (come Excel online)

### 📋 Setup
```javascript
// 1. Crea una base Airtable con tabelle: Scenarios, Actuals, Participants
// 2. Ottieni API key da airtable.com/api

const AIRTABLE_API_KEY = 'TUA_API_KEY';
const BASE_ID = 'TUO_BASE_ID';

// 3. Funzioni per interagire
async function getScenarios() {
    const response = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/Scenarios`,
        {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`
            }
        }
    );
    const data = await response.json();
    return data.records;
}

async function addScenario(scenario) {
    const response = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/Scenarios`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fields: scenario
            })
        }
    );
    return await response.json();
}
```

---

## 🎯 Opzione 4: GitHub come Database (Creativo!)

### ✅ Vantaggi
- **Completamente gratuito**
- **Versioning** automatico
- **Già usi GitHub**
- **Backup automatico**

### 📋 Come Funziona
```javascript
// Usa GitHub API per salvare dati in file JSON
const GITHUB_TOKEN = 'TUO_PERSONAL_ACCESS_TOKEN';
const REPO = 'username/travel-business-case';

async function saveToGitHub(filename, data) {
    // 1. Ottieni SHA del file esistente
    const getResponse = await fetch(
        `https://api.github.com/repos/${REPO}/contents/data/${filename}`,
        {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        }
    );
    
    const fileData = await getResponse.json();
    
    // 2. Aggiorna il file
    const updateResponse = await fetch(
        `https://api.github.com/repos/${REPO}/contents/data/${filename}`,
        {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Update ${filename}`,
                content: btoa(JSON.stringify(data, null, 2)),
                sha: fileData.sha
            })
        }
    );
    
    return await updateResponse.json();
}

// Salva scenari
await saveToGitHub('scenarios.json', scenarios);
```

---

## 🎯 Opzione 5: Backend Personalizzato

### Node.js + Express + MongoDB
```javascript
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Schema MongoDB
const scenarioSchema = new mongoose.Schema({
    name: String,
    destination: String,
    participants: [String],
    expenses: Object,
    createdAt: { type: Date, default: Date.now }
});

const Scenario = mongoose.model('Scenario', scenarioSchema);

// API Routes
app.get('/api/scenarios', async (req, res) => {
    const scenarios = await Scenario.find();
    res.json(scenarios);
});

app.post('/api/scenarios', async (req, res) => {
    const scenario = new Scenario(req.body);
    await scenario.save();
    res.json(scenario);
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

### Deploy su Heroku/Railway/Vercel
```bash
# Heroku (gratuito con limitazioni)
heroku create tua-app
git push heroku main

# Railway (più moderno)
railway login
railway init
railway up

# Vercel (per frontend + serverless functions)
vercel --prod
```

---

## 📊 Confronto Soluzioni

| Soluzione | Difficoltà | Costo | Tempo Setup | Real-time | Scalabilità |
|-----------|------------|-------|-------------|-----------|-------------|
| **Firebase** | ⭐⭐ | Gratuito → $25/mese | 2-4 ore | ✅ | ⭐⭐⭐⭐⭐ |
| **Supabase** | ⭐⭐⭐ | Gratuito → $25/mese | 3-5 ore | ✅ | ⭐⭐⭐⭐⭐ |
| **Airtable** | ⭐ | Gratuito → $10/mese | 1-2 ore | ❌ | ⭐⭐⭐ |
| **GitHub API** | ⭐⭐⭐⭐ | Gratuito | 4-6 ore | ❌ | ⭐⭐ |
| **Backend Custom** | ⭐⭐⭐⭐⭐ | $5-50/mese | 1-2 settimane | ✅ | ⭐⭐⭐⭐⭐ |

---

## 🚀 Raccomandazione

### Per Iniziare: **Firebase**
1. **Facile da implementare**
2. **Gratuito per uso personale**
3. **Documentazione eccellente**
4. **Real-time out of the box**

### Prossimi Passi
1. Crea account Firebase
2. Inizializza progetto
3. Modifica `storage.js` per usare Firestore
4. Aggiungi autenticazione (opzionale)
5. Deploy su Firebase Hosting

### Vuoi che ti aiuti?
Posso:
- ✅ Creare il setup Firebase completo
- ✅ Modificare il codice esistente
- ✅ Implementare autenticazione
- ✅ Aggiungere real-time sync

---

## 💡 Considerazioni Importanti

### Sicurezza
- **Mai esporre API keys** nel codice frontend
- **Usa regole di sicurezza** del database
- **Implementa autenticazione** per dati sensibili

### Performance
- **Cache i dati** localmente per velocità
- **Sincronizza solo quando necessario**
- **Usa paginazione** per grandi dataset

### Backup
- **Esporta dati regolarmente**
- **Testa il restore** dei backup
- **Considera multiple soluzioni** per ridondanza

---

**Quale soluzione ti interessa di più? Posso aiutarti a implementarla! 🚀**