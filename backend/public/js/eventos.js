/* ============================================================
   SIGA — eventos.js
   Módulo: Misiones de conexión + puntos + niveles
   Reemplaza: backend/public/js/eventos.js
   ============================================================ */

'use strict';

const eventosState = {
  editandoId: null,
  cargando: false
};

let eventosCache = [];

function eventoVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function eventoIcono(tipo) {
  return {
    pregunta: '💬',
    actividad: '✨',
    cita: '📅',
    juego: '🎲',
    detalle: '💌',
    guia: '📖'
  }[tipo] || '🌟';
}

function eventoTipoLabel(tipo) {
  return {
    pregunta: 'Pregunta',
    actividad: 'Actividad',
    cita: 'Cita',
    juego: 'Juego',
    detalle: 'Detalle',
    guia: 'Guía'
  }[tipo] || 'Misión';
}

function eventoNivelLabel(nivel) {
  return {
    suave: 'Fácil',
    facil: 'Fácil',
    medio: 'Media',
    profundo: 'Difícil',
    dificil: 'Difícil',
    hardcore: 'Legendaria'
  }[nivel] || 'Fácil';
}

function eventoNivelClass(nivel) {
  const n = nivel === 'suave' ? 'facil' : nivel === 'profundo' ? 'dificil' : nivel;
  return 'nivel-' + (n || 'facil');
}

function puntosPorNivel(nivel) {
  const n = nivel === 'suave' ? 'facil' : nivel === 'profundo' ? 'dificil' : nivel;
  return { facil: 10, medio: 25, dificil: 50, hardcore: 100 }[n] || 10;
}

function recompensaTexto(nivel) {
  const frases = {
    facil: [
      'Mini chispa desbloqueada ✨',
      'Un detalle más para la historia 💫',
      'Pequeño momento, gran suma 🌙'
    ],
    medio: [
      'Conexión fortalecida 💜',
      'Misión bonita completada 🏆',
      'Subió la ternura del equipo ✨'
    ],
    dificil: [
      'Nivel de confianza aumentado 🔥',
      'Conversación valiente desbloqueada 🌌',
      'Esto ya suma historia 📖'
    ],
    hardcore: [
      'Misión legendaria completada 👑',
      'Modo épico de conexión desbloqueado 🌠',
      'Esto merece guardarse en la memoria del sistema 🏆'
    ]
  };
  const n = nivel === 'suave' ? 'facil' : nivel === 'profundo' ? 'dificil' : (nivel || 'facil');
  const lista = frases[n] || frases.facil;
  return lista[Math.floor(Math.random() * lista.length)];
}

function eventoTextoCompleto(item) {
  let texto = `${item.titulo}\n\n${item.descripcion || ''}`;

  if (item.instrucciones) {
    texto += `\n\nCómo hacerlo:\n${item.instrucciones}`;
  }

  if (item.items && item.items.length) {
    texto += '\n\nPreguntas / pasos:';
    item.items.forEach((paso, index) => {
      const bloque = paso.bloque ? `[${paso.bloque}] ` : '';
      texto += `\n${index + 1}. ${bloque}${paso.contenido}`;
    });
  }

  if (item.duracion) texto += `\n\nDuración sugerida: ${item.duracion}`;
  if (item.fuente) texto += `\nIdea base: ${item.fuente}`;

  return texto;
}

function itemsDesdeTextarea() {
  const texto = eventoVal('evento-items');
  if (!texto) return [];

  return texto
    .split('\n')
    .map(linea => linea.trim())
    .filter(Boolean)
    .map((linea, index) => {
      let bloque = null;
      let contenido = linea;

      const match = linea.match(/^\[(.+?)\]\s*(.+)$/);
      if (match) {
        bloque = match[1].trim();
        contenido = match[2].trim();
      }

      return {
        orden: index + 1,
        bloque,
        tipo_item: 'pregunta',
        contenido
      };
    });
}

function itemsATextarea(items) {
  if (!items || !items.length) return '';
  return items.map(item => {
    const bloque = item.bloque ? `[${item.bloque}] ` : '';
    return `${bloque}${item.contenido}`;
  }).join('\n');
}

