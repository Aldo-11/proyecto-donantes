const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donorController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

// Rutas públicas
router.post('/login', donorController.login);

// Rutas protegidas
router.post('/donors', authenticateToken, donorController.createDonor);
router.get('/donors', authenticateToken, requireRole('admin'), donorController.getAllDonors);

module.exports = router;