/* ============================================================
   SIGA — routes/admin.js
   Módulo: Panel admin separado
   Crear en: backend/routes/admin.js
   ============================================================ */

const express = require('express');
const router = express.Router();
const pool = require('../config/db');

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
  for (const n of niveles) if (total >= n.minimo) actual = n;

  const siguiente = actual.siguiente;
  const faltan = siguiente ? Math.max(siguiente - total, 0) : 0;
  const progreso = siguiente
    ? Math.min(Math.round(((total - actual.minimo) / (siguiente - actual.minimo)) * 100), 100)
    : 100;

  return { ...actual, total, faltan, progreso };
}

async function esAdmin(usuario_id) {
  if (!usuario_id) return false;
  const result = await pool.query(
    `SELECT id FROM usuarios WHERE id = $1 AND rol = 'admin'`,
    [usuario_id]
  );
  return result.rows.length > 0;
}

async function safeRows(nombre, sql, params = [], fallback = []) {
  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (err) {
    console.warn(`[ADMIN] ${nombre}:`, err.message);
    return fallback;
  }
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

// GET /api/admin/resumen?usuario_id=X
router.get('/resumen', async (req, res) => {
  const { usuario_id } = req.query;

  try {
    if (!(await esAdmin(usuario_id))) {
      return res.status(403).json({ error: 'Solo el admin puede ver estas estadísticas.' });
    }

    const misionesResumen = await safeRows('misiones resumen',
      `SELECT
          COUNT(*)::int AS total,
          COALESCE(SUM(puntos), 0)::int AS puntos,
          COUNT(*) FILTER (WHERE fecha >= CURRENT_DATE - INTERVAL '7 days')::int AS ultimos_7,
          COUNT(*) FILTER (WHERE fecha >= CURRENT_DATE - INTERVAL '30 days')::int AS ultimos_30
       FROM misiones_completadas`, [], [{ total: 0, puntos: 0, ultimos_7: 0, ultimos_30: 0 }]
    );

    const misionesRecientes = await safeRows('misiones recientes',
      `SELECT
          mc.id, mc.evento_id, mc.titulo, mc.nivel, mc.puntos, mc.fecha, mc.creado_en,
          mc.usuario_id,
          COALESCE(u.display_name, u.nombre, u.usuario, 'Sin usuario') AS usuario_nombre,
          u.rol AS usuario_rol
       FROM misiones_completadas mc
       LEFT JOIN usuarios u ON u.id = mc.usuario_id
       ORDER BY mc.creado_en DESC
       LIMIT 20`
    );

    const misionesPorUsuario = await safeRows('misiones por usuario',
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

    const misionesPorNivel = await safeRows('misiones por nivel',
      `SELECT nivel, COUNT(*)::int AS total, COALESCE(SUM(puntos), 0)::int AS puntos
       FROM misiones_completadas
       GROUP BY nivel
       ORDER BY CASE nivel WHEN 'facil' THEN 1 WHEN 'medio' THEN 2 WHEN 'dificil' THEN 3 WHEN 'hardcore' THEN 4 ELSE 5 END`
    );

    const calmaResumen = await safeRows('calma resumen',
      `SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE activo = true)::int AS activas,
          COALESCE(SUM(GREATEST(1, (COALESCE(fecha_fin, CURRENT_DATE)::date - fecha_inicio::date) + 1)), 0)::int AS dias_programados,
          MAX(creado_en) AS ultima
       FROM modo_calma`, [], [{ total: 0, activas: 0, dias_programados: 0, ultima: null }]
    );

    const calmaPorUsuario = await safeRows('calma por usuario',
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

    const citasResumen = await safeRows('citas resumen',
      `SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE estado = 'pendiente')::int AS pendientes,
          COUNT(*) FILTER (WHERE estado = 'cumplida')::int AS cumplidas,
          COUNT(*) FILTER (WHERE estado = 'cancelada')::int AS canceladas,
          COUNT(*) FILTER (WHERE fecha >= CURRENT_DATE)::int AS proximas,
          MAX(fecha) AS ultima_fecha
       FROM citas`, [], [{ total: 0, pendientes: 0, cumplidas: 0, canceladas: 0, proximas: 0, ultima_fecha: null }]
    );

    const citasFechas = await safeRows('citas fechas',
      `SELECT fecha FROM citas WHERE fecha IS NOT NULL AND estado IN ('pendiente', 'cumplida') ORDER BY fecha ASC`
    );

    const accesosResumen = await safeRows('accesos resumen',
      `SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE creado_en >= NOW() - INTERVAL '30 days')::int AS ultimos_30,
          COUNT(*) FILTER (WHERE creado_en::date = CURRENT_DATE)::int AS hoy,
          MAX(creado_en) AS ultimo
       FROM accesos_sistema`, [], [{ total: 0, ultimos_30: 0, hoy: 0, ultimo: null }]
    );

    const accesosRecientes = await safeRows('accesos recientes',
      `SELECT
          a.id, a.usuario_id, a.usuario, a.nombre_visible, a.rol, a.ip, a.user_agent, a.creado_en,
          COALESCE(u.display_name, u.nombre, u.usuario, a.nombre_visible, a.usuario, 'Sin usuario') AS usuario_nombre
       FROM accesos_sistema a
       LEFT JOIN usuarios u ON u.id = a.usuario_id
       ORDER BY a.creado_en DESC
       LIMIT 20`
    );

    const accesosPorUsuario = await safeRows('accesos por usuario',
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

    const puntos = misionesResumen[0]?.puntos || 0;
    const promedioDiasPlanes = calcularPromedioDiasEntreFechas(citasFechas.map(r => r.fecha));

    res.json({
      ok: true,
      progreso: {
        puntos,
        nivel: calcularNivelRelacion(puntos)
      },
      misiones: {
        resumen: misionesResumen[0] || {},
        recientes: misionesRecientes,
        por_usuario: misionesPorUsuario,
        por_nivel: misionesPorNivel
      },
      calma: {
        resumen: calmaResumen[0] || {},
        por_usuario: calmaPorUsuario
      },
      citas: {
        resumen: {
          ...(citasResumen[0] || {}),
          promedio_dias_entre_planes: promedioDiasPlanes
        }
      },
      accesos: {
        resumen: accesosResumen[0] || {},
        recientes: accesosRecientes,
        por_usuario: accesosPorUsuario
      }
    });
  } catch (err) {
    console.error('Error GET /api/admin/resumen:', err);
    res.status(500).json({ error: 'Error al cargar panel admin' });
  }
});

// DELETE /api/admin/misiones/:id?usuario_id=X
router.delete('/misiones/:id', async (req, res) => {
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
      `SELECT COALESCE(SUM(puntos), 0)::int AS total FROM misiones_completadas`
    );

    res.json({
      ok: true,
      eliminado: result.rows[0],
      progreso: calcularNivelRelacion(progreso.rows[0]?.total || 0)
    });
  } catch (err) {
    console.error('Error DELETE /api/admin/misiones/:id:', err);
    res.status(500).json({ error: 'Error al eliminar misión cumplida' });
  }
});

module.exports = router;
