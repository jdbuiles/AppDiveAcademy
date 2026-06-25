const errorHandler = (err, req, res, next) => {
  console.error('🔴 Error Interno:', err.message || err);

  // Error de PostgreSQL: Llave duplicada (ej. identificación o correo único)
  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Conflicto de datos',
      detalles: 'El registro con este identificador único o correo ya existe.'
    });
  }

  // Error de PostgreSQL: Violación de llave foránea / Restricciones ON DELETE RESTRICT
  if (err.code === '23503') {
    return res.status(400).json({
      error: 'Operación inválida',
      detalles: 'No se puede eliminar o modificar este registro porque está asociado a otras tablas (ej. Reservas activas).'
    });
  }

  // Error de PostgreSQL: Datos de tipo Enum inválidos
  if (err.code === '22P02') {
    return res.status(400).json({
      error: 'Formato o Enum inválido',
      detalles: 'Uno de los valores enviados no coincide con el tipo esperado o el catálogo ENUM permitido.'
    });
  }

  // Error genérico del servidor
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
};

module.exports = errorHandler;
