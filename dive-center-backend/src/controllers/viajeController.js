const Viaje = require('../models/viajeModel');

exports.obtenerViajes = async (req, res, next) => {
  try {
    const viajes = await Viaje.getAll();
    res.status(200).json(viajes);
  } catch (error) {
    next(error);
  }
};

exports.obtenerViajePorId = async (req, res, next) => {
  try {
    const viaje = await Viaje.getById(req.params.id);
    if (!viaje) return res.status(404).json({ error: 'Viaje no encontrado' });
    res.status(200).json(viaje);
  } catch (error) {
    next(error);
  }
};

exports.crearViaje = async (req, res, next) => {
  try {
    const { destino, fecha_salida, fecha_regreso, cupos_maximos } = req.body;
    if (!destino || !fecha_salida || !fecha_regreso || !cupos_maximos) {
      return res.status(400).json({ error: 'Todos los campos requeridos deben ser completados' });
    }
    const nuevoViaje = await Viaje.create(req.body);
    res.status(201).json(nuevoViaje);
  } catch (error) {
    next(error);
  }
};

exports.actualizarViaje = async (req, res, next) => {
  try {
    const viajeActualizado = await Viaje.update(req.params.id, req.body);
    if (!viajeActualizado) return res.status(404).json({ error: 'Viaje no encontrado' });
    res.status(200).json(viajeActualizado);
  } catch (error) {
    next(error);
  }
};

exports.eliminarViaje = async (req, res, next) => {
  try {
    const viajeEliminado = await Viaje.delete(req.params.id);
    if (!viajeEliminado) return res.status(404).json({ error: 'Viaje no encontrado' });
    res.status(200).json({ mensaje: 'Viaje eliminado correctamente', viaje: viajeEliminado });
  } catch (error) {
    next(error);
  }
};
