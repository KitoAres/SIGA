/* SIGA v2.1 — Mi espacio
   Herramientas personales, no invasivas:
   - No diario íntimo.
   - No diagnóstico.
   - Mensajes cortos, copiables y compartibles solo si la persona quiere.
   - Corrige menú duplicado.
*/

(function () {
  const herramientas = {
    semaforo: {
      icon: '🚦',
      titulo: 'Semáforo emocional',
      subtitulo: 'Decir cómo estás sin tener que explicar todo.',
      opciones: [
        {
          estado: 'verde',
          label: '🟢 Puedo hablar',
          mensaje: 'Estoy disponible para hablar con calma.'
        },
        {
          estado: 'amarillo',
          label: '🟡 Puedo hablar poquito',
          mensaje: 'Puedo hablar, pero despacio. Si tardo, no es rechazo.'
        },
        {
          estado: 'naranja',
          label: '🟠 Estoy sensible',
          mensaje: 'Estoy sensible. Necesito cuidado y palabras suaves.'
        },
        {
          estado: 'rojo',
          label: '🔴 Necesito espacio',
          mensaje: 'Necesito espacio para regularme. No me estoy yendo, solo necesito calma.'
        }
      ]
    },

    senal_minima: {
      icon: '🌙',
      titulo: 'Señal mínima',
      subtitulo: 'Una frase corta para seguir presente sin presionarte.',
      opciones: [
        {
          estado: 'calma',
          label: '🌙 Estoy aquí',
          mensaje: 'Estoy aquí, solo necesito calma.'
        },
        {
          estado: 'tardo',
          label: '🫧 Quizá tarde',
          mensaje: 'Te leo, pero quizá tarde en responder.'
        },
        {
          estado: 'no_rechazo',
          label: '🤍 No es rechazo',
          mensaje: 'No es rechazo, solo estoy procesando.'
        },
        {
          estado: 'despacio',
          label: '🌱 Ir despacio',
          mensaje: 'Quiero ir despacio, pero sigo aquí.'
        },
        {
          estado: 'poco',
          label: '🕯️ Puedo poco',
          mensaje: 'No puedo hablar mucho, pero sigo aquí.'
        }
      ]
    },

    pausa: {
      icon: '⏳',
      titulo: 'Pausa antes de responder',
      subtitulo: 'Tomarte un momento antes de contestar desde la emoción.',
      opciones: [
        {
          estado: '5min',
          label: '5 minutos',
          mensaje: 'Quiero responder bien. Dame 5 minutos para ordenar lo que siento.'
        },
        {
          estado: '10min',
          label: '10 minutos',
          mensaje: 'Necesito 10 minutos para no hablar desde el enojo o la ansiedad.'
        },
        {
          estado: '20min',
          label: '20 minutos',
          mensaje: 'Dame 20 minutos. No me estoy yendo, solo necesito regularme.'
        },
        {
          estado: 'mañana',
          label: 'Hasta mañana',
          mensaje: 'Hoy no puedo responder bien. Prefiero hablar mañana con más calma.'
        }
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
        {
          estado: 'mensaje_corto',
          label: 'Mensaje corto',
          mensaje: 'Ya puedo acercarme un poco más. Me gustaría volver con un mensaje corto, sin hablar de todo de golpe.'
        },
        {
          estado: 'mañana',
          label: 'Hablar mañana',
          mensaje: 'Quiero volver, pero prefiero que hablemos mañana con más calma.'
        },
        {
          estado: 'suave',
          label: 'Hablar suave',
          mensaje: 'Me gustaría volver despacio, con palabras suaves y sin presión.'
        },
        {
          estado: 'estar',
          label: 'Solo estar',
          mensaje: 'Quiero acercarme, pero quizá solo necesito estar sin hablar mucho.'
        }
      ]
    },

    quejas_anhelos: {
      icon: '💬',
      titulo: 'Quejas y anhelos',
      subtitulo: 'Convertir una molestia en una necesidad clara.',
      custom: true,
      campos: [
        {
          id: 'molesto',
          label: 'Lo que me molestó',
          placeholder: 'Ej: cuando no respondes por mucho tiempo...'
        },
        {
          id: 'necesito',
          label: 'Lo que en realidad necesito',
          placeholder: 'Ej: una señal pequeña para saber que seguimos bien...'
        }
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
        {
          estado: 'musica',
          label: '🎵 Canción segura',
          mensaje: 'Voy a escuchar algo que me ayude a regularme antes de responder.'
        },
        {
          estado: 'calma',
          label: '🌙 Modo calma',
          mensaje: 'Necesito activar calma. No quiero alejarme mal, solo cuidarme un poco.'
        },
        {
          estado: 'frase',
          label: '💌 Frase de cuidado',
          mensaje: 'No tengo que poder con todo al mismo tiempo.'
        },
        {
          estado: 'respirar',
          label: '🫧 Respirar',
          mensaje: 'Voy a respirar un momento antes de seguir.'
        },
        {
          estado: 'pequeña_felicidad',
          label: '✨ Pequeña felicidad',
          mensaje: 'Hoy voy a hacer algo pequeño por mí.'
        }
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
    if (typeof toast === 'function') {
      return toast(msg);
    }

    alert(msg);
  }

  function copiarTexto(texto) {
    if (!texto) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(() => {
        toastLocal('Copiado ♡');
      }).catch(() => {
        copiarTextoFallback(texto);
      });
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
        <h2 class="modal-title" id="espacio-modal-title">Mi espacio</h2>

        <div id="espacio-modal-body"></div>

        <div class="modal-actions espacio-modal-actions">
          <button class="btn-cancel" onclick="cerrarEspacioModal()">Cerrar</button>
          <button class="btn" onclick="copiarMensajeEspacio()">Copiar</button>
          <button class="btn-save" onclick="guardarHerramientaEspacio(true)">Guardar señal</button>
        </div>
      </div>
    `;

    modal.addEventListener('click', (e) => {
      if (e.target === modal) cerrarEspacioModal();
    });

    document.body.appendChild(modal);
  }

  function asegurarSeccionEspacio() {
    const main = document.querySelector('.main-content');
    if (!main) return;

    let section = qs('page-espacio');

    if (!section) {
      section = document.createElement('section');
      section.className = 'page';
      section.id = 'page-espacio';
      main.appendChild(section);
    }

    section.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Mi <span>espacio</span></h1>
          <p class="page-subtitle">Herramientas pequeñas para ordenar lo que sientes, pedir calma o volver sin presión.</p>
        </div>
      </div>

      <div class="espacio-hero">
        <div class="espacio-hero-icon">🌿</div>
        <div>
          <h3>Un lugar pequeño para no cargar todo de golpe.</h3>
          <p>
            Aquí puedes ordenar lo que sientes, pedir una pausa o encontrar una forma suave de volver.
          </p>
          <p>
            No es una prueba, no es una obligación y no tienes que explicar más de lo que puedas explicar.
          </p>

          <div class="espacio-rules">
            <div><strong>Privado:</strong> úsalo solo para ordenar tu respuesta.</div>
            <div><strong>Señal:</strong> guarda una frase breve para cuidar el vínculo.</div>
            <div><strong>Copiar:</strong> llévala a WhatsApp si prefieres enviarla fuera de SIGA.</div>
          </div>
        </div>
      </div>

      <div id="espacio-tools-grid" class="espacio-tools-grid"></div>

      <div class="espacio-history-box">
        <h3>Últimas señales guardadas</h3>
        <div id="espacio-historial">
          <div class="espacio-empty">Todavía no hay señales guardadas. Puedes usar las herramientas sin presión.</div>
        </div>
      </div>
    `;
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
      const res = await fetch(`/api/espacio/historial?usuario_id=${encodeURIComponent(u.id)}&x=${Date.now()}`);
      const data = await res.json();

      if (!data.ok || !data.items || !data.items.length) {
        box.innerHTML = '<div class="espacio-empty">Todavía no hay señales guardadas. Puedes usar las herramientas sin presión.</div>';
        return;
      }

      box.innerHTML = data.items.slice(0, 6).map(item => {
        const h = herramientas[item.herramienta] || {
          icon: '🌿',
          titulo: 'Mi espacio'
        };

        const fecha = item.creado_en
          ? new Date(item.creado_en).toLocaleString('es-BO', {
              dateStyle: 'short',
              timeStyle: 'short'
            })
          : '—';

        return `
          <div class="espacio-history-item">
            <span>${h.icon}</span>
            <div>
              <strong>${escapeHtml(h.titulo)}</strong>
              <p>${escapeHtml(item.mensaje)}</p>
              <small>${fecha}${item.compartido ? ' · señal guardada' : ''}</small>
            </div>
          </div>
        `;
      }).join('');
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

          <div class="espacio-preview" id="espacio-preview">
            La frase aparecerá aquí.
          </div>
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

        <div class="espacio-preview activo">
          ${escapeHtml(mensajeActual)}
        </div>
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

        <div class="espacio-preview" id="espacio-preview">
          Elige una opción.
        </div>
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

    document.querySelectorAll('.espacio-option').forEach(b => {
      b.classList.remove('selected');
    });

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
      const res = await fetch('/api/espacio/usar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          usuario_id: u.id,
          herramienta: herramientaActual,
          estado: estadoActual,
          mensaje: mensajeActual,
          compartido: !!compartido
        })
      });

      const data = await res.json();

      if (!data.ok) {
        return toastLocal(data.error || 'No se pudo guardar.');
      }

      toastLocal(data.mensaje_bonito || 'Guardado ♡');

      cerrarEspacioModal();
      cargarHistorialEspacio();

      if (typeof cargarProgresoGlobal === 'function') {
        cargarProgresoGlobal();
      }
    } catch (err) {
      console.error('Error guardando herramienta de Mi espacio:', err);
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

    if (modal) {
      modal.classList.remove('open');
    }
  }

  function loadEspacio() {
    asegurarSeccionEspacio();
    renderHerramientas();
    cargarHistorialEspacio();
  }

  function limpiarBotonesDuplicadosMiEspacio() {
    const botones = Array.from(document.querySelectorAll('.nav-item'))
      .filter(btn => btn.textContent && btn.textContent.includes('Mi espacio'));

    if (!botones.length) return null;

    const primero = botones[0];

    botones.slice(1).forEach(btn => btn.remove());

    primero.id = 'nav-mi-espacio';
    primero.onclick = function () {
      if (typeof navigateTo === 'function') {
        navigateTo('espacio');
      }

      setTimeout(loadEspacio, 100);
    };

    return primero;
  }

  function reforzarNavegacion() {
    const nav = document.querySelector('.sidebar-nav');
    if (!nav) return;

    const existente = limpiarBotonesDuplicadosMiEspacio();

    if (existente) {
      return;
    }

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

  function instalarClickDelegado() {
    if (window.__sigaEspacioClickDelegado) return;
    window.__sigaEspacioClickDelegado = true;

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
    instalarClickDelegado();

    setTimeout(function () {
      asegurarSeccionEspacio();
      renderHerramientas();
    }, 300);
  });

  setTimeout(function () {
    reforzarNavegacion();
    instalarClickDelegado();
  }, 600);

  setTimeout(function () {
    reforzarNavegacion();
  }, 1500);
})();

