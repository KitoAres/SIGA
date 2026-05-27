/* ======================================================
   SIGy Widget ✨
   La mini presencia emocional de SIGA.
   Ya no solo dice frases bonitas: ahora intenta ayudar.
   Programar esto fue sufrir, pero con amor.
   ====================================================== */

(function () {
  const saludosEntrada = [
    'Qué bonito verte por aquí ✨',
    'Volviste. SIGA se siente un poquito más vivo.',
    'Hola. Podemos ir despacio hoy.',
    'Me alegra verte. ¿Quieres ordenar algo que sientes?',
    'Aquí estoy. No para presionar, sino para acompañar.',
    'Qué bueno que entraste. Podemos hacer algo pequeño.',
    'Hoy no hace falta resolver todo. Podemos empezar por una idea.'
  ];

  const frasesPorSeccion = {
    dashboard: [
      'Puedo ayudarte a pensar qué hacer hoy en SIGA.',
      'Podemos revisar una señal, una carta o solo respirar un poco.',
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
      'Si hay clima bonito, luego podré sugerir una hora especial.'
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
      'Una misión también puede ser algo simple: una señal, una canción, una pausa.',
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

  const accionesRapidas = [
    {
      texto: 'Ayúdame a decir esto sin reclamo',
      modo: 'suavizar'
    },
    {
      texto: 'Convierte esto en una señal pequeña',
      modo: 'señal'
    },
    {
      texto: '¿Conviene enviar esto o guardarlo?',
      modo: 'decidir'
    },
    {
      texto: 'Hazlo como carta bonita',
      modo: 'carta'
    }
  ];

  const modos = [
    { id: 'acompañar', label: 'Acompañar' },
    { id: 'suavizar', label: 'Suavizar' },
    { id: 'carta', label: 'Carta' },
    { id: 'señal', label: 'Señal' },
    { id: 'decidir', label: 'Decidir' }
  ];

  let abierto = false;
  let modoActual = 'acompañar';
  let ultimoSaludoMostrado = false;

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
      return 'Puedo ayudarte a ordenar algo, escribirlo mejor o decidir si conviene enviarlo.';
    }

    return elegirRandom(lista);
  }

  function crearWidget() {
    if (document.getElementById('sigy-widget')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'sigy-widget';

    wrapper.innerHTML = `
      <div id="sigy-globo" class="sigy-globo">
        ${elegirRandom(saludosEntrada)}
      </div>

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
          <button data-accion="0">Sin reclamo</button>
          <button data-accion="1">Señal pequeña</button>
          <button data-accion="2">¿Enviar?</button>
          <button data-accion="3">Carta</button>
        </div>

        <textarea id="sigy-input" placeholder="Pega aquí lo que quieres decir, una idea, una carta o algo que no sabes si enviar..."></textarea>

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
        cambiarModo(m.id);
      });

      modosBox.appendChild(btn);
    });

    document.getElementById('sigy-burbuja').addEventListener('click', toggleSigy);
    document.getElementById('sigy-cerrar').addEventListener('click', cerrarSigy);
    document.getElementById('sigy-enviar').addEventListener('click', hablarConSigy);
    document.getElementById('sigy-limpiar').addEventListener('click', limpiarSigy);

    document.querySelectorAll('.sigy-ayudas button').forEach(btn => {
      btn.addEventListener('click', () => {
        const accion = accionesRapidas[Number(btn.dataset.accion)];
        if (!accion) return;

        cambiarModo(accion.modo);

        const input = document.getElementById('sigy-input');

        if (!input.value.trim()) {
          input.placeholder = accion.texto + ': pega tu texto aquí...';
        }

        abrirSigy();
      });
    });

    mostrarSaludoEntrada();

    setInterval(actualizarFrasePorSeccion, 2200);
  }

  function cambiarModo(modo) {
    modoActual = modo;

    document.querySelectorAll('.sigy-modos button').forEach(b => {
      b.classList.toggle('active', b.dataset.modo === modo);
    });

    const respuesta = document.getElementById('sigy-respuesta');

    const ayudasModo = {
      acompañar: 'Cuéntame qué pasa y te ayudo a ordenarlo con calma.',
      suavizar: 'Pega el mensaje y lo bajo de intensidad sin quitarle verdad.',
      carta: 'Dame la idea y la convertimos en carta bonita, sin presión.',
      señal: 'Lo hacemos pequeño: algo que se pueda compartir sin exigir respuesta.',
      decidir: 'Pega lo que quieres mandar y vemos si conviene enviar, esperar o guardar.'
    };

    if (respuesta) {
      respuesta.dataset.tocado = '';
      respuesta.innerHTML = `<span>${ayudasModo[modo] || fraseContextual()}</span>`;
    }
  }

  function mostrarSaludoEntrada() {
    if (ultimoSaludoMostrado) return;
    ultimoSaludoMostrado = true;

    const globo = document.getElementById('sigy-globo');
    const carita = document.getElementById('sigy-carita');

    if (!globo || !carita) return;

    globo.textContent = elegirRandom(saludosEntrada);
    globo.classList.add('visible');
    setEstadoCarita('feliz');

    setTimeout(() => {
      globo.classList.remove('visible');
      setEstadoCarita('');
    }, 5200);
  }

  function abrirSigy() {
    abierto = true;
    const panel = document.getElementById('sigy-panel');

    if (panel) {
      panel.classList.add('visible');
    }

    setEstadoCarita('feliz');
    actualizarFrasePorSeccion();
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

    carita.classList.remove('pensando', 'feliz', 'triste', 'dormido');

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

    setTimeout(() => {
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
