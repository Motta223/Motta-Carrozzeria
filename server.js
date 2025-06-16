const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { initializeDatabase } = require('./database');
const apiRoutes = require('./routes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🔒 Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'"]
        }
    }
}));

// 🗜️ Compression middleware
app.use(compression());

// 🌐 CORS middleware
app.use(cors());

// 📝 JSON middleware
app.use(express.json({ limit: '50mb' })); // Large limit for photo uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 🛣️ API routes
app.use('/api', apiRoutes);

// 📁 Static files middleware
app.use(express.static(path.join(__dirname), {
    maxAge: '1d', // Cache static files for 1 day
    etag: true,
    lastModified: true
}));

// 📋 Logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - ${req.method} ${req.url}`);
    next();
});

// 🏠 Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 🔧 Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: require('./package.json').version
    });
});

// 📊 API endpoint for system info
app.get('/api/info', (req, res) => {
    res.json({
        name: 'Carrozzeria Motta Roberto - Sistema Gestionale',
        version: require('./package.json').version,
        description: 'Sistema di Gestione Lavori e Operatori',
        features: [
            'Gestione Lavori',
            'Dashboard Reparti',
            'Timer Operatori',
            'Upload Foto',
            'Gestione Ricambi',
            'Sistema Login Multi-Ruolo'
        ],
        status: 'active'
    });
});

// 🚫 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// ❌ Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
    });
});

// 🚀 Start server with database initialization
async function startServer() {
    try {
        // Initialize database
        await initializeDatabase();

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`
🚗 ========================================
   CARROZZERIA MOTTA ROBERTO
   Sistema Gestionale Avviato
========================================
🌐 Server: http://localhost:${PORT}
🗄️ Database: PostgreSQL ${process.env.DATABASE_URL ? 'Connected' : 'Local'}
🔧 Environment: ${process.env.NODE_ENV || 'development'}
📦 Version: ${require('./package.json').version}
⏰ Started: ${new Date().toLocaleString('it-IT')}
========================================
            `);
        });
    } catch (error) {
        console.error('❌ Errore avvio server:', error);
        process.exit(1);
    }
}

startServer();

// 🛑 Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

module.exports = app;