/* =========================================================
   SIGA — MI ESPACIO (REDISEÑO VISUAL)
   Pegar al final de style.css
========================================================= */

#page-espacio {
  padding: 34px 32px 48px;
  max-width: 1380px;
  margin: 0 auto;
}

#page-espacio .page-header {
  margin-bottom: 22px;
}

#page-espacio .page-title {
  font-size: 2.25rem;
  line-height: 1.05;
  margin: 0;
  letter-spacing: -0.02em;
}

#page-espacio .page-title span {
  color: #c894ff;
  font-style: italic;
  font-weight: 500;
}

#page-espacio .page-subtitle {
  margin-top: 8px;
  max-width: 760px;
  color: rgba(235, 227, 255, 0.72);
  font-size: 1rem;
  line-height: 1.55;
}

/* HERO */
.espacio-hero {
  position: relative;
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 20px;
  align-items: start;
  padding: 24px 26px;
  margin-bottom: 28px;
  border-radius: 24px;
  border: 1px solid rgba(203, 159, 255, 0.18);
  background:
    linear-gradient(135deg, rgba(35, 19, 55, 0.86), rgba(16, 12, 33, 0.78)),
    radial-gradient(circle at top right, rgba(188, 124, 255, 0.14), transparent 38%);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(255,255,255,0.03);
  overflow: hidden;
}

