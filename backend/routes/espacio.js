const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

/*
  SIGA — Mi espacio seguro

  Regla nueva de seguridad:
  - El frontend ya NO decide qué usuario guarda/carga.
  - El backend usa req.user.id desde el token JWT.
  - Así nadie puede mandar usuario_id falso desde consola.

  Reglas emocionales:
  - Guardar para mí = privado.
  - Compartir señal = visible para ambos.
  - Copiar = no se guarda nada.
*/

const HERRAMIENTAS = {
  semaforo: 'Semáforo emocional',
  senal_minima: 'Señal mínima',
  pausa: 'Pausa antes de responder',
  grounding_54321: '5, 4, 3, 2, 1',
  volver_calma: 'Volver con calma',
  quejas_anhelos: 'Quejas y anhelos',
  caja_recursos: 'Caja de recursos'
};

function validarHerramienta(herramienta) {
  const key = String(herramienta || '').trim();
  return HERRAMIENTAS[key] ? key : 'senal_minima';
}

async function registrarPuntosEspacio(usuario_id, herramienta, compartido) {
  try {
    const yaTiene = await pool.query(
      `SELECT id
       FROM puntos_conexion
       WHERE usuario_id = $1
         AND fuente = 'espacio'
         AND creado_en::date = CURRENT_DATE
       LIMIT 1`,
      [usuario_id]
    );

    if (yaTiene.rows.length) return 0;

    const puntos = compartido ? 10 : 5;
    const nombre = HERRAMIENTAS[herramienta] || 'Mi espacio';

    await pool.query(
      `INSERT INTO puntos_conexion
        (usuario_id, fuente, referencia_id, descripcion, puntos)
       VALUES ($1, 'espacio', NULL, $2, $3)`,
      [usuario_id, `Mi espacio: ${nombre}`, puntos]
    );

    return puntos;
  } catch (err) {
    console.warn('No se pudieron registrar puntos de Mi espacio:', err.message);
    return 0;
  }
}

// GET /api/espacio/historial
// Ya no recibe usuario_id. Usa el usuario real del token.
router.get('/historial', requireAuth, async (req, res) => {
  const usuario_id = req.user.id;
  const usuario = req.user;

  try {
    const privadas = await pool.query(
      `SELECT
          e.id,
          e.usuario_id,
          e.herramienta,
          e.estado,
          e.mensaje,
          e.compartido,
          e.puntos_otorgados,
          e.creado_en,
          u.usuario,
          u.rol,
          COALESCE(u.display_name, u.nombre, u.usuario) AS nombre_visible
       FROM espacio_personal_registros e
       LEFT JOIN usuarios u ON u.id = e.usuario_id
       WHERE e.usuario_id = $1
         AND COALESCE(e.compartido, false) = false
       ORDER BY e.creado_en DESC
       LIMIT 20`,
      [usuario_id]
    );

    const compartidas = await pool.query(
      `SELECT
          e.id,
          e.usuario_id,
          e.herramienta,
          e.estado,
          e.mensaje,
          e.compartido,
          e.puntos_otorgados,
          e.creado_en,
          u.usuario,
          u.rol,
          COALESCE(u.display_name, u.nombre, u.usuario) AS nombre_visible
       FROM espacio_personal_registros e
       LEFT JOIN usuarios u ON u.id = e.usuario_id
       WHERE COALESCE(e.compartido, false) = true
         AND u.rol IN ('yo', 'ella')
       ORDER BY e.creado_en DESC
       LIMIT 20`
    );

    res.json({
      ok: true,
      usuario: {
        id: usuario.id,
        usuario: usuario.usuario,
        nombre: usuario.display_name || usuario.nombre || usuario.usuario,
        rol: usuario.rol
      },
      privadas: privadas.rows,
      compartidas: compartidas.rows
    });
  } catch (err) {
    console.error('Error GET /api/espacio/historial:', err);

    res.status(500).json({
      ok: false,
      error: 'Error al cargar Mi espacio.'
    });
  }
});

// POST /api/espacio/usar
// Ya no acepta usuario_id desde el navegador. Usa req.user.id.
router.post('/usar', requireAuth, async (req, res) => {
  const usuario_id = req.user.id;
  const herramienta = validarHerramienta(req.body.herramienta);
  const estado = String(req.body.estado || '').trim().slice(0, 80);
  const mensaje = String(req.body.mensaje || '').trim().slice(0, 600);
  const compartido = !!req.body.compartido;

  if (!mensaje) {
    return res.status(400).json({
      ok: false,
      error: 'El mensaje no puede estar vacío.'
    });
  }

  try {
    const insert = await pool.query(
      `INSERT INTO espacio_personal_registros
        (usuario_id, herramienta, estado, mensaje, compartido)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, usuario_id, herramienta, estado, mensaje, compartido, creado_en`,
      [usuario_id, herramienta, estado || null, mensaje, compartido]
    );

    const puntos = await registrarPuntosEspacio(usuario_id, herramienta, compartido);

    res.json({
      ok: true,
      item: insert.rows[0],
      puntos_otorgados: puntos,
      mensaje_bonito: compartido
        ? (
            puntos > 0
              ? `Señal compartida. Cuidar el vínculo también suma. +${puntos} pts 🌿`
              : 'Señal compartida. Hoy ya se sumaron puntos por Mi espacio, pero igual cuenta.'
          )
        : (
            puntos > 0
              ? `Guardado solo para ti. Cuidarte también importa. +${puntos} pts 🌿`
              : 'Guardado solo para ti. Hoy ya se sumaron puntos por Mi espacio, pero igual cuenta.'
          )
    });
  } catch (err) {
    console.error('Error POST /api/espacio/usar:', err);

    res.status(500).json({
      ok: false,
      error: 'Error al guardar herramienta.'
    });
  }
});

module.exports = router;
