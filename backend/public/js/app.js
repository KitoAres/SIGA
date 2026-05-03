/* ============================================================
   SIGA — app.js
   JS puro, compatible con cualquier navegador moderno.
   Sin imports, sin módulos, sin frameworks.
   ============================================================ */

'use strict';

// ── ESTADO GLOBAL ──────────────────────────────────────────────
const state = {
  currentPage: 'dashboard',
  modal: { type: null, id: null },
  cartaId: null,
  cartaOriginal: '',
};

// ── HELPERS ────────────────────────────────────────────────────
function $(id) { return document.getElementById(id); }

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2800);
}

async function api(method, url, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  return res.json();
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ── LOGIN / LOGOUT ─────────────────────────────────────────────
async function doLogin() {
  const usuario   = $('login-user').value.trim();
  const contrasena = $('login-pass').value.trim();
  $('login-error').textContent = '';

  if (!usuario || !contrasena) {
    $('login-error').textContent = 'Por favor completa los campos.';
    return;
  }

  try {
    const data = await api('POST', '/api/auth/login', { usuario, contrasena });
    if (data.ok) {
      $('login-screen').style.display = 'none';
      $('app').classList.add('visible');
      $('sidebar-user').textContent = data.nombre || usuario;
      loadDashboard();
    } else {
      $('login-error').textContent = data.error || 'Credenciales incorrectas.';
    }
  } catch {
    $('login-error').textContent = 'No se pudo conectar con el servidor.';
  }
}

function doLogout() {
  $('login-screen').style.display = 'flex';
  $('app').classList.remove('visible');
  $('login-user').value = '';
  $('login-pass').value = '';
}

// Enter en inputs de login
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && $('login-screen').style.display !== 'none') doLogin();
});

// ── NAVEGACIÓN ─────────────────────────────────────────────────
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  $('page-' + page).classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.textContent.trim().toLowerCase().includes(page.toLowerCase()) ||
        (page === 'dashboard' && n.textContent.includes('Dashboard')) ||
        (page === 'forbidden' && n.textContent.includes('prohibido')) ||
        (page === 'pregunta' && n.textContent.includes('Pregunta'))) {
      n.classList.add('active');
    }
  });

  state.currentPage = page;

  // Cerrar sidebar en móvil
  closeSidebar();

  // Cargar datos de la sección
const loaders = {
  dashboard: loadDashboard,
  recuerdos: loadRecuerdos,
  citas:     loadCitas,
  playlist:  loadPlaylist,
  razones:   loadRazones,
  promesas:  loadPromesas,
  carta:     loadCarta,
  cajita:    loadCajita,
};
  if (loaders[page]) loaders[page]();
}

// ── SIDEBAR MÓVIL ──────────────────────────────────────────────
function toggleSidebar() {
  $('sidebar').classList.toggle('open');
  $('sidebar-overlay').classList.toggle('open');
}
function closeSidebar() {
  $('sidebar').classList.remove('open');
  $('sidebar-overlay').classList.remove('open');
}

// ── DASHBOARD ─────────────────────────────────────────────────
async function loadDashboard() {
  try {
    const data = await api('GET', '/api/dashboard/resumen');
    $('stat-dias').textContent     = data.dias     ?? '—';
    $('stat-recuerdos').textContent = data.recuerdos ?? '—';
    $('stat-citas').textContent    = data.citas     ?? '—';
    $('stat-razones').textContent  = data.razones   ?? '—';
  } catch {
    // Silencioso si no hay DB aún
  }
}

// ── RECUERDOS ─────────────────────────────────────────────────
async function loadRecuerdos() {
  const container = $('list-recuerdos');
  container.innerHTML = '<div style="color:var(--text-muted);padding:20px;">Cargando...</div>';
  try {
    const items = await api('GET', '/api/recuerdos');
    if (!items.length) {
      container.innerHTML = emptyState('🌸', 'Aún no hay recuerdos guardados.');
      return;
    }
container.innerHTML = items.map(r => `
  <div class="item-card recuerdo-card">
    ${r.imagen_url ? `
      <div class="recuerdo-img-wrap">
        <img src="${esc(r.imagen_url)}" alt="${esc(r.titulo)}" class="recuerdo-img">
      </div>
    ` : ''}

    <div class="item-header">
      <div class="item-title">${esc(r.titulo)}</div>
      <div class="item-meta">${formatDate(r.fecha)}</div>
    </div>

    <p class="item-desc">${esc(r.descripcion)}</p>

    ${r.enlace_url ? `
      <a class="btn-link-recuerdo" href="${esc(r.enlace_url)}" target="_blank" rel="noopener">
        Abrir algo especial ♡
      </a>
    ` : ''}

    <div class="item-actions">
      <button class="btn btn-sm btn-edit" onclick="openModal(
        'recuerdos', 
        ${r.id}, 
        '${esc(r.titulo)}', 
        '${esc(r.descripcion)}', 
        '${r.fecha ? r.fecha.split('T')[0] : ''}',
        '${esc(r.imagen_url || '')}',
        '${esc(r.enlace_url || '')}'
      )">Editar</button>
      <button class="btn btn-sm btn-delete" onclick="deleteItem('recuerdos', ${r.id})">Eliminar</button>
    </div>
  </div>
`).join('');
  } catch {
    container.innerHTML = '<div style="color:var(--danger);padding:20px;">Error al cargar recuerdos.</div>';
  }
}

