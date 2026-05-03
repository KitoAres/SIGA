const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM playlist WHERE activo = 1 ORDER BY id_cancion DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { titulo, artista, enlace, motivo } = req.body;
  try {
    const [r] = await pool.query(
      'INSERT INTO playlist (titulo, artista, enlace, motivo, activo) VALUES (?, ?, ?, ?, 1)',
      [titulo, artista, enlace, motivo]
    );
    res.status(201).json({ id_cancion: r.insertId, message: 'Canción guardada.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
