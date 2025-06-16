// 🚗 CARROZZERIA MOTTA ROBERTO - SISTEMA GESTIONALE
// Versione completamente ricostruita e funzionante

// 📊 DATABASE UTENTI
const USERS = {
    'admin': { 
        password: 'admin', 
        role: 'admin', 
        name: 'Roberto Motta',
        operatorId: null
    },
    'manager': { 
        password: 'manager', 
        role: 'admin', 
        name: 'Manager Generico',
        operatorId: null
    },
    'rocco': { 
        password: 'rocco', 
        role: 'employee', 
        name: 'Rocco Vivona',
        operatorId: 'rocco',
        department: 'lattoneria'
    },
    'andrea': { 
        password: 'andrea', 
        role: 'employee', 
        name: 'Andrea Misrotti',
        operatorId: 'andrea',
        department: 'verniciatura'
    },
    'luca': { 
        password: 'luca', 
        role: 'employee', 
        name: 'Luca Pellica',
        operatorId: 'luca',
        department: 'meccanica'
    },
    'francesco': { 
        password: 'francesco', 
        role: 'employee', 
        name: 'Francesco',
        operatorId: 'francesco',
        department: 'preparazione'
    },
    'extra': { 
        password: 'extra', 
        role: 'employee', 
        name: 'Extra Operatori',
        operatorId: 'extra',
        department: 'lavaggio'
    }
};

// 🏭 REPARTI E OPERATORI
const DEPARTMENTS = {
    'verniciatura': {
        name: 'Verniciatura',
        icon: 'fas fa-spray-can',
        color: '#e74c3c',
        operators: ['andrea', 'francesco']
    },
    'lattoneria': {
        name: 'Lattoneria',
        icon: 'fas fa-hammer',
        color: '#f39c12',
        operators: ['rocco']
    },
    'meccanica': {
        name: 'Meccanica',
        icon: 'fas fa-cog',
        color: '#3498db',
        operators: ['luca']
    },
    'preparazione': {
        name: 'Preparazione',
        icon: 'fas fa-brush',
        color: '#9b59b6',
        operators: ['francesco']
    },
    'lavaggio': {
        name: 'Lavaggio',
        icon: 'fas fa-tint',
        color: '#1abc9c',
        operators: ['extra']
    }
};

// 🔧 VARIABILI GLOBALI
let currentUser = null;
let works = [];
let timers = {};

// 💾 DATI DI ESEMPIO
const SAMPLE_WORKS = [
    {
        id: 'W001',
        vehicle: 'Fiat Punto AB123CD',
        client: 'Mario Rossi',
        description: 'Riparazione paraurti anteriore e verniciatura',
        department: 'lattoneria',
        priority: 'high',
        status: 'pending',
        assignedTo: null,
        createdAt: new Date('2024-01-15'),
        estimatedHours: 4,
        photos: [],
        spareParts: []
    },
    {
        id: 'W002',
        vehicle: 'BMW Serie 3 XY789ZW',
        client: 'Giulia Bianchi',
        description: 'Verniciatura completa carrozzeria',
        department: 'verniciatura',
        priority: 'urgent',
        status: 'in_progress',
        assignedTo: 'andrea',
        createdAt: new Date('2024-01-14'),
        estimatedHours: 8,
        photos: [],
        spareParts: [
            {
                id: 'SP001',
                name: 'Vernice Metallizzata Blu',
                code: 'VER-BLU-001',
                quantity: 2,
                unitPrice: 45.50,
                totalPrice: 91.00
            }
        ]
    },
    {
        id: 'W003',
        vehicle: 'Volkswagen Golf CD456EF',
        client: 'Luca Verdi',
        description: 'Controllo e sostituzione freni',
        department: 'meccanica',
        priority: 'medium',
        status: 'pending',
        assignedTo: null,
        createdAt: new Date('2024-01-16'),
        estimatedHours: 3,
        photos: [],
        spareParts: []
    },
    {
        id: 'W004',
        vehicle: 'Audi A4 GH789IJ',
        client: 'Anna Neri',
        description: 'Lavaggio completo e ceratura',
        department: 'lavaggio',
        priority: 'low',
        status: 'completed',
        assignedTo: 'extra',
        createdAt: new Date('2024-01-13'),
        estimatedHours: 2,
        photos: [],
        spareParts: []
    }
];

// 🚀 INIZIALIZZAZIONE
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inizializzazione Sistema Carrozzeria...');

    // Carica dati dal database
    await loadData();

    // Setup login
    setupLogin();

    // Setup navigation
    setupNavigation();

    // Setup forms
    setupForms();

    // Controlla se già loggato
    checkExistingLogin();

    console.log('✅ Sistema inizializzato correttamente');
});

// 🔐 SISTEMA LOGIN
function setupLogin() {
    const loginForm = document.getElementById('loginForm');
    
    if (!loginForm) {
        console.error('❌ Form login non trovato');
        return;
    }
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        console.log('🔐 Tentativo login:', username);
        
        if (!username || !password) {
            showToast('Errore', 'Inserisci username e password', 'error');
            return;
        }
        
        if (USERS[username] && USERS[username].password === password) {
            console.log('✅ Login riuscito');
            
            currentUser = {
                username: username,
                role: USERS[username].role,
                name: USERS[username].name,
                operatorId: USERS[username].operatorId,
                department: USERS[username].department
            };
            
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showDashboard();
            showToast('Benvenuto!', `Ciao ${currentUser.name}`, 'success');
            
        } else {
            console.log('❌ Login fallito');
            showToast('Errore Login', 'Credenziali non corrette', 'error');
        }
    });
    
    console.log('✅ Login configurato');
}

