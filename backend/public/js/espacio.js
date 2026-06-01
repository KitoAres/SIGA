/* SIGA v2.1 — Mi espacio

   Si alguien abre este código algún día:
   sí, aquí hubo pelea contra bugs.
   sí, se rompió varias veces.
   sí, probablemente dije "¿por qué no guarda?" unas 40 veces.
   Pero quedó con cariño.

   Reglas:
   - Guardar para mí: privado.
   - Compartir señal: visible para ambos.
   - Copiar: no guarda nada.

   Este módulo no busca controlar a nadie.
   Busca que alguien pueda ordenar lo que siente y decidir qué compartir.
   Y si no pues a la...
*/

(function () {
  const herramientas = {
    semaforo: {
      icon: '🚦',
      titulo: 'Semáforo emocional',
      subtitulo: 'Decir cómo estás sin tener que explicar todo.',
      opciones: [
        { estado: 'verde', label: '🟢 Puedo hablar', mensaje: 'Estoy disponible para hablar con calma.' },
        { estado: 'amarillo', label: '🟡 Puedo hablar poquito', mensaje: 'Puedo hablar, pero despacio. Si tardo, no es rechazo.' },
        { estado: 'naranja', label: '🟠 Estoy sensible', mensaje: 'Estoy sensible. Necesito cuidado y palabras suaves.' },
        { estado: 'rojo', label: '🔴 Necesito espacio', mensaje: 'Necesito espacio para regularme. No me estoy yendo, solo necesito calma.' }
      ]
    },

    senal_minima: {
      icon: '🌙',
      titulo: 'Señal mínima',
      subtitulo: 'Una frase corta para seguir presente sin presionarte.',
      opciones: [
        { estado: 'calma', label: '🌙 Estoy aquí', mensaje: 'Estoy aquí, solo necesito calma.' },
        { estado: 'tardo', label: '🫧 Quizá tarde', mensaje: 'Te leo, pero quizá tarde en responder.' },
        { estado: 'no_rechazo', label: '🤍 No es rechazo', mensaje: 'No es rechazo, solo estoy procesando.' },
        { estado: 'despacio', label: '🌱 Ir despacio', mensaje: 'Quiero ir despacio, pero sigo aquí.' },
        { estado: 'poco', label: '🕯️ Puedo poco', mensaje: 'No puedo hablar mucho, pero sigo aquí.' }
      ]
    },

    pausa: {
      icon: '⏳',
      titulo: 'Pausa antes de responder',
      subtitulo: 'Tomarte un momento antes de contestar desde la emoción.',
      opciones: [
        { estado: '5min', label: '5 minutos', mensaje: 'Quiero responder bien. Dame 5 minutos para ordenar lo que siento.' },
        { estado: '10min', label: '10 minutos', mensaje: 'Necesito 10 minutos para no hablar desde el enojo o la ansiedad.' },
        { estado: '20min', label: '20 minutos', mensaje: 'Dame 20 minutos. No me estoy yendo, solo necesito regularme.' },
        { estado: 'mañana', label: 'Hasta mañana', mensaje: 'Hoy no puedo responder bien. Prefiero hablar mañana con más calma.' }
      ]
    },

    grounding_54321: {
      icon: '🫧',
      titulo: '5, 4, 3, 2, 1',
      subtitulo: 'Volver al presente cuando todo se siente demasiado.',
      opciones: [
        {
          estado: 'guiado',
          label: 'Iniciar guía',
          mensaje: 'Ahora no tengo que resolver todo. Solo vuelvo al presente: 5 cosas que veo, 4 que siento, 3 que escucho, 2 olores o sabores y 1 frase amable para mí.'
        }
      ]
    },

    volver_calma: {
      icon: '🌿',
      titulo: 'Volver con calma',
      subtitulo: 'Acercarte otra vez después de una pausa.',
      opciones: [
        { estado: 'mensaje_corto', label: 'Mensaje corto', mensaje: 'Ya puedo acercarme un poco más. Me gustaría volver con un mensaje corto, sin hablar de todo de golpe.' },
        { estado: 'mañana', label: 'Hablar mañana', mensaje: 'Quiero volver, pero prefiero que hablemos mañana con más calma.' },
        { estado: 'suave', label: 'Hablar suave', mensaje: 'Me gustaría volver despacio, con palabras suaves y sin presión.' },
        { estado: 'estar', label: 'Solo estar', mensaje: 'Quiero acercarme, pero quizá solo necesito estar sin hablar mucho.' }
      ]
    },

    quejas_anhelos: {
      icon: '💬',
      titulo: 'Quejas y anhelos',
      subtitulo: 'Convertir una molestia en una necesidad clara.',
      custom: true,
      campos: [
        { id: 'molesto', label: 'Lo que me molestó', placeholder: 'Ej: cuando no respondes por mucho tiempo...' },
        { id: 'necesito', label: 'Lo que en realidad necesito', placeholder: 'Ej: una señal pequeña para saber que seguimos bien...' }
      ],
      generar: (v) => {
        const molesto = v.molesto || 'esto';
        const necesito = v.necesito || 'poder hablarlo con calma';
        return `Cuando pasa ${molesto}, me siento sensible. Lo que necesito es ${necesito}.`;
      }
    },

    caja_recursos: {
      icon: '🎁',
      titulo: 'Caja de recursos',
      subtitulo: 'Elegir algo pequeño que te ayude ahora.',
      opciones: [
        { estado: 'musica', label: '🎵 Canción segura', mensaje: 'Voy a escuchar algo que me ayude a regularme antes de responder.' },
        { estado: 'calma', label: '🌙 Modo calma', mensaje: 'Necesito activar calma. No quiero alejarme mal, solo cuidarme un poco.' },
        { estado: 'frase', label: '💌 Frase de cuidado', mensaje: 'No tengo que poder con todo al mismo tiempo.' },
        { estado: 'respirar', label: '🫧 Respirar', mensaje: 'Voy a respirar un momento antes de seguir.' },
        { estado: 'pequeña_felicidad', label: '✨ Pequeña felicidad', mensaje: 'Hoy voy a hacer algo pequeño por mí.' }
      ]
    }
  };

  let herramientaActual = null;
  let mensajeActual = '';
  let estadoActual = '';

  function qs(id) {
    return document.getElementById(id);
  }

  function user() {
    if (typeof state !== 'undefined' && state.currentUser) {
      return state.currentUser;
    }

    try {
      return JSON.parse(sessionStorage.getItem('siga_user') || 'null');
    } catch {
      return null;
    }
  }

  function escapeHtml(v) {
    return String(v ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function toastLocal(msg) {
    if (typeof toast === 'function') return toast(msg);
    alert(msg);
  }

  async function apiEspacio(method, url, body) {
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

    const response = await fetch(url, opts);
    const text = await response.text();

    let data = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch (err) {
      console.error('Mi espacio recibió una respuesta no JSON:', text);
      return {
        ok: false,
        error: 'El servidor respondió algo inesperado.'
      };
    }

    if (response.status === 401) {
      sessionStorage.removeItem('siga_token');
      sessionStorage.removeItem('siga_user');
      return {
        ok: false,
        error: 'Tu sesión expiró. Vuelve a iniciar sesión.'
      };
    }

    return data;
  }

  function copiarTexto(texto) {
    if (!texto) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto)
        .then(() => toastLocal('Copiado ♡'))
        .catch(() => copiarTextoFallback(texto));
    } else {
      copiarTextoFallback(texto);
    }
  }

  function copiarTextoFallback(texto) {
    const ta = document.createElement('textarea');
    ta.value = texto;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    toastLocal('Copiado ♡');
  }

  function asegurarModal() {
    if (qs('modal-espacio')) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'modal-espacio';

    modal.innerHTML = `
      <div class="modal espacio-modal">
        <!--
          Para ti, si algún día entras al código:
          este espacio no fue hecho para vigilarte.
          Fue hecho para que puedas ordenar lo que sientes
          y decidir, a tu ritmo, qué quieres compartir.

          Para Franco del futuro:
          si esto se rompe otra vez, respira.
          No borres todo en un ataque de desesperación. XD
          Soy amor y doy amor. 
        -->

        <h2 class="modal-title" id="espacio-modal-title">Mi espacio</h2>

        <div id="espacio-modal-body"></div>

        <div class="modal-actions espacio-modal-actions">
          <button class="btn-cancel" onclick="cerrarEspacioModal()">
            Cerrar
          </button>

          <button class="btn" onclick="copiarMensajeEspacio()">
            Copiar
          </button>

          <button class="btn" onclick="guardarHerramientaEspacio(false)">
            Guardar para mí
          </button>

          <button class="btn-save" onclick="guardarHerramientaEspacio(true)">
            Compartir señal
          </button>
        </div>
      </div>
    `;

    modal.addEventListener('click', (e) => {
      if (e.target === modal) cerrarEspacioModal();
    });

    document.body.appendChild(modal);
  }

  function renderHerramientas() {
    const grid = qs('espacio-tools-grid');
    if (!grid) return;

    grid.innerHTML = Object.entries(herramientas).map(([key, h]) => `
      <button class="espacio-tool-card" onclick="abrirHerramientaEspacio('${key}')">
        <div class="espacio-tool-icon">${h.icon}</div>
        <div class="espacio-tool-title">${escapeHtml(h.titulo)}</div>
        <div class="espacio-tool-sub">${escapeHtml(h.subtitulo)}</div>
      </button>
    `).join('');
  }

  async function cargarHistorialEspacio() {
    const box = qs('espacio-historial');
    const u = user();

    if (!box || !u || !u.id) return;

    try {
      const data = await apiEspacio('GET', `/api/espacio/historial?x=${Date.now()}`);

      if (!data.ok) {
        box.innerHTML = '<div class="espacio-empty">No se pudo cargar el historial.</div>';
        return;
      }

      const privadas = data.privadas || [];
      const compartidas = data.compartidas || [];

      function nombrePersona(item) {
        if (item.rol === 'ella') return 'Francin';
        if (item.rol === 'yo') return 'Franco';
        return item.nombre_visible || item.usuario || 'Alguien';
      }

      function fechaBonita(item) {
        if (!item.creado_en) return '—';

        return new Date(item.creado_en).toLocaleString('es-BO', {
          timeZone: 'America/La_Paz',
          dateStyle: 'short',
          timeStyle: 'short'
        });
      }

      function renderItem(item, mostrarPersona) {
        const h = herramientas[item.herramienta] || {
          icon: '🌿',
          titulo: 'Mi espacio'
        };

        const fecha = fechaBonita(item);
        const persona = nombrePersona(item);

        return `
          <div class="espacio-history-item">
            <span>${h.icon}</span>
            <div>
              <strong>
                ${escapeHtml(h.titulo)}
                ${mostrarPersona ? ` · ${escapeHtml(persona)}` : ''}
              </strong>

              <p>${escapeHtml(item.mensaje)}</p>

              <small>
                ${fecha}
                ${item.compartido ? ' · compartida' : ' · privada'}
              </small>
            </div>
          </div>
        `;
      }

      const privadasHtml = privadas.length
        ? privadas.map(item => renderItem(item, false)).join('')
        : '<div class="espacio-empty">Todavía no guardaste señales privadas.</div>';

      const compartidasHtml = compartidas.length
        ? compartidas.map(item => renderItem(item, true)).join('')
        : '<div class="espacio-empty">Todavía no hay señales compartidas.</div>';

      box.innerHTML = `
        <!--
          Si algún día lees esto:
          lo privado se queda privado.
          lo compartido aparece aquí porque alguien decidió compartirlo.

          Si esto funciona: milagro.
          Si no funciona: probablemente olvidé un deploy.
        -->

        <div class="espacio-history-section">
          <h3>Mis señales privadas</h3>
          <p class="espacio-history-note">
            Solo tú ves lo que guardas aquí.
          </p>
          ${privadasHtml}
        </div>

        <div class="espacio-history-section">
          <h3>Señales compartidas</h3>
          <p class="espacio-history-note">
            Aquí aparecen solo las señales que alguien decidió compartir.
          </p>
          ${compartidasHtml}
        </div>
      `;

    } catch (err) {
      console.warn('No se pudo cargar historial de Mi espacio:', err);
      box.innerHTML = '<div class="espacio-empty">No se pudo cargar el historial.</div>';
    }
  }

  function abrirHerramientaEspacio(key) {
    asegurarModal();

    herramientaActual = key;
    mensajeActual = '';
    estadoActual = '';

    const h = herramientas[key];
    if (!h) return;

    qs('espacio-modal-title').textContent = `${h.icon} ${h.titulo}`;

    if (h.custom) {
      qs('espacio-modal-body').innerHTML = `
        <p class="espacio-modal-sub">${escapeHtml(h.subtitulo)}</p>

        <div class="espacio-custom-form">
          ${h.campos.map(c => `
            <label>${escapeHtml(c.label)}</label>
            <textarea id="espacio-campo-${c.id}" placeholder="${escapeHtml(c.placeholder)}"></textarea>
          `).join('')}

          <button class="btn" onclick="generarMensajeEspacioCustom()">Generar frase suave</button>

          <div class="espacio-preview" id="espacio-preview">La frase aparecerá aquí.</div>
        </div>
      `;
    } else if (key === 'grounding_54321') {
      mensajeActual = h.opciones[0].mensaje;
      estadoActual = h.opciones[0].estado;

      qs('espacio-modal-body').innerHTML = `
        <p class="espacio-modal-sub">${escapeHtml(h.subtitulo)}</p>

        <div class="espacio-grounding">
          <div><strong>5</strong><span>cosas que veo</span></div>
          <div><strong>4</strong><span>cosas que siento con el cuerpo</span></div>
          <div><strong>3</strong><span>sonidos que escucho</span></div>
          <div><strong>2</strong><span>olores o sabores</span></div>
          <div><strong>1</strong><span>frase amable para mí</span></div>
        </div>

        <div class="espacio-preview activo">${escapeHtml(mensajeActual)}</div>
      `;
    } else {
      qs('espacio-modal-body').innerHTML = `
        <p class="espacio-modal-sub">${escapeHtml(h.subtitulo)}</p>

        <div class="espacio-options">
          ${h.opciones.map((op, i) => `
            <button class="espacio-option" onclick="seleccionarMensajeEspacio('${key}', ${i})">
              <strong>${escapeHtml(op.label)}</strong>
              <span>${escapeHtml(op.mensaje)}</span>
            </button>
          `).join('')}
        </div>

        <div class="espacio-preview" id="espacio-preview">Elige una opción.</div>
      `;
    }

    qs('modal-espacio').classList.add('open');
  }

  function seleccionarMensajeEspacio(key, index) {
    const h = herramientas[key];
    const op = h && h.opciones ? h.opciones[index] : null;

    if (!op) return;

    mensajeActual = op.mensaje;
    estadoActual = op.estado;

    document.querySelectorAll('.espacio-option').forEach(b => b.classList.remove('selected'));

    const btns = Array.from(document.querySelectorAll('.espacio-option'));
    if (btns[index]) btns[index].classList.add('selected');

    const preview = qs('espacio-preview');

    if (preview) {
      preview.classList.add('activo');
      preview.textContent = mensajeActual;
    }
  }

  function generarMensajeEspacioCustom() {
    const h = herramientas[herramientaActual];

    if (!h || !h.custom) return;

    const values = {};

    h.campos.forEach(c => {
      const el = qs(`espacio-campo-${c.id}`);
      values[c.id] = el ? el.value.trim() : '';
    });

    mensajeActual = h.generar(values);
    estadoActual = 'generado';

    const preview = qs('espacio-preview');

    if (preview) {
      preview.classList.add('activo');
      preview.textContent = mensajeActual;
    }
  }

  async function guardarHerramientaEspacio(compartido) {
    const u = user();

    if (!u || !u.id) {
      return toastLocal('Primero inicia sesión.');
    }

    if (!herramientaActual) return;

    if (!mensajeActual && herramientas[herramientaActual]?.custom) {
      generarMensajeEspacioCustom();
    }

    if (!mensajeActual) {
      return toastLocal('Primero elige o genera una frase.');
    }

    try {
      const data = await apiEspacio('POST', '/api/espacio/usar', {
        herramienta: herramientaActual,
        estado: estadoActual,
        mensaje: mensajeActual,
        compartido: !!compartido
      });

      if (!data.ok) {
        return toastLocal(data.error || 'No se pudo guardar.');
      }

      if (compartido) {
        toastLocal(data.mensaje_bonito || 'Señal compartida ♡');
      } else {
        toastLocal(data.mensaje_bonito || 'Guardado solo para ti ♡');
      }

      cerrarEspacioModal();
      cargarHistorialEspacio();

      if (typeof cargarProgresoGlobal === 'function') {
        cargarProgresoGlobal();
      }

    } catch (err) {
      console.error('Error al guardar herramienta:', err);
      toastLocal('Error al guardar herramienta.');
    }
  }

  function copiarMensajeEspacio() {
    if (!mensajeActual && herramientas[herramientaActual]?.custom) {
      generarMensajeEspacioCustom();
    }

    if (!mensajeActual) {
      return toastLocal('Primero elige o genera una frase.');
    }

    copiarTexto(mensajeActual);
  }

  function cerrarEspacioModal() {
    const modal = qs('modal-espacio');
    if (modal) modal.classList.remove('open');
  }

  function loadEspacio() {
    renderHerramientas();
    cargarHistorialEspacio();
  }

  function limpiarDuplicadosMiEspacio() {
    const botones = Array.from(document.querySelectorAll('.nav-item'))
      .filter(btn => btn.textContent && btn.textContent.includes('Mi espacio'));

    if (!botones.length) return null;

    const principal = botones[0];

    botones.slice(1).forEach(btn => btn.remove());

    principal.id = 'nav-mi-espacio';
    principal.onclick = function () {
      if (typeof navigateTo === 'function') {
        navigateTo('espacio');
      }

      setTimeout(loadEspacio, 100);
    };

    return principal;
  }

  function reforzarNavegacion() {
    const nav = document.querySelector('.sidebar-nav');
    if (!nav) return;

    const existente = limpiarDuplicadosMiEspacio();

    if (existente) return;

    const btn = document.createElement('button');
    btn.className = 'nav-item';
    btn.id = 'nav-mi-espacio';
    btn.innerHTML = '<span class="nav-icon">🌿</span><span>Mi espacio</span>';

    btn.onclick = function () {
      if (typeof navigateTo === 'function') {
        navigateTo('espacio');
      }

      setTimeout(loadEspacio, 100);
    };

    const calmaBtn = Array.from(nav.querySelectorAll('.nav-item'))
      .find(b => b.textContent && b.textContent.includes('Modo calma'));

    if (calmaBtn) {
      nav.insertBefore(btn, calmaBtn);
    } else {
      nav.appendChild(btn);
    }
  }

  function instalarClickMiEspacio() {
    if (window.__sigaMiEspacioClickInstalado) return;
    window.__sigaMiEspacioClickInstalado = true;

    document.addEventListener('click', function (e) {
      const btn = e.target.closest('.nav-item');
      if (!btn) return;

      if (btn.textContent && btn.textContent.includes('Mi espacio')) {
        setTimeout(loadEspacio, 100);
      }
    });
  }

  window.loadEspacio = loadEspacio;
  window.abrirHerramientaEspacio = abrirHerramientaEspacio;
  window.seleccionarMensajeEspacio = seleccionarMensajeEspacio;
  window.generarMensajeEspacioCustom = generarMensajeEspacioCustom;
  window.guardarHerramientaEspacio = guardarHerramientaEspacio;
  window.copiarMensajeEspacio = copiarMensajeEspacio;
  window.cerrarEspacioModal = cerrarEspacioModal;

  document.addEventListener('DOMContentLoaded', function () {
    reforzarNavegacion();
    instalarClickMiEspacio();

    setTimeout(function () {
      if (qs('page-espacio')) {
        renderHerramientas();
      }
    }, 300);
  });

  setTimeout(reforzarNavegacion, 600);
  setTimeout(reforzarNavegacion, 1500);
})();
