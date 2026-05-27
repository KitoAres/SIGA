/* ======================================================
   SIGy Sprites v3 ✨
   Ahora sí: más vivo, más expresivo y menos patrón repetitivo.
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
    currentMode: 'idle'
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
  }

  function setImage(src) {
    if (!state.img || !src) return;
    state.img.src = src;
  }

  function reproducirFrames(tipo = 'idle', velocidad = 280, duracion = null) {
    if (!state.img) return;

    const frames = SIGY_ASSETS[tipo];
    if (!frames || !Array.isArray(frames) || frames.length === 0) return;

    limpiarTemporizadoresPrincipales();

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

  function mostrarAccion(src, duracion = 2600, volver = true) {
    if (!state.img || !src) return;

    limpiarTemporizadoresPrincipales();
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
      reproducirFrames('float', 180);
      return;
    }

    if (state.isPanelOpen) {
      reproducirFrames('idle', 280);
      return;
    }

    reproducirFrames('idle', 280);
  }

  function reaccionarPorTexto(textoCrudo) {
    if (!textoCrudo || !state.img) return;

    const texto = String(textoCrudo)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    if (!texto || texto === state.lastTextSeen) return;
    state.lastTextSeen = texto;

    tocar();

    // café
    if (
      texto.includes('cafe') ||
      texto.includes('cafecito') ||
      texto.includes('tacita') ||
      texto.includes('chocolatito') ||
      texto.includes('te imagina') ||
      texto.includes('te ofrezco un cafe')
    ) {
      mostrarAccion(SIGY_ASSETS.actions.coffee, 3400);
      return;
    }

    // mantita / cobija
    if (
      texto.includes('mantita') ||
      texto.includes('cobijita') ||
      texto.includes('frazadita') ||
      texto.includes('almohadita') ||
      texto.includes('cobijita emocional')
    ) {
      mostrarAccion(SIGY_ASSETS.actions.blanket, 3400);
      return;
    }

    // leer / carta / mensaje
    if (
      texto.includes('carta') ||
      texto.includes('mensaje') ||
      texto.includes('leer') ||
      texto.includes('escribir') ||
      texto.includes('texto') ||
      texto.includes('respuesta')
    ) {
      mostrarAccion(SIGY_ASSETS.actions.reading, 3000);
      return;
    }

    // pensar / decidir
    if (
      texto.includes('pensar') ||
      texto.includes('pensando') ||
      texto.includes('decidir') ||
      texto.includes('analizando') ||
      texto.includes('conviene') ||
      texto.includes('enviar') ||
      texto.includes('no mandes')
    ) {
      mostrarAccion(SIGY_ASSETS.actions.thinking, 3000);
      return;
    }

    // amor / corazones / ternura
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
      reproducirFrames('love', 220, 3600);
      return;
    }

    // saludo / bienvenida
    if (
      texto.includes('hola') ||
      texto.includes('volviste') ||
      texto.includes('bienvenido') ||
      texto.includes('que bonito verte') ||
      texto.includes('verte por aqui')
    ) {
      mostrarAccion(SIGY_ASSETS.actions.hello, 2500);
      return;
    }

    // celebrar / siuuu
    if (
      texto.includes('sigyyyy') ||
      texto.includes('siiuuu') ||
      texto.includes('siuuuu') ||
      texto.includes('celebrando') ||
      texto.includes('fiesta') ||
      texto.includes('agueevo') ||
      texto.includes('deploy exitoso')
    ) {
      mostrarAccion(SIGY_ASSETS.actions.celebrating, 2900);
      return;
    }

    // tristeza / dolor
    if (
      texto.includes('triste') ||
      texto.includes('duele') ||
      texto.includes('llorar') ||
      texto.includes('pesado') ||
      texto.includes('me trabe') ||
      texto.includes('mal')
    ) {
      mostrarAccion(SIGY_ASSETS.expressions.sad, 2800);
      return;
    }

    // sorpresa
    if (
      texto.includes('sorpresa') ||
      texto.includes('wow') ||
      texto.includes('wtf') ||
      texto.includes('no manches')
    ) {
      mostrarAccion(SIGY_ASSETS.expressions.surprised, 2400);
      return;
    }

    // acompañamiento / calma
    if (
      texto.includes('acompanar') ||
      texto.includes('acompañar') ||
      texto.includes('a tu ritmo') ||
      texto.includes('sin presion') ||
      texto.includes('sin presión') ||
      texto.includes('calma') ||
      texto.includes('tranqui')
    ) {
      mostrarAccion(SIGY_ASSETS.actions.accompanying, 2800);
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
          mostrarAccion(SIGY_ASSETS.actions.hello, 1600);

          clearTimeout(state.timeout);
          state.timeout = setTimeout(() => {
            mostrarAccion(SIGY_ASSETS.actions.accompanying, 2300);
          }, 1700);
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
    state.isMoving = true;

    clearTimeout(state.movementTimeout);

    // pequeño arranque con pose de avanzar
    mostrarAccion(SIGY_ASSETS.actions.moving, 180, false);

    setTimeout(() => {
      if (state.isMoving) {
        reproducirFrames('float', 170);
      }
    }, 170);

    state.movementTimeout = setTimeout(() => {
      state.isMoving = false;
      volverAEstadoNatural();
    }, 1000);
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
    }, 120);
  }

  function enlazarEventosUI() {
    const r = refs();

    if (r.bubble) {
      r.bubble.addEventListener('click', () => {
        tocar();
        setTimeout(() => {
          if (refs().panel?.classList.contains('visible')) {
            mostrarAccion(SIGY_ASSETS.actions.hello, 2200);
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
        mostrarAccion(SIGY_ASSETS.expressions.funny, 2200);
      });
    }

    if (r.enviar) {
      r.enviar.addEventListener('click', () => {
        tocar();
        mostrarAccion(SIGY_ASSETS.actions.reading, 1200);

        clearTimeout(state.timeout);
        state.timeout = setTimeout(() => {
          mostrarAccion(SIGY_ASSETS.actions.thinking, 2200);
        }, 1200);
      });
    }

    if (r.input) {
      r.input.addEventListener('input', () => {
        tocar();

        clearTimeout(state.typingTimeout);

        const valor = r.input.value.trim();

        if (!valor) {
          state.typingTimeout = setTimeout(() => {
            volverAEstadoNatural();
          }, 500);
          return;
        }

        if (valor.includes('?') || valor.length > 120) {
          mostrarAccion(SIGY_ASSETS.actions.thinking, 1200);
        } else {
          mostrarAccion(SIGY_ASSETS.actions.reading, 1200);
        }
      });
    }

    if (r.ayudas && r.ayudas.length) {
      r.ayudas.forEach((btn) => {
        btn.addEventListener('click', () => {
          tocar();

          const modo = btn.dataset.ui || '';

          if (modo === 'suavizar') {
            mostrarAccion(SIGY_ASSETS.actions.thinking, 2400);
            return;
          }

          if (modo === 'senal') {
            reproducirFrames('love', 220, 3200);
            return;
          }

          if (modo === 'decidir') {
            mostrarAccion(SIGY_ASSETS.actions.thinking, 2400);
            return;
          }

          if (modo === 'carta') {
            mostrarAccion(SIGY_ASSETS.actions.reading, 2600);
            return;
          }

          if (modo === 'libre') {
            mostrarAccion(SIGY_ASSETS.actions.accompanying, 2400);
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
    const ahora = Date.now();
    const inactivoMucho = ahora - state.lastInteractionAt > 45000;

    const opciones = [
      { key: 'happy', run: () => mostrarAccion(SIGY_ASSETS.expressions.happy, 1900) },
      { key: 'funny', run: () => mostrarAccion(SIGY_ASSETS.expressions.funny, 1900) },
      { key: 'surprised', run: () => mostrarAccion(SIGY_ASSETS.expressions.surprised, 1800) },
      { key: 'accompanying', run: () => mostrarAccion(SIGY_ASSETS.actions.accompanying, 2200) },
      { key: 'hello', run: () => mostrarAccion(SIGY_ASSETS.actions.hello, 1800) },
      { key: 'reading', run: () => mostrarAccion(SIGY_ASSETS.actions.reading, 1800) },
      { key: 'thinking', run: () => mostrarAccion(SIGY_ASSETS.actions.thinking, 1900) },
      { key: 'love', run: () => reproducirFrames('love', 220, 2600) }
    ];

    if (inactivoMucho) {
      opciones.push({
        key: 'sleepy',
        run: () => mostrarAccion(SIGY_ASSETS.expressions.sleepy, 2600)
      });
    }

    let elegida = elegirRandom(opciones);

    // evitar repetir lo mismo seguido
    let intentos = 0;
    while (elegida.key === state.lastAmbientKey && intentos < 6) {
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
        // si está moviéndose, lo dejamos en paz
        if (!state.isMoving) {
          hacerMicroAccionViva();
        }

        loop();
      }, randomEntre(9000, 17000));
    }

    loop();
  }

  window.SIGySprites = {
    idle() {
      reproducirFrames('idle', 280);
    },

    float() {
      reproducirFrames('float', 180);
    },

    love() {
      reproducirFrames('love', 220, 3200);
    },

    hello() {
      mostrarAccion(SIGY_ASSETS.actions.hello, 2500);
    },

    thinking() {
      mostrarAccion(SIGY_ASSETS.actions.thinking, 2600);
    },

    reading() {
      mostrarAccion(SIGY_ASSETS.actions.reading, 2600);
    },

    coffee() {
      mostrarAccion(SIGY_ASSETS.actions.coffee, 3400);
    },

    blanket() {
      mostrarAccion(SIGY_ASSETS.actions.blanket, 3400);
    },

    celebrating() {
      mostrarAccion(SIGY_ASSETS.actions.celebrating, 2800);
    },

    accompany() {
      mostrarAccion(SIGY_ASSETS.actions.accompanying, 2600);
    },

    expression(nombre) {
      const src = SIGY_ASSETS.expressions[nombre];
      if (src) mostrarAccion(src, 2600);
    }
  };

  document.addEventListener('DOMContentLoaded', instalarSprite);
})();
