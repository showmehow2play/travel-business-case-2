# 🚀 Guida Migrazione: Tecnologie Moderne per Web + Mobile

## 🎯 Stack Tecnologico Consigliato 2026

### La Soluzione Migliore: **React Native + Expo + Supabase**

---

## 📱 Opzione 1: React Native + Expo (CONSIGLIATA)

### ✅ Vantaggi
- **Un solo codice** per iOS, Android e Web
- **Sviluppo veloce** con Expo
- **Hot reload** (vedi modifiche istantaneamente)
- **Librerie native** (fotocamera, GPS, notifiche)
- **Community enorme** (milioni di sviluppatori)
- **Usato da:** Facebook, Instagram, Airbnb, Tesla

### 📊 Caratteristiche
```
✅ iOS App
✅ Android App  
✅ Web App
✅ Desktop (con Electron)
✅ Offline-first
✅ Push notifications
✅ Geolocalizzazione
✅ Fotocamera per ricevute
```

### 🛠️ Setup Iniziale

```bash
# 1. Installa Node.js (se non ce l'hai)
# Scarica da nodejs.org

# 2. Installa Expo CLI
npm install -g expo-cli

# 3. Crea nuovo progetto
npx create-expo-app travel-business-case-mobile
cd travel-business-case-mobile

# 4. Installa dipendenze
npm install @supabase/supabase-js
npm install @react-navigation/native
npm install react-native-chart-kit

# 5. Avvia il progetto
npx expo start
```

### 📱 Struttura Progetto

```
travel-business-case-mobile/
├── App.js                 # Entry point
├── app.json              # Configurazione Expo
├── package.json          # Dipendenze
├── src/
│   ├── screens/          # Schermate app
│   │   ├── DashboardScreen.js
│   │   ├── ScenariosScreen.js
│   │   ├── ActualsScreen.js
│   │   └── ParticipantsScreen.js
│   ├── components/       # Componenti riutilizzabili
│   │   ├── ScenarioCard.js
│   │   ├── ExpenseItem.js
│   │   └── ParticipantTag.js
│   ├── services/         # Logica business
│   │   ├── supabase.js   # Configurazione DB
│   │   ├── storage.js    # Gestione dati
│   │   └── auth.js       # Autenticazione
│   └── utils/            # Utility
│       ├── currency.js
│       └── formatters.js
└── assets/               # Immagini, icone
```

### 💻 Esempio Codice

#### App.js (Entry Point)
```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from './src/screens/DashboardScreen';
import ScenariosScreen from './src/screens/ScenariosScreen';
import ActualsScreen from './src/screens/ActualsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{ tabBarIcon: '📊' }}
        />
        <Tab.Screen 
          name="Preventivi" 
          component={ScenariosScreen}
          options={{ tabBarIcon: '📋' }}
        />
        <Tab.Screen 
          name="Consuntivi" 
          component={ActualsScreen}
          options={{ tabBarIcon: '💰' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

#### DashboardScreen.js
```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '../services/supabase';

export default function DashboardScreen() {
  const [stats, setStats] = useState({
    totalScenarios: 0,
    avgCost: 0,
    totalParticipants: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const { data: scenarios } = await supabase
      .from('scenarios')
      .select('*');
    
    setStats({
      totalScenarios: scenarios.length,
      avgCost: calculateAverage(scenarios),
      totalParticipants: countParticipants(scenarios)
    });
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalScenarios}</Text>
          <Text style={styles.statLabel}>Scenari Totali</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>€{stats.avgCost}</Text>
          <Text style={styles.statLabel}>Costo Medio</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalParticipants}</Text>
          <Text style={styles.statLabel}>Partecipanti</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15
  },
  statCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    flex: 1,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#667eea'
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5
  }
});
```

### 📱 Funzionalità Mobile Extra

```javascript
// 1. Fotocamera per ricevute
import * as ImagePicker from 'expo-image-picker';

async function takeReceiptPhoto() {
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });
  
  if (!result.canceled) {
    // Upload a Supabase Storage
    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(`receipt-${Date.now()}.jpg`, result.assets[0].uri);
  }
}

// 2. Geolocalizzazione per spese
import * as Location from 'expo-location';

async function addLocationToExpense() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status === 'granted') {
    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    };
  }
}

// 3. Notifiche push
import * as Notifications from 'expo-notifications';

async function sendBudgetAlert() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "⚠️ Budget Alert",
      body: "Hai superato il budget previsto!",
    },
    trigger: null, // Invia subito
  });
}

// 4. Condivisione
import * as Sharing from 'expo-sharing';

async function shareScenario(scenario) {
  const jsonString = JSON.stringify(scenario, null, 2);
  const fileUri = FileSystem.documentDirectory + 'scenario.json';
  await FileSystem.writeAsStringAsync(fileUri, jsonString);
  await Sharing.shareAsync(fileUri);
}
```

### 🚀 Deploy

```bash
# Build per iOS (richiede Mac)
eas build --platform ios

# Build per Android
eas build --platform android

# Build per Web
npx expo export:web