// ── CITAS ─────────────────────────────────────────────────────
async function loadCitas() {
  const container = $('list-citas');
  container.innerHTML = '<div style="color:var(--text-muted);padding:20px;">Cargando...</div>';
  try {
    const items = await api('GET', '/api/citas');
    if (!items.length) {
      container.innerHTML = emptyState('📅', 'Aún no hay citas planeadas.');
      return;
    }
    container.innerHTML = items.map(c => `
      <div class="item-card">
        <div class="item-header">
          <div>
            <div class="item-title">${esc(c.titulo)}</div>
            <div class="item-meta">📍 ${esc(c.lugar || '')} · ${formatDate(c.fecha)}</div>
          </div>
          <span class="badge ${badgeClass(c.estado)}">${estadoLabel(c.estado)}</span>
        </div>
        <p class="item-desc">${esc(c.descripcion || '')}</p>
        <div class="item-actions">
          <button class="btn btn-sm btn-edit" onclick="openModal('citas', ${c.id}, '${esc(c.titulo)}', '${esc(c.lugar||'')}', '${esc(c.descripcion||'')}', '${c.fecha ? c.fecha.split('T')[0] : ''}', '${c.estado}')">Editar</button>
          <button class="btn btn-sm btn-delete" onclick="deleteItem('citas', ${c.id})">Eliminar</button>
        </div>
      </div>
    `).join('');
  } catch {
    container.innerHTML = '<div style="color:var(--danger);padding:20px;">Error al cargar citas.</div>';
  }
}

function badgeClass(estado) {
  if (estado === 'cumplida') return 'badge-done';
  if (estado === 'cancelada') return 'badge-canceled';
  return 'badge-pending';
}
function estadoLabel(e) {
  return { pendiente: 'Pendiente', cumplida: 'Cumplida', cancelada: 'Cancelada' }[e] || e;
}

// ── PLAYLIST ──────────────────────────────────────────────────
async function loadPlaylist() {
  const container = $('list-playlist');
  container.innerHTML = '<div style="color:var(--text-muted);padding:20px;">Cargando...</div>';
  try {
    const items = await api('GET', '/api/playlist');
    if (!items.length) {
      container.innerHTML = emptyState('🎵', 'La playlist está vacía.');
      return;
    }
    container.innerHTML = items.map(s => `
      <div class="song-item">
        <div class="song-icon">♪</div>
        <div class="song-info">
          <div class="song-title">${esc(s.titulo)}</div>
          <div class="song-artist">${esc(s.artista || '')}</div>
          ${s.frase ? `<div class="song-frase">"${esc(s.frase)}"</div>` : ''}
        </div>
        <div style="display:flex;gap:6px;align-items:center;">
          ${s.enlace ? `<a class="btn-play" href="${esc(s.enlace)}" target="_blank" rel="noopener">▶ Escuchar</a>` : ''}
          <button class="btn btn-sm btn-edit" onclick="openModal('playlist', ${s.id}, '${esc(s.titulo)}', '${esc(s.artista||'')}', '${esc(s.enlace||'')}', '${esc(s.frase||'')}')">✎</button>
          <button class="btn btn-sm btn-delete" onclick="deleteItem('playlist', ${s.id})">✕</button>
        </div>
      </div>
    `).join('');
  } catch {
    container.innerHTML = '<div style="color:var(--danger);padding:20px;">Error al cargar playlist.</div>';
  }
}

