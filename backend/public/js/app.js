'use strict';

// ── ESTADO GLOBAL ──────────────────────────────────────────────
const state = {
  currentPage: 'dashboard',
  modal: { type: null, id: null },
  cartaId: null,
  cartaOriginal: '',
  currentUser: null,
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
  const token = sessionStorage.getItem('siga_token');

  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) {
    opts.headers.Authorization = 'Bearer ' + token;
  }

  if (body) {
    opts.body = JSON.stringify(body);
  }

  let res;

  try {
    res = await fetch(url, opts);
  } catch (err) {
    console.error('FETCH FALLÓ:', err);
    throw new Error('Fetch falló: ' + err.message);
  }

  const text = await res.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    console.error('RESPUESTA NO JSON DEL SERVIDOR:', text);

    throw new Error(
      'Servidor respondió HTML/texto. Status ' + res.status + '. Respuesta: ' + text.slice(0, 120)
    );
  }

  if (res.status === 401) {
    sessionStorage.removeItem('siga_token');
    sessionStorage.removeItem('siga_user');
  }

  if (!res.ok) {
    console.error('ERROR API:', data);
  }

  return data;
}

function normalizarFecha(fecha) {
  if (!fecha) return '';

  if (typeof fecha === 'string' && fecha.includes('T')) {
    return fecha.split('T')[0];
  }

  if (typeof fecha === 'string') {
    return fecha.substring(0, 10);
  }

  return '';
}

function formatDate(d) {
  const fecha = normalizarFecha(d);
  if (!fecha) return '';

  const date = new Date(fecha + 'T12:00:00');
  if (isNaN(date.getTime())) return 'Fecha por revisar';

  return date.toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatFechaCorta(d) {
  const fecha = normalizarFecha(d);

  if (!fecha) {
    return { dia: '♡', mes: 'MATCH', texto: 'Fecha por revisar' };
  }

  const date = new Date(fecha + 'T12:00:00');

  if (isNaN(date.getTime())) {
    return { dia: '♡', mes: 'MATCH', texto: 'Fecha por revisar' };
  }

  return {
    dia: date.getDate(),
    mes: date.toLocaleDateString('es-BO', { month: 'short' }).toUpperCase(),
    texto: date.toLocaleDateString('es-BO', { weekday: 'long' })
  };
}

function formatFechaLarga(d) {
  const fecha = normalizarFecha(d);

  if (!fecha) return 'Fecha por revisar';

  const date = new Date(fecha + 'T12:00:00');

  if (isNaN(date.getTime())) return 'Fecha por revisar';

  return date.toLocaleDateString('es-BO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// ── LOGIN / LOGOUT ─────────────────────────────────────────────
async function doLogin() {
  const usuario = $('login-user').value.trim();
  const contrasena = $('login-pass').value.trim();

  $('login-error').textContent = '';

  if (!usuario || !contrasena) {
    $('login-error').textContent = 'Por favor completa los campos.';
    return;
  }

  try {
    const data = await api('POST', '/api/auth/login', { usuario, contrasena });

    if (data.ok) {
      state.currentUser = {
        id: data.id || data.usuario_id,
        usuario: data.usuario,
        nombre: data.nombre,
        display_name: data.display_name || data.nombre || data.usuario,
        color_perfil: data.color_perfil || '#22d3ee',
        rol: data.rol
      };

      sessionStorage.setItem('siga_user', JSON.stringify(state.currentUser));
      sessionStorage.setItem('siga_token', data.token);

      $('login-screen').style.display = 'none';
      $('app').classList.add('visible');

      renderUsuarioActual();
      forzarSeccion('dashboard');
    } else {
      $('login-error').textContent = data.error || 'Credenciales incorrectas.';
    }
  } catch (err) {
    console.error('ERROR LOGIN FRONTEND:', err);

    $('login-error').textContent =
      'Error real: ' + (err.message || 'No se pudo conectar con el servidor.');
  }
}

function doLogout() {
  state.currentUser = null;
  sessionStorage.removeItem('siga_user');
  sessionStorage.removeItem('siga_token');

  $('login-screen').style.display = 'flex';
  $('app').classList.remove('visible');

  $('login-user').value = '';
  $('login-pass').value = '';
}

function renderUsuarioActual() {
  if (!state.currentUser) return;

  const nombre = state.currentUser.display_name || state.currentUser.nombre || state.currentUser.usuario;
  const color = state.currentUser.color_perfil || '#22d3ee';

  const sidebarUser = $('sidebar-user');

  if (sidebarUser) {
    sidebarUser.innerHTML = `
      <span class="user-dot" style="background:${color};"></span>
      <span>${esc(nombre)}</span>
    `;
  }
}

// Enter en login + Escape para modales
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && $('login-screen') && $('login-screen').style.display !== 'none') {
    doLogin();
  }

  if (e.key === 'Escape') {
    if ($('modal-crud') && $('modal-crud').classList.contains('open')) closeModal('modal-crud');
    if ($('modal-tiempo') && $('modal-tiempo').classList.contains('open')) closeModal('modal-tiempo');
    if ($('modal-perfil') && $('modal-perfil').classList.contains('open')) closeModal('modal-perfil');
  }
});

// ── NAVEGACIÓN ─────────────────────────────────────────────────
function navigateTo(page) {
  const targetPage = $('page-' + page);

  if (!targetPage) {
    console.error('No existe la sección:', 'page-' + page);
    toast('No existe la sección: ' + page);
    return;
  }

  // Ocultar todas las páginas con !important para ganarle al CSS
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.setProperty('display', 'none', 'important');
    p.style.setProperty('visibility', 'hidden', 'important');
    p.style.setProperty('opacity', '0', 'important');
    p.style.setProperty('position', 'relative', 'important');
  });

  // Mostrar la página elegida
  targetPage.classList.add('active');
  targetPage.style.setProperty('display', 'block', 'important');
  targetPage.style.setProperty('visibility', 'visible', 'important');
  targetPage.style.setProperty('opacity', '1', 'important');
  targetPage.style.setProperty('position', 'relative', 'important');
  targetPage.style.setProperty('z-index', '5', 'important');

  // Activar botón correcto del menú
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const mapa = {
    dashboard: 'Dashboard',
    recuerdos: 'Recuerdos',
    citas: 'Nuestros planes',
    playlist: 'Playlist',
    razones: 'Razones',
    promesas: 'Promesas',
    carta: 'Carta',
    tiempo: '¿Nos vemos?',
    eventos: 'Misiones de conexión',
    cajita: 'Cajita especial',
    espacio: 'Mi espacio',
    pregunta: 'Pregunta final'
  };

  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.textContent.includes(mapa[page])) n.classList.add('active');
  });

  state.currentPage = page;

  if (typeof closeSidebar === 'function') closeSidebar();

  const loaders = {
    dashboard: typeof loadDashboard === 'function' ? loadDashboard : null,
    recuerdos: typeof loadRecuerdos === 'function' ? loadRecuerdos : null,
    citas: typeof loadCitas === 'function' ? loadCitas : null,
    playlist: typeof loadPlaylist === 'function' ? loadPlaylist : null,
    razones: typeof loadRazones === 'function' ? loadRazones : null,
    promesas: typeof loadPromesas === 'function' ? loadPromesas : null,
    carta: typeof loadCarta === 'function' ? loadCarta : null,
    eventos: typeof loadEventos === 'function' ? loadEventos : null,
    cajita: typeof loadCajita === 'function' ? loadCajita : null,
    espacio: typeof loadEspacio === 'function' ? loadEspacio : null
  };

  if (loaders[page]) loaders[page]();

  if (page === 'tiempo' && typeof initTiempoPage === 'function') {
    initTiempoPage();
  }
}

