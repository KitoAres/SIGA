/* ============================================================
   SIGA — routes/eventos.js
   Módulo: Misiones de conexión + gamificación
   Reemplaza: backend/routes/eventos.js
   ============================================================ */

const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { calcularNivelRelacion } = require('../utils/nivel');

function normalizarTexto(valor) {
  if (valor === undefined || valor === null) return null;
  const limpio = String(valor).trim();
  return limpio || null;
}

function validarTipo(tipo) {
  const permitidos = ['pregunta', 'actividad', 'cita', 'juego', 'detalle', 'guia'];
  return permitidos.includes(tipo) ? tipo : 'pregunta';
}

function validarNivel(nivel) {
  const mapa = {
    suave: 'facil',
    fácil: 'facil',
    facil: 'facil',
    medio: 'medio',
    dificil: 'dificil',
    difícil: 'dificil',
    profundo: 'dificil',
    hardcore: 'hardcore',
    legendaria: 'hardcore',
    especial: 'hardcore'
  };
  const key = normalizarTexto(nivel)?.toLowerCase();
  return mapa[key] || 'facil';
}

function validarModo(modo) {
  const permitidos = ['simple', 'guia'];
  return permitidos.includes(modo) ? modo : 'simple';
}

function puntosPorNivel(nivel) {
  const n = validarNivel(nivel);
  return { facil: 10, medio: 25, dificil: 50, hardcore: 100 }[n] || 10;
}



async function esAdmin(usuario_id) {
  if (!usuario_id) return false;
  const result = await pool.query(
    `SELECT id FROM usuarios WHERE id = $1 AND rol = 'admin'`,
    [usuario_id]
  );
  return result.rows.length > 0;
}

function calcularPromedioDiasEntreFechas(fechas) {
  const limpias = fechas
    .map(f => f ? new Date(String(f).substring(0, 10) + 'T12:00:00') : null)
    .filter(f => f && !isNaN(f.getTime()))
    .sort((a, b) => a - b);

  if (limpias.length < 2) return null;

  let total = 0;
  for (let i = 1; i < limpias.length; i++) {
    total += Math.round((limpias[i] - limpias[i - 1]) / (1000 * 60 * 60 * 24));
  }

  return Math.round(total / (limpias.length - 1));
}

function limpiarItems(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item, index) => ({
      orden: Number(item.orden || index + 1),
      bloque: normalizarTexto(item.bloque) || null,
      tipo_item: normalizarTexto(item.tipo_item) || 'pregunta',
      contenido: normalizarTexto(item.contenido)
    }))
    .filter(item => item.contenido);
}

async function guardarItems(client, eventoId, items) {
  await client.query('DELETE FROM evento_items WHERE evento_id = $1', [eventoId]);

  const limpios = limpiarItems(items);

  for (const item of limpios) {
    await client.query(
      `INSERT INTO evento_items
        (evento_id, orden, bloque, tipo_item, contenido)
       VALUES ($1, $2, $3, $4, $5)`,
      [eventoId, item.orden, item.bloque, item.tipo_item, item.contenido]
    );
  }
}

// GET /api/eventos/progreso
router.get('/progreso', async (req, res) => {
  try {
    const resumen = await pool.query(
      `SELECT
          COALESCE(SUM(puntos), 0)::int AS puntos,
          COUNT(*)::int AS completadas,
          COUNT(*) FILTER (WHERE fecha = CURRENT_DATE)::int AS hoy
       FROM misiones_completadas`
    );

    const porNivel = await pool.query(
      `SELECT nivel, COUNT(*)::int AS total, COALESCE(SUM(puntos), 0)::int AS puntos
       FROM misiones_completadas
       GROUP BY nivel`
    );

    const ultimas = await pool.query(
      `SELECT id, evento_id, titulo, nivel, puntos, comentario, fecha, creado_en
       FROM misiones_completadas
       ORDER BY creado_en DESC
       LIMIT 5`
    );

    const total = resumen.rows[0]?.puntos || 0;

    res.json({
      puntos: total,
      completadas: resumen.rows[0]?.completadas || 0,
      hoy: resumen.rows[0]?.hoy || 0,
      nivel: calcularNivelRelacion(total),
      por_nivel: porNivel.rows,
      ultimas: ultimas.rows
    });
  } catch (err) {
    console.error('Error GET /api/eventos/progreso:', err);
    res.status(500).json({ error: 'Error al cargar progreso de misiones' });
  }
});