// ── RAZONES ───────────────────────────────────────────────────
async function loadRazones() {
  const container = $('list-razones');
  container.innerHTML = '<div style="color:var(--text-muted);padding:20px;">Cargando...</div>';
  try {
    const items = await api('GET', '/api/razones');
    if (!items.length) {
      container.innerHTML = emptyState('💜', 'Aún no hay razones. (Imposible, pero por si acaso.)');
      return;
    }
    container.innerHTML = items.map((r, i) => `
      <div class="razon-item">
        <div class="razon-num">${String(i + 1).padStart(2, '0')}</div>
        <div class="razon-texto">${esc(r.texto)}</div>
        <div style="display:flex;gap:6px;flex-shrink:0;align-self:flex-start;">
          <button class="btn btn-sm btn-edit" onclick="openModal('razones', ${r.id}, '${esc(r.texto)}')">✎</button>
          <button class="btn btn-sm btn-delete" onclick="deleteItem('razones', ${r.id})">✕</button>
        </div>
      </div>
    `).join('');
  } catch {
    container.innerHTML = '<div style="color:var(--danger);padding:20px;">Error al cargar razones.</div>';
  }
}

// ── PROMESAS ──────────────────────────────────────────────────
async function loadPromesas() {
  const container = $('list-promesas');
  container.innerHTML = '<div style="color:var(--text-muted);padding:20px;">Cargando...</div>';
  try {
    const items = await api('GET', '/api/promesas');
    if (!items.length) {
      container.innerHTML = emptyState('🤍', 'Agrega tu primera promesa.');
      return;
    }
    container.innerHTML = items.map((p, i) => `
      <div class="razon-item">
        <div class="razon-num" style="color:var(--accent-blue);">${String(i + 1).padStart(2, '0')}</div>
        <div class="razon-texto">${esc(p.texto)}</div>
        <div style="display:flex;gap:6px;flex-shrink:0;align-self:flex-start;">
          <button class="btn btn-sm btn-edit" onclick="openModal('promesas', ${p.id}, '${esc(p.texto)}')">✎</button>
          <button class="btn btn-sm btn-delete" onclick="deleteItem('promesas', ${p.id})">✕</button>
        </div>
      </div>
    `).join('');
  } catch {
    container.innerHTML = '<div style="color:var(--danger);padding:20px;">Error al cargar promesas.</div>';
  }
}

// ── CARTA ─────────────────────────────────────────────────────
async function loadCarta() {
  try {
    const data = await api('GET', '/api/cartas');
    state.cartaId = data.id;
    state.cartaOriginal = data.contenido || '';
    $('carta-view').textContent = data.contenido || '';
  } catch {
    $('carta-view').textContent = 'No se pudo cargar la carta.';
  }
}

function editCarta() {
  $('carta-view').style.display = 'none';
  $('carta-edit').style.display = 'block';
  $('carta-edit').value = state.cartaOriginal;
  $('btn-edit-carta').style.display = 'none';
  $('btn-save-carta').style.display = 'inline-block';
  $('btn-cancel-carta').style.display = 'inline-block';
}

async function saveCarta() {
  const contenido = $('carta-edit').value;
  try {
    await api('PUT', '/api/cartas/' + state.cartaId, { contenido });
    state.cartaOriginal = contenido;
    $('carta-view').textContent = contenido;
    cancelCarta();
    toast('Carta guardada con cariño ♡');
  } catch {
    toast('Error al guardar la carta.');
  }
}

function cancelCarta() {
  $('carta-view').style.display = 'block';
  $('carta-edit').style.display = 'none';
  $('btn-edit-carta').style.display = 'inline-block';
  $('btn-save-carta').style.display = 'none';
  $('btn-cancel-carta').style.display = 'none';
}

