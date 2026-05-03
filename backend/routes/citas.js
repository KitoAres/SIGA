const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM citas_romanticas WHERE activo = 1 ORDER BY fecha ASC, id_cita DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { titulo, lugar, fecha, descripcion, estado } = req.body;
  try {
    const [r] = await pool.query(
      'INSERT INTO citas_romanticas (titulo, lugar, fecha, descripcion, estado, activo) VALUES (?, ?, ?, ?, ?, 1)',
      [titulo, lugar, fecha, descripcion, estado || 'pendiente']
    );
    res.status(201).json({ id_cita: r.insertId, message: 'Cita guardada.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/estado', async (req, res) => {
  try {
    await pool.query('UPDATE citas_romanticas SET estado = ? WHERE id_cita = ?', [req.body.estado, req.params.id]);
    res.json({ message: 'Estado actualizado.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('UPDATE citas_romanticas SET activo = 0 WHERE id_cita = ?', [req.params.id]);
    res.json({ message: 'Cita desactivada.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
