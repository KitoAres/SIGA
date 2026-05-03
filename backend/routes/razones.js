const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM razones WHERE activo = 1 ORDER BY id_razon DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const [r] = await pool.query('INSERT INTO razones (texto, activo) VALUES (?, 1)', [req.body.texto]);
    res.status(201).json({ id_razon: r.insertId, message: 'Razón guardada.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