// ── MODAL CRUD ────────────────────────────────────────────────
function openModal(type, id, ...args) {
  state.modal.type = type;
  state.modal.id   = id || null;

  const formEl = $('modal-crud-form');
  const titleEl = $('modal-crud-title');

  const isEdit = !!id;

  const forms = {
recuerdos: () => {
  titleEl.textContent = isEdit ? 'Editar recuerdo' : 'Nuevo recuerdo';
  formEl.innerHTML = `
    <label>Título</label>
    <input type="text" id="f-titulo" value="${isEdit ? args[0] : ''}" placeholder="¿Qué fue lo que pasó?"/>

    <label>Fecha</label>
    <input type="date" id="f-fecha" value="${isEdit ? args[2] : ''}"/>

    <label>Descripción</label>
    <textarea id="f-descripcion" placeholder="Cuéntame más...">${isEdit ? args[1] : ''}</textarea>

    <label>URL de imagen opcional</label>
    <input type="url" id="f-imagen-url" value="${isEdit ? args[3] || '' : ''}" placeholder="https://..."/>

    <label>URL especial opcional</label>
    <input type="url" id="f-enlace-url" value="${isEdit ? args[4] || '' : ''}" placeholder="Carta, juego, bitácora, Drive, etc."/>
  `;
},
    citas: () => {
      titleEl.textContent = isEdit ? 'Editar cita' : 'Nueva cita';
      formEl.innerHTML = `
        <label>Título</label>
        <input type="text" id="f-titulo" value="${isEdit ? args[0] : ''}" placeholder="¿Qué vamos a hacer?"/>
        <label>Lugar</label>
        <input type="text" id="f-lugar" value="${isEdit ? args[1] : ''}" placeholder="¿Dónde?"/>
        <label>Fecha</label>
        <input type="date" id="f-fecha" value="${isEdit ? args[3] : ''}"/>
        <label>Estado</label>
        <select id="f-estado">
          <option value="pendiente" ${(!isEdit || args[4]==='pendiente') ? 'selected':''}>Pendiente</option>
          <option value="cumplida"  ${(isEdit && args[4]==='cumplida')  ? 'selected':''}>Cumplida</option>
          <option value="cancelada" ${(isEdit && args[4]==='cancelada') ? 'selected':''}>Cancelada</option>
        </select>
        <label>Descripción</label>
        <textarea id="f-descripcion" placeholder="Detalles...">${isEdit ? args[2] : ''}</textarea>
      `;
    },
    playlist: () => {
      titleEl.textContent = isEdit ? 'Editar canción' : 'Nueva canción';
      formEl.innerHTML = `
        <label>Título</label>
        <input type="text" id="f-titulo" value="${isEdit ? args[0] : ''}" placeholder="Nombre de la canción"/>
        <label>Artista</label>
        <input type="text" id="f-artista" value="${isEdit ? args[1] : ''}" placeholder="Artista"/>
        <label>Enlace (Spotify, YouTube...)</label>
        <input type="url" id="f-enlace" value="${isEdit ? args[2] : ''}" placeholder="https://..."/>
        <label>Frase favorita</label>
        <textarea id="f-frase" placeholder="La parte que más me gusta...">${isEdit ? args[3] : ''}</textarea>
      `;
    },
    razones: () => {
      titleEl.textContent = isEdit ? 'Editar razón' : 'Nueva razón';
      formEl.innerHTML = `
        <label>Razón</label>
        <textarea id="f-texto" placeholder="Porque...">${isEdit ? args[0] : ''}</textarea>
      `;
    },
    promesas: () => {
      titleEl.textContent = isEdit ? 'Editar promesa' : 'Nueva promesa';
      formEl.innerHTML = `
        <label>Promesa</label>
        <textarea id="f-texto" placeholder="Prometo...">${isEdit ? args[0] : ''}</textarea>
      `;
    },
  };

  if (forms[type]) forms[type]();
  $('modal-crud').classList.add('open');

  // Foco en primer input
  setTimeout(() => {
    const first = formEl.querySelector('input, textarea');
    if (first) first.focus();
  }, 100);
}

function closeModal(id) {
  $(id).classList.remove('open');
  if (id === 'modal-crud') {
    state.modal.type = null;
    state.modal.id   = null;
  }
}

async function saveModal() {
  const { type, id } = state.modal;
  let body = {};

  const val = (sid) => { const el = $(sid); return el ? el.value.trim() : ''; };

if (type === 'recuerdos') {
  body = { 
    titulo: val('f-titulo'), 
    descripcion: val('f-descripcion'), 
    fecha: val('f-fecha'),
    imagen_url: val('f-imagen-url'),
    enlace_url: val('f-enlace-url')
  };
  if (!body.titulo) { toast('El título es obligatorio.'); return; }
} else if (type === 'citas') {
    body = { titulo: val('f-titulo'), lugar: val('f-lugar'), descripcion: val('f-descripcion'), fecha: val('f-fecha'), estado: val('f-estado') };
    if (!body.titulo) { toast('El título es obligatorio.'); return; }
  } else if (type === 'playlist') {
    body = { titulo: val('f-titulo'), artista: val('f-artista'), enlace: val('f-enlace'), frase: val('f-frase') };
    if (!body.titulo) { toast('El título es obligatorio.'); return; }
  } else if (type === 'razones' || type === 'promesas') {
    body = { texto: val('f-texto') };
    if (!body.texto) { toast('El campo no puede estar vacío.'); return; }
  }

  const method = id ? 'PUT' : 'POST';
  const url    = '/api/' + type + (id ? '/' + id : '');

  try {
    await api(method, url, body);
    closeModal('modal-crud');
    toast(id ? '✓ Actualizado con éxito' : '✓ Guardado con éxito');
    // Recargar la sección correspondiente
    const reloaders = { recuerdos: loadRecuerdos, citas: loadCitas, playlist: loadPlaylist, razones: loadRazones, promesas: loadPromesas };
    if (reloaders[type]) reloaders[type]();
    if (type === 'recuerdos' || type === 'citas' || type === 'razones') loadDashboard();
  } catch {
    toast('Error al guardar. Verifica la conexión.');
  }
}

