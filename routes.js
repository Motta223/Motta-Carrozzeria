// 🛣️ API ROUTES FOR CARROZZERIA MANAGEMENT SYSTEM
const express = require('express');
const { db } = require('./database');
const router = express.Router();

// 📋 WORKS ROUTES

// Get all works
router.get('/works', async (req, res) => {
    try {
        const works = await db.getAllWorks();
        res.json({
            success: true,
            data: works,
            count: works.length
        });
    } catch (error) {
        console.error('Error fetching works:', error);
        res.status(500).json({
            success: false,
            error: 'Errore nel recupero dei lavori'
        });
    }
});

// Get work by ID
router.get('/works/:id', async (req, res) => {
    try {
        const work = await db.getWorkById(req.params.id);
        if (!work) {
            return res.status(404).json({
                success: false,
                error: 'Lavoro non trovato'
            });
        }
        res.json({
            success: true,
            data: work
        });
    } catch (error) {
        console.error('Error fetching work:', error);
        res.status(500).json({
            success: false,
            error: 'Errore nel recupero del lavoro'
        });
    }
});

// Create new work
router.post('/works', async (req, res) => {
    try {
        const { vehicle, client, description, department, priority } = req.body;
        
        if (!vehicle || !client || !description || !department || !priority) {
            return res.status(400).json({
                success: false,
                error: 'Campi obbligatori mancanti'
            });
        }

        const newWork = {
            id: 'W' + Date.now().toString().slice(-6),
            vehicle,
            client,
            description,
            department,
            priority,
            status: 'pending',
            assignedTo: null,
            estimatedHours: 0
        };

        const work = await db.createWork(newWork);
        res.status(201).json({
            success: true,
            data: work,
            message: 'Lavoro creato con successo'
        });
    } catch (error) {
        console.error('Error creating work:', error);
        res.status(500).json({
            success: false,
            error: 'Errore nella creazione del lavoro'
        });
    }
});

// Update work
router.put('/works/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Convert camelCase to snake_case for database
        const dbUpdates = {};
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.assignedTo) dbUpdates.assigned_to = updates.assignedTo;
        if (updates.priority) dbUpdates.priority = updates.priority;
        if (updates.startedAt) dbUpdates.started_at = updates.startedAt;
        if (updates.completedAt) dbUpdates.completed_at = updates.completedAt;

        const work = await db.updateWork(id, dbUpdates);
        if (!work) {
            return res.status(404).json({
                success: false,
                error: 'Lavoro non trovato'
            });
        }

        res.json({
            success: true,
            data: work,
            message: 'Lavoro aggiornato con successo'
        });
    } catch (error) {
        console.error('Error updating work:', error);
        res.status(500).json({
            success: false,
            error: 'Errore nell\'aggiornamento del lavoro'
        });
    }
});

// Delete work
router.delete('/works/:id', async (req, res) => {
    try {
        await db.deleteWork(req.params.id);
        res.json({
            success: true,
            message: 'Lavoro eliminato con successo'
        });
    } catch (error) {
        console.error('Error deleting work:', error);
        res.status(500).json({
            success: false,
            error: 'Errore nell\'eliminazione del lavoro'
        });
    }
});

// 📸 PHOTOS ROUTES

// Add photo to work
router.post('/works/:id/photos', async (req, res) => {
    try {
        const { name, data, size } = req.body;
        const workId = req.params.id;

        if (!name || !data) {
            return res.status(400).json({
                success: false,
                error: 'Nome e dati foto obbligatori'
            });
        }

        const photo = await db.addPhoto(workId, { name, data, size });
        res.status(201).json({
            success: true,
            data: photo,
            message: 'Foto aggiunta con successo'
        });
    } catch (error) {
        console.error('Error adding photo:', error);
        res.status(500).json({
            success: false,
            error: 'Errore nell\'aggiunta della foto'
        });
    }
});

