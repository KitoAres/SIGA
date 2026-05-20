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

router.get('/progreso', async (req, res) => {
  try {
    const resumen = await pool.query(`SELECT COALESCE(SUM(puntos),0)::int AS puntos, COUNT(*)::int AS registros, COUNT(*) FILTER (WHERE fecha=CURRENT_DATE)::int AS hoy FROM puntos_conexion`);
    const porFuente = await pool.query(`SELECT fuente, COUNT(*)::int AS total, COALESCE(SUM(puntos),0)::int AS puntos FROM puntos_conexion GROUP BY fuente ORDER BY puntos DESC, total DESC`);
    const recientes = await pool.query(`SELECT id, fuente, accion, descripcion, puntos, fecha, creado_en FROM puntos_conexion ORDER BY creado_en DESC LIMIT 10`);
    const total = resumen.rows[0]?.puntos || 0;
    res.json({ ok:true, puntos: total, registros: resumen.rows[0]?.registros || 0, hoy: resumen.rows[0]?.hoy || 0, nivel: calcularNivelRelacion(total), por_fuente: porFuente.rows, recientes: recientes.rows });
  } catch (err) {
    console.error('Error GET /api/puntos/progreso:', err);
    res.status(500).json({ ok:false, error:'Error al cargar puntos de conexión' });
  }
});

module.exports = router;
