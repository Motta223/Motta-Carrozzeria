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

// In-memory storage for fallback
let memoryStorage = {
    works: [...SAMPLE_WORKS],
    nextWorkId: 5
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
        // Works table
        await client.query(`
            CREATE TABLE IF NOT EXISTS works (
                id VARCHAR(20) PRIMARY KEY,
                vehicle VARCHAR(200) NOT NULL,
                client VARCHAR(200) NOT NULL,
                description TEXT NOT NULL,
                department VARCHAR(50) NOT NULL,
                priority VARCHAR(20) NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'pending',
                assigned_to VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                started_at TIMESTAMP,
                completed_at TIMESTAMP,
                estimated_hours INTEGER DEFAULT 0
            )
        `);
        
        // Insert sample data if empty
        const count = await client.query('SELECT COUNT(*) FROM works');
        if (parseInt(count.rows[0].count) === 0) {
            console.log('📊 Inserendo dati di esempio nel database...');
            for (const work of SAMPLE_WORKS) {
                await client.query(`
                    INSERT INTO works (id, vehicle, client, description, department, priority, status, assigned_to, created_at, estimated_hours)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                `, [work.id, work.vehicle, work.client, work.description, work.department, work.priority, work.status, work.assigned_to, work.created_at, work.estimated_hours]);
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
    }
};

module.exports = { initializeDatabase, db, pool, useDatabase };
