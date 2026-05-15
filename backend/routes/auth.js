const express = require('express');
const router = express.Router();
const pool = require('../config/db');

async function registrarAcceso(req, usuario) {
  try {
    const ipRaw = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;
    const ip = ipRaw ? String(ipRaw).split(',')[0].trim() : null;
    const userAgent = req.headers['user-agent'] || null;

    await pool.query(
      `INSERT INTO accesos_sistema
        (usuario_id, usuario, nombre_visible, rol, ip, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        usuario.id,
        usuario.usuario,
        usuario.display_name || usuario.nombre || usuario.usuario,
        usuario.rol,
        ip,
        userAgent
      ]
    );
  } catch (err) {
    console.warn('No se pudo registrar acceso:', err.message);
  }
}


// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { usuario, contrasena } = req.body;

  if (!usuario || !contrasena) {
    return res.status(400).json({ 
      ok: false,
      error: 'Faltan credenciales' 
    });
  }

  try {
    const result = await pool.query(
      `SELECT 
        id, 
        usuario, 
        nombre, 
        rol,
        COALESCE(display_name, nombre, usuario) AS display_name,
        COALESCE(color_perfil, '#22d3ee') AS color_perfil
       FROM usuarios 
       WHERE usuario = $1 AND contrasena = $2`,
      [usuario, contrasena]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        ok: false,
        error: 'Credenciales incorrectas' 
      });
    }

    const u = result.rows[0];

    await registrarAcceso(req, u);

    res.json({ 
      ok: true, 
      usuario_id: u.id,
      id: u.id,
      usuario: u.usuario,
      nombre: u.nombre,
      display_name: u.display_name,
      color_perfil: u.color_perfil,
      rol: u.rol 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      ok: false,
      error: 'Error del servidor' 
    });
  }
});

// GET /api/auth/perfil/:id
router.get('/perfil/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id,
        usuario,
        nombre,
        rol,
        COALESCE(display_name, nombre, usuario) AS display_name,
        COALESCE(color_perfil, '#22d3ee') AS color_perfil
       FROM usuarios
       WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      ok: true,
      usuario: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      error: 'Error al obtener perfil'
    });
  }
});

// PUT /api/auth/perfil/:id
router.put('/perfil/:id', async (req, res) => {
  const { usuario, nombre, display_name, color_perfil, contrasena_actual, nueva_contrasena } = req.body;

  if (!usuario || !usuario.trim()) {
    return res.status(400).json({
      ok: false,
      error: 'El usuario no puede estar vacío'
    });
  }

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({
      ok: false,
      error: 'El nombre no puede estar vacío'
    });
  }

  try {
    const actualResult = await pool.query(
      'SELECT id, contrasena FROM usuarios WHERE id = $1',
      [req.params.id]
    );

    if (actualResult.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Usuario no encontrado'
      });
    }

    const actual = actualResult.rows[0];

    if (nueva_contrasena && nueva_contrasena.trim() !== '') {
      if (!contrasena_actual || contrasena_actual.trim() === '') {
        return res.status(400).json({
          ok: false,
          error: 'Debes escribir tu contraseña actual para cambiarla'
        });
      }

      if (contrasena_actual !== actual.contrasena) {
        return res.status(401).json({
          ok: false,
          error: 'La contraseña actual no es correcta'
        });
      }
    }

    const duplicadoResult = await pool.query(
      'SELECT id FROM usuarios WHERE usuario = $1 AND id <> $2',
      [usuario.trim(), req.params.id]
    );

    if (duplicadoResult.rows.length > 0) {
      return res.status(409).json({
        ok: false,
        error: 'Ese usuario ya está en uso'
      });
    }

    if (nueva_contrasena && nueva_contrasena.trim() !== '') {
      await pool.query(
        `UPDATE usuarios
         SET usuario = $1,
             nombre = $2,
             display_name = $3,
             color_perfil = $4,
             contrasena = $5
         WHERE id = $6`,
        [
          usuario.trim(),
          nombre.trim(),
          (display_name || nombre || usuario).trim(),
          color_perfil || '#22d3ee',
          nueva_contrasena.trim(),
          req.params.id
        ]
      );
    } else {
      await pool.query(
        `UPDATE usuarios
         SET usuario = $1,
             nombre = $2,
             display_name = $3,
             color_perfil = $4
         WHERE id = $5`,
        [
          usuario.trim(),
          nombre.trim(),
          (display_name || nombre || usuario).trim(),
          color_perfil || '#22d3ee',
          req.params.id
        ]
      );
    }

    const finalResult = await pool.query(
      `SELECT 
        id,
        usuario,
        nombre,
        rol,
        COALESCE(display_name, nombre, usuario) AS display_name,
        COALESCE(color_perfil, '#22d3ee') AS color_perfil
       FROM usuarios
       WHERE id = $1`,
      [req.params.id]
    );

    res.json({
      ok: true,
      message: 'Perfil actualizado correctamente',
      usuario: finalResult.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      error: 'Error al actualizar perfil'
    });
  }
});

module.exports = router;
 
