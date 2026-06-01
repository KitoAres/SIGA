const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function emailActivo() {
  return !!(
    process.env.RESEND_API_KEY &&
    process.env.EMAIL_TO &&
    process.env.EMAIL_FROM
  );
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function htmlBase({ titulo, cuerpo }) {
  return `
    <div style="font-family:Arial,sans-serif;background:#0f0b18;color:#f4efff;padding:24px;">
      <div style="max-width:580px;margin:auto;background:#181225;border:1px solid rgba(180,130,220,.25);border-radius:18px;padding:24px;">
        <h1 style="margin:0 0 12px;font-size:24px;color:#f4efff;">
          ${escapeHtml(titulo)}
        </h1>

        <div style="font-size:15px;line-height:1.7;color:#d8cfee;">
          ${cuerpo}
        </div>

        <hr style="border:none;border-top:1px solid rgba(255,255,255,.08);margin:22px 0;">

        <p style="font-size:12px;color:#8f83a8;margin:0;">
          SIGA — Sistema Integral de Gestión de Amor
        </p>
      </div>
    </div>
  `;
}

async function enviarEmail({ to, subject, html, text }) {
  if (!emailActivo()) {
    console.warn('Email desactivado: faltan RESEND_API_KEY, EMAIL_TO o EMAIL_FROM.');
    return {
      ok: false,
      skipped: true,
      reason: 'Faltan variables de entorno'
    };
  }

  if (!resend) {
    console.warn('Resend no inicializado.');
    return {
      ok: false,
      skipped: true,
      reason: 'Resend no inicializado'
    };
  }

  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: to || process.env.EMAIL_TO,
      subject,
      html,
      text
    });

    console.log('EMAIL ENVIADO RESEND:', result);

    return {
      ok: true,
      result
    };
  } catch (err) {
    console.error('Error enviando email:', err);
    return {
      ok: false,
      error: err.message
    };
  }
}

async function registrarNotificacionSiNoExiste(pool, {
  tipo,
  clave,
  usuario_id = null,
  enviado_a = null,
  asunto = null
}) {
  try {
    const existe = await pool.query(
      `SELECT id FROM email_notificaciones WHERE clave = $1 LIMIT 1`,
      [clave]
    );

    if (existe.rows.length) {
      return {
        nuevo: false
      };
    }

    await pool.query(
      `INSERT INTO email_notificaciones
        (tipo, clave, usuario_id, enviado_a, asunto)
       VALUES ($1, $2, $3, $4, $5)`,
      [tipo, clave, usuario_id, enviado_a, asunto]
    );

    return {
      nuevo: true
    };
  } catch (err) {
    console.error('Error registrando notificación:', err);
    return {
      nuevo: false,
      error: err.message
    };
  }
}

module.exports = {
  enviarEmail,
  registrarNotificacionSiNoExiste,
  htmlBase,
  escapeHtml
};
