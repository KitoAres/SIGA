const express = require('express');
const router = express.Router();
const pool = require('../config/db');

async function obtenerUsuario(usuario_id) {
  const result = await pool.query(
    'SELECT id, usuario, nombre, rol FROM usuarios WHERE id = $1',
    [usuario_id]
  );

  return result.rows[0] || null;
}

// GET /api/tiempo/disponibilidad?usuario_id=X
router.get('/disponibilidad', async (req, res) => {
  const { usuario_id } = req.query;

  if (!usuario_id) {
    return res.status(400).json({ error: 'Falta usuario_id' });
  }

  try {
    const usuario = await obtenerUsuario(usuario_id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    let result;

    // Admin puede ver horarios de ambos: yo y ella
    if (usuario.rol === 'admin') {
      result = await pool.query(
        `SELECT 
          td.*,
          u.nombre,
          u.usuario,
          u.rol,
          COALESCE(u.display_name, u.nombre, u.usuario) AS display_name,
          COALESCE(u.color_perfil, '#22d3ee') AS color_perfil
        FROM tiempo_disponibilidad td
        JOIN usuarios u ON u.id = td.usuario_id
        WHERE u.rol IN ('yo', 'ella')
        ORDER BY td.fecha ASC, td.hora_inicio ASC`
      );
    } else {
      result = await pool.query(
        `SELECT 
          td.*,
          u.nombre,
          u.usuario,
          u.rol,
          COALESCE(u.display_name, u.nombre, u.usuario) AS display_name,
          COALESCE(u.color_perfil, '#22d3ee') AS color_perfil
        FROM tiempo_disponibilidad td
        JOIN usuarios u ON u.id = td.usuario_id
        WHERE td.usuario_id = $1
        ORDER BY td.fecha ASC, td.hora_inicio ASC`,
        [usuario_id]
      );
    }

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tiempo/disponibilidad
router.post('/disponibilidad', async (req, res) => {
  const { usuario_id, fecha, hora_inicio, hora_fin, lugar, mensaje } = req.body;

  if (!usuario_id || !fecha || !hora_inicio || !hora_fin) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  if (hora_inicio >= hora_fin) {
    return res.status(400).json({ error: 'hora_inicio debe ser menor que hora_fin' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tiempo_disponibilidad 
       (usuario_id, fecha, hora_inicio, hora_fin, lugar, mensaje) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [usuario_id, fecha, hora_inicio, hora_fin, lugar || null, mensaje || null]
    );

    res.json({
      id: result.rows[0].id,
      usuario_id,
      fecha,
      hora_inicio,
      hora_fin,
      lugar: lugar || null,
      mensaje: mensaje || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tiempo/disponibilidad/:id
router.put('/disponibilidad/:id', async (req, res) => {
  const { usuario_id, fecha, hora_inicio, hora_fin, lugar, mensaje } = req.body;

  if (!usuario_id) {
    return res.status(400).json({ error: 'Falta usuario_id' });
  }

  if (!fecha || !hora_inicio || !hora_fin) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  if (hora_inicio >= hora_fin) {
    return res.status(400).json({ error: 'hora_inicio debe ser menor que hora_fin' });
  }

  try {
    const usuario = await obtenerUsuario(usuario_id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    let result;

    // Admin puede editar cualquier horario de yo/ella
    if (usuario.rol === 'admin') {
      result = await pool.query(
        `UPDATE tiempo_disponibilidad 
         SET fecha = $1,
             hora_inicio = $2,
             hora_fin = $3,
             lugar = $4,
             mensaje = $5
         WHERE id = $6`,
        [fecha, hora_inicio, hora_fin, lugar || null, mensaje || null, req.params.id]
      );
    } else {
      result = await pool.query(
        `UPDATE tiempo_disponibilidad 
         SET fecha = $1,
             hora_inicio = $2,
             hora_fin = $3,
             lugar = $4,
             mensaje = $5
         WHERE id = $6 AND usuario_id = $7`,
        [fecha, hora_inicio, hora_fin, lugar || null, mensaje || null, req.params.id, usuario_id]
      );
    }

    if (result.rowCount === 0) {
      return res.status(403).json({ error: 'Sin permiso o registro inexistente' });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tiempo/disponibilidad/:id
router.delete('/disponibilidad/:id', async (req, res) => {
  const { usuario_id } = req.body;

  if (!usuario_id) {
    return res.status(400).json({ error: 'Falta usuario_id' });
  }

  try {
    const usuario = await obtenerUsuario(usuario_id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    let result;

    // Admin puede eliminar cualquier horario de yo/ella
    if (usuario.rol === 'admin') {
      result = await pool.query(
        'DELETE FROM tiempo_disponibilidad WHERE id = $1',
        [req.params.id]
      );
    } else {
      result = await pool.query(
        `DELETE FROM tiempo_disponibilidad 
         WHERE id = $1 AND usuario_id = $2`,
        [req.params.id, usuario_id]
      );
    }

    if (result.rowCount === 0) {
      return res.status(403).json({ error: 'Sin permiso o registro inexistente' });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tiempo/coincidencias?usuario_id=X
router.get('/coincidencias', async (req, res) => {
  const { usuario_id } = req.query;

  if (!usuario_id) {
    return res.status(400).json({ error: 'Falta usuario_id' });
  }

  try {
    const usuario = await obtenerUsuario(usuario_id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Si es admin, calcula coincidencias entre yo y ella
    if (usuario.rol === 'admin') {
      const usuariosResult = await pool.query(
        `SELECT id, rol 
         FROM usuarios 
         WHERE rol IN ('yo', 'ella')
         ORDER BY id ASC`
      );

      const yo = usuariosResult.rows.find(u => u.rol === 'yo');
      const ella = usuariosResult.rows.find(u => u.rol === 'ella');

      if (!yo || !ella) {
        return res.json({ coincidencias: [], sin_par: true });
      }

      const result = await pool.query(
        `SELECT
          a.fecha,
          a.hora_inicio AS yo_inicio,
          a.hora_fin AS yo_fin,
          a.lugar AS yo_lugar,
          a.mensaje AS yo_mensaje,
          b.hora_inicio AS ella_inicio,
          b.hora_fin AS ella_fin,
          b.lugar AS ella_lugar,
          b.mensaje AS ella_mensaje,
          GREATEST(a.hora_inicio, b.hora_inicio) AS inicio_coincidencia,
          LEAST(a.hora_fin, b.hora_fin) AS fin_coincidencia
        FROM tiempo_disponibilidad a
        JOIN tiempo_disponibilidad b
          ON a.fecha = b.fecha
         AND a.usuario_id = $1
         AND b.usuario_id = $2
        ORDER BY a.fecha ASC, a.hora_inicio ASC`,
        [yo.id, ella.id]
      );

      const coincidencias = result.rows.map(r => ({
        fecha: r.fecha,
        hay_coincidencia: r.inicio_coincidencia < r.fin_coincidencia,
        inicio_coincidencia: r.inicio_coincidencia,
        fin_coincidencia: r.fin_coincidencia,
        yo: {
          hora_inicio: r.yo_inicio,
          hora_fin: r.yo_fin,
          lugar: r.yo_lugar,
          mensaje: r.yo_mensaje
        },
        ella: {
          hora_inicio: r.ella_inicio,
          hora_fin: r.ella_fin,
          lugar: r.ella_lugar,
          mensaje: r.ella_mensaje
        }
      }));

      return res.json({ coincidencias });
    }

    // Si no es admin, mantiene la lógica normal
    const otrosResult = await pool.query(
      `SELECT id 
       FROM usuarios 
       WHERE id <> $1 
       AND rol IN ('yo', 'ella') 
       LIMIT 1`,
      [usuario_id]
    );

    if (!otrosResult.rows.length) {
      return res.json({ coincidencias: [], sin_par: true });
    }

    const otro_id = otrosResult.rows[0].id;

    const result = await pool.query(
      `SELECT
        a.fecha,
        a.hora_inicio AS mi_inicio,
        a.hora_fin AS mi_fin,
        a.lugar AS mi_lugar,
        a.mensaje AS mi_mensaje,
        GREATEST(a.hora_inicio, b.hora_inicio) AS inicio_coincidencia,
        LEAST(a.hora_fin, b.hora_fin) AS fin_coincidencia
      FROM tiempo_disponibilidad a
      JOIN tiempo_disponibilidad b
        ON a.fecha = b.fecha
       AND a.usuario_id = $1
       AND b.usuario_id = $2
      ORDER BY a.fecha ASC, a.hora_inicio ASC`,
      [usuario_id, otro_id]
    );

    const coincidencias = result.rows.map(r => ({
      fecha: r.fecha,
      hay_coincidencia: r.inicio_coincidencia < r.fin_coincidencia,
      inicio_coincidencia: r.inicio_coincidencia,
      fin_coincidencia: r.fin_coincidencia,
      mi_disponibilidad: {
        hora_inicio: r.mi_inicio,
        hora_fin: r.mi_fin,
        lugar: r.mi_lugar,
        mensaje: r.mi_mensaje
      }
    }));

    res.json({ coincidencias });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
