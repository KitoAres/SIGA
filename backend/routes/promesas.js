const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM promesas WHERE activo = 1 ORDER BY id_promesa DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const [r] = await pool.query('INSERT INTO promesas (texto, estado, activo) VALUES (?, ?, 1)', [req.body.texto, req.body.estado || 'vigente']);
    res.status(201).json({ id_promesa: r.insertId, message: 'Promesa guardada.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
