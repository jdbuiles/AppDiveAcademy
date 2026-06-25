const { Pool } = require('pg');
require('dotenv').config();

// Validación previa antes de intentar conectar
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR CRÍTICO: La variable DATABASE_URL no está definida en el archivo .env');
  process.exit(1);
}

console.log('🔌 Intentando conectar con la URL:', process.env.DATABASE_URL.substring(0, 20) + '...');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Obligatorio para Render y Supabase
  }
});

// Validar la conexión ejecutando una consulta simple
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error en la base de datos al inicializar:', err.message);
  } else {
    console.log('🚀 Conexión exitosa a PostgreSQL (Supabase).');
  }
});

module.exports = pool;