const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM recuerdos ORDER BY fecha DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { titulo, descripcion, fecha } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO recuerdos (titulo, descripcion, fecha) VALUES (?, ?, ?)',
      [titulo, descripcion, fecha]
    );
    res.json({ id: result.insertId, titulo, descripcion, fecha });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  const { titulo, descripcion, fecha } = req.body;
  try {
    await pool.query(
      'UPDATE recuerdos SET titulo=?, descripcion=?, fecha=? WHERE id=?',
      [titulo, descripcion, fecha, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM recuerdos WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
