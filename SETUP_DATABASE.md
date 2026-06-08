# 🗄️ Setup Database Supabase - Sistema Autenticazione

Questa guida contiene tutti gli script SQL necessari per configurare il database Supabase per il sistema di autenticazione e autorizzazione.

## 📋 Indice

1. [Prerequisiti](#prerequisiti)
2. [Creazione Tabelle](#creazione-tabelle)
3. [Row Level Security](#row-level-security)
4. [Dati Iniziali](#dati-iniziali)
5. [Funzioni Helper](#funzioni-helper)
6. [Verifica Setup](#verifica-setup)

---

## Prerequisiti

Prima di eseguire questi script:

1. Accedi al tuo progetto Supabase
2. Vai su **SQL Editor**
3. Copia e incolla gli script in ordine
4. Esegui ogni script verificando che non ci siano errori

⚠️ **IMPORTANTE**: Esegui gli script nell'ordine indicato!

---

## Creazione Tabelle

### Step 1: Tabella `roles`

Definisce i ruoli disponibili nel sistema.

```sql
-- Tabella roles
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_system ON roles(is_system);

-- Commenti
COMMENT ON TABLE roles IS 'Ruoli utente con permessi associati';
COMMENT ON COLUMN roles.is_system IS 'Se true, il ruolo non può essere modificato o eliminato';
COMMENT ON COLUMN roles.permissions IS 'Oggetto JSON con permessi per risorsa: {"scenarios": ["create", "read"], ...}';
```

### Step 2: Tabella `user_profiles`

Estende `auth.users` con informazioni aggiuntive.

```sql
-- Tabella user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role_id UUID REFERENCES roles(id),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(is_active);

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Commenti
COMMENT ON TABLE user_profiles IS 'Profili utente estesi con ruoli e informazioni aggiuntive';
```

### Step 3: Tabella `groups`

Gestisce i gruppi (progetti/viaggi e team/reparti).

```sql
-- Tabella groups
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('project', 'team')),
  color TEXT DEFAULT '#8b5cf6',
  icon TEXT DEFAULT '👥',
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_groups_type ON groups(type);
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);
CREATE INDEX IF NOT EXISTS idx_groups_active ON groups(is_active);

-- Trigger per updated_at
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Commenti
COMMENT ON TABLE groups IS 'Gruppi per organizzare utenti (project = viaggio, team = reparto)';
COMMENT ON COLUMN groups.type IS 'Tipo gruppo: project (viaggio/progetto) o team (reparto/team)';
```

### Step 4: Tabella `user_groups`

Associazione molti-a-molti tra utenti e gruppi.

```sql
-- Tabella user_groups
CREATE TABLE IF NOT EXISTS user_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  role_in_group TEXT DEFAULT 'member' CHECK (role_in_group IN ('member', 'leader', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, group_id)
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_user_groups_user ON user_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_user_groups_group ON user_groups(group_id);

-- Commenti
COMMENT ON TABLE user_groups IS 'Associazione utenti-gruppi con ruolo nel gruppo';
COMMENT ON COLUMN user_groups.role_in_group IS 'Ruolo nel gruppo: member, leader, admin';
```

### Step 5: Tabella `scenario_permissions`

Controllo accessi per scenari (preventivi).

```sql
-- Tabella scenario_permissions
CREATE TABLE IF NOT EXISTS scenario_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id TEXT NOT NULL,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL CHECK (permission_level IN ('view', 'edit', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  CHECK (
    (group_id IS NOT NULL AND user_id IS NULL) OR 
    (group_id IS NULL AND user_id IS NOT NULL)
  )
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_scenario_permissions_scenario ON scenario_permissions(scenario_id);
CREATE INDEX IF NOT EXISTS idx_scenario_permissions_group ON scenario_permissions(group_id);
CREATE INDEX IF NOT EXISTS idx_scenario_permissions_user ON scenario_permissions(user_id);

-- Indice composito per query comuni
CREATE INDEX IF NOT EXISTS idx_scenario_permissions_lookup 
  ON scenario_permissions(scenario_id, group_id, user_id);

-- Commenti
COMMENT ON TABLE scenario_permissions IS 'Permessi di accesso agli scenari per utenti o gruppi';
COMMENT ON COLUMN scenario_permissions.permission_level IS 'Livello permesso: view (lettura), edit (modifica), admin (completo)';
```

### Step 6: Tabella `actual_permissions`

Controllo accessi per consuntivi.

```sql
-- Tabella actual_permissions
CREATE TABLE IF NOT EXISTS actual_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actual_id TEXT NOT NULL,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL CHECK (permission_level IN ('view', 'edit', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  CHECK (
    (group_id IS NOT NULL AND user_id IS NULL) OR 
    (group_id IS NULL AND user_id IS NOT NULL)
  )
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_actual_permissions_actual ON actual_permissions(actual_id);
CREATE INDEX IF NOT EXISTS idx_actual_permissions_group ON actual_permissions(group_id);
CREATE INDEX IF NOT EXISTS idx_actual_permissions_user ON actual_permissions(user_id);

-- Indice composito
CREATE INDEX IF NOT EXISTS idx_actual_permissions_lookup 
  ON actual_permissions(actual_id, group_id, user_id);

-- Commenti
COMMENT ON TABLE actual_permissions IS 'Permessi di accesso ai consuntivi per utenti o gruppi';
```

### Step 7: Tabella `audit_log`

Log delle azioni per sicurezza e tracciabilità.

```sql
-- Tabella audit_log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

-- Commenti
COMMENT ON TABLE audit_log IS 'Log di tutte le azioni degli utenti per audit e sicurezza';
```

---

## Row Level Security

### Step 8: Abilita RLS su tutte le tabelle

```sql
-- Abilita Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE actual_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
```

### Step 9: Policy per `user_profiles`

```sql
-- Policy: Gli utenti possono vedere il proprio profilo
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Gli admin possono vedere tutti i profili
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Policy: Gli utenti possono aggiornare il proprio profilo
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Gli admin possono aggiornare tutti i profili
CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Policy: Gli admin possono inserire nuovi profili
CREATE POLICY "Admins can insert profiles"
  ON user_profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'admin'
    )
  );
```

### Step 10: Policy per `roles`

```sql
-- Policy: Tutti gli utenti autenticati possono vedere i ruoli
CREATE POLICY "Authenticated users can view roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Solo admin possono modificare ruoli non di sistema
CREATE POLICY "Admins can manage non-system roles"
  ON roles FOR ALL
  USING (
    NOT is_system AND
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'admin'
    )
  );
```

### Step 11: Policy per `groups`

```sql
-- Policy: Gli utenti possono vedere i gruppi a cui appartengono
CREATE POLICY "Users can view their groups"
  ON groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_groups
      WHERE user_groups.group_id = groups.id
      AND user_groups.user_id = auth.uid()
    )
  );

-- Policy: Gli admin possono vedere tutti i gruppi
CREATE POLICY "Admins can view all groups"
  ON groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Policy: Manager e admin possono creare gruppi
CREATE POLICY "Managers can create groups"
  ON groups FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name IN ('admin', 'manager')
    )
  );

-- Policy: Admin e leader del gruppo possono modificare
CREATE POLICY "Group leaders can update groups"
  ON groups FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM user_groups
      WHERE user_groups.group_id = groups.id
      AND user_groups.user_id = auth.uid()
      AND user_groups.role_in_group IN ('leader', 'admin')
    )
  );
```

### Step 12: Policy per `user_groups`

```sql
-- Policy: Gli utenti possono vedere le proprie appartenenze
CREATE POLICY "Users can view own group memberships"
  ON user_groups FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Gli admin possono vedere tutte le appartenenze
CREATE POLICY "Admins can view all memberships"
  ON user_groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Policy: Admin e leader possono aggiungere membri
CREATE POLICY "Group admins can add members"
  ON user_groups FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM user_groups ug
      WHERE ug.group_id = user_groups.group_id
      AND ug.user_id = auth.uid()
      AND ug.role_in_group IN ('leader', 'admin')
    )
  );
```

### Step 13: Policy per `scenario_permissions` e `actual_permissions`

```sql
-- Policy per scenario_permissions: Gli utenti vedono permessi dei loro scenari
CREATE POLICY "Users can view permissions for accessible scenarios"
  ON scenario_permissions FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_groups
      WHERE user_groups.group_id = scenario_permissions.group_id
      AND user_groups.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Policy: Manager e admin possono gestire permessi
CREATE POLICY "Managers can manage scenario permissions"
  ON scenario_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name IN ('admin', 'manager')
    )
  );

-- Stesse policy per actual_permissions
CREATE POLICY "Users can view permissions for accessible actuals"
  ON actual_permissions FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_groups
      WHERE user_groups.group_id = actual_permissions.group_id
      AND user_groups.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Managers can manage actual permissions"
  ON actual_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name IN ('admin', 'manager')
    )
  );
```

### Step 14: Policy per `audit_log`

```sql
-- Policy: Gli utenti possono vedere i propri log
CREATE POLICY "Users can view own audit logs"
  ON audit_log FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Gli admin possono vedere tutti i log
CREATE POLICY "Admins can view all audit logs"
  ON audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'admin'
    )
  );

-- Policy: Tutti gli utenti autenticati possono inserire log
CREATE POLICY "Authenticated users can insert audit logs"
  ON audit_log FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
```

---

## Dati Iniziali

### Step 15: Inserisci ruoli predefiniti

```sql
-- Inserisci ruoli di sistema
INSERT INTO roles (name, display_name, description, permissions, is_system) VALUES
(
  'admin',
  'Amministratore',
  'Accesso completo al sistema, gestione utenti e configurazione',
  '{
    "scenarios": ["create", "read", "update", "delete", "manage_permissions"],
    "actuals": ["create", "read", "update", "delete", "manage_permissions"],
    "users": ["create", "read", "update", "delete"],
    "groups": ["create", "read", "update", "delete"],
    "roles": ["read", "update"]
  }'::jsonb,
  true
),
(
  'manager',
  'Manager',
  'Può creare e gestire scenari/consuntivi e assegnarli a gruppi',
  '{
    "scenarios": ["create", "read", "update", "delete", "manage_permissions"],
    "actuals": ["create", "read", "update", "delete", "manage_permissions"],
    "groups": ["read", "create"]
  }'::jsonb,
  true
),
(
  'editor',
  'Editor',
  'Può modificare scenari/consuntivi assegnati al suo gruppo',
  '{
    "scenarios": ["read", "update"],
    "actuals": ["read", "update"]
  }'::jsonb,
  true
),
(
  'viewer',
  'Visualizzatore',
  'Solo visualizzazione di scenari/consuntivi assegnati',
  '{
    "scenarios": ["read"],
    "actuals": ["read"]
  }'::jsonb,
  true
)
ON CONFLICT (name) DO NOTHING;
```

---

## Funzioni Helper

### Step 16: Funzione per verificare permessi utente

```sql
-- Funzione per verificare se un utente ha accesso a uno scenario
CREATE OR REPLACE FUNCTION user_can_access_scenario(
  p_user_id UUID,
  p_scenario_id TEXT,
  p_action TEXT DEFAULT 'read'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_permission_level TEXT;
BEGIN
  -- Verifica se è admin
  SELECT EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = p_user_id AND r.name = 'admin'
  ) INTO v_is_admin;
  
  IF v_is_admin THEN
    RETURN TRUE;
  END IF;
  
  -- Cerca permesso diretto
  SELECT permission_level INTO v_permission_level
  FROM scenario_permissions
  WHERE scenario_id = p_scenario_id
  AND user_id = p_user_id
  LIMIT 1;
  
  IF v_permission_level IS NOT NULL THEN
    RETURN CASE
      WHEN p_action = 'read' THEN TRUE
      WHEN p_action = 'update' AND v_permission_level IN ('edit', 'admin') THEN TRUE
      WHEN p_action = 'delete' AND v_permission_level = 'admin' THEN TRUE
      ELSE FALSE
    END;
  END IF;
  
  -- Cerca permesso tramite gruppi
  SELECT MAX(permission_level) INTO v_permission_level
  FROM scenario_permissions sp
  JOIN user_groups ug ON sp.group_id = ug.group_id
  WHERE sp.scenario_id = p_scenario_id
  AND ug.user_id = p_user_id;
  
  IF v_permission_level IS NOT NULL THEN
    RETURN CASE
      WHEN p_action = 'read' THEN TRUE
      WHEN p_action = 'update' AND v_permission_level IN ('edit', 'admin') THEN TRUE
      WHEN p_action = 'delete' AND v_permission_level = 'admin' THEN TRUE
      ELSE FALSE
    END;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Stessa funzione per actuals
CREATE OR REPLACE FUNCTION user_can_access_actual(
  p_user_id UUID,
  p_actual_id TEXT,
  p_action TEXT DEFAULT 'read'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_permission_level TEXT;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = p_user_id AND r.name = 'admin'
  ) INTO v_is_admin;
  
  IF v_is_admin THEN
    RETURN TRUE;
  END IF;
  
  SELECT permission_level INTO v_permission_level
  FROM actual_permissions
  WHERE actual_id = p_actual_id
  AND user_id = p_user_id
  LIMIT 1;
  
  IF v_permission_level IS NOT NULL THEN
    RETURN CASE
      WHEN p_action = 'read' THEN TRUE
      WHEN p_action = 'update' AND v_permission_level IN ('edit', 'admin') THEN TRUE
      WHEN p_action = 'delete' AND v_permission_level = 'admin' THEN TRUE
      ELSE FALSE
    END;
  END IF;
  
  SELECT MAX(permission_level) INTO v_permission_level
  FROM actual_permissions ap
  JOIN user_groups ug ON ap.group_id = ug.group_id
  WHERE ap.actual_id = p_actual_id
  AND ug.user_id = p_user_id;
  
  IF v_permission_level IS NOT NULL THEN
    RETURN CASE
      WHEN p_action = 'read' THEN TRUE
      WHEN p_action = 'update' AND v_permission_level IN ('edit', 'admin') THEN TRUE
      WHEN p_action = 'delete' AND v_permission_level = 'admin' THEN TRUE
      ELSE FALSE
    END;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 17: Trigger per creare profilo utente automaticamente

```sql
-- Funzione per creare automaticamente il profilo quando si registra un utente
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
  v_viewer_role_id UUID;
BEGIN
  -- Ottieni ID del ruolo viewer (ruolo predefinito)
  SELECT id INTO v_viewer_role_id
  FROM roles
  WHERE name = 'viewer'
  LIMIT 1;
  
  -- Crea il profilo
  INSERT INTO user_profiles (id, email, full_name, role_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    v_viewer_role_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger su auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();
```

---

## Verifica Setup

### Step 18: Query di verifica

Esegui queste query per verificare che tutto sia configurato correttamente:

```sql
-- 1. Verifica tabelle create
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'user_profiles', 'roles', 'groups', 'user_groups',
  'scenario_permissions', 'actual_permissions', 'audit_log'
)
ORDER BY table_name;

-- 2. Verifica ruoli inseriti
SELECT name, display_name, is_system 
FROM roles 
ORDER BY name;

-- 3. Verifica RLS abilitato
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
  'user_profiles', 'roles', 'groups', 'user_groups',
  'scenario_permissions', 'actual_permissions', 'audit_log'
);

-- 4. Conta policy create
SELECT schemaname, tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- 5. Verifica funzioni create
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%user_can_access%'
OR routine_name LIKE '%create_user_profile%';
```

### Risultati Attesi

Se tutto è configurato correttamente, dovresti vedere:

- ✅ 7 tabelle create
- ✅ 4 ruoli inseriti (admin, manager, editor, viewer)
- ✅ RLS abilitato su tutte le tabelle
- ✅ Circa 20+ policy create
- ✅ 3 funzioni helper create

---

## 🎯 Prossimi Passi

Dopo aver completato il setup del database:

1. **Crea il primo utente admin** tramite Supabase Auth
2. **Assegna ruolo admin** al primo utente manualmente:
   ```sql
   UPDATE user_profiles 
   SET role_id = (SELECT id FROM roles WHERE name = 'admin')
   WHERE email = 'tua-email@example.com';
   ```
3. **Testa l'accesso** con il primo utente admin
4. **Procedi con l'implementazione** dei moduli JavaScript

---

## 🔧 Troubleshooting

### Errore: "permission denied for table"

Verifica che RLS sia configurato correttamente e che le policy siano state create.

### Errore: "function does not exist"

Assicurati di aver eseguito tutti gli script delle funzioni helper.

### Errore: "duplicate key value violates unique constraint"

I ruoli predefiniti potrebbero essere già stati inseriti. Usa `ON CONFLICT DO NOTHING` nelle INSERT.

---

## 📚 Riferimenti

- [Documentazione Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [PostgreSQL Policies](https://www.postgresql.org/docs/current/sql-createpolicy.html)

---

**Versione**: 1.0  
**Data**: 29 Maggio 2026  
**Autore**: Bob (AI Planning Assistant)