async function deleteItem(type, id) {
  if (!confirm('¿Eliminar este elemento? Esta acción no se puede deshacer.')) return;
  try {
    await api('DELETE', '/api/' + type + '/' + id);
    toast('Eliminado correctamente.');
    const reloaders = { recuerdos: loadRecuerdos, citas: loadCitas, playlist: loadPlaylist, razones: loadRazones, promesas: loadPromesas };
    if (reloaders[type]) reloaders[type]();
    loadDashboard();
  } catch {
    toast('Error al eliminar.');
  }
}

// ── BOTÓN PROHIBIDO ───────────────────────────────────────────
const forbiddenMsgs = [
  'Sabía que lo ibas a presionar...',
  'Era inevitable, en realidad.',
  'Por eso preparé esto para ti.',
  'Gracias por ser exactamente como eres.',
  'Te amo. Así de simple.',
];

function pressForbidden() {
  const content = $('forbidden-content');
  content.innerHTML = '';

  forbiddenMsgs.forEach((msg, i) => {
    const el = document.createElement('div');
    el.className = 'forbidden-msg';
    el.textContent = msg;
    el.style.animationDelay = (i * 0.5) + 's';
    content.appendChild(el);
  });

  const hearts = document.createElement('div');
  hearts.className = 'forbidden-hearts';
  hearts.textContent = '♡  ♡  ♡';
  hearts.style.animationDelay = (forbiddenMsgs.length * 0.5) + 's';
  hearts.style.opacity = '0';
  hearts.style.animation = `revealMsg 0.6s ease ${forbiddenMsgs.length * 0.5}s forwards`;
  content.appendChild(hearts);

  $('modal-forbidden').classList.add('open');
}

// ── PREGUNTA FINAL ────────────────────────────────────────────
function escapeNo(e) {
  const btn = $('btn-no');
  const parent = btn.parentElement;
  const rect = parent.getBoundingClientRect();

  const maxX = rect.width  - btn.offsetWidth  - 20;
  const maxY = rect.height - btn.offsetHeight - 20;

  const x = Math.floor(Math.random() * maxX) + 10;
  const y = Math.floor(Math.random() * maxY) + 10;

  btn.style.left = x + 'px';
  btn.style.top  = y + 'px';

  // Asegurar que el contenedor tenga posición relativa
  parent.style.position = 'relative';
  parent.style.minHeight = '80px';
  parent.style.minWidth  = '280px';
}

function responderSi() {
  $('pregunta-main').style.display = 'none';
  $('pregunta-btns').style.display = 'none';
  $('respuesta-final').classList.add('show');
}

