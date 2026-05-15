/* ============================================================
   SIGA — admin.js
   Módulo: Panel admin separado
   Crear en: backend/public/js/admin.js
   ============================================================ */

'use strict';

function adminEsAdmin() {
  return typeof state !== 'undefined' && state.currentUser && state.currentUser.rol === 'admin';
}

function adminUserId() {
  return (typeof state !== 'undefined' && state.currentUser && state.currentUser.id) ? state.currentUser.id : null;
}

function adminEsc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function adminFecha(valor) {
  if (!valor) return '—';
  const d = new Date(valor);
  if (isNaN(d.getTime())) return String(valor).substring(0, 16);
  return d.toLocaleString('es-BO', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function adminNivelLabel(nivel) {
  return { facil: 'Fácil', medio: 'Media', dificil: 'Difícil', hardcore: 'Legendaria' }[nivel] || nivel || '—';
}

function adminMiniRow({ icon = '•', title = '', meta = '', action = '' }) {
  return `
    <div class="admin-mini-row">
      <div class="admin-mini-icon">${icon}</div>
      <div class="admin-mini-content">
        <div class="admin-mini-title">${title}</div>
        <div class="admin-mini-meta">${meta}</div>
      </div>
      ${action ? `<div class="admin-mini-action">${action}</div>` : ''}
    </div>
  `;
}

function adminSetText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function adminMostrarNav() {
  const nav = document.getElementById('nav-admin-panel');
  if (nav) nav.style.display = adminEsAdmin() ? 'flex' : 'none';
}

async function loadAdminPanel() {
  adminMostrarNav();

  const warning = document.getElementById('admin-private-warning');
  const content = document.getElementById('admin-panel-content');

  if (!warning || !content) return;

  if (!adminEsAdmin()) {
    warning.style.display = 'block';
    content.style.display = 'none';
    return;
  }

  warning.style.display = 'none';
  content.style.display = 'block';

  const uid = adminUserId();
  if (!uid) return;

  try {
    const data = await api('GET', `/api/admin/resumen?usuario_id=${uid}&x=${Date.now()}`);

    if (!data || data.error) {
      const box = document.getElementById('admin-misiones-recientes');
      if (box) box.innerHTML = `<div class="admin-empty">${adminEsc(data?.error || 'No se pudo cargar el panel admin.')}</div>`;
      return;
    }

    const misiones = data.misiones || {};
    const calma = data.calma || {};
    const citas = data.citas || {};
    const accesos = data.accesos || {};
    const progreso = data.progreso || {};

    const mr = misiones.resumen || {};
    const cr = calma.resumen || {};
    const pr = citas.resumen || {};
    const ar = accesos.resumen || {};
    const nivel = progreso.nivel || {};

    adminSetText('admin-puntos-total', `${progreso.puntos ?? 0}`);
    adminSetText('admin-puntos-detalle', `${nivel.emoji || '🏆'} Nivel ${nivel.nivel || 1} · ${nivel.nombre || 'Primeros destellos'}`);

    adminSetText('admin-misiones-total', mr.total ?? 0);
    adminSetText('admin-misiones-puntos', `${mr.puntos ?? 0} pts · ${mr.ultimos_7 ?? 0} en 7 días`);

    adminSetText('admin-calma-total', cr.total ?? 0);
    adminSetText('admin-calma-dias', `${cr.dias_programados ?? 0} días programados · ${cr.activas ?? 0} activo(s)`);

    adminSetText('admin-citas-total', pr.total ?? 0);
    adminSetText('admin-citas-detalle', `${pr.pendientes ?? 0} pendientes · ${pr.cumplidas ?? 0} cumplidas · ${pr.proximas ?? 0} próximas`);

    adminSetText('admin-accesos-total', ar.ultimos_30 ?? 0);
    adminSetText('admin-accesos-detalle', `${ar.hoy ?? 0} hoy · último ${adminFecha(ar.ultimo)}`);

    const recientesEl = document.getElementById('admin-misiones-recientes');
    if (recientesEl) {
      const recientes = misiones.recientes || [];
      recientesEl.innerHTML = recientes.length ? recientes.map(m => adminMiniRow({
        icon: '🏁',
        title: `${adminEsc(m.titulo)} <span class="admin-chip">+${m.puntos} pts</span>`,
        meta: `${adminEsc(m.usuario_nombre || 'Sin usuario')} · ${adminNivelLabel(m.nivel)} · ${adminFecha(m.creado_en)}`,
        action: `<button class="btn-admin-danger" onclick="adminEliminarMision(${m.id})">Eliminar</button>`
      })).join('') : '<div class="admin-empty">Aún no hay misiones completadas.</div>';
    }

    const accesosEl = document.getElementById('admin-accesos-lista');
    if (accesosEl) {
      const recientes = accesos.recientes || [];
      accesosEl.innerHTML = recientes.length ? recientes.map(a => adminMiniRow({
        icon: '👤',
        title: adminEsc(a.usuario_nombre || a.nombre_visible || a.usuario || 'Usuario'),
        meta: `${adminEsc(a.rol || '—')} · ${adminFecha(a.creado_en)}${a.ip ? ' · IP ' + adminEsc(a.ip) : ''}`
      })).join('') : '<div class="admin-empty">Aún no hay accesos registrados. Haz logout/login para empezar a guardar entradas.</div>';
    }

    const usuariosEl = document.getElementById('admin-usuarios-actividad');
    if (usuariosEl) {
      const porUsuario = misiones.por_usuario || [];
      const accesosUsuario = accesos.por_usuario || [];
      const bloqueMisiones = porUsuario.length ? porUsuario.map(u => adminMiniRow({
        icon: '🎯',
        title: adminEsc(u.usuario_nombre || 'Sin usuario'),
        meta: `${u.total || 0} misiones · ${u.puntos || 0} pts · última ${adminFecha(u.ultima)}`
      })).join('') : '<div class="admin-empty">Sin misiones por usuario.</div>';

      const bloqueAccesos = accesosUsuario.length ? `
        <div class="admin-subtitle">Accesos últimos 30 días</div>
        ${accesosUsuario.map(u => adminMiniRow({
          icon: '🟢',
          title: adminEsc(u.usuario_nombre || 'Sin usuario'),
          meta: `${u.total || 0} acceso(s) · último ${adminFecha(u.ultimo)}`
        })).join('')}
      ` : '';

      usuariosEl.innerHTML = bloqueMisiones + bloqueAccesos;
    }

    const calmaCitasEl = document.getElementById('admin-calma-citas-lista');
    if (calmaCitasEl) {
      const calmaUsuarios = calma.por_usuario || [];
      const promedio = pr.promedio_dias_entre_planes;
      const top = `
        ${adminMiniRow({ icon: '📅', title: 'Frecuencia de planes', meta: promedio ? `aprox. cada ${promedio} día(s) entre planes registrados` : 'aún no hay suficientes fechas para calcular frecuencia' })}
        ${adminMiniRow({ icon: '🗓️', title: 'Última fecha registrada', meta: adminFecha(pr.ultima_fecha) })}
      `;
      const calmaHtml = calmaUsuarios.length ? `
        <div class="admin-subtitle">Modo calma por usuario</div>
        ${calmaUsuarios.map(c => adminMiniRow({
          icon: '🌙',
          title: adminEsc(c.usuario_nombre || 'Sin usuario'),
          meta: `${c.total || 0} activación(es) · ${c.dias || 0} día(s) · última ${adminFecha(c.ultima)}`
        })).join('')}
      ` : '<div class="admin-empty">Sin registros de modo calma por usuario.</div>';
      calmaCitasEl.innerHTML = top + calmaHtml;
    }
  } catch (err) {
    console.error(err);
    const box = document.getElementById('admin-misiones-recientes');
    if (box) box.innerHTML = '<div class="admin-empty">Error al cargar el panel admin.</div>';
  }
}

async function adminEliminarMision(id) {
  if (!adminEsAdmin()) return toast('Solo admin puede eliminar registros.');
  if (!confirm('¿Eliminar esta misión cumplida? Se restarán esos puntos del progreso.')) return;

  try {
    const uid = adminUserId();
    const data = await api('DELETE', `/api/admin/misiones/${id}?usuario_id=${uid}`);
    if (data && data.error) return toast(data.error);
    toast('Registro eliminado. Puntos actualizados.');
    if (typeof cargarProgresoMisiones === 'function') await cargarProgresoMisiones();
    await loadAdminPanel();
  } catch (err) {
    console.error(err);
    toast('No se pudo eliminar el registro.');
  }
}

(function iniciarAdminPanel() {
  function hookNavigate() {
    if (typeof window.navigateTo === 'function' && !window.navigateTo.__adminHook) {
      const anterior = window.navigateTo;
      const nuevo = function(page) {
        const r = anterior.apply(this, arguments);
        setTimeout(() => {
          adminMostrarNav();
          if (page === 'admin') loadAdminPanel();
        }, 50);
        return r;
      };
      nuevo.__adminHook = true;
      window.navigateTo = nuevo;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    adminMostrarNav();
    hookNavigate();
    setTimeout(adminMostrarNav, 500);
    setTimeout(hookNavigate, 700);
  });

  const viejoLogin = window.doLogin;
  window.doLogin = async function() {
    if (typeof viejoLogin === 'function') await viejoLogin.apply(this, arguments);
    setTimeout(adminMostrarNav, 250);
  };

  setTimeout(adminMostrarNav, 900);
  setInterval(adminMostrarNav, 3000);
})();

window.loadAdminPanel = loadAdminPanel;
window.adminEliminarMision = adminEliminarMision;
window.adminEsAdmin = adminEsAdmin;
