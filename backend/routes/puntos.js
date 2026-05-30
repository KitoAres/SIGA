const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { calcularNivelRelacion } = require('../utils/nivel');

router.get('/progreso', async (req, res) => {
  try {
    const resumen = await pool.query(
      `SELECT
         COALESCE(SUM(puntos), 0)::int AS puntos,
         COUNT(*)::int AS registros,
         COUNT(*) FILTER (WHERE fecha = CURRENT_DATE)::int AS hoy
       FROM puntos_conexion`
    );
    const porFuente = await pool.query(
      `SELECT fuente, COUNT(*)::int AS total, COALESCE(SUM(puntos), 0)::int AS puntos
       FROM puntos_conexion
       GROUP BY fuente
       ORDER BY puntos DESC, total DESC`
    );
    const recientes = await pool.query(
      `SELECT id, fuente, accion, descripcion, puntos, fecha, creado_en
       FROM puntos_conexion
       ORDER BY creado_en DESC
       LIMIT 10`
    );

    const total = resumen.rows[0]?.puntos || 0;

    res.json({
      ok: true,
      puntos: total,
      registros: resumen.rows[0]?.registros || 0,
      hoy: resumen.rows[0]?.hoy || 0,
      nivel: calcularNivelRelacion(total),
      por_fuente: porFuente.rows,
      recientes: recientes.rows
    });
  } catch (err) {
    console.error('Error GET /api/puntos/progreso:', err);
    res.status(500).json({ ok: false, error: 'Error al cargar puntos de conexión' });
  }
});

module.exports = router;
