const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM citas ORDER BY fecha ASC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { titulo, lugar, descripcion, fecha, estado } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO citas (titulo, lugar, descripcion, fecha, estado) VALUES (?, ?, ?, ?, ?)',
      [titulo, lugar, descripcion, fecha, estado || 'pendiente']
    );
    res.json({ id: result.insertId, titulo, lugar, descripcion, fecha, estado: estado || 'pendiente' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  const { titulo, lugar, descripcion, fecha, estado } = req.body;
  try {
    await pool.query(
      'UPDATE citas SET titulo=?, lugar=?, descripcion=?, fecha=?, estado=? WHERE id=?',
      [titulo, lugar, descripcion, fecha, estado, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM citas WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
