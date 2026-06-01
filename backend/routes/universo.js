/* ======================================================
   🌌 EL UNIVERSO DEL VÍNCULO — Routes
   Integrado con datos reales de SIGA.
   No rompe nada existente. Lee de tablas ya creadas.
   ====================================================== */

const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

/* ─── GET /api/universo ───────────────────────────────────
   Devuelve el estado completo del universo:
   conteos de cada módulo + energía total calculada.
   ────────────────────────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const [
      recuerdos,
      playlist,
      carta,
      razones,
      promesas,
      señales,
      eventos,
      dias
    ] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS n FROM recuerdos'),
      pool.query('SELECT COUNT(*)::int AS n FROM playlist'),
      pool.query('SELECT contenido FROM carta LIMIT 1'),
      pool.query('SELECT COUNT(*)::int AS n FROM razones'),
      pool.query('SELECT COUNT(*)::int AS n FROM promesas'),
      pool.query("SELECT COUNT(*)::int AS n FROM espacio_registros WHERE herramienta = 'señal'").catch(() => ({ rows: [{ n: 0 }] })),
      pool.query("SELECT COUNT(*)::int AS n FROM eventos_completados"),
      pool.query("SELECT EXTRACT(DAY FROM NOW() - fecha_inicio::timestamp)::int AS dias FROM config_amor LIMIT 1")
    ]);

    const nRecuerdos  = recuerdos.rows[0]?.n  || 0;
    const nPlaylist   = playlist.rows[0]?.n   || 0;
    const nRazones    = razones.rows[0]?.n    || 0;
    const nPromesas   = promesas.rows[0]?.n   || 0;
    const nSenales    = señales.rows[0]?.n    || 0;
    const nEventos    = eventos.rows[0]?.n    || 0;
    const nDias       = dias.rows[0]?.dias    || 0;
    const tieneCarta  = !!(carta.rows[0]?.contenido?.trim());

    // Energía del núcleo: suma ponderada de actividad
    const energia = Math.min(100, Math.floor(
      nRecuerdos  * 4 +
      nPlaylist   * 3 +
      nRazones    * 3 +
      nPromesas   * 5 +
      nSenales    * 2 +
      nEventos    * 2 +
      (tieneCarta ? 10 : 0) +
      Math.floor(nDias / 10)
    ));

    res.json({
      ok: true,
      datos: {
        nodos: {
          islas:      { nombre: 'Isla del Primer Encuentro', icono: '🪐', energia: nRecuerdos,  items: nRecuerdos },
          bosque:     { nombre: 'Bosque de las Canciones',   icono: '🎵', energia: nPlaylist,   items: nPlaylist  },
          biblioteca: { nombre: 'Biblioteca de Secretos',    icono: '📚', energia: tieneCarta ? 1 : 0, items: tieneCarta ? 1 : 0 },
          puertas:    { nombre: 'Puerta del Futuro',          icono: '🚪', energia: nPromesas,   items: nPromesas  },
          rincon:     { nombre: 'Rincón de la Calma',         icono: '🌙', energia: 1,           items: 1          },
          constelaciones: { nombre: 'Constelaciones',         icono: '✨', energia: nRazones,    items: nRazones   },
          puentes:    { nombre: 'Puentes de encuentro',       icono: '🌉', energia: nSenales,    items: nSenales   }
        },
        nucleo: {
          energia,
          dias: nDias,
          eventos: nEventos
        }
      }
    });
  } catch (err) {
    console.error('Universo error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* ─── GET /api/universo/eventos ──────────────────────────
   Eventos dinámicos procedurales (cometas, ecos, etc.)
   ────────────────────────────────────────────────────── */