// GET /api/eventos?q=&tipo=&nivel=
router.get('/', async (req, res) => {
  const { q, tipo, nivel } = req.query;

  const filtros = ['e.activo = true'];
  const valores = [];

  if (tipo) {
    valores.push(tipo);
    filtros.push(`e.tipo = $${valores.length}`);
  }

  if (nivel) {
    valores.push(validarNivel(nivel));
    filtros.push(`e.nivel = $${valores.length}`);
  }

  if (q) {
    valores.push(`%${q}%`);
    filtros.push(`(
      e.titulo ILIKE $${valores.length}
      OR e.descripcion ILIKE $${valores.length}
      OR e.categoria ILIKE $${valores.length}
      OR EXISTS (
        SELECT 1 FROM evento_items ei
        WHERE ei.evento_id = e.id
        AND ei.contenido ILIKE $${valores.length}
      )
    )`);
  }

  try {
    const result = await pool.query(
      `SELECT
          e.id,
          e.titulo,
          e.tipo,
          e.categoria,
          e.nivel,
          e.duracion,
          e.descripcion,
          COALESCE(e.modo, 'simple') AS modo,
          e.instrucciones,
          e.fuente,
          e.activo,
          e.creado_por,
          e.creado_en,
          COUNT(ei.id)::int AS total_items,
          COALESCE((SELECT COUNT(*)::int FROM misiones_completadas mc WHERE mc.evento_id = e.id), 0) AS completada_total
       FROM eventos_preguntas e
       LEFT JOIN evento_items ei ON ei.evento_id = e.id
       WHERE ${filtros.join(' AND ')}
       GROUP BY e.id
       ORDER BY
        CASE e.nivel
          WHEN 'facil' THEN 1
          WHEN 'medio' THEN 2
          WHEN 'dificil' THEN 3
          WHEN 'hardcore' THEN 4
          ELSE 5
        END,
        e.titulo ASC`,
      valores
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error GET /api/eventos:', err);
    res.status(500).json({ error: 'Error al cargar misiones' });
  }
});

// GET /api/eventos/aleatorio?tipo=&nivel=
router.get('/aleatorio', async (req, res) => {
  const { tipo, nivel } = req.query;

  const filtros = ['e.activo = true'];
  const valores = [];

  if (tipo) {
    valores.push(tipo);
    filtros.push(`e.tipo = $${valores.length}`);
  }

  if (nivel) {
    valores.push(validarNivel(nivel));
    filtros.push(`e.nivel = $${valores.length}`);
  }

  try {
    const result = await pool.query(
      `SELECT
          e.id,
          e.titulo,
          e.tipo,
          e.categoria,
          e.nivel,
          e.duracion,
          e.descripcion,
          COALESCE(e.modo, 'simple') AS modo,
          e.instrucciones,
          e.fuente,
          COUNT(ei.id)::int AS total_items,
          COALESCE((SELECT COUNT(*)::int FROM misiones_completadas mc WHERE mc.evento_id = e.id), 0) AS completada_total
       FROM eventos_preguntas e
       LEFT JOIN evento_items ei ON ei.evento_id = e.id
       WHERE ${filtros.join(' AND ')}
       GROUP BY e.id
       ORDER BY RANDOM()
       LIMIT 1`,
      valores
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'No hay misiones disponibles' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error GET /api/eventos/aleatorio:', err);
    res.status(500).json({ error: 'Error al sugerir una misión' });
  }
});



// GET /api/eventos/admin/resumen?usuario_id=X
router.get('/admin/resumen', async (req, res) => {
  const { usuario_id } = req.query;

  try {
    if (!(await esAdmin(usuario_id))) {
      return res.status(403).json({ error: 'Solo el admin puede ver estas estadísticas.' });
    }

    const misionesResumen = await pool.query(
      `SELECT
          COUNT(*)::int AS total,
          COALESCE(SUM(puntos), 0)::int AS puntos,
          COUNT(*) FILTER (WHERE fecha >= CURRENT_DATE - INTERVAL '7 days')::int AS ultimos_7,
          COUNT(*) FILTER (WHERE fecha >= CURRENT_DATE - INTERVAL '30 days')::int AS ultimos_30
       FROM misiones_completadas`
    );

    const misionesRecientes = await pool.query(
      `SELECT
          mc.id,
          mc.evento_id,
          mc.titulo,
          mc.nivel,
          mc.puntos,
          mc.fecha,
          mc.creado_en,
          mc.usuario_id,
          COALESCE(u.display_name, u.nombre, u.usuario, 'Sin usuario') AS usuario_nombre,
          u.rol AS usuario_rol
       FROM misiones_completadas mc
       LEFT JOIN usuarios u ON u.id = mc.usuario_id
       ORDER BY mc.creado_en DESC
       LIMIT 20`
    );

    const misionesPorUsuario = await pool.query(
      `SELECT
          COALESCE(u.display_name, u.nombre, u.usuario, 'Sin usuario') AS usuario_nombre,
          u.rol,
          COUNT(mc.id)::int AS total,
          COALESCE(SUM(mc.puntos), 0)::int AS puntos,
          MAX(mc.creado_en) AS ultima
       FROM misiones_completadas mc
       LEFT JOIN usuarios u ON u.id = mc.usuario_id
       GROUP BY usuario_nombre, u.rol
       ORDER BY puntos DESC, total DESC`
    );

    const misionesPorNivel = await pool.query(
      `SELECT nivel, COUNT(*)::int AS total, COALESCE(SUM(puntos), 0)::int AS puntos
       FROM misiones_completadas
       GROUP BY nivel
       ORDER BY
        CASE nivel
          WHEN 'facil' THEN 1
          WHEN 'medio' THEN 2
          WHEN 'dificil' THEN 3
          WHEN 'hardcore' THEN 4
          ELSE 5
        END`
    );

    const misionesPorDia = await pool.query(
      `SELECT fecha, COUNT(*)::int AS total, COALESCE(SUM(puntos), 0)::int AS puntos
       FROM misiones_completadas
       WHERE fecha >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY fecha
       ORDER BY fecha ASC`
    );

    const calmaResumen = await pool.query(
      `SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE activo = true)::int AS activas,
          COALESCE(SUM(GREATEST(1, (COALESCE(fecha_fin, CURRENT_DATE)::date - fecha_inicio::date) + 1)), 0)::int AS dias_programados,
          MAX(creado_en) AS ultima
       FROM modo_calma`
    );

    const calmaPorUsuario = await pool.query(
      `SELECT
          COALESCE(u.display_name, u.nombre, u.usuario, 'Sin usuario') AS usuario_nombre,
          COUNT(mc.id)::int AS total,
          COALESCE(SUM(GREATEST(1, (COALESCE(mc.fecha_fin, CURRENT_DATE)::date - mc.fecha_inicio::date) + 1)), 0)::int AS dias,
          MAX(mc.creado_en) AS ultima
       FROM modo_calma mc
       LEFT JOIN usuarios u ON u.id = mc.usuario_id
       GROUP BY usuario_nombre
       ORDER BY dias DESC, total DESC`
    );

    const citasResumen = await pool.query(
      `SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE estado = 'pendiente')::int AS pendientes,
          COUNT(*) FILTER (WHERE estado = 'cumplida')::int AS cumplidas,
          COUNT(*) FILTER (WHERE estado = 'cancelada')::int AS canceladas,
          COUNT(*) FILTER (WHERE fecha >= CURRENT_DATE)::int AS proximas,
          MAX(fecha) AS ultima_fecha
       FROM citas`
    );

    const citasFechas = await pool.query(
      `SELECT fecha
       FROM citas
       WHERE fecha IS NOT NULL
       AND estado IN ('pendiente', 'cumplida')
       ORDER BY fecha ASC`
    );

    const accesosResumen = await pool.query(
      `SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE creado_en >= NOW() - INTERVAL '30 days')::int AS ultimos_30,
          COUNT(*) FILTER (WHERE creado_en::date = CURRENT_DATE)::int AS hoy,
          MAX(creado_en) AS ultimo
       FROM accesos_sistema`
    );

    const accesosRecientes = await pool.query(
      `SELECT
          a.id,
          a.usuario_id,
          a.usuario,
          a.nombre_visible,
          a.rol,
          a.ip,
          a.user_agent,
          a.creado_en,
          COALESCE(u.display_name, u.nombre, u.usuario, a.nombre_visible, a.usuario, 'Sin usuario') AS usuario_nombre
       FROM accesos_sistema a
       LEFT JOIN usuarios u ON u.id = a.usuario_id
       ORDER BY a.creado_en DESC
       LIMIT 20`
    );

    const accesosPorUsuario = await pool.query(
      `SELECT
          COALESCE(u.display_name, u.nombre, u.usuario, a.nombre_visible, a.usuario, 'Sin usuario') AS usuario_nombre,
          COUNT(a.id)::int AS total,
          MAX(a.creado_en) AS ultimo
       FROM accesos_sistema a
       LEFT JOIN usuarios u ON u.id = a.usuario_id
       WHERE a.creado_en >= NOW() - INTERVAL '30 days'
       GROUP BY usuario_nombre
       ORDER BY total DESC`
    );

    const promedioDiasPlanes = calcularPromedioDiasEntreFechas(citasFechas.rows.map(r => r.fecha));

    res.json({
      ok: true,
      misiones: {
        resumen: misionesResumen.rows[0] || {},
        recientes: misionesRecientes.rows,
        por_usuario: misionesPorUsuario.rows,
        por_nivel: misionesPorNivel.rows,
        por_dia: misionesPorDia.rows
      },
      calma: {
        resumen: calmaResumen.rows[0] || {},
        por_usuario: calmaPorUsuario.rows
      },
      citas: {
        resumen: {
          ...(citasResumen.rows[0] || {}),
          promedio_dias_entre_planes: promedioDiasPlanes
        }
      },
      accesos: {
        resumen: accesosResumen.rows[0] || {},
        recientes: accesosRecientes.rows,
        por_usuario: accesosPorUsuario.rows
      }
    });
  } catch (err) {
    console.error('Error GET /api/eventos/admin/resumen:', err);
    res.status(500).json({ error: 'Error al cargar panel admin' });
  }
});

// DELETE /api/eventos/admin/completadas/:id
router.delete('/admin/completadas/:id', async (req, res) => {
  const usuario_id = req.body?.usuario_id || req.query?.usuario_id;

  try {
    if (!(await esAdmin(usuario_id))) {
      return res.status(403).json({ error: 'Solo el admin puede eliminar misiones cumplidas.' });
    }

    const result = await pool.query(
      `DELETE FROM misiones_completadas
       WHERE id = $1
       RETURNING id, titulo, puntos`,
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Registro de misión no encontrado.' });
    }

    const progreso = await pool.query(
      `SELECT COALESCE(SUM(puntos), 0)::int AS total
       FROM misiones_completadas`
    );

    res.json({
      ok: true,
      eliminado: result.rows[0],
      progreso: calcularNivelRelacion(progreso.rows[0]?.total || 0)
    });
  } catch (err) {
    console.error('Error DELETE /api/eventos/admin/completadas/:id:', err);
    res.status(500).json({ error: 'Error al eliminar misión cumplida' });
  }
});

// GET /api/eventos/:id
router.get('/:id', async (req, res) => {
  try {
    const eventoResult = await pool.query(
      `SELECT
          id,
          titulo,
          tipo,
          categoria,
          nivel,
          duracion,
          descripcion,
          COALESCE(modo, 'simple') AS modo,
          instrucciones,
          fuente,
          activo,
          creado_por,
          creado_en,
          COALESCE((SELECT COUNT(*)::int FROM misiones_completadas mc WHERE mc.evento_id = eventos_preguntas.id), 0) AS completada_total
       FROM eventos_preguntas
       WHERE id = $1 AND activo = true`,
      [req.params.id]
    );

    if (!eventoResult.rows.length) {
      return res.status(404).json({ error: 'Misión no encontrada' });
    }

    const itemsResult = await pool.query(
      `SELECT id, evento_id, orden, bloque, tipo_item, contenido
       FROM evento_items
       WHERE evento_id = $1
       ORDER BY orden ASC, id ASC`,
      [req.params.id]
    );

    res.json({
      ...eventoResult.rows[0],
      puntos: puntosPorNivel(eventoResult.rows[0].nivel),
      items: itemsResult.rows
    });
  } catch (err) {
    console.error('Error GET /api/eventos/:id:', err);
    res.status(500).json({ error: 'Error al cargar la misión' });
  }
});

// POST /api/eventos/:id/completar
router.post('/:id/completar', async (req, res) => {
  const { usuario_id, comentario } = req.body || {};

  try {
    const eventoResult = await pool.query(
      `SELECT id, titulo, nivel
       FROM eventos_preguntas
       WHERE id = $1 AND activo = true`,
      [req.params.id]
    );

    if (!eventoResult.rows.length) {
      return res.status(404).json({ error: 'Misión no encontrada' });
    }

    const evento = eventoResult.rows[0];
    const nivel = validarNivel(evento.nivel);
    const puntos = puntosPorNivel(nivel);

    try {
      const insert = await pool.query(
        `INSERT INTO misiones_completadas
          (evento_id, usuario_id, titulo, nivel, puntos, comentario)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, evento_id, titulo, nivel, puntos, fecha, creado_en`,
        [evento.id, usuario_id || null, evento.titulo, nivel, puntos, normalizarTexto(comentario)]
      );

      const progreso = await pool.query(
        `SELECT COALESCE(SUM(puntos), 0)::int AS total
         FROM misiones_completadas`
      );

      return res.json({
        ok: true,
        repetida: false,
        completada: insert.rows[0],
        progreso: calcularNivelRelacion(progreso.rows[0]?.total || 0)
      });
    } catch (err) {
      if (err.code === '23505') {
        const progreso = await pool.query(
          `SELECT COALESCE(SUM(puntos), 0)::int AS total
           FROM misiones_completadas`
        );

        return res.json({
          ok: true,
          repetida: true,
          mensaje: 'Esta misión ya fue marcada como cumplida hoy por este usuario.',
          progreso: calcularNivelRelacion(progreso.rows[0]?.total || 0)
        });
      }
      throw err;
    }
  } catch (err) {
    console.error('Error POST /api/eventos/:id/completar:', err);
    res.status(500).json({ error: 'Error al completar la misión' });
  }
});

// POST /api/eventos
router.post('/', async (req, res) => {
  const {
    titulo,
    tipo,
    categoria,
    nivel,
    duracion,
    descripcion,
    modo,
    instrucciones,
    fuente,
    creado_por,
    items
  } = req.body;

  if (!normalizarTexto(titulo) || !normalizarTexto(descripcion)) {
    return res.status(400).json({ error: 'Título y descripción son obligatorios.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO eventos_preguntas
        (titulo, tipo, categoria, nivel, duracion, descripcion, modo, instrucciones, fuente, creado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        normalizarTexto(titulo),
        validarTipo(tipo),
        normalizarTexto(categoria),
        validarNivel(nivel),
        normalizarTexto(duracion),
        normalizarTexto(descripcion),
        validarModo(modo),
        normalizarTexto(instrucciones),
        normalizarTexto(fuente),
        creado_por || null
      ]
    );

    const eventoId = result.rows[0].id;
    await guardarItems(client, eventoId, items);

    await client.query('COMMIT');

    res.json({ ok: true, id: eventoId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error POST /api/eventos:', err);
    res.status(500).json({ error: 'Error al guardar la misión' });
  } finally {
    client.release();
  }
});

// PUT /api/eventos/:id
router.put('/:id', async (req, res) => {
  const {
    titulo,
    tipo,
    categoria,
    nivel,
    duracion,
    descripcion,
    modo,
    instrucciones,
    fuente,
    items
  } = req.body;

  if (!normalizarTexto(titulo) || !normalizarTexto(descripcion)) {
    return res.status(400).json({ error: 'Título y descripción son obligatorios.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE eventos_preguntas
       SET titulo = $1,
           tipo = $2,
           categoria = $3,
           nivel = $4,
           duracion = $5,
           descripcion = $6,
           modo = $7,
           instrucciones = $8,
           fuente = $9
       WHERE id = $10
       RETURNING id`,
      [
        normalizarTexto(titulo),
        validarTipo(tipo),
        normalizarTexto(categoria),
        validarNivel(nivel),
        normalizarTexto(duracion),
        normalizarTexto(descripcion),
        validarModo(modo),
        normalizarTexto(instrucciones),
        normalizarTexto(fuente),
        req.params.id
      ]
    );

    if (!result.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Misión no encontrada' });
    }

    await guardarItems(client, req.params.id, items);

    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error PUT /api/eventos:', err);
    res.status(500).json({ error: 'Error al actualizar la misión' });
  } finally {
    client.release();
  }
});

// DELETE /api/eventos/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE eventos_preguntas
       SET activo = false
       WHERE id = $1
       RETURNING id`,
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Misión no encontrada' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Error DELETE /api/eventos:', err);
    res.status(500).json({ error: 'Error al eliminar la misión' });
  }
});

module.exports = router;