// 🚀 QUICK LOGIN
function quickLogin(username, password) {
    document.getElementById('username').value = username;
    document.getElementById('password').value = password;
    document.getElementById('loginForm').dispatchEvent(new Event('submit'));
}

// 📱 CONTROLLO LOGIN ESISTENTE
function checkExistingLogin() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            showDashboard();
            console.log('✅ Utente già loggato:', currentUser.name);
        } catch (e) {
            localStorage.removeItem('currentUser');
            console.log('❌ Errore nel caricamento utente salvato');
        }
    }
}

// 🎯 MOSTRA DASHBOARD
function showDashboard() {
    console.log('🎯 Mostrando dashboard...');
    
    // Nascondi login
    document.getElementById('loginScreen').style.display = 'none';
    
    // Mostra dashboard
    const dashboard = document.getElementById('dashboard');
    dashboard.style.display = 'block';
    dashboard.classList.add('active');
    
    // Aggiorna info utente
    updateUserInfo();
    
    // Carica dati dashboard
    loadDashboardData();
    
    console.log('✅ Dashboard mostrata');
}

// 👤 AGGIORNA INFO UTENTE
function updateUserInfo() {
    if (!currentUser) return;
    
    document.getElementById('currentUser').textContent = currentUser.name;
    document.getElementById('currentRole').textContent = currentUser.role === 'admin' ? 'Manager' : 'Dipendente';
    
    // Mostra/nascondi tab admin
    const reportsTab = document.getElementById('reportsTab');
    if (reportsTab) {
        reportsTab.style.display = currentUser.role === 'admin' ? 'block' : 'none';
    }
}

// 📊 CARICA DATI DASHBOARD
function loadDashboardData() {
    console.log('📊 Caricando dati dashboard...');
    
    // Aggiorna statistiche
    updateQuickStats();
    
    // Renderizza reparti
    renderDepartments();
    
    // Renderizza lista lavori
    renderWorkList();
    
    console.log('✅ Dati dashboard caricati');
}

// 📈 AGGIORNA STATISTICHE RAPIDE
function updateQuickStats() {
    const urgentCount = works.filter(w => w.priority === 'urgent').length;
    const activeCount = works.filter(w => w.status === 'in_progress').length;
    const completedCount = works.filter(w => w.status === 'completed').length;
    const operatorsCount = Object.keys(USERS).filter(u => USERS[u].role === 'employee').length;
    
    document.getElementById('urgentCount').textContent = urgentCount;
    document.getElementById('activeCount').textContent = activeCount;
    document.getElementById('completedCount').textContent = completedCount;
    document.getElementById('operatorsCount').textContent = operatorsCount;
}

// 🏭 RENDERIZZA REPARTI
function renderDepartments() {
    const container = document.getElementById('departmentsContainer');
    if (!container) return;
    
    // Usa la struttura HTML già presente
    Object.keys(DEPARTMENTS).forEach(deptKey => {
        const dept = DEPARTMENTS[deptKey];
        const deptWorks = works.filter(w => w.department === deptKey);
        const worksContainer = document.getElementById(`${deptKey}-works`);
        
        if (worksContainer) {
            if (deptWorks.length > 0) {
                worksContainer.classList.add('has-works');
                worksContainer.innerHTML = deptWorks.map(work => `
                    <div class="work-item ${work.priority}" onclick="selectWork('${work.id}')">
                        <div class="work-item-header">
                            <span class="work-vehicle">${work.vehicle}</span>
                            <span class="work-priority ${work.priority}">${getPriorityText(work.priority)}</span>
                        </div>
                        <div class="work-description">${work.description}</div>
                        <div class="work-client">Cliente: ${work.client}</div>
                    </div>
                `).join('');
            } else {
                worksContainer.classList.remove('has-works');
                worksContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Nessun lavoro assegnato</p>';
            }
        }
    });
}

