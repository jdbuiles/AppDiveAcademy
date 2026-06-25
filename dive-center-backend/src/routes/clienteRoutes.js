const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const verificarRol = require('../middleware/authMiddleware');

// Rutas generales de gestión de clientes (Ambos roles autorizados)
router.route('/')
  .get(verificarRol(['Administrador', 'Instructor']), clienteController.obtenerClientes)
  .post(verificarRol(['Administrador']), clienteController.crearCliente); // Solo Admin registra clientes nuevos

// Acceso al perfil detallado (Formularios médicos y alergias)
router.route('/:id')
  .get(verificarRol(['Administrador', 'Instructor']), clienteController.obtenerClientePorId)
  .put(verificarRol(['Administrador']), clienteController.actualizarCliente)
  .delete(verificarRol(['Administrador']), clienteController.eliminarCliente);

module.exports = router;
