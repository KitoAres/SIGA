const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM playlist 
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
  const { titulo, artista, enlace, frase } = req.body;
  const usuario_id = req.user.id;

  try {
    const result = await pool.query(
      `INSERT INTO playlist 
       (titulo, artista, enlace, frase, usuario_id) 
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [titulo, artista, enlace, frase, usuario_id]
    );

    res.json({
      id: result.rows[0].id,
      titulo,
      artista,
      enlace,
      frase
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const { titulo, artista, enlace, frase } = req.body;

  try {
    const result = await pool.query(
      `UPDATE playlist 
       SET titulo = $1, artista = $2, enlace = $3, frase = $4
       WHERE id = $5 AND (usuario_id = $6 OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $6))`,
      [titulo, artista, enlace, frase, req.params.id, req.user.id]
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
      'DELETE FROM playlist WHERE id = $1 AND (usuario_id = $2 OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $2))',
      [req.params.id, req.user.id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'No encontrado o sin permisos' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
