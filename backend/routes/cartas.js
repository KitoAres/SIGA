const express = require('express');
const router = express.Router();
const pool = require('../config/db');

/* Obtener todas las cartas */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM carta ORDER BY id DESC'
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Crear nueva carta */
router.post('/', async (req, res) => {
  const { contenido } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO carta (contenido)
      VALUES ($1)
      RETURNING *
      `,
      [contenido]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Editar una carta específica */
router.put('/:id', async (req, res) => {
  const { contenido } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE carta
      SET contenido = $1
      WHERE id = $2
      RETURNING *
      `,
      [contenido, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* Eliminar carta */
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM carta WHERE id = $1',
      [req.params.id]
    );

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
