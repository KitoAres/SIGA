const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [[recuerdos]] = await pool.query('SELECT COUNT(*) total FROM recuerdos WHERE activo = 1');
    const [[citas]] = await pool.query('SELECT COUNT(*) total FROM citas_romanticas WHERE activo = 1');
    const [[cumplidas]] = await pool.query("SELECT COUNT(*) total FROM citas_romanticas WHERE estado = 'cumplida' AND activo = 1");
    const [[canciones]] = await pool.query('SELECT COUNT(*) total FROM playlist WHERE activo = 1');
    const [[razones]] = await pool.query('SELECT COUNT(*) total FROM razones WHERE activo = 1');
    const [[promesas]] = await pool.query('SELECT COUNT(*) total FROM promesas WHERE activo = 1');

    const [proximas] = await pool.query(`
      SELECT id_cita, titulo, lugar, fecha, descripcion, estado
      FROM citas_romanticas
      WHERE activo = 1 AND estado <> 'cumplida'
      ORDER BY fecha ASC
      LIMIT 5
    `);

    res.json({
      recuerdos: recuerdos.total,
      citas: citas.total,
      cumplidas: cumplidas.total,
      canciones: canciones.total,
      razones: razones.total,
      promesas: promesas.total,
      proximas
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
