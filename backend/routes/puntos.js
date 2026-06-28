const express = require('express');
const router = report = express.Router();
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { calcularNivelRelacion } = require('../utils/nivel');

// GET /api/puntos/progreso
router.get('/progreso', requireAuth, async (req, res) => {
  try {
    const resumen = await pool.query(
      `SELECT
          COALESCE(SUM(puntos), 0)::int AS puntos,
          COUNT(*)::int AS registros,
          COUNT(*) FILTER (WHERE fecha = CURRENT_DATE)::int AS hoy
       FROM puntos_conexion
       WHERE usuario_id = $1 
          OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $1)`,
      [req.user.id]
    );

    const porFuente = await pool.query(
      `SELECT fuente, COUNT(*)::int AS total, COALESCE(SUM(puntos), 0)::int AS puntos
       FROM puntos_conexion
       WHERE usuario_id = $1 
          OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $1)
       GROUP BY fuente
       ORDER BY puntos DESC, total DESC`,
      [req.user.id]
    );

    const recientes = await pool.query(
      `SELECT id, fuente, accion, descripcion, puntos, fecha, creado_en
       FROM puntos_conexion
       WHERE usuario_id = $1 
          OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $1)
       ORDER BY creado_en DESC
       LIMIT 10`,
      [req.user.id]
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
