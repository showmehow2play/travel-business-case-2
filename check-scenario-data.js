// Script per controllare i dati degli scenari
const scenarios = JSON.parse(localStorage.getItem('scenarios') || '[]');
console.log('Totale scenari:', scenarios.length);

scenarios.forEach((s, i) => {
    console.log(`\n=== Scenario ${i + 1}: ${s.name} ===`);
    console.log('Partecipanti:', s.participants);
    console.log('Tipo:', typeof s.participants);
    console.log('È array?', Array.isArray(s.participants));
    if (s.participants) {
        console.log('Lunghezza:', s.participants.length);
        console.log('Contenuto:', JSON.stringify(s.participants));
    }
});