function asegurarModalEvento() {
  if (document.getElementById('modal-evento')) return;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'modal-evento';
  modal.innerHTML = `
    <div class="modal modal-evento-editar">
      <h2 class="modal-title" id="modal-evento-title">Nueva misión</h2>

      <div class="modal-form">
        <label>Título</label>
        <input type="text" id="evento-titulo" placeholder="Ej: Café con pregunta sorpresa"/>

        <label>Tipo</label>
        <select id="evento-tipo">
          <option value="pregunta">Pregunta</option>
          <option value="actividad">Actividad</option>
          <option value="cita">Cita</option>
          <option value="juego">Juego</option>
          <option value="detalle">Detalle</option>
          <option value="guia">Guía con pasos</option>
        </select>

        <label>Categoría</label>
        <input type="text" id="evento-categoria" placeholder="Ej: conversación, presencial, conexión, calma..."/>

        <label>Nivel</label>
        <select id="evento-nivel">
          <option value="facil">Fácil · 10 pts</option>
          <option value="medio">Media · 25 pts</option>
          <option value="dificil">Difícil · 50 pts</option>
          <option value="hardcore">Legendaria · 100 pts</option>
        </select>

        <label>Duración estimada</label>
        <input type="text" id="evento-duracion" placeholder="Ej: 15 min, 45 min, 1 hora..."/>

        <label>Descripción corta</label>
        <textarea id="evento-descripcion" placeholder="Describe la misión o el sentido de la guía..."></textarea>

        <label>Cómo hacerla</label>
        <textarea id="evento-instrucciones" placeholder="Ej: Respondan por turnos, sin presionar, pueden parar cuando quieran..."></textarea>

        <label>Preguntas o pasos extra</label>
        <textarea id="evento-items" placeholder="Una pregunta o paso por línea. Puedes usar [Etapa 1] Pregunta..."></textarea>

        <label>Fuente / idea base opcional</label>
        <input type="text" id="evento-fuente" placeholder="Ej: 36 preguntas, idea propia, terapia breve..."/>
      </div>

      <div class="modal-actions">
        <button class="btn-cancel" onclick="cerrarModalEvento()">Cancelar</button>
        <button class="btn-save" onclick="guardarEvento()">Guardar misión</button>
      </div>
    </div>
  `;

  modal.addEventListener('click', function(e) {
    if (e.target === modal) cerrarModalEvento();
  });

  document.body.appendChild(modal);
}

function asegurarModalDetalleEvento() {
  if (document.getElementById('modal-evento-detalle')) return;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'modal-evento-detalle';
  modal.innerHTML = `
    <div class="modal modal-evento-detalle-card">
      <div id="evento-detalle-contenido"></div>
      <div class="modal-actions">
        <button class="btn-cancel" onclick="cerrarDetalleEvento()">Cerrar</button>
      </div>
    </div>
  `;

  modal.addEventListener('click', function(e) {
    if (e.target === modal) cerrarDetalleEvento();
  });

  document.body.appendChild(modal);
}

function cerrarModalEvento() {
  const modal = document.getElementById('modal-evento');
  if (modal) modal.classList.remove('open');
  eventosState.editandoId = null;
}

function cerrarDetalleEvento() {
  const modal = document.getElementById('modal-evento-detalle');
  if (modal) modal.classList.remove('open');
}

