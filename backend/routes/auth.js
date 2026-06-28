const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const {
  enviarEmail,
  htmlBase,
  escapeHtml
} = require('../utils/email');

function crearToken(usuario) {
  if (!process.env.JWT_SECRET) {
    throw new Error('Falta JWT_SECRET en variables de entorno');
  }

  return jwt.sign(
    {
      id: usuario.id,
      rol: usuario.rol
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d'
    }
  );
}

function pareceHashBcrypt(valor) {
  return typeof valor === 'string' && valor.startsWith('$2');
}

async function validarPassword(contrasenaIngresada, contrasenaGuardada) {
  if (!contrasenaGuardada) return false;

  if (pareceHashBcrypt(contrasenaGuardada)) {
    return bcrypt.compare(contrasenaIngresada, contrasenaGuardada);
  }

  return contrasenaIngresada === contrasenaGuardada;
}

async function actualizarPasswordPlanoAHashSiHaceFalta(usuarioId, contrasenaIngresada, contrasenaGuardada) {
  if (pareceHashBcrypt(contrasenaGuardada)) return;

  const hash = await bcrypt.hash(contrasenaIngresada, 10);
  await pool.query(
    'UPDATE usuarios SET contrasena=$1 WHERE id=$2',
    [hash, usuarioId]
  );
}

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
    if (process.env.DEBUG_LOGIN !== 'true') return;

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
    if (process.env.NOTIFICAR_ACCESO_ELLA !== 'true') return;

    const rol = String(usuario.rol || '').toLowerCase().trim();
    const esElla = rol === 'ella';

    if (!esElla) return;

    const nombreVisible = usuario.display_name || usuario.nombre || usuario.usuario;
    const ahora = new Date();
    const minuto = ahora.toISOString().slice(0, 16);
    const clave = `acceso_ella_${usuario.id}_${minuto}`;
    const asunto = `${nombreVisible} entró a SIGA 🌿`;

    const insert = await pool.query(
      `INSERT INTO email_notificaciones
        (tipo, clave, usuario_id, enviado_a, asunto)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (clave) DO NOTHING
       RETURNING id`,
      [
        'acceso_ella',
        clave,
        usuario.id,
        process.env.EMAIL_TO || null,
        asunto
      ]
    );

    if (!insert.rows.length) return;

    const fechaBonita = ahora.toLocaleString('es-BO', {
      timeZone: 'America/La_Paz',
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    await enviarEmail({
      subject: asunto,
      html: htmlBase({
        titulo: `${nombreVisible} entró a SIGA 🌿`,
        cuerpo: `
          <p>Se registró una nueva entrada al sistema.</p>
          <p><strong>Usuario:</strong> ${escapeHtml(usuario.display_name || usuario.nombre || usuario.usuario)}</p>
          <p><strong>Hora:</strong> ${escapeHtml(fechaBonita)}</p>
        `
      }),
      text: `${nombreVisible} entró a SIGA. Hora: ${fechaBonita}`
    });
  } catch (err) {
    console.error('ERROR notificarAccesoElla:', err.message);
  }
}

router.get('/ping', (req, res) => {
  res.json({
    ok: true,
    mensaje: 'Auth vivo 💜'
  });
});

