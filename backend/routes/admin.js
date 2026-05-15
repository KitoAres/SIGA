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
  const faltan = actual.siguiente ? Math.max(actual.siguiente - total, 0) : 0;
  const progreso = actual.siguiente ? Math.min(Math.round(((total - actual.minimo) / (actual.siguiente - actual.minimo)) * 100), 100) : 100;
  return { ...actual, total, faltan, progreso };
}

async function esAdmin(usuario_id) {
  if (!usuario_id) return false;
  const r = await pool.query(`SELECT id FROM usuarios WHERE id=$1 AND rol='admin'`, [usuario_id]);
  return r.rows.length > 0;
}

function asegurarAdmin(handler) {
  return async (req, res) => {
    const usuario_id = req.query.usuario_id || req.body?.usuario_id;
    try {
      if (!(await esAdmin(usuario_id))) return res.status(403).json({ ok:false, error:'Solo admin.' });
      return handler(req, res);
    } catch (err) {
      console.error('Error admin:', err);
      return res.status(500).json({ ok:false, error:'Error al cargar panel admin' });
    }
  };
}

router.get('/resumen', asegurarAdmin(async (req, res) => {
  const puntosResumen = await pool.query(`SELECT COALESCE(SUM(puntos),0)::int AS puntos, COUNT(*)::int AS registros, COUNT(*) FILTER (WHERE fecha=CURRENT_DATE)::int AS hoy, COUNT(*) FILTER (WHERE fecha>=CURRENT_DATE-INTERVAL '7 days')::int AS ultimos_7 FROM puntos_conexion`);
  const porFuente = await pool.query(`SELECT fuente, COUNT(*)::int AS total, COALESCE(SUM(puntos),0)::int AS puntos FROM puntos_conexion GROUP BY fuente ORDER BY puntos DESC, total DESC`);
  const recientes = await pool.query(`SELECT pc.*, COALESCE(u.display_name,u.nombre,u.usuario) AS usuario_nombre FROM puntos_conexion pc LEFT JOIN usuarios u ON u.id=pc.usuario_id ORDER BY pc.creado_en DESC LIMIT 20`);
  const accesosResumen = await pool.query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE creado_en>=NOW()-INTERVAL '30 days')::int AS ultimos_30, COUNT(*) FILTER (WHERE creado_en::date=CURRENT_DATE)::int AS hoy, MAX(creado_en) AS ultimo FROM accesos_sistema WHERE COALESCE(rol,'') <> 'admin'`);
  const accesosRecientes = await pool.query(`SELECT a.*, COALESCE(u.display_name,u.nombre,u.usuario,a.nombre_visible,a.usuario) AS usuario_nombre FROM accesos_sistema a LEFT JOIN usuarios u ON u.id=a.usuario_id WHERE COALESCE(a.rol,'') <> 'admin' ORDER BY a.creado_en DESC LIMIT 20`);
  const accesosPorUsuario = await pool.query(`SELECT COALESCE(u.display_name,u.nombre,u.usuario,a.nombre_visible,a.usuario,'Sin usuario') AS usuario_nombre, COUNT(a.id)::int AS total, MAX(a.creado_en) AS ultimo FROM accesos_sistema a LEFT JOIN usuarios u ON u.id=a.usuario_id WHERE COALESCE(a.rol,'') <> 'admin' AND a.creado_en>=NOW()-INTERVAL '30 days' GROUP BY usuario_nombre ORDER BY total DESC`);
  const total = puntosResumen.rows[0]?.puntos || 0;
  res.json({ ok:true, puntos:{ resumen:puntosResumen.rows[0]||{}, nivel:calcularNivelRelacion(total), por_fuente:porFuente.rows, recientes:recientes.rows }, accesos:{ resumen:accesosResumen.rows[0]||{}, recientes:accesosRecientes.rows, por_usuario:accesosPorUsuario.rows } });
}));

router.get('/detalle/:fuente', asegurarAdmin(async (req, res) => {
  const fuente = String(req.params.fuente || '').toLowerCase();
  if (fuente === 'accesos') {
    const r = await pool.query(`SELECT a.*, COALESCE(u.display_name,u.nombre,u.usuario,a.nombre_visible,a.usuario) AS usuario_nombre FROM accesos_sistema a LEFT JOIN usuarios u ON u.id=a.usuario_id WHERE COALESCE(a.rol,'') <> 'admin' ORDER BY a.creado_en DESC LIMIT 200`);
    return res.json({ ok:true, tipo:'accesos', items:r.rows });
  }
  const valores = [];
  let where = '';
  if (fuente !== 'todos') { valores.push(fuente); where = 'WHERE pc.fuente=$1'; }
  const r = await pool.query(`SELECT pc.*, COALESCE(u.display_name,u.nombre,u.usuario) AS usuario_nombre FROM puntos_conexion pc LEFT JOIN usuarios u ON u.id=pc.usuario_id ${where} ORDER BY pc.creado_en DESC LIMIT 250`, valores);
  res.json({ ok:true, tipo:fuente, items:r.rows });
}));

router.delete('/puntos/:id', asegurarAdmin(async (req, res) => {
  const r = await pool.query(`DELETE FROM puntos_conexion WHERE id=$1 RETURNING *`, [req.params.id]);
  if (!r.rows.length) return res.status(404).json({ ok:false, error:'Registro no encontrado.' });
  res.json({ ok:true, eliminado:r.rows[0] });
}));

module.exports = router;