async function abrirModalEvento(item) {
  asegurarModalEvento();

  eventosState.editandoId = item?.id || null;

  document.getElementById('modal-evento-title').textContent = item ? 'Editar misión' : 'Nueva misión';
  document.getElementById('evento-titulo').value = item?.titulo || '';
  document.getElementById('evento-tipo').value = item?.tipo || 'pregunta';
  document.getElementById('evento-categoria').value = item?.categoria || '';
  document.getElementById('evento-nivel').value = (item?.nivel === 'suave' ? 'facil' : item?.nivel === 'profundo' ? 'dificil' : item?.nivel) || 'facil';
  document.getElementById('evento-duracion').value = item?.duracion || '';
  document.getElementById('evento-descripcion').value = item?.descripcion || '';
  document.getElementById('evento-instrucciones').value = item?.instrucciones || '';
  document.getElementById('evento-fuente').value = item?.fuente || '';

  if (item?.id && !item.items) {
    try {
      item = await obtenerEventoCompleto(item.id);
    } catch {}
  }

  document.getElementById('evento-items').value = itemsATextarea(item?.items || []);

  document.getElementById('modal-evento').classList.add('open');

  setTimeout(() => {
    const input = document.getElementById('evento-titulo');
    if (input) input.focus();
  }, 80);
}

async function guardarEvento() {
  const body = {
    titulo: eventoVal('evento-titulo'),
    tipo: eventoVal('evento-tipo'),
    categoria: eventoVal('evento-categoria'),
    nivel: eventoVal('evento-nivel'),
    duracion: eventoVal('evento-duracion'),
    descripcion: eventoVal('evento-descripcion'),
    modo: itemsDesdeTextarea().length ? 'guia' : 'simple',
    instrucciones: eventoVal('evento-instrucciones'),
    fuente: eventoVal('evento-fuente'),
    creado_por: (typeof state !== 'undefined' && state.currentUser && state.currentUser.id) ? state.currentUser.id : null,
    items: itemsDesdeTextarea()
  };

  if (!body.titulo) return toast('El título es obligatorio.');
  if (!body.descripcion) return toast('La descripción es obligatoria.');

  try {
    const method = eventosState.editandoId ? 'PUT' : 'POST';
    const url = '/api/eventos' + (eventosState.editandoId ? '/' + eventosState.editandoId : '');
    const data = await api(method, url, body);

    if (data && data.error) {
      toast(data.error);
      return;
    }

    cerrarModalEvento();
    toast(eventosState.editandoId ? '✓ Misión actualizada' : '✓ Misión guardada');
    eventosState.editandoId = null;
    await loadEventos();
    await cargarProgresoMisiones();
  } catch (err) {
    console.error(err);
    toast('Error al guardar la misión.');
  }
}

async function loadEventos() {
  const container = document.getElementById('list-eventos');
  if (!container) return;

  container.innerHTML = '<div style="color:var(--text-muted);padding:20px;">Cargando misiones...</div>';

  const q = encodeURIComponent(eventoVal('evento-buscar'));
  const tipo = encodeURIComponent(eventoVal('evento-filtro-tipo'));
  const nivel = encodeURIComponent(eventoVal('evento-filtro-nivel'));

  try {
    const items = await api('GET', `/api/eventos?q=${q}&tipo=${tipo}&nivel=${nivel}`);

    if (!Array.isArray(items) || !items.length) {
      container.innerHTML = emptyState('🎯', 'Aún no hay misiones con esos filtros.');
      return;
    }

    eventosCache = items;
    container.innerHTML = items.map(item => renderEventoCard(item)).join('');
    await cargarProgresoMisiones();
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div style="color:var(--danger);padding:20px;">Error al cargar misiones.</div>';
  }
}

function renderEventoCard(item) {
  const pts = puntosPorNivel(item.nivel);
  const completada = Number(item.completada_total || 0);

  return `
    <div class="item-card evento-card ${eventoNivelClass(item.nivel)}">
      <div class="evento-card-top">
        <div class="evento-icon">${eventoIcono(item.tipo)}</div>
        <div style="flex:1;">
          <div class="item-title">${esc(item.titulo)}</div>
          <div class="item-meta">
            ${eventoTipoLabel(item.tipo)}
            ${item.categoria ? ' · ' + esc(item.categoria) : ''}
            ${item.duracion ? ' · ⏱ ' + esc(item.duracion) : ''}
            ${item.total_items ? ' · ' + item.total_items + ' pasos' : ''}
            ${completada ? ' · 🏁 ' + completada + ' vez/veces' : ''}
          </div>
        </div>
        <span class="badge badge-pending mission-badge ${eventoNivelClass(item.nivel)}">${eventoNivelLabel(item.nivel)} · +${pts}</span>
      </div>

      <p class="item-desc evento-desc">${esc(item.descripcion || '')}</p>

      <div class="item-actions">
        <button class="btn btn-sm" onclick="abrirDetalleEvento(${item.id})">Abrir</button>
        <button class="btn btn-sm btn-mision-done" onclick="completarMision(${item.id})">Cumplida +${pts}</button>
        <button class="btn btn-sm" onclick="crearPlanDesdeEvento(${item.id})">Usar en plan</button>
        <button class="btn btn-sm" onclick="copiarEvento(${item.id})">Copiar</button>
        <button class="btn btn-sm btn-edit" onclick="editarEventoDesdeCache(${item.id})">Editar</button>
        <button class="btn btn-sm btn-delete" onclick="eliminarEvento(${item.id})">Eliminar</button>
      </div>
    </div>
  `;
}

