/* ======================================================
   🌌 EL UNIVERSO DEL VÍNCULO — JS principal
   Integrado en SIGA. No toca módulos existentes.
   ====================================================== */

(function () {
  'use strict';

  /* ── Estado ─────────────────────────────────────────── */
  const UNI = {
    datos:      null,
    eventos:    [],
    canvas:     null,
    ctx:        null,
    raf:        null,
    stars:      [],
    particles:  [],
    loaded:     false,
    sigyTimer:  null
  };

  /* ── Config nodos ───────────────────────────────────── */
  const NODOS = [
    { id: 'islas',         icono: '🪐', label: 'Isla del Primer\nEncuentro', angulo: -90,  radio: 0.34 },
    { id: 'bosque',        icono: '🎵', label: 'Bosque de\nlas Canciones',   angulo: -20,  radio: 0.35 },
    { id: 'biblioteca',    icono: '📚', label: 'Biblioteca\nde Secretos',     angulo: 40,   radio: 0.33 },
    { id: 'puertas',       icono: '🚪', label: 'Puerta del\nFuturo',          angulo: 100,  radio: 0.34 },
    { id: 'rincon',        icono: '🌙', label: 'Rincón de\nla Calma',         angulo: 155,  radio: 0.33 },
    { id: 'constelaciones',icono: '✨', label: 'Constelaciones',              angulo: 210,  radio: 0.35 },
    { id: 'puentes',       icono: '🌉', label: 'Puentes de\nencuentro',       angulo: 265,  radio: 0.34 }
  ];

  const COLORES_NODO = {
    islas:          '#b482dc',
    bosque:         '#7aaef0',
    biblioteca:     '#e8789a',
    puertas:        '#f0c07a',
    rincon:         '#7acfaa',
    constelaciones: '#f0a0b8',
    puentes:        '#a0c8f0'
  };

  const DESTINOS_NAV = {
    islas:          'recuerdos',
    bosque:         'playlist',
    biblioteca:     'carta',
    puertas:        'promesas',
    rincon:         'espacio',
    constelaciones: 'razones',
    puentes:        'tiempo'
  };

  /* ── Helpers ─────────────────────────────────────────── */
  function rad(deg) { return (deg * Math.PI) / 180; }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function colorConAlpha(hex, a) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  /* ── Canvas estelar ──────────────────────────────────── */
  function initCanvas() {
    const canvas = document.getElementById('universo-canvas');
    if (!canvas) return;
    UNI.canvas = canvas;
    UNI.ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    generarEstrellas();
    animLoop();
  }

  function resizeCanvas() {
    const c = UNI.canvas;
    c.width  = c.offsetWidth;
    c.height = c.offsetHeight;
    generarEstrellas();
  }

  function generarEstrellas() {
    UNI.stars = [];
    const n = Math.floor((UNI.canvas.width * UNI.canvas.height) / 5000);
    for (let i = 0; i < n; i++) {
      UNI.stars.push({
        x:       Math.random() * UNI.canvas.width,
        y:       Math.random() * UNI.canvas.height,
        r:       Math.random() * 1.2 + 0.2,
        opBase:  Math.random() * 0.5 + 0.2,
        opSpeed: Math.random() * 0.015 + 0.003,
        op:      Math.random()
      });
    }
  }

  let tick = 0;
  function animLoop() {
    UNI.raf = requestAnimationFrame(animLoop);
    tick++;
    const ctx = UNI.ctx;
    const W   = UNI.canvas.width;
    const H   = UNI.canvas.height;

    // Fondo
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#080612';
    ctx.fillRect(0, 0, W, H);

    // Neblina de fondo
    const grd = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, W * 0.6);
    grd.addColorStop(0,   'rgba(60,20,100,0.25)');
    grd.addColorStop(0.5, 'rgba(20,15,45,0.15)');
    grd.addColorStop(1,   'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // Estrellas
    for (const s of UNI.stars) {
      s.op += s.opSpeed;
      const op = s.opBase * (0.5 + 0.5 * Math.sin(s.op));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240,236,255,${op})`;
      ctx.fill();
    }

    // Partículas flotantes
    if (tick % 20 === 0 && UNI.datos) emitirParticula();
    actualizarParticulas(ctx, W, H);
  }

  function emitirParticula() {
    const W = UNI.canvas.width;
    const H = UNI.canvas.height;
    const colores = ['#b482dc', '#7aaef0', '#e8789a', '#7acfaa'];
    UNI.particles.push({
      x:   Math.random() * W,
      y:   H + 10,
      vx:  (Math.random() - 0.5) * 0.8,
      vy:  -(Math.random() * 0.8 + 0.3),
      r:   Math.random() * 2 + 0.5,
      op:  0.8,
      color: colores[Math.floor(Math.random() * colores.length)]
    });
    if (UNI.particles.length > 60) UNI.particles.splice(0, 1);
  }

  function actualizarParticulas(ctx) {
    for (const p of UNI.particles) {
      p.x  += p.vx;
      p.y  += p.vy;
      p.op -= 0.003;
      if (p.op <= 0) continue;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = colorConAlpha(p.color.replace(')', '').replace('rgb(', ''), p.op);
      // fallback directo
      ctx.fillStyle = p.color.replace(')', `,${p.op})`).replace('#', 'rgba(').replace(/rgba\(([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2}),/, (_, r, g, b) => `rgba(${parseInt(r,16)},${parseInt(g,16)},${parseInt(b,16)},`);
      ctx.fill();
    }
    UNI.particles = UNI.particles.filter(p => p.op > 0);
  }

  /* ── Dibujado SVG del mapa ───────────────────────────── */
  function dibujarMapa(datos) {
    const svg = document.getElementById('universo-svg');
    if (!svg) return;

    const W  = 800;
    const H  = 580;
    const CX = W / 2;
    const CY = H / 2;

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    let inner = '';

    // Defs (gradientes, filtros)
    inner += `<defs>
      <radialGradient id="gradNucleo" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stop-color="#d4a0ff" stop-opacity="0.9"/>
        <stop offset="60%"  stop-color="#9050d0" stop-opacity="0.7"/>
        <stop offset="100%" stop-color="#5020a0" stop-opacity="0"/>
      </radialGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="glow-soft">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>`;

    // Pulso exterior del núcleo
    inner += `<circle class="nucleo-glow" cx="${CX}" cy="${CY}" r="55" fill="url(#gradNucleo)" filter="url(#glow)"/>`;

    // Anillo decorativo
    inner += `<circle class="nucleo-ring" cx="${CX}" cy="${CY}" r="44" fill="none" stroke="rgba(180,130,220,0.4)" stroke-width="1" stroke-dasharray="6 4" transform-origin="${CX} ${CY}"/>`;

    // Esfera núcleo
    inner += `<circle class="nucleo-sphere" cx="${CX}" cy="${CY}" r="38" fill="url(#gradNucleo)" filter="url(#glow)" transform-origin="${CX} ${CY}"/>`;

    // Texto del núcleo
    inner += `<text x="${CX}" y="${CY - 6}" text-anchor="middle" font-family="Cormorant Garamond,serif" font-size="11" fill="rgba(240,236,255,0.9)">✦ Núcleo del</text>`;
    inner += `<text x="${CX}" y="${CY + 8}" text-anchor="middle" font-family="Cormorant Garamond,serif" font-size="11" fill="rgba(240,236,255,0.9)">vínculo</text>`;

    // Energía en texto
    const energia = datos?.nucleo?.energia ?? 0;
    inner += `<text x="${CX}" y="${CY + 24}" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(180,130,220,0.7)">${energia}% energía</text>`;

    // Nodos + puentes
    for (const nodo of NODOS) {
      const anR  = rad(nodo.angulo);
      const rPx  = Math.min(W, H) * nodo.radio;
      const nx   = CX + Math.cos(anR) * rPx;
      const ny   = CY + Math.sin(anR) * rPx;
      const col  = COLORES_NODO[nodo.id] || '#b482dc';
      const items = datos?.nodos?.[nodo.id]?.items ?? 0;
      const radio = 20 + Math.min(items * 2, 12); // tamaño según actividad

      // Línea puente
      inner += `<line class="puente-line" x1="${CX}" y1="${CY}" x2="${nx}" y2="${ny}"/>`;

      // Partícula en la línea
      const mx = lerp(CX, nx, 0.55);
      const my = lerp(CY, ny, 0.55);
      inner += `<circle r="2" fill="${col}" opacity="0.6" style="--dx:${(nx-CX)*0.3}px;--dy:${(ny-CY)*0.3}px;">
        <animateMotion dur="${2.5 + Math.random()}s" repeatCount="indefinite" path="M${CX},${CY} L${nx},${ny}"/>
      </circle>`;

      // Círculo nodo con glow
      inner += `<g class="nodo-group" data-nodo="${nodo.id}" onclick="UniversoModal.abrir('${nodo.id}')" style="--cx:${nx}px;--cy:${ny}px;">`;
      inner += `<circle cx="${nx}" cy="${ny}" r="${radio + 6}" fill="${col}" opacity="0.12" filter="url(#glow-soft)"/>`;
      inner += `<circle class="nodo-circle" cx="${nx}" cy="${ny}" r="${radio}" fill="${colorConAlpha(col, 0.22)}" stroke="${col}" stroke-width="1.5" filter="url(#glow-soft)"/>`;

      // Icono emoji en foreignObject
      inner += `<text x="${nx}" y="${ny + 5}" text-anchor="middle" dominant-baseline="middle" class="nodo-icon">${nodo.icono}</text>`;

      // Etiqueta bajo el nodo
      const lineas = nodo.label.split('\n');
      const oy = ny + radio + 14;
      for (let i = 0; i < lineas.length; i++) {
        inner += `<text x="${nx}" y="${oy + i * 13}" text-anchor="middle" class="nodo-label">${lineas[i]}</text>`;
      }

      // Badge de conteo
      if (items > 0) {
        inner += `<circle cx="${nx + radio - 4}" cy="${ny - radio + 4}" r="9" fill="rgba(10,8,20,0.9)" stroke="${col}" stroke-width="1"/>`;
        inner += `<text x="${nx + radio - 4}" y="${ny - radio + 4}" text-anchor="middle" dominant-baseline="middle" font-family="DM Sans,sans-serif" font-size="8" fill="${col}">${items > 99 ? '99+' : items}</text>`;
      }

      inner += `</g>`;
    }

    svg.innerHTML = inner;
  }

  /* ── Modal de nodo ───────────────────────────────────── */
  window.UniversoModal = {
    overlay: null,
    modal:   null,

    init() {
      this.overlay = document.getElementById('universo-modal-overlay');
      this.modal   = document.getElementById('universo-modal-content');
      if (this.overlay) {
        this.overlay.addEventListener('click', (e) => {
          if (e.target === this.overlay) this.cerrar();
        });
      }
    },

    async abrir(nodoId) {
      if (!this.overlay) return;

      const info = NODOS.find(n => n.id === nodoId);
      if (!info) return;

      this.overlay.classList.add('open');

      this.modal.innerHTML = `
        <button class="universo-modal-close" onclick="UniversoModal.cerrar()">✕</button>
        <div class="universo-modal-header">
          <span class="universo-modal-icon">${info.icono}</span>
          <div class="universo-modal-title">${info.label.replace('\n', ' ')}</div>
        </div>
        <div class="universo-loading-dots">
          <div class="universo-loading-dot"></div>
          <div class="universo-loading-dot"></div>
          <div class="universo-loading-dot"></div>
        </div>`;

      try {
        const token = localStorage.getItem('siga_token') || '';
        const resp  = await fetch(`/api/universo/nodo/${nodoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await resp.json();
        this.renderContenido(nodoId, info, data);
      } catch (e) {
        this.modal.innerHTML += `<p class="universo-modal-empty">No se pudo cargar la información.</p>`;
      }
    },

    renderContenido(nodoId, info, data) {
      const destino = DESTINOS_NAV[nodoId];
      let html = `
        <button class="universo-modal-close" onclick="UniversoModal.cerrar()">✕</button>
        <div class="universo-modal-header">
          <span class="universo-modal-icon">${info.icono}</span>
          <div class="universo-modal-title">${info.label.replace('\n', ' ')}</div>
        </div>`;

      if (!data?.ok) {
        html += `<p class="universo-modal-empty">Sin datos disponibles.</p>`;
      } else if (nodoId === 'biblioteca') {
        const texto = data.datos?.contenido || '';
        if (texto) {
          html += `<p style="font-size:0.88rem;color:var(--text-secondary);line-height:1.7;white-space:pre-wrap;">${texto.slice(0, 400)}${texto.length > 400 ? '…' : ''}</p>`;
        } else {
          html += `<p class="universo-modal-empty">La biblioteca aún espera su primera carta.</p>`;
        }
      } else {
        const items = data.datos?.items || [];
        if (!items.length) {
          html += `<p class="universo-modal-empty">Aún no hay nada aquí. Pronto habrá algo.</p>`;
        } else {
          for (const item of items.slice(0, 6)) {
            const titulo  = item.titulo  || item.texto  || item.artista || item.nombre || item.mensaje || '—';
            const sub     = item.fecha   || item.frase  || item.hora_inicio || '';
            html += `<div class="universo-modal-item">
              <div class="universo-modal-item-title">${titulo}</div>
              ${sub ? `<div class="universo-modal-item-sub">${sub}</div>` : ''}
            </div>`;
          }
          if (items.length > 6) {
            html += `<p class="universo-modal-item-sub" style="text-align:center;padding-top:8px;">Y ${items.length - 6} más...</p>`;
          }
        }
      }

      if (destino) {
        html += `<button class="universo-modal-go-btn" onclick="UniversoModal.cerrar();navigateTo('${destino}')">Explorar → ${info.icono}</button>`;
      }

      this.modal.innerHTML = html;
    },

    cerrar() {
      if (this.overlay) this.overlay.classList.remove('open');
    }
  };

  /* ── SIGy en el universo ─────────────────────────────── */
  async function cargarMensajeSIGy() {
    try {
      const token = localStorage.getItem('siga_token') || '';
      const resp  = await fetch('/api/universo/sigy', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json();
      const burbuja = document.getElementById('universo-sigy-bubble');
      if (burbuja && data?.mensaje) {
        burbuja.textContent = data.mensaje;
        setTimeout(() => burbuja.classList.add('show'), 800);
        setTimeout(() => burbuja.classList.remove('show'), 7000);
      }
    } catch (_) {}
  }

  /* ── Eventos activos ─────────────────────────────────── */
  async function cargarEventos() {
    try {
      const token = localStorage.getItem('siga_token') || '';
      const resp  = await fetch('/api/universo/eventos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json();
      const strip = document.getElementById('universo-eventos-strip');
      if (!strip || !data?.eventos?.length) return;

      strip.innerHTML = '';
      for (const ev of data.eventos.slice(0, 4)) {
        const chip = document.createElement('div');
        chip.className = 'universo-evento-chip';
        chip.innerHTML = `<span>${ev.icono}</span> ${ev.titulo}`;
        strip.appendChild(chip);
      }
    } catch (_) {}
  }

  /* ── Barra de energía ────────────────────────────────── */
  function actualizarBarraEnergia(energia) {
    const fill = document.getElementById('universo-energia-fill');
    if (fill) fill.style.width = energia + '%';
  }

  /* ── Carga principal ─────────────────────────────────── */
  async function cargarUniverso() {
    const loading = document.getElementById('universo-loading');
    const wrapper = document.getElementById('universo-wrapper-inner');

    try {
      const token = localStorage.getItem('siga_token') || '';
      const resp  = await fetch('/api/universo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json();
      UNI.datos = data?.datos;

      if (loading)  loading.style.display = 'none';
      if (wrapper)  wrapper.style.display = 'flex';

      dibujarMapa(UNI.datos);
      actualizarBarraEnergia(UNI.datos?.nucleo?.energia ?? 0);
      await cargarEventos();
      setTimeout(cargarMensajeSIGy, 1200);

      UNI.loaded = true;

      // SIGy rota mensajes cada 45s
      UNI.sigyTimer = setInterval(cargarMensajeSIGy, 45000);

    } catch (err) {
      console.error('Universo carga error:', err);
      if (loading) loading.innerHTML = `<p style="color:var(--text-muted)">No se pudo cargar el universo.</p>`;
    }
  }

  /* ── Inicialización ──────────────────────────────────── */
  window.initUniverso = function () {
    if (UNI.raf) return; // ya iniciado

    setTimeout(() => {
      initCanvas();
      UniversoModal.init();
      cargarUniverso();
    }, 50);
  };

  window.destroyUniverso = function () {
    if (UNI.raf) {
      cancelAnimationFrame(UNI.raf);
      UNI.raf = null;
    }
    if (UNI.sigyTimer) {
      clearInterval(UNI.sigyTimer);
      UNI.sigyTimer = null;
    }
    UNI.loaded = false;
  };

  /* ── SIGy click manual ───────────────────────────────── */
  window.universoSIGyClick = function () {
    const burbuja = document.getElementById('universo-sigy-bubble');
    if (!burbuja) return;
    burbuja.classList.remove('show');
    setTimeout(() => cargarMensajeSIGy(), 100);
  };

})();
