const jwt = require('jsonwebtoken');
const pool = require('../config/db');

function getToken(req) {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) return authHeader.slice(7);
  return null;
}

async function requireAuth(req, res, next) {
  try {
    const token = getToken(req);

    if (!token) {
      return res.status(401).json({
        ok: false,
        error: 'Sesión no válida. Vuelve a iniciar sesión.'
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('Falta JWT_SECRET en variables de entorno');
      return res.status(500).json({
        ok: false,
        error: 'Falta configurar seguridad del servidor.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      `SELECT
          id,
          usuario,
          nombre,
          rol,
          COALESCE(display_name,nombre,usuario) AS display_name,
          COALESCE(color_perfil,'#22d3ee') AS color_perfil
       FROM usuarios
       WHERE id=$1`,
      [decoded.id]
    );

    if (!result.rows.length) {
      return res.status(401).json({
        ok: false,
        error: 'Usuario no encontrado.'
      });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    console.error('ERROR AUTH MIDDLEWARE:', err.message);
    return res.status(401).json({
      ok: false,
      error: 'Sesión expirada o inválida. Vuelve a iniciar sesión.'
    });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.rol !== 'admin') {
    return res.status(403).json({
      ok: false,
      error: 'No tienes permiso para esta acción.'
    });
  }

  next();
}

module.exports = {
  requireAuth,
  requireAdmin
};
