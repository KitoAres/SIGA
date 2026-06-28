const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM promesas 
      WHERE usuario_id = $1 
         OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $1)
      ORDER BY id ASC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { texto } = req.body;
  const usuario_id = req.user.id;

  try {
    const result = await pool.query(
      'INSERT INTO promesas (texto, usuario_id) VALUES ($1, $2) RETURNING id',
      [texto, usuario_id]
    );

    res.json({
      id: result.rows[0].id,
      texto
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const { texto } = req.body;

  try {
    const result = await pool.query(
      'UPDATE promesas SET texto = $1 WHERE id = $2 AND (usuario_id = $3 OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $3))',
      [texto, req.params.id, req.user.id]
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
      'DELETE FROM promesas WHERE id = $1 AND (usuario_id = $2 OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $2))',
      [req.params.id, req.user.id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'No encontrado o sin permisos' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
