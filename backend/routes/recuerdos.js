const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        titulo,
        descripcion,
        fecha,
        imagen_url,
        enlace_url
      FROM recuerdos 
      ORDER BY fecha DESC
    `);

    res.json(rows);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

router.post('/', async (req, res) => {
  const { titulo, descripcion, fecha, imagen_url, enlace_url } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO recuerdos 
        (titulo, descripcion, fecha, imagen_url, enlace_url) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        titulo, 
        descripcion, 
        fecha || null,
        imagen_url || null,
        enlace_url || null
      ]
    );

    res.json({ 
      id: result.insertId, 
      titulo, 
      descripcion, 
      fecha,
      imagen_url,
      enlace_url
    });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

router.put('/:id', async (req, res) => {
  const { titulo, descripcion, fecha, imagen_url, enlace_url } = req.body;

  try {
    await pool.query(
      `UPDATE recuerdos 
       SET 
        titulo = ?, 
        descripcion = ?, 
        fecha = ?,
        imagen_url = ?,
        enlace_url = ?
       WHERE id = ?`,
      [
        titulo, 
        descripcion, 
        fecha || null,
        imagen_url || null,
        enlace_url || null,
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
    await pool.query('DELETE FROM recuerdos WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

module.exports = router;
