const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        titulo,
        descripcion,
        fecha,
        imagen_url,
        enlace_url
      FROM recuerdos 
      ORDER BY fecha DESC NULLS LAST, id DESC
    `);

    res.json(result.rows);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

router.post('/', async (req, res) => {
  const { titulo, descripcion, fecha, imagen_url, enlace_url } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO recuerdos 
        (titulo, descripcion, fecha, imagen_url, enlace_url) 
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        titulo, 
        descripcion, 
        fecha || null,
        imagen_url || null,
        enlace_url || null
      ]
    );

    res.json({ 
      id: result.rows[0].id, 
      titulo, 
      descripcion, 
      fecha: fecha || null,
      imagen_url: imagen_url || null,
      enlace_url: enlace_url || null
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
        titulo = $1, 
        descripcion = $2, 
        fecha = $3,
        imagen_url = $4,
        enlace_url = $5
       WHERE id = $6`,
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
    await pool.query('DELETE FROM recuerdos WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

module.exports = router;
