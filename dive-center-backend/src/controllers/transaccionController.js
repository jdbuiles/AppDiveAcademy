const Transaccion = require('../models/transaccionModel');

exports.crearTransaccion = async (req, res, next) => {
  try {
    const {
      viaje_id,
      tipo,
      cliente_id,
      proveedor_id,
      monto_original,
      moneda_original,
      trm_digitada,
      medio,
      cuenta_origen_destino,
      descripcion
    } = req.body;

    // 1. Validar campos estructurales obligatorios
    if (!viaje_id || !tipo || !monto_original || !moneda_original || !medio || !cuenta_origen_destino) {
      return res.status(400).json({ 
        error: 'Campos obligatorios faltantes (viaje_id, tipo, monto_original, moneda_original, medio, cuenta_origen_destino)' 
      });
    }

    // 2. Validar reglas de negocio según el Tipo de Transacción (Campos relacionales)
    let finalClienteId = null;
    let finalProveedorId = null;

    if (tipo === 'Ingreso') {
      if (!cliente_id) {
        return res.status(400).json({ error: 'Para transacciones de tipo "Ingreso", el cliente_id es obligatorio.' });
      }
      finalClienteId = cliente_id;
      finalProveedorId = null; // Garantizar que quede nulo en Ingresos
    } else if (tipo === 'Egreso') {
      if (!proveedor_id) {
        return res.status(400).json({ error: 'Para transacciones de tipo "Egreso", el proveedor_id es obligatorio.' });
      }
      finalProveedorId = proveedor_id;
      finalClienteId = null; // Garantizar que quede nulo en Egresos
    } else {
      return res.status(400).json({ error: 'El campo tipo debe ser "Ingreso" o "Egreso".' });
    }

    // 3. Lógica de negocio para la TRM según la moneda_original
    let finalTrm = trm_digitada;

    if (moneda_original === 'COP') {
      finalTrm = 1.00; // Obligar a que sea 1.00 si es moneda local
    } else if (moneda_original === 'USD' || moneda_original === 'EUR') {
      // Validar que sea provista manualmente, que exista, sea un número válido y mayor a cero
      if (trm_digitada === undefined || trm_digitada === null || isNaN(trm_digitada) || Number(trm_digitada) <= 0) {
        return res.status(400).json({ 
          error: `La trm_digitada es obligatoria y debe ser provista manualmente con un valor numérico válido y mayor a 0 para la moneda ${moneda_original}.` 
        });
      }
      finalTrm = Number(trm_digitada);
    } else {
      return res.status(400).json({ error: 'Moneda no soportada. Valores permitidos: COP, USD, EUR.' });
    }

    // 4. Construir objeto de inserción limpio
    const datosTransaccion = {
      viaje_id,
      tipo,
      cliente_id: finalClienteId,
      proveedor_id: finalProveedorId,
      monto_original: Number(monto_original),
      moneda_original,
      trm_digitada: finalTrm,
      medio,
      cuenta_origen_destino,
      descripcion: descripcion || null
    };

    // 5. Insertar en la Base de Datos
    const nuevaTransaccion = await Transaccion.create(datosTransaccion);

    // Retornar respuesta exitosa
    res.status(201).json({
      mensaje: 'Transacción financiera registrada con éxito',
      transaccion: nuevaTransaccion
    });

  } catch (error) {
    // El middleware de errores global (errorHandler) capturará si el viaje_id, cliente_id o proveedor_id
    // no existen en la BD gracias al error '23503' (Foreign Key Violation).
    next(error);
  }
};
