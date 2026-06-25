const express = require('express');
const router = express.Router();
const viajeController = require('../controllers/viajeController');

router.route('/')
  .get(viajeController.obtenerViajes)
  .post(viajeController.crearViaje);

router.route('/:id')
  .get(viajeController.obtenerViajePorId)
  .put(viajeController.actualizarViaje)
  .delete(viajeController.eliminarViaje);

module.exports = router;
