const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM recuerdos WHERE activo = 1 ORDER BY fecha DESC, id_recuerdo DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { titulo, fecha, lugar, descripcion, sentimiento } = req.body;
  try {
    const [r] = await pool.query(
      'INSERT INTO recuerdos (titulo, fecha, lugar, descripcion, sentimiento, activo) VALUES (?, ?, ?, ?, ?, 1)',
      [titulo, fecha, lugar, descripcion, sentimiento]
    );
    res.status(201).json({ id_recuerdo: r.insertId, message: 'Recuerdo guardado.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('UPDATE recuerdos SET activo = 0 WHERE id_recuerdo = ?', [req.params.id]);
    res.json({ message: 'Recuerdo desactivado.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
