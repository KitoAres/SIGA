/* ======================================================
   SIGy Sprites v1 ✨
   Cambia la carita CSS por imágenes reales de SIGy.
   HAcer las imagenes fue sufrir, pero con amor.
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
  let animacionActual = 'idle';
  let intervaloAnimacion = null;
  let timeoutAccion = null;

  function buscarContenedorSigy() {
    return (
      document.querySelector('.sigy-mascota') ||
      document.querySelector('.sigy-carita') ||
      document.querySelector('.sigy-avatar') ||
      document.querySelector('#sigy-mascota') ||
      document.querySelector('#sigy-avatar')
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
    prepararEventosRapidos();
  }

  function iniciarAnimacion(tipo = 'idle', velocidad = 280) {
    if (!sigyImg) return;

    const frames = SIGY_ASSETS[tipo];

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return;
    }

    animacionActual = tipo;
    frameActual = 0;

    clearInterval(intervaloAnimacion);

    sigyImg.src = frames[0];

    intervaloAnimacion = setInterval(() => {
      frameActual = (frameActual + 1) % frames.length;
      sigyImg.src = frames[frameActual];
    }, velocidad);
  }

  function mostrarImagenTemporal(src, tiempo = 2500) {
    if (!sigyImg || !src) return;

    clearInterval(intervaloAnimacion);
    clearTimeout(timeoutAccion);

    sigyImg.src = src;

    timeoutAccion = setTimeout(() => {
      iniciarAnimacion('idle', 280);
    }, tiempo);
  }

  function prepararEventosRapidos() {
    document.addEventListener('click', (evento) => {
      const texto = (evento.target?.innerText || '').toLowerCase();

      if (texto.includes('café') || texto.includes('cafe')) {
        mostrarImagenTemporal(SIGY_ASSETS.actions.coffee, 3200);
        return;
      }

      if (texto.includes('mantita')) {
        mostrarImagenTemporal(SIGY_ASSETS.actions.blanket, 3200);
        return;
      }

      if (texto.includes('señal') || texto.includes('corazón') || texto.includes('corazon')) {
        iniciarAnimacion('love', 220);

        clearTimeout(timeoutAccion);
        timeoutAccion = setTimeout(() => {
          iniciarAnimacion('idle', 280);
        }, 3500);

        return;
      }

      if (texto.includes('pensar') || texto.includes('decidir') || texto.includes('enviar')) {
        mostrarImagenTemporal(SIGY_ASSETS.actions.thinking, 2800);
        return;
      }

      if (texto.includes('hola') || texto.includes('sigy')) {
        mostrarImagenTemporal(SIGY_ASSETS.actions.hello, 2500);
      }
    });
  }

  window.SIGySprites = {
    idle() {
      iniciarAnimacion('idle', 280);
    },

    float() {
      iniciarAnimacion('float', 220);
    },

    love() {
      iniciarAnimacion('love', 220);
    },

    hello() {
      mostrarImagenTemporal(SIGY_ASSETS.actions.hello, 2500);
    },

    thinking() {
      mostrarImagenTemporal(SIGY_ASSETS.actions.thinking, 2800);
    },

    coffee() {
      mostrarImagenTemporal(SIGY_ASSETS.actions.coffee, 3200);
    },

    blanket() {
      mostrarImagenTemporal(SIGY_ASSETS.actions.blanket, 3200);
    },

    celebrating() {
      mostrarImagenTemporal(SIGY_ASSETS.actions.celebrating, 2800);
    },

    expression(nombre) {
      const src = SIGY_ASSETS.expressions[nombre];
      mostrarImagenTemporal(src, 2800);
    }
  };

  document.addEventListener('DOMContentLoaded', instalarSprite);
})();
