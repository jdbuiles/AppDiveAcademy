const pool = require('../config/db');

const Viaje = {
  getAll: async () => {
    const res = await pool.query('SELECT * FROM viajes ORDER BY fecha_salida ASC');
    return res.rows;
  },

  getById: async (id) => {
    const res = await pool.query('SELECT * FROM viajes WHERE id = $1', [id]);
    return res.rows[0];
  },

  create: async (datos) => {
    const query = `
      INSERT INTO viajes (destino, fecha_salida, fecha_regreso, cupos_maximos, estado)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [datos.destino, datos.fecha_salida, datos.fecha_regreso, datos.cupos_maximos, datos.estado || 'Planificado'];
    const res = await pool.query(query, values);
    return res.rows[0];
  },

  update: async (id, datos) => {
    const query = `
      UPDATE viajes 
      SET destino = $1, fecha_salida = $2, fecha_regreso = $3, cupos_maximos = $4, estado = $5
      WHERE id = $6
      RETURNING *;
    `;
    const values = [datos.destino, datos.fecha_salida, datos.fecha_regreso, datos.cupos_maximos, datos.estado, id];
    const res = await pool.query(query, values);
    return res.rows[0];
  },

  delete: async (id) => {
    const res = await pool.query('DELETE FROM viajes WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
  }
};

module.exports = Viaje;
