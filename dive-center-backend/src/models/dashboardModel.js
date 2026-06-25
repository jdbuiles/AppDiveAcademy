const pool = require('../config/db');

const Dashboard = {
  getMetrics: async (fechaInicio, fechaFin) => {
    let whereClauses = [];
    let params = [];

    // Construcción dinámica de filtros de fecha
    if (fechaInicio) {
      params.push(fechaInicio);
      whereClauses.push(`fecha_registro >= $${params.length}`);
    }
    
    if (fechaFin) {
      // Se añade el final del día (23:59:59) para incluir las transacciones de esa fecha completa
      params.push(`${fechaFin} 23:59:59`);
      whereClauses.push(`fecha_registro <= $${params.length}`);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // 1. Consulta de totales principales
    const queryTotales = `
      SELECT 
        COALESCE(SUM(CASE WHEN tipo = 'Ingreso' THEN monto_cop ELSE 0 END), 0) AS total_ingresos,
        COALESCE(SUM(CASE WHEN tipo = 'Egreso' THEN monto_cop ELSE 0 END), 0) AS total_egresos,
        COALESCE(SUM(CASE WHEN tipo = 'Ingreso' THEN monto_cop ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN tipo = 'Egreso' THEN monto_cop ELSE 0 END), 0) AS utilidad_neta
      FROM transacciones
      ${whereString};
    `;

    // 2. Consulta del desglose por cuenta de destino
    const queryCuentas = `
      SELECT 
        cuenta_origen_destino AS cuenta,
        COALESCE(SUM(CASE WHEN tipo = 'Ingreso' THEN monto_cop ELSE -monto_cop END), 0) AS saldo
      FROM transacciones
      ${whereString}
      GROUP BY cuenta_origen_destino;
    `;

    // Ejecución paralela
    const [resTotales, resCuentas] = await Promise.all([
      pool.query(queryTotales, params),
      pool.query(queryCuentas, params)
    ]);

    return {
      totales: resTotales.rows[0],
      cuentasRaw: resCuentas.rows
    };
  }
};

module.exports = Dashboard;
