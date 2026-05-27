/* ======================================================
   SIGy Widget v5 ✨
   Más vivo, más fluido, menos teletransporte.
   Se mueve como mascotita, cambia caritas y saca corazones.
   Programar esto fue sufrir, pero con amor.
   ====================================================== */

(function () {
  const saludosEntrada = [
    'SIGyyyyy siiuuu ✨',
    'Qué bonito verte por aquí.',
    'Volviste. SIGA se siente más vivo.',
    'Hola, humano del código romántico.',
    'SIGy reportándose con ternura.',
    'Hoy podemos hacer algo pequeño y bonito.',
    'Entraste y SIGy hizo: siuuuu 💜'
  ];

  const mensajitosIdle = [
    'Puedo ayudarte a decirlo sin reclamo.',
    'Si algo pesa, lo bajamos a palabras más suaves.',
    'No todo tiene que enviarse. A veces primero se guarda.',
    'Puedo convertir una idea intensa en una señal pequeña.',
    'Si dudas, vemos si conviene enviar, esperar o guardar.',
    'Una carta también puede respirar antes de compartirse.',
    'Podemos cuidar el vínculo sin perseguirlo.',
    'SIGyyyyy modo ternura activado.',
    'Siuuu... pero con responsabilidad afectiva.',
    'Aquí ando patrullando el amor sin invadir.'
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
    senal: 'señal',
    decidir: 'decidir',
    carta: 'carta'
  };

  const ayudasModo = {
    libre: 'Cuéntame qué pasa y te ayudo a ordenarlo con calma.',
    suavizar: 'Pega tu mensaje y lo bajo de intensidad sin quitarle verdad.',
    senal: 'Lo hacemos pequeño: una señal corta, suave y sin presión.',
    decidir: 'Pega el mensaje y vemos si conviene enviarlo, esperar o guardarlo.',
    carta: 'Dame la idea y la convertimos en una carta bonita.'
  };

  const placeholders = {
    libre: 'Escribe lo que sientes, una idea o algo que no sabes cómo decir...',
    suavizar: 'Pega el mensaje que quieres decir sin que suene a reclamo...',
    senal: 'Escribe lo que quieres expresar y lo volvemos una señal pequeña...',
    decidir: 'Pega el mensaje y vemos si conviene enviarlo, esperar o guardarlo...',
    carta: 'Escribe la idea de tu carta y la hacemos bonita...'
  };

  let abierto = false;
  let modoUI = 'libre';

  let moviendose = false;
  let posX = null;
  let posY = null;
  let destinoX = null;
  let destinoY = null;
  let rafId = null;

  function elegirRandom(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
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
        <div class="sigy-corazon sigy-corazon-1">💜</div>
        <div class="sigy-corazon sigy-corazon-2">✨</div>

        <div class="sigy-carita feliz" id="sigy-carita">
          <div class="sigy-ojos">
            <span></span>
            <span></span>
          </div>
          <div class="sigy-mejillas"></div>
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
          <button type="button" data-ui="senal">Señal</button>
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

    inicializarPosicion();

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

    window.addEventListener('resize', mantenerEnPantalla);

    setTimeout(() => {
      mostrarGlobo(elegirRandom(saludosEntrada), 7000, 'enamorado');
      soltarCorazones();
    }, 800);

    // Mensajitos lentos para que no hostigue.
    setInterval(() => {
      if (!abierto) {
        const cara = elegirRandom(['feliz', 'pensando', 'enamorado', 'sorpresa']);
        mostrarGlobo(elegirRandom(mensajitosIdle), 7000, cara);

        if (cara === 'enamorado') {
          soltarCorazones();
        }
      }
    }, 52000);

    // Movimiento fluido. No teletransporte, ahora camina/desliza.
    setInterval(() => {
      if (!abierto) moverSigyFluido();
    }, 26000);
  }

  function inicializarPosicion() {
    const widget = document.getElementById('sigy-widget');
    if (!widget) return;

    posX = window.innerWidth - 104;
    posY = window.innerHeight - 112;

    aplicarPosicion();
  }

  function aplicarPosicion() {
    const widget = document.getElementById('sigy-widget');
    if (!widget) return;

    widget.style.left = `${posX}px`;
    widget.style.top = `${posY}px`;
    widget.style.right = 'auto';
    widget.style.bottom = 'auto';
  }

  function mantenerEnPantalla() {
    const maxX = window.innerWidth - 96;
    const maxY = window.innerHeight - 100;

    posX = clamp(posX ?? maxX, 12, maxX);
    posY = clamp(posY ?? maxY, 12, maxY);

    aplicarPosicion();
  }

  function moverSigyFluido() {
    if (moviendose) return;

    const maxX = window.innerWidth - 96;
    const maxY = window.innerHeight - 102;

    const zonas = [
      { x: maxX - 10, y: maxY },
      { x: 20, y: maxY },
      { x: window.innerWidth / 2 - 38, y: maxY },
      { x: maxX - 10, y: Math.max(110, maxY - 130) },
      { x: 20, y: Math.max(110, maxY - 130) }
    ];

    const elegido = elegirRandom(zonas);

    destinoX = clamp(elegido.x, 12, maxX);
    destinoY = clamp(elegido.y, 12, maxY);

    if (Math.abs(destinoX - posX) < 80 && Math.abs(destinoY - posY) < 80) {
      destinoX = posX > window.innerWidth / 2 ? 20 : maxX - 10;
      destinoY = maxY;
    }

    moviendose = true;
    setEstadoCarita('feliz');
    mostrarPisaditas();

    const inicioX = posX;
    const inicioY = posY;
    const dx = destinoX - inicioX;
    const dy = destinoY - inicioY;
    const duracion = 4200;
    const inicio = performance.now();

    function animar(t) {
      const p = clamp((t - inicio) / duracion, 0, 1);
      const ease = 1 - Math.pow(1 - p, 3);

      posX = inicioX + dx * ease;
      posY = inicioY + dy * ease + Math.sin(p * Math.PI * 8) * 4;

      aplicarPosicion();

      if (p < 1) {
        rafId = requestAnimationFrame(animar);
      } else {
        posX = destinoX;
        posY = destinoY;
        aplicarPosicion();
        moviendose = false;
        setEstadoCarita('');
      }
    }

    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(animar);
  }

  function mostrarPisaditas() {
    const widget = document.getElementById('sigy-widget');
    if (!widget) return;

    widget.classList.add('sigy-caminando');

    setTimeout(() => {
      widget.classList.remove('sigy-caminando');
    }, 4300);
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

    if (nuevoModo === 'carta' || nuevoModo === 'senal') {
      setEstadoCarita('enamorado');
      soltarCorazones();
    } else if (nuevoModo === 'decidir') {
      setEstadoCarita('pensando');
    } else {
      setEstadoCarita('feliz');
    }
  }

  function abrirSigy() {
    abierto = true;

    const panel = document.getElementById('sigy-panel');
    const globo = document.getElementById('sigy-globo');

    if (panel) panel.classList.add('visible');
    if (globo) globo.classList.remove('visible');

    // Si está muy a la izquierda, camina suave a la derecha para no tapar el panel.
    if (posX < window.innerWidth * 0.45) {
      posX = window.innerWidth - 104;
      posY = window.innerHeight - 112;
      aplicarPosicion();
    }

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

  function mostrarGlobo(texto, duracion = 6000, cara = 'feliz') {
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

    carita.classList.remove('pensando', 'feliz', 'triste', 'dormido', 'sorpresa', 'enamorado');

    if (estado) carita.classList.add(estado);
  }

  function soltarCorazones() {
    const widget = document.getElementById('sigy-widget');
    if (!widget) return;

    for (let i = 0; i < 7; i++) {
      const heart = document.createElement('div');
      heart.className = 'sigy-heart-pop';
      heart.textContent = elegirRandom(['💜', '💗', '✨', '💕']);
      heart.style.left = `${20 + Math.random() * 48}px`;
      heart.style.animationDelay = `${i * 0.12}s`;
      heart.style.setProperty('--sigy-heart-x', `${(Math.random() - 0.5) * 70}px`);

      widget.appendChild(heart);

      setTimeout(() => {
        heart.remove();
      }, 1900);
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
      setEstadoCarita(modoUI === 'carta' || modoUI === 'senal' ? 'enamorado' : 'feliz');

      if (modoUI === 'carta' || modoUI === 'senal') {
        soltarCorazones();
      }

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
