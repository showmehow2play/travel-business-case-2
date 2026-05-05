// ===== Participants Registry Management =====

class ParticipantsRegistry {
    constructor() {
        this.participants = this.loadParticipants();
    }

    // Load participants from localStorage
    loadParticipants() {
        const stored = localStorage.getItem('participants_registry');
        return stored ? JSON.parse(stored) : [];
    }

    // Save participants to localStorage
    saveParticipants() {
        localStorage.setItem('participants_registry', JSON.stringify(this.participants));
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

    // Add new participant
    add(participantData) {
        const participant = {
            id: Date.now().toString(),
            name: participantData.name.trim(),
            email: participantData.email?.trim() || '',
            phone: participantData.phone?.trim() || '',
            idCard: participantData.idCard?.trim() || '',
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

        this.participants[index] = {
            ...this.participants[index],
            name: participantData.name.trim(),
            email: participantData.email?.trim() || '',
            phone: participantData.phone?.trim() || '',
            idCard: participantData.idCard?.trim() || '',
            notes: participantData.notes?.trim() || '',
            updatedAt: new Date().toISOString()
        };

        this.saveParticipants();
        return this.participants[index];
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
    const container = document.getElementById('participantsList');
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
            ${participants.map(participant => `
                <div class="participant-card" data-id="${participant.id}">
                    <div class="participant-card-header">
                        <div class="participant-avatar">
                            ${participant.name.charAt(0).toUpperCase()}
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
            `).join('')}
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

function saveParticipant(event) {
    event.preventDefault();
    
    const form = event.target;
    const mode = form.dataset.mode;
    const participantId = form.dataset.participantId;
    
    const data = {
        name: document.getElementById('participantName').value,
        email: document.getElementById('participantEmail').value,
        phone: document.getElementById('participantPhone').value,
        idCard: document.getElementById('participantIdCard').value,
        notes: document.getElementById('participantNotes').value
    };

    try {
        if (mode === 'edit' && participantId) {
            participantsRegistry.update(participantId, data);
            showToast('Partecipante aggiornato con successo', 'success');
        } else {
            participantsRegistry.add(data);
            showToast('Partecipante aggiunto con successo', 'success');
        }

        closeParticipantModal();
        renderParticipantsList();
    } catch (error) {
        showToast('Errore nel salvataggio: ' + error.message, 'error');
    }
}

function closeParticipantModal() {
    const modal = document.getElementById('participantModal');
    modal.classList.remove('active');
}

function searchParticipants(query) {
    const participants = participantsRegistry.search(query);
    const container = document.getElementById('participantsList');
    
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
            ${participants.map(participant => `
                <div class="participant-card" data-id="${participant.id}">
                    <div class="participant-card-header">
                        <div class="participant-avatar">
                            ${participant.name.charAt(0).toUpperCase()}
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
            `).join('')}
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
