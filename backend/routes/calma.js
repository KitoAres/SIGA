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
    const result = await pool.query(
      `SELECT 
          mc.*,
          u.nombre,
          u.usuario,
          COALESCE(u.display_name, u.nombre, u.usuario) AS display_name,
          COALESCE(u.color_perfil, '#22d3ee') AS color_perfil
       FROM modo_calma mc
       JOIN usuarios u ON u.id = mc.usuario_id
       WHERE mc.activo = true
       ORDER BY mc.creado_en DESC
       LIMIT 1`
    );

    if (!result.rows.length) {
      return res.json({ activa: false });
    }

    const calma = result.rows[0];

    const hoy = new Date();
    const fechaFin = new Date(fechaSQL(calma.fecha_fin) + 'T23:59:59');

    if (!isNaN(fechaFin.getTime()) && fechaFin < hoy) {
      await pool.query(
        'UPDATE modo_calma SET activo = false WHERE id = $1',
        [calma.id]
      );

      return res.json({ activa: false });
    }

    const checkinsResult = await pool.query(
      `SELECT 
          mcc.*,
          u.nombre,
          u.usuario,
          COALESCE(u.display_name, u.nombre, u.usuario) AS display_name,
          COALESCE(u.color_perfil, '#22d3ee') AS color_perfil
       FROM modo_calma_checkins mcc
       JOIN usuarios u ON u.id = mcc.usuario_id
       WHERE mcc.calma_id = $1
       ORDER BY mcc.creado_en DESC`,
      [calma.id]
    );

    const checkins = checkinsResult.rows;
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
    mensaje,
    contacto_permitido,
    evitar,
    energia
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

  if (dias > 7) {
    return res.status(400).json({
      error: 'Modo calma puede durar máximo 7 días'
    });
  }

  try {
    await pool.query(
      'UPDATE modo_calma SET activo = false WHERE activo = true'
    );

    const result = await pool.query(
      `INSERT INTO modo_calma
       (usuario_id, fecha_inicio, fecha_fin, estado_animo, mensaje, contacto_permitido, evitar, energia, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
       RETURNING id`,
      [
        usuario_id,
        fechaSQL(fecha_inicio),
        fechaSQL(fecha_fin),
        estado_animo || 'necesito calma',
        mensaje || null,
        contacto_permitido || 'Señales cortas en la app',
        evitar || 'Preguntas largas o presión',
        energia || '40% - Puedo leer, responder poquito'
      ]
    );

    res.json({
      ok: true,
      id: result.rows[0].id,
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
    const calmasResult = await pool.query(
      'SELECT * FROM modo_calma WHERE id = $1 AND activo = true',
      [req.params.id]
    );

    if (!calmasResult.rows.length) {
      return res.status(404).json({
        error: 'Modo calma no encontrado o ya cerrado'
      });
    }

    await pool.query(
      `INSERT INTO modo_calma_checkins
       (calma_id, usuario_id, mensaje)
       VALUES ($1, $2, $3)`,
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
    const calmasResult = await pool.query(
      'SELECT * FROM modo_calma WHERE id = $1 AND activo = true',
      [req.params.id]
    );

    if (!calmasResult.rows.length) {
      return res.status(404).json({
        error: 'Modo calma no encontrado o ya cerrado'
      });
    }

    const calma = calmasResult.rows[0];

    const usuariosResult = await pool.query(
      'SELECT id, rol FROM usuarios WHERE id = $1',
      [usuario_id]
    );

    if (!usuariosResult.rows.length) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    const usuario = usuariosResult.rows[0];
    const esDueno = Number(calma.usuario_id) === Number(usuario_id);
    const esAdmin = usuario.rol === 'admin';

    if (!esDueno && !esAdmin) {
      return res.status(403).json({
        error: 'Solo quien activó Modo calma puede cerrarlo'
      });
    }

    await pool.query(
      'UPDATE modo_calma SET activo = false WHERE id = $1',
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

// POST /api/calma/:id/carta
router.post('/:id/carta', async (req, res) => {
  const { usuario_id, titulo, contenido, visible_desde } = req.body;

  if (!usuario_id || !contenido || !visible_desde) {
    return res.status(400).json({
      error: 'Faltan datos para guardar la carta'
    });
  }

  try {
    const calmasResult = await pool.query(
      'SELECT * FROM modo_calma WHERE id = $1 AND activo = true',
      [req.params.id]
    );

    if (!calmasResult.rows.length) {
      return res.status(404).json({
        error: 'Modo calma no encontrado o ya cerrado'
      });
    }

    const result = await pool.query(
      `INSERT INTO calma_cartas
       (calma_id, usuario_id, titulo, contenido, visible_desde)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        req.params.id,
        usuario_id,
        titulo || 'Carta para después',
        contenido.trim(),
        fechaSQL(visible_desde)
      ]
    );

    res.json({
      ok: true,
      id: result.rows[0].id,
      message: 'Carta guardada para después'
    });

  } catch (err) {
    console.error('Error POST /api/calma/:id/carta:', err);
    res.status(500).json({
      error: 'Error al guardar la carta'
    });
  }
});

// GET /api/calma/:id/cartas
router.get('/:id/cartas', async (req, res) => {
  try {
    const cartasResult = await pool.query(
      `SELECT 
          cc.*,
          u.nombre,
          u.usuario,
          COALESCE(u.display_name, u.nombre, u.usuario) AS display_name,
          COALESCE(u.color_perfil, '#22d3ee') AS color_perfil
       FROM calma_cartas cc
       JOIN usuarios u ON u.id = cc.usuario_id
       WHERE cc.calma_id = $1
       ORDER BY cc.creado_en DESC`,
      [req.params.id]
    );

    res.json(cartasResult.rows);

  } catch (err) {
    console.error('Error GET /api/calma/:id/cartas:', err);
    res.status(500).json({
      error: 'Error al cargar cartas de calma'
    });
  }
});

module.exports = router;
