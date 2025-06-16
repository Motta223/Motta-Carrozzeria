// 🗄️ SIMPLE DATABASE WITH AUTOMATIC FALLBACK
const { Pool } = require('pg');
require('dotenv').config();

// 🔧 Database configuration with fallback
let useDatabase = false;
let pool = null;

// Sample data for fallback
const SAMPLE_WORKS = [
    {
        id: 'W001',
        vehicle: 'Fiat Punto AB123CD',
        client: 'Mario Rossi',
        description: 'Riparazione paraurti anteriore e verniciatura',
        department: 'lattoneria',
        priority: 'high',
        status: 'pending',
        assigned_to: null,
        created_at: new Date('2024-01-15'),
        estimated_hours: 4,
        photos: [],
        spare_parts: []
    },
    {
        id: 'W002',
        vehicle: 'BMW Serie 3 XY789ZW',
        client: 'Giulia Bianchi',
        description: 'Verniciatura completa carrozzeria',
        department: 'verniciatura',
        priority: 'urgent',
        status: 'in_progress',
        assigned_to: 'andrea',
        created_at: new Date('2024-01-14'),
        estimated_hours: 8,
        photos: [],
        spare_parts: [
            {
                id: 'SP001',
                name: 'Vernice Metallizzata Blu',
                code: 'VER-BLU-001',
                quantity: 2,
                unitPrice: 45.50,
                totalPrice: 91.00,
                addedAt: new Date()
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
        assigned_to: null,
        created_at: new Date('2024-01-16'),
        estimated_hours: 3,
        photos: [],
        spare_parts: []
    },
    {
        id: 'W004',
        vehicle: 'Audi A4 GH789IJ',
        client: 'Anna Neri',
        description: 'Lavaggio completo e ceratura',
        department: 'lavaggio',
        priority: 'low',
        status: 'completed',
        assigned_to: 'extra',
        created_at: new Date('2024-01-13'),
        estimated_hours: 2,
        photos: [],
        spare_parts: []
    }
];

// Sample clients data
const SAMPLE_CLIENTS = [
    {
        id: 'C001',
        name: 'Mario Rossi',
        phone: '339-1234567',
        email: 'mario.rossi@email.com',
        address: 'Via Roma 123, Milano',
        vehicles: ['Fiat Punto AB123CD'],
        created_at: new Date('2024-01-10')
    },
    {
        id: 'C002',
        name: 'Giulia Bianchi',
        phone: '347-9876543',
        email: 'giulia.bianchi@email.com',
        address: 'Corso Italia 45, Milano',
        vehicles: ['BMW Serie 3 XY789ZW'],
        created_at: new Date('2024-01-12')
    },
    {
        id: 'C003',
        name: 'Luca Verdi',
        phone: '320-5555555',
        email: 'luca.verdi@email.com',
        address: 'Piazza Duomo 1, Milano',
        vehicles: ['Volkswagen Golf CD456EF'],
        created_at: new Date('2024-01-14')
    },
    {
        id: 'C004',
        name: 'Anna Neri',
        phone: '333-7777777',
        email: 'anna.neri@email.com',
        address: 'Via Garibaldi 88, Milano',
        vehicles: ['Audi A4 GH789IJ'],
        created_at: new Date('2024-01-11')
    }
];

// Sample estimates data
const SAMPLE_ESTIMATES = [
    {
        id: 'E001',
        client_id: 'C001',
        vehicle: 'Fiat Punto AB123CD',
        description: 'Riparazione paraurti anteriore e verniciatura',
        department: 'lattoneria',
        priority: 'high',
        labor_hours: 4,
        labor_rate: 45.00,
        labor_cost: 180.00,
        parts_cost: 150.00,
        total_cost: 330.00,
        status: 'pending',
        created_at: new Date('2024-01-15'),
        valid_until: new Date('2024-02-15')
    }
];

// In-memory storage for fallback
let memoryStorage = {
    works: [...SAMPLE_WORKS],
    clients: [...SAMPLE_CLIENTS],
    estimates: [...SAMPLE_ESTIMATES],
    nextWorkId: 5,
    nextClientId: 5,
    nextEstimateId: 2
};

// 🚀 Initialize database with automatic fallback
async function initializeDatabase() {
    console.log('🔧 Inizializzando sistema storage...');
    
    // Try to connect to PostgreSQL if URL is available
    if (process.env.DATABASE_URL) {
        try {
            pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
            });
            
            // Test connection
            const client = await pool.connect();
            await client.query('SELECT NOW()');
            client.release();
            
            useDatabase = true;
            console.log('✅ Database PostgreSQL connesso e funzionante');
            
            // Create tables if they don't exist
            await createTables();
            
        } catch (error) {
            console.log('⚠️ Database PostgreSQL non disponibile:', error.message);
            console.log('📝 Usando storage in memoria come fallback');
            useDatabase = false;
        }
    } else {
        console.log('📝 DATABASE_URL non configurato, uso storage in memoria');
        useDatabase = false;
    }
    
    console.log(`✅ Sistema storage inizializzato (${useDatabase ? 'PostgreSQL' : 'Memoria'})`);
}

