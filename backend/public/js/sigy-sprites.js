/* ======================================================
   SIGy Sprites v2 ✨
   Ahora SIGy reacciona a mensajes, botones y movimiento.
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

  let sigyImg = null;
  let frameActual = 0;
  let intervaloAnimacion = null;
  let timeoutAccion = null;
  let ultimoTextoDetectado = '';
  let timeoutMovimiento = null;

  function buscarContenedorSigy() {
    return (
      document.querySelector('.sigy-mascota') ||
      document.querySelector('.sigy-carita') ||
      document.querySelector('.sigy-avatar') ||
      document.querySelector('#sigy-mascota') ||
      document.querySelector('#sigy-avatar')
    );
  }

  function buscarRootSigy(contenedor) {
    if (!contenedor) return null;

    return (
      contenedor.closest('.sigy-widget') ||
      contenedor.closest('.sigy-root') ||
      contenedor.closest('.sigy-float') ||
      contenedor.closest('[class*="sigy"]') ||
      contenedor.parentElement
    );
  }

  function instalarSprite() {
    const contenedor = buscarContenedorSigy();

    if (!contenedor) {
      setTimeout(instalarSprite, 500);
      return;
    }

    contenedor.classList.add('sigy-sprite-box');

    contenedor.innerHTML = `
      <img
        id="sigySprite"
        class="sigy-sprite-img"
        src="${SIGY_ASSETS.idle[0]}"
        alt="SIGy"
        draggable="false"
      />
    `;

    sigyImg = document.getElementById('sigySprite');

    iniciarAnimacion('idle', 280);
    observarTextos();
    observarMovimiento(buscarRootSigy(contenedor));
    prepararEventosRapidos();
  }

  function iniciarAnimacion(tipo = 'idle', velocidad = 280) {
    if (!sigyImg) return;

    const frames = SIGY_ASSETS[tipo];

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return;
    }

    clearInterval(intervaloAnimacion);
    clearTimeout(timeoutAccion);

    frameActual = 0;
    sigyImg.src = frames[0];

    intervaloAnimacion = setInterval(() => {
      frameActual = (frameActual + 1) % frames.length;
      sigyImg.src = frames[frameActual];
    }, velocidad);
  }

  function mostrarImagenTemporal(src, tiempo = 2800) {
    if (!sigyImg || !src) return;

    clearInterval(intervaloAnimacion);
    clearTimeout(timeoutAccion);

    sigyImg.src = src;

    timeoutAccion = setTimeout(() => {
      iniciarAnimacion('idle', 280);
    }, tiempo);
  }

  function reaccionarAlTexto(textoCrudo) {
    if (!textoCrudo || !sigyImg) return;

    const texto = textoCrudo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (texto === ultimoTextoDetectado) return;
    ultimoTextoDetectado = texto;

    if (
      texto.includes('cafe') ||
      texto.includes('cafecito') ||
      texto.includes('tacita')
    ) {
      mostrarImagenTemporal(SIGY_ASSETS.actions.coffee, 3400);
      return;
    }

    if (
      texto.includes('mantita') ||
      texto.includes('cobijita') ||
      texto.includes('frazadita') ||
      texto.includes('almohadita')
    ) {
      mostrarImagenTemporal(SIGY_ASSETS.actions.blanket, 3400);
      return;
    }

    if (
      texto.includes('corazon') ||
      texto.includes('corazoncito') ||
      texto.includes('amor') ||
      texto.includes('enamorado') ||
      texto.includes('flores')
    ) {
      iniciarAnimacion('love', 220);

      clearTimeout(timeoutAccion);
      timeoutAccion = setTimeout(() => {
        iniciarAnimacion('idle', 280);
      }, 3600);

      return;
    }

    if (
      texto.includes('pensando') ||
      texto.includes('pensar') ||
      texto.includes('decidir') ||
      texto.includes('analizando') ||
      texto.includes('enviar') ||
      texto.includes('no mandes')
    ) {
      mostrarImagenTemporal(SIGY_ASSETS.actions.thinking, 3200);
      return;
    }

    if (
      texto.includes('mensaje') ||
      texto.includes('carta') ||
      texto.includes('leer') ||
      texto.includes('escribir')
    ) {
      mostrarImagenTemporal(SIGY_ASSETS.actions.reading, 3200);
      return;
    }

    if (
      texto.includes('sigyyyy') ||
      texto.includes('siiuuu') ||
      texto.includes('siuuuu') ||
      texto.includes('celebrando')
    ) {
      mostrarImagenTemporal(SIGY_ASSETS.actions.celebrating, 3000);
      return;
    }

    if (
      texto.includes('hola') ||
      texto.includes('bienvenido') ||
      texto.includes('volviste') ||
      texto.includes('verte por aqui')
    ) {
      mostrarImagenTemporal(SIGY_ASSETS.actions.hello, 2600);
      return;
    }

    if (
      texto.includes('triste') ||
      texto.includes('llorar') ||
      texto.includes('duele') ||
      texto.includes('pesado')
    ) {
      mostrarImagenTemporal(SIGY_ASSETS.expressions.sad, 3000);
      return;
    }

    if (
      texto.includes('acompañar') ||
      texto.includes('acompanar') ||
      texto.includes('a tu ritmo') ||
      texto.includes('sin presion') ||
      texto.includes('calma')
    ) {
      mostrarImagenTemporal(SIGY_ASSETS.actions.accompanying, 3000);
    }
  }

  function observarTextos() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          const texto = document.body.innerText || '';
          const ultimosCaracteres = texto.slice(-1200);
          reaccionarAlTexto(ultimosCaracteres);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  function observarMovimiento(root) {
    if (!root) return;

    const observer = new MutationObserver(() => {
      iniciarAnimacion('float', 180);

      clearTimeout(timeoutMovimiento);
      timeoutMovimiento = setTimeout(() => {
        iniciarAnimacion('idle', 280);
      }, 900);
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }

  function prepararEventosRapidos() {
    document.addEventListener('click', (evento) => {
      const texto = (evento.target?.innerText || '').toLowerCase();
      reaccionarAlTexto(texto);
    });

    document.addEventListener('input', (evento) => {
      const valor = evento.target?.value || '';
      reaccionarAlTexto(valor);
    });
  }

  window.SIGySprites = {
    idle() {
      iniciarAnimacion('idle', 280);
    },

    float() {
      iniciarAnimacion('float', 180);
    },

    love() {
      iniciarAnimacion('love', 220);
    },

    hello() {
      mostrarImagenTemporal(SIGY_ASSETS.actions.hello, 2600);
    },

    thinking() {
      mostrarImagenTemporal(SIGY_ASSETS.actions.thinking, 3200);
    },

    coffee() {
      mostrarImagenTemporal(SIGY_ASSETS.actions.coffee, 3400);
    },

    blanket() {
      mostrarImagenTemporal(SIGY_ASSETS.actions.blanket, 3400);
    },

    reading() {
      mostrarImagenTemporal(SIGY_ASSETS.actions.reading, 3200);
    },

    celebrating() {
      mostrarImagenTemporal(SIGY_ASSETS.actions.celebrating, 3000);
    },

    expression(nombre) {
      const src = SIGY_ASSETS.expressions[nombre];
      mostrarImagenTemporal(src, 3000);
    }
  };

  document.addEventListener('DOMContentLoaded', instalarSprite);
})();
