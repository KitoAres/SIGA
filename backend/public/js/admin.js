/* SIGA — admin.js: panel admin separado con detalles clicables */
(function(){
  function qs(id){return document.getElementById(id)}
  function esc(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
  function user(){if(typeof state!=='undefined'&&state.currentUser)return state.currentUser;try{return JSON.parse(sessionStorage.getItem('siga_user'))}catch{return null}}
  function isAdmin(){const u=user();return !!(u&&u.rol==='admin')}
  function fmt(v){if(!v)return '—';const d=new Date(v);return isNaN(d.getTime())?String(v).slice(0,16):d.toLocaleString('es-BO',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}
  function label(f){return {todos:'Todos los puntos',misiones:'Misiones',coincidencias:'Coincidencias',planes:'Planes',recuerdos:'Recuerdos',playlist:'Playlist',razones:'Razones',promesas:'Promesas',cajita:'Cajita',calma:'Modo calma',accesos:'Accesos'}[f]||f}
  function icon(f){return {todos:'🏆',misiones:'🎯',coincidencias:'🕐',planes:'📅',recuerdos:'🌸',playlist:'🎵',razones:'💜',promesas:'🤍',cajita:'🎁',calma:'🌙',accesos:'👤'}[f]||'✨'}
  function mini(i,t,m,a=''){return `<div class="admin-mini-row"><div class="admin-mini-icon">${i}</div><div class="admin-mini-content"><div class="admin-mini-title">${t}</div><div class="admin-mini-meta">${m}</div></div>${a?`<div class="admin-mini-action">${a}</div>`:''}</div>`}
  function card(f,total,puntos){return `<button class="admin-source-card" onclick="abrirDetalleAdmin('${esc(f)}')"><div class="admin-source-icon">${icon(f)}</div><div><div class="admin-source-title">${label(f)}</div><div class="admin-source-meta">${Number(total||0)} registro(s)</div></div><strong>${Number(puntos||0)} pts</strong></button>`}
  function asegurarUI(){
    if(!isAdmin())return;
    const nav=document.querySelector('.sidebar-nav');
    if(nav&&!qs('nav-admin-panel')){const b=document.createElement('button');b.className='nav-item';b.id='nav-admin-panel';b.innerHTML='<span class="nav-icon">📊</span> Panel admin';b.onclick=()=>{if(typeof navigateTo==='function')navigateTo('admin');setTimeout(cargarPanelAdmin,60)};const d=nav.querySelector('.nav-divider');d?nav.insertBefore(b,d):nav.appendChild(b)}
    const main=document.querySelector('.main-content');
    if(main&&!qs('page-admin')){const s=document.createElement('section');s.className='page';s.id='page-admin';s.innerHTML=`<div class="page-header"><div><h1 class="page-title">Panel <span>admin</span></h1><p class="page-subtitle">Estadísticas, actividad y puntos de conexión. Solo admin.</p></div><button class="btn" onclick="cargarPanelAdmin()">Actualizar</button></div><div class="admin-shell"><div class="admin-hero"><div class="admin-hero-icon">📊</div><div><h3 id="admin-nivel-titulo">Cargando nivel...</h3><p id="admin-nivel-sub">Reuniendo puntos de conexión.</p><div class="admin-progress-wrap"><div id="admin-progress-bar" class="admin-progress-bar" style="width:0%"></div></div></div></div><div id="admin-resumen-grid" class="admin-source-grid"></div><div class="admin-two-cols"><div class="admin-box"><div class="admin-box-title">Puntos recientes</div><div id="admin-puntos-recientes" class="admin-list-mini">Cargando...</div></div><div class="admin-box"><div class="admin-box-title">Accesos recientes <span class="admin-muted">(sin admin)</span></div><div id="admin-accesos-recientes" class="admin-list-mini">Cargando...</div></div></div><div class="admin-box"><div class="admin-box-title">Actividad por usuario <span class="admin-muted">(sin admin)</span></div><div id="admin-actividad-usuarios" class="admin-list-mini">Cargando...</div></div></div>`;main.appendChild(s)}
  }
  async function cargarPanelAdmin(){
    asegurarUI(); if(!isAdmin()||!qs('page-admin'))return; const u=user();
    try{const r=await fetch('/api/admin/resumen?usuario_id='+encodeURIComponent(u.id)+'&x='+Date.now());const data=await r.json(); if(!data.ok)return alert(data.error||'No se pudo cargar panel');
      const n=data.puntos?.nivel||{}, res=data.puntos?.resumen||{}, fuentes=data.puntos?.por_fuente||[];
      if(qs('admin-nivel-titulo'))qs('admin-nivel-titulo').textContent=`${n.emoji||'🏆'} Nivel ${n.nivel||1} — ${n.nombre||'Primeros destellos'} · ${res.puntos||0} pts`;
      if(qs('admin-nivel-sub'))qs('admin-nivel-sub').textContent=`${res.registros||0} acciones · ${res.hoy||0} hoy · ${res.ultimos_7||0} en 7 días`;
      if(qs('admin-progress-bar'))qs('admin-progress-bar').style.width=`${n.progreso||0}%`;
      if(qs('admin-resumen-grid'))qs('admin-resumen-grid').innerHTML=[card('todos',res.registros,res.puntos),card('accesos',data.accesos?.resumen?.ultimos_30||0,0),...fuentes.map(f=>card(f.fuente,f.total,f.puntos))].join('');
      if(qs('admin-puntos-recientes')){const it=data.puntos?.recientes||[];qs('admin-puntos-recientes').innerHTML=it.length?it.map(p=>mini(icon(p.fuente),`${esc(p.descripcion||label(p.fuente))} <span class="admin-chip">+${p.puntos}</span>`,`${label(p.fuente)} · ${fmt(p.creado_en)}`,`<button class="btn-admin-danger" onclick="eliminarPuntoAdmin(${p.id})">Eliminar</button>`)).join(''):'<div class="admin-empty">Todavía no hay puntos.</div>'}
      if(qs('admin-accesos-recientes')){const it=data.accesos?.recientes||[];qs('admin-accesos-recientes').innerHTML=it.length?it.map(a=>mini('👤',esc(a.usuario_nombre||a.usuario||'Usuario'),`${esc(a.rol||'—')} · ${fmt(a.creado_en)}${a.ip?' · IP '+esc(a.ip):''}`)).join(''):'<div class="admin-empty">Sin accesos.</div>'}
      if(qs('admin-actividad-usuarios')){const it=data.accesos?.por_usuario||[];qs('admin-actividad-usuarios').innerHTML=it.length?it.map(a=>mini('🟢',esc(a.usuario_nombre||'Usuario'),`${a.total||0} acceso(s) en 30 días · último ${fmt(a.ultimo)}`)).join(''):'<div class="admin-empty">Sin actividad.</div>'}
    }catch(e){console.error(e);alert('Error al cargar panel admin')}
  }
  function modal(){if(qs('admin-detalle-modal'))return;const m=document.createElement('div');m.className='modal-overlay';m.id='admin-detalle-modal';m.innerHTML='<div class="modal admin-detalle-modal"><div id="admin-detalle-contenido"></div><div class="modal-actions"><button class="btn-cancel" onclick="cerrarDetalleAdmin()">Cerrar</button></div></div>';m.onclick=e=>{if(e.target===m)cerrarDetalleAdmin()};document.body.appendChild(m)}
  async function abrirDetalleAdmin(f){modal();const u=user(),m=qs('admin-detalle-modal'),box=qs('admin-detalle-contenido');box.innerHTML='<div style="padding:18px;color:var(--text-muted);">Cargando...</div>';m.classList.add('open');try{const r=await fetch(`/api/admin/detalle/${encodeURIComponent(f)}?usuario_id=${encodeURIComponent(u.id)}&x=${Date.now()}`);const data=await r.json();const items=data.items||[];box.innerHTML=`<div class="admin-detalle-header"><div class="admin-source-icon grande">${icon(f)}</div><div><div class="admin-kicker">Detalle</div><h2>${label(f)}</h2><p>${items.length} registro(s)</p></div></div><div class="admin-detalle-list">${items.length?items.map(x=>renderItem(data.tipo,x)).join(''):'<div class="admin-empty">No hay registros.</div>'}</div>`}catch(e){box.innerHTML='<div style="color:var(--danger);padding:18px;">Error al cargar detalle.</div>'}}
  function renderItem(tipo,x){if(tipo==='accesos')return mini('👤',esc(x.usuario_nombre||x.usuario||'Usuario'),`${esc(x.rol||'—')} · ${fmt(x.creado_en)}${x.ip?' · IP '+esc(x.ip):''}`);return mini(icon(x.fuente),`${esc(x.descripcion||x.accion||'Punto')} <span class="admin-chip">+${x.puntos||0}</span>`,`${label(x.fuente)} · ${fmt(x.creado_en)}`,`<button class="btn-admin-danger" onclick="eliminarPuntoAdmin(${x.id})">Eliminar</button>`)}
  function cerrarDetalleAdmin(){const m=qs('admin-detalle-modal');if(m)m.classList.remove('open')}
  async function eliminarPuntoAdmin(id){if(!confirm('¿Eliminar este registro de puntos?'))return;const u=user();const r=await fetch('/api/admin/puntos/'+id+'?usuario_id='+encodeURIComponent(u.id),{method:'DELETE'});const d=await r.json();if(!d.ok)return alert(d.error||'No se pudo eliminar');await cargarPanelAdmin();if(typeof cargarProgresoGlobal==='function')cargarProgresoGlobal()}
  window.cargarPanelAdmin=cargarPanelAdmin;window.abrirDetalleAdmin=abrirDetalleAdmin;window.cerrarDetalleAdmin=cerrarDetalleAdmin;window.eliminarPuntoAdmin=eliminarPuntoAdmin;
  document.addEventListener('DOMContentLoaded',asegurarUI);setTimeout(asegurarUI,500);setTimeout(asegurarUI,1500);
})();
// ======================================================
// FIX GLOBAL PANEL ADMIN — SIGA
// Hace disponible loadAdminPanel y pinta los datos
// ======================================================
window.loadAdminPanel = async function loadAdminPanel() {
  const user = JSON.parse(sessionStorage.getItem('siga_user') || 'null');

  const warning = document.getElementById('admin-private-warning');
  const content = document.getElementById('admin-panel-content');

  if (!user || user.rol !== 'admin') {
    if (warning) warning.style.display = 'block';
    if (content) content.style.display = 'none';
    return;
  }

  if (warning) warning.style.display = 'none';
  if (content) content.style.display = 'block';

  try {
    const res = await fetch(`/api/admin/resumen?usuario_id=${user.id}&x=${Date.now()}`);
    const data = await res.json();

    if (!data.ok) {
      console.error(data);
      alert(data.error || 'Error al cargar panel admin');
      return;
    }

    const puntos = data.puntos || {};
    const accesos = data.accesos || {};
    const misiones = data.misiones || {};
    const calma = data.calma || {};
    const citas = data.citas || {};

    // Tarjetas superiores
    setText('admin-puntos-total', `${puntos?.resumen?.puntos ?? 0} pts`);
    setText(
      'admin-puntos-detalle',
      `${puntos?.resumen?.registros ?? 0} registros · hoy ${puntos?.resumen?.hoy ?? 0}`
    );

    setText('admin-misiones-total', misiones?.resumen?.total ?? 0);
    setText('admin-misiones-puntos', `${misiones?.resumen?.puntos ?? 0} pts acumulados`);

    setText('admin-calma-total', calma?.resumen?.total ?? 0);
    setText('admin-calma-dias', `${calma?.resumen?.dias_programados ?? 0} días programados`);

    setText('admin-citas-total', citas?.resumen?.total ?? 0);
    setText(
      'admin-citas-detalle',
      `${citas?.resumen?.pendientes ?? 0} pendientes · ${citas?.resumen?.cumplidas ?? 0} cumplidas`
    );

    setText('admin-accesos-total', accesos?.resumen?.total ?? 0);
    setText(
      'admin-accesos-detalle',
      `${accesos?.resumen?.hoy ?? 0} hoy · ${accesos?.resumen?.ultimos_30 ?? 0} últimos 30 días`
    );

    // Listas
    renderLista(
      'admin-misiones-recientes',
      misiones?.recientes || [],
      item => `
        <div class="admin-mini-row">
          <div>
            <strong>${esc(item.titulo || 'Misión')}</strong>
            <small>${esc(item.usuario_nombre || 'Sin usuario')} · ${esc(item.nivel || '')} · ${formatFecha(item.creado_en)}</small>
          </div>
          <div style="display:flex;gap:6px;align-items:center;">
            <span>+${item.puntos || 0}</span>
            <button class="btn btn-sm btn-delete" onclick="eliminarMisionAdmin(${item.id})">Eliminar</button>
          </div>
        </div>
      `
    );

    renderLista(
      'admin-accesos-lista',
      accesos?.recientes || [],
      item => `
        <div class="admin-mini-row">
          <div>
            <strong>${esc(item.usuario_nombre || item.nombre_visible || item.usuario || 'Usuario')}</strong>
            <small>${esc(item.rol || '')} · ${formatFecha(item.creado_en)}</small>
          </div>
          <span>${esc(item.ip || '')}</span>
        </div>
      `
    );

    renderLista(
      'admin-usuarios-actividad',
      accesos?.por_usuario || [],
      item => `
        <div class="admin-mini-row">
          <div>
            <strong>${esc(item.usuario_nombre || 'Usuario')}</strong>
            <small>Último acceso: ${formatFecha(item.ultimo)}</small>
          </div>
          <span>${item.total || 0} accesos</span>
        </div>
      `
    );

    const calmaHtml = `
      <div class="admin-mini-row">
        <div>
          <strong>Modo calma</strong>
          <small>${calma?.resumen?.activas ?? 0} activas · ${calma?.resumen?.dias_programados ?? 0} días programados</small>
        </div>
        <span>${calma?.resumen?.total ?? 0}</span>
      </div>
      <div class="admin-mini-row">
        <div>
          <strong>Planes / citas</strong>
          <small>${citas?.resumen?.pendientes ?? 0} pendientes · ${citas?.resumen?.cumplidas ?? 0} cumplidas</small>
        </div>
        <span>${citas?.resumen?.total ?? 0}</span>
      </div>
    `;

    const calmaBox = document.getElementById('admin-calma-citas-lista');
    if (calmaBox) calmaBox.innerHTML = calmaHtml;

  } catch (err) {
    console.error('Error cargando panel admin:', err);
    alert('Error cargando panel admin. Revisa consola.');
  }
};

window.eliminarMisionAdmin = async function eliminarMisionAdmin(id) {
  const user = JSON.parse(sessionStorage.getItem('siga_user') || 'null');
  if (!user || user.rol !== 'admin') return alert('Solo admin.');

  if (!confirm('¿Eliminar esta misión cumplida? Esto quitará sus puntos.')) return;

  try {
    const res = await fetch(`/api/admin/misiones-completadas/${id}?usuario_id=${user.id}`, {
      method: 'DELETE'
    });

    const data = await res.json();

    if (!data.ok) {
      alert(data.error || 'No se pudo eliminar.');
      return;
    }

    alert('Misión eliminada.');
    window.loadAdminPanel();

    if (typeof cargarProgresoMisiones === 'function') {
      cargarProgresoMisiones();
    }
  } catch (err) {
    console.error(err);
    alert('Error al eliminar misión.');
  }
};

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function renderLista(id, lista, template) {
  const el = document.getElementById(id);
  if (!el) return;

  if (!Array.isArray(lista) || lista.length === 0) {
    el.innerHTML = `<div class="admin-empty">Sin registros todavía.</div>`;
    return;
  }

  el.innerHTML = lista.map(template).join('');
}

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatFecha(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('es-BO', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  } catch {
    return value;
  }
}

// Cargar automáticamente si ya están en el panel admin
setTimeout(() => {
  const pageAdmin = document.getElementById('page-admin');
  if (pageAdmin && pageAdmin.classList.contains('active')) {
    window.loadAdminPanel();
  }
}, 500);
