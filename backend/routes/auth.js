const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { usuario, contrasena } = req.body;
  if (!usuario || !contrasena)
    return res.status(400).json({ error: 'Faltan credenciales' });
  try {
    const [rows] = await pool.query(
      'SELECT id, usuario, nombre, rol FROM usuarios WHERE usuario = ? AND contrasena = ?',
      [usuario, contrasena]
    );
    if (rows.length === 0)
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    const u = rows[0];
    res.json({ ok: true, usuario_id: u.id, nombre: u.nombre, rol: u.rol });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
