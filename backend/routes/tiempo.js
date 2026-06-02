const express = require('express');
const router = express.Router();
const pool = require('../config/db');

const {
  enviarEmail,
  registrarNotificacionSiNoExiste,
  htmlBase,
  escapeHtml
} = require('../utils/email');

// ─────────────────────────────────────────────────────────────
// Nota para Francin, si algún día lees este código:
// Esta parte busca los momentos donde ambos coinciden.
// No intenta presionar, solo mostrar una posibilidad bonita:
// “aquí sí podríamos vernos, si ambos quieren”. ♡
// ─────────────────────────────────────────────────────────────

async function obtenerUsuario(usuario_id) {
  const r = await pool.query(
    'SELECT id, usuario, nombre, rol FROM usuarios WHERE id=$1',
    [usuario_id]
  );

  return r.rows[0] || null;
}

async function columnaExiste(tabla, columna) {
  const r = await pool.query(
    `SELECT EXISTS(
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema='public'
       AND table_name=$1
       AND column_name=$2
     ) AS existe`,
    [tabla, columna]
  );

  return !!r.rows[0]?.existe;
}

function normalizarFecha(value) {
  if (!value) return '';

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

function normalizarHora(value) {
  if (!value) return '';
  return String(value).slice(0, 5);
}

async function notificarMatchesPorEmail(coincidencias) {
  try {
    const matches = (coincidencias || []).filter(c => c.hay_coincidencia);

    for (const m of matches) {
      const fecha = normalizarFecha(m.fecha);
      const inicio = normalizarHora(m.inicio_coincidencia);
      const fin = normalizarHora(m.fin_coincidencia);

      if (!fecha || !inicio || !fin) continue;

      const clave = `match_tiempo_${fecha}_${inicio}_${fin}`;
      const asunto = 'SIGA encontró un match de tiempo ✨';

      const registro = await registrarNotificacionSiNoExiste(pool, {
        tipo: 'match_tiempo',
        clave,
        usuario_id: null,
        enviado_a: process.env.EMAIL_MATCH_TO || process.env.EMAIL_TO,
        asunto
      });

      if (!registro.nuevo) continue;

      await enviarEmail({
        to: process.env.EMAIL_MATCH_TO || process.env.EMAIL_TO,
        subject: asunto,
        html: htmlBase({
          titulo: 'SIGA encontró un match de tiempo ✨',
          cuerpo: `
            <p>Hay una coincidencia para verse.</p>
            <p><strong>Fecha:</strong> ${escapeHtml(fecha)}</p>
            <p><strong>Hora:</strong> ${escapeHtml(inicio)} — ${escapeHtml(fin)}</p>
            <p>Entra a SIGA para revisar los detalles.</p>
          `
        }),
        text: `SIGA encontró un match de tiempo. Fecha: ${fecha}. Hora: ${inicio} — ${fin}.`
      });
    }
  } catch (err) {
    console.error('No se pudo enviar email de match:', err);
  }
}

router.get('/disponibilidad', async (req, res) => {
  const { usuario_id } = req.query;

  if (!usuario_id) {
    return res.status(400).json({
      error: 'Falta usuario_id'
    });
  }

  try {
    const usuario = await obtenerUsuario(usuario_id);

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    const sqlAdmin = `
      SELECT
        td.*,
        u.nombre,
        u.usuario,
        u.rol,
        COALESCE(u.display_name,u.nombre,u.usuario) AS display_name,
        COALESCE(u.color_perfil,'#22d3ee') AS color_perfil
      FROM tiempo_disponibilidad td
      JOIN usuarios u ON u.id=td.usuario_id
      WHERE u.rol IN ('yo','ella')
      ORDER BY td.fecha ASC, td.hora_inicio ASC
    `;

    const sqlUser = `
      SELECT
        td.*,
        u.nombre,
        u.usuario,
        u.rol,
        COALESCE(u.display_name,u.nombre,u.usuario) AS display_name,
        COALESCE(u.color_perfil,'#22d3ee') AS color_perfil
      FROM tiempo_disponibilidad td
      JOIN usuarios u ON u.id=td.usuario_id
      WHERE td.usuario_id=$1
      ORDER BY td.fecha ASC, td.hora_inicio ASC
    `;

    const r = usuario.rol === 'admin'
      ? await pool.query(sqlAdmin)
      : await pool.query(sqlUser, [usuario_id]);

    res.json(r.rows);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

router.post('/disponibilidad', async (req, res) => {
  const {
    usuario_id,
    fecha,
    hora_inicio,
    hora_fin,
    mensaje,
    lugar
  } = req.body;

  if (!usuario_id || !fecha || !hora_inicio || !hora_fin) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios'
    });
  }

  if (hora_inicio >= hora_fin) {
    return res.status(400).json({
      error: 'hora_inicio debe ser menor que hora_fin'
    });
  }

  try {
    const tieneLugar = await columnaExiste('tiempo_disponibilidad', 'lugar');

    const r = tieneLugar
      ? await pool.query(
          `INSERT INTO tiempo_disponibilidad
            (usuario_id,fecha,hora_inicio,hora_fin,lugar,mensaje)
           VALUES($1,$2,$3,$4,$5,$6)
           RETURNING id`,
          [
            usuario_id,
            fecha,
            hora_inicio,
            hora_fin,
            lugar || null,
            mensaje || null
          ]
        )
      : await pool.query(
          `INSERT INTO tiempo_disponibilidad
            (usuario_id,fecha,hora_inicio,hora_fin,mensaje)
           VALUES($1,$2,$3,$4,$5)
           RETURNING id`,
          [
            usuario_id,
            fecha,
            hora_inicio,
            hora_fin,
            mensaje || null
          ]
        );

    res.json({
      id: r.rows[0].id,
      usuario_id,
      fecha,
      hora_inicio,
      hora_fin,
      lugar: lugar || null,
      mensaje: mensaje || null
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

router.put('/disponibilidad/:id', async (req, res) => {
  const {
    usuario_id,
    fecha,
    hora_inicio,
    hora_fin,
    mensaje,
    lugar
  } = req.body;

  if (!usuario_id) {
    return res.status(400).json({
      error: 'Falta usuario_id'
    });
  }

  if (!fecha || !hora_inicio || !hora_fin) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios'
    });
  }

  if (hora_inicio >= hora_fin) {
    return res.status(400).json({
      error: 'hora_inicio debe ser menor que hora_fin'
    });
  }

  try {
    const usuario = await obtenerUsuario(usuario_id);

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    const tieneLugar = await columnaExiste('tiempo_disponibilidad', 'lugar');

    let r;

    if (tieneLugar) {
      r = usuario.rol === 'admin'
        ? await pool.query(
            `UPDATE tiempo_disponibilidad
             SET fecha=$1,hora_inicio=$2,hora_fin=$3,lugar=$4,mensaje=$5
             WHERE id=$6`,
            [
              fecha,
              hora_inicio,
              hora_fin,
              lugar || null,
              mensaje || null,
              req.params.id
            ]
          )
        : await pool.query(
            `UPDATE tiempo_disponibilidad
             SET fecha=$1,hora_inicio=$2,hora_fin=$3,lugar=$4,mensaje=$5
             WHERE id=$6 AND usuario_id=$7`,
            [
              fecha,
              hora_inicio,
              hora_fin,
              lugar || null,
              mensaje || null,
              req.params.id,
              usuario_id
            ]
          );
    } else {
      r = usuario.rol === 'admin'
        ? await pool.query(
            `UPDATE tiempo_disponibilidad
             SET fecha=$1,hora_inicio=$2,hora_fin=$3,mensaje=$4
             WHERE id=$5`,
            [
              fecha,
              hora_inicio,
              hora_fin,
              mensaje || null,
              req.params.id
            ]
          )
        : await pool.query(
            `UPDATE tiempo_disponibilidad
             SET fecha=$1,hora_inicio=$2,hora_fin=$3,mensaje=$4
             WHERE id=$5 AND usuario_id=$6`,
            [
              fecha,
              hora_inicio,
              hora_fin,
              mensaje || null,
              req.params.id,
              usuario_id
            ]
          );
    }

    if (r.rowCount === 0) {
      return res.status(403).json({
        error: 'Sin permiso o registro inexistente'
      });
    }

    res.json({
      ok: true
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

router.delete('/disponibilidad/:id', async (req, res) => {
  const { usuario_id } = req.body;

  if (!usuario_id) {
    return res.status(400).json({
      error: 'Falta usuario_id'
    });
  }

  try {
    const usuario = await obtenerUsuario(usuario_id);

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    const r = usuario.rol === 'admin'
      ? await pool.query(
          'DELETE FROM tiempo_disponibilidad WHERE id=$1',
          [req.params.id]
        )
      : await pool.query(
          'DELETE FROM tiempo_disponibilidad WHERE id=$1 AND usuario_id=$2',
          [req.params.id, usuario_id]
        );

    if (r.rowCount === 0) {
      return res.status(403).json({
        error: 'Sin permiso o registro inexistente'
      });
    }

    res.json({
      ok: true
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

router.get('/coincidencias', async (req, res) => {
  const { usuario_id } = req.query;

  if (!usuario_id) {
    return res.status(400).json({
      error: 'Falta usuario_id'
    });
  }

  try {
    const usuario = await obtenerUsuario(usuario_id);

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    const tieneLugar = await columnaExiste('tiempo_disponibilidad', 'lugar');
    const vigente = `(a.fecha::date + LEAST(a.hora_fin,b.hora_fin)) >= NOW()`;

    if (usuario.rol === 'admin') {
      const ur = await pool.query(
        `SELECT id,rol
         FROM usuarios
         WHERE rol IN ('yo','ella')
         ORDER BY id ASC`
      );

      const yo = ur.rows.find(u => u.rol === 'yo');
      const ella = ur.rows.find(u => u.rol === 'ella');

      if (!yo || !ella) {
        return res.json({
          coincidencias: [],
          sin_par: true
        });
      }

      const r = await pool.query(
        `SELECT
            a.fecha,
            a.hora_inicio AS yo_inicio,
            a.hora_fin AS yo_fin,
            ${tieneLugar ? 'a.lugar AS yo_lugar,' : 'NULL AS yo_lugar,'}
            a.mensaje AS yo_mensaje,
            b.hora_inicio AS ella_inicio,
            b.hora_fin AS ella_fin,
            ${tieneLugar ? 'b.lugar AS ella_lugar,' : 'NULL AS ella_lugar,'}
            b.mensaje AS ella_mensaje,
            GREATEST(a.hora_inicio,b.hora_inicio) AS inicio_coincidencia,
            LEAST(a.hora_fin,b.hora_fin) AS fin_coincidencia
         FROM tiempo_disponibilidad a
         JOIN tiempo_disponibilidad b
           ON a.fecha=b.fecha
          AND a.usuario_id=$1
          AND b.usuario_id=$2
         WHERE GREATEST(a.hora_inicio,b.hora_inicio)<LEAST(a.hora_fin,b.hora_fin)
         AND ${vigente}
         ORDER BY a.fecha ASC,inicio_coincidencia ASC`,
        [yo.id, ella.id]
      );

      const coincidencias = r.rows.map(x => ({
        fecha: x.fecha,
        hay_coincidencia: true,
        inicio_coincidencia: x.inicio_coincidencia,
        fin_coincidencia: x.fin_coincidencia,
        yo: {
          hora_inicio: x.yo_inicio,
          hora_fin: x.yo_fin,
          lugar: x.yo_lugar,
          mensaje: x.yo_mensaje
        },
        ella: {
          hora_inicio: x.ella_inicio,
          hora_fin: x.ella_fin,
          lugar: x.ella_lugar,
          mensaje: x.ella_mensaje
        }
      }));

      // IMPORTANTE:
      // Esperamos para que Vercel no corte el proceso.
      await notificarMatchesPorEmail(coincidencias);

      return res.json({
        coincidencias
      });
    }

    const or = await pool.query(
      `SELECT id
       FROM usuarios
       WHERE id<>$1
       AND rol IN ('yo','ella')
       LIMIT 1`,
      [usuario_id]
    );

    if (!or.rows.length) {
      return res.json({
        coincidencias: [],
        sin_par: true
      });
    }

    const otro_id = or.rows[0].id;

    const r = await pool.query(
      `SELECT
          a.fecha,

          a.hora_inicio AS mi_inicio,
          a.hora_fin AS mi_fin,
          ${tieneLugar ? 'a.lugar AS mi_lugar,' : 'NULL AS mi_lugar,'}
          a.mensaje AS mi_mensaje,

          b.hora_inicio AS otro_inicio,
          b.hora_fin AS otro_fin,
          ${tieneLugar ? 'b.lugar AS otro_lugar,' : 'NULL AS otro_lugar,'}
          b.mensaje AS otro_mensaje,

          GREATEST(a.hora_inicio,b.hora_inicio) AS inicio_coincidencia,
          LEAST(a.hora_fin,b.hora_fin) AS fin_coincidencia
       FROM tiempo_disponibilidad a
       JOIN tiempo_disponibilidad b
         ON a.fecha=b.fecha
        AND a.usuario_id=$1
        AND b.usuario_id=$2
       WHERE GREATEST(a.hora_inicio,b.hora_inicio)<LEAST(a.hora_fin,b.hora_fin)
       AND ${vigente}
       ORDER BY a.fecha ASC,inicio_coincidencia ASC`,
      [usuario_id, otro_id]
    );

    const coincidencias = r.rows.map(x => ({
      fecha: x.fecha,
      hay_coincidencia: true,
      inicio_coincidencia: x.inicio_coincidencia,
      fin_coincidencia: x.fin_coincidencia,

      mi_disponibilidad: {
        hora_inicio: x.mi_inicio,
        hora_fin: x.mi_fin,
        lugar: x.mi_lugar,
        mensaje: x.mi_mensaje
      },

      otra_disponibilidad: {
        hora_inicio: x.otro_inicio,
        hora_fin: x.otro_fin,
        lugar: x.otro_lugar,
        mensaje: x.otro_mensaje
      }
    }));

    // IMPORTANTE:
    // Esperamos para que Vercel no corte el proceso.
    await notificarMatchesPorEmail(coincidencias);

    res.json({
      coincidencias
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;
