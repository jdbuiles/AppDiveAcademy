const express = require('express');
const router = express.Router();
const transaccionController = require('../controllers/transaccionController');
const verificarRol = require('../middleware/authMiddleware');

// Solo los Administradores pueden registrar flujos de caja de ingresos/egresos
router.post('/', verificarRol(['Administrador']), transaccionController.crearTransaccion);

module.exports = router;
