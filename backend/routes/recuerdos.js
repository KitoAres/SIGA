const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth'); // Asegúrate de importar el middleware

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, titulo, descripcion, fecha, imagen_url, enlace_url
      FROM recuerdos 
      WHERE usuario_id = $1 
         OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $1)
      ORDER BY fecha DESC NULLS LAST, id DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { titulo, descripcion, fecha, imagen_url, enlace_url } = req.body;
  const usuario_id = req.user.id;

  try {
    const result = await pool.query(
      `INSERT INTO recuerdos 
        (titulo, descripcion, fecha, imagen_url, enlace_url, usuario_id) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [titulo, descripcion, fecha || null, imagen_url || null, enlace_url || null, usuario_id]
    );

    res.json({ id: result.rows[0].id, titulo, descripcion, fecha, imagen_url, enlace_url });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const { titulo, descripcion, fecha, imagen_url, enlace_url } = req.body;

  try {
    const result = await pool.query(
      `UPDATE recuerdos 
       SET titulo = $1, descripcion = $2, fecha = $3, imagen_url = $4, enlace_url = $5
       WHERE id = $6 AND (usuario_id = $7 OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $7))`,
      [titulo, descripcion, fecha || null, imagen_url || null, enlace_url || null, req.params.id, req.user.id]
    );
    
    if (result.rowCount === 0) return res.status(404).json({ error: 'No encontrado o sin permisos' });
    res.json({ ok: true });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM recuerdos WHERE id = $1 AND (usuario_id = $2 OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $2))',
      [req.params.id, req.user.id]
    );
    
    if (result.rowCount === 0) return res.status(404).json({ error: 'No encontrado o sin permisos' });
    res.json({ ok: true });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

module.exports = router;
