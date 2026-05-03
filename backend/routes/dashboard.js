const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/dashboard/resumen
router.get('/resumen', async (req, res) => {
  try {
    const [[{ dias }]] = await pool.query(
      'SELECT DATEDIFF(NOW(), fecha_inicio) AS dias FROM config_amor LIMIT 1'
    );
    const [[{ recuerdos }]] = await pool.query('SELECT COUNT(*) AS recuerdos FROM recuerdos');
    const [[{ citas }]] = await pool.query("SELECT COUNT(*) AS citas FROM citas WHERE estado = 'pendiente'");
    const [[{ razones }]] = await pool.query('SELECT COUNT(*) AS razones FROM razones');
    res.json({ dias, recuerdos, citas, razones });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