# Pubblica su App Store / Google Play
eas submit
```

---

## 🎯 Opzione 2: Flutter (Alternativa Google)

### ✅ Vantaggi
- **Performance native** (più veloce di React Native)
- **UI bellissima** out-of-the-box
- **Dart language** (simile a JavaScript)
- **Usato da:** Google, Alibaba, BMW

### 🛠️ Setup

```bash
# 1. Installa Flutter
# Scarica da flutter.dev

# 2. Crea progetto
flutter create travel_business_case

# 3. Aggiungi dipendenze (pubspec.yaml)
dependencies:
  flutter:
    sdk: flutter
  supabase_flutter: ^1.0.0
  charts_flutter: ^0.12.0
  
# 4. Avvia
flutter run
```

### 💻 Esempio Codice Flutter

```dart
// main.dart
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

void main() async {
  await Supabase.initialize(
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_KEY',
  );
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Travel Business Case',
      theme: ThemeData(
        primarySwatch: Colors.deepPurple,
      ),
      home: DashboardScreen(),
    );
  }
}

class DashboardScreen extends StatefulWidget {
  @override
  _DashboardScreenState createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int totalScenarios = 0;
  
  @override
  void initState() {
    super.initState();
    loadStats();
  }
  
  Future<void> loadStats() async {
    final response = await Supabase.instance.client
      .from('scenarios')
      .select();
    
    setState(() {
      totalScenarios = response.length;
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Dashboard')),
      body: GridView.count(
        crossAxisCount: 2,
        padding: EdgeInsets.all(20),
        children: [
          StatCard(
            value: '$totalScenarios',
            label: 'Scenari Totali',
            icon: Icons.assessment,
          ),
          // Altri card...
        ],
      ),
    );
  }
}
```

---

## 🎯 Opzione 3: Progressive Web App (PWA)

### ✅ Vantaggi
- **Nessuna app store** necessaria
- **Installabile** come app nativa
- **Funziona offline**
- **Notifiche push**
- **Più economico** (no fee app store)

### 🛠️ Converti App Attuale in PWA

```javascript
// 1. Crea manifest.json
{
  "name": "Travel Business Case",
  "short_name": "TravelBC",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#667eea",
  "theme_color": "#667eea",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}

// 2. Crea service-worker.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('travel-bc-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/css/style.css',
        '/js/app.js',
        // ... altri file
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// 3. Registra service worker in index.html
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}
</script>
```

---

## 📊 Confronto Tecnologie

| Tecnologia | Difficoltà | Performance | Costo | Tempo Dev | App Store |
|------------|------------|-------------|-------|-----------|-----------|
| **React Native + Expo** | ⭐⭐⭐ | ⭐⭐⭐⭐ | $99/anno iOS | 2-3 mesi | ✅ |
| **Flutter** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $99/anno iOS | 2-3 mesi | ✅ |
| **PWA** | ⭐⭐ | ⭐⭐⭐ | $0 | 1-2 settimane | ❌ |
| **Ionic** | ⭐⭐ | ⭐⭐⭐ | $99/anno iOS | 1-2 mesi | ✅ |

---

## 🚀 La Mia Raccomandazione

### Per Te: **React Native + Expo + Supabase**

**Perché:**
1. ✅ **JavaScript** (già lo conosci!)
2. ✅ **Un codice** per iOS, Android, Web
3. ✅ **Expo** semplifica tutto
4. ✅ **Community enorme** (facile trovare aiuto)
5. ✅ **Riutilizzi logica** dell'app attuale
6. ✅ **Supabase** per backend (gratuito)

### Roadmap Migrazione

**Fase 1: Setup (1 settimana)**
- Installa Expo
- Crea progetto base
- Setup Supabase
- Configura navigazione

**Fase 2: UI (2-3 settimane)**
- Converti schermate HTML → React Native
- Implementa componenti
- Styling responsive

**Fase 3: Logica (2-3 settimane)**
- Migra storage.js → Supabase
- Implementa sincronizzazione
- Gestione offline

**Fase 4: Features Mobile (1-2 settimane)**
- Fotocamera per ricevute
- Geolocalizzazione
- Notifiche push
- Condivisione

**Fase 5: Testing & Deploy (1 settimana)**
- Test su iOS/Android
- Build production
- Pubblicazione store

**Totale: 7-10 settimane**

---

## 💰 Costi Stimati

### React Native + Expo + Supabase
- **Sviluppo**: Fai da te (gratis) o €5k-15k freelance
- **Apple Developer**: $99/anno
- **Google Play**: $25 una tantum
- **Supabase**: Gratuito → $25/mese
- **Totale Anno 1**: ~$150 + sviluppo

### Alternative
- **PWA**: $0 (no app store)
- **Flutter**: Stessi costi di React Native
- **Ionic**: Stessi costi di React Native

---

## 🎯 Vuoi che ti Aiuti?

Posso:
1. ✅ Creare il progetto Expo completo
2. ✅ Migrare il codice esistente
3. ✅ Setup Supabase con autenticazione
4. ✅ Implementare features mobile
5. ✅ Guidarti nel deploy

**Tempo stimato insieme: 2-3 settimane part-time**

---

**Quale tecnologia ti interessa di più? Posso iniziare subito! 🚀**