// Create database tables
async function createTables() {
    if (!useDatabase || !pool) return;
    
    const client = await pool.connect();
    try {
        // Clients table
        await client.query(`
            CREATE TABLE IF NOT EXISTS clients (
                id VARCHAR(20) PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                phone VARCHAR(50),
                email VARCHAR(200),
                address TEXT,
                vehicles TEXT[],
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Estimates table
        await client.query(`
            CREATE TABLE IF NOT EXISTS estimates (
                id VARCHAR(20) PRIMARY KEY,
                client_id VARCHAR(20) REFERENCES clients(id),
                vehicle VARCHAR(200) NOT NULL,
                description TEXT NOT NULL,
                department VARCHAR(50) NOT NULL,
                priority VARCHAR(20) NOT NULL,
                labor_hours DECIMAL(5,2) DEFAULT 0,
                labor_rate DECIMAL(10,2) DEFAULT 0,
                labor_cost DECIMAL(10,2) DEFAULT 0,
                parts_cost DECIMAL(10,2) DEFAULT 0,
                total_cost DECIMAL(10,2) DEFAULT 0,
                status VARCHAR(20) NOT NULL DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                valid_until TIMESTAMP,
                notes TEXT
            )
        `);

        // Works table (updated with client_id and delivery_date)
        await client.query(`
            CREATE TABLE IF NOT EXISTS works (
                id VARCHAR(20) PRIMARY KEY,
                client_id VARCHAR(20) REFERENCES clients(id),
                estimate_id VARCHAR(20) REFERENCES estimates(id),
                vehicle VARCHAR(200) NOT NULL,
                client VARCHAR(200) NOT NULL,
                description TEXT NOT NULL,
                department VARCHAR(50) NOT NULL,
                priority VARCHAR(20) NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'pending',
                assigned_to VARCHAR(50),
                delivery_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                started_at TIMESTAMP,
                completed_at TIMESTAMP,
                estimated_hours INTEGER DEFAULT 0
            )
        `);
        
        // Insert sample data if empty
        const clientCount = await client.query('SELECT COUNT(*) FROM clients');
        if (parseInt(clientCount.rows[0].count) === 0) {
            console.log('📊 Inserendo clienti di esempio nel database...');
            for (const client of SAMPLE_CLIENTS) {
                await client.query(`
                    INSERT INTO clients (id, name, phone, email, address, vehicles, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [client.id, client.name, client.phone, client.email, client.address, client.vehicles, client.created_at]);
            }
        }

        const estimateCount = await client.query('SELECT COUNT(*) FROM estimates');
        if (parseInt(estimateCount.rows[0].count) === 0) {
            console.log('📊 Inserendo preventivi di esempio nel database...');
            for (const estimate of SAMPLE_ESTIMATES) {
                await client.query(`
                    INSERT INTO estimates (id, client_id, vehicle, description, department, priority, labor_hours, labor_rate, labor_cost, parts_cost, total_cost, status, created_at, valid_until)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                `, [estimate.id, estimate.client_id, estimate.vehicle, estimate.description, estimate.department, estimate.priority, estimate.labor_hours, estimate.labor_rate, estimate.labor_cost, estimate.parts_cost, estimate.total_cost, estimate.status, estimate.created_at, estimate.valid_until]);
            }
        }

        const workCount = await client.query('SELECT COUNT(*) FROM works');
        if (parseInt(workCount.rows[0].count) === 0) {
            console.log('📊 Inserendo lavori di esempio nel database...');
            for (const work of SAMPLE_WORKS) {
                await client.query(`
                    INSERT INTO works (id, client_id, vehicle, client, description, department, priority, status, assigned_to, created_at, estimated_hours)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                `, [work.id, work.id.replace('W', 'C'), work.vehicle, work.client, work.description, work.department, work.priority, work.status, work.assigned_to, work.created_at, work.estimated_hours]);
            }
        }
        
        console.log('✅ Tabelle database create e popolate');
    } finally {
        client.release();
    }
}