window.navigateTo = navigateTo;

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
    $('stat-dias').textContent      = data.dias      ?? '—';
    $('stat-recuerdos').textContent = data.recuerdos ?? '—';
    $('stat-citas').textContent     = data.citas     ?? '—';
    $('stat-razones').textContent   = data.razones   ?? '—';
  } catch {
    // Silencioso si no hay DB aún
  }
  cargarFraseDelDia();
  await cargarAvisoMatchDashboard();
  if (typeof cargarProgresoGlobal === 'function') {
    await cargarProgresoGlobal();
  }
}

function cargarFraseDelDia() {
  const el = $('frase-dia-text');
  if (!el) return;

  const frases = [
    'Hoy también cuenta como elegirnos con calma.',
    'No todo tiene que resolverse hoy; a veces basta con seguir aquí.',
    'Lo bonito también se cuida despacio.',
    'Un vínculo sano no presiona, acompaña.',
    'Que hoy haya cariño, incluso en lo pequeño.',
    'A veces amar también es dar espacio sin soltar la mano.',
    'No hace falta hacerlo perfecto, solo hacerlo con cariño.',
    'Hoy puede ser un buen día para cuidar lo nuestro.',
    'Lo que se construye con calma también puede ser fuerte.',
    'Estar presente también es una forma de amor.',
    'Un mensaje pequeño también puede abrazar.',
    'Que lo nuestro tenga paciencia, no prisa.',
    'A veces el amor se nota en cómo esperamos.',
    'No estamos compitiendo contra el tiempo, estamos aprendiendo a coincidir.',
    'Si hoy cuesta hablar, igual podemos cuidarnos bonito.',
    'No hay que presionar lo que queremos que florezca.',
    'El cariño también vive en los detalles silenciosos.',
    'Hoy no hace falta correr; basta con no soltarnos.',
    'Lo nuestro merece calma, no miedo.',
    'A veces quedarse también es decir te quiero.',
    'La ternura no siempre hace ruido.',
    'Hay formas suaves de decir aquí sigo.',
    'No todo silencio es distancia; a veces es cuidado.',
    'Que la paciencia sea más fuerte que la ansiedad.',
    'Hoy podemos elegir hablarnos bonito.',
    'Amar también es aprender el ritmo del otro.',
    'No hace falta tener todas las respuestas para cuidar algo real.',
    'Que tengas un maravilloso dia. Recuerda que siempre estas presente incluso en tu ausencia.',
    'El amor consumado no exige perfección.',
    'A veces un “estoy aquí” vale más que mil explicaciones.',
    'Que lo nuestro no se mida por la prisa, sino por el cuidado.',
    'Hoy también se puede empezar con calma.',
    'Si algo pesa, que no pese solo.',
    'Lo que importa también necesita pausas.',
    'No estamos hechos para adivinar, sino para aprender a hablar.',
    'Que hoy haya más calma que orgullo.',
    'A veces cuidar es preguntar menos y acompañar más.',
    'No todo tiene que doler para ser profundo. Aunque Fiodor diria lo contrario',
    'El cariño se nota en cómo tratamos lo frágil.',
    'Hoy podemos ser un lugar seguro.',
    'Que el miedo no decida por nosotros.',
    'A veces amar es respirar antes de responder.',
    'Lo nuestro puede ir despacio y seguir siendo valioso.',
    'El amor es una necesidad biologica (Fisher, 2003). Yo diria que tu eres mas una eleccion, que simple necesidad.',
    'Que la calma nos encuentre antes que la herida.',
    'Hay días en los que amar es simplemente no irse.',
    'A veces una pausa también cuida.',
    'No hace falta forced cercanía para que exista cariño.',
    'Que hoy el amor no sea presión, sino refugio.',
    'Lo sincero también puede ser suave.',
    'Hoy podemos hablarnos como si hubieramos descubierto lo que Sternberg llamo "imposible", porque no esta lejano.',
    'A veces el detalle más bonito es tener paciencia.',
    'Se dice que puedes gestionar tus emociones. La verdad es que no se puede. Contigo lo confirmo cada dia, porque es dificil no amarte tanto.',
    'Lo que queremos cuidar merece mejores formas.',
    'Hoy también podemos elegir la confianza.',
    'No todo se arregla rápido, pero se puede cuidar mientras tanto.',
    'Si hay distancia, que no falte respeto.',
    'Si hay silencio, que no falte cariño.',
    'Si hay miedo, que no falte honestidad.',
    'Si hay cansancio, que no falte cuidado.',
    'Que lo bonito no se pierda por no saber comunicar.',
    'A veces el amor empieza por elegir.',
    'Hoy no necesitamos intensidad, necesitamos calma.',
    'Lo nuestro no tiene que parecerse a nada más y tampoco lo hace.',
    'Cada vínculo tiene su propio ritmo.',
    'Que hoy podamos coincidir aunque sea un poquito.',
    'A veces un gesto pequeño cambia todo el día.',
    'No subestimes lo que una palabra suave puede hacer.',
    'Que la desconfianza no ocupe el lugar del cariño.',
    'Hoy también se puede reparar algo pequeño.',
    'Cuidar no siempre es resolver; a veces es estar.',
    'A veces lo más bonito es sentirse elegido sin presión.',
    'Que el día nos trate bonito.',
    'No hace falta estar bien todo el tiempo para merecer cariño.',
    'Podemos aprender a querernos mejor.',
    'Lo importante no es no fallar, sino volver con cuidado.',
    'Te mando un besito... tu sabras en donde.',
    'A veces preguntar con ternura evita muchas heridas.',
    'No somos perfectos; solo sabemos como "leernos".',
    'Que la calma sea nuestro punto de encuentro.',
    'Hoy podemos darnos un poco más de paciencia.',
    'El amor también necesita descanso.',
    'A veces cuidar es no insistir de más.',
    'Que lo nuestro tenga espacio para respirar.',
    'No todo alejamiento significa olvido.',
    'A veces el corazón necesita silencio para ordenar lo que siente.',
    'Hoy te invito a una cena en las estrellas donde mis sueños sean el lugar de encuentro. ¿Te apuntas?.',
    'Lo bonito también se protege con límites sanos.',
    'Amar no es invadir; amar también es respetar.',
    'Que podamos estar cerca sin apurarnos.',
    'Hoy puede bastar con una señal pequeña.',
    'No hace falta tener un gran día para tener un gesto bonito.',
    'Que nuestro amor sea más fuerte que la costumbre.',
    'A veces lo simple también sostiene.',
    'Lo nuestro merece palabras y acciones que no lastimen.',
    'Que hoy podamos cuidarnos incluso en lo difícil.',
    'No todo se dice de golpe; algunas cosas necesitan calma.',
    'A veces amar es esperar sin castigar.',
    'Que cada día tenga una forma pequeña de volver.',
    'Aquí también cabe la calma.'
  ];

  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), 0, 0);
  const diferencia = hoy - inicio;
  const diaDelAno = Math.floor(diferencia / (1000 * 60 * 60 * 24));

  const frase = frases[diaDelAno % frases.length];
  el.textContent = frase;
}

