const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/tiempo/disponibilidad?usuario_id=X
router.get('/disponibilidad', async (req, res) => {
  const { usuario_id } = req.query;
  if (!usuario_id) return res.status(400).json({ error: 'Falta usuario_id' });
  try {
    const [rows] = await pool.query(
      'SELECT * FROM tiempo_disponibilidad WHERE usuario_id = ? ORDER BY fecha ASC, hora_inicio ASC',
      [usuario_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/tiempo/disponibilidad
router.post('/disponibilidad', async (req, res) => {
  const { usuario_id, fecha, hora_inicio, hora_fin, mensaje } = req.body;
  if (!usuario_id || !fecha || !hora_inicio || !hora_fin)
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  if (hora_inicio >= hora_fin)
    return res.status(400).json({ error: 'hora_inicio debe ser menor que hora_fin' });
  try {
    const [result] = await pool.query(
      'INSERT INTO tiempo_disponibilidad (usuario_id, fecha, hora_inicio, hora_fin, mensaje) VALUES (?, ?, ?, ?, ?)',
      [usuario_id, fecha, hora_inicio, hora_fin, mensaje || null]
    );
    res.json({ id: result.insertId, usuario_id, fecha, hora_inicio, hora_fin, mensaje: mensaje || null });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/tiempo/disponibilidad/:id
router.put('/disponibilidad/:id', async (req, res) => {
  const { usuario_id, fecha, hora_inicio, hora_fin, mensaje } = req.body;
  if (!usuario_id) return res.status(400).json({ error: 'Falta usuario_id' });
  if (hora_inicio >= hora_fin)
    return res.status(400).json({ error: 'hora_inicio debe ser menor que hora_fin' });
  try {
    const [result] = await pool.query(
      'UPDATE tiempo_disponibilidad SET fecha=?, hora_inicio=?, hora_fin=?, mensaje=? WHERE id=? AND usuario_id=?',
      [fecha, hora_inicio, hora_fin, mensaje || null, req.params.id, usuario_id]
    );
    if (result.affectedRows === 0)
      return res.status(403).json({ error: 'Sin permiso o registro inexistente' });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/tiempo/disponibilidad/:id
router.delete('/disponibilidad/:id', async (req, res) => {
  const { usuario_id } = req.body;
  if (!usuario_id) return res.status(400).json({ error: 'Falta usuario_id' });
  try {
    const [result] = await pool.query(
      'DELETE FROM tiempo_disponibilidad WHERE id=? AND usuario_id=?',
      [req.params.id, usuario_id]
    );
    if (result.affectedRows === 0)
      return res.status(403).json({ error: 'Sin permiso o registro inexistente' });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/tiempo/coincidencias?usuario_id=X
// Regla: inicio_coincidencia = GREATEST(inicio_yo, inicio_otro)
//        fin_coincidencia    = LEAST(fin_yo, fin_otro)
//        hay coincidencia si inicio_coincidencia < fin_coincidencia
// NUNCA expone la disponibilidad privada del otro usuario.
router.get('/coincidencias', async (req, res) => {
  const { usuario_id } = req.query;
  if (!usuario_id) return res.status(400).json({ error: 'Falta usuario_id' });
  try {
    const [otros] = await pool.query(
      "SELECT id FROM usuarios WHERE id != ? AND rol IN ('yo', 'ella') LIMIT 1",
      [usuario_id]
    );
    if (!otros.length) {
      return res.json({ coincidencias: [], sin_par: true });
    }
    const otro_id = otros[0].id;

    const [rows] = await pool.query(`
      SELECT
        a.fecha,
        a.hora_inicio                          AS mi_inicio,
        a.hora_fin                             AS mi_fin,
        a.mensaje                              AS mi_mensaje,
        GREATEST(a.hora_inicio, b.hora_inicio) AS inicio_coincidencia,
        LEAST(a.hora_fin,       b.hora_fin)    AS fin_coincidencia
      FROM tiempo_disponibilidad a
      JOIN tiempo_disponibilidad b
        ON  a.fecha      = b.fecha
        AND a.usuario_id = ?
        AND b.usuario_id = ?
      ORDER BY a.fecha ASC, a.hora_inicio ASC
    `, [usuario_id, otro_id]);

    const coincidencias = rows.map(r => ({
      fecha:               r.fecha,
      hay_coincidencia:    r.inicio_coincidencia < r.fin_coincidencia,
      inicio_coincidencia: r.inicio_coincidencia,
      fin_coincidencia:    r.fin_coincidencia,
      mi_disponibilidad: {
        hora_inicio: r.mi_inicio,
        hora_fin:    r.mi_fin,
        mensaje:     r.mi_mensaje,
      },
    }));

    res.json({ coincidencias });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
