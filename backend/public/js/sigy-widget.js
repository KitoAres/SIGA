/* ======================================================
   SIGy Widget v3 ✨
   Ahora se mueve, saluda, cambia carita y lanza mensajitos.
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
    dashboard: [
      'Puedo ayudarte a pensar qué hacer hoy en SIGA.',
      'Podemos revisar una señal, una carta o solo ordenar una idea.',
      'Si hoy pesa algo, podemos convertirlo en algo más claro.'
    ],
    recuerdos: [
      'Puedo ayudarte a escribir un recuerdo sin hacerlo demasiado triste.',
      'Un recuerdo puede guardarse bonito, sin exigir nada.',
      'Si quieres, puedo ayudarte a convertir este momento en texto.'
    ],
    citas: [
      'Puedo ayudarte a pensar un plan simple, bonito y sin presión.',
      'Podemos crear una cita que no se sienta pesada.',
      'Luego puedo sugerir planes según clima y hora.'
    ],
    playlist: [
      'Puedo ayudarte a elegir una canción según el momento.',
      'A veces una canción dice mejor lo que una carta complica.',
      'Podemos hacer que esta canción tenga una dedicatoria suave.'
    ],
    razones: [
      'Puedo ayudarte a escribir una razón que no suene exagerada.',
      'Las razones bonitas también pueden ser simples.',
      'Podemos escribir algo tierno, pero sin intensidad pesada.'
    ],
    promesas: [
      'Puedo ayudarte a convertir una promesa en algo realista.',
      'Prometer también es cuidar lo posible, no lo perfecto.',
      'Podemos escribir una promesa que no suene a deuda emocional.'
    ],
    carta: [
      'Puedo ayudarte a suavizar una carta antes de guardarla.',
      'Si duele mucho, tal vez primero la hacemos más segura.',
      'Puedo ayudarte a decirlo sin que suene a reclamo.'
    ],
    tiempo: [
      'Puedo ayudarte a proponer un momento sin presionar.',
      'Podemos hacer que coincidir se sienta tranquilo.',
      'Luego puedo revisar clima y sugerir una hora bonita.'
    ],
    eventos: [
      'Puedo sugerir una misión pequeña, no una tarea pesada.',
      'Una misión también puede ser una señal, una canción o una pausa.',
      'Podemos hacer una misión que cuide el vínculo sin forzarlo.'
    ],
    cajita: [
      'Puedo ayudarte a escribir una descripción bonita para este detalle.',
      'Este lugar guarda cosas hechas con cariño. Podemos ordenarlas.',
      'Podemos hacer que este detalle se sienta más íntimo.'
    ],
    espacio: [
      'Puedo ayudarte a decidir si esto se guarda privado o se comparte.',
      'Esto puede quedarse solo para ti. No todo tiene que enviarse.',
      'Podemos convertir lo que sientes en una señal pequeña.'
    ],
    calma: [
      'Modo avión no es castigo. Es una forma de decir: ahora no puedo.',
      'Puedo ayudarte a escribir una señal de pausa sin culpa.',
      'A veces cuidar también es bajar el ruido.'
    ],
    admin: [
      'Zona admin. Aquí el amor se mezcla con logs y sufrimiento técnico.',
      'Puedo ayudar a revisar qué mejorar sin romper SIGA.',
      'El código también necesita cariño, pero primero backup.'
    ]
  };

  const modos = [
    { id: 'acompañar', label: 'Acompañar' },
    { id: 'suavizar', label: 'Suavizar' },
    { id: 'carta', label: 'Carta' },
    { id: 'señal', label: 'Señal' },
    { id: 'decidir', label: 'Decidir' }
  ];

  const ayudasModo = {
    acompañar: 'Cuéntame qué pasa y te ayudo a ordenarlo con calma.',
    suavizar: 'Pega el mensaje y lo bajo de intensidad sin quitarle verdad.',
    carta: 'Dame la idea y la convertimos en carta bonita, sin presión.',
    señal: 'Lo hacemos pequeño: algo que se pueda compartir sin exigir respuesta.',
    decidir: 'Pega lo que quieres mandar y vemos si conviene enviar, esperar o guardar.'
  };

  let abierto = false;
  let modoActual = 'acompañar';
  let moviendose = false;
  let posicionActual = 'derecha';

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
    const lista = frasesPorSeccion[seccion];

    if (!lista) {
      return 'Puedo ayudarte a escribir, decidir o bajar la intensidad.';
    }

    return elegirRandom(lista);
  }

  function crearWidget() {
    if (document.getElementById('sigy-widget')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'sigy-widget';

    wrapper.innerHTML = `
      <div id="sigy-globo" class="sigy-globo"></div>

      <button id="sigy-burbuja" title="Hablar con SIGy">
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
            <div class="sigy-subtitle" id="sigy-subtitle">
              Puedo ayudarte a escribir, decidir o bajar la intensidad.
            </div>
          </div>
          <button id="sigy-cerrar">×</button>
        </div>

        <div class="sigy-modos" id="sigy-modos"></div>

        <div class="sigy-ayudas">
          <button type="button" data-accion="suavizar">Sin reclamo</button>
          <button type="button" data-accion="señal">Señal pequeña</button>
          <button type="button" data-accion="decidir">¿Enviar?</button>
          <button type="button" data-accion="carta">Carta</button>
        </div>

        <textarea id="sigy-input" placeholder="Pega aquí lo que quieres decir, una idea, una carta o algo que no sabes si enviar..."></textarea>

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

    const modosBox = document.getElementById('sigy-modos');

    modos.forEach(m => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = m.label;
      btn.dataset.modo = m.id;

      if (m.id === modoActual) btn.classList.add('active');

      btn.addEventListener('click', () => cambiarModo(m.id));
      modosBox.appendChild(btn);
    });

    document.getElementById('sigy-burbuja').addEventListener('click', toggleSigy);
    document.getElementById('sigy-cerrar').addEventListener('click', cerrarSigy);
    document.getElementById('sigy-enviar').addEventListener('click', hablarConSigy);
    document.getElementById('sigy-limpiar').addEventListener('click', limpiarSigy);

    document.querySelectorAll('.sigy-ayudas button').forEach(btn => {
      btn.addEventListener('click', () => {
        cambiarModo(btn.dataset.accion);
        abrirSigy();
      });
    });

    mostrarGlobo(elegirRandom(saludosEntrada), 5200, 'feliz');

    setInterval(() => {
      if (!abierto) {
        mostrarGlobo(elegirRandom(mensajitosIdle), 4200, elegirRandom(['feliz', 'pensando']));
      }
    }, 28000);

    setInterval(() => {
      if (!abierto) moverSigySuave();
    }, 18000);

    setInterval(actualizarFrasePorSeccion, 2500);
  }

  function cambiarModo(modo) {
    modoActual = modo;

    document.querySelectorAll('.sigy-modos button').forEach(b => {
      b.classList.toggle('active', b.dataset.modo === modo);
    });

    const respuesta = document.getElementById('sigy-respuesta');

    if (respuesta) {
      respuesta.dataset.tocado = '';
      respuesta.innerHTML = `<span>${ayudasModo[modo] || fraseContextual()}</span>`;
    }

    const input = document.getElementById('sigy-input');

    const placeholders = {
      acompañar: 'Cuéntame qué pasa. No hace falta explicarlo perfecto...',
      suavizar: 'Pega el mensaje que quieres decir sin que suene a reclamo...',
      carta: 'Escribe la idea de tu carta y la hacemos bonita...',
      señal: 'Escribe lo que quieres expresar y lo volvemos una señal pequeña...',
      decidir: 'Pega el mensaje y vemos si conviene enviarlo, esperar o guardarlo...'
    };

    if (input) input.placeholder = placeholders[modo] || placeholders.acompañar;
  }

  function abrirSigy() {
    abierto = true;

    const panel = document.getElementById('sigy-panel');
    const globo = document.getElementById('sigy-globo');

    if (panel) panel.classList.add('visible');
    if (globo) globo.classList.remove('visible');

    centrarSiEstaMuyPegado();
    setEstadoCarita('feliz');
    actualizarFrasePorSeccion();
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

  function actualizarFrasePorSeccion() {
    const subtitle = document.getElementById('sigy-subtitle');
    const respuesta = document.getElementById('sigy-respuesta');

    if (subtitle) subtitle.textContent = fraseContextual();

    if (respuesta && !respuesta.dataset.tocado) {
      respuesta.innerHTML = `<span>${fraseContextual()}</span>`;
    }
  }

  function mostrarGlobo(texto, duracion = 4000, cara = 'feliz') {
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

    if (!mensaje) {
      respuestaDiv.dataset.tocado = '1';
      respuestaDiv.innerHTML = '<span>Pega una frase, una carta o una idea. Yo te ayudo a bajarla, ordenarla o decidir qué hacer.</span>';
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
      respuestaDiv.innerHTML = '<span>Me trabé un poquito 😔. Puede ser la API key, el límite gratis o un error del servidor.</span>';
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