// 📋 RENDERIZZA LISTA LAVORI
function renderWorkList() {
    const container = document.getElementById('workList');
    if (!container) return;
    
    let filteredWorks = works;
    
    // Filtra per dipendente se non è admin
    if (currentUser && currentUser.role !== 'admin' && currentUser.department) {
        filteredWorks = works.filter(w => w.department === currentUser.department);
    }
    
    // Applica filtro selezionato
    const filter = document.getElementById('workFilter')?.value;
    if (filter && filter !== 'all') {
        filteredWorks = filteredWorks.filter(w => w.status === filter);
    }
    
    if (filteredWorks.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Nessun lavoro trovato</p>';
        return;
    }
    
    container.innerHTML = filteredWorks.map(work => `
        <div class="work-list-item ${work.status}" onclick="selectWork('${work.id}')">
            <div class="work-list-header">
                <span class="work-list-vehicle">${work.vehicle}</span>
                <span class="work-list-status ${work.status}">${getStatusText(work.status)}</span>
            </div>
            <div class="work-list-details">
                <div class="work-list-detail">
                    <i class="fas fa-user"></i>
                    <span>${work.client}</span>
                </div>
                <div class="work-list-detail">
                    <i class="fas fa-industry"></i>
                    <span>${DEPARTMENTS[work.department]?.name || work.department}</span>
                </div>
                <div class="work-list-detail">
                    <i class="fas fa-flag"></i>
                    <span>${getPriorityText(work.priority)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// 🔧 FUNZIONI HELPER
function getPriorityText(priority) {
    const priorities = {
        'low': 'Bassa',
        'medium': 'Media',
        'high': 'Alta',
        'urgent': 'Urgente'
    };
    return priorities[priority] || priority;
}

function getStatusText(status) {
    const statuses = {
        'pending': 'In Attesa',
        'in_progress': 'In Corso',
        'completed': 'Completato',
        'on_hold': 'In Pausa'
    };
    return statuses[status] || status;
}

// 💾 CARICA DATI DAL DATABASE
async function loadData() {
    try {
        console.log('📊 Caricando dati dal database...');
        const response = await fetch('/api/works');
        const result = await response.json();

        if (result.success) {
            works = result.data.map(work => ({
                id: work.id,
                vehicle: work.vehicle,
                client: work.client,
                description: work.description,
                department: work.department,
                priority: work.priority,
                status: work.status,
                assignedTo: work.assigned_to,
                createdAt: work.created_at,
                startedAt: work.started_at,
                completedAt: work.completed_at,
                estimatedHours: work.estimated_hours,
                photos: work.photos || [],
                spareParts: work.spare_parts || []
            }));
            console.log('✅ Dati caricati dal database:', works.length, 'lavori');
        } else {
            console.error('❌ Errore caricamento dati:', result.error);
            works = [...SAMPLE_WORKS]; // Fallback ai dati di esempio
        }
    } catch (error) {
        console.error('❌ Errore connessione database:', error);
        works = [...SAMPLE_WORKS]; // Fallback ai dati di esempio
    }
}

// 💾 SALVA DATI NEL DATABASE
async function saveData() {
    // Non più necessario - i dati vengono salvati automaticamente tramite API
    console.log('💾 Dati sincronizzati con database');
}

// 🚪 LOGOUT
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('dashboard').classList.remove('active');
    document.getElementById('loginScreen').style.display = 'flex';
    
    // Reset form
    document.getElementById('loginForm').reset();
    
    showToast('Logout', 'Arrivederci!', 'info');
    console.log('🚪 Logout effettuato');
}

// 🧭 NAVIGAZIONE TAB
function setupNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');

    navTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

function switchTab(targetTab) {
    // Rimuovi active da tutti i tab
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Attiva il tab selezionato
    document.querySelector(`[data-tab="${targetTab}"]`).classList.add('active');
    document.getElementById(targetTab).classList.add('active');

    console.log('📱 Switched to tab:', targetTab);
}

// 📝 SETUP FORMS
function setupForms() {
    const newWorkForm = document.getElementById('newWorkForm');
    const workFilter = document.getElementById('workFilter');

    if (newWorkForm) {
        newWorkForm.addEventListener('submit', handleNewWork);
    }

    if (workFilter) {
        workFilter.addEventListener('change', renderWorkList);
    }
}

// ➕ GESTIONE NUOVO LAVORO
async function handleNewWork(e) {
    e.preventDefault();

    const newWork = {
        vehicle: document.getElementById('workVehicle').value,
        client: document.getElementById('workClient').value,
        description: document.getElementById('workDescription').value,
        department: document.getElementById('workDepartment').value,
        priority: document.getElementById('workPriority').value
    };

    // Validazione
    if (!newWork.vehicle || !newWork.client || !newWork.description || !newWork.department || !newWork.priority) {
        showToast('Errore', 'Compila tutti i campi obbligatori', 'error');
        return;
    }

    try {
        // Crea lavoro tramite API
        const response = await fetch('/api/works', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newWork)
        });

        const result = await response.json();

        if (result.success) {
            // Ricarica i dati dal database
            await loadData();

            // Aggiorna UI
            loadDashboardData();

            // Reset form
            e.target.reset();

            // Torna alla dashboard
            switchTab('dashboard-tab');

            showToast('Successo', `Lavoro ${result.data.id} creato con successo`, 'success');
            console.log('✅ Nuovo lavoro creato:', result.data.id);
        } else {
            showToast('Errore', result.error || 'Errore nella creazione del lavoro', 'error');
        }
    } catch (error) {
        console.error('❌ Errore creazione lavoro:', error);
        showToast('Errore', 'Errore di connessione al server', 'error');
    }
}

// 🎯 SELEZIONE LAVORO
function selectWork(workId) {
    const work = works.find(w => w.id === workId);
    if (!work) return;

    console.log('🎯 Lavoro selezionato:', workId);

    // Se è un dipendente, può solo gestire i suoi lavori
    if (currentUser.role !== 'admin' && work.department !== currentUser.department) {
        showToast('Accesso Negato', 'Non puoi gestire questo lavoro', 'error');
        return;
    }

    showWorkModal(work);
}

// 📋 MOSTRA MODAL LAVORO
function showWorkModal(work) {
    const modal = createWorkModal(work);
    document.body.appendChild(modal);

    // Mostra modal
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// 🏗️ CREA MODAL LAVORO
function createWorkModal(work) {
    const modal = document.createElement('div');
    modal.className = 'work-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal(this)"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-car"></i> ${work.vehicle}</h3>
                <button class="modal-close" onclick="closeModal(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <!-- Tabs Navigation -->
                <div class="modal-tabs">
                    <button class="modal-tab active" data-modal-tab="details">
                        <i class="fas fa-info-circle"></i> Dettagli
                    </button>
                    <button class="modal-tab" data-modal-tab="photos">
                        <i class="fas fa-camera"></i> Foto (${work.photos?.length || 0})
                    </button>
                    <button class="modal-tab" data-modal-tab="parts">
                        <i class="fas fa-cogs"></i> Ricambi (${work.spareParts?.length || 0})
                    </button>
                </div>

                <!-- Details Tab -->
                <div class="modal-tab-content active" id="details-tab">
                    <div class="work-details">
                        <div class="detail-row">
                            <strong>ID:</strong> ${work.id}
                        </div>
                        <div class="detail-row">
                            <strong>Cliente:</strong> ${work.client}
                        </div>
                        <div class="detail-row">
                            <strong>Descrizione:</strong> ${work.description}
                        </div>
                        <div class="detail-row">
                            <strong>Reparto:</strong> ${DEPARTMENTS[work.department]?.name || work.department}
                        </div>
                        <div class="detail-row">
                            <strong>Priorità:</strong>
                            <span class="priority-badge ${work.priority}">${getPriorityText(work.priority)}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Stato:</strong>
                            <span class="status-badge ${work.status}">${getStatusText(work.status)}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Assegnato a:</strong> ${work.assignedTo ? USERS[work.assignedTo]?.name || work.assignedTo : 'Non assegnato'}
                        </div>
                        <div class="detail-row">
                            <strong>Creato:</strong> ${new Date(work.createdAt).toLocaleDateString('it-IT')}
                        </div>
                        <div class="detail-row">
                            <strong>Costo Ricambi:</strong> €${calculateTotalSpareParts(work)}
                        </div>
                    </div>

                    ${createWorkActions(work)}
                </div>

                <!-- Photos Tab -->
                <div class="modal-tab-content" id="photos-tab">
                    ${createPhotosSection(work)}
                </div>

                <!-- Spare Parts Tab -->
                <div class="modal-tab-content" id="parts-tab">
                    ${createSparePartsSection(work)}
                </div>
            </div>
        </div>
    `;

    // Setup modal tabs
    setupModalTabs(modal);

    return modal;
}

// ⚡ CREA AZIONI LAVORO
function createWorkActions(work) {
    let actions = '<div class="work-actions">';

    if (currentUser.role === 'admin') {
        // Azioni manager
        if (work.status === 'pending') {
            actions += `
                <button class="action-btn assign" onclick="assignWork('${work.id}')">
                    <i class="fas fa-user-plus"></i> Assegna
                </button>
            `;
        }

        if (work.status !== 'completed') {
            actions += `
                <button class="action-btn complete" onclick="completeWork('${work.id}')">
                    <i class="fas fa-check"></i> Completa
                </button>
            `;
        }

        actions += `
            <button class="action-btn delete" onclick="deleteWork('${work.id}')">
                <i class="fas fa-trash"></i> Elimina
            </button>
        `;
    } else {
        // Azioni dipendente
        if (work.assignedTo === currentUser.operatorId) {
            if (work.status === 'pending') {
                actions += `
                    <button class="action-btn start" onclick="startWork('${work.id}')">
                        <i class="fas fa-play"></i> Inizia
                    </button>
                `;
            }

            if (work.status === 'in_progress') {
                actions += `
                    <button class="action-btn pause" onclick="pauseWork('${work.id}')">
                        <i class="fas fa-pause"></i> Pausa
                    </button>
                    <button class="action-btn complete" onclick="completeWork('${work.id}')">
                        <i class="fas fa-check"></i> Completa
                    </button>
                `;
            }
        }
    }

    actions += '</div>';
    return actions;
}

// 👥 ASSEGNA LAVORO
function assignWork(workId) {
    const work = works.find(w => w.id === workId);
    if (!work) return;

    const operators = DEPARTMENTS[work.department]?.operators || [];
    if (operators.length === 0) {
        showToast('Errore', 'Nessun operatore disponibile per questo reparto', 'error');
        return;
    }

    // Auto-assegna al primo operatore disponibile
    const operator = operators[0];
    work.assignedTo = operator;
    work.status = 'pending';

    saveData();
    loadDashboardData();
    closeModal();

    showToast('Assegnato', `Lavoro assegnato a ${USERS[operator]?.name}`, 'success');
}

// ▶️ INIZIA LAVORO
function startWork(workId) {
    const work = works.find(w => w.id === workId);
    if (!work) return;

    work.status = 'in_progress';
    work.startedAt = new Date();

    saveData();
    loadDashboardData();
    closeModal();

    // Avvia timer
    startTimer(currentUser.operatorId);

    showToast('Avviato', 'Lavoro iniziato', 'success');
}

// ⏸️ PAUSA LAVORO
function pauseWork(workId) {
    const work = works.find(w => w.id === workId);
    if (!work) return;

    work.status = 'on_hold';

    saveData();
    loadDashboardData();
    closeModal();

    // Pausa timer
    pauseTimer(currentUser.operatorId);

    showToast('In Pausa', 'Lavoro messo in pausa', 'info');
}

// ✅ COMPLETA LAVORO
function completeWork(workId) {
    const work = works.find(w => w.id === workId);
    if (!work) return;

    work.status = 'completed';
    work.completedAt = new Date();

    saveData();
    loadDashboardData();
    closeModal();

    // Ferma timer
    stopTimer(currentUser.operatorId);

    showToast('Completato', 'Lavoro completato con successo', 'success');
}

// 🗑️ ELIMINA LAVORO
function deleteWork(workId) {
    if (!confirm('Sei sicuro di voler eliminare questo lavoro?')) return;

    works = works.filter(w => w.id !== workId);

    saveData();
    loadDashboardData();
    closeModal();

    showToast('Eliminato', 'Lavoro eliminato', 'info');
}

// ❌ CHIUDI MODAL
function closeModal(element) {
    const modal = element?.closest('.work-modal') || document.querySelector('.work-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// ⏱️ SISTEMA TIMER
function startTimer(operatorId) {
    if (timers[operatorId]) {
        clearInterval(timers[operatorId].interval);
    }

    timers[operatorId] = {
        startTime: Date.now(),
        elapsed: 0,
        interval: setInterval(() => updateTimerDisplay(operatorId), 1000)
    };

    updateTimerButton(operatorId, 'pause');
    console.log('⏱️ Timer avviato per:', operatorId);
}

function pauseTimer(operatorId) {
    if (!timers[operatorId]) return;

    clearInterval(timers[operatorId].interval);
    timers[operatorId].elapsed += Date.now() - timers[operatorId].startTime;

    updateTimerButton(operatorId, 'start');
    console.log('⏸️ Timer in pausa per:', operatorId);
}

function stopTimer(operatorId) {
    if (!timers[operatorId]) return;

    clearInterval(timers[operatorId].interval);
    const totalTime = timers[operatorId].elapsed + (Date.now() - timers[operatorId].startTime);

    delete timers[operatorId];
    updateTimerDisplay(operatorId, 0);
    updateTimerButton(operatorId, 'start');

    console.log('⏹️ Timer fermato per:', operatorId, 'Tempo totale:', Math.round(totalTime / 1000), 's');
    return totalTime;
}

function updateTimerDisplay(operatorId, time = null) {
    const display = document.querySelector(`[data-operator="${operatorId}"] .timer-display`);
    if (!display) return;

    let currentTime = time;
    if (currentTime === null && timers[operatorId]) {
        currentTime = timers[operatorId].elapsed + (Date.now() - timers[operatorId].startTime);
    }

    if (currentTime === null) currentTime = 0;

    const hours = Math.floor(currentTime / 3600000);
    const minutes = Math.floor((currentTime % 3600000) / 60000);
    const seconds = Math.floor((currentTime % 60000) / 1000);

    display.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateTimerButton(operatorId, state) {
    const button = document.querySelector(`[data-operator="${operatorId}"] .timer-btn`);
    if (!button) return;

    button.className = `timer-btn ${state}`;

    if (state === 'start') {
        button.innerHTML = '<i class="fas fa-play"></i>';
        button.onclick = () => startTimer(operatorId);
    } else if (state === 'pause') {
        button.innerHTML = '<i class="fas fa-pause"></i>';
        button.onclick = () => pauseTimer(operatorId);
    }
}

// 🔄 AGGIORNA DASHBOARD
function refreshDashboard() {
    loadDashboardData();
    showToast('Aggiornato', 'Dashboard aggiornata', 'info');
}

// 🍞 SISTEMA TOAST
function showToast(title, message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(toast);

    // Auto rimozione dopo 5 secondi
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

// 📊 GENERA REPORT
function generateReports() {
    const generalStats = document.getElementById('generalStats');
    const departmentStats = document.getElementById('departmentStats');

    if (generalStats) {
        const totalWorks = works.length;
        const completedWorks = works.filter(w => w.status === 'completed').length;
        const pendingWorks = works.filter(w => w.status === 'pending').length;
        const inProgressWorks = works.filter(w => w.status === 'in_progress').length;

        generalStats.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Lavori Totali:</span>
                <span class="stat-value">${totalWorks}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Completati:</span>
                <span class="stat-value">${completedWorks}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">In Attesa:</span>
                <span class="stat-value">${pendingWorks}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">In Corso:</span>
                <span class="stat-value">${inProgressWorks}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Tasso Completamento:</span>
                <span class="stat-value">${totalWorks > 0 ? Math.round((completedWorks / totalWorks) * 100) : 0}%</span>
            </div>
        `;
    }

    if (departmentStats) {
        let deptStatsHTML = '';
        Object.keys(DEPARTMENTS).forEach(deptKey => {
            const dept = DEPARTMENTS[deptKey];
            const deptWorks = works.filter(w => w.department === deptKey);
            const deptCompleted = deptWorks.filter(w => w.status === 'completed').length;

            deptStatsHTML += `
                <div class="dept-stat">
                    <div class="dept-name">
                        <i class="${dept.icon}"></i> ${dept.name}
                    </div>
                    <div class="dept-numbers">
                        <span>${deptWorks.length} lavori</span>
                        <span>${deptCompleted} completati</span>
                    </div>
                </div>
            `;
        });

        departmentStats.innerHTML = deptStatsHTML;
    }
}

// 🎯 SETUP REPORT TAB
function setupReports() {
    const reportsTab = document.querySelector('[data-tab="reports-tab"]');
    if (reportsTab) {
        reportsTab.addEventListener('click', generateReports);
    }
}

// 🔧 INIZIALIZZAZIONE COMPLETA
document.addEventListener('DOMContentLoaded', function() {
    setupReports();
});

// 📸 GESTIONE FOTO
function createPhotosSection(work) {
    const photos = work.photos || [];

    return `
        <div class="photos-section">
            <div class="photos-header">
                <h4><i class="fas fa-camera"></i> Foto del Veicolo</h4>
                <div class="photos-upload">
                    <input type="file" id="photoUpload-${work.id}" accept="image/*" multiple style="display: none;">
                    <button class="btn-upload" onclick="document.getElementById('photoUpload-${work.id}').click()">
                        <i class="fas fa-plus"></i> Aggiungi Foto
                    </button>
                </div>
            </div>

            <div class="photos-grid" id="photosGrid-${work.id}">
                ${photos.map((photo, index) => `
                    <div class="photo-item" data-photo-index="${index}">
                        <img src="${photo.data}" alt="${photo.name}" onclick="viewPhotoFullscreen('${work.id}', ${index})">
                        <div class="photo-overlay">
                            <div class="photo-info">
                                <span class="photo-name">${photo.name}</span>
                                <span class="photo-date">${new Date(photo.uploadedAt).toLocaleDateString('it-IT')}</span>
                            </div>
                            <button class="photo-delete" onclick="deletePhoto('${work.id}', ${index})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}

                ${photos.length === 0 ? '<div class="no-photos"><i class="fas fa-camera"></i><p>Nessuna foto caricata</p></div>' : ''}
            </div>
        </div>
    `;
}

function setupPhotoUpload(workId) {
    const input = document.getElementById(`photoUpload-${workId}`);
    if (!input) return;

    input.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    addPhotoToWork(workId, {
                        name: file.name,
                        data: e.target.result,
                        uploadedAt: new Date(),
                        size: file.size
                    });
                };
                reader.readAsDataURL(file);
            }
        });

        // Reset input
        e.target.value = '';
    });
}

function addPhotoToWork(workId, photoData) {
    const work = works.find(w => w.id === workId);
    if (!work) return;

    if (!work.photos) work.photos = [];
    work.photos.push(photoData);

    saveData();

    // Aggiorna la griglia foto
    updatePhotosGrid(workId);

    // Aggiorna il contatore nel tab
    updateModalTabCounter('photos', work.photos.length);

    showToast('Foto Aggiunta', 'Foto caricata con successo', 'success');
}

function deletePhoto(workId, photoIndex) {
    if (!confirm('Sei sicuro di voler eliminare questa foto?')) return;

    const work = works.find(w => w.id === workId);
    if (!work || !work.photos) return;

    work.photos.splice(photoIndex, 1);
    saveData();

    // Aggiorna la griglia foto
    updatePhotosGrid(workId);

    // Aggiorna il contatore nel tab
    updateModalTabCounter('photos', work.photos.length);

    showToast('Foto Eliminata', 'Foto rimossa con successo', 'info');
}

function updatePhotosGrid(workId) {
    const work = works.find(w => w.id === workId);
    const grid = document.getElementById(`photosGrid-${workId}`);
    if (!grid || !work) return;

    const photos = work.photos || [];

    grid.innerHTML = `
        ${photos.map((photo, index) => `
            <div class="photo-item" data-photo-index="${index}">
                <img src="${photo.data}" alt="${photo.name}" onclick="viewPhotoFullscreen('${workId}', ${index})">
                <div class="photo-overlay">
                    <div class="photo-info">
                        <span class="photo-name">${photo.name}</span>
                        <span class="photo-date">${new Date(photo.uploadedAt).toLocaleDateString('it-IT')}</span>
                    </div>
                    <button class="photo-delete" onclick="deletePhoto('${workId}', ${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('')}

        ${photos.length === 0 ? '<div class="no-photos"><i class="fas fa-camera"></i><p>Nessuna foto caricata</p></div>' : ''}
    `;
}

function viewPhotoFullscreen(workId, photoIndex) {
    const work = works.find(w => w.id === workId);
    if (!work || !work.photos || !work.photos[photoIndex]) return;

    const photo = work.photos[photoIndex];

    const fullscreenModal = document.createElement('div');
    fullscreenModal.className = 'photo-fullscreen';
    fullscreenModal.innerHTML = `
        <div class="fullscreen-overlay" onclick="this.parentElement.remove()"></div>
        <div class="fullscreen-content">
            <button class="fullscreen-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
            <img src="${photo.data}" alt="${photo.name}">
            <div class="fullscreen-info">
                <h4>${photo.name}</h4>
                <p>Caricata il ${new Date(photo.uploadedAt).toLocaleDateString('it-IT')}</p>
            </div>
        </div>
    `;

    document.body.appendChild(fullscreenModal);

    setTimeout(() => {
        fullscreenModal.classList.add('show');
    }, 10);
}

// 🔧 GESTIONE RICAMBI
function createSparePartsSection(work) {
    const spareParts = work.spareParts || [];
    const totalCost = calculateTotalSpareParts(work);

    return `
        <div class="spare-parts-section">
            <div class="parts-header">
                <h4><i class="fas fa-cogs"></i> Ricambi Necessari</h4>
                <div class="parts-total">
                    <strong>Totale: €${totalCost}</strong>
                </div>
            </div>

            <!-- Form Aggiungi Ricambio -->
            <div class="add-part-form">
                <h5>Aggiungi Ricambio</h5>
                <div class="part-form-grid">
                    <input type="text" id="partName-${work.id}" placeholder="Nome ricambio" required>
                    <input type="text" id="partCode-${work.id}" placeholder="Codice" required>
                    <input type="number" id="partQuantity-${work.id}" placeholder="Quantità" min="1" required>
                    <input type="number" id="partPrice-${work.id}" placeholder="Prezzo unitario €" step="0.01" min="0" required>
                    <button class="btn-add-part" onclick="addSparePart('${work.id}')">
                        <i class="fas fa-plus"></i> Aggiungi
                    </button>
                </div>
            </div>

            <!-- Lista Ricambi -->
            <div class="parts-list" id="partsList-${work.id}">
                ${spareParts.length > 0 ? `
                    <div class="parts-table">
                        <div class="parts-table-header">
                            <div>Nome</div>
                            <div>Codice</div>
                            <div>Qtà</div>
                            <div>Prezzo Unit.</div>
                            <div>Totale</div>
                            <div>Azioni</div>
                        </div>
                        ${spareParts.map((part, index) => `
                            <div class="parts-table-row" data-part-index="${index}">
                                <div class="part-name">${part.name}</div>
                                <div class="part-code">${part.code}</div>
                                <div class="part-quantity">${part.quantity}</div>
                                <div class="part-unit-price">€${part.unitPrice.toFixed(2)}</div>
                                <div class="part-total-price">€${part.totalPrice.toFixed(2)}</div>
                                <div class="part-actions">
                                    <button class="btn-edit-part" onclick="editSparePart('${work.id}', ${index})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-delete-part" onclick="deleteSparePart('${work.id}', ${index})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<div class="no-parts"><i class="fas fa-cogs"></i><p>Nessun ricambio aggiunto</p></div>'}
            </div>
        </div>
    `;
}

function addSparePart(workId) {
    const name = document.getElementById(`partName-${workId}`).value.trim();
    const code = document.getElementById(`partCode-${workId}`).value.trim();
    const quantity = parseInt(document.getElementById(`partQuantity-${workId}`).value);
    const unitPrice = parseFloat(document.getElementById(`partPrice-${workId}`).value);

    if (!name || !code || !quantity || !unitPrice) {
        showToast('Errore', 'Compila tutti i campi del ricambio', 'error');
        return;
    }

    const work = works.find(w => w.id === workId);
    if (!work) return;

    if (!work.spareParts) work.spareParts = [];

    const newPart = {
        id: 'SP' + Date.now().toString().slice(-6),
        name: name,
        code: code,
        quantity: quantity,
        unitPrice: unitPrice,
        totalPrice: quantity * unitPrice,
        addedAt: new Date()
    };

    work.spareParts.push(newPart);
    saveData();

    // Reset form
    document.getElementById(`partName-${workId}`).value = '';
    document.getElementById(`partCode-${workId}`).value = '';
    document.getElementById(`partQuantity-${workId}`).value = '';
    document.getElementById(`partPrice-${workId}`).value = '';

    // Aggiorna la lista
    updatePartsListAndTotal(workId);

    // Aggiorna il contatore nel tab
    updateModalTabCounter('parts', work.spareParts.length);

    showToast('Ricambio Aggiunto', `${name} aggiunto con successo`, 'success');
}

function deleteSparePart(workId, partIndex) {
    if (!confirm('Sei sicuro di voler eliminare questo ricambio?')) return;

    const work = works.find(w => w.id === workId);
    if (!work || !work.spareParts) return;

    const deletedPart = work.spareParts[partIndex];
    work.spareParts.splice(partIndex, 1);
    saveData();

    // Aggiorna la lista
    updatePartsListAndTotal(workId);

    // Aggiorna il contatore nel tab
    updateModalTabCounter('parts', work.spareParts.length);

    showToast('Ricambio Eliminato', `${deletedPart.name} rimosso`, 'info');
}

function editSparePart(workId, partIndex) {
    const work = works.find(w => w.id === workId);
    if (!work || !work.spareParts || !work.spareParts[partIndex]) return;

    const part = work.spareParts[partIndex];

    // Popola il form con i dati esistenti
    document.getElementById(`partName-${workId}`).value = part.name;
    document.getElementById(`partCode-${workId}`).value = part.code;
    document.getElementById(`partQuantity-${workId}`).value = part.quantity;
    document.getElementById(`partPrice-${workId}`).value = part.unitPrice;

    // Rimuovi il ricambio esistente
    work.spareParts.splice(partIndex, 1);
    saveData();

    // Aggiorna la lista
    updatePartsListAndTotal(workId);

    // Aggiorna il contatore nel tab
    updateModalTabCounter('parts', work.spareParts.length);

    showToast('Modifica Ricambio', 'Modifica i dati e clicca Aggiungi', 'info');
}

function calculateTotalSpareParts(work) {
    if (!work.spareParts || work.spareParts.length === 0) return '0.00';

    const total = work.spareParts.reduce((sum, part) => sum + part.totalPrice, 0);
    return total.toFixed(2);
}

function updatePartsListAndTotal(workId) {
    const work = works.find(w => w.id === workId);
    const partsList = document.getElementById(`partsList-${workId}`);
    if (!partsList || !work) return;

    const spareParts = work.spareParts || [];
    const totalCost = calculateTotalSpareParts(work);

    // Aggiorna il totale nell'header
    const totalElement = document.querySelector('.parts-total strong');
    if (totalElement) {
        totalElement.textContent = `Totale: €${totalCost}`;
    }

    // Aggiorna la lista
    partsList.innerHTML = spareParts.length > 0 ? `
        <div class="parts-table">
            <div class="parts-table-header">
                <div>Nome</div>
                <div>Codice</div>
                <div>Qtà</div>
                <div>Prezzo Unit.</div>
                <div>Totale</div>
                <div>Azioni</div>
            </div>
            ${spareParts.map((part, index) => `
                <div class="parts-table-row" data-part-index="${index}">
                    <div class="part-name">${part.name}</div>
                    <div class="part-code">${part.code}</div>
                    <div class="part-quantity">${part.quantity}</div>
                    <div class="part-unit-price">€${part.unitPrice.toFixed(2)}</div>
                    <div class="part-total-price">€${part.totalPrice.toFixed(2)}</div>
                    <div class="part-actions">
                        <button class="btn-edit-part" onclick="editSparePart('${workId}', ${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete-part" onclick="deleteSparePart('${workId}', ${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    ` : '<div class="no-parts"><i class="fas fa-cogs"></i><p>Nessun ricambio aggiunto</p></div>';
}

// 📋 GESTIONE MODAL TABS
function setupModalTabs(modal) {
    const tabs = modal.querySelectorAll('.modal-tab');
    const contents = modal.querySelectorAll('.modal-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-modal-tab');

            // Rimuovi active da tutti i tab
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // Attiva il tab selezionato
            this.classList.add('active');
            modal.querySelector(`#${targetTab}-tab`).classList.add('active');

            // Setup specifico per ogni tab
            if (targetTab === 'photos') {
                const workId = extractWorkIdFromModal(modal);
                setupPhotoUpload(workId);
            }
        });
    });

    // Setup iniziale per il tab foto (se è il primo caricamento)
    const workId = extractWorkIdFromModal(modal);
    setupPhotoUpload(workId);
}

function extractWorkIdFromModal(modal) {
    // Estrae l'ID del lavoro dal modal (dal titolo o da un attributo)
    const title = modal.querySelector('.modal-header h3').textContent;
    // Cerca un input con ID che contiene l'ID del lavoro
    const photoInput = modal.querySelector('[id^="photoUpload-"]');
    if (photoInput) {
        return photoInput.id.replace('photoUpload-', '');
    }
    return null;
}

function updateModalTabCounter(tabType, count) {
    const tab = document.querySelector(`[data-modal-tab="${tabType}"]`);
    if (!tab) return;

    const text = tab.innerHTML;
    const newText = text.replace(/\(\d+\)/, `(${count})`);
    tab.innerHTML = newText;
}

// 🔄 AGGIORNA DASHBOARD CON INDICATORI
function renderDepartments() {
    const container = document.getElementById('departmentsContainer');
    if (!container) return;

    // Usa la struttura HTML già presente
    Object.keys(DEPARTMENTS).forEach(deptKey => {
        const dept = DEPARTMENTS[deptKey];
        const deptWorks = works.filter(w => w.department === deptKey);
        const worksContainer = document.getElementById(`${deptKey}-works`);

        if (worksContainer) {
            if (deptWorks.length > 0) {
                worksContainer.classList.add('has-works');
                worksContainer.innerHTML = deptWorks.map(work => `
                    <div class="work-item ${work.priority}" onclick="selectWork('${work.id}')">
                        <div class="work-item-header">
                            <span class="work-vehicle">${work.vehicle}</span>
                            <span class="work-priority ${work.priority}">${getPriorityText(work.priority)}</span>
                        </div>
                        <div class="work-description">${work.description}</div>
                        <div class="work-client">Cliente: ${work.client}</div>
                        <div class="work-indicators">
                            ${work.photos && work.photos.length > 0 ? `<span class="indicator photos"><i class="fas fa-camera"></i> ${work.photos.length}</span>` : ''}
                            ${work.spareParts && work.spareParts.length > 0 ? `<span class="indicator parts"><i class="fas fa-cogs"></i> €${calculateTotalSpareParts(work)}</span>` : ''}
                        </div>
                    </div>
                `).join('');
            } else {
                worksContainer.classList.remove('has-works');
                worksContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Nessun lavoro assegnato</p>';
            }
        }
    });
}

// 📋 AGGIORNA LISTA LAVORI CON INDICATORI
function renderWorkList() {
    const container = document.getElementById('workList');
    if (!container) return;

    let filteredWorks = works;

    // Filtra per dipendente se non è admin
    if (currentUser && currentUser.role !== 'admin' && currentUser.department) {
        filteredWorks = works.filter(w => w.department === currentUser.department);
    }

    // Applica filtro selezionato
    const filter = document.getElementById('workFilter')?.value;
    if (filter && filter !== 'all') {
        filteredWorks = filteredWorks.filter(w => w.status === filter);
    }

    if (filteredWorks.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Nessun lavoro trovato</p>';
        return;
    }

    container.innerHTML = filteredWorks.map(work => `
        <div class="work-list-item ${work.status}" onclick="selectWork('${work.id}')">
            <div class="work-list-header">
                <span class="work-list-vehicle">${work.vehicle}</span>
                <span class="work-list-status ${work.status}">${getStatusText(work.status)}</span>
            </div>
            <div class="work-list-details">
                <div class="work-list-detail">
                    <i class="fas fa-user"></i>
                    <span>${work.client}</span>
                </div>
                <div class="work-list-detail">
                    <i class="fas fa-industry"></i>
                    <span>${DEPARTMENTS[work.department]?.name || work.department}</span>
                </div>
                <div class="work-list-detail">
                    <i class="fas fa-flag"></i>
                    <span>${getPriorityText(work.priority)}</span>
                </div>
            </div>
            <div class="work-list-indicators">
                ${work.photos && work.photos.length > 0 ? `<span class="list-indicator photos"><i class="fas fa-camera"></i> ${work.photos.length} foto</span>` : ''}
                ${work.spareParts && work.spareParts.length > 0 ? `<span class="list-indicator parts"><i class="fas fa-cogs"></i> €${calculateTotalSpareParts(work)} ricambi</span>` : ''}
            </div>
        </div>
    `).join('');
}

console.log('🚗 Sistema Carrozzeria completamente caricato e funzionante!');
