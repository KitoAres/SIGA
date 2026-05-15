
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
  const permitidos = ['suave', 'medio', 'profundo'];
  return permitidos.includes(nivel) ? nivel : 'suave';
}

function validarModo(modo) {
  const permitidos = ['simple', 'guia'];
  return permitidos.includes(modo) ? modo : 'simple';
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
    valores.push(nivel);
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
          COUNT(ei.id)::int AS total_items
       FROM eventos_preguntas e
       LEFT JOIN evento_items ei ON ei.evento_id = e.id
       WHERE ${filtros.join(' AND ')}
       GROUP BY e.id
       ORDER BY e.creado_en DESC, e.id DESC`,
      valores
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error GET /api/eventos:', err);
    res.status(500).json({ error: 'Error al cargar eventos y preguntas' });
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
    valores.push(nivel);
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
          COUNT(ei.id)::int AS total_items
       FROM eventos_preguntas e
       LEFT JOIN evento_items ei ON ei.evento_id = e.id
       WHERE ${filtros.join(' AND ')}
       GROUP BY e.id
       ORDER BY RANDOM()
       LIMIT 1`,
      valores
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'No hay ideas disponibles' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error GET /api/eventos/aleatorio:', err);
    res.status(500).json({ error: 'Error al sugerir una idea' });
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
          creado_en
       FROM eventos_preguntas
       WHERE id = $1 AND activo = true`,
      [req.params.id]
    );

    if (!eventoResult.rows.length) {
      return res.status(404).json({ error: 'Idea no encontrada' });
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
      items: itemsResult.rows
    });
  } catch (err) {
    console.error('Error GET /api/eventos/:id:', err);
    res.status(500).json({ error: 'Error al cargar la guía' });
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
    res.status(500).json({ error: 'Error al guardar la idea' });
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
      return res.status(404).json({ error: 'Idea no encontrada' });
    }

    await guardarItems(client, req.params.id, items);

    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error PUT /api/eventos:', err);
    res.status(500).json({ error: 'Error al actualizar la idea' });
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
      return res.status(404).json({ error: 'Idea no encontrada' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Error DELETE /api/eventos:', err);
    res.status(500).json({ error: 'Error al eliminar la idea' });
  }
});

module.exports = router;
