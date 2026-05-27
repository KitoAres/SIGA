/* ======================================================
   SIGy Widget v4 ✨
   Más limpio, menos botones, menos ruido.
   Programar esto fue sufrir, pero con amor.
   ====================================================== */

(function () {
  const saludosEntrada = [
    'Qué bonito verte por aquí ✨',
    'Volviste. SIGA se siente un poquito más vivo.',
    'Hola. Podemos ordenar algo con calma.',
    'Me alegra verte. ¿Quieres escribir algo más suave?',
    'Aquí estoy. No para presionar, sino para ayudarte.',
    'Hoy no hace falta resolver todo. Podemos empezar por algo pequeño.'
  ];

  const mensajitosIdle = [
    'Puedo ayudarte a escribir sin que suene a reclamo.',
    'Si algo pesa, podemos bajarlo a palabras más suaves.',
    'No todo tiene que enviarse. A veces primero se guarda.',
    'Puedo convertir una idea intensa en una señal pequeña.',
    'Si dudas, podemos decidir: enviar, esperar o guardar.',
    'Una carta también puede respirar antes de compartirse.',
    'Podemos cuidar el vínculo sin perseguirlo.'
  ];

  const frasesPorSeccion = {
    dashboard: 'Puedo ayudarte a pensar qué hacer hoy en SIGA.',
    recuerdos: 'Puedo ayudarte a escribir un recuerdo bonito y claro.',
    citas: 'Puedo ayudarte a proponer un plan simple y sin presión.',
    playlist: 'Puedo ayudarte a escribir una dedicatoria suave.',
    razones: 'Puedo ayudarte a escribir algo bonito sin exagerarlo.',
    promesas: 'Puedo ayudarte a volver una promesa más realista.',
    carta: 'Puedo ayudarte a suavizar una carta antes de guardarla.',
    tiempo: 'Puedo ayudarte a proponer un momento sin presionar.',
    eventos: 'Puedo ayudarte a pensar una misión pequeña.',
    cajita: 'Puedo ayudarte a describir este detalle de forma bonita.',
    espacio: 'Puedo ayudarte a decidir si esto se guarda o se comparte.',
    calma: 'Puedo ayudarte a escribir una pausa sin culpa.',
    admin: 'Zona admin. Aquí también se sufre, pero con estilo.'
  };

  const modos = {
    libre: 'acompañar',
    suavizar: 'suavizar',
    señal: 'señal',
    decidir: 'decidir',
    carta: 'carta'
  };

  const ayudasModo = {
    libre: 'Cuéntame qué pasa y te ayudo a ordenarlo con calma.',
    suavizar: 'Pega tu mensaje y lo bajo de intensidad sin quitarle verdad.',
    señal: 'Lo hacemos pequeño: una señal corta, suave y sin presión.',
    decidir: 'Pega el mensaje y vemos si conviene enviarlo, esperar o guardarlo.',
    carta: 'Dame la idea y la convertimos en una carta bonita.'
  };

  const placeholders = {
    libre: 'Escribe lo que sientes, una idea o algo que no sabes cómo decir...',
    suavizar: 'Pega el mensaje que quieres decir sin que suene a reclamo...',
    señal: 'Escribe lo que quieres expresar y lo volvemos una señal pequeña...',
    decidir: 'Pega el mensaje y vemos si conviene enviarlo, esperar o guardarlo...',
    carta: 'Escribe la idea de tu carta y la hacemos bonita...'
  };

  let abierto = false;
  let moviendose = false;
  let posicionActual = 'derecha';
  let modoUI = 'libre';

  function elegirRandom(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
  }

  function getSeccionActual() {
    const activa = document.querySelector('.page.active');
    if (!activa || !activa.id) return 'general';
    return activa.id.replace('page-', '');
  }

  function fraseContextual() {
    const seccion = getSeccionActual();
    return frasesPorSeccion[seccion] || 'Puedo ayudarte a escribir, decidir o suavizar algo.';
  }

  function crearWidget() {
    if (document.getElementById('sigy-widget')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'sigy-widget';

    wrapper.innerHTML = `
      <div id="sigy-globo" class="sigy-globo"></div>

      <button id="sigy-burbuja" title="Hablar con SIGy" type="button">
        <div class="sigy-carita feliz" id="sigy-carita">
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
            <div class="sigy-subtitle">
              Te ayudo a escribir, suavizar o decidir.
            </div>
          </div>
          <button id="sigy-cerrar" type="button">×</button>
        </div>

        <div class="sigy-ayudas">
          <button type="button" data-ui="suavizar">Sin reclamo</button>
          <button type="button" data-ui="señal">Señal</button>
          <button type="button" data-ui="decidir">¿Enviar?</button>
          <button type="button" data-ui="carta">Carta</button>
          <button type="button" data-ui="libre" class="active">Libre</button>
        </div>

        <textarea id="sigy-input" placeholder="${placeholders.libre}"></textarea>

        <div class="sigy-actions">
          <button id="sigy-enviar" type="button">Enviar</button>
          <button id="sigy-limpiar" type="button">Limpiar</button>
        </div>

        <div id="sigy-respuesta">
          <span>${fraseContextual()}</span>
        </div>
      </div>
    `;

    document.body.appendChild(wrapper);

    document.getElementById('sigy-burbuja').addEventListener('click', toggleSigy);
    document.getElementById('sigy-cerrar').addEventListener('click', cerrarSigy);
    document.getElementById('sigy-enviar').addEventListener('click', hablarConSigy);
    document.getElementById('sigy-limpiar').addEventListener('click', limpiarSigy);

    document.querySelectorAll('.sigy-ayudas button').forEach(btn => {
      btn.addEventListener('click', () => {
        cambiarModoUI(btn.dataset.ui);
        abrirSigy();
      });
    });

    mostrarGlobo(elegirRandom(saludosEntrada), 6500, 'feliz');

    // Mensajitos más lentos
    setInterval(() => {
      if (!abierto) {
        mostrarGlobo(elegirRandom(mensajitosIdle), 6000, elegirRandom(['feliz', 'pensando']));
      }
    }, 45000);

    // Movimiento suave menos frecuente
    setInterval(() => {
      if (!abierto) moverSigySuave();
    }, 30000);
  }

  function cambiarModoUI(nuevoModo) {
    modoUI = nuevoModo;

    document.querySelectorAll('.sigy-ayudas button').forEach(b => {
      b.classList.toggle('active', b.dataset.ui === nuevoModo);
    });

    const input = document.getElementById('sigy-input');
    const respuesta = document.getElementById('sigy-respuesta');

    if (input) input.placeholder = placeholders[nuevoModo] || placeholders.libre;

    if (respuesta) {
      respuesta.dataset.tocado = '';
      respuesta.innerHTML = `<span>${ayudasModo[nuevoModo] || ayudasModo.libre}</span>`;
    }
  }

  function abrirSigy() {
    abierto = true;

    const panel = document.getElementById('sigy-panel');
    const globo = document.getElementById('sigy-globo');

    if (panel) panel.classList.add('visible');
    if (globo) globo.classList.remove('visible');

    centrarSiEstaMuyPegado();
    setEstadoCarita('feliz');
  }

  function toggleSigy() {
    abierto = !abierto;
    abierto ? abrirSigy() : cerrarSigy();
  }

  function cerrarSigy() {
    abierto = false;

    const panel = document.getElementById('sigy-panel');
    if (panel) panel.classList.remove('visible');

    setEstadoCarita('');
  }

  function mostrarGlobo(texto, duracion = 5000, cara = 'feliz') {
    const globo = document.getElementById('sigy-globo');
    if (!globo || abierto) return;

    globo.textContent = texto;
    globo.classList.add('visible');
    setEstadoCarita(cara);

    setTimeout(() => {
      globo.classList.remove('visible');
      setEstadoCarita('');
    }, duracion);
  }

  function setEstadoCarita(estado) {
    const carita = document.getElementById('sigy-carita');
    if (!carita) return;

    carita.classList.remove('pensando', 'feliz', 'triste', 'dormido', 'sorpresa');

    if (estado) carita.classList.add(estado);
  }

  function moverSigySuave() {
    const widget = document.getElementById('sigy-widget');
    if (!widget || moviendose) return;

    moviendose = true;

    const posiciones = [
      { nombre: 'derecha', right: '22px', left: 'auto', bottom: '22px' },
      { nombre: 'centro', right: 'calc(50vw - 38px)', left: 'auto', bottom: '22px' },
      { nombre: 'izquierda', right: 'auto', left: '22px', bottom: '22px' }
    ];

    let nueva = elegirRandom(posiciones);

    if (nueva.nombre === posicionActual) {
      nueva = posiciones.find(p => p.nombre !== posicionActual) || nueva;
    }

    posicionActual = nueva.nombre;

    widget.style.right = nueva.right;
    widget.style.left = nueva.left;
    widget.style.bottom = nueva.bottom;

    setEstadoCarita('feliz');

    setTimeout(() => {
      moviendose = false;
      setEstadoCarita('');
    }, 1000);
  }

  function centrarSiEstaMuyPegado() {
    const widget = document.getElementById('sigy-widget');
    if (!widget) return;

    if (posicionActual === 'izquierda') {
      widget.style.left = 'auto';
      widget.style.right = '22px';
      posicionActual = 'derecha';
    }
  }

  async function hablarConSigy() {
    const input = document.getElementById('sigy-input');
    const respuestaDiv = document.getElementById('sigy-respuesta');

    const mensaje = input.value.trim();
    const modoBackend = modos[modoUI] || 'acompañar';

    if (!mensaje) {
      respuestaDiv.dataset.tocado = '1';
      respuestaDiv.innerHTML = '<span>Pega una frase, una carta o una idea. Yo te ayudo a ordenarla.</span>';
      setEstadoCarita('pensando');
      return;
    }

    respuestaDiv.dataset.tocado = '1';
    respuestaDiv.innerHTML = '<span>Estoy leyendo con cuidado...</span>';
    setEstadoCarita('pensando');

    try {
      const res = await fetch('/api/sigy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje,
          modo: modoBackend,
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
      respuestaDiv.innerHTML = '<span>Me trabé un poquito 😔. Intenta otra vez.</span>';
      setEstadoCarita('triste');
    }
  }

  function limpiarSigy() {
    const input = document.getElementById('sigy-input');
    const respuestaDiv = document.getElementById('sigy-respuesta');

    input.value = '';
    respuestaDiv.dataset.tocado = '';
    respuestaDiv.innerHTML = `<span>${fraseContextual()}</span>`;
    setEstadoCarita('feliz');

    setTimeout(() => setEstadoCarita(''), 1400);
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
