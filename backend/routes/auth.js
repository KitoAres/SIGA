const express = require('express');
const router = express.Router();
const pool = require('../config/db');

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
    const [rows] = await pool.query(
      `SELECT 
        id, 
        usuario, 
        nombre, 
        rol,
        COALESCE(display_name, nombre, usuario) AS display_name,
        COALESCE(color_perfil, '#22d3ee') AS color_perfil
       FROM usuarios 
       WHERE usuario = ? AND contrasena = ?`,
      [usuario, contrasena]
    );

    if (rows.length === 0) {
      return res.status(401).json({ 
        ok: false,
        error: 'Credenciales incorrectas' 
      });
    }

    const u = rows[0];

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
    const [rows] = await pool.query(
      `SELECT 
        id,
        usuario,
        nombre,
        rol,
        COALESCE(display_name, nombre, usuario) AS display_name,
        COALESCE(color_perfil, '#22d3ee') AS color_perfil
       FROM usuarios
       WHERE id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      ok: true,
      usuario: rows[0]
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
    const [actualRows] = await pool.query(
      'SELECT id, contrasena FROM usuarios WHERE id = ?',
      [req.params.id]
    );

    if (actualRows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Usuario no encontrado'
      });
    }

    const actual = actualRows[0];

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

    const [duplicado] = await pool.query(
      'SELECT id FROM usuarios WHERE usuario = ? AND id <> ?',
      [usuario.trim(), req.params.id]
    );

    if (duplicado.length > 0) {
      return res.status(409).json({
        ok: false,
        error: 'Ese usuario ya está en uso'
      });
    }

    if (nueva_contrasena && nueva_contrasena.trim() !== '') {
      await pool.query(
        `UPDATE usuarios
         SET usuario = ?,
             nombre = ?,
             display_name = ?,
             color_perfil = ?,
             contrasena = ?
         WHERE id = ?`,
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
         SET usuario = ?,
             nombre = ?,
             display_name = ?,
             color_perfil = ?
         WHERE id = ?`,
        [
          usuario.trim(),
          nombre.trim(),
          (display_name || nombre || usuario).trim(),
          color_perfil || '#22d3ee',
          req.params.id
        ]
      );
    }

    const [rows] = await pool.query(
      `SELECT 
        id,
        usuario,
        nombre,
        rol,
        COALESCE(display_name, nombre, usuario) AS display_name,
        COALESCE(color_perfil, '#22d3ee') AS color_perfil
       FROM usuarios
       WHERE id = ?`,
      [req.params.id]
    );

    res.json({
      ok: true,
      message: 'Perfil actualizado correctamente',
      usuario: rows[0]
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
