const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

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

  const faltan = actual.siguiente ? Math.max(actual.siguiente - total, 0) : 0;

  const progreso = actual.siguiente
    ? Math.min(Math.round(((total - actual.minimo) / (actual.siguiente - actual.minimo)) * 100), 100)
    : 100;

  return {
    ...actual,
    total,
    faltan,
    progreso
  };
}

function protegerAdmin(handler) {
  return [
    requireAuth,
    requireAdmin,
    async (req, res) => {
      try {
        return await handler(req, res);
      } catch (err) {
        console.error('Error admin:', err);
        return res.status(500).json({
          ok: false,
          error: 'Error en panel admin: ' + err.message
        });
      }
    }
  ];
}

function normalizarFuente(fuente) {
  const f = String(fuente || '').trim().toLowerCase();

  const permitidas = [
    'misiones',
    'coincidencias',
    'planes',
    'recuerdos',
    'playlist',
    'razones',
    'promesas',
    'cajita',
    'calma',
    'espacio',
    'ajuste_admin'
  ];

  return permitidas.includes(f) ? f : 'ajuste_admin';
}

// GET /api/admin/resumen
router.get('/resumen', ...protegerAdmin(async (req, res) => {
  const puntosResumen = await pool.query(
    `SELECT
        COALESCE(SUM(puntos), 0)::int AS puntos,
        COUNT(*)::int AS registros,
        COUNT(*) FILTER (WHERE fecha = CURRENT_DATE)::int AS hoy,
        COUNT(*) FILTER (WHERE fecha >= CURRENT_DATE - INTERVAL '7 days')::int AS ultimos_7
     FROM puntos_conexion`
  );

  const porFuente = await pool.query(
    `SELECT
        fuente,
        COUNT(*)::int AS total,
        COALESCE(SUM(puntos), 0)::int AS puntos
     FROM puntos_conexion
     GROUP BY fuente
     ORDER BY puntos DESC, total DESC`
  );

  const recientes = await pool.query(
    `SELECT
        pc.*,
        COALESCE(u.display_name, u.nombre, u.usuario, 'Sin usuario') AS usuario_nombre,
        u.rol AS usuario_rol
     FROM puntos_conexion pc
     LEFT JOIN usuarios u ON u.id = pc.usuario_id
     ORDER BY pc.creado_en DESC
     LIMIT 30`
  );

  const accesosResumen = await pool.query(
    `SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE creado_en >= NOW() - INTERVAL '30 days')::int AS ultimos_30,
        COUNT(*) FILTER (WHERE creado_en::date = CURRENT_DATE)::int AS hoy,
        MAX(creado_en) AS ultimo
     FROM accesos_sistema
     WHERE COALESCE(rol, '') <> 'admin'`
  );

  const accesosRecientes = await pool.query(
    `SELECT
        a.*,
        COALESCE(u.display_name, u.nombre, u.usuario, a.nombre_visible, a.usuario, 'Sin usuario') AS usuario_nombre
     FROM accesos_sistema a
     LEFT JOIN usuarios u ON u.id = a.usuario_id
     WHERE COALESCE(a.rol, '') <> 'admin'
     ORDER BY a.creado_en DESC
     LIMIT 30`
  );

  const accesosPorUsuario = await pool.query(
    `SELECT
        COALESCE(u.display_name, u.nombre, u.usuario, a.nombre_visible, a.usuario, 'Sin usuario') AS usuario_nombre,
        COUNT(a.id)::int AS total,
        MAX(a.creado_en) AS ultimo
     FROM accesos_sistema a
     LEFT JOIN usuarios u ON u.id = a.usuario_id
     WHERE COALESCE(a.rol, '') <> 'admin'
       AND a.creado_en >= NOW() - INTERVAL '30 days'
     GROUP BY usuario_nombre
     ORDER BY total DESC`
  );

  const usuarios = await pool.query(
    `SELECT id, usuario, nombre, display_name, rol
     FROM usuarios
     WHERE COALESCE(rol, '') <> 'admin'
     ORDER BY id ASC`
  );

  const total = puntosResumen.rows[0]?.puntos || 0;

  res.json({
    ok: true,
    puntos: {
      resumen: puntosResumen.rows[0] || {},
      nivel: calcularNivelRelacion(total),
      por_fuente: porFuente.rows,
      recientes: recientes.rows
    },
    accesos: {
      resumen: accesosResumen.rows[0] || {},
      recientes: accesosRecientes.rows,
      por_usuario: accesosPorUsuario.rows
    },
    usuarios: usuarios.rows
  });
}));

