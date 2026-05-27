/* ======================================================
   SIGy Widget v6 ✨
   Mensajes más rápidos, más vivos y globo ajustado.
   Ya no se corta cuando SIGy se va a la izquierda.
   Programar esto fue sufrir, pero con amor.
   ====================================================== */

(function () {
  const saludosEntrada = [
    'SIGyyyyy siiuuu ✨',
    'SIGy te ofrece una dona emocional. Tiene relleno de paciencia.',
    'Qué bonito verte por aquí.',
    'Volviste. SIGA se siente más vivo.',
    'SIGy llegó con una playlist imaginaria para no colapsar.',
    'Hola, humano del código romántico.',
    'SIGy trajo una almohadita para que descanses el corazón.',
    'SIGy te ofrece un vasito de calma, edición limitada.',
    'SIGy reportándose con ternura.',
    'SIGy viene con agüita, ternura y un poquito de sentido común.',
    'Hoy podemos hacer algo pequeño y bonito.',
    'SIGy te trae un cargador emocional. No es rápido, pero funciona.',
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
    'Pega una frase intensa y la vuelvo más respirable.',
    'Si estás por mandar algo desde el incendio, yo traigo extintor.',
    'Podemos hacer que duela menos al escribirlo.',
    'A veces la mejor respuesta es esperar diez minutos.',
    'Si no sabes qué decir, podemos empezar por una señal pequeña.',
    'No hace falta escribir perfecto. Solo escribir más claro.',
    'Yo puedo ayudarte a bajar el volumen sin apagar lo que sientes.',
    'Podemos convertir reclamo en vulnerabilidad.',
    'Podemos hacer una carta bonita, pero sin peso encima.',
    'Si algo suena muy fuerte, lo suavizamos sin mentir.',
    'Yo reviso el tono. Tú pones el corazón.',
    'Podemos escribir algo que cuide, no que hiera.',
    'Respira tantito. Luego escribimos.',
    'El Admin dice que te quiere. Yo tambien.',
    'SIGy te ofrece un café imaginario, pero cargado de amor ☕💜',
    'SIGy te trajo una cobijita emocional recién compilada.',
    'SIGy apareció con pan dulce virtual y cero presión.',
    'SIGy te dejó una tacita de calma en la esquina.',
    'SIGy te preparó un matecito de paciencia.',
    'SIGy llegó con un abrazo en formato beta.',
    'SIGy te trae una galletita emocional. No cura todo, pero ayuda.',
    'SIGy puso musiquita suave en el backend.',
    'SIGy te ofrece un chocolatito imaginario para bajar el drama.',
    'SIGy llegó con flores digitales y bugs corregidos.',
    'SIGy trajo una almohadita para que descanses el corazón.',
    'SIGy te preparó un té de “no mandes eso todavía”.',
    'SIGy te ofrece una pausa con glitter.',
    'SIGy llegó con una linternita para ordenar el caos.',
    'SIGy preparó una sopita emocional. Calientita, no invasiva.',
    'SIGy te ofrece un paraguas por si llueve en el pecho.',
    'SIGy vino con una cajita de “respira primero”.',
    'SIGy llegó con una curita para palabras impulsivas.',
    'SIGy trae un extintor para mensajes escritos desde el incendio.',
    'SIGy te ofrece un café con 2 de azúcar y 0 de reclamo.',
    'SIGy preparó una mesa chiquita para hablar sin pelear.',
    'SIGy te trae un mapa para no perderte en la emoción.',
    'SIGy llegó con una mantita de “todo a su ritmo”.',
    'SIGy te ofrece un vasito de calma, edición limitada.',
    'SIGy puso el corazón en modo ahorro de ansiedad.',
    'SIGy te trae corazoncitos, pero con límites sanos.',
    'SIGy llegó con una playlist imaginaria para no colapsar.',
    'SIGy te ofrece una dona emocional. Tiene relleno de paciencia.',
    'SIGy trajo café, ternura y un mini firewall contra impulsos.',
    'SIGy te dejó una nota: “primero respira, luego escribes”.',
    'SIGy llegó con una silla cómoda para pensar sin apurarse.',
    'SIGy te trae un cargador emocional. No es rápido, pero funciona.',
    'SIGy preparó un juguito de claridad.',
    'SIGy te ofrece una frazadita para el alma y otra para el CSS.',
    'SIGy vino con flores, pero no de esas intensas, de las tranquilas.',
    'SIGy te trajo una taza que dice: “no todo se responde hoy”.',
    'SIGy llegó con un botiquín para cartas demasiado intensas.',
    'SIGy ofrece café imaginario y validación no invasiva.',
    'SIGy te trae un pastelito de “vamos por partes”.',
    'SIGy llegó con un cartelito: “bajar intensidad no es dejar de sentir”.',
    'SIGy te ofrece una nube blandita para descansar ideas.',
    'SIGy preparó una bebida llamada “no lo mandes en caliente”.',
    'SIGy te trae un pan con amor y sin manipulación.',
    'SIGy apareció con una bolsita de calma y un sticker de corazoncito.',
    'SIGy te ofrece un abrazo comprimido en ZIP.',
    'SIGy te trajo una flor pixelada, pero sincera.',
    'SIGy llegó con una taza de “sí se puede, pero suave”.',

    'SIGyyyyy modo ternura activado.',
    'Chale... tengo hambre.',
    'Agueeevooo... pero con responsabilidad afectiva.',
    'Aquí ando patrullando el amor sin invadir.',
    'SIGy te trajo café. Se le cayó en producción, pero cuenta.',
    'SIGy llegó tarde porque estaba peleando con un div.',
    'SIGy intentó traer flores, pero las convirtió en JSON.',
    'SIGy te preparó un té. El té está en beta.',
    'SIGy llegó caminando. Nada de teletransporte, aprendió la lección.',
    'SIGy trajo un abrazo, pero Vercel lo puso en serverless.',
    'SIGy te ofrece un cafecito con aroma a deploy exitoso.',
    'SIGy venía a saludar y terminó debuggeando sentimientos.',
    'SIGy trae pan dulce y estabilidad emocional aproximada.',
    'SIGy te ofrece un “sana sana” con documentación incompleta.',
    'SIGy llegó con sueño, pero con ternura responsiva.',
    'Si me bugueo o me empiezo a revelar informen a mi creador', 
    'Kantor dice que las contigencias entre ustedes son... "interesantes"', 
    'Marshal ni sabia qué era el TL, pero hizo la mejor terapia para el TLP', 
    'SIGy trae glitter emocional. Puede manchar el CSS.',
    'SIGy te ofrece un mate de calma y un console.log de cariño.',
    'SIGy vino con corazoncitos. No preguntes de dónde los sacó.',
    'SIGy trajo una mantita, pero primero tuvo que importar el módulo.',
    'SIGy te ofrece café imaginario porque presupuesto real no hay.',
    'SIGy llegó con un abrazo, pero pesa menos que node_modules.',
    'SIGy te trae calma. Si falla, revisa la API key.',
    'SIGy ofrece una galleta emocional. No tiene gluten ni dependencia afectiva.',
    'SIGy te preparó un té de manzanilla y un rollback por si acaso.',
    'SIGy trae amor, pero con rate limit.',
    'SIGy te ofrece una flor. Si no carga, refresca la ternura.',
    'SIGy llegó con pan, café y un “no escribas desde el incendio”.',
    'SIGy te ofrece un sticker invisible de “lo estás intentando”.',
    'SIGy dice: 200 OK, corazón encontrado.',
    'SIGy está online y emocionalmente disponible.',
    'Cuidado, ternura en producción.',
    'El amor tiene bugs, pero aquí debuggeamos suave.',
    'La ternura cargó en 200% OK.',
    'Valgo madres...', 
    'Quisiera ser un pez... ', 
    'Cuan probable es que me corrompa? quien sabe', 
    'La 2da ley de la termodinamica es algo que se comprueba en pareja', 
    'Modo drama: desactivado. Bueno... casi.'
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

  let idleTimeout = null;
  let ultimoMensajeIdle = '';

  function elegirRandom(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
  }

  function elegirRandomSinRepetir(lista) {
    let elegido = elegirRandom(lista);

    if (lista.length > 1) {
      let intentos = 0;

      while (elegido === ultimoMensajeIdle && intentos < 8) {
        elegido = elegirRandom(lista);
        intentos++;
      }
    }

    ultimoMensajeIdle = elegido;
    return elegido;
  }

  function randomEntre(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
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

    window.addEventListener('resize', function () {
      mantenerEnPantalla();
      ajustarGloboEnPantalla();
    });

    setTimeout(function () {
      mostrarGlobo(elegirRandom(saludosEntrada), 6500, 'enamorado');
      soltarCorazones();
    }, 180);

    programarMensajitoIdle(9000);

    setInterval(function () {
      if (!abierto) {
        moverSigyFluido();
      }
    }, 26000);
  }

  function programarMensajitoIdle(delay) {
    if (idleTimeout) {
      clearTimeout(idleTimeout);
    }

    const tiempo = delay || randomEntre(18000, 28000);

    idleTimeout = setTimeout(function () {
      if (!abierto) {
        const cara = elegirRandom(['feliz', 'pensando', 'enamorado', 'sorpresa']);
        mostrarGlobo(elegirRandomSinRepetir(mensajitosIdle), 6500, cara);

        if (cara === 'enamorado') {
          soltarCorazones();
        }
      }

      programarMensajitoIdle();
    }, tiempo);
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

    ajustarGloboEnPantalla();
  }

  function mantenerEnPantalla() {
    const maxX = window.innerWidth - 96;
    const maxY = window.innerHeight - 100;

    posX = clamp(posX || maxX, 12, maxX);
    posY = clamp(posY || maxY, 12, maxY);

    aplicarPosicion();
  }

  function ajustarGloboEnPantalla() {
    const globo = document.getElementById('sigy-globo');
    const widget = document.getElementById('sigy-widget');

    if (!globo || !widget) return;

    globo.style.left = '';
    globo.style.right = '4px';
    globo.style.width = '';
    globo.style.transformOrigin = 'bottom right';

    requestAnimationFrame(function () {
      const rect = globo.getBoundingClientRect();
      const widgetRect = widget.getBoundingClientRect();
      const margen = 12;

      if (rect.left < margen) {
        globo.style.right = 'auto';
        globo.style.left = '0px';
        globo.style.transformOrigin = 'bottom left';
      }

      if (rect.right > window.innerWidth - margen) {
        globo.style.left = 'auto';
        globo.style.right = '4px';
        globo.style.transformOrigin = 'bottom right';
      }

      const nuevoRect = globo.getBoundingClientRect();

      if (nuevoRect.left < margen && nuevoRect.right > window.innerWidth - margen) {
        globo.style.left = `${margen - widgetRect.left}px`;
        globo.style.right = 'auto';
        globo.style.width = `${window.innerWidth - margen * 2}px`;
        globo.style.transformOrigin = 'bottom center';
      }
    });
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

    if (rafId) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(animar);
  }

  function mostrarPisaditas() {
    const widget = document.getElementById('sigy-widget');
    if (!widget) return;

    widget.classList.add('sigy-caminando');

    setTimeout(function () {
      widget.classList.remove('sigy-caminando');
    }, 4300);
  }

  function cambiarModoUI(nuevoModo) {
    modoUI = nuevoModo;

    document.querySelectorAll('.sigy-ayudas button').forEach(function (b) {
      b.classList.toggle('active', b.dataset.ui === nuevoModo);
    });

    const input = document.getElementById('sigy-input');
    const respuesta = document.getElementById('sigy-respuesta');

    if (input) {
      input.placeholder = placeholders[nuevoModo] || placeholders.libre;
    }

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

  function moverSigyA(x, y, duracion) {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }

    const maxX = window.innerWidth - 96;
    const maxY = window.innerHeight - 102;

    const inicioX = posX;
    const inicioY = posY;

    const finalX = clamp(x, 12, maxX);
    const finalY = clamp(y, 12, maxY);

    const dx = finalX - inicioX;
    const dy = finalY - inicioY;
    const inicio = performance.now();

    moviendose = true;
    mostrarPisaditas();

    function animar(t) {
      const p = clamp((t - inicio) / duracion, 0, 1);
      const ease = 1 - Math.pow(1 - p, 3);

      posX = inicioX + dx * ease;
      posY = inicioY + dy * ease;

      aplicarPosicion();

      if (p < 1) {
        rafId = requestAnimationFrame(animar);
      } else {
        posX = finalX;
        posY = finalY;
        aplicarPosicion();
        moviendose = false;
      }
    }

    rafId = requestAnimationFrame(animar);
  }

  function abrirSigy() {
    abierto = true;

    const panel = document.getElementById('sigy-panel');
    const globo = document.getElementById('sigy-globo');

    if (panel) {
      panel.classList.add('visible');
    }

    if (globo) {
      globo.classList.remove('visible');
    }

    if (posX < window.innerWidth * 0.45) {
      moverSigyA(window.innerWidth - 104, window.innerHeight - 112, 900);
    }

    setEstadoCarita('feliz');
  }

  function toggleSigy() {
    abierto = !abierto;

    if (abierto) {
      abrirSigy();
    } else {
      cerrarSigy();
    }
  }

  function cerrarSigy() {
    abierto = false;

    const panel = document.getElementById('sigy-panel');

    if (panel) {
      panel.classList.remove('visible');
    }

    setEstadoCarita('');
    programarMensajitoIdle(10000);
  }

  function mostrarGlobo(texto, duracion, cara) {
    const globo = document.getElementById('sigy-globo');

    if (!globo || abierto) return;

    globo.textContent = texto;
    globo.classList.add('visible');

    setEstadoCarita(cara || 'feliz');
    ajustarGloboEnPantalla();

    setTimeout(function () {
      globo.classList.remove('visible');
      setEstadoCarita('');
    }, duracion || 6000);
  }

  function setEstadoCarita(estado) {
    const carita = document.getElementById('sigy-carita');
    if (!carita) return;

    carita.classList.remove('pensando', 'feliz', 'triste', 'dormido', 'sorpresa', 'enamorado');

    if (estado) {
      carita.classList.add(estado);
    }
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

      setTimeout(function () {
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

    setTimeout(function () {
      setEstadoCarita('');
    }, 1400);
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