function obtenerEventoCache(id) {
  return eventosCache.find(e => Number(e.id) === Number(id));
}

async function obtenerEventoCompleto(id) {
  const data = await api('GET', '/api/eventos/' + id);
  if (!data || data.error) throw new Error(data?.error || 'No se encontró la misión');
  return data;
}

async function abrirDetalleEvento(id) {
  asegurarModalDetalleEvento();

  const box = document.getElementById('evento-detalle-contenido');
  if (!box) return;

  box.innerHTML = '<div style="color:var(--text-muted);padding:18px;">Cargando misión...</div>';
  document.getElementById('modal-evento-detalle').classList.add('open');

  try {
    const item = await obtenerEventoCompleto(id);
    box.innerHTML = renderDetalleEvento(item);
  } catch (err) {
    console.error(err);
    box.innerHTML = '<div style="color:var(--danger);padding:18px;">No se pudo cargar la misión.</div>';
  }
}

function agruparItems(items) {
  const grupos = {};
  (items || []).forEach(item => {
    const key = item.bloque || 'Guía';
    if (!grupos[key]) grupos[key] = [];
    grupos[key].push(item);
  });
  return grupos;
}

function renderDetalleEvento(item) {
  const grupos = agruparItems(item.items || []);
  const nombres = Object.keys(grupos);
  const pts = puntosPorNivel(item.nivel);

  const bloquesHtml = nombres.map(nombre => `
    <div class="evento-bloque">
      <div class="evento-bloque-title">${esc(nombre)}</div>
      <div class="evento-pasos-list">
        ${grupos[nombre].map((paso, index) => `
          <div class="evento-paso">
            <div class="evento-paso-num">${index + 1}</div>
            <div class="evento-paso-text">${esc(paso.contenido)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  return `
    <div class="evento-detalle-header">
      <div class="evento-icon grande">${eventoIcono(item.tipo)}</div>
      <div>
        <div class="evento-detalle-label">${eventoTipoLabel(item.tipo)} · ${eventoNivelLabel(item.nivel)} · +${pts} pts</div>
        <h2>${esc(item.titulo)}</h2>
        <div class="item-meta">
          ${item.categoria ? esc(item.categoria) : 'sin categoría'}
          ${item.duracion ? ' · ⏱ ' + esc(item.duracion) : ''}
          ${item.fuente ? ' · ' + esc(item.fuente) : ''}
        </div>
      </div>
    </div>

    <p class="evento-detalle-desc">${esc(item.descripcion || '')}</p>

    ${item.instrucciones ? `
      <div class="evento-instrucciones">
        <strong>Cómo hacerla:</strong><br>
        ${esc(item.instrucciones)}
      </div>
    ` : ''}

    ${bloquesHtml || `
      <div class="evento-instrucciones">
        Esta misión no tiene pasos extra. Pueden hacerla como actividad simple.
      </div>
    `}

    <div class="item-actions evento-detalle-actions">
      <button class="btn btn-sm btn-mision-done" onclick="completarMision(${item.id})">Marcar cumplida +${pts}</button>
      <button class="btn btn-sm" onclick="crearPlanDesdeEvento(${item.id})">Usar en plan</button>
      <button class="btn btn-sm" onclick="copiarEventoCompleto(${item.id})">Copiar guía completa</button>
      <button class="btn btn-sm btn-edit" onclick="editarEventoDesdeDetalle(${item.id})">Editar</button>
    </div>
  `;
}

async function editarEventoDesdeCache(id) {
  try {
    const item = await obtenerEventoCompleto(id);
    abrirModalEvento(item);
  } catch {
    toast('No se pudo abrir la misión.');
  }
}

async function editarEventoDesdeDetalle(id) {
  try {
    const item = await obtenerEventoCompleto(id);
    cerrarDetalleEvento();
    abrirModalEvento(item);
  } catch {
    toast('No se pudo editar la misión.');
  }
}

async function copiarEvento(id) {
  try {
    const item = await obtenerEventoCompleto(id);
    await navigator.clipboard.writeText(eventoTextoCompleto(item));
    toast('Misión copiada ♡');
  } catch {
    toast('No se pudo copiar la misión.');
  }
}

async function copiarEventoCompleto(id) {
  try {
    const item = await obtenerEventoCompleto(id);
    await navigator.clipboard.writeText(eventoTextoCompleto(item));
    toast('Guía completa copiada ♡');
  } catch {
    toast('No se pudo copiar la guía.');
  }
}

async function crearPlanDesdeEvento(id) {
  let item;

  try {
    item = await obtenerEventoCompleto(id);
  } catch {
    return toast('No se encontró la misión.');
  }

  if (typeof openModal !== 'function') {
    toast('No se pudo abrir el formulario de planes.');
    return;
  }

  cerrarDetalleEvento();
  openModal('citas');

  setTimeout(() => {
    const titulo = document.getElementById('f-titulo');
    const descripcion = document.getElementById('f-descripcion');

    if (titulo) titulo.value = item.titulo || '';
    if (descripcion) descripcion.value = eventoTextoCompleto(item);
  }, 80);
}

async function completarMision(id) {
  let item = obtenerEventoCache(id);

  if (!item) {
    try { item = await obtenerEventoCompleto(id); } catch {}
  }

  const puntos = item ? puntosPorNivel(item.nivel) : 10;
  const ok = confirm(`¿Marcar esta misión como cumplida?\n\nSumará +${puntos} puntos a la relación.`);
  if (!ok) return;

  try {
    const usuario_id = (typeof state !== 'undefined' && state.currentUser && state.currentUser.id) ? state.currentUser.id : null;
    const data = await api('POST', `/api/eventos/${id}/completar`, { usuario_id });

    if (data && data.error) {
      toast(data.error);
      return;
    }

    if (data.repetida) {
      toast('Esta misión ya fue completada hoy por este usuario. Mañana vuelve a sumar ♡');
    } else {
      lanzarConfettiMision();
      toast(`${recompensaTexto(item?.nivel || 'facil')} +${data.completada?.puntos || puntos} pts`);
    }

    await cargarProgresoMisiones();
    await loadEventos();
  } catch (err) {
    console.error(err);
    toast('No se pudo completar la misión.');
  }
}

async function eliminarEvento(id) {
  if (!confirm('¿Eliminar esta misión?')) return;

  try {
    const data = await api('DELETE', '/api/eventos/' + id);

    if (data && data.error) {
      toast(data.error);
      return;
    }

    toast('Misión eliminada.');
    await loadEventos();
  } catch {
    toast('Error al eliminar la misión.');
  }
}

async function sugerirEventoAleatorio() {
  const box = document.getElementById('evento-random-box');
  if (!box) return;

  box.innerHTML = '<div class="eventos-random-empty">Buscando una misión...</div>';

  try {
    const tipo = encodeURIComponent(eventoVal('evento-filtro-tipo'));
    const nivel = encodeURIComponent(eventoVal('evento-filtro-nivel'));
    const item = await api('GET', `/api/eventos/aleatorio?tipo=${tipo}&nivel=${nivel}`);

    if (!item || item.error) {
      box.innerHTML = '<div class="eventos-random-empty">No encontré misiones con esos filtros.</div>';
      return;
    }

    const pts = puntosPorNivel(item.nivel);

    box.innerHTML = `
      <div class="evento-random-picked ${eventoNivelClass(item.nivel)}">
        <div class="evento-card-top">
          <div class="evento-icon">${eventoIcono(item.tipo)}</div>
          <div style="flex:1;">
            <div class="item-title">${esc(item.titulo)}</div>
            <div class="item-meta">${eventoTipoLabel(item.tipo)} · ${eventoNivelLabel(item.nivel)} · +${pts} pts</div>
          </div>
        </div>
        <p class="item-desc">${esc(item.descripcion || '')}</p>
        <div class="item-actions">
          <button class="btn btn-sm" onclick="abrirDetalleEvento(${item.id})">Abrir</button>
          <button class="btn btn-sm btn-mision-done" onclick="completarMision(${item.id})">Cumplida +${pts}</button>
          <button class="btn btn-sm" onclick="crearPlanDesdeEvento(${item.id})">Usar en plan</button>
        </div>
      </div>
    `;
  } catch (err) {
    console.error(err);
    box.innerHTML = '<div class="eventos-random-empty">Error al elegir misión sorpresa.</div>';
  }
}

async function cargarProgresoMisiones() {
  try {
    const data = await api('GET', '/api/eventos/progreso');
    if (!data || data.error) return;

    const nivel = data.nivel || {};

    const puntosEl = document.getElementById('misiones-puntos-total');
    const nombreEl = document.getElementById('misiones-nivel-nombre');
    const textoEl = document.getElementById('misiones-nivel-texto');
    const barEl = document.getElementById('misiones-progress-bar');
    const detalleEl = document.getElementById('misiones-progreso-detalle');

    if (puntosEl) puntosEl.textContent = data.puntos || 0;
    if (nombreEl) nombreEl.textContent = `${nivel.emoji || '🏆'} Nivel ${nivel.nivel || 1} — ${nivel.nombre || 'Primeros destellos'}`;
    if (textoEl) textoEl.textContent = `${data.completadas || 0} misiones cumplidas · ${data.hoy || 0} hoy`;
    if (barEl) barEl.style.width = `${nivel.progreso || 0}%`;
    if (detalleEl) {
      detalleEl.textContent = nivel.siguiente
        ? `${data.puntos || 0} / ${nivel.siguiente} pts · faltan ${nivel.faltan || 0}`
        : `${data.puntos || 0} pts · nivel máximo simbólico`;
    }

    const hero = document.getElementById('evento-random-box');
    if (hero && !hero.dataset.progresoPintado && data.puntos) {
      hero.dataset.progresoPintado = '1';
    }
  } catch (err) {
    console.warn('No se pudo cargar progreso de misiones:', err);
  }
}

function lanzarConfettiMision() {
  const emojis = ['✨', '💜', '🏆', '🌙', '💫', '🎯'];
  for (let i = 0; i < 24; i++) {
    const p = document.createElement('div');
    p.className = 'mision-confetti';
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDelay = (Math.random() * 0.3) + 's';
    p.style.fontSize = (16 + Math.random() * 14) + 'px';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1800);
  }
}


window.loadEventos = loadEventos;
window.abrirModalEvento = abrirModalEvento;
window.cerrarModalEvento = cerrarModalEvento;
window.guardarEvento = guardarEvento;
window.sugerirEventoAleatorio = sugerirEventoAleatorio;
window.abrirDetalleEvento = abrirDetalleEvento;
window.cerrarDetalleEvento = cerrarDetalleEvento;
window.copiarEvento = copiarEvento;
window.copiarEventoCompleto = copiarEventoCompleto;
window.crearPlanDesdeEvento = crearPlanDesdeEvento;
window.editarEventoDesdeCache = editarEventoDesdeCache;
window.editarEventoDesdeDetalle = editarEventoDesdeDetalle;
window.eliminarEvento = eliminarEvento;
window.completarMision = completarMision;
window.cargarProgresoMisiones = cargarProgresoMisiones;
