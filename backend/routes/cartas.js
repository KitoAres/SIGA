const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, titulo, fecha, creado_en FROM cartas ORDER BY creado_en DESC'
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cartas WHERE id = $1', [req.params.id]);
    res.json(result.rows[0] || null);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { titulo, contenido, fecha } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cartas (titulo, contenido, fecha) VALUES ($1, $2, $3) RETURNING id',
      [titulo || 'Sin título', contenido, fecha || null]
    );
    res.json({ id: result.rows[0].id, titulo, contenido, fecha });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  const { titulo, contenido, fecha } = req.body;
  try {
    await pool.query(
      'UPDATE cartas SET titulo = $1, contenido = $2, fecha = $3 WHERE id = $4',
      [titulo, contenido, fecha || null, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM cartas WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
