const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM carta LIMIT 1');
    res.json(result.rows[0] || { id: 1, contenido: '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
