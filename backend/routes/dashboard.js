const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// GET /api/dashboard/resumen
router.get('/resumen', requireAuth, async (req, res) => {
  try {
    // Busca la fecha de la relación del usuario o de su pareja vinculada
    const diasResult = await pool.query(
      `SELECT EXTRACT(DAY FROM NOW() - COALESCE(u.fecha_relacion, p.fecha_relacion)::timestamp)::int AS dias 
       FROM usuarios u
       LEFT JOIN usuarios p ON p.id = u.pareja_id
       WHERE u.id = $1`,
      [req.user.id]
    );

    const recuerdosResult = await pool.query(
      `SELECT COUNT(*)::int AS recuerdos FROM recuerdos 
       WHERE usuario_id = $1 
          OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $1)`,
      [req.user.id]
    );

    const citasResult = await pool.query(
      `SELECT COUNT(*)::int AS citas FROM citas 
       WHERE estado = 'pendiente' 
         AND (usuario_id = $1 OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $1))`,
      [req.user.id]
    );

    const razonesResult = await pool.query(
      `SELECT COUNT(*)::int AS razones FROM razones 
       WHERE usuario_id = $1 
          OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $1)`,
      [req.user.id]
    );

    res.json({
      dias: diasResult.rows[0]?.dias || 0,
      recuerdos: recuerdosResult.rows[0]?.recuerdos || 0,
      citas: citasResult.rows[0]?.citas || 0,
      razones: razonesResult.rows[0]?.razones || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