async function cargarAvisoMatchDashboard() {
  const box = $('dashboard-match-alert');
  if (!box) return;

  if (!state.currentUser || !state.currentUser.id) return;

  if (cargarAvisoMatchDashboard._loading) return;
  cargarAvisoMatchDashboard._loading = true;

  try {
    const data = await api('GET', '/api/tiempo/coincidencias?usuario_id=' + state.currentUser.id);

    let html = '';
    let matches = [];

    if (!data || !data.coincidencias || !data.coincidencias.length) {
      html = `
        <div class="dashboard-match-card sin-match">
          <div class="dashboard-match-icon">🌙</div>
          <div>
            <div class="dashboard-match-title">Aún no hay match de tiempo</div>
            <div class="dashboard-match-text">Cuando sus horarios coincidan, aparecerá aquí.</div>
          </div>
        </div>
      `;
    } else {
      matches = data.coincidencias.filter(c => c.hay_coincidencia);

      if (!matches.length) {
        html = `
          <div class="dashboard-match-card sin-match">
            <div class="dashboard-match-icon">🌙</div>
            <div>
              <div class="dashboard-match-title">Sin match por ahora</div>
              <div class="dashboard-match-text">Todavía no se cruzaron sus horarios, pero pueden intentar otra fecha.</div>
            </div>
          </div>
        `;
      } else {
        const m = matches[0];

        html = `
          <div class="dashboard-match-card hay-match">
            <div class="dashboard-match-icon">✨</div>
            <div>
              <div class="dashboard-match-title">¡MATCH DE TIEMPO!</div>
              <div class="dashboard-match-text">
                Hay un ratito para verse:
                <strong>${formatHora(m.inicio_coincidencia)} — ${formatHora(m.fin_coincidencia)}</strong>
                ${m.fecha ? `<br><span>${formatFechaLarga(m.fecha)}</span>` : ''}
              </div>
            </div>
            <button class="btn-ver-match" onclick="navigateTo('tiempo')">Ver detalles</button>
          </div>
        `;
      }
    }

    if (box.innerHTML.trim() !== html.trim()) {
      box.innerHTML = html;
    }

    if (matches.length) mostrarAvisoMatch(matches);
  } catch (err) {
    console.warn('No se pudo cargar aviso de match en dashboard:', err);
  } finally {
    cargarAvisoMatchDashboard._loading = false;
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
    window.recuerdosCache = items;
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

        <button class="btn btn-sm btn-edit" onclick="editarRecuerdoSeguro(${r.id})">Editar</button>
        <button class="btn btn-sm btn-delete" onclick="deleteItem('recuerdos', ${r.id})">Eliminar</button>
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
  state.modal.id = id || null;

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
      titleEl.textContent = isEdit ? 'Editar plan' : 'Nuevo plan';
      formEl.innerHTML = `
        <label>Título</label>
        <input type="text" id="f-titulo" value="${isEdit ? args[0] : ''}" placeholder="¿Qué vamos a hacer?"/>

        <label>Lugar</label>
        <input type="text" id="f-lugar" value="${isEdit ? args[1] : ''}" placeholder="¿Dónde?"/>

        <label>Fecha</label>
        <input type="date" id="f-fecha" value="${isEdit ? args[3] : ''}"/>

        <label>Estado</label>
        <select id="f-estado">
          <option value="pendiente" ${(!isEdit || args[4] === 'pendiente') ? 'selected' : ''}>Pendiente</option>
          <option value="cumplida" ${(isEdit && args[4] === 'cumplida') ? 'selected' : ''}>Cumplida</option>
          <option value="cancelada" ${(isEdit && args[4] === 'cancelada') ? 'selected' : ''}>Cancelada</option>
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

        <label>Enlace</label>
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

    cajita: () => {
      titleEl.textContent = isEdit ? 'Editar detalle especial' : 'Nuevo detalle especial';
      formEl.innerHTML = `
        <label>Título</label>
        <input type="text" id="f-titulo" value="${isEdit ? args[0] : ''}" placeholder="Ej: Carta de aniversario"/>

        <label>Tipo</label>
        <select id="f-tipo">
          <option value="carta" ${isEdit && args[1] === 'carta' ? 'selected' : ''}>Carta</option>
          <option value="juego" ${isEdit && args[1] === 'juego' ? 'selected' : ''}>Juego</option>
          <option value="mensaje" ${isEdit && args[1] === 'mensaje' ? 'selected' : ''}>Mensaje</option>
          <option value="bitacora" ${isEdit && args[1] === 'bitacora' ? 'selected' : ''}>Bitácora</option>
          <option value="otro" ${!isEdit || args[1] === 'otro' ? 'selected' : ''}>Otro</option>
        </select>

        <label>Descripción</label>
        <textarea id="f-descripcion" placeholder="¿Qué es este detalle?">${isEdit ? args[2] : ''}</textarea>

        <label>Enlace</label>
        <input type="url" id="f-enlace" value="${isEdit ? args[3] : ''}" placeholder="https://..."/>

        <label>Fecha</label>
        <input type="date" id="f-fecha" value="${isEdit ? args[4] : ''}"/>
      `;
    }
  };

  if (forms[type]) {
    forms[type]();
  } else {
    titleEl.textContent = 'Nuevo';
    formEl.innerHTML = '<p style="color:var(--danger);">Formulario no encontrado.</p>';
  }

  $('modal-crud').classList.add('open');

  setTimeout(() => {
    const first = formEl.querySelector('input, textarea, select');
    if (first) first.focus();
  }, 100);
}

function closeModal(id) {
  const modal = $(id);
  if (!modal) return;

  modal.classList.remove('open');

  if (id === 'modal-crud') {
    state.modal.type = null;
    state.modal.id = null;
  }
}

async function saveModal() {
  const { type, id } = state.modal;
  let body = {};

  const val = (sid) => {
    const el = $(sid);
    return el ? el.value.trim() : '';
  };

  if (type === 'recuerdos') {
    body = {
      titulo: val('f-titulo'),
      descripcion: val('f-descripcion'),
      fecha: val('f-fecha'),
      imagen_url: val('f-imagen-url'),
      enlace_url: val('f-enlace-url')
    };

    if (!body.titulo) {
      toast('El título es obligatorio.');
      return;
    }

  } else if (type === 'citas') {
    body = {
      titulo: val('f-titulo'),
      lugar: val('f-lugar'),
      descripcion: val('f-descripcion'),
      fecha: val('f-fecha'),
      estado: val('f-estado')
    };

    if (!body.titulo) {
      toast('El título es obligatorio.');
      return;
    }

  } else if (type === 'playlist') {
    body = {
      titulo: val('f-titulo'),
      artista: val('f-artista'),
      enlace: val('f-enlace'),
      frase: val('f-frase')
    };

    if (!body.titulo) {
      toast('El título es obligatorio.');
      return;
    }

  } else if (type === 'razones' || type === 'promesas') {
    body = {
      texto: val('f-texto')
    };

    if (!body.texto) {
      toast('El campo no puede estar vacío.');
      return;
    }

  } else if (type === 'cajita') {
    body = {
      titulo: val('f-titulo'),
      tipo: val('f-tipo'),
      descripcion: val('f-descripcion'),
      enlace: val('f-enlace'),
      fecha: val('f-fecha')
    };

    if (!body.titulo) {
      toast('El título es obligatorio.');
      return;
    }

    if (!body.enlace) {
      toast('El enlace es obligatorio.');
      return;
    }

  } else {
    toast('Tipo de formulario no válido.');
    return;
  }

  const method = id ? 'PUT' : 'POST';
  const url = '/api/' + type + (id ? '/' + id : '');

  try {
    const data = await api(method, url, body);

    if (data && data.error) {
      toast(data.error);
      return;
    }

    closeModal('modal-crud');
    toast(id ? '✓ Actualizado con éxito' : '✓ Guardado con éxito');

    const reloaders = {
      recuerdos: loadRecuerdos,
      citas: loadCitas,
      playlist: loadPlaylist,
      razones: loadRazones,
      promesas: loadPromesas,
      cajita: loadCajita
    };

    if (reloaders[type]) reloaders[type]();

    if (type === 'recuerdos' || type === 'citas' || type === 'razones') {
      loadDashboard();
    }

  } catch {
    toast('Error al guardar. Verifica la conexión.');
  }
}

async function deleteItem(type, id) {
  if (!confirm('¿Eliminar este elemento? Esta acción no se puede deshacer.')) return;

  try {
    const data = await api('DELETE', '/api/' + type + '/' + id);

    if (data && data.error) {
      toast(data.error);
      return;
    }

    toast('Eliminado correctamente.');

    const reloaders = {
      recuerdos: loadRecuerdos,
      citas: loadCitas,
      playlist: loadPlaylist,
      razones: loadRazones,
      promesas: loadPromesas,
      cajita: loadCajita
    };

    if (reloaders[type]) reloaders[type]();
    loadDashboard();

  } catch {
    toast('Error al eliminar.');
  }
}

const modalPerfil = $('modal-perfil');
if (modalPerfil) {
  modalPerfil.addEventListener('click', function(e) {
    if (e.target === this) closeModal('modal-perfil');
  });
}

// ── CAJITA ESPECIAL ───────────────────────────────────────────
async function loadCajita() {
  const container = $('list-cajita');
  if (!container) return;

  container.innerHTML = '<div style="color:var(--text-muted);padding:20px;">Cargando cajita...</div>';

  try {
    const items = await api('GET', '/api/cajita');
    window.cajitaCache = items;

    if (!items.length) {
      container.innerHTML = emptyState('🎁', 'Aún no hay detalles guardados en la cajita.');
      return;
    }

    const iconos = {
      carta: '💌',
      juego: '🎮',
      mensaje: '💬',
      bitacora: '📖',
      otro: '✨'
    };

    container.innerHTML = items.map(item => `
      <div class="item-card cajita-card">
        <div class="item-header">
          <div>
            <div class="item-title">${iconos[item.tipo] || '✨'} ${esc(item.titulo)}</div>
            <div class="item-meta">
              ${item.tipo ? esc(item.tipo) : 'otro'} ${item.fecha ? ' · ' + formatDate(item.fecha) : ''}
            </div>
          </div>
        </div>

        <p class="item-desc">${esc(item.descripcion || '')}</p>

        ${
          item.enlace
            ? `<a class="btn-link-recuerdo" href="${esc(item.enlace)}" target="_blank" rel="noopener">
                Abrir detalle especial ♡
              </a>`
            : ''
        }

        <div class="item-actions">
          <button class="btn btn-sm btn-edit" onclick="editarCajitaSeguro(${item.id})">Editar</button>
          <button class="btn btn-sm btn-delete" onclick="deleteItem('cajita', ${item.id})">Eliminar</button>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Error al cargar cajita:', err);
    container.innerHTML = '<div style="color:var(--danger);padding:20px;">Error al cargar la cajita.</div>';
  }
}

