const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Importación de todas las rutas del sistema
const authRoutes = require('./routes/authRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const viajeRoutes = require('./routes/viajeRoutes');
const transaccionRoutes = require('./routes/transaccionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const errorHandler = require('./middleware/errorHandler');

// 2. Inicialización de la aplicación (¡SOLO UNA VEZ!)
const app = express();

// 3. Middlewares globales de configuración
app.use(cors());
app.use(express.json());

// Endpoint de prueba de salud rápido (Ideal para el monitoreo de Render)
app.get('/health', (req, res) => res.status(200).send('OK'));

// 4. Registro y vinculación de los Endpoints de la API
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/viajes', viajeRoutes);
app.use('/api/transacciones', transaccionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 5. Manejador para cualquier ruta inexistente (Error 404)
app.use((req, res, next) => {
  res.status(404).json({ error: 'Ruta no encontrada o inexistente' });
});

// 6. Middleware Global para el Control de Errores (Siempre debe ir al final)
app.use(errorHandler);

// 7. Lanzamiento del Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose con éxito en el puerto ${PORT}`);
});