const express = require('express');
const router = express.Router();
const pool = require('../config/db');

const {
  enviarEmail,
  htmlBase,
  escapeHtml
} = require('../utils/email');

async function registrarAcceso(req, usuario) {
  try {
    if (usuario.rol === 'admin') return;

    const ipRaw = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;
    const ip = ipRaw ? String(ipRaw).split(',')[0].trim() : null;
    const userAgent = req.headers['user-agent'] || null;

    await pool.query(
      `INSERT INTO accesos_sistema
        (usuario_id, usuario, nombre_visible, rol, ip, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6)`,
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

async function registrarDebugLogin(usuario) {
  try {
    console.log('DEBUG LOGIN SIGA:', {
      id: usuario.id,
      usuario: usuario.usuario,
      nombre: usuario.nombre,
      display_name: usuario.display_name,
      rol: usuario.rol,
      email_watch: process.env.EMAIL_WATCH_USER || 'NO_CONFIGURADO',
      email_to: process.env.EMAIL_TO ? 'CONFIGURADO' : 'FALTA',
      email_from: process.env.EMAIL_FROM ? 'CONFIGURADO' : 'FALTA',
      resend: process.env.RESEND_API_KEY ? 'CONFIGURADO' : 'FALTA'
    });

    await pool.query(
      `INSERT INTO email_notificaciones
        (tipo, clave, usuario_id, enviado_a, asunto)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (clave) DO NOTHING`,
      [
        'debug_login',
        `debug_login_${usuario.id}_${Date.now()}`,
        usuario.id,
        process.env.EMAIL_TO || null,
        'DEBUG login ejecutado'
      ]
    );
  } catch (err) {
    console.error('ERROR DEBUG LOGIN:', err.message);
  }
}

async function notificarAccesoElla(usuario) {
  try {
    const rol = String(usuario.rol || '').toLowerCase().trim();
    const usuarioLogin = String(usuario.usuario || '').toLowerCase().trim();
    const nombre = String(usuario.nombre || '').toLowerCase().trim();
    const display = String(usuario.display_name || '').toLowerCase().trim();
    const watch = String(process.env.EMAIL_WATCH_USER || 'francin').toLowerCase().trim();

    const esElla =
      rol === 'ella' ||
      usuarioLogin === 'francin' ||
      usuarioLogin === watch ||
      nombre.includes('francin') ||
      display.includes('francin');

    console.log('DEBUG DETECCION ELLA:', {
      id: usuario.id,
      rol,
      usuarioLogin,
      nombre,
      display,
      watch,
      esElla
    });

    if (!esElla) return;

    const ahora = new Date();

    // Máximo 1 correo por minuto para evitar spam por recargas.
    const minuto = ahora.toISOString().slice(0, 16);
    const clave = `acceso_ella_${usuario.id}_${minuto}`;
    const asunto = 'Francin entró a SIGA 🌿';

    await pool.query(
      `INSERT INTO email_notificaciones
        (tipo, clave, usuario_id, enviado_a, asunto)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (clave) DO NOTHING`,
      [
        'acceso_ella',
        clave,
        usuario.id,
        process.env.EMAIL_TO || null,
        asunto
      ]
    );

    const fechaBonita = ahora.toLocaleString('es-BO', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const resultadoEmail = await enviarEmail({
      subject: asunto,
      html: htmlBase({
        titulo: 'Francin entró a SIGA 🌿',
        cuerpo: `
          <p>Se registró una nueva entrada al sistema.</p>
          <p><strong>Usuario:</strong> ${escapeHtml(usuario.display_name || usuario.nombre || usuario.usuario)}</p>
          <p><strong>Hora:</strong> ${escapeHtml(fechaBonita)}</p>
        `
      }),
      text: `Francin entró a SIGA. Hora: ${fechaBonita}`
    });

    console.log('DEBUG EMAIL ACCESO RESULTADO:', resultadoEmail);

  } catch (err) {
    console.error('ERROR notificarAccesoElla:', err);
  }
}

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
          COALESCE(display_name,nombre,usuario) AS display_name,
          COALESCE(color_perfil,'#22d3ee') AS color_perfil
       FROM usuarios
       WHERE usuario=$1 AND contrasena=$2`,
      [usuario, contrasena]
    );

    if (!result.rows.length) {
      return res.status(401).json({
        ok: false,
        error: 'Credenciales incorrectas'
      });
    }

    const u = result.rows[0];

    await registrarAcceso(req, u);

    // Debug temporal: confirma que este auth.js se está ejecutando.
    await registrarDebugLogin(u);

    // Email si entra Francin / rol ella.
    await notificarAccesoElla(u);

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
    console.error('ERROR LOGIN:', err);
    res.status(500).json({
      ok: false,
      error: 'Error del servidor'
    });
  }
});

router.get('/perfil/:id', async (req, res) => {
  try {
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
      [req.params.id]
    );

    if (!result.rows.length) {
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
    console.error('ERROR PERFIL:', err);
    res.status(500).json({
      ok: false,
      error: 'Error al obtener perfil'
    });
  }
});

router.put('/perfil/:id', async (req, res) => {
  const {
    usuario,
    nombre,
    display_name,
    color_perfil,
    contrasena_actual,
    nueva_contrasena
  } = req.body;

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
      'SELECT id, contrasena FROM usuarios WHERE id=$1',
      [req.params.id]
    );

    if (!actualResult.rows.length) {
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

    const duplicado = await pool.query(
      'SELECT id FROM usuarios WHERE usuario=$1 AND id<>$2',
      [usuario.trim(), req.params.id]
    );

    if (duplicado.rows.length) {
      return res.status(409).json({
        ok: false,
        error: 'Ese usuario ya está en uso'
      });
    }

    if (nueva_contrasena && nueva_contrasena.trim() !== '') {
      await pool.query(
        `UPDATE usuarios
         SET usuario=$1,nombre=$2,display_name=$3,color_perfil=$4,contrasena=$5
         WHERE id=$6`,
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
         SET usuario=$1,nombre=$2,display_name=$3,color_perfil=$4
         WHERE id=$5`,
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
          COALESCE(display_name,nombre,usuario) AS display_name,
          COALESCE(color_perfil,'#22d3ee') AS color_perfil
       FROM usuarios
       WHERE id=$1`,
      [req.params.id]
    );

    res.json({
      ok: true,
      message: 'Perfil actualizado correctamente',
      usuario: finalResult.rows[0]
    });

  } catch (err) {
    console.error('ERROR ACTUALIZAR PERFIL:', err);
    res.status(500).json({
      ok: false,
      error: 'Error al actualizar perfil'
    });
  }
});

module.exports = router;
