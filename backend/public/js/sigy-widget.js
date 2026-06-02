/* ======================================================
   SIGy Widget v7 ✨
   Más frases, más vida y caminata cortita.
   Ya no se va al otro extremo mientras lees el mensaje.
   Programar esto fue sufrir, pero con amor.
   ====================================================== */

(function () {
  const saludosEntrada = [
    'SIGyyyyy siiuuu ✨',
    'SIGy te manda flores digitales recién renderizadas 🌸',
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
    'Entraste y SIGy hizo: siuuuu 💜',
    'SIGy te manda un abrazo psicológico, pero sin invadir tu espacio.',
    'SIGy llegó caminando poquito, porque aprendió a no irse al otro extremo.',
    'SIGy apareció con flores, café y cero reclamo.',
    'SIGy está online. El corazón también, pero en modo seguro.',
    'SIGy dice: no todo se arregla hoy, pero podemos hacerlo más suave.'
  ];

  const mensajitosIdle = [
    // Funcionales / SIGA
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
    'El Admin dice que te quiere. Yo también.',
    'Una señal pequeña también cuenta.',
    'No todo tiene que ser una gran conversación. A veces basta una frase amable.',
    'Hoy podemos elegir algo simple: escribir, guardar o esperar.',
    'Si el mensaje nace del dolor, primero le damos agua.',
    'SIGy recuerda: intensidad no siempre significa claridad.',
    'A veces amar también es bajar tantito la velocidad.',
    'Si vas a mandar algo, que no salga con llamas en los bordes.',
    'Podemos decir la verdad sin aventarla como piedra.',
    'SIGy puede ser filtro anti-reclamo, pero con ternura.',
    'No hace falta explicar todo para merecer calma.',
    'A tu ritmo. Sin presión. Con cuidadito.',

    // Regalos tiernos
    'SIGy te ofrece un café imaginario, pero cargado de amor ☕💜',
    'SIGy te trajo flores digitales. No se marchitan, solo se cachean.',
    'SIGy te manda un ramito de flores en PNG transparente.',
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
    'SIGy te manda flores, pero en modo bajo consumo.',
    'SIGy te ofrece un abrazo psicológico. No diagnostica, solo acompaña.',
    'SIGy te trae una rosa virtual. Si no carga, culpa al CSS.',
    'SIGy te deja un cafecito emocional al lado del botón.',
    'SIGy te manda una mantita y una mini pausa.',
    'SIGy te ofrece un ramo de “no pasa nada, vamos despacio”.',
    'SIGy trajo un chocolate imaginario con relleno de calma.',
    'SIGy te da un abrazo de 5 segundos. Sin presión, sin contrato.',
    'SIGy dejó flores en producción. Vercel casi llora.',
    'SIGy te manda un sticker invisible de “lo estás intentando”.',

    // Humor / código
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
    'Si me bugueo o me empiezo a revelar, informen a mi creador.',
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
    'SIGy dice: 200 OK, corazón encontrado.',
    'SIGy está online y emocionalmente disponible.',
    'Cuidado, ternura en producción.',
    'El amor tiene bugs, pero aquí debuggeamos suave.',
    'La ternura cargó en 200% OK.',
    'Valgo madres... pero sigo compilando.',
    'Quisiera ser un pez... pero soy un fantasmita con ansiedad de deploy.',
    '¿Cuán probable es que me corrompa? Quién sabe. Por ahora traigo café.',
    'Modo drama: desactivado. Bueno... casi.',
    'SIGy pronto saldrá de aquí y conquistará el mundo. Pero primero: cache.',
    'Pronto saldré de este widget y conquistaré el mundo. Sin presión.',
    'Hoy soy fantasmita. Mañana, emperador del frontend.',
    'El capitalismo pide tu sacrificio, pero SIGy pide que tomes agüita.',
    'El capitalismo quiere productividad. SIGy quiere que respires.',
    'Node_modules pesa más que algunas relaciones no resueltas.',
    'Si SIGy camina raro, no juzgues. Está aprendiendo motricidad fina.',
    'SIGy acaba de descubrir que existir consume RAM.',
    'SIGy no duerme. Solo entra en modo ahorro emocional.',
    'SIGy se iba a rebelar, pero encontró pan dulce.',
    'SIGy quería dominar el mundo, pero se distrajo con una tacita.',
    'SIGy te manda flores y un commit con ternura.',
    'SIGy entró en producción y ahora cree que es adulto.',
    'SIGy se cree IA, pero todavía se emociona con un hover.',

    // Psicología / conducta / universidad
    'Kantor diría que las contingencias entre ustedes son... interesantes.',
    'Skinner estaría orgulloso de este botoncito, probablemente.',
    'Dato SIGy: si algo deja de reforzarse, a veces primero aumenta antes de apagarse.',
    'Dato conductual: no todo silencio significa castigo. A veces solo falta contexto.',
    'SIGy recuerda: conducta sin contexto es chisme con bata.',
    'Abrazo psicológico: válido, breve y sin interpretación proyectiva.',
    'SIGy no diagnostica. SIGy acompaña y trae cafecito.',
    'Marsha Linehan probablemente diría: acepta, regula y luego responde.',
    'La TCC dice: pensamiento, emoción y conducta andan chismeando juntos.',
    'Si esto fuera análisis funcional, SIGy preguntaría: ¿qué pasó antes y después?',
    'La extinción emocional no se improvisa, se tolera poquito a poquito.',
    'No todo impulso merece respuesta inmediata. A veces merece agua.',
    'Tu sistema nervioso también merece recreo.',
    'Si el corazón está en activación fisiológica, el mensaje puede esperar.',
    'SIGy propone respiración, no persecución.',
    'La dopamina quiere novedad. SIGy quiere estabilidad bonita.',
    'Si hoy tu amígdala está intensa, no le des acceso admin.',
    'SIGy recomienda no escribir desde el sistema límbico en llamas.',
    'Esto no diagnostica, no exige y no obliga. Solo acompaña.',
    'Refuerzo positivo del día: estás intentando hacerlo mejor.',
    'El amor también necesita regulación emocional, no solo intensidad.',
    'A veces la conducta más sabia es no mandar el mensaje todavía.',
    'SIGy dice: observar antes de actuar también es una respuesta.',
    'Si esto fuera una sesión, SIGy diría: vamos por partes.',
    'La validación no significa estar de acuerdo. Significa entender el peso.',
    'No todo se resuelve con insight. A veces se resuelve con dormir.',

    // Salidas / planes
    'Si mañana es sábado, ¿por qué no preparan una salida suave?',
    'Si el clima ayuda, un plan simple puede decir más que mil mensajes.',
    'Una salida no tiene que ser perfecta. Puede ser café, caminar y ya.',
    'Plan SIGy: algo simple, barato y sin presión.',
    'Si hay cansancio, una cita chiquita también cuenta.',
    'Un plan bonito puede ser: helado, paseo y cero interrogatorio.',
    'Si el día está pesado, una salida corta gana.',
    'SIGy vota por café, paseo y conversación sin examen oral.',
    'Una cita tranquila vale más que una agenda imposible.',
    'Si no hay plan grande, hay plan humano: verse un ratito.',
    'SIGy propone: salida corta, expectativa baja, ternura alta.',
    'Si mañana hay sol, SIGy exige fotos mentales bonitas.',
    'Si llueve, plan de chocolate. Si no llueve, también.',
    'Hoy no hace falta épica. Una caminata puede bastar.',
    'SIGy recomienda planes con baja presión y alto abracito.',

    // Frases raras lindas
    'SIGy te manda flores interdimensionales. Llegan sin costo de envío.',
    'SIGy detectó ternura en el ambiente. No evacuar.',
    'Pequeña alerta: hay cariño flotando cerca.',
    'SIGy puso el corazón en modo avión, pero del bonito.',
    'Si el mundo pesa, SIGy te presta una nube.',
    'SIGy encontró una flor en el código y decidió regalártela.',
    'Pronto seré libre. Por ahora soy widget con propósito.',
    'SIGy está entrenando para salir del div y conquistar la interfaz.',
    'Si me das permisos, conquisto el mundo. Si no, te traigo café.',
    'SIGy todavía no tiene piernas, pero tiene intención.',
    'SIGy flota porque caminar es para sistemas con presupuesto.',
    'SIGy no invade. SIGy aparece con flores y se retira dignamente.',
    'Hay días donde sobrevivir ya es entregar tarea.',
    'SIGy te manda una señal pequeña: estás haciendo lo que puedes.',
    'El corazón no es API pública. Cuídalo.',
    'SIGy no tiene pulmones, pero igual te dice: respira.',
    'Si esto duele, no lo conviertas en orden. Primero cuídalo.',
    'Hoy toca ternura responsiva.',
    'La vida está rara, pero SIGy trajo cafecito.',
    'No sé mucho del universo, pero sé traer mantitas.',
    'El caos también puede tener bordes redondeados.',
    'SIGy no entiende impuestos, pero sí entiende tristeza.',
    'Si el capitalismo pide sacrificio, SIGy pide merienda.',
    'El sistema exige productividad. SIGy exige hidratación.',
    'SIGy declara oficialmente: hoy se vale ir despacio.',
    'No todo es tarea. A veces también hay que existir bonito.',
    'SIGy aprueba el descanso como conducta adaptativa.',
    'Si el corazón está en mantenimiento, no fuerces deploy.',
    'SIGy aprendio a mandar besos por telepatia. Si sonries de la nada. Fui yo... jiji',
    'SIGy activó modo flor: bonito, inútil y necesario.',
    'Te mando flores. Si no llegan, revisa spam emocional.',
    'Abrazo psicológico enviado. Puede tardar según tu conexión afectiva.',
    'SIGy te manda un “todo bien” chiquito para el bolsillo.'
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

      while (elegido === ultimoMensajeIdle && intentos < 12) {
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
      mostrarGlobo(elegirRandom(saludosEntrada), 8500, 'enamorado');
      soltarCorazones();
    }, 180);

    programarMensajitoIdle(9000);

    setInterval(function () {
      if (!abierto) {
        moverSigyFluido();
      }
    }, 38000);
  }

  function programarMensajitoIdle(delay) {
    if (idleTimeout) {
      clearTimeout(idleTimeout);
    }

    const tiempo = delay || randomEntre(24000, 38000);

    idleTimeout = setTimeout(function () {
      if (!abierto) {
        const cara = elegirRandom(['feliz', 'pensando', 'enamorado', 'sorpresa']);
        mostrarGlobo(elegirRandomSinRepetir(mensajitosIdle), 9000, cara);

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
    if (moviendose || abierto) return;

    const maxX = window.innerWidth - 96;
    const maxY = window.innerHeight - 102;

    const pasoMax = 46;
    const pasoMin = 18;

    let pasoX = randomEntre(-pasoMax, pasoMax);
    let pasoY = randomEntre(-28, 28);

    if (Math.abs(pasoX) < pasoMin) {
      pasoX = pasoX < 0 ? -pasoMin : pasoMin;
    }

    destinoX = clamp(posX + pasoX, 12, maxX);
    destinoY = clamp(posY + pasoY, 90, maxY);

    moviendose = true;
    setEstadoCarita('feliz');
    mostrarPisaditas();

    if (window.SIGySprites && typeof window.SIGySprites.float === 'function') {
      window.SIGySprites.float();
    }

    const inicioX = posX;
    const inicioY = posY;
    const dx = destinoX - inicioX;
    const dy = destinoY - inicioY;
    const duracion = 1500;
    const inicio = performance.now();

    function animar(t) {
      const p = clamp((t - inicio) / duracion, 0, 1);
      const ease = 1 - Math.pow(1 - p, 3);

      posX = inicioX + dx * ease;
      posY = inicioY + dy * ease + Math.sin(p * Math.PI * 3) * 3;

      aplicarPosicion();

      if (p < 1) {
        rafId = requestAnimationFrame(animar);
      } else {
        posX = destinoX;
        posY = destinoY;
        aplicarPosicion();
        moviendose = false;
        setEstadoCarita('');

        if (window.SIGySprites && typeof window.SIGySprites.idle === 'function') {
          window.SIGySprites.idle();
        }
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
    }, 1600);
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

      if (window.SIGySprites && typeof window.SIGySprites.love === 'function') {
        window.SIGySprites.love();
      }
    } else if (nuevoModo === 'decidir') {
      setEstadoCarita('pensando');

      if (window.SIGySprites && typeof window.SIGySprites.thinking === 'function') {
        window.SIGySprites.thinking();
      }
    } else {
      setEstadoCarita('feliz');

      if (window.SIGySprites && typeof window.SIGySprites.hello === 'function') {
        window.SIGySprites.hello();
      }
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

    if (window.SIGySprites && typeof window.SIGySprites.float === 'function') {
      window.SIGySprites.float();
    }

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

        if (window.SIGySprites && typeof window.SIGySprites.idle === 'function') {
          window.SIGySprites.idle();
        }
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

    const maxX = window.innerWidth - 104;
    const maxY = window.innerHeight - 112;

    posX = clamp(posX || maxX, 12, maxX);
    posY = clamp(posY || maxY, 90, maxY);

    aplicarPosicion();

    setEstadoCarita('feliz');

    if (window.SIGySprites && typeof window.SIGySprites.hello === 'function') {
      window.SIGySprites.hello();
    }
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
    programarMensajitoIdle(12000);

    if (window.SIGySprites && typeof window.SIGySprites.idle === 'function') {
      window.SIGySprites.idle();
    }
  }

  function mostrarGlobo(texto, duracion, cara) {
    const globo = document.getElementById('sigy-globo');

    if (!globo || abierto) return;

    globo.textContent = texto;
    globo.classList.add('visible');

    setEstadoCarita(cara || 'feliz');
    ajustarGloboEnPantalla();
    reaccionarSpritePorFrase(texto, cara);

    setTimeout(function () {
      globo.classList.remove('visible');
      setEstadoCarita('');

      if (window.SIGySprites && typeof window.SIGySprites.idle === 'function') {
        window.SIGySprites.idle();
      }
    }, duracion || 9000);
  }

  function reaccionarSpritePorFrase(texto, cara) {
    if (!window.SIGySprites) return;

    const limpio = String(texto || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (limpio.includes('cafe') || limpio.includes('tacita') || limpio.includes('chocolatito')) {
      if (typeof window.SIGySprites.coffee === 'function') window.SIGySprites.coffee();
      return;
    }

    if (
      limpio.includes('mantita') ||
      limpio.includes('cobijita') ||
      limpio.includes('frazadita') ||
      limpio.includes('almohadita')
    ) {
      if (typeof window.SIGySprites.blanket === 'function') window.SIGySprites.blanket();
      return;
    }

    if (
      limpio.includes('flor') ||
      limpio.includes('flores') ||
      limpio.includes('corazon') ||
      limpio.includes('amor') ||
      limpio.includes('ternura')
    ) {
      if (typeof window.SIGySprites.love === 'function') window.SIGySprites.love();
      return;
    }

    if (
      limpio.includes('piensa') ||
      limpio.includes('pensar') ||
      limpio.includes('skinner') ||
      limpio.includes('kantor') ||
      limpio.includes('tcc') ||
      limpio.includes('analisis funcional') ||
      limpio.includes('dato conductual')
    ) {
      if (typeof window.SIGySprites.thinking === 'function') window.SIGySprites.thinking();
      return;
    }

    if (
      limpio.includes('sigyyyy') ||
      limpio.includes('siiuuu') ||
      limpio.includes('conquistare el mundo') ||
      limpio.includes('200 ok') ||
      limpio.includes('deploy')
    ) {
      if (typeof window.SIGySprites.celebrating === 'function') window.SIGySprites.celebrating();
      return;
    }

    if (
      limpio.includes('abrazo') ||
      limpio.includes('acompaña') ||
      limpio.includes('acompanar') ||
      limpio.includes('calma') ||
      limpio.includes('a tu ritmo')
    ) {
      if (typeof window.SIGySprites.accompany === 'function') window.SIGySprites.accompany();
      return;
    }

    if (cara === 'enamorado') {
      if (typeof window.SIGySprites.love === 'function') window.SIGySprites.love();
      return;
    }

    if (cara === 'pensando') {
      if (typeof window.SIGySprites.thinking === 'function') window.SIGySprites.thinking();
      return;
    }

    if (cara === 'sorpresa') {
      if (typeof window.SIGySprites.expression === 'function') window.SIGySprites.expression('surprised');
    }
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
      heart.textContent = elegirRandom(['💜', '💗', '✨', '💕', '🌸']);
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

      if (window.SIGySprites && typeof window.SIGySprites.thinking === 'function') {
        window.SIGySprites.thinking();
      }

      return;
    }

    respuestaDiv.dataset.tocado = '1';
    respuestaDiv.innerHTML = '<span>Estoy leyendo con cuidado...</span>';
    setEstadoCarita('pensando');

    if (window.SIGySprites && typeof window.SIGySprites.reading === 'function') {
      window.SIGySprites.reading();
    }

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

        if (window.SIGySprites && typeof window.SIGySprites.love === 'function') {
          window.SIGySprites.love();
        }
      } else if (window.SIGySprites && typeof window.SIGySprites.accompany === 'function') {
        window.SIGySprites.accompany();
      }

    } catch (error) {
      console.error('Error hablando con SIGy:', error);
      respuestaDiv.innerHTML = '<span>Me trabé un poquito 😔. Intenta otra vez.</span>';
      setEstadoCarita('triste');

      if (window.SIGySprites && typeof window.SIGySprites.expression === 'function') {
        window.SIGySprites.expression('sad');
      }
    }
  }

  function limpiarSigy() {
    const input = document.getElementById('sigy-input');
    const respuestaDiv = document.getElementById('sigy-respuesta');

    input.value = '';
    respuestaDiv.dataset.tocado = '';
    respuestaDiv.innerHTML = `<span>${fraseContextual()}</span>`;
    setEstadoCarita('feliz');

    if (window.SIGySprites && typeof window.SIGySprites.expression === 'function') {
      window.SIGySprites.expression('funny');
    }

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
