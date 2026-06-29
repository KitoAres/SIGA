/* SIGA — admin.js limpio, completo y corregido con Psicometría */

(function () {
  function qs(id) {
    return document.getElementById(id);
  }

  function esc(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function getUser() {
    if (typeof state !== 'undefined' && state.currentUser) {
      return state.currentUser;
    }

    try {
      return JSON.parse(sessionStorage.getItem('siga_user') || 'null');
    } catch {
      return null;
    }
  }

  function isAdmin() {
    const user = getUser();
    return !!(user && user.rol === 'admin');
  }

  function getToken() {
    return sessionStorage.getItem('siga_token') || '';
  }

  async function adminFetch(url, options = {}) {
    const token = getToken();

    const headers = {
      ...(options.headers || {})
    };

    if (token) {
      headers.Authorization = 'Bearer ' + token;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    const text = await response.text();
    let data = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch (err) {
      console.error('Respuesta no JSON en admin:', text);
      return {
        ok: false,
        error: 'El servidor respondió algo raro. Revisa consola.'
      };
    }

    if (response.status === 401) {
      sessionStorage.removeItem('siga_token');
      sessionStorage.removeItem('siga_user');
    }

    if (!response.ok) {
      console.error('Error admin API:', data);
    }

    return data;
  }

  function fmt(value) {
    if (!value) return '—';

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return String(value).slice(0, 16);
    }

    return date.toLocaleString('es-BO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function labelFuente(fuente) {
    return {
      todos: 'Todos los puntos',
      misiones: 'Misiones',
      coincidencias: 'Coincidencias',
      planes: 'Planes',
      recuerdos: 'Recuerdos',
      playlist: 'Playlist',
      razones: 'Razones',
      promesas: 'Promesas',
      cajita: 'Cajita',
      cartas: 'Cartas',
      calma: 'Modo calma',
      espacio: 'Mi espacio',
      accesos: 'Accesos',
      ajuste_admin: 'Ajustes admin'
    }[fuente] || fuente;
  }

  function iconFuente(fuente) {
    return {
      todos: '🏆',
      misiones: '🎯',
      coincidencias: '🕐',
      planes: '📅',
      recuerdos: '🌸',
      playlist: '🎵',
      razones: '💜',
      promesas: '🤍',
      cajita: '🎁',
      cartas: '✉️',
      calma: '🌙',
      espacio: '🌿',
      accesos: '👤',
      ajuste_admin: '🛠️'
    }[fuente] || '✨';
  }

  function miniRow(icon, title, meta, action = '') {
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

  function sourceCard(fuente, total, puntos) {
    return `
      <button class="admin-source-card" onclick="abrirDetalleAdmin('${esc(fuente)}')">
        <div class="admin-source-icon">${iconFuente(fuente)}</div>
        <div>
          <div class="admin-source-title">${labelFuente(fuente)}</div>
          <div class="admin-source-meta">${Number(total || 0)} registro(s)</div>
        </div>
        <strong>${Number(puntos || 0)} pts</strong>
      </button>
    `;
  }

  function asegurarUIAdmin() {
    const navAdmin = qs('nav-admin-panel');

    if (navAdmin) {
      navAdmin.style.display = isAdmin() ? 'flex' : 'none';
      navAdmin.onclick = function () {
        if (typeof navigateTo === 'function') {
          navigateTo('admin');
        }
        setTimeout(cargarPanelAdmin, 100);
      };
    }

    if (!isAdmin()) return;

    const nav = document.querySelector('.sidebar-nav');

    if (nav && !qs('nav-admin-panel')) {
      const btn = document.createElement('button');
      btn.className = 'nav-item';
      btn.id = 'nav-admin-panel';
      btn.innerHTML = '<span class="nav-icon">📊</span> Panel admin';
      btn.onclick = function () {
        if (typeof navigateTo === 'function') {
          navigateTo('admin');
        }
        setTimeout(cargarPanelAdmin, 100);
      };

      const divider = nav.querySelector('.nav-divider');
      if (divider) {
        nav.insertBefore(btn, divider);
      } else {
        nav.appendChild(btn);
      }
    }

    const main = document.querySelector('.main-content');
    if (!main) return;

    let section = qs('page-admin');

    if (!section) {
      section = document.createElement('section');
      section.className = 'page';
      section.id = 'page-admin';
      main.appendChild(section);
    }

    section.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Panel <span>admin</span></h1>
          <p class="page-subtitle">Estadísticas, actividad, accesos y puntos de conexión.</p>
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn" onclick="abrirAjusteAdmin()">Ajustar puntos</button>
          <button class="btn" onclick="cargarPanelAdmin()">Actualizar</button>
        </div>
      </div>

      <div class="admin-shell">
        <div class="admin-hero">
          <div class="admin-hero-icon">📊</div>
          <div>
            <h3 id="admin-nivel-titulo">Cargando nivel...</h3>
            <p id="admin-nivel-sub">Reuniendo puntos de conexión.</p>
            <div class="admin-progress-wrap">
              <div id="admin-progress-bar" class="admin-progress-bar" style="width:0%"></div>
            </div>
          </div>
        </div>

        <div id="admin-resumen-grid" class="admin-source-grid"></div>

        <div class="admin-two-cols">
          <div class="admin-box">
            <div class="admin-box-title">Puntos recientes</div>
            <div id="admin-puntos-recientes" class="admin-list-mini">Cargando...</div>
          </div>

          <div class="admin-box">
            <div class="admin-box-title">Accesos recientes <span class="admin-muted">(Panel General)</span></div>
            <div id="admin-accesos-recientes" class="admin-list-mini">Cargando...</div>
          </div>
        </div>

        <div class="admin-two-cols" style="margin-top:20px;">
          <div class="admin-box">
            <div class="admin-box-title">Actividad por usuario <span class="admin-muted">(Panel General)</span></div>
            <div id="admin-actividad-usuarios" class="admin-list-mini">Cargando...</div>
          </div>

          <div class="admin-box">
            <div class="admin-box-title">Historial de Tests <span class="admin-muted">(SiGy Analisi)</span></div>
            <div id="admin-lista-psicometria" class="admin-list-mini">Cargando...</div>
          </div>
        </div>
      </div>
    `;
  }

  async function cargarPanelAdmin() {
    asegurarUIAdmin();

    if (!isAdmin()) {
      alert('Solo admin.');
      return;
    }

    try {
      const data = await adminFetch('/api/admin/resumen?x=' + Date.now());

      if (!data.ok) {
        alert(data.error || 'No se pudo cargar panel admin.');
        return;
      }

      const puntos = data.puntos || {};
      const resumen = puntos.resumen || {};
      const nivel = puntos.nivel || {};
      const fuentes = puntos.por_fuente || [];
      const recientes = puntos.recientes || [];
      const accesos = data.accesos || {};

      if (qs('admin-nivel-titulo')) {
        qs('admin-nivel-titulo').textContent =
          `${nivel.emoji || '🏆'} Nivel ${nivel.nivel || 1} — ${nivel.nombre || 'Primeros destellos'} · ${resumen.puntos || 0} pts`;
      }

      if (qs('admin-nivel-sub')) {
        qs('admin-nivel-sub').textContent =
          `${resumen.registros || 0} acciones · ${resumen.hoy || 0} hoy · ${resumen.ultimos_7 || 0} en 7 días · faltan ${nivel.faltan || 0} pts`;
      }

      if (qs('admin-progress-bar')) {
        qs('admin-progress-bar').style.width = `${nivel.progreso || 0}%`;
      }

      if (qs('admin-resumen-grid')) {
        // Añadimos accesos directos al catálogo de inspección para no pisar consola
        const cards = [
          sourceCard('todos', resumen.registros || 0, resumen.puntos || 0),
          sourceCard('accesos', accesos.resumen?.total || 0, 0),
          sourceCard('cartas', 0, 0),
          sourceCard('recuerdos', 0, 0),
          sourceCard('playlist', 0, 0),
          sourceCard('razones', 0, 0),
          sourceCard('promesas', 0, 0),
          sourceCard('cajita', 0, 0),
          ...fuentes.map(f => sourceCard(f.fuente, f.total, f.puntos))
        ];

        // Remover duplicados visuales limpiando fuentes mapeadas fijas
        const unicas = [];
        const vistas = new Set();
        cards.forEach(html => {
          const match = html.match(/onclick="abrirDetalleAdmin\('(.+?)'\)"/);
          if (match && !vistas.has(match[1])) {
            vistas.add(match[1]);
            unicas.push(html);
          }
        });

        qs('admin-resumen-grid').innerHTML = unicas.join('');
      }

      if (qs('admin-puntos-recientes')) {
        if (!recientes.length) {
          qs('admin-puntos-recientes').innerHTML = '<div class="admin-empty">Todavía no hay puntos.</div>';
        } else {
          qs('admin-puntos-recientes').innerHTML = recientes.map(item => renderPuntoItem(item)).join('');
        }
      }

      if (qs('admin-accesos-recientes')) {
        const lista = accesos.recentes || [];

        if (!lista.length) {
          qs('admin-accesos-recientes').innerHTML = '<div class="admin-empty">Sin accesos registrados.</div>';
        } else {
          qs('admin-accesos-recientes').innerHTML = lista.map(item => renderAccesoItem(item)).join('');
        }
      }

      if (qs('admin-actividad-usuarios')) {
        const lista = accesos.por_usuario || [];

        if (!lista.length) {
          qs('admin-actividad-usuarios').innerHTML = '<div class="admin-empty">Sin actividad todavía.</div>';
        } else {
          qs('admin-actividad-usuarios').innerHTML = lista.map(item => `
            ${miniRow(
              '🟢',
              esc(item.usuario_nombre || 'Usuario'),
              `${item.total || 0} acceso(s) en 30 días · último ${fmt(item.ultimo)}`
            )}
          `).join('');
        }
      }

      await loadAnalisisAdmin();

    } catch (err) {
      console.error('Error cargando panel admin:', err);
      alert('Error cargando panel admin. Revisa consola.');
    }
  }

  function renderPuntoItem(item) {
    const puntos = Number(item.puntos || 0);
    const signo = puntos >= 0 ? '+' : '';

    return miniRow(
      iconFuente(item.fuente),
      `${esc(item.descripcion || labelFuente(item.fuente))} <span class="admin-chip">${signo}${puntos}</span>`,
      `${labelFuente(item.fuente)} · ${esc(item.usuario_nombre || 'Sin usuario')} · ${fmt(item.creado_en)}`,
      `<button class="btn-admin-danger" onclick="eliminarPuntoAdmin(${item.id})">Eliminar</button>`
    );
  }

  function renderAccesoItem(item) {
    return miniRow(
      '👤',
      esc(item.usuario_nombre || item.usuario || 'Usuario'),
      `${esc(item.rol || '—')} · ${fmt(item.creado_en)}${item.ip ? ' · IP ' + esc(item.ip) : ''}`,
      item.id ? `<button class="btn-admin-danger" onclick="eliminarAccesoAdmin(${item.id})">Eliminar</button>` : ''
    );
  }

  // NUEVO: Renderizado polimórfico para inspeccionar las tablas de contenido de las parejas sin usar terminal SQL
  function renderItemParejaGenerico(item, tipo) {
    const titulo = esc(item.titulo || item.texto || item.contenido || 'Contenido sin título');
    const subtitulo = esc(item.descripcion || item.frase || item.artista || 'Sin descripción extra');
    const creador = esc(item.creador_nombre || 'Desconocido');
    
    return miniRow(
      iconFuente(tipo),
      `<strong>[${creador}]</strong> ${titulo}`,
      `${subtitulo} ${item.fecha ? ' · ' + fmt(item.fecha) : ''}`,
      ''
    );
  }

  function asegurarModalDetalleAdmin() {
    if (qs('admin-detalle-modal')) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'admin-detalle-modal';

    modal.innerHTML = `
      <div class="modal admin-detalle-modal">
        <div id="admin-detalle-contenido"></div>
        <div class="modal-actions">
          <button class="btn-cancel" onclick="cerrarDetalleAdmin()">Cerrar</button>
        </div>
      </div>
    `;

    modal.onclick = function (event) {
      if (event.target === modal) cerrarDetalleAdmin();
    };

    document.body.appendChild(modal);
  }

  async function abrirDetalleAdmin(fuente) {
    asegurarModalDetalleAdmin();

    const user = getUser();
    const modal = qs('admin-detalle-modal');
    const box = qs('admin-detalle-contenido');

    if (!user || !isAdmin()) return;

    box.innerHTML = '<div style="padding:18px;color:var(--text-muted);">Cargando...</div>';
    modal.classList.add('open');

    try {
      const data = await adminFetch(`/api/admin/detalle/${encodeURIComponent(fuente)}?x=${Date.now()}`);

      if (!data.ok) {
        box.innerHTML = `<div style="color:var(--danger);padding:18px;">${esc(data.error || 'Error al cargar detalle.')}</div>`;
        return;
      }

      const items = data.items || [];
      const tipoColeccion = data.tipo || fuente;

      // Verificamos si es una inspección de tablas de parejas
      const esTablaPareja = ['recuerdos', 'playlist', 'razones', 'promesas', 'cajita', 'cartas'].includes(tipoColeccion);

      box.innerHTML = `
        <div class="admin-detalle-header">
          <div class="admin-source-icon grande">${iconFuente(fuente)}</div>
          <div>
            <div class="admin-kicker">Detalle</div>
            <h2>${labelFuente(fuente)}</h2>
            <p>${items.length} registro(s)</p>
          </div>
        </div>

        <div class="admin-detalle-list" style="max-height:450px; overflow-y:auto;">
          ${
            items.length
              ? items.map(item => {
                  if (tipoColeccion === 'accesos') return renderAccesoItem(item);
                  if (esTablaPareja) return renderItemParejaGenerico(item, tipoColeccion);
                  return renderPuntoItem(item);
                }).join('')
              : '<div class="admin-empty">No hay registros.</div>'
          }
        </div>
      `;

    } catch (err) {
      console.error(err);
      box.innerHTML = '<div style="color:var(--danger);padding:18px;">Error al cargar detalle.</div>';
    }
  }

  function cerrarDetalleAdmin() {
    const modal = qs('admin-detalle-modal');
    if (modal) modal.classList.remove('open');
  }

  async function eliminarPuntoAdmin(id) {
    const user = getUser();

    if (!user || !isAdmin()) {
      alert('Solo admin.');
      return;
    }

    if (!confirm('¿Eliminar este registro de puntos? Esto modificará el total.')) {
      return;
    }

    try {
      const data = await adminFetch(`/api/admin/puntos/${id}`, {
        method: 'DELETE'
      });

      if (!data.ok) {
        alert(data.error || 'No se pudo eliminar.');
        return;
      }

      toast('Registro de puntos eliminado.');
      await cargarPanelAdmin();

      if (typeof cargarProgresoGlobal === 'function') {
        cargarProgresoGlobal();
      }

      if (typeof cargarProgresoMisiones === 'function') {
        cargarProgresoMisiones();
      }

    } catch (err) {
      console.error(err);
      alert('Error al eliminar puntos.');
    }
  }

  async function eliminarAccesoAdmin(id) {
    const user = getUser();

    if (!user || !isAdmin()) {
      alert('Solo admin.');
      return;
    }

    if (!confirm('¿Eliminar este acceso del historial?')) {
      return;
    }

    try {
      const data = await adminFetch(`/api/admin/accesos/${id}`, {
        method: 'DELETE'
      });

      if (!data.ok) {
        alert(data.error || 'No se pudo eliminar acceso.');
        return;
      }

      toast('Acceso eliminado.');
      await cargarPanelAdmin();

    } catch (err) {
      console.error(err);
      alert('Error al eliminar acceso.');
    }
  }

  async function abrirAjusteAdmin() {
    const user = getUser();

    if (!user || !isAdmin()) {
      alert('Solo admin.');
      return;
    }

    const puntosTexto = prompt(
      '¿Cuántos puntos quieres ajustar?\n\nUsa positivo para sumar. Ej: 20\nUsa negativo para quitar. Ej: -15'
    );

    if (puntosTexto === null) return;

    const puntos = Number(puntosTexto);

    if (!Number.isFinite(puntos) || puntos === 0) {
      alert('Ingresa un número válido diferente de 0.');
      return;
    }

    const descripcion = prompt(
      'Descripción del ajuste:',
      puntos > 0 ? 'Puntos agregados por admin' : 'Puntos descontados por admin'
    );

    if (descripcion === null) return;

    const fuente = prompt(
      'Fuente del ajuste:\nmisiones, coincidencias, planes, recuerdos, playlist, razones, promesas, cajita, calma, espacio, ajuste_admin',
      'ajuste_admin'
    );

    if (fuente === null) return;

    try {
      const data = await adminFetch('/api/admin/ajuste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_afectado_id: null,
          puntos,
          descripcion,
          fuente
        })
      });

      if (!data.ok) {
        alert(data.error || 'No se pudo hacer el ajuste.');
        return;
      }

      toast(puntos > 0 ? `Ajuste agregado: +${puntos} pts` : `Ajuste aplicado: ${puntos} pts`);

      await cargarPanelAdmin();

      if (typeof cargarProgresoGlobal === 'function') {
        cargarProgresoGlobal();
      }

      if (typeof cargarProgresoMisiones === 'function') {
        cargarProgresoMisiones();
      }

    } catch (err) {
      console.error(err);
      alert('Error al ajustar puntos.');
    }
  }

  async function loadAnalisisAdmin() {
    const contenedor = qs('admin-lista-psicometria');
    if (!contenedor) return;

    contenedor.innerHTML = '<div style="padding:10px;color:var(--text-muted);">Cargando registros psicométricos...</div>';

    try {
      const data = await adminFetch('/api/analisis/admin/historial?x=' + Date.now());

      if (!Array.isArray(data)) {
        contenedor.innerHTML = '<div class="admin-empty">No se pudo formatear el historial.</div>';
        return;
      }

      if (data.length === 0) {
        contenedor.innerHTML = '<div class="admin-empty">No hay tests registrados aún.</div>';
        return;
      }

      contenedor.innerHTML = data.map(item => {
        let pts = {};
        try {
          pts = typeof item.puntajes_json === 'string' ? JSON.parse(item.puntajes_json) : item.puntajes_json;
        } catch (e) {
          pts = {};
        }

        const fechaFormateada = fmt(item.fecha);
        const detalles = Object.entries(pts)
          .map(([dim, val]) => `${dim}: <strong>${Number(val).toFixed(2)}</strong>`)
          .join(' | ');

        return `
          <div class="admin-mini-row" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding: 8px 0;">
            <div class="admin-mini-icon">🔺</div>
            <div class="admin-mini-content" style="color: #fff;">
              <div class="admin-mini-title" style="display:flex; justify-content:space-between;">
                <span style="color: #22d3ee; font-weight:bold;">${esc(item.usuario)}</span>
                <small style="color:var(--text-muted); font-size:0.75rem;">${fechaFormateada}</small>
              </div>
              <div class="admin-mini-meta" style="margin-top:2px;">Test: <span style="color:#ff6384;">${esc(item.test_id)}</span></div>
              <div style="font-size:0.78rem; color:#aaa; margin-top:3px;">${detalles}</div>
            </div>
          </div>
        `;
      }).join('');

    } catch (err) {
      console.error('Error cargando psicometría en admin:', err);
      contenedor.innerHTML = '<div class="admin-empty" style="color:var(--danger);">Error al conectar con el servidor.</div>';
    }
  }

  window.cargarPanelAdmin = cargarPanelAdmin;
  window.loadAdminPanel = cargarPanelAdmin;
  window.abrirDetalleAdmin = abrirDetalleAdmin;
  window.cerrarDetalleAdmin = cerrarDetalleAdmin;
  window.eliminarPuntoAdmin = eliminarPuntoAdmin;
  window.eliminarAccesoAdmin = eliminarAccesoAdmin;
  window.abrirAjusteAdmin = abrirAjusteAdmin;

  document.addEventListener('DOMContentLoaded', asegurarUIAdmin);
  setTimeout(asegurarUIAdmin, 500);
  setTimeout(asegurarUIAdmin, 1500);
})();
