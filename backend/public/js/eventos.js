
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
  }[tipo] || 'Idea';
}

function eventoNivelLabel(nivel) {
  return {
    suave: 'Suave',
    medio: 'Medio',
    profundo: 'Profundo'
  }[nivel] || 'Suave';
}

function eventoTextoCompleto(item) {
  let texto = `${item.titulo}\n\n${item.descripcion || ''}`;

  if (item.instrucciones) {
    texto += `\n\nInstrucciones:\n${item.instrucciones}`;
  }

  if (item.items && item.items.length) {
    texto += '\n\nPreguntas / pasos:';
    item.items.forEach((paso, index) => {
      const bloque = paso.bloque ? `[${paso.bloque}] ` : '';
      texto += `\n${index + 1}. ${bloque}${paso.contenido}`;
    });
  }

  if (item.duracion) texto += `\n\nDuración sugerida: ${item.duracion}`;
  if (item.fuente) texto += `\nFuente/idea base: ${item.fuente}`;

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

      const match = linea.match(/^\[(.*?)\]\s*(.+)$/);
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
      <h2 class="modal-title" id="modal-evento-title">Nueva idea</h2>

      <div class="modal-form">
        <label>Título</label>
        <input type="text" id="evento-titulo" placeholder="Ej: 36 preguntas para conectar"/>

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
          <option value="suave">Suave</option>
          <option value="medio">Medio</option>
          <option value="profundo">Profundo</option>
        </select>

        <label>Duración estimada</label>
        <input type="text" id="evento-duracion" placeholder="Ej: 15 min, 45 min, 1 hora..."/>

        <label>Descripción corta</label>
        <textarea id="evento-descripcion" placeholder="Describe la actividad o el sentido de la guía..."></textarea>

        <label>Instrucciones opcionales</label>
        <textarea id="evento-instrucciones" placeholder="Ej: Hacer por turnos, sin presionar, pueden parar cuando quieran..."></textarea>

        <label>Preguntas o pasos extra</label>
        <textarea id="evento-items" placeholder="Una pregunta o paso por línea. Puedes usar [Grupo 1] Pregunta..."></textarea>

        <label>Fuente / idea base opcional</label>
        <input type="text" id="evento-fuente" placeholder="Ej: Aron, Gottman, idea propia..."/>
      </div>

      <div class="modal-actions">
        <button class="btn-cancel" onclick="cerrarModalEvento()">Cancelar</button>
        <button class="btn-save" onclick="guardarEvento()">Guardar</button>
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

function abrirModalEvento(item) {
  asegurarModalEvento();

  eventosState.editandoId = item && item.id ? item.id : null;

  const title = document.getElementById('modal-evento-title');
  if (title) title.textContent = eventosState.editandoId ? 'Editar idea' : 'Nueva idea';

  document.getElementById('evento-titulo').value = item?.titulo || '';
  document.getElementById('evento-tipo').value = item?.tipo || 'pregunta';
  document.getElementById('evento-categoria').value = item?.categoria || '';
  document.getElementById('evento-nivel').value = item?.nivel || 'suave';
  document.getElementById('evento-duracion').value = item?.duracion || '';
  document.getElementById('evento-descripcion').value = item?.descripcion || '';
  document.getElementById('evento-instrucciones').value = item?.instrucciones || '';
  document.getElementById('evento-items').value = itemsATextarea(item?.items || []);
  document.getElementById('evento-fuente').value = item?.fuente || '';

  document.getElementById('modal-evento').classList.add('open');

  setTimeout(() => {
    const input = document.getElementById('evento-titulo');
    if (input) input.focus();
  }, 100);
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

async function guardarEvento() {
  const items = itemsDesdeTextarea();

  const body = {
    titulo: eventoVal('evento-titulo'),
    tipo: eventoVal('evento-tipo') || 'pregunta',
    categoria: eventoVal('evento-categoria'),
    nivel: eventoVal('evento-nivel') || 'suave',
    duracion: eventoVal('evento-duracion'),
    descripcion: eventoVal('evento-descripcion'),
    modo: items.length ? 'guia' : 'simple',
    instrucciones: eventoVal('evento-instrucciones'),
    fuente: eventoVal('evento-fuente'),
    items,
    creado_por: (typeof state !== 'undefined' && state.currentUser && state.currentUser.id) ? state.currentUser.id : null
  };

  if (!body.titulo) {
    toast('El título es obligatorio.');
    return;
  }

  if (!body.descripcion) {
    toast('La descripción es obligatoria.');
    return;
  }

  try {
    const method = eventosState.editandoId ? 'PUT' : 'POST';
    const url = '/api/eventos' + (eventosState.editandoId ? '/' + eventosState.editandoId : '');
    const data = await api(method, url, body);

    if (data && data.error) {
      toast(data.error);
      return;
    }

    cerrarModalEvento();
    toast(eventosState.editandoId ? '✓ Idea actualizada' : '✓ Idea guardada');
    await loadEventos();
  } catch (err) {
    console.error(err);
    toast('Error al guardar la idea.');
  }
}

async function loadEventos() {
  const container = document.getElementById('list-eventos');
  if (!container) return;

  const q = encodeURIComponent(eventoVal('evento-buscar'));
  const tipo = encodeURIComponent(eventoVal('evento-filtro-tipo'));
  const nivel = encodeURIComponent(eventoVal('evento-filtro-nivel'));

  container.innerHTML = '<div style="color:var(--text-muted);padding:20px;">Cargando ideas...</div>';

  try {
    const items = await api('GET', `/api/eventos?q=${q}&tipo=${tipo}&nivel=${nivel}`);
    eventosCache = items || [];

    if (!items || !items.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🎲</div>
          <div class="empty-state-text">Aún no hay ideas guardadas. Agrega una pregunta, cita o actividad.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(item => renderEventoCard(item)).join('');
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div style="color:var(--danger);padding:20px;">Error al cargar eventos y preguntas.</div>';
  }
}

function renderEventoCard(item) {
  return `
    <div class="item-card evento-card">
      <div class="evento-card-top">
        <div class="evento-icon">${eventoIcono(item.tipo)}</div>
        <div style="flex:1;">
          <div class="item-title">${esc(item.titulo)}</div>
          <div class="item-meta">
            ${eventoTipoLabel(item.tipo)}
            ${item.categoria ? ' · ' + esc(item.categoria) : ''}
            ${item.duracion ? ' · ⏱ ' + esc(item.duracion) : ''}
            ${item.total_items ? ' · ' + item.total_items + ' pasos' : ''}
          </div>
        </div>
        <span class="badge badge-pending">${eventoNivelLabel(item.nivel)}</span>
      </div>

      <p class="item-desc evento-desc">${esc(item.descripcion)}</p>

      <div class="item-actions">
        <button class="btn btn-sm" onclick="abrirDetalleEvento(${item.id})">Abrir</button>
        <button class="btn btn-sm" onclick="copiarEvento(${item.id})">Copiar</button>
        <button class="btn btn-sm" onclick="crearPlanDesdeEvento(${item.id})">Usar en plan</button>
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
  if (!data || data.error) throw new Error(data?.error || 'No se encontró la idea');
  return data;
}

async function abrirDetalleEvento(id) {
  asegurarModalDetalleEvento();

  const box = document.getElementById('evento-detalle-contenido');
  const modal = document.getElementById('modal-evento-detalle');

  if (!box || !modal) return;

  box.innerHTML = '<div style="color:var(--text-muted);padding:20px;">Cargando guía...</div>';
  modal.classList.add('open');

  try {
    const item = await obtenerEventoCompleto(id);
    box.innerHTML = renderDetalleEvento(item);
  } catch (err) {
    console.error(err);
    box.innerHTML = '<div style="color:var(--danger);padding:20px;">No se pudo cargar la guía.</div>';
  }
}

function renderDetalleEvento(item) {
  const grupos = {};

  (item.items || []).forEach(paso => {
    const key = paso.bloque || 'Preguntas / pasos';
    if (!grupos[key]) grupos[key] = [];
    grupos[key].push(paso);
  });

  const bloquesHtml = Object.keys(grupos).map(nombre => `
    <div class="evento-detalle-bloque">
      <h3>${esc(nombre)}</h3>
      <div class="evento-pasos-lista">
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
        <div class="evento-detalle-label">${eventoTipoLabel(item.tipo)} · ${eventoNivelLabel(item.nivel)}</div>
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
        <strong>Cómo hacerlo:</strong><br>
        ${esc(item.instrucciones)}
      </div>
    ` : ''}

    ${bloquesHtml || `
      <div class="evento-instrucciones">
        Esta idea no tiene pasos extra. Puedes usarla como actividad simple.
      </div>
    `}

    <div class="item-actions evento-detalle-actions">
      <button class="btn btn-sm" onclick="copiarEventoCompleto(${item.id})">Copiar guía completa</button>
      <button class="btn btn-sm" onclick="crearPlanDesdeEvento(${item.id})">Usar en plan</button>
      <button class="btn btn-sm btn-edit" onclick="editarEventoDesdeDetalle(${item.id})">Editar</button>
    </div>
  `;
}

async function editarEventoDesdeCache(id) {
  try {
    const item = await obtenerEventoCompleto(id);
    abrirModalEvento(item);
  } catch {
    toast('No se encontró la idea.');
  }
}

async function editarEventoDesdeDetalle(id) {
  cerrarDetalleEvento();
  await editarEventoDesdeCache(id);
}

async function copiarEvento(id) {
  try {
    const item = await obtenerEventoCompleto(id);
    const texto = item.items && item.items.length
      ? eventoTextoCompleto(item)
      : `${item.titulo}\n${item.descripcion || ''}`;

    await navigator.clipboard.writeText(texto);
    toast('Idea copiada ♡');
  } catch {
    toast('No se pudo copiar, pero puedes seleccionarla manualmente.');
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
    return toast('No se encontró la idea.');
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

async function eliminarEvento(id) {
  if (!confirm('¿Eliminar esta idea?')) return;

  try {
    const data = await api('DELETE', '/api/eventos/' + id);

    if (data && data.error) {
      toast(data.error);
      return;
    }

    toast('Idea eliminada.');
    await loadEventos();
  } catch {
    toast('Error al eliminar la idea.');
  }
}

async function sugerirEventoAleatorio() {
  const box = document.getElementById('evento-random-box');
  if (!box) return;

  box.innerHTML = '<div class="eventos-random-empty">Buscando una idea...</div>';

  try {
    const tipo = encodeURIComponent(eventoVal('evento-filtro-tipo'));
    const nivel = encodeURIComponent(eventoVal('evento-filtro-nivel'));
    const item = await api('GET', `/api/eventos/aleatorio?tipo=${tipo}&nivel=${nivel}`);

    if (!item || item.error) {
      box.innerHTML = '<div class="eventos-random-empty">No hay ideas para sugerir todavía.</div>';
      return;
    }

    box.innerHTML = `
      <div class="eventos-random-content">
        <div class="evento-icon grande">${eventoIcono(item.tipo)}</div>
        <div>
          <div class="eventos-random-label">Sugerencia para hoy</div>
          <h3>${esc(item.titulo)}</h3>
          <p>${esc(item.descripcion)}</p>
          <div class="item-meta">
            ${eventoTipoLabel(item.tipo)}
            ${item.categoria ? ' · ' + esc(item.categoria) : ''}
            ${item.duracion ? ' · ⏱ ' + esc(item.duracion) : ''}
            ${item.total_items ? ' · ' + item.total_items + ' pasos' : ''}
          </div>
          <div class="item-actions" style="margin-top:12px;">
            <button class="btn btn-sm" onclick="abrirDetalleEvento(${item.id})">Abrir</button>
            <button class="btn btn-sm" onclick="crearPlanDesdeEvento(${item.id})">Usar en plan</button>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error(err);
    box.innerHTML = '<div class="eventos-random-empty">Error al sugerir una idea.</div>';
  }
}

window.loadEventos = loadEventos;
window.abrirModalEvento = abrirModalEvento;
window.cerrarModalEvento = cerrarModalEvento;
window.guardarEvento = guardarEvento;
window.editarEventoDesdeCache = editarEventoDesdeCache;
window.editarEventoDesdeDetalle = editarEventoDesdeDetalle;
window.eliminarEvento = eliminarEvento;
window.copiarEvento = copiarEvento;
window.copiarEventoCompleto = copiarEventoCompleto;
window.crearPlanDesdeEvento = crearPlanDesdeEvento;
window.sugerirEventoAleatorio = sugerirEventoAleatorio;
window.abrirDetalleEvento = abrirDetalleEvento;
window.cerrarDetalleEvento = cerrarDetalleEvento;

// Escape para cerrar modales de eventos.
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const modalEditar = document.getElementById('modal-evento');
    const modalDetalle = document.getElementById('modal-evento-detalle');

    if (modalEditar && modalEditar.classList.contains('open')) cerrarModalEvento();
    if (modalDetalle && modalDetalle.classList.contains('open')) cerrarDetalleEvento();
  }
});