router.post('/login', async (req, res) => {
  const { usuario, contrasena } = req.body || {};

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
          contrasena,
          nombre,
          rol,
          COALESCE(display_name,nombre,usuario) AS display_name,
          COALESCE(color_perfil,'#22d3ee') AS color_perfil
       FROM usuarios
       WHERE usuario=$1
       LIMIT 1`,
      [usuario.trim()]
    );

    if (!result.rows.length) {
      return res.status(401).json({
        ok: false,
        error: 'Credenciales incorrectas'
      });
    }

    const u = result.rows[0];
    const passwordOk = await validarPassword(contrasena, u.contrasena);

    if (!passwordOk) {
      return res.status(401).json({
        ok: false,
        error: 'Credenciales incorrectas'
      });
    }

    await actualizarPasswordPlanoAHashSiHaceFalta(u.id, contrasena, u.contrasena);

    const token = crearToken(u);

    await registrarAcceso(req, u);
    await registrarDebugLogin(u);
    await notificarAccesoElla(u);

    return res.json({
      ok: true,
      token,
      usuario_id: u.id,
      id: u.id,
      usuario: u.usuario,
      nombre: u.nombre,
      display_name: u.display_name || u.nombre || u.usuario,
      color_perfil: u.color_perfil || '#22d3ee',
      rol: u.rol
    });
  } catch (err) {
    console.error('ERROR LOGIN REAL:', err);
    res.status(500).json({
      ok: false,
      error: 'Error login real: ' + err.message
    });
  }
});

router.get('/perfil/:id', requireAuth, async (req, res) => {
  try {
    const solicitadoId = Number(req.params.id);
    const esPropioPerfil = solicitadoId === Number(req.user.id);
    const esAdmin = req.user.rol === 'admin';

    if (!esPropioPerfil && !esAdmin) {
      return res.status(403).json({
        ok: false,
        error: 'No puedes ver el perfil de otro usuario.'
      });
    }

    const result = await pool.query(
      `SELECT
          id,
          usuario,
          nombre,
          rol,
          codigo_pareja,
          pareja_id,
          COALESCE(display_name,nombre,usuario) AS display_name,
          COALESCE(color_perfil,'#22d3ee') AS color_perfil
       FROM usuarios
       WHERE id=$1`,
      [solicitadoId]
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
      error: 'Error al obtener perfil: ' + err.message
    });
  }
});

router.put('/perfil/:id', requireAuth, async (req, res) => {
  const {
    usuario,
    nombre,
    display_name,
    color_perfil,
    contrasena_actual,
    nueva_contrasena
  } = req.body || {};

  const solicitadoId = Number(req.params.id);
  const esPropioPerfil = solicitadoId === Number(req.user.id);
  const esAdmin = req.user.rol === 'admin';

  if (!esPropioPerfil && !esAdmin) {
    return res.status(403).json({
      ok: false,
      error: 'No puedes edit el perfil de otro usuario.'
    });
  }

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
      [solicitadoId]
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

      const passwordActualOk = await validarPassword(contrasena_actual, actual.contrasena);

      if (!passwordActualOk) {
        return res.status(401).json({
          ok: false,
          error: 'La contraseña actual no es correcta'
        });
      }
    }

    const duplicado = await pool.query(
      'SELECT id FROM usuarios WHERE usuario=$1 AND id<>$2',
      [usuario.trim(), solicitadoId]
    );

    if (duplicado.rows.length) {
      return res.status(409).json({
        ok: false,
        error: 'Ese usuario ya está en uso'
      });
    }

    if (nueva_contrasena && nueva_contrasena.trim() !== '') {
      const hashNueva = await bcrypt.hash(nueva_contrasena.trim(), 10);

      await pool.query(
        `UPDATE usuarios
         SET usuario=$1,nombre=$2,display_name=$3,color_perfil=$4,contrasena=$5
         WHERE id=$6`,
        [
          usuario.trim(),
          nombre.trim(),
          (display_name || nombre || usuario).trim(),
          color_perfil || '#22d3ee',
          hashNueva,
          solicitadoId
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
          solicitadoId
        ]
      );
    }

    const finalResult = await pool.query(
      `SELECT
          id,
          usuario,
          nombre,
          rol,
          codigo_pareja,
          pareja_id,
          COALESCE(display_name,nombre,usuario) AS display_name,
          COALESCE(color_perfil,'#22d3ee') AS color_perfil
       FROM usuarios
       WHERE id=$1`,
      [solicitadoId]
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
      error: 'Error al actualizar perfil: ' + err.message
    });
  }
});

// ====================== REGISTRO CON EMAIL ======================
router.post('/register', async (req, res) => {
  const { email, password, nombre, usuario } = req.body;
  const finalUsuario = usuario || email.split('@')[0];

  if (!email || !password || !nombre) {
    return res.status(400).json({ ok: false, error: 'Faltan email, contraseña o nombre' });
  }

  try {
    const existeEmail = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email.toLowerCase()]);
    if (existeEmail.rows.length > 0) {
      return res.status(400).json({ ok: false, error: 'Este correo ya está registrado' });
    }

    const existeUsuario = await pool.query('SELECT id FROM usuarios WHERE usuario = $1', [finalUsuario.toLowerCase()]);
    if (existeUsuario.rows.length > 0) {
      return res.status(400).json({ ok: false, error: 'Este nombre de usuario ya está en uso' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const codigoParejaGenerado = Math.random().toString(36).substring(2, 8).toUpperCase();

    const result = await pool.query(`
      INSERT INTO usuarios (email, contrasena, nombre, usuario, verificado, rol, codigo_pareja)
      VALUES ($1, $2, $3, $4, false, 'user', $5)
      RETURNING id, email, nombre, codigo_pareja
    `, [email.toLowerCase(), hashedPassword, nombre, finalUsuario.toLowerCase(), codigoParejaGenerado]);

    const newUser = result.rows[0];

    const token = jwt.sign(
      { userId: newUser.id, purpose: 'verify' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const link = `https://${req.headers.host}/verify-email?token=${token}`;

    await enviarEmail({
      to: email,
      subject: 'Verifica tu cuenta en SIGA',
      html: `
        <h2>Bienvenido a SIGA</h2>
        <p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
        <a href="${link}" style="padding:12px 24px; background:#e91e63; color:white; text-decoration:none; border-radius:8px;">Verificar Cuenta</a>
        <p>El enlace expira en 24 horas.</p>
      `
    });

    res.json({ 
      ok: true, 
      id: newUser.id,
      codigo_pareja: newUser.codigo_pareja,
      mensaje: 'Cuenta creada. Revisa tu correo para verificarla.' 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Error al crear la cuenta: ' + err.message });
  }
});

// ====================== NUEVO: VINCULACIÓN DE PAREJA ======================
router.post('/vincular', async (req, res) => {
  const { usuario_id, codigo_pareja } = req.body;

  if (!usuario_id || !codigo_pareja) {
    return res.status(400).json({ ok: false, error: 'Faltan parámetros requeridos.' });
  }

  try {
    // Buscar el usuario dueño del código
    const targetRes = await pool.query(
      'SELECT id, pareja_id FROM usuarios WHERE codigo_pareja = $1 LIMIT 1',
      [codigo_pareja.trim().toUpperCase()]
    );

    if (!targetRes.rows.length) {
      return res.status(404).json({ ok: false, error: 'El código de vinculación no existe.' });
    }

    const pareja = targetRes.rows[0];

    if (pareja.id === Number(usuario_id)) {
      return res.status(400).json({ ok: false, error: 'No puedes vincularte con tu propio código.' });
    }

    if (pareja.pareja_id) {
      return res.status(400).json({ ok: false, error: 'Esta pareja ya está vinculada con otra cuenta.' });
    }

    // Actualizar de manera bidireccional los campos pareja_id
    await pool.query('UPDATE usuarios SET pareja_id = $1 WHERE id = $2', [pareja.id, usuario_id]);
    await pool.query('UPDATE usuarios SET pareja_id = $1 WHERE id = $2', [usuario_id, pareja.id]);

    res.json({ ok: true, message: 'Vinculación completada con éxito.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Error interno al procesar la vinculación: ' + err.message });
  }
});

module.exports = router;