function editarCajitaSeguro(id) {
  const item = (window.cajitaCache || []).find(x => Number(x.id) === Number(id));

  if (!item) {
    toast('No se encontró el detalle para editar.');
    return;
  }

  openModal(
    'cajita',
    item.id,
    item.titulo || '',
    item.tipo || 'otro',
    item.descripcion || '',
    item.enlace || '',
    normalizarFecha(item.fecha)
  );
}

// ── MI CUENTA / PERFIL ─────────────────────────────────────────
async function abrirModalPerfil() {
  if (!state.currentUser || !state.currentUser.id) {
    toast('Primero inicia sesión.');
    return;
  }

  try {
    const data = await api('GET', '/api/auth/perfil/' + state.currentUser.id);

    if (!data.ok) {
      toast(data.error || 'No se pudo cargar el perfil.');
      return;
    }

    const u = data.usuario;

    $('perfil-display-name').value = u.display_name || u.nombre || u.usuario || '';
    $('perfil-usuario').value = u.usuario || '';
    $('perfil-contrasena-actual').value = '';
    $('perfil-nueva-contrasena').value = '';
    $('perfil-color').value = u.color_perfil || '#22d3ee';

    $('modal-perfil').classList.add('open');
  } catch (err) {
    console.error(err);
    toast('Error al cargar perfil.');
  }
}

