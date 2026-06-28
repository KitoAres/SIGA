const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM citas 
      WHERE usuario_id = $1 
         OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $1)
      ORDER BY fecha ASC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { titulo, lugar, descripcion, fecha, estado } = req.body;
  const usuario_id = req.user.id;

  try {
    const result = await pool.query(
      `INSERT INTO citas 
       (titulo, lugar, descripcion, fecha, estado, usuario_id) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [titulo, lugar, descripcion, fecha || null, estado || 'pendiente', usuario_id]
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

router.put('/:id', requireAuth, async (req, res) => {
  const { titulo, lugar, descripcion, fecha, estado } = req.body;

  try {
    const result = await pool.query(
      `UPDATE citas 
       SET titulo = $1, lugar = $2, descripcion = $3, fecha = $4, estado = $5
       WHERE id = $6 AND (usuario_id = $7 OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $7))`,
      [titulo, lugar, descripcion, fecha || null, estado || 'pendiente', req.params.id, req.user.id]
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
      'DELETE FROM citas WHERE id = $1 AND (usuario_id = $2 OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $2))',
      [req.params.id, req.user.id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'No encontrado o sin permisos' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
