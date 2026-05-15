/* ============================================================
   SIGA — routes/eventos.js
   Módulo: Misiones de conexión + gamificación
   Reemplaza: backend/routes/eventos.js
   ============================================================ */

const express = require('express');
const router = express.Router();
const pool = require('../config/db');

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

function calcularNivelRelacion(total) {
  const niveles = [
    { nivel: 1, nombre: 'Primeros destellos', minimo: 0, siguiente: 100, emoji: '✨' },
    { nivel: 2, nombre: 'Coincidencia bonita', minimo: 100, siguiente: 250, emoji: '💫' },
    { nivel: 3, nombre: 'Ritmo propio', minimo: 250, siguiente: 500, emoji: '🌙' },
    { nivel: 4, nombre: 'Cuidado mutuo', minimo: 500, siguiente: 850, emoji: '💜' },
    { nivel: 5, nombre: 'Historia compartida', minimo: 850, siguiente: 1300, emoji: '📖' },
    { nivel: 6, nombre: 'Vínculo fuerte', minimo: 1300, siguiente: 2000, emoji: '🏆' },
    { nivel: 7, nombre: 'Modo legendario', minimo: 2000, siguiente: 3000, emoji: '👑' },
    { nivel: 8, nombre: 'Universo propio', minimo: 3000, siguiente: null, emoji: '🌌' }
  ];

  let actual = niveles[0];
  for (const n of niveles) {
    if (total >= n.minimo) actual = n;
  }

  const siguiente = actual.siguiente;
  const faltan = siguiente ? Math.max(siguiente - total, 0) : 0;
  const progreso = siguiente
    ? Math.min(Math.round(((total - actual.minimo) / (siguiente - actual.minimo)) * 100), 100)
    : 100;

  return { ...actual, total, faltan, progreso };
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
