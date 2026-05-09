const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM playlist ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { titulo, artista, enlace, frase } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO playlist 
       (titulo, artista, enlace, frase) 
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [titulo, artista, enlace, frase]
    );

    res.json({
      id: result.rows[0].id,
      titulo,
      artista,
      enlace,
      frase
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { titulo, artista, enlace, frase } = req.body;

  try {
    await pool.query(
      `UPDATE playlist 
       SET titulo = $1,
           artista = $2,
           enlace = $3,
           frase = $4
       WHERE id = $5`,
      [titulo, artista, enlace, frase, req.params.id]
    );

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM playlist WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
