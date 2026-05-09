const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        titulo,
        tipo,
        descripcion,
        enlace,
        fecha
      FROM cajita
      ORDER BY fecha DESC, id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { titulo, tipo, descripcion, enlace, fecha } = req.body;

  if (!titulo || !enlace) {
    return res.status(400).json({
      error: 'Título y enlace son obligatorios.'
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO cajita 
        (titulo, tipo, descripcion, enlace, fecha) 
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        titulo,
        tipo || 'otro',
        descripcion || null,
        enlace,
        fecha || null
      ]
    );

    res.json({
      id: result.rows[0].id,
      titulo,
      tipo: tipo || 'otro',
      descripcion: descripcion || null,
      enlace,
      fecha: fecha || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { titulo, tipo, descripcion, enlace, fecha } = req.body;

  if (!titulo || !enlace) {
    return res.status(400).json({
      error: 'Título y enlace son obligatorios.'
    });
  }

  try {
    await pool.query(
      `UPDATE cajita
       SET titulo = $1,
           tipo = $2,
           descripcion = $3,
           enlace = $4,
           fecha = $5
       WHERE id = $6`,
      [
        titulo,
        tipo || 'otro',
        descripcion || null,
        enlace,
        fecha || null,
        req.params.id
      ]
    );

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM cajita WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
