/* ============================================================
   SIGA — routes/eventos.js
   Módulo: Eventos, actividades y preguntas
   Archivo nuevo para: backend/routes/eventos.js
   ============================================================ */

const express = require('express');
const router = express.Router();
const pool = require('../config/db');

function normalizarTexto(valor) {
  if (!valor) return null;
  const limpio = String(valor).trim();
  return limpio || null;
}

function validarTipo(tipo) {
  const permitidos = ['pregunta', 'actividad', 'cita', 'juego', 'detalle'];
  return permitidos.includes(tipo) ? tipo : 'pregunta';
}

function validarNivel(nivel) {
  const permitidos = ['suave', 'medio', 'profundo'];
  return permitidos.includes(nivel) ? nivel : 'suave';
}

// GET /api/eventos?q=&tipo=&nivel=
router.get('/', async (req, res) => {
  const { q, tipo, nivel } = req.query;

  const filtros = ['activo = true'];
  const valores = [];

  if (tipo) {
    valores.push(tipo);
    filtros.push(`tipo = $${valores.length}`);
  }

  if (nivel) {
    valores.push(nivel);
    filtros.push(`nivel = $${valores.length}`);
  }

  if (q) {
    valores.push(`%${q}%`);
    filtros.push(`(
      titulo ILIKE $${valores.length}
      OR descripcion ILIKE $${valores.length}
      OR categoria ILIKE $${valores.length}
    )`);
  }

  try {
    const result = await pool.query(
      `SELECT
          id,
          titulo,
          tipo,
          categoria,
          nivel,
          duracion,
          descripcion,
          activo,
          creado_por,
          creado_en
       FROM eventos_preguntas
       WHERE ${filtros.join(' AND ')}
       ORDER BY creado_en DESC, id DESC`,
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

  const filtros = ['activo = true'];
  const valores = [];

  if (tipo) {
    valores.push(tipo);
    filtros.push(`tipo = $${valores.length}`);
  }

  if (nivel) {
    valores.push(nivel);
    filtros.push(`nivel = $${valores.length}`);
  }

  try {
    const result = await pool.query(
      `SELECT
          id,
          titulo,
          tipo,
          categoria,
          nivel,
          duracion,
          descripcion,
          activo,
          creado_por,
          creado_en
       FROM eventos_preguntas
       WHERE ${filtros.join(' AND ')}
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

// POST /api/eventos
router.post('/', async (req, res) => {
  const {
    titulo,
    tipo,
    categoria,
    nivel,
    duracion,
    descripcion,
    creado_por
  } = req.body;

  if (!normalizarTexto(titulo) || !normalizarTexto(descripcion)) {
    return res.status(400).json({ error: 'Título y descripción son obligatorios.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO eventos_preguntas
        (titulo, tipo, categoria, nivel, duracion, descripcion, creado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        normalizarTexto(titulo),
        validarTipo(tipo),
        normalizarTexto(categoria),
        validarNivel(nivel),
        normalizarTexto(duracion),
        normalizarTexto(descripcion),
        creado_por || null
      ]
    );

    res.json({
      id: result.rows[0].id,
      titulo: normalizarTexto(titulo),
      tipo: validarTipo(tipo),
      categoria: normalizarTexto(categoria),
      nivel: validarNivel(nivel),
      duracion: normalizarTexto(duracion),
      descripcion: normalizarTexto(descripcion),
      creado_por: creado_por || null
    });
  } catch (err) {
    console.error('Error POST /api/eventos:', err);
    res.status(500).json({ error: 'Error al guardar la idea' });
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
    descripcion
  } = req.body;

  if (!normalizarTexto(titulo) || !normalizarTexto(descripcion)) {
    return res.status(400).json({ error: 'Título y descripción son obligatorios.' });
  }

  try {
    const result = await pool.query(
      `UPDATE eventos_preguntas
       SET titulo = $1,
           tipo = $2,
           categoria = $3,
           nivel = $4,
           duracion = $5,
           descripcion = $6
       WHERE id = $7
       RETURNING id`,
      [
        normalizarTexto(titulo),
        validarTipo(tipo),
        normalizarTexto(categoria),
        validarNivel(nivel),
        normalizarTexto(duracion),
        normalizarTexto(descripcion),
        req.params.id
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Idea no encontrada' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Error PUT /api/eventos:', err);
    res.status(500).json({ error: 'Error al actualizar la idea' });
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