router.get('/eventos', async (req, res) => {
  try {
    const ahora     = new Date();
    const horaNum   = ahora.getHours();
    const diaSemana = ahora.getDay();

    // Eventos del calendario SIGA próximos
    const proximoResult = await pool.query(`
      SELECT titulo, fecha FROM citas
      WHERE fecha >= CURRENT_DATE AND estado = 'pendiente'
      ORDER BY fecha ASC LIMIT 3
    `).catch(() => ({ rows: [] }));

    const eventosActivos = [];

    // Noche tranquila: 22:00 – 06:00
    if (horaNum >= 22 || horaNum < 6) {
      eventosActivos.push({
        tipo:  'noche_tranquila',
        icono: '🌙',
        titulo: 'Noche tranquila',
        descripcion: 'El universo descansa. Todo está en calma.',
        duracion_h: null
      });
    }

    // Cometa de coincidencia: lunes o cuando sea día especial (día 14, aniversario)
    if (diaSemana === 1 || ahora.getDate() === 14) {
      eventosActivos.push({
        tipo:  'cometa',
        icono: '☄️',
        titulo: 'Cometa de coincidencia',
        descripcion: 'Hoy hay algo especial en el universo.',
        duracion_h: 24
      });
    }

    // Mañana con aurora: 07:00 – 11:00
    if (horaNum >= 7 && horaNum < 11) {
      eventosActivos.push({
        tipo:  'aurora',
        icono: '🌅',
        titulo: 'Aurora en el bosque',
        descripcion: 'El bosque de canciones brilla esta mañana.',
        duracion_h: 4
      });
    }

    // Próximas citas del calendario como eventos
    for (const cita of proximoResult.rows) {
      const fechaCita = new Date(cita.fecha);
      const diffDias  = Math.ceil((fechaCita - ahora) / (1000 * 60 * 60 * 24));
      if (diffDias <= 7) {
        eventosActivos.push({
          tipo:  'plan_proximo',
          icono: '📅',
          titulo: `Plan: ${cita.titulo}`,
          descripcion: `En ${diffDias} día${diffDias !== 1 ? 's' : ''}.`,
          duracion_h: null
        });
      }
    }

    res.json({ ok: true, eventos: eventosActivos });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* ─── GET /api/universo/nodo/:id ─────────────────────────
   Devuelve datos reales para el modal de un nodo.
   ────────────────────────────────────────────────────── */
router.get('/nodo/:id', async (req, res) => {
  const { id } = req.params;

  try {
    let datos = {};

    switch (id) {
      case 'islas': {
        const r = await pool.query(
          'SELECT id, titulo, descripcion, fecha FROM recuerdos ORDER BY id DESC LIMIT 5'
        );
        datos = { items: r.rows };
        break;
      }
      case 'bosque': {
        const r = await pool.query(
          'SELECT id, titulo, artista, enlace, frase FROM playlist ORDER BY id DESC LIMIT 8'
        );
        datos = { items: r.rows };
        break;
      }
      case 'biblioteca': {
        const r = await pool.query('SELECT contenido FROM carta LIMIT 1');
        datos = { contenido: r.rows[0]?.contenido || '' };
        break;
      }
      case 'puertas': {
        const r = await pool.query('SELECT id, texto FROM promesas ORDER BY id ASC LIMIT 10');
        datos = { items: r.rows };
        break;
      }
      case 'constelaciones': {
        const r = await pool.query('SELECT id, texto FROM razones ORDER BY id ASC LIMIT 10');
        datos = { items: r.rows };
        break;
      }
      case 'rincon': {
        const r = await pool.query(
          "SELECT mensaje, compartido, creado_en FROM espacio_registros WHERE compartido = true ORDER BY creado_en DESC LIMIT 5"
        ).catch(() => ({ rows: [] }));
        datos = { items: r.rows };
        break;
      }
      case 'puentes': {
        const r = await pool.query(
          "SELECT u.nombre, t.fecha, t.hora_inicio, t.hora_fin FROM tiempo_disponibilidad t JOIN usuarios u ON u.id = t.usuario_id WHERE t.fecha >= CURRENT_DATE ORDER BY t.fecha ASC LIMIT 6"
        ).catch(() => ({ rows: [] }));
        datos = { items: r.rows };
        break;
      }
      default:
        return res.status(404).json({ ok: false, error: 'Nodo desconocido' });
    }

    res.json({ ok: true, nodo: id, datos });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* ─── GET /api/universo/sigy ─────────────────────────────
   Genera un mensaje contextual de SIGy para el universo.
   ────────────────────────────────────────────────────── */
router.get('/sigy', async (req, res) => {
  try {
    const [diasR, recR, playR] = await Promise.all([
      pool.query("SELECT EXTRACT(DAY FROM NOW() - fecha_inicio::timestamp)::int AS d FROM config_amor LIMIT 1"),
      pool.query("SELECT COUNT(*)::int AS n FROM recuerdos"),
      pool.query("SELECT COUNT(*)::int AS n FROM playlist")
    ]);

    const dias     = diasR.rows[0]?.d  || 0;
    const nRec     = recR.rows[0]?.n   || 0;
    const nPlay    = playR.rows[0]?.n  || 0;
    const hora     = new Date().getHours();

    const mensajes = [
      `Llevan ${dias} días construyendo este universo juntos.`,
      `Hay ${nRec} recuerdo${nRec !== 1 ? 's' : ''} guardado${nRec !== 1 ? 's' : ''} en las islas.`,
      `El bosque tiene ${nPlay} canción${nPlay !== 1 ? 'es' : ''}.`,
      hora < 12  ? 'Buenos días. El universo está tranquilo esta mañana.' :
      hora < 18  ? 'La tarde tiene una luz bonita hoy.' :
                   'La noche cae suave sobre el universo.',
      'Pueden volver cuando quieran. Aquí siempre hay algo.',
      'Hay una puerta brillando más de lo normal.',
      'Encontré una luz nueva en la Biblioteca.',
      'Hoy el universo está tranquilo.',
      'Todo lo que vivieron también existe aquí.'
    ];

    const indice  = (dias + new Date().getMinutes()) % mensajes.length;
    const mensaje = mensajes[indice];

    res.json({ ok: true, mensaje });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message, mensaje: 'Todo lo que vivieron también existe aquí.' });
  }
});

module.exports = router;
