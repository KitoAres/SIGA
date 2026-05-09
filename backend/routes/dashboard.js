const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/dashboard/resumen
router.get('/resumen', async (req, res) => {
  try {
    const diasResult = await pool.query(
      `SELECT EXTRACT(DAY FROM NOW() - fecha_inicio::timestamp)::int AS dias 
       FROM config_amor 
       LIMIT 1`
    );

    const recuerdosResult = await pool.query(
      'SELECT COUNT(*)::int AS recuerdos FROM recuerdos'
    );

    const citasResult = await pool.query(
      "SELECT COUNT(*)::int AS citas FROM citas WHERE estado = 'pendiente'"
    );

    const razonesResult = await pool.query(
      'SELECT COUNT(*)::int AS razones FROM razones'
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
