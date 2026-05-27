const express = require('express');
const router = express.Router();
const pool = require('../config/db');

/*
  SIGA — Mi espacio

  Nota para quien algún día lea esto:
  este módulo nació después de muchas pruebas, errores, frustración,
  cafés imaginarios y varios "¿por qué no funciona si ayer sí funcionaba?".

  La idea es simple:
  - Guardar para mí = privado.
  - Compartir señal = visible para ambos.
  - Copiar = no se guarda nada.

  No es vigilancia. No es diagnóstico. No es examen.
  Es solo una forma suave de decir: "estoy aquí, pero a mi ritmo".
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

async function obtenerUsuario(usuario_id) {
  if (!usuario_id) return null;

  const r = await pool.query(
    `SELECT
        id,
        usuario,
        nombre,
        rol,
        COALESCE(display_name, nombre, usuario) AS display_name
     FROM usuarios
     WHERE id = $1`,
    [usuario_id]
  );

  return r.rows[0] || null;
}

async function usuarioExiste(usuario_id) {
  const u = await obtenerUsuario(usuario_id);
  return !!u;
}

async function registrarPuntosEspacio(usuario_id, herramienta, compartido) {
  try {
    /*
      Sí, aquí también hubo sufrimiento.
      La regla: puede usar Mi espacio muchas veces, pero solo suma puntos una vez al día.
      Porque cuidar el vínculo no debería convertirse en farmear XP emocional. XD
    */

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

// GET /api/espacio/historial?usuario_id=1
router.get('/historial', async (req, res) => {
  const usuario_id = req.query.usuario_id;

  const usuario = await obtenerUsuario(usuario_id);

  if (!usuario) {
    return res.status(400).json({
      ok: false,
      error: 'Usuario no válido.'
    });
  }

  try {
    /*
      Privadas:
      Solo las ve quien las guardó.

      Compartidas:
      Las ven ambos usuarios principales: yo y ella.
      Admin también puede verlas porque admin está condenado a depurar cosas. XD
    */

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
        nombre: usuario.display_name,
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
router.post('/usar', async (req, res) => {
  const usuario_id = req.body.usuario_id;
  const herramienta = validarHerramienta(req.body.herramienta);
  const estado = String(req.body.estado || '').trim().slice(0, 80);
  const mensaje = String(req.body.mensaje || '').trim().slice(0, 600);
  const compartido = !!req.body.compartido;

  if (!(await usuarioExiste(usuario_id))) {
    return res.status(400).json({
      ok: false,
      error: 'Usuario no válido.'
    });
  }

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
