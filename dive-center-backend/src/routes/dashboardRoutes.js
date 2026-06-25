const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const verificarRol = require('../middleware/authMiddleware'); // 👈 ¡Esta es la línea que faltaba!

// Aplicar restricción estricta de Administrador a todas las rutas de este archivo
router.use(verificarRol(['Administrador']));

router.get('/', dashboardController.obtenerDashboardGlobal);

module.exports = router;