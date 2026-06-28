const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// GET /api/calma/estado
router.get('/estado', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
          mc.id,
          mc.usuario_id,
          mc.mensaje,
          mc.activo,
          mc.creado_en,
          COALESCE(u.display_name, u.nombre, u.usuario, 'Usuario') AS usuario_nombre,
          u.usuario,
          u.nombre,
          u.display_name,
          u.color_perfil,
          u.rol
       FROM modo_calma mc
       LEFT JOIN usuarios u ON u.id = mc.usuario_id
       WHERE mc.activo = true 
         AND (mc.usuario_id = $1 OR mc.usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $1))
       ORDER BY mc.creado_en DESC
       LIMIT 1`,
      [req.user.id]
    );

    if (!result.rows.length) {
      return res.json({
        ok: true,
        activo: false,
        modo: null
      });
    }

    res.json({
      ok: true,
      activo: true,
      modo: result.rows[0]
    });
  } catch (err) {
    console.error('Error GET /api/calma/estado:', err);
    res.status(500).json({
      ok: false,
      error: 'Error al cargar Modo avión'
    });
  }
});

// GET /api/calma/activa
router.get('/activa', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
          mc.id,
          mc.usuario_id,
          mc.mensaje,
          mc.activo,
          mc.creado_en,
          COALESCE(u.display_name, u.nombre, u.usuario, 'Usuario') AS usuario_nombre,
          u.usuario,
          u.nombre,
          u.display_name,
          u.color_perfil,
          u.rol
       FROM modo_calma mc
       LEFT JOIN usuarios u ON u.id = mc.usuario_id
       WHERE mc.activo = true
         AND (mc.usuario_id = $1 OR mc.usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $1))
       ORDER BY mc.creado_en DESC
       LIMIT 1`,
      [req.user.id]
    );

    if (!result.rows.length) {
      return res.json({ ok: true, activa: false, activo: false, calma: null, modo: null });
    }

    return res.json({
      ok: true,
      activa: true,
      activo: true,
      calma: result.rows[0],
      modo: result.rows[0],
      checkins: []
    });
  } catch (err) {
    console.error('Error GET /api/calma/activa:', err);
    res.status(500).json({ ok: false, error: 'Error al cargar Modo avión' });
  }
});

// POST /api/calma/activar
router.post('/activar', requireAuth, async (req, res) => {
  const usuario_id = req.user.id;
  const { mensaje } = req.body;

  try {
    const usuarioResult = await pool.query(
      `SELECT id, usuario, nombre, display_name, rol
       FROM usuarios
       WHERE id = $1`,
      [usuario_id]
    );

    if (!usuarioResult.rows.length) {
      return res.status(404).json({
        ok: false,
        error: 'Usuario no encontrado'
      });
    }

    const usuario = usuarioResult.rows[0];

    if (usuario.rol === 'admin') {
      return res.status(403).json({
        ok: false,
        error: 'El admin no puede activar Modo avión.'
      });
    }

    // Desactivar modos avión previos que pertenezcan a este espacio de pareja
    await pool.query(
      `UPDATE modo_calma
       SET activo = false
       WHERE activo = true 
         AND (usuario_id = $1 OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $1))`,
      [usuario_id]
    );

    const insert = await pool.query(
      `INSERT INTO modo_calma
         (usuario_id, fecha_inicio, fecha_fin, mensaje, activo)
       VALUES
         ($1, CURRENT_DATE, CURRENT_DATE, $2, true)
       RETURNING *`,
      [
        usuario_id,
        mensaje || 'Estoy en modo avión. No estoy disponible por ahora.'
      ]
    );

    res.json({
      ok: true,
      activo: true,
      modo: insert.rows[0],
      mensaje_bonito: 'Modo avión activado. Puedes volver cuando tú decidas.'
    });
  } catch (err) {
    console.error('Error POST /api/calma/activar:', err);
    res.status(500).json({
      ok: false,
      error: 'Error al activar Modo avión'
    });
  }
});

// POST /api/calma/desactivar
router.post('/desactivar', requireAuth, async (req, res) => {
  const usuario_id = req.user.id;

  try {
    const activo = await pool.query(
      `SELECT id, usuario_id
       FROM modo_calma
       WHERE activo = true
         AND (usuario_id = $1 OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $1))
       ORDER BY creado_en DESC
       LIMIT 1`,
      [usuario_id]
    );

    if (!activo.rows.length) {
      return res.json({
        ok: true,
        activo: false,
        mensaje_bonito: 'Modo avión ya estaba desactivado.'
      });
    }

    const modo = activo.rows[0];

    if (Number(modo.usuario_id) !== Number(usuario_id)) {
      return res.status(403).json({
        ok: false,
        error: 'Solo quien activó Modo avión puede desactivarlo.'
      });
    }

    await pool.query(
      `UPDATE modo_calma
       SET activo = false
       WHERE id = $1`,
      [modo.id]
    );

    res.json({
      ok: true,
      activo: false,
      mensaje_bonito: 'Modo avión desactivado. Bienvenida de vuelta ♡'
    });
  } catch (err) {
    console.error('Error POST /api/calma/desactivar:', err);
    res.status(500).json({
      ok: false,
      error: 'Error al desactivar Modo avión'
    });
  }
});

// Respuestas heredadas para compatibilidad con endpoints obsoletos
router.post('/', async (req, res) => {
  res.status(410).json({ ok: false, error: 'Modo calma fue reemplazado por Modo avión. Usa /api/calma/activar.' });
});

router.post('/:id/checkin', async (req, res) => {
  res.status(410).json({ ok: false, error: 'Modo avión no usa señales/check-in.' });
});

router.post('/:id/carta', async (req, res) => {
  res.status(410).json({ ok: false, error: 'Modo avión no usa cartas.' });
});

router.get('/:id/cartas', async (req, res) => {
  res.json([]);
});

router.put('/:id/cerrar', async (req, res) => {
  res.status(410).json({ ok: false, error: 'Para desactivar Modo avión usa /api/calma/desactivar.' });
});

module.exports = router;