.espacio-hero::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255,255,255,0.02), transparent 35%);
}

.espacio-hero-icon {
  width: 72px;
  height: 72px;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  background: linear-gradient(180deg, rgba(96, 201, 131, 0.18), rgba(113, 88, 255, 0.08));
  border: 1px solid rgba(155, 231, 172, 0.22);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
}

.espacio-hero h3 {
  margin: 0 0 10px;
  font-size: 1.5rem;
  line-height: 1.15;
  color: #fff;
}

.espacio-hero p {
  margin: 0 0 8px;
  color: rgba(238, 232, 255, 0.84);
  line-height: 1.65;
  max-width: 820px;
  font-size: 1rem;
}

.espacio-rules {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.espacio-rules div {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255,255,255,0.035);
  border: 1px solid rgba(255,255,255,0.05);
  color: rgba(245, 240, 255, 0.88);
  line-height: 1.55;
}

.espacio-rules strong {
  color: #ffffff;
}

/* GRID DE HERRAMIENTAS */
.espacio-tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(245px, 1fr));
  gap: 18px;
  margin-bottom: 30px;
}

.espacio-tool-card {
  position: relative;
  text-align: left;
  padding: 20px 18px 18px;
  min-height: 182px;
  border-radius: 22px;
  border: 1px solid rgba(191, 153, 255, 0.15);
  background:
    linear-gradient(180deg, rgba(27, 18, 42, 0.90), rgba(17, 13, 31, 0.88));
  box-shadow:
    0 10px 26px rgba(0, 0, 0, 0.20),
    inset 0 1px 0 rgba(255,255,255,0.03);
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
  cursor: pointer;
  overflow: hidden;
}

