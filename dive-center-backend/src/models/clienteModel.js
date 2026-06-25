const pool = require('../config/db');

const Cliente = {
  getAll: async () => {
    const res = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
    return res.rows;
  },

  getById: async (id) => {
    const res = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
    return res.rows[0];
  },

  create: async (datos) => {
    const query = `
      INSERT INTO clientes (nombre_completo, identificacion, telefono, correo, agencia_certificacion, nivel_certificacion, id_certificacion, alergias_enfermedades, url_formulario_medico)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [
      datos.nombre_completo, datos.identificacion, datos.telefono, datos.correo,
      datos.agencia_certificacion, datos.nivel_certificacion, datos.id_certificacion,
      datos.alergias_enfermedades, datos.url_formulario_medico
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
  },

  update: async (id, datos) => {
    const query = `
      UPDATE clientes 
      SET nombre_completo = $1, identificacion = $2, telefono = $3, correo = $4,
          agencia_certificacion = $5, nivel_certificacion = $6, id_certificacion = $7,
          alergias_enfermedades = $8, url_formulario_medico = $9
      WHERE id = $10
      RETURNING *;
    `;
    const values = [
      datos.nombre_completo, datos.identificacion, datos.telefono, datos.correo,
      datos.agencia_certificacion, datos.nivel_certificacion, datos.id_certificacion,
      datos.alergias_enfermedades, datos.url_formulario_medico, id
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
  },

  delete: async (id) => {
    const res = await pool.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
  }
};

module.exports = Cliente;
