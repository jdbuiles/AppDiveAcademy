const Dashboard = require('../models/dashboardModel');

exports.obtenerDashboardGlobal = async (req, res, next) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    // Obtener métricas desde el modelo
    const { totales, cuentasRaw } = await Dashboard.getMetrics(fecha_inicio, fecha_fin);

    // Mapear los Enums obligatorios de cuentas para asegurar consistencia si están vacíos
    const cuentasEstructura = {
      'Cuenta de Ahorros Principal': 0,
      'ARD Dollar App': 0,
      'Caja Menor': 0
    };

    // Llenar con los saldos reales de la base de datos convirtiendo strings a Number
    cuentasRaw.forEach(row => {
      if (cuentasEstructura[row.cuenta] !== undefined) {
        cuentasEstructura[row.cuenta] = Number(row.saldo);
      }
    });

    // Consolidar la respuesta formateada en COP
    const respuestaDashboard = {
      filtros_aplicados: {
        fecha_inicio: fecha_inicio || 'Desde el origen',
        fecha_fin: fecha_fin || 'Hasta el presente'
      },
      resumen_global_cop: {
        total_ingresos: Number(totales.total_ingresos),
        total_egresos: Number(totales.total_egresos),
        utilidad_neta: Number(totales.utilidad_neta)
      },
      saldos_por_cuenta_cop: cuentasEstructura
    };

    res.status(200).json(respuestaDashboard);

  } catch (error) {
    next(error);
  }
};
