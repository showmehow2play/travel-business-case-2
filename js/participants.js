// ===== Participants Registry Management =====

class ParticipantsRegistry {
    constructor() {
        this.participants = this.loadParticipants();
    }

    // Load participants from localStorage (sync from Supabase happens in background)
    loadParticipants() {
        const stored = localStorage.getItem('participants_registry');
        const participants = stored ? JSON.parse(stored) : [];
        
        // Sync from Supabase in background if available
        if (window.SupabaseStorage && window.SupabaseStorage.isAvailable()) {
            this.syncFromSupabase();
        }
        
        return participants;
    }

    // Save participants to localStorage and Supabase
    saveParticipants() {
        localStorage.setItem('participants_registry', JSON.stringify(this.participants));
        
        // Save to Supabase if available
        if (window.SupabaseStorage && window.SupabaseStorage.isAvailable()) {
            window.SupabaseStorage.saveParticipants(this.participants).catch(err => {
                console.warn('Errore salvataggio partecipanti su Supabase:', err);
            });
        }
    }
    
    // Sync participants from Supabase
    async syncFromSupabase() {
        try {
            if (!window.supabaseClient) return;
            
            const { data, error } = await window.supabaseClient
                .from('participants')
                .select('data');
            
            if (error) {
                console.warn('Errore caricamento partecipanti da Supabase:', error);
                return;
            }
            
            if (data && data.length > 0) {
                const supabaseParticipants = data.map(p => p.data);
                
                // Merge con i partecipanti locali (Supabase ha priorità)
                const localIds = new Set(this.participants.map(p => p.id));
                const supabaseIds = new Set(supabaseParticipants.map(p => p.id));
                
                // Aggiorna partecipanti esistenti e aggiungi nuovi da Supabase
                supabaseParticipants.forEach(sp => {
                    const index = this.participants.findIndex(p => p.id === sp.id);
                    if (index >= 0) {
                        // Aggiorna se Supabase è più recente
                        if (new Date(sp.updatedAt) > new Date(this.participants[index].updatedAt)) {
                            this.participants[index] = sp;
                        }
                    } else {
                        // Aggiungi nuovo partecipante da Supabase
                        this.participants.push(sp);
                    }
                });
                
                // Salva in localStorage
                localStorage.setItem('participants_registry', JSON.stringify(this.participants));
                console.log('✅ Partecipanti sincronizzati da Supabase');
            }
        } catch (error) {
            console.warn('Errore sincronizzazione partecipanti da Supabase:', error);
        }
    }

    // Get all participants
    getAll() {
        return [...this.participants];
    }

    // Get participant by ID
    getById(id) {
        return this.participants.find(p => p.id === id);
    }

    // Get participant by name (case insensitive)
    getByName(name) {
        const normalizedName = name.trim().toLowerCase();
        return this.participants.find(p => p.name.toLowerCase() === normalizedName);
    }

    // Get participant by name with fuzzy matching (for old/similar names)
    getByNameFuzzy(name) {
        const normalizedName = name.trim().toLowerCase();
        
        // Prima prova corrispondenza esatta
        let match = this.participants.find(p => p.name.toLowerCase() === normalizedName);
        if (match) return match;
        
        // Poi prova corrispondenza parziale (uno contiene l'altro)
        match = this.participants.find(p => {
            const pLower = p.name.toLowerCase();
            return pLower.includes(normalizedName) || normalizedName.includes(pLower);
        });
        if (match) return match;
        
        // Infine prova similarità (Levenshtein distance)
        const candidates = this.participants.filter(p => {
            const distance = this.levenshteinDistance(p.name.toLowerCase(), normalizedName);
            return distance <= 3; // Max 3 caratteri di differenza
        });
        
        if (candidates.length > 0) {
            // Ritorna il più simile
            return candidates.reduce((best, current) => {
                const bestDist = this.levenshteinDistance(best.name.toLowerCase(), normalizedName);
                const currentDist = this.levenshteinDistance(current.name.toLowerCase(), normalizedName);
                return currentDist < bestDist ? current : best;
            });
        }
        
        return null;
    }