.espacio-tool-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(201, 143, 255, 0.08), transparent 36%);
  pointer-events: none;
}

.espacio-tool-card:hover {
  transform: translateY(-4px);
  border-color: rgba(212, 171, 255, 0.34);
  box-shadow:
    0 16px 34px rgba(0, 0, 0, 0.28),
    0 0 0 1px rgba(212, 171, 255, 0.04) inset;
}

.espacio-tool-icon {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 1.35rem;
  background: linear-gradient(180deg, rgba(113, 230, 147, 0.10), rgba(133, 111, 255, 0.10));
  border: 1px solid rgba(184, 242, 196, 0.16);
}

.espacio-tool-title {
  font-size: 1.35rem;
  line-height: 1.2;
  color: #f7f2ff;
  margin-bottom: 8px;
  font-weight: 600;
}

.espacio-tool-sub {
  color: rgba(228, 220, 245, 0.76);
  line-height: 1.6;
  font-size: 0.98rem;
  max-width: 32ch;
}

/* HISTORIAL */
.espacio-history-box {
  padding: 22px 22px 18px;
  border-radius: 22px;
  border: 1px solid rgba(191, 153, 255, 0.14);
  background:
    linear-gradient(180deg, rgba(25, 17, 40, 0.88), rgba(16, 12, 28, 0.84));
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255,255,255,0.025);
}

.espacio-history-box h3 {
  margin: 0 0 14px;
  font-size: 1.3rem;
  color: #fff;
}

.espacio-empty {
  color: rgba(226, 218, 242, 0.68);
  line-height: 1.6;
  padding: 8px 0 2px;
}

.espacio-history-item {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 14px;
  align-items: start;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.espacio-history-item:last-child {
  border-bottom: none;
}

.espacio-history-item > span {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.06);
  font-size: 1.1rem;
}

