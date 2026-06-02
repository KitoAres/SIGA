const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Obtener todas las cartas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM carta ORDER BY id ASC'
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear nueva carta
router.post('/', async (req, res) => {
  const { contenido } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO carta (contenido) VALUES ($1) RETURNING *',
      [contenido || '']
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Editar carta
router.put('/:id', async (req, res) => {
  const { contenido } = req.body;

  try {
    await pool.query(
      'UPDATE carta SET contenido = $1 WHERE id = $2',
      [contenido, req.params.id]
    );

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
