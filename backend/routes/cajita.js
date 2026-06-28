const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, titulo, tipo, descripcion, enlace, fecha
      FROM cajita
      WHERE usuario_id = $1 
         OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $1)
      ORDER BY fecha DESC, id DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { titulo, tipo, descripcion, enlace, fecha } = req.body;
  const usuario_id = req.user.id;

  if (!titulo || !enlace) {
    return res.status(400).json({
      error: 'Título y enlace son obligatorios.'
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO cajita 
        (titulo, tipo, descripcion, enlace, fecha, usuario_id) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        titulo,
        tipo || 'otro',
        descripcion || null,
        enlace,
        fecha || null,
        usuario_id
      ]
    );

    res.json({
      id: result.rows[0].id,
      titulo,
      type: tipo || 'otro',
      descripcion: descripcion || null,
      enlace,
      fecha: fecha || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const { titulo, tipo, descripcion, enlace, fecha } = req.body;

  if (!titulo || !enlace) {
    return res.status(400).json({
      error: 'Título y enlace son obligatorios.'
    });
  }

  try {
    const result = await pool.query(
      `UPDATE cajita
       SET titulo = $1, tipo = $2, descripcion = $3, enlace = $4, fecha = $5
       WHERE id = $6 AND (usuario_id = $7 OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $7))`,
      [
        titulo,
        tipo || 'otro',
        descripcion || null,
        enlace,
        fecha || null,
        req.params.id,
        req.user.id
      ]
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
      'DELETE FROM cajita WHERE id = $1 AND (usuario_id = $2 OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $2))',
      [req.params.id, req.user.id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'No encontrado o sin permisos' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
