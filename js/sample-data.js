// ===== Sample Data =====
// Dati di esempio per la demo dell'applicazione

const SampleData = {
    scenarios: [
        {
            id: 'sample-1',
            name: 'Norvegia 2027',
            destination: 'Oslo, Bergen, Tromsø',
            startDate: '2027-06-15',
            endDate: '2027-06-25',
            flightDeparture: 'Milano Malpensa (MXP)',
            flightArrival: 'Oslo Gardermoen (OSL)',
            participants: ['Mario Rossi', 'Laura Bianchi', 'Giuseppe Verdi', 'Anna Neri'],
            expenses: {
                transport: 1200,
                accommodation: 0,
                food: 800,
                car: 0,
                activities: 600,
                other: 0
            },
            accommodationOptions: [
                {
                    name: 'Hotel Scandic Oslo',
                    price: 1800,
                    link: 'https://www.booking.com',
                    nights: 10,
                    pricePerNight: 180,
                    notes: 'Colazione inclusa, centro città'
                },
                {
                    name: 'Airbnb Bergen',
                    price: 1400,
                    link: 'https://www.airbnb.com',
                    nights: 10,
                    pricePerNight: 140,
                    notes: 'Appartamento con vista fiordo'
                }
            ],
            selectedAccommodationIndex: 0,
            carOptions: [
                {
                    name: 'Toyota RAV4 Hybrid',
                    price: 850,
                    link: 'https://www.rentalcars.com',
                    days: 10,
                    pricePerDay: 85,
                    notes: 'Assicurazione completa inclusa'
                }
            ],
            otherOptions: [
                {
                    name: 'Escursione Fiordi',
                    price: 400,
                    link: '',
                    notes: 'Tour guidato di 2 giorni'
                },
                {
                    name: 'Museo Vichingo',
                    price: 120,
                    link: '',
                    notes: 'Biglietti per 4 persone'
                }
            ],
            notes: 'Viaggio estivo in Norvegia. Include voli, hotel, noleggio auto ed escursioni ai fiordi.',
            createdAt: '2026-01-15T10:00:00.000Z',
            updatedAt: '2026-01-15T10:00:00.000Z'
        },
        {
            id: 'sample-2',
            name: 'Weekend Parigi',
            destination: 'Parigi, Francia',
            startDate: '2027-03-10',
            endDate: '2027-03-13',
            flightDeparture: 'Milano Linate (LIN)',
            flightArrival: 'Paris Charles de Gaulle (CDG)',
            participants: ['Mario Rossi', 'Laura Bianchi'],
            expenses: {
                transport: 400,
                accommodation: 0,
                food: 300,
                car: 0,
                activities: 200,
                other: 0
            },
            accommodationOptions: [
                {
                    name: 'Hotel Marais',
                    price: 450,
                    link: 'https://www.booking.com',
                    nights: 3,
                    pricePerNight: 150,
                    notes: 'Quartiere Marais, vicino metro'
                }
            ],
            selectedAccommodationIndex: 0,
            carOptions: [],
            otherOptions: [
                {
                    name: 'Biglietti Louvre',
                    price: 40,
                    link: '',
                    notes: '2 biglietti adulti'
                },
                {
                    name: 'Crociera Senna',
                    price: 60,
                    link: '',
                    notes: 'Crociera serale con cena'
                }
            ],
            notes: 'Weekend romantico a Parigi. Include Torre Eiffel, Louvre e crociera sulla Senna.',
            createdAt: '2026-01-20T14:30:00.000Z',
            updatedAt: '2026-01-20T14:30:00.000Z'
        },
        {
            id: 'sample-3',
            name: 'Tour Giappone',
            destination: 'Tokyo, Kyoto, Osaka',
            startDate: '2027-09-01',
            endDate: '2027-09-15',
            flightDeparture: 'Roma Fiumicino (FCO)',
            flightArrival: 'Tokyo Narita (NRT)',
            participants: ['Giuseppe Verdi', 'Anna Neri', 'Marco Blu', 'Sofia Rosa'],
            expenses: {
                transport: 3200,
                accommodation: 0,
                food: 1200,
                car: 0,
                activities: 800,
                other: 0
            },
            accommodationOptions: [
                {
                    name: 'Hotel Tokyo Shinjuku',
                    price: 2100,
                    link: 'https://www.booking.com',
                    nights: 14,
                    pricePerNight: 150,
                    notes: 'Quartiere Shinjuku, vicino stazione'
                },
                {
                    name: 'Ryokan Kyoto',
                    price: 2800,
                    link: 'https://www.booking.com',
                    nights: 14,
                    pricePerNight: 200,
                    notes: 'Esperienza tradizionale giapponese'
                }
            ],
            selectedAccommodationIndex: 0,
            carOptions: [],
            otherOptions: [
                {
                    name: 'JR Pass 14 giorni',
                    price: 1200,
                    link: '',
                    notes: 'Pass ferroviario per 4 persone'
                },
                {
                    name: 'Tempio Fushimi Inari',
                    price: 0,
                    link: '',
                    notes: 'Ingresso gratuito'
                }
            ],
            notes: 'Tour completo del Giappone. Include Tokyo, Kyoto, Osaka con JR Pass per gli spostamenti.',
            createdAt: '2026-02-01T09:00:00.000Z',
            updatedAt: '2026-02-01T09:00:00.000Z'
        }
    ],
    actuals: [
        {
            id: 'actual-1',
            name: 'Norvegia 2027',
            scenarioId: 'sample-1',
            participants: ['Mario Rossi', 'Laura Bianchi', 'Giuseppe Verdi', 'Anna Neri'],
            expenses: [
                {
                    date: '2027-06-15',
                    category: 'viaggio',
                    description: 'Voli Milano-Oslo A/R',
                    amount: 1200,
                    currency: 'EUR',
                    paidBy: 'Mario Rossi',
                    sharedWith: ['Mario Rossi', 'Laura Bianchi', 'Giuseppe Verdi', 'Anna Neri'],
                    link: '',
                    notes: 'Norwegian Air',
                    saved: true
                },
                {
                    date: '2027-06-15',
                    category: 'hotel',
                    description: 'Hotel Scandic Oslo',
                    amount: 1800,
                    currency: 'EUR',
                    paidBy: 'Laura Bianchi',
                    sharedWith: ['Mario Rossi', 'Laura Bianchi', 'Giuseppe Verdi', 'Anna Neri'],
                    link: 'https://www.booking.com',
                    notes: '10 notti, colazione inclusa',
                    saved: true
                },
                {
                    date: '2027-06-16',
                    category: 'auto',
                    description: 'Noleggio Toyota RAV4',
                    amount: 850,
                    currency: 'EUR',
                    paidBy: 'Giuseppe Verdi',
                    sharedWith: ['Mario Rossi', 'Laura Bianchi', 'Giuseppe Verdi', 'Anna Neri'],
                    link: 'https://www.rentalcars.com',
                    notes: '10 giorni, assicurazione completa',
                    saved: true
                },
                {
                    date: '2027-06-17',
                    category: 'ristorante',
                    description: 'Cena ristorante Maaemo',
                    amount: 320,
                    currency: 'EUR',
                    paidBy: 'Mario Rossi',
                    sharedWith: ['Mario Rossi', 'Laura Bianchi', 'Giuseppe Verdi', 'Anna Neri'],
                    link: '',
                    notes: 'Ristorante stellato Michelin',
                    saved: true
                },
                {
                    date: '2027-06-18',
                    category: 'attivita',
                    description: 'Tour Fiordi Norvegesi',
                    amount: 400,
                    currency: 'EUR',
                    paidBy: 'Anna Neri',
                    sharedWith: ['Mario Rossi', 'Laura Bianchi', 'Giuseppe Verdi', 'Anna Neri'],
                    link: '',
                    notes: 'Escursione di 2 giorni',
                    saved: true
                },
                {
                    date: '2027-06-20',
                    category: 'spesa',
                    description: 'Supermercato Rema 1000',
                    amount: 180,
                    currency: 'EUR',
                    paidBy: 'Laura Bianchi',
                    sharedWith: ['Mario Rossi', 'Laura Bianchi', 'Giuseppe Verdi', 'Anna Neri'],
                    link: '',
                    notes: 'Spesa per colazioni e pranzi',
                    saved: true
                },
                {
                    date: '2027-06-22',
                    category: 'benzina',
                    description: 'Rifornimento Circle K',
                    amount: 95,
                    currency: 'EUR',
                    paidBy: 'Giuseppe Verdi',
                    sharedWith: ['Mario Rossi', 'Laura Bianchi', 'Giuseppe Verdi', 'Anna Neri'],
                    link: '',
                    notes: 'Pieno benzina',
                    saved: true
                }
            ],
            createdAt: '2027-06-15T08:00:00.000Z',
            updatedAt: '2027-06-22T18:00:00.000Z'
        }
    ],
    participants: [
        {
            id: 'p1',
            name: 'Mario Rossi',
            email: 'mario.rossi@email.com',
            phone: '+39 333 1234567',
            idCard: 'AB1234567',
            notes: 'Preferisce posto finestrino',
            createdAt: '2026-01-10T10:00:00.000Z',
            updatedAt: '2026-01-10T10:00:00.000Z'
        },
        {
            id: 'p2',
            name: 'Laura Bianchi',
            email: 'laura.bianchi@email.com',
            phone: '+39 333 2345678',
            idCard: 'CD2345678',
            notes: 'Vegetariana',
            createdAt: '2026-01-10T10:05:00.000Z',
            updatedAt: '2026-01-10T10:05:00.000Z'
        },
        {
            id: 'p3',
            name: 'Giuseppe Verdi',
            email: 'giuseppe.verdi@email.com',
            phone: '+39 333 3456789',
            idCard: 'EF3456789',
            notes: '',
            createdAt: '2026-01-10T10:10:00.000Z',
            updatedAt: '2026-01-10T10:10:00.000Z'
        },
        {
            id: 'p4',
            name: 'Anna Neri',
            email: 'anna.neri@email.com',
            phone: '+39 333 4567890',
            idCard: 'GH4567890',
            notes: 'Allergia ai crostacei',
            createdAt: '2026-01-10T10:15:00.000Z',
            updatedAt: '2026-01-10T10:15:00.000Z'
        },
        {
            id: 'p5',
            name: 'Marco Blu',
            email: 'marco.blu@email.com',
            phone: '+39 333 5678901',
            idCard: 'IJ5678901',
            notes: '',
            createdAt: '2026-01-10T10:20:00.000Z',
            updatedAt: '2026-01-10T10:20:00.000Z'
        },
        {
            id: 'p6',
            name: 'Sofia Rosa',
            email: 'sofia.rosa@email.com',
            phone: '+39 333 6789012',
            idCard: 'KL6789012',
            notes: 'Porta sempre la macchina fotografica',
            createdAt: '2026-01-10T10:25:00.000Z',
            updatedAt: '2026-01-10T10:25:00.000Z'
        }
    ]
};

// Made with Bob
