/* ============================================================
   SIGA — eventos.js
   Módulo: Eventos, actividades y preguntas
   Archivo nuevo para: public/js/eventos.js
   ============================================================ */

'use strict';

const eventosState = {
  editandoId: null,
  cargando: false
};

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
    detalle: '💌'
  }[tipo] || '🌟';
}

function eventoTipoLabel(tipo) {
  return {
    pregunta: 'Pregunta',
    actividad: 'Actividad',
    cita: 'Cita',
    juego: 'Juego',
    detalle: 'Detalle'
  }[tipo] || 'Idea';
}

function eventoNivelLabel(nivel) {
  return {
    suave: 'Suave',
    medio: 'Medio',
    profundo: 'Profundo'
  }[nivel] || 'Suave';
}

function asegurarModalEvento() {
  if (document.getElementById('modal-evento')) return;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'modal-evento';
  modal.innerHTML = `
    <div class="modal">
      <h2 class="modal-title" id="modal-evento-title">Nueva idea</h2>

      <div class="modal-form">
        <label>Título</label>
        <input type="text" id="evento-titulo" placeholder="Ej: Preguntas para conectar"/>

        <label>Tipo</label>
        <select id="evento-tipo">
          <option value="pregunta">Pregunta</option>
          <option value="actividad">Actividad</option>
          <option value="cita">Cita</option>
          <option value="juego">Juego</option>
          <option value="detalle">Detalle</option>
        </select>

        <label>Categoría</label>
        <input type="text" id="evento-categoria" placeholder="Ej: conversación, película, llamada, presencial..."/>

        <label>Nivel</label>
        <select id="evento-nivel">
          <option value="suave">Suave</option>
          <option value="medio">Medio</option>
          <option value="profundo">Profundo</option>
        </select>

        <label>Duración estimada</label>
        <input type="text" id="evento-duracion" placeholder="Ej: 15 min, 1 hora, libre..."/>

        <label>Descripción / pregunta</label>
        <textarea id="evento-descripcion" placeholder="Escribe la pregunta, idea, actividad o instrucciones..."></textarea>
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

async function guardarEvento() {
  const body = {
    titulo: eventoVal('evento-titulo'),
    tipo: eventoVal('evento-tipo') || 'pregunta',
    categoria: eventoVal('evento-categoria'),
    nivel: eventoVal('evento-nivel') || 'suave',
    duracion: eventoVal('evento-duracion'),
    descripcion: eventoVal('evento-descripcion'),
    creado_por: (typeof state !== 'undefined' && state.currentUser && state.currentUser.id) ? state.currentUser.id : null
  };

  if (!body.titulo) {
    toast('El título es obligatorio.');
    return;
  }

  if (!body.descripcion) {
    toast('La descripción o pregunta es obligatoria.');
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
  const json = esc(JSON.stringify(item));

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
          </div>
        </div>
        <span class="badge badge-pending">${eventoNivelLabel(item.nivel)}</span>
      </div>

      <p class="item-desc evento-desc">${esc(item.descripcion)}</p>

      <div class="item-actions">
        <button class="btn btn-sm" onclick="copiarEvento(${item.id})">Copiar</button>
        <button class="btn btn-sm" onclick="crearPlanDesdeEvento(${item.id})">Usar en plan</button>
        <button class="btn btn-sm btn-edit" onclick="editarEventoDesdeCache(${item.id})">Editar</button>
        <button class="btn btn-sm btn-delete" onclick="eliminarEvento(${item.id})">Eliminar</button>
      </div>
    </div>
  `;
}

let eventosCache = [];

async function cargarEventosCache() {
  try {
    eventosCache = await api('GET', '/api/eventos');
  } catch {
    eventosCache = [];
  }
}

function obtenerEventoCache(id) {
  return eventosCache.find(e => Number(e.id) === Number(id));
}

async function editarEventoDesdeCache(id) {
  if (!eventosCache.length) await cargarEventosCache();
  const item = obtenerEventoCache(id);
  if (!item) {
    toast('No se encontró la idea.');
    return;
  }
  abrirModalEvento(item);
}

async function copiarEvento(id) {
  if (!eventosCache.length) await cargarEventosCache();
  const item = obtenerEventoCache(id);
  if (!item) return toast('No se encontró la idea.');

  const texto = `${item.titulo}\n${item.descripcion}`;

  try {
    await navigator.clipboard.writeText(texto);
    toast('Idea copiada ♡');
  } catch {
    toast('No se pudo copiar, pero puedes seleccionarla manualmente.');
  }
}

async function crearPlanDesdeEvento(id) {
  if (!eventosCache.length) await cargarEventosCache();
  const item = obtenerEventoCache(id);
  if (!item) return toast('No se encontró la idea.');

  if (typeof openModal !== 'function') {
    toast('No se pudo abrir el formulario de planes.');
    return;
  }

  openModal('citas');

  setTimeout(() => {
    const titulo = document.getElementById('f-titulo');
    const descripcion = document.getElementById('f-descripcion');

    if (titulo) titulo.value = item.titulo || '';
    if (descripcion) {
      descripcion.value = `${item.descripcion || ''}${item.duracion ? '\n\nDuración sugerida: ' + item.duracion : ''}`;
    }
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
          </div>
          <div class="item-actions" style="margin-top:12px;">
            <button class="btn btn-sm" onclick="copiarEvento(${item.id})">Copiar</button>
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

// Sobrescribimos loadEventos para mantener cache actualizada después de renderizar.
const loadEventosOriginal = loadEventos;
loadEventos = async function() {
  await loadEventosOriginal();
  await cargarEventosCache();
};

window.loadEventos = loadEventos;
window.abrirModalEvento = abrirModalEvento;
window.cerrarModalEvento = cerrarModalEvento;
window.guardarEvento = guardarEvento;
window.editarEventoDesdeCache = editarEventoDesdeCache;
window.eliminarEvento = eliminarEvento;
window.copiarEvento = copiarEvento;
window.crearPlanDesdeEvento = crearPlanDesdeEvento;
window.sugerirEventoAleatorio = sugerirEventoAleatorio;

// Escape para cerrar el modal de eventos.
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const modal = document.getElementById('modal-evento');
    if (modal && modal.classList.contains('open')) cerrarModalEvento();
  }
});