// ── ESCAPING DE TEXTO (seguridad básica XSS) ──────────────────
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── EMPTY STATE ───────────────────────────────────────────────
function emptyState(icon, msg) {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">${icon}</div>
      <div class="empty-state-text">${msg}</div>
    </div>
  `;
}

// ── CERRAR MODALES CON ESC ────────────────────────────────────
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    if ($('modal-crud').classList.contains('open')) closeModal('modal-crud');
    if ($('modal-forbidden').classList.contains('open')) closeModal('modal-forbidden');
  }
});

// Cerrar modal al click fuera
$('modal-crud').addEventListener('click', function(e) {
  if (e.target === this) closeModal('modal-crud');
});
$('modal-forbidden').addEventListener('click', function(e) {
  if (e.target === this) closeModal('modal-forbidden');
});


/* ============================================================
   MÓDULO: Nuestro Tiempo
   ============================================================ */

// Estado del módulo tiempo (separado del estado global de SIGA)
const tiempoState = {
  usuarioId:   null,
  nombre:      null,
  usuarioSlug: null,  // 'yo' | 'ella'
  editandoId:  null,
  tabActual:   'mis',
};

// ── Selección de usuario en el mini-login ──────────────────────
function seleccionarTiempoUser(slug) {
  tiempoState.usuarioSlug = slug;
  document.querySelectorAll('.tiempo-user-btn').forEach(b => b.classList.remove('selected'));
  const btn = slug === 'yo' ? $('tbtn-yo') : $('tbtn-ella');
  if (btn) btn.classList.add('selected');
  const passEl = $('t-pass');
  if (passEl) { passEl.focus(); }
}

// ── Login del módulo ───────────────────────────────────────────
async function loginTiempo() {
  const slug     = tiempoState.usuarioSlug;
  const contrasena = $('t-pass') ? $('t-pass').value.trim() : '';
  const errEl    = $('t-login-error');

  if (errEl) errEl.textContent = '';

  if (!slug) {
    if (errEl) errEl.textContent = 'Elige quién eres (Yo o Ella).';
    return;
  }
  if (!contrasena) {
    if (errEl) errEl.textContent = 'Ingresa tu contraseña.';
    return;
  }

  try {
    const data = await api('POST', '/api/auth/login', { usuario: slug, contrasena });
    if (!data.ok) {
      if (errEl) errEl.textContent = data.error || 'Credenciales incorrectas.';
      return;
    }
    // Login exitoso
    tiempoState.usuarioId   = data.usuario_id;
    tiempoState.nombre      = data.nombre;
    tiempoState.usuarioSlug = slug;

    // Mostrar panel, ocultar login
    const loginWrap = $('tiempo-login-wrap');
    const panel     = $('tiempo-panel');
    if (loginWrap) loginWrap.style.display = 'none';
    if (panel)     panel.classList.add('active');

    // Actualizar badge
    const badge = $('tiempo-badge-nombre');
    if (badge) badge.textContent = data.nombre || slug;

    // Limpiar contraseña
    if ($('t-pass')) $('t-pass').value = '';

    // Cargar datos
    await loadDisponibilidades();
    await loadCoincidencias();
  } catch {
    if (errEl) errEl.textContent = 'No se pudo conectar con el servidor.';
  }
}

// ── Logout del módulo ──────────────────────────────────────────
function logoutTiempo() {
  tiempoState.usuarioId   = null;
  tiempoState.nombre      = null;
  tiempoState.usuarioSlug = null;
  tiempoState.editandoId  = null;

  const loginWrap = $('tiempo-login-wrap');
  const panel     = $('tiempo-panel');
  if (loginWrap) loginWrap.style.display = 'flex';
  if (panel)     panel.classList.remove('active');

  // Resetear selección
  document.querySelectorAll('.tiempo-user-btn').forEach(b => b.classList.remove('selected'));
  if ($('t-pass')) $('t-pass').value = '';
  if ($('t-login-error')) $('t-login-error').textContent = '';
}

// Al navegar a tiempo, si ya hay sesión activa no muestra login
const _origNavigateTo = window.navigateTo || null;

// Hook en la navegación para inicializar el módulo
const originalNavigateTo = navigateTo;
window.navigateTo = function(page) {
  originalNavigateTo(page);
  if (page === 'tiempo') {
    initTiempoPage();
  }
};

function initTiempoPage() {
  // Si ya está logueado en el módulo, mostrar panel
  if (tiempoState.usuarioId) {
    const loginWrap = $('tiempo-login-wrap');
    const panel     = $('tiempo-panel');
    if (loginWrap) loginWrap.style.display = 'none';
    if (panel)     panel.classList.add('active');
    loadDisponibilidades();
    loadCoincidencias();
  } else {
    // Mostrar login, ocultar panel
    const loginWrap = $('tiempo-login-wrap');
    const panel     = $('tiempo-panel');
    if (loginWrap) loginWrap.style.display = 'flex';
    if (panel)     panel.classList.remove('active');
  }
}

// ── Tabs ───────────────────────────────────────────────────────
function switchTiempoTab(tab) {
  tiempoState.tabActual = tab;

  document.querySelectorAll('.tiempo-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tiempo-tab-content').forEach(c => c.classList.remove('active'));

  const tabBtn     = tab === 'mis' ? $('ttab-mis')   : $('ttab-coin');
  const tabContent = tab === 'mis' ? $('tcontent-mis') : $('tcontent-coin');
  if (tabBtn)     tabBtn.classList.add('active');
  if (tabContent) tabContent.classList.add('active');

  if (tab === 'coincidencias') loadCoincidencias();
}

// ── Cargar mis disponibilidades ────────────────────────────────
async function loadDisponibilidades() {
  const container = $('list-disponibilidades');
  if (!container || !tiempoState.usuarioId) return;
  container.innerHTML = '<div style="color:var(--text-muted);padding:16px;">Cargando...</div>';

  try {
    const items = await api('GET', '/api/tiempo/disponibilidad?usuario_id=' + tiempoState.usuarioId);
    if (!items.length) {
      container.innerHTML = `
        <div class="tiempo-empty">
          <div class="tiempo-empty-icon">🕐</div>
          <div class="tiempo-empty-text">No tienes disponibilidades registradas.<br/>Agrega una para que podamos encontrar un momento.</div>
        </div>`;
      return;
    }

    container.innerHTML = items.map(d => {
      const fechaObj = new Date(d.fecha + 'T12:00:00');
      const dia = fechaObj.getDate();
      const mes = fechaObj.toLocaleDateString('es-BO', { month: 'short' }).toUpperCase();
      const dow = fechaObj.toLocaleDateString('es-BO', { weekday: 'long' });
      return `
        <div class="disp-item">
          <div class="disp-fecha-block">
            <div class="disp-fecha-dia">${dia}</div>
            <div class="disp-fecha-mes">${mes}</div>
          </div>
          <div class="disp-info">
            <div class="disp-horas">${formatHora(d.hora_inicio)} — ${formatHora(d.hora_fin)}</div>
            <div class="disp-msg">${dow}${d.mensaje ? ' · ' + esc(d.mensaje) : ''}</div>
          </div>
          <div class="disp-actions">
            <button class="btn btn-sm btn-edit" onclick="editarDisponibilidad(${d.id}, '${d.fecha.split('T')[0]}', '${d.hora_inicio}', '${d.hora_fin}', '${esc(d.mensaje || '')}')">✎</button>
            <button class="btn btn-sm btn-delete" onclick="eliminarDisponibilidad(${d.id})">✕</button>
          </div>
        </div>`;
    }).join('');
  } catch {
    container.innerHTML = '<div style="color:var(--danger);padding:16px;">Error al cargar disponibilidades.</div>';
  }
}

// ── Cargar coincidencias ───────────────────────────────────────
async function loadCoincidencias() {
  const container = $('list-coincidencias');
  if (!container || !tiempoState.usuarioId) return;
  container.innerHTML = '<div style="color:var(--text-muted);padding:16px;">Calculando coincidencias...</div>';

  try {
    const data = await api('GET', '/api/tiempo/coincidencias?usuario_id=' + tiempoState.usuarioId);

    if (data.sin_par) {
      container.innerHTML = `
        <div class="tiempo-empty">
          <div class="tiempo-empty-icon">🌙</div>
          <div class="tiempo-empty-text">El otro usuario aún no ha registrado disponibilidad.<br/>Cuando ambos lo hagan, verás aquí los momentos posibles.</div>
        </div>`;
      return;
    }

    const { coincidencias } = data;
    if (!coincidencias || !coincidencias.length) {
      container.innerHTML = `
        <div class="tiempo-empty">
          <div class="tiempo-empty-icon">🌙</div>
          <div class="tiempo-empty-text">Aún no hay fechas en común registradas.<br/>Agrega disponibilidades y revisa aquí los resultados.</div>
        </div>`;
      return;
    }

    container.innerHTML = coincidencias.map(c => {
      const fechaObj = new Date(c.fecha + 'T12:00:00');
      const fechaStr = fechaObj.toLocaleDateString('es-BO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

      if (c.hay_coincidencia) {
        return `
          <div class="coincidencia-card match">
            <div class="coincidencia-header">
              <span style="font-size:1.1rem;">💙</span>
              <div class="coincidencia-fecha">${fechaStr}</div>
            </div>
            <div class="coincidencia-resultado found">Encontramos un momento para vernos 💙</div>
            <div class="coincidencia-horario">
              ⏰ ${formatHora(c.inicio_coincidencia)} — ${formatHora(c.fin_coincidencia)}
            </div>
            <div class="coincidencia-mi-disp">
              Tu bloque: ${formatHora(c.mi_disponibilidad.hora_inicio)} – ${formatHora(c.mi_disponibilidad.hora_fin)}
              ${c.mi_disponibilidad.mensaje ? ' · ' + esc(c.mi_disponibilidad.mensaje) : ''}
            </div>
          </div>`;
      } else {
        return `
          <div class="coincidencia-card no-match">
            <div class="coincidencia-header">
              <span style="font-size:1.1rem;">🌙</span>
              <div class="coincidencia-fecha">${fechaStr}</div>
            </div>
            <div class="coincidencia-resultado not-found">Esta vez nuestros tiempos no se cruzaron, pero podemos intentar otra fecha 🌙</div>
            <div class="coincidencia-mi-disp" style="margin-top:8px;">
              Tu bloque: ${formatHora(c.mi_disponibilidad.hora_inicio)} – ${formatHora(c.mi_disponibilidad.hora_fin)}
            </div>
          </div>`;
      }
    }).join('');
  } catch {
    container.innerHTML = '<div style="color:var(--danger);padding:16px;">Error al calcular coincidencias.</div>';
  }
}

// ── Modal disponibilidad ───────────────────────────────────────
function openModalTiempo() {
  tiempoState.editandoId = null;
  const titleEl = $('modal-tiempo-title');
  if (titleEl) titleEl.textContent = 'Agregar disponibilidad';
  if ($('t-fecha'))   $('t-fecha').value   = '';
  if ($('t-inicio'))  $('t-inicio').value  = '';
  if ($('t-fin'))     $('t-fin').value     = '';
  if ($('t-mensaje')) $('t-mensaje').value = '';
  $('modal-tiempo').classList.add('open');
  setTimeout(() => { if ($('t-fecha')) $('t-fecha').focus(); }, 100);
}

function editarDisponibilidad(id, fecha, inicio, fin, mensaje) {
  tiempoState.editandoId = id;
  const titleEl = $('modal-tiempo-title');
  if (titleEl) titleEl.textContent = 'Editar disponibilidad';
  if ($('t-fecha'))   $('t-fecha').value   = fecha;
  if ($('t-inicio'))  $('t-inicio').value  = inicio.substring(0, 5);
  if ($('t-fin'))     $('t-fin').value     = fin.substring(0, 5);
  if ($('t-mensaje')) $('t-mensaje').value = mensaje;
  $('modal-tiempo').classList.add('open');
}

async function guardarDisponibilidad() {
  if (!tiempoState.usuarioId) { toast('Primero inicia sesión en el módulo.'); return; }

  const fecha   = $('t-fecha')   ? $('t-fecha').value.trim()   : '';
  const inicio  = $('t-inicio')  ? $('t-inicio').value.trim()  : '';
  const fin     = $('t-fin')     ? $('t-fin').value.trim()     : '';
  const mensaje = $('t-mensaje') ? $('t-mensaje').value.trim() : '';

  if (!fecha || !inicio || !fin) { toast('Fecha, hora inicio y hora fin son obligatorios.'); return; }
  if (inicio >= fin)             { toast('La hora de inicio debe ser menor que la de fin.'); return; }

  const body = {
    usuario_id:  tiempoState.usuarioId,
    fecha, hora_inicio: inicio, hora_fin: fin,
    mensaje: mensaje || null,
  };

  try {
    if (tiempoState.editandoId) {
      await api('PUT', '/api/tiempo/disponibilidad/' + tiempoState.editandoId, body);
      toast('✓ Disponibilidad actualizada');
    } else {
      await api('POST', '/api/tiempo/disponibilidad', body);
      toast('✓ Disponibilidad guardada');
    }
    closeModal('modal-tiempo');
    tiempoState.editandoId = null;
    await loadDisponibilidades();
    await loadCoincidencias();
  } catch {
    toast('Error al guardar disponibilidad.');
  }
}

async function eliminarDisponibilidad(id) {
  if (!confirm('¿Eliminar esta disponibilidad?')) return;
  try {
    await api('DELETE', '/api/tiempo/disponibilidad/' + id, { usuario_id: tiempoState.usuarioId });
    toast('Eliminado correctamente.');
    await loadDisponibilidades();
    await loadCoincidencias();
  } catch {
    toast('Error al eliminar.');
  }
}

// ── Formatear hora HH:MM:SS → HH:MM ───────────────────────────
function formatHora(h) {
  if (!h) return '';
  return String(h).substring(0, 5);
}

// ── Enter en login de tiempo ───────────────────────────────────
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    const passEl = $('t-pass');
    if (passEl && document.activeElement === passEl) loginTiempo();
    if ($('modal-tiempo') && $('modal-tiempo').classList.contains('open')) {
      const active = document.activeElement;
      if (active && active.id !== 't-mensaje') return;
      // guardarDisponibilidad(); // no disparar en textarea
    }
  }
});

// Cerrar modal tiempo con Esc (ya cubierto por el listener global arriba)
// Pero agregamos el overlay click
const mTiempo = $('modal-tiempo');
if (mTiempo) {
  mTiempo.addEventListener('click', function(e) {
    if (e.target === this) closeModal('modal-tiempo');
  });
}
