const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../config/db');

router.post('/login', async (req, res) => {
  const { usuario, contrasena } = req.body;
  if (!usuario || !contrasena) {
    return res.status(400).json({ error: 'Usuario y contraseña son obligatorios.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM usuarios_amor WHERE usuario = ? AND activo = 1 LIMIT 1',
      [usuario]
    );

    if (!rows.length) return res.status(401).json({ error: 'Credenciales inválidas.' });

    const ok = await bcrypt.compare(contrasena, rows[0].contrasena_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas.' });

    const { contrasena_hash, ...user } = rows[0];
    res.json({ message: 'Bienvenida a nuestro pequeño sistema.', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
