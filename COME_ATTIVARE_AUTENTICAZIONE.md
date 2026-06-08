# 🔐 Come Attivare il Sistema di Autenticazione

## 📋 Stato Attuale

Il sistema di autenticazione è **PREDISPOSTO ma DISATTIVATO**.

L'applicazione funziona normalmente senza richiedere login.

## ✅ File Già Creati

### Documentazione
- ✅ `PIANO_AUTENTICAZIONE_UTENTI.md` - Piano completo
- ✅ `SETUP_DATABASE.md` - Script SQL database
- ✅ `MOCKUP_SISTEMA_ACCESSO.md` - Mockup interfacce
- ✅ `IMPLEMENTAZIONE_AUTH.md` - Guida implementazione

### Codice JavaScript
- ✅ `js/auth-config.js` - Configurazione on/off
- ✅ `js/auth.js` - Gestione autenticazione
- ✅ `js/activity-logger.js` - Log attività
- ✅ `js/access-control.js` - Controllo accessi

### Interfacce
- ✅ `login.html` - Pagina login

## 🚀 Come Attivare (Quando Pronto)

### Step 1: Setup Database
1. Accedi a Supabase Dashboard
2. Vai su SQL Editor
3. Esegui tutti gli script in `SETUP_DATABASE.md`
4. Crea primo superuser:
   ```sql
   SELECT create_user(
     'admin@tuodominio.com',
     'password_sicura',
     'Amministratore',
     true  -- is_superuser
   );
   ```

### Step 2: Attiva Autenticazione
Apri `js/auth-config.js` e modifica:

```javascript
const AuthConfig = {
    enabled: true,           // ← Cambia da false a true
    requireLogin: true,      // ← Cambia da false a true
    filterByUser: true,      // ← Cambia da false a true
    logActivity: true        // ← Cambia da false a true
};
```

### Step 3: Aggiungi Script a index.html
Aggiungi dopo `supabase-config.js`:

```html
<!-- Authentication System -->
<script src="js/auth-config.js"></script>
<script src="js/auth.js"></script>
<script src="js/activity-logger.js"></script>
<script src="js/access-control.js"></script>
```

### Step 4: Modifica storage.js
Sostituisci il metodo `getScenarios()` con:

```javascript
async getScenarios() {
    const data = await this.getData();
    const scenarios = data.scenarios || [];
    
    // Se auth disabilitata, ritorna tutto
    if (!isAuthEnabled()) {
        return scenarios;
    }
    
    // Altrimenti filtra per utente
    return await AccessControl.getAccessibleScenarios(scenarios);
}
```

### Step 5: Test
1. Apri l'app → dovrebbe reindirizzare a login.html
2. Fai login con superuser
3. Verifica accesso completo
4. Crea utente normale e testa permessi limitati

## 🔄 Come Disattivare

Se vuoi tornare alla modalità aperta:

1. Apri `js/auth-config.js`
2. Imposta tutto a `false`
3. Ricarica l'app

## 📊 Cosa Succede Quando Attivo

### Con Auth DISATTIVATA (ora):
- ✅ Accesso libero senza login
- ✅ Tutti vedono tutti gli scenari
- ✅ Nessun log attività
- ✅ Nessun controllo permessi

### Con Auth ATTIVATA:
- 🔒 Login richiesto
- 👥 Utenti vedono solo scenari dei loro gruppi
- 📝 Tutte le azioni vengono registrate
- 🔐 Controlli permessi attivi
- 👑 Superuser vede e gestisce tutto

## 🎯 Vantaggi Approccio Graduale

✅ **Sviluppo senza interruzioni**: continui a lavorare normalmente
✅ **Test quando vuoi**: attivi solo quando il database è pronto
✅ **Rollback facile**: disattivi se serve
✅ **Zero impatto**: l'app funziona come prima finché non attivi

## 📝 Checklist Pre-Attivazione

Prima di attivare, assicurati di aver:

- [ ] Eseguito tutti gli script SQL su Supabase
- [ ] Creato almeno un superuser
- [ ] Creato almeno un gruppo
- [ ] Testato il login in ambiente di test
- [ ] Fatto backup dei dati esistenti
- [ ] Informato gli utenti del cambio

## 🆘 Troubleshooting

**Problema**: Dopo attivazione, nessuno può accedere
**Soluzione**: Disattiva in `auth-config.js` e verifica database

**Problema**: Login non funziona
**Soluzione**: Verifica che le tabelle siano create correttamente

**Problema**: Utenti non vedono scenari
**Soluzione**: Verifica che siano assegnati a gruppi con permessi

---

**Il sistema è pronto ma dormiente. Attivalo quando vuoi!** 🚀