// ===== Accommodation and Car Manager =====
// Gestisce le opzioni di alloggio e auto con link di ricerca

const AccommodationCarManager = {
    // Genera link per Airbnb
    generateAirbnbLink(destination, startDate, endDate, guests) {
        const baseUrl = 'https://www.airbnb.it/s/';
        const params = new URLSearchParams();
        
        if (startDate) params.append('checkin', startDate);
        if (endDate) params.append('checkout', endDate);
        if (guests && guests > 0) params.append('adults', guests);
        
        const location = encodeURIComponent(destination || '');
        return `${baseUrl}${location}/homes?${params.toString()}`;
    },

    // Genera link per Booking.com
    generateBookingLink(destination, startDate, endDate, guests) {
        const baseUrl = 'https://www.booking.com/searchresults.it.html';
        const params = new URLSearchParams();
        
        if (destination) params.append('ss', destination);
        if (guests && guests > 0) params.append('group_adults', guests);
        
        if (startDate) {
            const checkIn = new Date(startDate);
            params.append('checkin_year', checkIn.getFullYear());
            params.append('checkin_month', checkIn.getMonth() + 1);
            params.append('checkin_monthday', checkIn.getDate());
        }
        
        if (endDate) {
            const checkOut = new Date(endDate);
            params.append('checkout_year', checkOut.getFullYear());
            params.append('checkout_month', checkOut.getMonth() + 1);
            params.append('checkout_monthday', checkOut.getDate());
        }
        
        return `${baseUrl}?${params.toString()}`;
    },

    // Genera link per RentalCars
    generateRentalCarsLink(destination, startDate, endDate) {
        const baseUrl = 'https://www.rentalcars.com/it/';
        const params = new URLSearchParams();
        
        if (destination) params.append('location', destination);
        
        if (startDate) {
            const pickUp = new Date(startDate);
            params.append('puYear', pickUp.getFullYear());
            params.append('puMonth', pickUp.getMonth() + 1);
            params.append('puDay', pickUp.getDate());
            params.append('puHour', '10');
            params.append('puMinute', '00');
        }
        
        if (endDate) {
            const dropOff = new Date(endDate);
            params.append('doYear', dropOff.getFullYear());
            params.append('doMonth', dropOff.getMonth() + 1);
            params.append('doDay', dropOff.getDate());
            params.append('doHour', '10');
            params.append('doMinute', '00');
        }
        
        return `${baseUrl}?${params.toString()}`;
    },

    // Genera link per Hertz
    generateHertzLink(destination, startDate, endDate) {
        const baseUrl = 'https://www.hertz.it/rentacar/reservation/';
        const params = new URLSearchParams();
        
        if (destination) params.append('targetPage', 'locationSearch.jsp');
        
        if (startDate) {
            const pickUp = new Date(startDate);
            params.append('pickUpYear', pickUp.getFullYear());
            params.append('pickUpMonth', String(pickUp.getMonth() + 1).padStart(2, '0'));
            params.append('pickUpDay', String(pickUp.getDate()).padStart(2, '0'));
            params.append('pickUpTime', '10:00');
        }
        
        if (endDate) {
            const dropOff = new Date(endDate);
            params.append('returnYear', dropOff.getFullYear());
            params.append('returnMonth', String(dropOff.getMonth() + 1).padStart(2, '0'));
            params.append('returnDay', String(dropOff.getDate()).padStart(2, '0'));
            params.append('returnTime', '10:00');
        }
        
        return `${baseUrl}?${params.toString()}`;
    },

    // Apri link di ricerca Airbnb
    openAirbnbSearch() {
        const destination = document.getElementById('destination').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const guests = document.querySelectorAll('.participant-tag').length;
        
        const url = this.generateAirbnbLink(destination, startDate, endDate, guests);
        window.open(url, '_blank');
    },

    // Apri link di ricerca Booking
    openBookingSearch() {
        const destination = document.getElementById('destination').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const guests = document.querySelectorAll('.participant-tag').length;
        
        const url = this.generateBookingLink(destination, startDate, endDate, guests);
        window.open(url, '_blank');
    },

    // Apri link di ricerca RentalCars
    openRentalCarsSearch() {
        const destination = document.getElementById('destination').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        const url = this.generateRentalCarsLink(destination, startDate, endDate);
        window.open(url, '_blank');
    },

    // Apri link di ricerca Hertz
    openHertzSearch() {
        const destination = document.getElementById('destination').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        const url = this.generateHertzLink(destination, startDate, endDate);
        window.open(url, '_blank');
    },

    // Ottieni l'opzione di alloggio selezionata
    getSelectedAccommodation() {
        const selectedRadio = document.querySelector('input[name="accommodation"]:checked');
        if (!selectedRadio) return { name: '', price: 0, link: '' };
        
        const index = selectedRadio.dataset.index;
        const nameInput = document.querySelector(`#accommodationOptions .option-name[data-index="${index}"]`);
        const priceInput = document.querySelector(`#accommodationOptions .option-price[data-index="${index}"]`);
        const linkInput = document.querySelector(`#accommodationOptions .option-link[data-index="${index}"]`);
        
        return {
            name: nameInput ? nameInput.value : '',
            price: priceInput ? parseFloat(priceInput.value) || 0 : 0,
            link: linkInput ? linkInput.value : ''
        };
    },

    // Ottieni le opzioni auto selezionate
    getSelectedCars() {
        const selectedCheckboxes = document.querySelectorAll('input[name="car"]:checked');
        const cars = [];
        
        selectedCheckboxes.forEach(checkbox => {
            const index = checkbox.dataset.index;
            const nameInput = document.querySelector(`#carOptions .option-name[data-index="${index}"]`);
            const priceInput = document.querySelector(`#carOptions .option-price[data-index="${index}"]`);
            const linkInput = document.querySelector(`#carOptions .option-link[data-index="${index}"]`);
            
            cars.push({
                name: nameInput ? nameInput.value : '',
                price: priceInput ? parseFloat(priceInput.value) || 0 : 0,
                link: linkInput ? linkInput.value : ''
            });
        });
        
        return cars;
    },

    // Ottieni le opzioni "Altro" selezionate
    getSelectedOther() {
        const selectedCheckboxes = document.querySelectorAll('input[name="other"]:checked');
        const others = [];
        
        selectedCheckboxes.forEach(checkbox => {
            const index = checkbox.dataset.index;
            const nameInput = document.querySelector(`#otherOptions .option-name[data-index="${index}"]`);
            const priceInput = document.querySelector(`#otherOptions .option-price[data-index="${index}"]`);
            const noteInput = document.querySelector(`#otherOptions .option-note[data-index="${index}"]`);
            
            others.push({
                name: nameInput ? nameInput.value : '',
                price: priceInput ? parseFloat(priceInput.value) || 0 : 0,
                note: noteInput ? noteInput.value : ''
            });
        });
        
        return others;
    },

    // Calcola il totale delle auto selezionate
    calculateCarTotal() {
        const cars = this.getSelectedCars();
        return cars.reduce((total, car) => total + car.price, 0);
    },

    // Calcola il totale delle spese "Altro" selezionate
    calculateOtherTotal() {
        const others = this.getSelectedOther();
        return others.reduce((total, other) => total + other.price, 0);
    },

    // Carica le opzioni di alloggio nello scenario
    loadAccommodationOptions(accommodationOptions) {
        if (!accommodationOptions || accommodationOptions.length === 0) {
            // Inizializza con opzioni vuote
            accommodationOptions = Array(5).fill(null).map(() => ({ name: '', price: 0, link: '' }));
        }
        
        accommodationOptions.forEach((option, index) => {
            const nameInput = document.querySelector(`#accommodationOptions .option-name[data-index="${index}"]`);
            const priceInput = document.querySelector(`#accommodationOptions .option-price[data-index="${index}"]`);
            const linkInput = document.querySelector(`#accommodationOptions .option-link[data-index="${index}"]`);
            
            if (nameInput) nameInput.value = option.name || '';
            if (priceInput) priceInput.value = option.price || 0;
            if (linkInput) linkInput.value = option.link || '';
        });
    },

    // Carica le opzioni auto nello scenario
    loadCarOptions(carOptions) {
        if (!carOptions || carOptions.length === 0) {
            // Inizializza con opzioni vuote
            carOptions = Array(5).fill(null).map(() => ({ name: '', price: 0, link: '', selected: false }));
        }
        
        carOptions.forEach((option, index) => {
            const checkbox = document.querySelector(`input[name="car"][data-index="${index}"]`);
            const nameInput = document.querySelector(`#carOptions .option-name[data-index="${index}"]`);
            const priceInput = document.querySelector(`#carOptions .option-price[data-index="${index}"]`);
            const linkInput = document.querySelector(`#carOptions .option-link[data-index="${index}"]`);
            
            if (checkbox) checkbox.checked = option.selected || false;
            if (nameInput) nameInput.value = option.name || '';
            if (priceInput) priceInput.value = option.price || 0;
            if (linkInput) linkInput.value = option.link || '';
        });
    },

    // Carica le opzioni "Altro" nello scenario
    loadOtherOptions(otherOptions) {
        if (!otherOptions || otherOptions.length === 0) {
            // Inizializza con opzioni vuote
            otherOptions = Array(5).fill(null).map(() => ({ name: '', price: 0, note: '', selected: false }));
        }
        
        otherOptions.forEach((option, index) => {
            const checkbox = document.querySelector(`input[name="other"][data-index="${index}"]`);
            const nameInput = document.querySelector(`#otherOptions .option-name[data-index="${index}"]`);
            const priceInput = document.querySelector(`#otherOptions .option-price[data-index="${index}"]`);
            const noteInput = document.querySelector(`#otherOptions .option-note[data-index="${index}"]`);
            
            if (checkbox) checkbox.checked = option.selected || false;
            if (nameInput) nameInput.value = option.name || '';
            if (priceInput) priceInput.value = option.price || 0;
            if (noteInput) noteInput.value = option.note || '';
        });
    },

    // Salva le opzioni di alloggio
    saveAccommodationOptions() {
        const options = [];
        for (let i = 0; i < 5; i++) {
            const nameInput = document.querySelector(`#accommodationOptions .option-name[data-index="${i}"]`);
            const priceInput = document.querySelector(`#accommodationOptions .option-price[data-index="${i}"]`);
            const linkInput = document.querySelector(`#accommodationOptions .option-link[data-index="${i}"]`);
            
            options.push({
                name: nameInput ? nameInput.value : '',
                price: priceInput ? parseFloat(priceInput.value) || 0 : 0,
                link: linkInput ? linkInput.value : ''
            });
        }
        return options;
    },

    // Salva le opzioni auto
    saveCarOptions() {
        const options = [];
        for (let i = 0; i < 5; i++) {
            const checkbox = document.querySelector(`input[name="car"][data-index="${i}"]`);
            const nameInput = document.querySelector(`#carOptions .option-name[data-index="${i}"]`);
            const priceInput = document.querySelector(`#carOptions .option-price[data-index="${i}"]`);
            const linkInput = document.querySelector(`#carOptions .option-link[data-index="${i}"]`);
            
            options.push({
                name: nameInput ? nameInput.value : '',
                price: priceInput ? parseFloat(priceInput.value) || 0 : 0,
                link: linkInput ? linkInput.value : '',
                selected: checkbox ? checkbox.checked : false
            });
        }
        return options;
    },

    // Salva le opzioni "Altro"
    saveOtherOptions() {
        const options = [];
        for (let i = 0; i < 5; i++) {
            const checkbox = document.querySelector(`input[name="other"][data-index="${i}"]`);
            const nameInput = document.querySelector(`#otherOptions .option-name[data-index="${i}"]`);
            const priceInput = document.querySelector(`#otherOptions .option-price[data-index="${i}"]`);
            const noteInput = document.querySelector(`#otherOptions .option-note[data-index="${i}"]`);
            
            options.push({
                name: nameInput ? nameInput.value : '',
                price: priceInput ? parseFloat(priceInput.value) || 0 : 0,
                note: noteInput ? noteInput.value : '',
                selected: checkbox ? checkbox.checked : false
            });
        }
        return options;
    },

    // Ottieni l'indice dell'opzione di alloggio selezionata
    getSelectedAccommodationIndex() {
        const selectedRadio = document.querySelector('input[name="accommodation"]:checked');
        return selectedRadio ? parseInt(selectedRadio.dataset.index) : 0;
    },

    // Imposta l'opzione di alloggio selezionata
    setSelectedAccommodationIndex(index) {
        const radio = document.querySelector(`input[name="accommodation"][data-index="${index}"]`);
        if (radio) radio.checked = true;
    }
};

// Made with Bob