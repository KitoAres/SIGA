/* ======================================================
   SIGy Widget ✨
   La mini presencia de SIGA.
   ====================================================== */

(function () {
  const frasesPorSeccion = {
    dashboard: 'Estoy aquí para acompañar con amor, comprension y ternura.',
    recuerdos: 'Los recuerdos también pueden abrazar un poco.',
    citas: 'Podemos pensar un plan bonito, sin complicarlo.',
    playlist: 'A veces una canción dice lo que cuesta escribir.',
    razones: 'Las razones bonitas también merecen calma.',
    promesas: 'Prometer también es cuidar con acciones pequeñas.',
    carta: 'Puedo ayudarte a decirlo más suave.',
    tiempo: 'Podemos buscar una forma tranquila de coincidir.',
    eventos: 'Una misión pequeña también cuenta.',
    cajita: 'Los detalles guardados también hablan.',
    espacio: 'Esto puede quedarse solo para ti.',
    calma: 'Modo avión también puede ser una forma de cuidarse.',
    admin: 'Zona admin. Yo no juzgo, solo observo el código sufrir.'
  };

  const modos = [
    { id: 'acompañar', label: 'Acompañar' },
    { id: 'suavizar', label: 'Suavizar' },
    { id: 'carta', label: 'Carta' },
    { id: 'señal', label: 'Señal' },
    { id: 'decidir', label: 'Decidir' }
  ];

  let abierto = false;
  let modoActual = 'acompañar';

  function getSeccionActual() {
    const activa = document.querySelector('.page.active');
    if (!activa || !activa.id) return 'general';
    return activa.id.replace('page-', '');
  }

  function fraseContextual() {
    const seccion = getSeccionActual();
    return frasesPorSeccion[seccion] || 'Estoy aquí, a tu ritmo.';
  }

  function crearWidget() {
    if (document.getElementById('sigy-widget')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'sigy-widget';

    wrapper.innerHTML = `
      <button id="sigy-burbuja" title="Hablar con SIGy">
        <div class="sigy-carita" id="sigy-carita">
          <div class="sigy-ojos">
            <span></span>
            <span></span>
          </div>
          <div class="sigy-boca"></div>
        </div>
        <div class="sigy-nombre">SIGy</div>
      </button>

      <div id="sigy-panel">
        <div class="sigy-panel-header">
          <div>
            <div class="sigy-title">SIGy ✨</div>
            <div class="sigy-subtitle" id="sigy-subtitle">A tu ritmo, sin presión.</div>
          </div>
          <button id="sigy-cerrar">×</button>
        </div>

        <div class="sigy-modos" id="sigy-modos"></div>

        <textarea id="sigy-input" placeholder="Escribe algo... SIGy puede ayudarte a suavizarlo, convertirlo en carta o decidir si conviene enviarlo."></textarea>

        <div class="sigy-actions">
          <button id="sigy-enviar">Enviar</button>
          <button id="sigy-limpiar">Limpiar</button>
        </div>

        <div id="sigy-respuesta">
          <span>${fraseContextual()}</span>
        </div>
      </div>
    `;

    document.body.appendChild(wrapper);

    const modosBox = document.getElementById('sigy-modos');

    modos.forEach(m => {
      const btn = document.createElement('button');
      btn.textContent = m.label;
      btn.dataset.modo = m.id;

      if (m.id === modoActual) {
        btn.classList.add('active');
      }

      btn.addEventListener('click', () => {
        modoActual = m.id;

        document.querySelectorAll('.sigy-modos button').forEach(b => {
          b.classList.remove('active');
        });

        btn.classList.add('active');
      });

      modosBox.appendChild(btn);
    });

    document.getElementById('sigy-burbuja').addEventListener('click', toggleSigy);
    document.getElementById('sigy-cerrar').addEventListener('click', cerrarSigy);
    document.getElementById('sigy-enviar').addEventListener('click', hablarConSigy);
    document.getElementById('sigy-limpiar').addEventListener('click', limpiarSigy);

    setInterval(actualizarFrasePorSeccion, 1200);
  }

  function toggleSigy() {
    abierto = !abierto;

    const panel = document.getElementById('sigy-panel');
    const carita = document.getElementById('sigy-carita');

    if (abierto) {
      panel.classList.add('visible');
      carita.classList.add('feliz');
      actualizarFrasePorSeccion();
    } else {
      panel.classList.remove('visible');
      carita.classList.remove('feliz');
    }
  }

  function cerrarSigy() {
    abierto = false;
    document.getElementById('sigy-panel').classList.remove('visible');
    document.getElementById('sigy-carita').classList.remove('feliz');
  }

  function actualizarFrasePorSeccion() {
    const subtitle = document.getElementById('sigy-subtitle');
    const respuesta = document.getElementById('sigy-respuesta');

    if (subtitle) {
      subtitle.textContent = fraseContextual();
    }

    if (respuesta && !respuesta.dataset.tocado) {
      respuesta.innerHTML = `<span>${fraseContextual()}</span>`;
    }
  }

  function setEstadoCarita(estado) {
    const carita = document.getElementById('sigy-carita');
    if (!carita) return;

    carita.classList.remove('pensando', 'feliz', 'triste');

    if (estado) {
      carita.classList.add(estado);
    }
  }

  async function hablarConSigy() {
    const input = document.getElementById('sigy-input');
    const respuestaDiv = document.getElementById('sigy-respuesta');

    const mensaje = input.value.trim();

    if (!mensaje) {
      respuestaDiv.dataset.tocado = '1';
      respuestaDiv.innerHTML = '<span>Escribe algo pequeño. No hace falta explicar todo.</span>';
      return;
    }

    respuestaDiv.dataset.tocado = '1';
    respuestaDiv.innerHTML = '<span>SIGy está pensando suavecito...</span>';
    setEstadoCarita('pensando');

    try {
      const res = await fetch('/api/sigy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mensaje,
          modo: modoActual,
          seccion: getSeccionActual()
        })
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Error desconocido');
      }

      respuestaDiv.innerHTML = `<span>${escapeHtml(data.respuesta)}</span>`;
      setEstadoCarita('feliz');

    } catch (error) {
      console.error('Error hablando con SIGy:', error);
      respuestaDiv.innerHTML = '<span>SIGy se trabó un poquito 😔. Revisa la API key o intenta otra vez.</span>';
      setEstadoCarita('triste');
    }
  }

  function limpiarSigy() {
    const input = document.getElementById('sigy-input');
    const respuestaDiv = document.getElementById('sigy-respuesta');

    input.value = '';
    respuestaDiv.dataset.tocado = '';
    respuestaDiv.innerHTML = `<span>${fraseContextual()}</span>`;
    setEstadoCarita('');
  }

  function escapeHtml(texto) {
    return String(texto || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;')
      .replace(/\n/g, '<br>');
  }

  document.addEventListener('DOMContentLoaded', crearWidget);
})();