    // Calculate Levenshtein distance between two strings
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    // Add new participant
    add(participantData) {
        const participant = {
            id: Date.now().toString(),
            name: participantData.name.trim(),
            email: participantData.email?.trim() || '',
            phone: participantData.phone?.trim() || '',
            idCard: participantData.idCard?.trim() || '',
            photo: participantData.photo || '', // Base64 encoded image
            notes: participantData.notes?.trim() || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.participants.push(participant);
        this.saveParticipants();
        return participant;
    }

    // Update existing participant
    update(id, participantData) {
        const index = this.participants.findIndex(p => p.id === id);
        if (index === -1) return null;

        const oldName = this.participants[index].name;
        const newName = participantData.name.trim();

        this.participants[index] = {
            ...this.participants[index],
            name: newName,
            email: participantData.email?.trim() || '',
            phone: participantData.phone?.trim() || '',
            idCard: participantData.idCard?.trim() || '',
            photo: participantData.photo !== undefined ? participantData.photo : this.participants[index].photo,
            notes: participantData.notes?.trim() || '',
            updatedAt: new Date().toISOString()
        };

        this.saveParticipants();
        
        // Se il nome è cambiato, aggiorna tutti gli scenari e consuntivi
        if (oldName !== newName) {
            this.updateParticipantNameInScenarios(oldName, newName);
            this.updateParticipantNameInActuals(oldName, newName);
        }
        
        return this.participants[index];
    }

    // Update participant name in all scenarios
    updateParticipantNameInScenarios(oldName, newName) {
        const scenarios = JSON.parse(localStorage.getItem('scenarios') || '[]');
        let updated = false;

        scenarios.forEach(scenario => {
            if (scenario.participants && Array.isArray(scenario.participants)) {
                const index = scenario.participants.findIndex(p =>
                    p.toLowerCase() === oldName.toLowerCase()
                );
                if (index !== -1) {
                    scenario.participants[index] = newName;
                    updated = true;
                }
            }
        });

        if (updated) {
            localStorage.setItem('scenarios', JSON.stringify(scenarios));
            console.log(`✅ Nome partecipante aggiornato negli scenari: ${oldName} → ${newName}`);
        }
    }

    // Update participant name in all actuals
    updateParticipantNameInActuals(oldName, newName) {
        const actuals = JSON.parse(localStorage.getItem('actuals') || '[]');
        let updated = false;

        actuals.forEach(actual => {
            if (actual.participants && Array.isArray(actual.participants)) {
                const index = actual.participants.findIndex(p =>
                    p.toLowerCase() === oldName.toLowerCase()
                );
                if (index !== -1) {
                    actual.participants[index] = newName;
                    updated = true;
                }
            }
        });

        if (updated) {
            localStorage.setItem('actuals', JSON.stringify(actuals));
            console.log(`✅ Nome partecipante aggiornato nei consuntivi: ${oldName} → ${newName}`);
        }
    }

    // Delete participant
    delete(id) {
        const index = this.participants.findIndex(p => p.id === id);
        if (index === -1) return false;

        this.participants.splice(index, 1);
        this.saveParticipants();
        return true;
    }

    // Add or get participant by name (auto-create if doesn't exist)
    addOrGet(name) {
        const existing = this.getByName(name);
        if (existing) return existing;

        return this.add({ name });
    }

    // Sync participants from scenarios (auto-populate registry)
    syncFromScenarios(scenarios) {
        let added = 0;
        const existingNames = new Set(this.participants.map(p => p.name.toLowerCase()));

        scenarios.forEach(scenario => {
            if (scenario.participants && Array.isArray(scenario.participants)) {
                scenario.participants.forEach(name => {
                    const normalizedName = name.trim().toLowerCase();
                    if (normalizedName && !existingNames.has(normalizedName)) {
                        this.add({ name: name.trim() });
                        existingNames.add(normalizedName);
                        added++;
                    }
                });
            }
        });

        return added;
    }

    // Sync participants from actuals
    syncFromActuals(actuals) {
        let added = 0;
        const existingNames = new Set(this.participants.map(p => p.name.toLowerCase()));

        actuals.forEach(actual => {
            if (actual.participants && Array.isArray(actual.participants)) {
                actual.participants.forEach(name => {
                    const normalizedName = name.trim().toLowerCase();
                    if (normalizedName && !existingNames.has(normalizedName)) {
                        this.add({ name: name.trim() });
                        existingNames.add(normalizedName);
                        added++;
                    }
                });
            }
        });

        return added;
    }

    // Search participants
    search(query) {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) return this.getAll();

        return this.participants.filter(p => 
            p.name.toLowerCase().includes(normalizedQuery) ||
            p.email.toLowerCase().includes(normalizedQuery) ||
            p.phone.includes(normalizedQuery)
        );
    }

