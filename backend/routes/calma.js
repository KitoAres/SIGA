const express = require('express');
const router = express.Router();
const pool = require('../config/db');

function fechaSQL(fecha) {
  if (!fecha) return null;

  if (fecha instanceof Date) {
    return fecha.toISOString().split('T')[0];
  }

  const str = String(fecha);

  if (str.includes('T')) {
    return str.split('T')[0];
  }

  return str.substring(0, 10);
}

function diasEntre(fechaInicio, fechaFin) {
  const inicio = new Date(fechaSQL(fechaInicio) + 'T12:00:00');
  const fin = new Date(fechaSQL(fechaFin) + 'T12:00:00');

  if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
    return null;
  }

  const diff = fin - inicio;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function sumarDias(fecha, dias) {
  const base = fechaSQL(fecha);
  const d = new Date(base + 'T12:00:00');

  if (isNaN(d.getTime())) {
    return null;
  }

  d.setDate(d.getDate() + dias);
  return d.toISOString().split('T')[0];
}

// GET /api/calma/activa
router.get('/activa', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
          mc.*,
          u.nombre,
          u.usuario,
          COALESCE(u.display_name, u.nombre, u.usuario) AS display_name,
          COALESCE(u.color_perfil, '#22d3ee') AS color_perfil
       FROM modo_calma mc
       JOIN usuarios u ON u.id = mc.usuario_id
       WHERE mc.activo = 1
       ORDER BY mc.creado_en DESC
       LIMIT 1`
    );

    if (!rows.length) {
      return res.json({ activa: false });
    }

    const calma = rows[0];

    const hoy = new Date();
    const fechaFin = new Date(fechaSQL(calma.fecha_fin) + 'T23:59:59');

    // Si el Modo calma ya terminó, lo cerramos automático
    if (!isNaN(fechaFin.getTime()) && fechaFin < hoy) {
      await pool.query(
        'UPDATE modo_calma SET activo = 0 WHERE id = ?',
        [calma.id]
      );

      return res.json({ activa: false });
    }

    const [checkins] = await pool.query(
      `SELECT 
          mcc.*,
          u.nombre,
          u.usuario,
          COALESCE(u.display_name, u.nombre, u.usuario) AS display_name,
          COALESCE(u.color_perfil, '#22d3ee') AS color_perfil
       FROM modo_calma_checkins mcc
       JOIN usuarios u ON u.id = mcc.usuario_id
       WHERE mcc.calma_id = ?
       ORDER BY mcc.creado_en DESC`,
      [calma.id]
    );

    const ultimoCheckin = checkins.length ? checkins[0] : null;

    let baseFecha = calma.fecha_inicio;

    if (ultimoCheckin && ultimoCheckin.creado_en) {
      baseFecha = ultimoCheckin.creado_en;
    }

    const proximoCheckin = sumarDias(baseFecha, 3);

    res.json({
      activa: true,
      calma,
      checkins,
      ultimo_checkin: ultimoCheckin,
      proximo_checkin: proximoCheckin
    });

  } catch (err) {
    console.error('Error GET /api/calma/activa:', err);
    res.status(500).json({
      error: 'Error al cargar Modo calma'
    });
  }
});

// POST /api/calma
router.post('/', async (req, res) => {
  const {
    usuario_id,
    fecha_inicio,
    fecha_fin,
    estado_animo,
    mensaje
  } = req.body;

  if (!usuario_id || !fecha_inicio || !fecha_fin) {
    return res.status(400).json({
      error: 'Faltan datos obligatorios'
    });
  }

  const dias = diasEntre(fecha_inicio, fecha_fin);

  if (dias === null) {
    return res.status(400).json({
      error: 'Fechas inválidas'
    });
  }

  if (dias < 0) {
    return res.status(400).json({
      error: 'La fecha final no puede ser anterior a la inicial'
    });
  }

  if (dias > 14) {
    return res.status(400).json({
      error: 'Modo calma puede durar máximo 14 días'
    });
  }

  try {
    // Solo permitimos un Modo calma activo a la vez
    await pool.query(
      'UPDATE modo_calma SET activo = 0 WHERE activo = 1'
    );

    const [result] = await pool.query(
      `INSERT INTO modo_calma
       (usuario_id, fecha_inicio, fecha_fin, estado_animo, mensaje, activo)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [
        usuario_id,
        fechaSQL(fecha_inicio),
        fechaSQL(fecha_fin),
        estado_animo || 'necesito calma',
        mensaje || null
      ]
    );

    res.json({
      ok: true,
      id: result.insertId,
      message: 'Modo calma activado'
    });

  } catch (err) {
    console.error('Error POST /api/calma:', err);
    res.status(500).json({
      error: 'Error al activar Modo calma'
    });
  }
});

// POST /api/calma/:id/checkin
router.post('/:id/checkin', async (req, res) => {
  const { usuario_id, mensaje } = req.body;

  if (!usuario_id || !mensaje || !mensaje.trim()) {
    return res.status(400).json({
      error: 'El mensaje es obligatorio'
    });
  }

  try {
    const [calmas] = await pool.query(
      'SELECT * FROM modo_calma WHERE id = ? AND activo = 1',
      [req.params.id]
    );

    if (!calmas.length) {
      return res.status(404).json({
        error: 'Modo calma no encontrado o ya cerrado'
      });
    }

    await pool.query(
      `INSERT INTO modo_calma_checkins
       (calma_id, usuario_id, mensaje)
       VALUES (?, ?, ?)`,
      [
        req.params.id,
        usuario_id,
        mensaje.trim()
      ]
    );

    res.json({
      ok: true,
      message: 'Señal guardada'
    });

  } catch (err) {
    console.error('Error POST /api/calma/:id/checkin:', err);
    res.status(500).json({
      error: 'Error al guardar la señal'
    });
  }
});

// PUT /api/calma/:id/cerrar
router.put('/:id/cerrar', async (req, res) => {
  const { usuario_id } = req.body;

  if (!usuario_id) {
    return res.status(400).json({
      error: 'Falta usuario_id'
    });
  }

  try {
    const [calmas] = await pool.query(
      'SELECT * FROM modo_calma WHERE id = ? AND activo = 1',
      [req.params.id]
    );

    if (!calmas.length) {
      return res.status(404).json({
        error: 'Modo calma no encontrado o ya cerrado'
      });
    }

    const calma = calmas[0];

    const [usuarios] = await pool.query(
      'SELECT id, rol FROM usuarios WHERE id = ?',
      [usuario_id]
    );

    if (!usuarios.length) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    const usuario = usuarios[0];
    const esDueno = Number(calma.usuario_id) === Number(usuario_id);
    const esAdmin = usuario.rol === 'administrador';

    if (!esDueno && !esAdmin) {
      return res.status(403).json({
        error: 'Solo quien activó Modo calma puede cerrarlo'
      });
    }

    await pool.query(
      'UPDATE modo_calma SET activo = 0 WHERE id = ?',
      [req.params.id]
    );

    res.json({
      ok: true,
      message: 'Modo calma cerrado'
    });

  } catch (err) {
    console.error('Error PUT /api/calma/:id/cerrar:', err);
    res.status(500).json({
      error: 'Error al cerrar Modo calma'
    });
  }
});

module.exports = router;
