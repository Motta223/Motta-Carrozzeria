// 🗄️ DATABASE CONFIGURATION FOR RENDER POSTGRESQL
const { Pool } = require('pg');
require('dotenv').config();

// 🔧 Database connection configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 🏗️ Database initialization and table creation
async function initializeDatabase() {
    const client = await pool.connect();
    
    try {
        console.log('🗄️ Inizializzando database...');
        
        // 👥 Users table (for future expansion)
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL,
                name VARCHAR(100) NOT NULL,
                operator_id VARCHAR(50),
                department VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 📋 Works table
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

        // 📸 Photos table
        await client.query(`
            CREATE TABLE IF NOT EXISTS work_photos (
                id SERIAL PRIMARY KEY,
                work_id VARCHAR(20) REFERENCES works(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                data TEXT NOT NULL,
                size INTEGER,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 🔧 Spare parts table
        await client.query(`
            CREATE TABLE IF NOT EXISTS work_spare_parts (
                id VARCHAR(20) PRIMARY KEY,
                work_id VARCHAR(20) REFERENCES works(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                code VARCHAR(100) NOT NULL,
                quantity INTEGER NOT NULL,
                unit_price DECIMAL(10,2) NOT NULL,
                total_price DECIMAL(10,2) NOT NULL,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ⏱️ Timer sessions table
        await client.query(`
            CREATE TABLE IF NOT EXISTS timer_sessions (
                id SERIAL PRIMARY KEY,
                operator_id VARCHAR(50) NOT NULL,
                work_id VARCHAR(20) REFERENCES works(id) ON DELETE CASCADE,
                start_time TIMESTAMP NOT NULL,
                end_time TIMESTAMP,
                duration_seconds INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 📊 Insert sample data if tables are empty
        const worksCount = await client.query('SELECT COUNT(*) FROM works');
        if (parseInt(worksCount.rows[0].count) === 0) {
            console.log('📊 Inserendo dati di esempio...');
            await insertSampleData(client);
        }

        console.log('✅ Database inizializzato con successo');
        
    } catch (error) {
        console.error('❌ Errore inizializzazione database:', error);
        throw error;
    } finally {
        client.release();
    }
}

// 📊 Insert sample data
async function insertSampleData(client) {
    // Sample works
    const sampleWorks = [
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
            estimated_hours: 4
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
            estimated_hours: 8
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
            estimated_hours: 3
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
            estimated_hours: 2
        }
    ];

    for (const work of sampleWorks) {
        await client.query(`
            INSERT INTO works (id, vehicle, client, description, department, priority, status, assigned_to, created_at, estimated_hours)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [work.id, work.vehicle, work.client, work.description, work.department, work.priority, work.status, work.assigned_to, work.created_at, work.estimated_hours]);
    }

    // Sample spare part for BMW
    await client.query(`
        INSERT INTO work_spare_parts (id, work_id, name, code, quantity, unit_price, total_price)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, ['SP001', 'W002', 'Vernice Metallizzata Blu', 'VER-BLU-001', 2, 45.50, 91.00]);
}

// 🔍 Database query functions
const db = {
    // Works
    async getAllWorks() {
        const result = await pool.query(`
            SELECT w.*, 
                   COALESCE(json_agg(DISTINCT jsonb_build_object('id', p.id, 'name', p.name, 'data', p.data, 'size', p.size, 'uploadedAt', p.uploaded_at)) FILTER (WHERE p.id IS NOT NULL), '[]') as photos,
                   COALESCE(json_agg(DISTINCT jsonb_build_object('id', sp.id, 'name', sp.name, 'code', sp.code, 'quantity', sp.quantity, 'unitPrice', sp.unit_price, 'totalPrice', sp.total_price, 'addedAt', sp.added_at)) FILTER (WHERE sp.id IS NOT NULL), '[]') as spare_parts
            FROM works w
            LEFT JOIN work_photos p ON w.id = p.work_id
            LEFT JOIN work_spare_parts sp ON w.id = sp.work_id
            GROUP BY w.id
            ORDER BY w.created_at DESC
        `);
        return result.rows;
    },

    async getWorkById(id) {
        const result = await pool.query(`
            SELECT w.*, 
                   COALESCE(json_agg(DISTINCT jsonb_build_object('id', p.id, 'name', p.name, 'data', p.data, 'size', p.size, 'uploadedAt', p.uploaded_at)) FILTER (WHERE p.id IS NOT NULL), '[]') as photos,
                   COALESCE(json_agg(DISTINCT jsonb_build_object('id', sp.id, 'name', sp.name, 'code', sp.code, 'quantity', sp.quantity, 'unitPrice', sp.unit_price, 'totalPrice', sp.total_price, 'addedAt', sp.added_at)) FILTER (WHERE sp.id IS NOT NULL), '[]') as spare_parts
            FROM works w
            LEFT JOIN work_photos p ON w.id = p.work_id
            LEFT JOIN work_spare_parts sp ON w.id = sp.work_id
            WHERE w.id = $1
            GROUP BY w.id
        `, [id]);
        return result.rows[0];
    },

    async createWork(work) {
        const result = await pool.query(`
            INSERT INTO works (id, vehicle, client, description, department, priority, status, assigned_to, estimated_hours)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `, [work.id, work.vehicle, work.client, work.description, work.department, work.priority, work.status, work.assignedTo, work.estimatedHours]);
        return result.rows[0];
    },

    async updateWork(id, updates) {
        const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
        const values = [id, ...Object.values(updates)];
        
        const result = await pool.query(`
            UPDATE works SET ${setClause}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `, values);
        return result.rows[0];
    },

    async deleteWork(id) {
        await pool.query('DELETE FROM works WHERE id = $1', [id]);
    },

    // Photos
    async addPhoto(workId, photo) {
        const result = await pool.query(`
            INSERT INTO work_photos (work_id, name, data, size)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [workId, photo.name, photo.data, photo.size]);
        return result.rows[0];
    },

    async deletePhoto(photoId) {
        await pool.query('DELETE FROM work_photos WHERE id = $1', [photoId]);
    },

    // Spare Parts
    async addSparePart(workId, part) {
        const result = await pool.query(`
            INSERT INTO work_spare_parts (id, work_id, name, code, quantity, unit_price, total_price)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [part.id, workId, part.name, part.code, part.quantity, part.unitPrice, part.totalPrice]);
        return result.rows[0];
    },

    async deleteSparePart(partId) {
        await pool.query('DELETE FROM work_spare_parts WHERE id = $1', [partId]);
    },

    // Timer Sessions
    async startTimerSession(operatorId, workId) {
        const result = await pool.query(`
            INSERT INTO timer_sessions (operator_id, work_id, start_time)
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            RETURNING *
        `, [operatorId, workId]);
        return result.rows[0];
    },

    async endTimerSession(sessionId, durationSeconds) {
        const result = await pool.query(`
            UPDATE timer_sessions 
            SET end_time = CURRENT_TIMESTAMP, duration_seconds = $2
            WHERE id = $1
            RETURNING *
        `, [sessionId, durationSeconds]);
        return result.rows[0];
    }
};

module.exports = { initializeDatabase, db, pool };
