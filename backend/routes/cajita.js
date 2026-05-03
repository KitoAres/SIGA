const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
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

    res.json(rows);
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
    const [result] = await pool.query(
      `INSERT INTO cajita 
        (titulo, tipo, descripcion, enlace, fecha) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        titulo,
        tipo || 'otro',
        descripcion || null,
        enlace,
        fecha || null
      ]
    );

    res.json({
      id: result.insertId,
      titulo,
      tipo,
      descripcion,
      enlace,
      fecha
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
       SET titulo = ?,
           tipo = ?,
           descripcion = ?,
           enlace = ?,
           fecha = ?
       WHERE id = ?`,
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
    await pool.query('DELETE FROM cajita WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