async function guardarPerfil() {
  if (!state.currentUser || !state.currentUser.id) {
    toast('No hay usuario activo.');
    return;
  }

  const body = {
    display_name: $('perfil-display-name').value.trim(),
    nombre: $('perfil-display-name').value.trim(),
    usuario: $('perfil-usuario').value.trim(),
    contrasena_actual: $('perfil-contrasena-actual').value.trim(),
    nueva_contrasena: $('perfil-nueva-contrasena').value.trim(),
    color_perfil: $('perfil-color').value
  };

  if (!body.display_name) {
    toast('El nombre visible no puede estar vacío.');
    return;
  }

  if (!body.usuario) {
    toast('El usuario no puede estar vacío.');
    return;
  }

  try {
    const data = await api('PUT', '/api/auth/perfil/' + state.currentUser.id, body);

    if (!data.ok) {
      toast(data.error || 'No se pudo actualizar.');
      return;
    }

    const u = data.usuario;

    state.currentUser = {
      id: u.id,
      usuario: u.usuario,
      nombre: u.nombre,
      display_name: u.display_name,
      color_perfil: u.color_perfil,
      rol: u.rol
    };

    sessionStorage.setItem('siga_user', JSON.stringify(state.currentUser));

    renderUsuarioActual();
    closeModal('modal-perfil');

    toast('Perfil actualizado ♡');
  } catch (err) {
    console.error(err);
    toast('Error al guardar perfil.');
  }
}

// ── PREGUNTA FINAL ────────────────────────────────────────────
function escapeNo(e) {
  const btnNo = $('btn-no');
  const btnSi = $('btn-si');
  const zona = $('pregunta-zona');

  if (!btnNo || !btnSi || !zona) return;

  const zonaW = zona.clientWidth;
  const zonaH = zona.clientHeight;

  const noW = btnNo.offsetWidth;
  const noH = btnNo.offsetHeight;

  const siX = btnSi.offsetLeft;
  const siY = btnSi.offsetTop;
  const siW = btnSi.offsetWidth;
  const siH = btnSi.offsetHeight;

  const margen = 40;

  const posiciones = [
    { x: 0, y: 0 },
    { x: zonaW - noW, y: 0 },
    { x: 0, y: zonaH - noH },
    { x: zonaW - noW, y: zonaH - noH },
    { x: Math.floor((zonaW - noW) / 2), y: 0 },
    { x: Math.floor((zonaW - noW) / 2), y: zonaH - noH },
    { x: 0, y: Math.floor((zonaH - noH) / 2) },
    { x: zonaW - noW, y: Math.floor((zonaH - noH) / 2) },
    { x: Math.floor((zonaW - noW) / 2), y: Math.floor((zonaH - noH) / 2) }
  ];

  const posicionesSeguras = posiciones.filter(pos => {
    const choca =
      pos.x < siX + siW + margen &&
      pos.x + noW > siX - margen &&
      pos.y < siY + siH + margen &&
      pos.y + noH > siY - margen;

    return !choca;
  });

  const lista = posicionesSeguras.length ? posicionesSeguras : posiciones;
  const destino = lista[Math.floor(Math.random() * lista.length)];

  btnNo.style.left = destino.x + 'px';
  btnNo.style.top = destino.y + 'px';
  btnNo.style.right = 'auto';
  btnNo.style.transform = 'none';
}

