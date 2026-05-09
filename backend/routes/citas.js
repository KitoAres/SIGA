const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM citas ORDER BY fecha ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { titulo, lugar, descripcion, fecha, estado } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO citas 
       (titulo, lugar, descripcion, fecha, estado) 
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [titulo, lugar, descripcion, fecha || null, estado || 'pendiente']
    );

    res.json({
      id: result.rows[0].id,
      titulo,
      lugar,
      descripcion,
      fecha: fecha || null,
      estado: estado || 'pendiente'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { titulo, lugar, descripcion, fecha, estado } = req.body;

  try {
    await pool.query(
      `UPDATE citas 
       SET titulo = $1,
           lugar = $2,
           descripcion = $3,
           fecha = $4,
           estado = $5
       WHERE id = $6`,
      [titulo, lugar, descripcion, fecha || null, estado || 'pendiente', req.params.id]
    );

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM citas WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
