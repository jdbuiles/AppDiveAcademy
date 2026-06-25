const pool = require('../config/db');

const Transaccion = {
  create: async (datos) => {
    const query = `
      INSERT INTO transacciones (
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
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    
    const values = [
      datos.viaje_id,
      datos.tipo,
      datos.cliente_id,       // Será null si es Egreso
      datos.proveedor_id,     // Será null si es Ingreso
      datos.monto_original,
      datos.moneda_original,
      datos.trm_digitada,
      datos.medio,
      datos.cuenta_origen_destino,
      datos.descripcion
    ];

    const res = await pool.query(query, values);
    return res.rows[0];
  }
};

module.exports = Transaccion;
