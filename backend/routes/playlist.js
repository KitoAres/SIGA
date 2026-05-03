const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM playlist ORDER BY id ASC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { titulo, artista, enlace, frase } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO playlist (titulo, artista, enlace, frase) VALUES (?, ?, ?, ?)',
      [titulo, artista, enlace, frase]
    );
    res.json({ id: result.insertId, titulo, artista, enlace, frase });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  const { titulo, artista, enlace, frase } = req.body;
  try {
    await pool.query(
      'UPDATE playlist SET titulo=?, artista=?, enlace=?, frase=? WHERE id=?',
      [titulo, artista, enlace, frase, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM playlist WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