    // Get participants sorted by name
    getAllSorted() {
        return [...this.participants].sort((a, b) => 
            a.name.localeCompare(b.name, 'it')
        );
    }

    // Export participants
    export() {
        return {
            participants: this.participants,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    // Import participants
    import(data) {
        if (!data.participants || !Array.isArray(data.participants)) {
            throw new Error('Invalid import data');
        }

        this.participants = data.participants;
        this.saveParticipants();
        return this.participants.length;
    }
}

// Initialize global registry
const participantsRegistry = new ParticipantsRegistry();

// ===== UI Management =====

function renderParticipantsList() {
    const container = document.getElementById('participantsRegistryList');
    if (!container) return;

    const participants = participantsRegistry.getAllSorted();

    if (participants.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👥</div>
                <h3>Nessun partecipante in anagrafica</h3>
                <p>I partecipanti verranno aggiunti automaticamente quando crei preventivi o consuntivi</p>
                <button class="btn btn-primary" onclick="showAddParticipantModal()">
                    + Aggiungi Manualmente
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="participants-grid">
            ${participants.map(participant => {
                // Usa foto se disponibile, altrimenti iniziale
                const avatarContent = participant.photo
                    ? `<img src="${participant.photo}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`
                    : participant.name.charAt(0).toUpperCase();
                
                return `
                <div class="participant-card" data-id="${participant.id}">
                    <div class="participant-card-header">
                        <div class="participant-avatar">
                            ${avatarContent}
                        </div>
                        <div class="participant-info">
                            <h3>${escapeHtml(participant.name)}</h3>
                            <span class="participant-date">
                                Aggiunto il ${new Date(participant.createdAt).toLocaleDateString('it-IT')}
                            </span>
                        </div>
                        <div class="participant-actions">
                            <button class="btn-icon" onclick="editParticipant('${participant.id}')" title="Modifica">
                                ✏️
                            </button>
                            <button class="btn-icon btn-delete" onclick="deleteParticipant('${participant.id}')" title="Elimina">
                                🗑️
                            </button>
                        </div>
                    </div>
                    <div class="participant-card-body">
                        ${participant.email ? `
                            <div class="participant-detail">
                                <span class="detail-icon">📧</span>
                                <span class="detail-value">${escapeHtml(participant.email)}</span>
                            </div>
                        ` : ''}
                        ${participant.phone ? `
                            <div class="participant-detail">
                                <span class="detail-icon">📱</span>
                                <span class="detail-value">${escapeHtml(participant.phone)}</span>
                            </div>
                        ` : ''}
                        ${participant.idCard ? `
                            <div class="participant-detail">
                                <span class="detail-icon">🆔</span>
                                <span class="detail-value">${escapeHtml(participant.idCard)}</span>
                            </div>
                        ` : ''}
                        ${participant.notes ? `
                            <div class="participant-detail notes">
                                <span class="detail-icon">📝</span>
                                <span class="detail-value">${escapeHtml(participant.notes)}</span>
                            </div>
                        ` : ''}
                        ${!participant.email && !participant.phone && !participant.idCard && !participant.notes ? `
                            <div class="participant-detail empty">
                                <span class="detail-value">Nessun dettaglio aggiunto</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    `;
}

function showAddParticipantModal() {
    const modal = document.getElementById('participantModal');
    const form = document.getElementById('participantForm');
    
    document.getElementById('participantModalTitle').textContent = 'Aggiungi Partecipante';
    form.reset();
    form.dataset.mode = 'add';
    delete form.dataset.participantId;
    
    modal.classList.add('active');
}

function editParticipant(id) {
    const participant = participantsRegistry.getById(id);
    if (!participant) return;

    const modal = document.getElementById('participantModal');
    const form = document.getElementById('participantForm');
    
    document.getElementById('participantModalTitle').textContent = 'Modifica Partecipante';
    document.getElementById('participantName').value = participant.name;
    document.getElementById('participantEmail').value = participant.email || '';
    document.getElementById('participantPhone').value = participant.phone || '';
    document.getElementById('participantIdCard').value = participant.idCard || '';
    document.getElementById('participantNotes').value = participant.notes || '';
    
    // Carica foto se presente
    if (participant.photo) {
        const photoPreview = document.getElementById('photoPreview');
        const photoPreviewImg = document.getElementById('photoPreviewImg');
        photoPreviewImg.src = participant.photo;
        photoPreview.style.display = 'block';
        // Salva la foto corrente in un attributo data
        form.dataset.currentPhoto = participant.photo;
    }
    
    form.dataset.mode = 'edit';
    form.dataset.participantId = id;
    
    modal.classList.add('active');
}

function deleteParticipant(id) {
    const participant = participantsRegistry.getById(id);
    if (!participant) return;

    if (confirm(`Sei sicuro di voler eliminare ${participant.name} dall'anagrafica?`)) {
        participantsRegistry.delete(id);
        renderParticipantsList();
        showToast('Partecipante eliminato con successo', 'success');
    }
}

async function saveParticipant(event) {
    event.preventDefault();
    
    const form = event.target;
    const mode = form.dataset.mode;
    const participantId = form.dataset.participantId;
    
    const data = {
        name: document.getElementById('participantName').value,
        email: document.getElementById('participantEmail').value,
        phone: document.getElementById('participantPhone').value,
        idCard: document.getElementById('participantIdCard').value,
        notes: document.getElementById('participantNotes').value,
        photo: form.dataset.currentPhoto || '' // Usa la foto caricata o stringa vuota
    };

    try {
        if (mode === 'edit' && participantId) {
            const oldParticipant = participantsRegistry.getById(participantId);
            const oldName = oldParticipant ? oldParticipant.name : '';
            
            participantsRegistry.update(participantId, data);
            
            // Mostra messaggio diverso se il nome è cambiato
            if (oldName && oldName !== data.name) {
                showToast(`Partecipante aggiornato! Il nome è stato cambiato anche in tutti gli scenari e consuntivi.`, 'success');
            } else {
                showToast('Partecipante aggiornato con successo', 'success');
            }
        } else {
            participantsRegistry.add(data);
            showToast('Partecipante aggiunto con successo', 'success');
        }

        closeParticipantModal();
        renderParticipantsList();
        
        // Ricarica la vista corrente se siamo in uno scenario o consuntivo
        if (typeof App !== 'undefined' && App.currentView === 'scenarioDetailView') {
            // Ricarica lo scenario aggiornato dal localStorage
            if (App.currentScenario && App.currentScenario.id) {
                const updatedScenario = await StorageManager.getScenario(App.currentScenario.id);
                if (updatedScenario) {
                    App.currentScenario = updatedScenario;
                    App.loadScenarioForm(updatedScenario);
                }
            }
        }
    } catch (error) {
        showToast('Errore nel salvataggio: ' + error.message, 'error');
    }
}

function closeParticipantModal() {
    const modal = document.getElementById('participantModal');
    modal.classList.remove('active');
    
    // Reset foto preview
    const photoPreview = document.getElementById('photoPreview');
    const photoInput = document.getElementById('participantPhoto');
    const form = document.getElementById('participantForm');
    
    if (photoPreview) photoPreview.style.display = 'none';
    if (photoInput) photoInput.value = '';
    if (form) delete form.dataset.currentPhoto;
}

// Gestisce il caricamento della foto
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Verifica che sia un'immagine
    if (!file.type.startsWith('image/')) {
        showToast('Per favore seleziona un file immagine', 'error');
        event.target.value = '';
        return;
    }
    
    // Verifica dimensione (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        showToast('La foto deve essere inferiore a 2MB', 'error');
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Ridimensiona l'immagine se troppo grande
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxSize = 400;
            
            if (width > height && width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
            } else if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Converti in base64 con qualità ridotta
            const photoData = canvas.toDataURL('image/jpeg', 0.8);
            
            // Mostra preview
            const photoPreview = document.getElementById('photoPreview');
            const photoPreviewImg = document.getElementById('photoPreviewImg');
            photoPreviewImg.src = photoData;
            photoPreview.style.display = 'block';
            
            // Salva nel form
            const form = document.getElementById('participantForm');
            form.dataset.currentPhoto = photoData;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Rimuove la foto
function removePhoto() {
    const photoPreview = document.getElementById('photoPreview');
    const photoInput = document.getElementById('participantPhoto');
    const form = document.getElementById('participantForm');
    
    photoPreview.style.display = 'none';
    photoInput.value = '';
    form.dataset.currentPhoto = '';
    
    showToast('Foto rimossa', 'success');
}

function searchParticipants(query) {
    const participants = participantsRegistry.search(query);
    const container = document.getElementById('participantsRegistryList');
    
    // Re-render with filtered results
    if (participants.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3>Nessun risultato</h3>
                <p>Nessun partecipante trovato per "${escapeHtml(query)}"</p>
            </div>
        `;
        return;
    }

    // Render filtered participants (reuse rendering logic)
    container.innerHTML = `
        <div class="participants-grid">
            ${participants.map(participant => {
                // Usa foto se disponibile, altrimenti iniziale
                const avatarContent = participant.photo
                    ? `<img src="${participant.photo}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`
                    : participant.name.charAt(0).toUpperCase();
                
                return `
                <div class="participant-card" data-id="${participant.id}">
                    <div class="participant-card-header">
                        <div class="participant-avatar">
                            ${avatarContent}
                        </div>
                        <div class="participant-info">
                            <h3>${escapeHtml(participant.name)}</h3>
                            <span class="participant-date">
                                Aggiunto il ${new Date(participant.createdAt).toLocaleDateString('it-IT')}
                            </span>
                        </div>
                        <div class="participant-actions">
                            <button class="btn-icon" onclick="editParticipant('${participant.id}')" title="Modifica">
                                ✏️
                            </button>
                            <button class="btn-icon btn-delete" onclick="deleteParticipant('${participant.id}')" title="Elimina">
                                🗑️
                            </button>
                        </div>
                    </div>
                    <div class="participant-card-body">
                        ${participant.email ? `
                            <div class="participant-detail">
                                <span class="detail-icon">📧</span>
                                <span class="detail-value">${escapeHtml(participant.email)}</span>
                            </div>
                        ` : ''}
                        ${participant.phone ? `
                            <div class="participant-detail">
                                <span class="detail-icon">📱</span>
                                <span class="detail-value">${escapeHtml(participant.phone)}</span>
                            </div>
                        ` : ''}
                        ${participant.idCard ? `
                            <div class="participant-detail">
                                <span class="detail-icon">🆔</span>
                                <span class="detail-value">${escapeHtml(participant.idCard)}</span>
                            </div>
                        ` : ''}
                        ${participant.notes ? `
                            <div class="participant-detail notes">
                                <span class="detail-icon">📝</span>
                                <span class="detail-value">${escapeHtml(participant.notes)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    `;
}

// Auto-sync participants from existing data
function autoSyncParticipants() {
    const scenarios = JSON.parse(localStorage.getItem('scenarios') || '[]');
    const actuals = JSON.parse(localStorage.getItem('actuals') || '[]');
    
    const addedFromScenarios = participantsRegistry.syncFromScenarios(scenarios);
    const addedFromActuals = participantsRegistry.syncFromActuals(actuals);
    
    const total = addedFromScenarios + addedFromActuals;
    if (total > 0) {
        showToast(`${total} partecipanti aggiunti automaticamente all'anagrafica`, 'success');
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Toast notification function
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = 'toast show';
    
    if (type === 'success') {
        toast.classList.add('success');
    } else if (type === 'error') {
        toast.classList.add('error');
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.className = 'toast';
        }, 300);
    }, 3000);
}

// Made with Bob
