const Cliente = require('../models/clienteModel');

exports.obtenerClientes = async (req, res, next) => {
  try {
    const clientes = await Cliente.getAll();
    res.status(200).json(clientes);
  } catch (error) {
    next(error);
  }
};

exports.obtenerClientePorId = async (req, res, next) => {
  try {
    const cliente = await Cliente.getById(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.status(200).json(cliente);
  } catch (error) {
    next(error);
  }
};

exports.crearCliente = async (req, res, next) => {
  try {
    if (!req.body.nombre_completo || !req.body.identificacion) {
      return res.status(400).json({ error: 'Nombre completo e identificación son obligatorios' });
    }
    const nuevoCliente = await Cliente.create(req.body);
    res.status(201).json(nuevoCliente);
  } catch (error) {
    next(error); // El manejador global interceptará errores como identificaciones duplicadas
  }
};

exports.actualizarCliente = async (req, res, next) => {
  try {
    const clienteActualizado = await Cliente.update(req.params.id, req.body);
    if (!clienteActualizado) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.status(200).json(clienteActualizado);
  } catch (error) {
    next(error);
  }
};

exports.eliminarCliente = async (req, res, next) => {
  try {
    const clienteEliminado = await Cliente.delete(req.params.id);
    if (!clienteEliminado) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.status(200).json({ mensaje: 'Cliente eliminado correctamente', cliente: clienteEliminado });
  } catch (error) {
    next(error);
  }
};