// Delete photo
router.delete('/photos/:id', async (req, res) => {
    try {
        await db.deletePhoto(req.params.id);
        res.json({
            success: true,
            message: 'Foto eliminata con successo'
        });
    } catch (error) {
        console.error('Error deleting photo:', error);
        res.status(500).json({
            success: false,
            error: 'Errore nell\'eliminazione della foto'
        });
    }
});

// 🔧 SPARE PARTS ROUTES

// Add spare part to work
router.post('/works/:id/parts', async (req, res) => {
    try {
        const { name, code, quantity, unitPrice } = req.body;
        const workId = req.params.id;

        if (!name || !code || !quantity || !unitPrice) {
            return res.status(400).json({
                success: false,
                error: 'Tutti i campi del ricambio sono obbligatori'
            });
        }

        const part = {
            id: 'SP' + Date.now().toString().slice(-6),
            name,
            code,
            quantity: parseInt(quantity),
            unitPrice: parseFloat(unitPrice),
            totalPrice: parseInt(quantity) * parseFloat(unitPrice)
        };

        const savedPart = await db.addSparePart(workId, part);
        res.status(201).json({
            success: true,
            data: savedPart,
            message: 'Ricambio aggiunto con successo'
        });
    } catch (error) {
        console.error('Error adding spare part:', error);
        res.status(500).json({
            success: false,
            error: 'Errore nell\'aggiunta del ricambio'
        });
    }
});

// Delete spare part
router.delete('/parts/:id', async (req, res) => {
    try {
        await db.deleteSparePart(req.params.id);
        res.json({
            success: true,
            message: 'Ricambio eliminato con successo'
        });
    } catch (error) {
        console.error('Error deleting spare part:', error);
        res.status(500).json({
            success: false,
            error: 'Errore nell\'eliminazione del ricambio'
        });
    }
});

// ⏱️ TIMER ROUTES

// Start timer session
router.post('/timer/start', async (req, res) => {
    try {
        const { operatorId, workId } = req.body;

        if (!operatorId) {
            return res.status(400).json({
                success: false,
                error: 'ID operatore obbligatorio'
            });
        }

        const session = await db.startTimerSession(operatorId, workId);
        res.status(201).json({
            success: true,
            data: session,
            message: 'Timer avviato'
        });
    } catch (error) {
        console.error('Error starting timer:', error);
        res.status(500).json({
            success: false,
            error: 'Errore nell\'avvio del timer'
        });
    }
});

// End timer session
router.post('/timer/end', async (req, res) => {
    try {
        const { sessionId, durationSeconds } = req.body;

        if (!sessionId || !durationSeconds) {
            return res.status(400).json({
                success: false,
                error: 'ID sessione e durata obbligatori'
            });
        }

        const session = await db.endTimerSession(sessionId, durationSeconds);
        res.json({
            success: true,
            data: session,
            message: 'Timer fermato'
        });
    } catch (error) {
        console.error('Error ending timer:', error);
        res.status(500).json({
            success: false,
            error: 'Errore nel fermare il timer'
        });
    }
});

// 📊 STATISTICS ROUTES

// Get dashboard statistics
router.get('/stats/dashboard', async (req, res) => {
    try {
        const works = await db.getAllWorks();
        
        const stats = {
            total: works.length,
            urgent: works.filter(w => w.priority === 'urgent').length,
            active: works.filter(w => w.status === 'in_progress').length,
            completed: works.filter(w => w.status === 'completed').length,
            pending: works.filter(w => w.status === 'pending').length,
            byDepartment: {}
        };

        // Group by department
        const departments = ['verniciatura', 'lattoneria', 'meccanica', 'preparazione', 'lavaggio'];
        departments.forEach(dept => {
            stats.byDepartment[dept] = works.filter(w => w.department === dept).length;
        });

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Errore nel recupero delle statistiche'
        });
    }
});

module.exports = router;