// 🔍 Database operations with automatic fallback
const db = {
    async getAllWorks() {
        if (useDatabase && pool) {
            try {
                const result = await pool.query(`
                    SELECT * FROM works ORDER BY created_at DESC
                `);
                return result.rows.map(row => ({
                    id: row.id,
                    vehicle: row.vehicle,
                    client: row.client,
                    description: row.description,
                    department: row.department,
                    priority: row.priority,
                    status: row.status,
                    assignedTo: row.assigned_to,
                    createdAt: row.created_at,
                    startedAt: row.started_at,
                    completedAt: row.completed_at,
                    estimatedHours: row.estimated_hours,
                    photos: [],
                    spareParts: []
                }));
            } catch (error) {
                console.error('❌ Errore database, uso memoria:', error);
                useDatabase = false;
            }
        }
        
        // Memory fallback
        return memoryStorage.works;
    },

    async getWorkById(id) {
        if (useDatabase && pool) {
            try {
                const result = await pool.query('SELECT * FROM works WHERE id = $1', [id]);
                if (result.rows.length > 0) {
                    const row = result.rows[0];
                    return {
                        id: row.id,
                        vehicle: row.vehicle,
                        client: row.client,
                        description: row.description,
                        department: row.department,
                        priority: row.priority,
                        status: row.status,
                        assignedTo: row.assigned_to,
                        createdAt: row.created_at,
                        startedAt: row.started_at,
                        completedAt: row.completed_at,
                        estimatedHours: row.estimated_hours,
                        photos: [],
                        spareParts: []
                    };
                }
                return null;
            } catch (error) {
                console.error('❌ Errore database, uso memoria:', error);
                useDatabase = false;
            }
        }
        
        // Memory fallback
        return memoryStorage.works.find(w => w.id === id) || null;
    },

    async createWork(work) {
        if (useDatabase && pool) {
            try {
                const result = await pool.query(`
                    INSERT INTO works (id, vehicle, client, description, department, priority, status, assigned_to, estimated_hours)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING *
                `, [work.id, work.vehicle, work.client, work.description, work.department, work.priority, work.status, work.assignedTo, work.estimatedHours]);
                
                const row = result.rows[0];
                return {
                    id: row.id,
                    vehicle: row.vehicle,
                    client: row.client,
                    description: row.description,
                    department: row.department,
                    priority: row.priority,
                    status: row.status,
                    assignedTo: row.assigned_to,
                    createdAt: row.created_at,
                    estimatedHours: row.estimated_hours,
                    photos: [],
                    spareParts: []
                };
            } catch (error) {
                console.error('❌ Errore database, uso memoria:', error);
                useDatabase = false;
            }
        }
        
        // Memory fallback
        const newWork = {
            ...work,
            id: work.id || `W${String(memoryStorage.nextWorkId++).padStart(3, '0')}`,
            createdAt: new Date(),
            photos: [],
            spareParts: []
        };
        memoryStorage.works.unshift(newWork);
        return newWork;
    },

    async updateWork(id, updates) {
        if (useDatabase && pool) {
            try {
                const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
                const values = [id, ...Object.values(updates)];
                
                const result = await pool.query(`
                    UPDATE works SET ${setClause}, updated_at = CURRENT_TIMESTAMP
                    WHERE id = $1
                    RETURNING *
                `, values);
                
                if (result.rows.length > 0) {
                    const row = result.rows[0];
                    return {
                        id: row.id,
                        vehicle: row.vehicle,
                        client: row.client,
                        description: row.description,
                        department: row.department,
                        priority: row.priority,
                        status: row.status,
                        assignedTo: row.assigned_to,
                        createdAt: row.created_at,
                        estimatedHours: row.estimated_hours
                    };
                }
            } catch (error) {
                console.error('❌ Errore database, uso memoria:', error);
                useDatabase = false;
            }
        }
        
        // Memory fallback
        const work = memoryStorage.works.find(w => w.id === id);
        if (work) {
            Object.assign(work, updates);
            return work;
        }
        return null;
    },

    async deleteWork(id) {
        if (useDatabase && pool) {
            try {
                await pool.query('DELETE FROM works WHERE id = $1', [id]);
                return;
            } catch (error) {
                console.error('❌ Errore database, uso memoria:', error);
                useDatabase = false;
            }
        }
        
        // Memory fallback
        const index = memoryStorage.works.findIndex(w => w.id === id);
        if (index !== -1) {
            memoryStorage.works.splice(index, 1);
        }
    },

    // CLIENTS OPERATIONS
    async getAllClients() {
        if (useDatabase && pool) {
            try {
                const result = await pool.query('SELECT * FROM clients ORDER BY name ASC');
                return result.rows;
            } catch (error) {
                console.error('❌ Errore database clienti, uso memoria:', error);
                useDatabase = false;
            }
        }
        return memoryStorage.clients;
    },

    async getClientById(id) {
        if (useDatabase && pool) {
            try {
                const result = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
                return result.rows[0] || null;
            } catch (error) {
                console.error('❌ Errore database cliente, uso memoria:', error);
                useDatabase = false;
            }
        }
        return memoryStorage.clients.find(c => c.id === id) || null;
    },

    async createClient(client) {
        if (useDatabase && pool) {
            try {
                const result = await pool.query(`
                    INSERT INTO clients (id, name, phone, email, address, vehicles)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING *
                `, [client.id, client.name, client.phone, client.email, client.address, client.vehicles]);
                return result.rows[0];
            } catch (error) {
                console.error('❌ Errore database crea cliente, uso memoria:', error);
                useDatabase = false;
            }
        }

        const newClient = {
            ...client,
            id: client.id || `C${String(memoryStorage.nextClientId++).padStart(3, '0')}`,
            created_at: new Date()
        };
        memoryStorage.clients.push(newClient);
        return newClient;
    },

    async getClientWorks(clientId) {
        if (useDatabase && pool) {
            try {
                const result = await pool.query('SELECT * FROM works WHERE client_id = $1 ORDER BY created_at DESC', [clientId]);
                return result.rows;
            } catch (error) {
                console.error('❌ Errore database lavori cliente, uso memoria:', error);
                useDatabase = false;
            }
        }
        return memoryStorage.works.filter(w => w.client_id === clientId);
    },

    // ESTIMATES OPERATIONS
    async getAllEstimates() {
        if (useDatabase && pool) {
            try {
                const result = await pool.query(`
                    SELECT e.*, c.name as client_name, c.phone as client_phone
                    FROM estimates e
                    LEFT JOIN clients c ON e.client_id = c.id
                    ORDER BY e.created_at DESC
                `);
                return result.rows;
            } catch (error) {
                console.error('❌ Errore database preventivi, uso memoria:', error);
                useDatabase = false;
            }
        }
        return memoryStorage.estimates.map(e => {
            const client = memoryStorage.clients.find(c => c.id === e.client_id);
            return {
                ...e,
                client_name: client?.name || 'Cliente non trovato',
                client_phone: client?.phone || ''
            };
        });
    },

    async createEstimate(estimate) {
        if (useDatabase && pool) {
            try {
                const result = await pool.query(`
                    INSERT INTO estimates (id, client_id, vehicle, description, department, priority, labor_hours, labor_rate, labor_cost, parts_cost, total_cost, status, valid_until, notes)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                    RETURNING *
                `, [estimate.id, estimate.client_id, estimate.vehicle, estimate.description, estimate.department, estimate.priority, estimate.labor_hours, estimate.labor_rate, estimate.labor_cost, estimate.parts_cost, estimate.total_cost, estimate.status, estimate.valid_until, estimate.notes]);
                return result.rows[0];
            } catch (error) {
                console.error('❌ Errore database crea preventivo, uso memoria:', error);
                useDatabase = false;
            }
        }

        const newEstimate = {
            ...estimate,
            id: estimate.id || `E${String(memoryStorage.nextEstimateId++).padStart(3, '0')}`,
            created_at: new Date()
        };
        memoryStorage.estimates.push(newEstimate);
        return newEstimate;
    },

    async convertEstimateToWork(estimateId) {
        const estimate = await this.getEstimateById(estimateId);
        if (!estimate) return null;

        const newWork = {
            id: `W${Date.now().toString().slice(-6)}`,
            client_id: estimate.client_id,
            estimate_id: estimateId,
            vehicle: estimate.vehicle,
            client: estimate.client_name || 'Cliente',
            description: estimate.description,
            department: estimate.department,
            priority: estimate.priority,
            status: 'pending',
            assignedTo: null,
            estimatedHours: estimate.labor_hours || 0
        };

        return await this.createWork(newWork);
    },

    async getEstimateById(id) {
        if (useDatabase && pool) {
            try {
                const result = await pool.query(`
                    SELECT e.*, c.name as client_name, c.phone as client_phone, c.email as client_email
                    FROM estimates e
                    LEFT JOIN clients c ON e.client_id = c.id
                    WHERE e.id = $1
                `, [id]);
                return result.rows[0] || null;
            } catch (error) {
                console.error('❌ Errore database preventivo, uso memoria:', error);
                useDatabase = false;
            }
        }
        const estimate = memoryStorage.estimates.find(e => e.id === id);
        if (estimate) {
            const client = memoryStorage.clients.find(c => c.id === estimate.client_id);
            return {
                ...estimate,
                client_name: client?.name || 'Cliente non trovato',
                client_phone: client?.phone || '',
                client_email: client?.email || ''
            };
        }
        return null;
    }
};

module.exports = { initializeDatabase, db, pool, useDatabase };