function responderSi() {
  $('pregunta-main').style.display = 'none';

  const zona = $('pregunta-zona');
  if (zona) zona.style.display = 'none';

  const btns = $('pregunta-btns');
  if (btns) btns.style.display = 'none';

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

const modalCrud = $('modal-crud');
if (modalCrud) {
  modalCrud.addEventListener('click', function(e) {
    if (e.target === this) closeModal('modal-crud');
  });
}

const modalPerfil2 = $('modal-perfil');
if (modalPerfil2) {
  modalPerfil2.addEventListener('click', function(e) {
    if (e.target === this) closeModal('modal-perfil');
  });
}

/* ============================================================
   MÓDULO: Nuestro Tiempo
   ============================================================ */
const tiempoState = {
  usuarioId:   null,
  nombre:      null,
  usuarioSlug: null,
  editandoId:  null,
  tabActual:   'mis',
};

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
      const fechaInfo = formatFechaCorta(d.fecha);
      const dia = fechaInfo.dia;
      const mes = fechaInfo.mes;
      const dow = fechaInfo.texto;
      const fechaEditar = normalizarFecha(d.fecha);

      return `
        <div class="disp-item">
          <div class="disp-fecha-block">
            <div class="disp-fecha-dia">${dia}</div>
            <div class="disp-fecha-mes">${mes}</div>
          </div>
          <div class="disp-info">
            <div class="disp-horas">${formatHora(d.hora_inicio)} — ${formatHora(d.hora_fin)}</div>
            <div class="disp-msg">
              ${dow === 'Fecha por revisar' ? 'Fecha pendiente de revisar' : dow}
              ${d.lugar ? ' · 📍 ' + esc(d.lugar) : ''}
              ${d.mensaje ? ' · ' + esc(d.mensaje) : ''}
            </div>
          </div>
          <div class="disp-actions">
            <button class="btn btn-sm btn-edit" onclick="editarDisponibilidad(${d.id}, '${fechaEditar}', '${d.hora_inicio}', '${d.hora_fin}', '${esc(d.lugar || '')}', '${esc(d.mensaje || '')}')">✎</button>
            <button class="btn btn-sm btn-delete" onclick="eliminarDisponibilidad(${d.id})">✕</button>
          </div>
        </div>`;
    }).join('');
  } catch {
    container.innerHTML = '<div style="color:var(--danger);padding:16px;">Error al cargar disponibilidades.</div>';
  }
}

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
          <div class="tiempo-empty-text">
            El otro usuario aún no ha registrado disponibilidad.<br/>
            Cuando ambos lo hagan, verás aquí los momentos posibles.
          </div>
        </div>`;
      return;
    }

    const { coincidencias } = data;

    if (!coincidencias || !coincidencias.length) {
      container.innerHTML = `
        <div class="tiempo-empty">
          <div class="tiempo-empty-icon">🌙</div>
          <div class="tiempo-empty-text">
            Aún no hay match de tiempo.<br/>
            Cuando sus horarios se crucen, aquí aparecerá el momento posible.
          </div>
        </div>`;
      return;
    }

    mostrarAvisoMatch(coincidencias);

    container.innerHTML = coincidencias.map(c => {
      const fechaStr = formatFechaLarga(c.fecha);
      const mi = c.mi_disponibilidad || {};
      const otra = c.otra_disponibilidad || {};

      const textoLugar = (valor) => valor ? `📍 ${esc(valor)}` : '📍 Sin lugar sugerido';
      const textoMensaje = (valor) => valor ? `💬 ${esc(valor)}` : '💬 Sin mensaje';

      const miLugar = textoLugar(mi.lugar);
      const miMensaje = textoMensaje(mi.mensaje);
      const otraLugar = textoLugar(otra.lugar);
      const otraMensaje = textoMensaje(otra.mensaje);

      if (c.hay_coincidencia) {
        return `
          <div class="coincidencia-card match">
            <div class="coincidencia-header">
              <span style="font-size:1.1rem;">💙</span>
              <div class="coincidencia-fecha">${fechaStr}</div>
            </div>
            <div class="coincidencia-resultado found">✨ MATCH de tiempo 💙</div>
            <div class="coincidencia-horario">
              ⏰ ${formatHora(c.inicio_coincidencia)} — ${formatHora(c.fin_coincidencia)}
            </div>
            <div class="coincidencia-mi-disp">
              <strong>Tu bloque:</strong>
              <span>${formatHora(mi.hora_inicio)} – ${formatHora(mi.hora_fin)}</span>
              <div style="margin-top:6px;">${miLugar}</div>
              <div style="margin-top:4px;">${miMensaje}</div>
            </div>
            <div class="coincidencia-mi-disp" style="margin-top:10px;border-top:1px solid rgba(255,255,255,.08);padding-top:10px;">
              <strong>Su bloque:</strong>
              <span>${formatHora(otra.hora_inicio)} – ${formatHora(otra.hora_fin)}</span>
              <div style="margin-top:6px;">${otraLugar}</div>
              <div style="margin-top:4px;">${otraMensaje}</div>
            </div>
          </div>`;
      }

      return `
        <div class="coincidencia-card no-match">
          <div class="coincidencia-header">
            <span style="font-size:1.1rem;">🌙</span>
            <div class="coincidencia-fecha">${fechaStr}</div>
          </div>
          <div class="coincidencia-resultado not-found">Sin match por ahora 🌙</div>
          <div class="coincidencia-mi-disp" style="margin-top:8px;">
            <strong>Tu bloque:</strong>
            <span>${formatHora(mi.hora_inicio)} – ${formatHora(mi.hora_fin)}</span>
            <div style="margin-top:6px;">${miLugar}</div>
            <div style="margin-top:4px;">${miMensaje}</div>
          </div>
          ${otra.hora_inicio ? `
            <div class="coincidencia-mi-disp" style="margin-top:10px;border-top:1px solid rgba(255,255,255,.08);padding-top:10px;">
              <strong>Su bloque:</strong>
              <span>${formatHora(otra.hora_inicio)} – ${formatHora(otra.hora_fin)}</span>
              <div style="margin-top:6px;">${otraLugar}</div>
              <div style="margin-top:4px;">${otraMensaje}</div>
            </div>
          ` : ''}
        </div>`;
    }).join('');

  } catch (err) {
    console.error('Error al calcular coincidencias:', err);
    container.innerHTML = '<div style="color:var(--danger);padding:16px;">Error al calcular coincidencias.</div>';
  }
}

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

function openModalTiempo() {
  tiempoState.editandoId = null;
  const titleEl = $('modal-tiempo-title');
  if (titleEl) titleEl.textContent = 'Agregar disponibilidad';
  if ($('t-fecha'))   $('t-fecha').value   = '';
  if ($('t-inicio'))  $('t-inicio').value  = '';
  if ($('t-fin'))     $('t-fin').value     = '';
  if ($('t-lugar'))   $('t-lugar').value   = '';
  if ($('t-mensaje')) $('t-mensaje').value = '';
  $('modal-tiempo').classList.add('open');
  setTimeout(() => { if ($('t-fecha')) $('t-fecha').focus(); }, 100);
}

function editarDisponibilidad(id, fecha, inicio, fin, lugar, mensaje) {
  tiempoState.editandoId = id;
  const titleEl = $('modal-tiempo-title');
  if (titleEl) titleEl.textContent = 'Editar disponibilidad';
  if ($('t-fecha'))   $('t-fecha').value   = fecha;
  if ($('t-inicio'))  $('t-inicio').value  = inicio.substring(0, 5);
  if ($('t-fin'))     $('t-fin').value     = fin.substring(0, 5);
  if ($('t-lugar'))   $('t-lugar').value   = lugar || '';
  if ($('t-mensaje')) $('t-mensaje').value = mensaje || '';
  $('modal-tiempo').classList.add('open');
}

async function guardarDisponibilidad() {
  if (!tiempoState.usuarioId) { toast('Primero inicia sesión en el módulo.'); return; }

  const fecha   = $('t-fecha')   ? $('t-fecha').value.trim()   : '';
  const inicio  = $('t-inicio')  ? $('t-inicio').value.trim()  : '';
  const fin     = $('t-fin')     ? $('t-fin').value.trim()     : '';
  const lugar   = $('t-lugar')   ? $('t-lugar').value.trim()   : '';
  const mensaje = $('t-mensaje') ? $('t-mensaje').value.trim() : '';

  if (!fecha || !inicio || !fin) { toast('Fecha, hora inicio y hora fin son obligatorios.'); return; }
  if (inicio >= fin)             { toast('La hora de inicio debe ser menor que la de fin.'); return; }

  const body = {
    usuario_id: tiempoState.usuarioId,
    fecha,
    hora_inicio: inicio,
    hora_fin: fin,
    lugar: lugar || null,
    mensaje: mensaje || null,
  };

  try {
    const data = tiempoState.editandoId
      ? await api('PUT', '/api/tiempo/disponibilidad/' + tiempoState.editandoId, body)
      : await api('POST', '/api/tiempo/disponibilidad', body);

    if (data && data.error) {
      toast(data.error);
      return;
    }

    toast(tiempoState.editandoId ? '✓ Disponibilidad actualizada' : '✓ Disponibilidad guardada');
    closeModal('modal-tiempo');
    tiempoState.editandoId = null;
    await loadDisponibilidades();
    await loadCoincidencias();
    await loadDashboard();
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

function formatHora(h) {
  if (!h) return '';
  return String(h).substring(0, 5);
}

const mTiempo = $('modal-tiempo');
if (mTiempo) {
  mTiempo.addEventListener('click', function(e) {
    if (e.target === this) closeModal('modal-tiempo');
  });
}

/* ======================================================
   FIX DEFINITIVO SIGA - MOSTRAR SECCIONES
   ====================================================== */
function forzarSeccion(page) {
  const pagina = document.getElementById('page-' + page);

  if (!pagina) {
    console.error('No existe page-' + page);
    return;
  }

  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.setProperty('display', 'none', 'important');
    p.style.setProperty('visibility', 'hidden', 'important');
    p.style.setProperty('opacity', '0', 'important');
  });

  pagina.classList.add('active');
  pagina.style.setProperty('display', 'block', 'important');
  pagina.style.setProperty('visibility', 'visible', 'important');
  pagina.style.setProperty('opacity', '1', 'important');

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.remove('active');
  });

  const textos = {
    dashboard: 'Dashboard',
    recuerdos: 'Recuerdos',
    citas: 'Nuestros planes',
    playlist: 'Playlist',
    razones: 'Razones',
    promesas: 'Promesas',
    carta: 'Carta',
    tiempo: '¿Nos vemos?',
    eventos: 'Misiones de conexión',
    cajita: 'Cajita especial',
    espacio: 'Mi espacio',
    calma: 'Modo avión',
    pregunta: 'Pregunta final'
  };

  document.querySelectorAll('.nav-item').forEach(btn => {
    if (btn.textContent.includes(textos[page])) {
      btn.classList.add('active');
    }
  });

  if (page === 'dashboard' && typeof loadDashboard === 'function') loadDashboard();
  if (page === 'recuerdos' && typeof loadRecuerdos === 'function') loadRecuerdos();
  if (page === 'citas' && typeof loadCitas === 'function') loadCitas();
  if (page === 'playlist' && typeof loadPlaylist === 'function') loadPlaylist();
  if (page === 'razones' && typeof loadRazones === 'function') loadRazones();
  if (page === 'promesas' && typeof loadPromesas === 'function') loadPromesas();
  if (page === 'carta' && typeof loadCarta === 'function') loadCarta();
  if (page === 'eventos' && typeof loadEventos === 'function') loadEventos();
  if (page === 'cajita' && typeof loadCajita === 'function') loadCajita();
  if (page === 'espacio' && typeof loadEspacio === 'function') loadEspacio();
  if (page === 'tiempo' && typeof initTiempoPage === 'function') initTiempoPage();
  if (page === 'calma' && typeof loadCalma === 'function') loadCalma();
}

window.forzarSeccion = forzarSeccion;
window.navigateTo = forzarSeccion;

document.addEventListener('click', function(e) {
  const btn = e.target.closest('.nav-item');
  if (!btn) return;

  const texto = btn.textContent.trim();

  if (texto.includes('Dashboard')) forzarSeccion('dashboard');
  else if (texto.includes('Recuerdos')) forzarSeccion('recuerdos');
  else if (texto.includes('Nuestros planes')) forzarSeccion('citas');
  else if (texto.includes('Playlist')) forzarSeccion('playlist');
  else if (texto.includes('Razones')) forzarSeccion('razones');
  else if (texto.includes('Promesas')) forzarSeccion('promesas');
  else if (texto.includes('Carta')) forzarSeccion('carta');
  else if (texto.includes('¿Nos vemos?')) forzarSeccion('tiempo');
  else if (texto.includes('Misiones de conexión')) forzarSeccion('eventos');
  else if (texto.includes('Cajita especial')) forzarSeccion('cajita');
  else if (texto.includes('Mi espacio')) forzarSeccion('espacio');
  else if (texto.includes('Modo avión') || texto.includes('Modo calma')) forzarSeccion('calma');
});

/* ======================================================
   FIX: ¿NOS VEMOS? Usa la sesión principal de SIGA
   ====================================================== */
var initTiempoPage = function() {
  const loginWrap = document.getElementById('tiempo-login-wrap');
  const panel = document.getElementById('tiempo-panel');

  if (!state.currentUser || !state.currentUser.id) {
    if (loginWrap) loginWrap.style.display = 'none';
    if (panel) {
      panel.classList.remove('active');
      panel.style.display = 'none';
    }
    return;
  }

  tiempoState.usuarioId = state.currentUser.id;
  tiempoState.nombre = state.currentUser.display_name || state.currentUser.nombre || state.currentUser.usuario;
  tiempoState.usuarioSlug = state.currentUser.usuario;

  if (loginWrap) {
    loginWrap.style.setProperty('display', 'none', 'important');
    loginWrap.style.setProperty('visibility', 'hidden', 'important');
    loginWrap.style.setProperty('opacity', '0', 'important');
  }

  if (panel) {
    panel.classList.add('active');
    panel.style.setProperty('display', 'block', 'important');
    panel.style.setProperty('visibility', 'visible', 'important');
    panel.style.setProperty('opacity', '1', 'important');
  }

  const badge = document.getElementById('tiempo-badge-nombre');
  if (badge) {
    badge.textContent = tiempoState.nombre;
  }

  if (typeof loadDisponibilidades === 'function') loadDisponibilidades();
  if (typeof loadCoincidencias === 'function') loadCoincidencias();
};

window.initTiempoPage = initTiempoPage;

window.logoutTiempo = function() {
  navigateTo('dashboard');
};

setTimeout(function() {
  const pageTiempo = document.getElementById('page-tiempo');
  if (pageTiempo && pageTiempo.classList.contains('active')) {
    initTiempoPage();
  }
}, 500);

/* ======================================================
   MODO AVIÓN
   ====================================================== */
let calmaActual = null;

async function loadCalma() {
  const box = $('calma-activa-box');
  if (!box) return;

  if (!state.currentUser || !state.currentUser.id) {
    box.innerHTML = `
      <div class="calma-empty">
        <div class="calma-empty-icon">✈️</div>
        <h3>Primero inicia sesión</h3>
        <p>Necesitas iniciar sesión para ver Modo avión.</p>
      </div>`;
    return;
  }

  box.innerHTML = '<div style="color:var(--text-muted);padding:20px;">Cargando Modo avión...</div>';

  try {
    const data = await api('GET', '/api/calma/estado');

    if (!data.ok) {
      box.innerHTML = `
        <div class="calma-empty">
          <div class="calma-empty-icon">✈️</div>
          <h3>No se pudo cargar Modo avión</h3>
          <p>Intenta actualizar la página.</p>
        </div>`;
      return;
    }

    const activo = !!data.activo && data.modo;
    const modo = data.modo;
    calmaActual = activo ? modo : null;

    const soyAdmin = state.currentUser.rol === 'admin';
    const yoSoyQuienActivo = activo && Number(modo.usuario_id) === Number(state.currentUser.id);

    if (!activo) {
      box.innerHTML = `
        <div class="modo-avion-card">
          <div class="modo-avion-icon">✈️</div>
          <h2>Modo avión</h2>
          <p>Un botón simple para decir: no estoy disponible por ahora. No hay explicaciones largas ni presión.</p>
          ${soyAdmin ? `
            <div class="modo-avion-status tranquilo">
              <strong>Modo avión desactivado.</strong>
              <span>Nadie está en pausa por ahora.</span>
            </div>` : `
            <button class="btn-save modo-avion-main-btn" onclick="activarModoAvion()">
              Activar modo avión
            </button>`}
        </div>`;
      return;
    }

    if (yoSoyQuienActivo) {
      box.innerHTML = `
        <div class="modo-avion-card activo">
          <div class="modo-avion-icon">✈️</div>
          <h2>Estás en modo avión</h2>
          <p>No estás disponible por ahora. Puedes volver cuando tú decidas.</p>
          <div class="modo-avion-status activo">
            <strong>Modo avión activo.</strong>
            <span>${esc(modo.mensaje || 'Estoy en modo avión. No estoy disponible por ahora.')}</span>
          </div>
          <button class="btn-save modo-avion-main-btn" onclick="desactivarModoAvion()">
            Desactivar modo avión
          </button>
        </div>`;
      return;
    }

    box.innerHTML = `
      <div class="modo-avion-card activo">
        <div class="modo-avion-icon">✈️</div>
        <h2>${esc(modo.usuario_nombre || 'Esta persona')} está en modo avión</h2>
        <p>No está disponible por ahora. Puede volver cuando lo decida.</p>
        <div class="modo-avion-status activo">
          <strong>Modo avión activo.</strong>
          <span>${esc(modo.mensaje || 'Estoy en modo avión. No estoy disponible por ahora.')}</span>
        </div>
        <div class="modo-avion-status tranquilo">
          <strong>No puedes desactivarlo tú.</strong>
          <span>Solo la persona que activó Modo avión puede quitarlo.</span>
        </div>
      </div>`;

  } catch (err) {
    console.error('Error cargando Modo avión:', err);
    box.innerHTML = `
      <div class="calma-empty">
        <div class="calma-empty-icon">✈️</div>
        <h3>Error al cargar Modo avión</h3>
        <p>Revisa la conexión o intenta actualizar la página.</p>
      </div>`;
  }
}

async function activarModoAvion() {
  if (!state.currentUser || !state.currentUser.id) { toast('Primero inicia sesión.'); return; }
  if (state.currentUser.rol === 'admin') { toast('El admin no puede activar Modo avión.'); return; }

  try {
    const data = await api('POST', '/api/calma/activar', {
      usuario_id: state.currentUser.id,
      mensaje: 'Estoy en modo avión. No estoy disponible por ahora.'
    });
    if (!data.ok) { toast(data.error || 'No se pudo activar Modo avión.'); return; }
    toast(data.mensaje_bonito || 'Modo avión activado.');
    loadCalma();
  } catch (err) {
    console.error('Error activando Modo avión:', err);
    toast('Error al activar Modo avión.');
  }
}

async function desactivarModoAvion() {
  if (!state.currentUser || !state.currentUser.id) { toast('Primero inicia sesión.'); return; }

  try {
    const data = await api('POST', '/api/calma/desactivar', { usuario_id: state.currentUser.id });
    if (!data.ok) { toast(data.error || 'No se pudo desactivar Modo avión.'); return; }
    toast(data.mensaje_bonito || 'Modo avión desactivado.');
    loadCalma();
  } catch (err) {
    console.error('Error desactivando Modo avión:', err);
    toast('Error al desactivar Modo avión.');
  }
}

window.loadCalma = loadCalma;
window.activarModoAvion = activarModoAvion;
window.desactivarModoAvion = desactivarModoAvion;

function editarRecuerdoSeguro(id) {
  const r = (window.recuerdosCache || []).find(x => Number(x.id) === Number(id));
  if (!r) { toast('No se encontró el recuerdo.'); return; }

  openModal(
    'recuerdos',
    r.id,
    r.titulo || '',
    r.descripcion || '',
    r.fecha ? normalizarFecha(r.fecha) : '',
    r.imagen_url || '',
    r.enlace_url || ''
  );
}

/* Loader para admin.js y puntos.js */
(function cargarModulosExtraSIGA(){
  function cargarScript(src,id){if(document.getElementById(id))return;const s=document.createElement('script');s.src=src+'?v=puntos-globales-2';s.id=id;document.body.appendChild(s)}
  cargarScript('/js/puntos.js','siga-puntos-js');
  cargarScript('/js/admin.js','siga-admin-js');
})();

// ======================================================
// FIX PANEL ADMIN VISIBLE SOLO PARA ADMIN
// ======================================================
(function () {
  function mostrarPanelAdminSiCorresponde() {
    try {
      const user = JSON.parse(sessionStorage.getItem('siga_user') || 'null');
      const navAdmin = document.getElementById('nav-admin-panel');
      if (!navAdmin) return;
      navAdmin.style.display = (user && user.rol === 'admin') ? 'flex' : 'none';
    } catch (err) {
      console.warn('No se pudo validar panel admin:', err);
    }
  }

  document.addEventListener('DOMContentLoaded', mostrarPanelAdminSiCorresponde);

  const viejoDoLoginAdminFix = window.doLogin;
  window.doLogin = async function () {
    if (typeof viejoDoLoginAdminFix === 'function') await viejoDoLoginAdminFix();
    setTimeout(mostrarPanelAdminSiCorresponde, 300);
  };
  window.mostrarPanelAdminSiCorresponde = mostrarPanelAdminSiCorresponde;
})();
