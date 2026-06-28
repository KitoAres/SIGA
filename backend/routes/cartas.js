const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, titulo, fecha, creado_en FROM cartas 
      WHERE usuario_id = $1 
         OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $1)
      ORDER BY creado_en DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM cartas 
      WHERE id = $1 AND (usuario_id = $2 OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $2))
    `, [req.params.id, req.user.id]);
    res.json(result.rows[0] || null);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { titulo, contenido, fecha } = req.body;
  const usuario_id = req.user.id;
  try {
    const result = await pool.query(
      'INSERT INTO cartas (titulo, contenido, fecha, usuario_id) VALUES ($1, $2, $3, $4) RETURNING id',
      [titulo || 'Sin título', contenido, fecha || null, usuario_id]
    );
    res.json({ id: result.rows[0].id, titulo, contenido, fecha });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const { titulo, contenido, fecha } = req.body;
  try {
    const result = await pool.query(
      `UPDATE cartas SET titulo = $1, contenido = $2, fecha = $3 
       WHERE id = $4 AND (usuario_id = $5 OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $5))`,
      [titulo, contenido, fecha || null, req.params.id, req.user.id]
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
      'DELETE FROM cartas WHERE id = $1 AND (usuario_id = $2 OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $2))',
      [req.params.id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'No encontrado o sin permisos' });
    res.json({ ok: true });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

module.exports = router;
