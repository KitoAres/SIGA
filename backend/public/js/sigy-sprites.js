/* ======================================================
   SIGy Sprites v4 ✨
   Más expresivo, acciones más largas y movimiento más suave.
   Programar esto fue sufrir, pero con amor.
   ====================================================== */

(function () {
  const SIGY_ASSETS = {
    idle: [
      '/img/sigy/idle/idle-1.png',
      '/img/sigy/idle/idle-2.png',
      '/img/sigy/idle/idle-3.png',
      '/img/sigy/idle/idle-4.png',
      '/img/sigy/idle/idle-5.png',
      '/img/sigy/idle/idle-6.png'
    ],

    float: [
      '/img/sigy/float/float-1.png',
      '/img/sigy/float/float-2.png',
      '/img/sigy/float/float-3.png',
      '/img/sigy/float/float-4.png',
      '/img/sigy/float/float-5.png',
      '/img/sigy/float/float-6.png',
      '/img/sigy/float/float-7.png',
      '/img/sigy/float/float-8.png'
    ],

    love: [
      '/img/sigy/love/love-1.png',
      '/img/sigy/love/love-2.png',
      '/img/sigy/love/love-3.png',
      '/img/sigy/love/love-4.png',
      '/img/sigy/love/love-5.png'
    ],

    actions: {
      idle: '/img/sigy/actions/idle-floating.png',
      moving: '/img/sigy/actions/moving.png',
      hello: '/img/sigy/actions/hello.png',
      hearts: '/img/sigy/actions/hearts.png',
      thinking: '/img/sigy/actions/thinking.png',
      reading: '/img/sigy/actions/reading-message.png',
      coffee: '/img/sigy/actions/coffee.png',
      blanket: '/img/sigy/actions/blanket.png',
      celebrating: '/img/sigy/actions/celebrating.png',
      accompanying: '/img/sigy/actions/accompanying.png'
    },

    expressions: {
      happy: '/img/sigy/expressions/happy.png',
      love: '/img/sigy/expressions/love.png',
      thinking: '/img/sigy/expressions/thinking.png',
      sad: '/img/sigy/expressions/sad.png',
      surprised: '/img/sigy/expressions/surprised.png',
      sleepy: '/img/sigy/expressions/sleepy.png',
      excited: '/img/sigy/expressions/excited.png',
      funny: '/img/sigy/expressions/funny.png'
    }
  };

  const DURACION = {
    cafe: 7600,
    manta: 7600,
    leer: 5200,
    pensar: 5200,
    amor: 5600,
    saludo: 4200,
    celebrar: 5600,
    tristeza: 5200,
    sorpresa: 4200,
    acompanamiento: 5600,
    escribir: 1800,
    mover: 1700
  };

  const state = {
    img: null,
    interval: null,
    timeout: null,
    ambientTimeout: null,
    movementTimeout: null,
    typingTimeout: null,

    lastTextSeen: '',
    lastAmbientKey: '',
    lastInteractionAt: Date.now(),

    lastLeft: null,
    lastTop: null,

    isPanelOpen: false,
    isMoving: false,
    currentMode: 'idle',

    // Mientras esto esté activo, ninguna microacción random interrumpe café/manta/etc.
    actionLockUntil: 0
  };

  function $(selector) {
    return document.querySelector(selector);
  }

  function refs() {
    return {
      widget: $('#sigy-widget'),
      bubble: $('#sigy-burbuja'),
      panel: $('#sigy-panel'),
      globo: $('#sigy-globo'),
      respuesta: $('#sigy-respuesta'),
      input: $('#sigy-input'),
      enviar: $('#sigy-enviar'),
      limpiar: $('#sigy-limpiar'),
      cerrar: $('#sigy-cerrar'),
      ayudas: document.querySelectorAll('.sigy-ayudas button'),
      carita: $('#sigy-carita')
    };
  }

  function elegirRandom(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
  }

  function randomEntre(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
  }

  function normalizarTexto(textoCrudo) {
    return String(textoCrudo || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function estaBloqueadoPorAccion() {
    return Date.now() < state.actionLockUntil;
  }

  function bloquearAcciones(ms) {
    state.actionLockUntil = Date.now() + ms;
  }

  function limpiarTemporizadoresPrincipales() {
    clearInterval(state.interval);
    clearTimeout(state.timeout);
  }

  function tocar() {
    state.lastInteractionAt = Date.now();
  }

  function instalarSprite() {
    const r = refs();

    if (!r.carita) {
      setTimeout(instalarSprite, 400);
      return;
    }

    r.carita.classList.add('sigy-sprite-box');
    r.carita.innerHTML = `
      <img
        id="sigySprite"
        class="sigy-sprite-img"
        src="${SIGY_ASSETS.idle[0]}"
        alt="SIGy"
        draggable="false"
      />
    `;

    state.img = $('#sigySprite');

    reproducirFrames('idle', 280);
    observarPanel();
    observarTextos();
    observarMovimiento();
    enlazarEventosUI();
    iniciarVidaIdle();

    // Saludo suave al cargar.
    setTimeout(() => {
      mostrarAccion(SIGY_ASSETS.actions.hello, 3000, true, true);
    }, 600);
  }

  function setImage(src) {
    if (!state.img || !src) return;
    state.img.src = src;
  }

  function reproducirFrames(tipo = 'idle', velocidad = 280, duracion = null, bloquear = false) {
    if (!state.img) return;

    const frames = SIGY_ASSETS[tipo];
    if (!frames || !Array.isArray(frames) || frames.length === 0) return;

    limpiarTemporizadoresPrincipales();

    if (bloquear && duracion) {
      bloquearAcciones(duracion);
    }

    state.currentMode = tipo;
    let frame = 0;
    setImage(frames[0]);

    state.interval = setInterval(() => {
      frame = (frame + 1) % frames.length;
      setImage(frames[frame]);
    }, velocidad);

    if (duracion) {
      state.timeout = setTimeout(() => {
        volverAEstadoNatural();
      }, duracion);
    }
  }

  function mostrarAccion(src, duracion = 3000, volver = true, bloquear = true) {
    if (!state.img || !src) return;

    limpiarTemporizadoresPrincipales();

    if (bloquear) {
      bloquearAcciones(duracion);
    }

    state.currentMode = 'action';
    setImage(src);

    if (volver) {
      state.timeout = setTimeout(() => {
        volverAEstadoNatural();
      }, duracion);
    }
  }

  function volverAEstadoNatural() {
    if (state.isMoving) {
      reproducirFrames('float', 190);
      return;
    }

    reproducirFrames('idle', 300);
  }

  function reaccionarPorTexto(textoCrudo) {
    if (!textoCrudo || !state.img) return;

    const texto = normalizarTexto(textoCrudo);

    if (!texto || texto === state.lastTextSeen) return;

    state.lastTextSeen = texto;
    tocar();

    // Café / tacita / chocolatito
    if (
      texto.includes('cafe') ||
      texto.includes('cafecito') ||
      texto.includes('tacita') ||
      texto.includes('chocolatito') ||
      texto.includes('te ofrezco un cafe') ||
      texto.includes('sigy te ofrece un cafe') ||
      texto.includes('cafe imaginario')
    ) {
      mostrarAccion(SIGY_ASSETS.actions.coffee, DURACION.cafe, true, true);
      return;
    }

    // Mantita / cobija / almohadita
    if (
      texto.includes('mantita') ||
      texto.includes('cobijita') ||
      texto.includes('frazadita') ||
      texto.includes('almohadita') ||
      texto.includes('mantita emocional') ||
      texto.includes('cobijita emocional') ||
      texto.includes('frazadita para el alma')
    ) {
      mostrarAccion(SIGY_ASSETS.actions.blanket, DURACION.manta, true, true);
      return;
    }

    // Leer / carta / mensaje
    if (
      texto.includes('carta') ||
      texto.includes('mensaje') ||
      texto.includes('leer') ||
      texto.includes('escribir') ||
      texto.includes('texto') ||
      texto.includes('respuesta')
    ) {
      mostrarAccion(SIGY_ASSETS.actions.reading, DURACION.leer, true, true);
      return;
    }

    // Pensar / decidir
    if (
      texto.includes('pensar') ||
      texto.includes('pensando') ||
      texto.includes('decidir') ||
      texto.includes('analizando') ||
      texto.includes('conviene') ||
      texto.includes('enviar') ||
      texto.includes('no mandes') ||
      texto.includes('primero respira')
    ) {
      mostrarAccion(SIGY_ASSETS.actions.thinking, DURACION.pensar, true, true);
      return;
    }

    // Amor / corazones / ternura
    if (
      texto.includes('amor') ||
      texto.includes('corazon') ||
      texto.includes('corazoncito') ||
      texto.includes('flores') ||
      texto.includes('romantico') ||
      texto.includes('ternura') ||
      texto.includes('te quiero') ||
      texto.includes('enamorado')
    ) {
      reproducirFrames('love', 230, DURACION.amor, true);
      return;
    }

    // Saludo / bienvenida
    if (
      texto.includes('hola') ||
      texto.includes('volviste') ||
      texto.includes('bienvenido') ||
      texto.includes('que bonito verte') ||
      texto.includes('verte por aqui')
    ) {
      mostrarAccion(SIGY_ASSETS.actions.hello, DURACION.saludo, true, true);
      return;
    }

    // Celebración / siuuu
    if (
      texto.includes('sigyyyy') ||
      texto.includes('siiuuu') ||
      texto.includes('siuuuu') ||
      texto.includes('celebrando') ||
      texto.includes('fiesta') ||
      texto.includes('deploy exitoso') ||
      texto.includes('200 ok')
    ) {
      mostrarAccion(SIGY_ASSETS.actions.celebrating, DURACION.celebrar, true, true);
      return;
    }

    // Tristeza / dolor
    if (
      texto.includes('triste') ||
      texto.includes('duele') ||
      texto.includes('llorar') ||
      texto.includes('pesado') ||
      texto.includes('mal') ||
      texto.includes('me trabe')
    ) {
      mostrarAccion(SIGY_ASSETS.expressions.sad, DURACION.tristeza, true, true);
      return;
    }

    // Sorpresa
    if (
      texto.includes('sorpresa') ||
      texto.includes('wow') ||
      texto.includes('wtf') ||
      texto.includes('no manches') ||
      texto.includes('el diablo')
    ) {
      mostrarAccion(SIGY_ASSETS.expressions.surprised, DURACION.sorpresa, true, true);
      return;
    }

    // Acompañamiento / calma
    if (
      texto.includes('acompanar') ||
      texto.includes('acompañar') ||
      texto.includes('a tu ritmo') ||
      texto.includes('sin presion') ||
      texto.includes('sin presión') ||
      texto.includes('calma') ||
      texto.includes('tranqui') ||
      texto.includes('no hace falta explicar')
    ) {
      mostrarAccion(SIGY_ASSETS.actions.accompanying, DURACION.acompanamiento, true, true);
      return;
    }
  }

  function observarTextos() {
    const r = refs();
    const objetivos = [r.globo, r.respuesta].filter(Boolean);

    if (!objetivos.length) return;

    objetivos.forEach((objetivo) => {
      const observer = new MutationObserver(() => {
        const texto = objetivo.innerText || objetivo.textContent || '';
        reaccionarPorTexto(texto);
      });

      observer.observe(objetivo, {
        childList: true,
        subtree: true,
        characterData: true
      });
    });
  }

  function observarPanel() {
    const r = refs();
    if (!r.panel) return;

    const observer = new MutationObserver(() => {
      const abierto = r.panel.classList.contains('visible');

      if (abierto !== state.isPanelOpen) {
        state.isPanelOpen = abierto;
        tocar();

        if (abierto) {
          mostrarAccion(SIGY_ASSETS.actions.hello, 3000, true, true);

          clearTimeout(state.timeout);
          state.timeout = setTimeout(() => {
            mostrarAccion(SIGY_ASSETS.actions.accompanying, 4200, true, true);
          }, 3100);
        } else {
          volverAEstadoNatural();
        }
      }
    });

    observer.observe(r.panel, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  function activarMovimientoTemporal() {
    tocar();

    if (estaBloqueadoPorAccion()) {
      return;
    }

    state.isMoving = true;

    clearTimeout(state.movementTimeout);

    mostrarAccion(SIGY_ASSETS.actions.moving, 240, false, false);

    setTimeout(() => {
      if (state.isMoving && !estaBloqueadoPorAccion()) {
        reproducirFrames('float', 180);
      }
    }, 230);

    state.movementTimeout = setTimeout(() => {
      state.isMoving = false;
      volverAEstadoNatural();
    }, DURACION.mover);
  }

  function observarMovimiento() {
    const r = refs();
    if (!r.widget) return;

    setInterval(() => {
      const left = r.widget.style.left || '';
      const top = r.widget.style.top || '';

      if (state.lastLeft === null && state.lastTop === null) {
        state.lastLeft = left;
        state.lastTop = top;
        return;
      }

      if (left !== state.lastLeft || top !== state.lastTop) {
        state.lastLeft = left;
        state.lastTop = top;
        activarMovimientoTemporal();
      }
    }, 140);
  }

  function enlazarEventosUI() {
    const r = refs();

    if (r.bubble) {
      r.bubble.addEventListener('click', () => {
        tocar();

        setTimeout(() => {
          if (refs().panel?.classList.contains('visible')) {
            mostrarAccion(SIGY_ASSETS.actions.hello, 3200, true, true);
          }
        }, 80);
      });
    }

    if (r.cerrar) {
      r.cerrar.addEventListener('click', () => {
        tocar();
        volverAEstadoNatural();
      });
    }

    if (r.limpiar) {
      r.limpiar.addEventListener('click', () => {
        tocar();
        mostrarAccion(SIGY_ASSETS.expressions.funny, 3200, true, true);
      });
    }

    if (r.enviar) {
      r.enviar.addEventListener('click', () => {
        tocar();

        mostrarAccion(SIGY_ASSETS.actions.reading, 2200, true, true);

        clearTimeout(state.timeout);
        state.timeout = setTimeout(() => {
          mostrarAccion(SIGY_ASSETS.actions.thinking, 3600, true, true);
        }, 2200);
      });
    }

    if (r.input) {
      r.input.addEventListener('input', () => {
        tocar();

        clearTimeout(state.typingTimeout);

        if (estaBloqueadoPorAccion()) {
          return;
        }

        const valor = r.input.value.trim();

        if (!valor) {
          state.typingTimeout = setTimeout(() => {
            volverAEstadoNatural();
          }, 600);
          return;
        }

        if (valor.includes('?') || valor.length > 120) {
          mostrarAccion(SIGY_ASSETS.actions.thinking, DURACION.escribir, true, false);
        } else {
          mostrarAccion(SIGY_ASSETS.actions.reading, DURACION.escribir, true, false);
        }
      });
    }

    if (r.ayudas && r.ayudas.length) {
      r.ayudas.forEach((btn) => {
        btn.addEventListener('click', () => {
          tocar();

          const modo = btn.dataset.ui || '';
          const texto = normalizarTexto(btn.innerText || '');

          if (modo === 'suavizar' || texto.includes('reclamo')) {
            mostrarAccion(SIGY_ASSETS.actions.thinking, 4200, true, true);
            return;
          }

          if (modo === 'senal' || texto.includes('senal') || texto.includes('señal')) {
            reproducirFrames('love', 230, DURACION.amor, true);
            return;
          }

          if (modo === 'decidir' || texto.includes('enviar')) {
            mostrarAccion(SIGY_ASSETS.actions.thinking, 4200, true, true);
            return;
          }

          if (modo === 'carta' || texto.includes('carta')) {
            mostrarAccion(SIGY_ASSETS.actions.reading, 4600, true, true);
            return;
          }

          if (modo === 'libre') {
            mostrarAccion(SIGY_ASSETS.actions.accompanying, 4600, true, true);
          }
        });
      });
    }

    document.addEventListener('click', (e) => {
      const txt = (e.target?.innerText || '').trim();
      if (txt) reaccionarPorTexto(txt);
    });
  }

  function hacerMicroAccionViva() {
    if (estaBloqueadoPorAccion()) {
      return;
    }

    const ahora = Date.now();
    const inactivoMucho = ahora - state.lastInteractionAt > 50000;

    const opciones = [
      { key: 'happy', run: () => mostrarAccion(SIGY_ASSETS.expressions.happy, 2600, true, false) },
      { key: 'funny', run: () => mostrarAccion(SIGY_ASSETS.expressions.funny, 2600, true, false) },
      { key: 'surprised', run: () => mostrarAccion(SIGY_ASSETS.expressions.surprised, 2300, true, false) },
      { key: 'accompanying', run: () => mostrarAccion(SIGY_ASSETS.actions.accompanying, 3000, true, false) },
      { key: 'hello', run: () => mostrarAccion(SIGY_ASSETS.actions.hello, 2600, true, false) },
      { key: 'reading', run: () => mostrarAccion(SIGY_ASSETS.actions.reading, 2600, true, false) },
      { key: 'thinking', run: () => mostrarAccion(SIGY_ASSETS.actions.thinking, 2700, true, false) },
      { key: 'love', run: () => reproducirFrames('love', 240, 3200, false) }
    ];

    if (inactivoMucho) {
      opciones.push({
        key: 'sleepy',
        run: () => mostrarAccion(SIGY_ASSETS.expressions.sleepy, 3600, true, false)
      });
    }

    let elegida = elegirRandom(opciones);

    let intentos = 0;
    while (elegida.key === state.lastAmbientKey && intentos < 8) {
      elegida = elegirRandom(opciones);
      intentos++;
    }

    state.lastAmbientKey = elegida.key;
    elegida.run();
  }

  function iniciarVidaIdle() {
    clearTimeout(state.ambientTimeout);

    function loop() {
      state.ambientTimeout = setTimeout(() => {
        if (!state.isMoving && !estaBloqueadoPorAccion()) {
          hacerMicroAccionViva();
        }

        loop();
      }, randomEntre(14000, 26000));
    }

    loop();
  }

  window.SIGySprites = {
    idle() {
      reproducirFrames('idle', 300);
    },

    float() {
      reproducirFrames('float', 190);
    },

    love() {
      reproducirFrames('love', 230, DURACION.amor, true);
    },

    hello() {
      mostrarAccion(SIGY_ASSETS.actions.hello, DURACION.saludo, true, true);
    },

    thinking() {
      mostrarAccion(SIGY_ASSETS.actions.thinking, DURACION.pensar, true, true);
    },

    reading() {
      mostrarAccion(SIGY_ASSETS.actions.reading, DURACION.leer, true, true);
    },

    coffee() {
      mostrarAccion(SIGY_ASSETS.actions.coffee, DURACION.cafe, true, true);
    },

    blanket() {
      mostrarAccion(SIGY_ASSETS.actions.blanket, DURACION.manta, true, true);
    },

    celebrating() {
      mostrarAccion(SIGY_ASSETS.actions.celebrating, DURACION.celebrar, true, true);
    },

    accompany() {
      mostrarAccion(SIGY_ASSETS.actions.accompanying, DURACION.acompanamiento, true, true);
    },

    expression(nombre) {
      const src = SIGY_ASSETS.expressions[nombre];
      if (src) mostrarAccion(src, 4200, true, true);
    }
  };

  document.addEventListener('DOMContentLoaded', instalarSprite);
})();