.espacio-history-item strong {
  display: block;
  color: #fff;
  margin-bottom: 5px;
}

.espacio-history-item p {
  margin: 0 0 5px;
  color: rgba(232, 224, 245, 0.8);
  line-height: 1.55;
}

.espacio-history-item small {
  color: rgba(207, 197, 226, 0.62);
}

/* MODAL */
.espacio-modal {
  width: min(760px, 92vw);
  padding: 26px 26px 22px;
  border-radius: 24px;
  border: 1px solid rgba(198, 160, 255, 0.18);
  background:
    linear-gradient(180deg, rgba(29, 20, 46, 0.97), rgba(17, 12, 31, 0.97));
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.42);
}

.espacio-modal-sub {
  margin: 0 0 16px;
  color: rgba(233, 224, 246, 0.76);
  line-height: 1.6;
}

.espacio-options {
  display: grid;
  gap: 12px;
  margin-bottom: 18px;
}

.espacio-option {
  width: 100%;
  text-align: left;
  padding: 14px 15px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
  color: #f6f1ff;
  transition: all 0.18s ease;
}

.espacio-option:hover {
  border-color: rgba(205, 168, 255, 0.28);
  background: rgba(255,255,255,0.055);
}

.espacio-option.selected {
  border-color: rgba(206, 161, 255, 0.4);
  background: linear-gradient(180deg, rgba(170, 110, 255, 0.14), rgba(255,255,255,0.04));
}

.espacio-option strong {
  display: block;
  margin-bottom: 5px;
  font-size: 0.98rem;
}

.espacio-option span {
  display: block;
  color: rgba(231, 223, 245, 0.76);
  line-height: 1.5;
  font-size: 0.94rem;
}

.espacio-preview {
  padding: 14px 16px;
  border-radius: 16px;
  min-height: 62px;
  border: 1px dashed rgba(210, 171, 255, 0.18);
  color: rgba(240, 234, 250, 0.78);
  background: rgba(255,255,255,0.025);
  line-height: 1.6;
}

.espacio-preview.activo {
  border-style: solid;
  border-color: rgba(211, 173, 255, 0.28);
  color: #fff;
  background: rgba(255,255,255,0.045);
}

.espacio-custom-form {
  display: grid;
  gap: 12px;
}

.espacio-custom-form label {
  font-weight: 600;
  color: #f4efff;
  margin-top: 4px;
}

.espacio-custom-form textarea {
  width: 100%;
  min-height: 92px;
  resize: vertical;
  padding: 14px 15px;
  border-radius: 16px;
  outline: none;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  color: #fff;
  font-family: inherit;
  font-size: 0.97rem;
  line-height: 1.55;
}

.espacio-custom-form textarea:focus {
  border-color: rgba(209, 171, 255, 0.34);
  box-shadow: 0 0 0 4px rgba(191, 120, 255, 0.08);
}

.espacio-grounding {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.espacio-grounding div {
  padding: 14px 12px;
  border-radius: 16px;
  text-align: center;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
}

.espacio-grounding strong {
  display: block;
  font-size: 1.25rem;
  color: #fff;
  margin-bottom: 6px;
}

.espacio-grounding span {
  color: rgba(226, 218, 242, 0.72);
  font-size: 0.92rem;
  line-height: 1.4;
}

.espacio-modal-actions {
  margin-top: 18px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  #page-espacio {
    padding: 24px 18px 38px;
  }

  .espacio-hero {
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 20px 18px;
  }

  .espacio-hero-icon {
    width: 62px;
    height: 62px;
  }

  .espacio-tool-card {
    min-height: 168px;
  }
}

@media (max-width: 640px) {
  #page-espacio .page-title {
    font-size: 1.85rem;
  }

  .espacio-tools-grid {
    grid-template-columns: 1fr;
  }

  .espacio-history-box {
    padding: 18px 16px;
  }

  .espacio-modal {
    padding: 20px 16px 18px;
    border-radius: 20px;
  }

  .espacio-modal-actions {
    justify-content: stretch;
  }

  .espacio-modal-actions button {
    flex: 1 1 100%;
  }
}