// GET /api/admin/detalle/:fuente
router.get('/detalle/:fuente', ...protegerAdmin(async (req, res) => {
  const fuente = String(req.params.fuente || '').toLowerCase();

  if (fuente === 'accesos') {
    const result = await pool.query(
      `SELECT
          a.*,
          COALESCE(u.display_name, u.nombre, u.usuario, a.nombre_visible, a.usuario, 'Sin usuario') AS usuario_nombre
       FROM accesos_sistema a
       LEFT JOIN usuarios u ON u.id = a.usuario_id
       WHERE COALESCE(a.rol, '') <> 'admin'
       ORDER BY a.creado_en DESC
       LIMIT 250`
    );

    return res.json({
      ok: true,
      tipo: 'accesos',
      items: result.rows
    });
  }

  const valores = [];
  let where = '';

  if (fuente !== 'todos') {
    valores.push(fuente);
    where = 'WHERE pc.fuente = $1';
  }

  const result = await pool.query(
    `SELECT
        pc.*,
        COALESCE(u.display_name, u.nombre, u.usuario, 'Sin usuario') AS usuario_nombre,
        u.rol AS usuario_rol
     FROM puntos_conexion pc
     LEFT JOIN usuarios u ON u.id = pc.usuario_id
     ${where}
     ORDER BY pc.creado_en DESC
     LIMIT 250`,
    valores
  );

  res.json({
    ok: true,
    tipo: fuente,
    items: result.rows
  });
}));

// POST /api/admin/ajuste
// Permite sumar o quitar puntos manualmente.
// puntos puede ser positivo o negativo.
router.post('/ajuste', ...protegerAdmin(async (req, res) => {
  const {
    usuario_afectado_id,
    puntos,
    descripcion,
    fuente
  } = req.body;

  const puntosNumero = Number(puntos);

  if (!Number.isFinite(puntosNumero) || puntosNumero === 0) {
    return res.status(400).json({
      ok: false,
      error: 'Los puntos deben ser un número diferente de 0.'
    });
  }

  const fuenteFinal = normalizarFuente(fuente || 'ajuste_admin');

  const descripcionFinal = String(descripcion || '').trim()
    || (puntosNumero > 0 ? 'Ajuste manual de puntos' : 'Descuento manual de puntos');

  const result = await pool.query(
    `INSERT INTO puntos_conexion
      (usuario_id, fuente, referencia_id, descripcion, puntos)
     VALUES ($1, $2, NULL, $3, $4)
     RETURNING *`,
    [
      usuario_afectado_id || null,
      fuenteFinal,
      descripcionFinal,
      puntosNumero
    ]
  );

  res.json({
    ok: true,
    item: result.rows[0]
  });
}));

// DELETE /api/admin/puntos/:id
// Borra un registro de puntos. Esto baja/sube el total según el registro eliminado.
router.delete('/puntos/:id', ...protegerAdmin(async (req, res) => {
  const result = await pool.query(
    `DELETE FROM puntos_conexion
     WHERE id = $1
     RETURNING *`,
    [req.params.id]
  );

  if (!result.rows.length) {
    return res.status(404).json({
      ok: false,
      error: 'Registro no encontrado.'
    });
  }

  res.json({
    ok: true,
    eliminado: result.rows[0]
  });
}));

// DELETE /api/admin/accesos/:id
// Borra un acceso individual del historial admin.
router.delete('/accesos/:id', ...protegerAdmin(async (req, res) => {
  const result = await pool.query(
    `DELETE FROM accesos_sistema
     WHERE id = $1
     RETURNING *`,
    [req.params.id]
  );

  if (!result.rows.length) {
    return res.status(404).json({
      ok: false,
      error: 'Acceso no encontrado.'
    });
  }

  res.json({
    ok: true,
    eliminado: result.rows[0]
  });
}));

module.exports = router;
