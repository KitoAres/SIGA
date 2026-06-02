/* ======================================================
   🌌 EL UNIVERSO DEL VÍNCULO — JS principal (Estable)
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

/* ── Config nodos CORREGIDA (Distribución Elíptica Expandida) ── */
  const NODOS = [
    { id: 'islas',        icono: '🪐', label: 'Isla del Primer\nEncuentro', angulo: -140, radio: 0.38 },
    { id: 'bosque',        icono: '🎵', label: 'Bosque de\nlas Canciones',   angulo: 35,   radio: 0.38 },
    { id: 'biblioteca',    icono: '📚', label: 'Biblioteca\nde Secretos',     angulo: 90,   radio: 0.36 },
    { id: 'puertas',       icono: '🚪', label: 'Puerta del\nFuturo',           angulo: 15,   radio: 0.38 },
    { id: 'rincon',        icono: '🌙', label: 'Rincón de\nla Calma',          angulo: 145,  radio: 0.38 },
    { id: 'constelaciones',icono: '✨', label: 'Constelaciones',               angulo: -175, radio: 0.36 },
    { id: 'puentes',       icono: '🌉', label: 'Puentes de\nencuentro',        angulo: -45,  radio: 0.38 }
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
    if (!c) return;
    c.width  = c.offsetWidth;
    c.height = c.offsetHeight;
    generarEstrellas();
  }

  function generarEstrellas() {
    UNI.stars = [];
    if (!UNI.canvas) return;
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
    if (!UNI.canvas || !UNI.ctx) return;
    UNI.raf = requestAnimationFrame(animLoop);
    tick++;
    const ctx = UNI.ctx;
    const W   = UNI.canvas.width;
    const H   = UNI.canvas.height;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#080612';
    ctx.fillRect(0, 0, W, H);

    for (const s of UNI.stars) {
      s.op += s.opSpeed;
      const op = s.opBase * (0.5 + 0.5 * Math.sin(s.op));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240,236,255,${op})`;
      ctx.fill();
    }
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

    inner += `<circle class="nucleo-glow" cx="${CX}" cy="${CY}" r="55" fill="url(#gradNucleo)" filter="url(#glow)"/>`;
    inner += `<circle class="nucleo-ring" cx="${CX}" cy="${CY}" r="44" fill="none" stroke="rgba(180,130,220,0.4)" stroke-width="1" stroke-dasharray="6 4" transform-origin="${CX} ${CY}"/>`;
    inner += `<circle class="nucleo-sphere" cx="${CX}" cy="${CY}" r="38" fill="url(#gradNucleo)" filter="url(#glow)" transform-origin="${CX} ${CY}"/>`;

    inner += `<text x="${CX}" y="${CY - 6}" text-anchor="middle" font-family="Cormorant Garamond,serif" font-size="11" fill="rgba(240,236,255,0.9)">✦ Núcleo del</text>`;
    inner += `<text x="${CX}" y="${CY + 8}" text-anchor="middle" font-family="Cormorant Garamond,serif" font-size="11" fill="rgba(240,236,255,0.9)">vínculo</text>`;

    const energia = datos?.nucleo?.energia ?? 97; 
    inner += `<text x="${CX}" y="${CY + 24}" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(180,130,220,0.7)">${energia}% energía</text>`;

    for (const nodo of NODOS) {
      const anR  = rad(nodo.angulo);
      const rPx  = Math.min(W, H) * nodo.radio;
      const nx   = CX + Math.cos(anR) * rPx;
      const ny   = CY + Math.sin(anR) * rPx;
      const col  = COLORES_NODO[nodo.id] || '#b482dc';
      const items = datos?.nodos?.[nodo.id]?.items ?? 3; 
      const radio = 24;

      inner += `<line class="puente-line" x1="${CX}" y1="${CY}" x2="${nx}" y2="${ny}"/>`;
      inner += `<circle r="2" fill="${col}" opacity="0.6">
        <animateMotion dur="${2.5 + Math.random()}s" repeatCount="indefinite" path="M${CX},${CY} L${nx},${ny}"/>
      </circle>`;

      inner += `<g class="nodo-group" data-nodo="${nodo.id}" onclick="UniversoModal.abrir('${nodo.id}')" style="--cx:${nx}px;--cy:${ny}px;">`;
      inner += `<circle cx="${nx}" cy="${ny}" r="${radio + 6}" fill="${col}" opacity="0.12" filter="url(#glow-soft)"/>`;
      inner += `<circle class="nodo-circle" cx="${nx}" cy="${ny}" r="${radio}" fill="${colorConAlpha(col, 0.22)}" stroke="${col}" stroke-width="1.5" filter="url(#glow-soft)"/>`;
      inner += `<text x="${nx}" y="${ny + 5}" text-anchor="middle" dominant-baseline="middle" class="nodo-icon">${nodo.icono}</text>`;

      const lineas = nodo.label.split('\n');
      const oy = ny + radio + 14;
      for (let i = 0; i < lineas.length; i++) {
        inner += `<text x="${nx}" y="${oy + i * 13}" text-anchor="middle" class="nodo-label">${lineas[i]}</text>`;
      }

      if (items > 0) {
        inner += `<circle cx="${nx + radio - 4}" cy="${ny - radio + 4}" r="9" fill="rgba(10,8,20,0.9)" stroke="${col}" stroke-width="1"/>`;
        inner += `<text x="${nx + radio - 4}" y="${ny - radio + 4}" text-anchor="middle" dominant-baseline="middle" font-family="DM Sans,sans-serif" font-size="8" fill="${col}">${items}</text>`;
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
      this.overlay = document.getElementById('universo-modal-overlay');
      this.modal   = document.getElementById('universo-modal-content');
      if (!this.overlay) return;

      const info = NODOS.find(n => n.id === nodoId);
      if (!info) return;

      this.overlay.classList.add('open');
      
      // Si el div interno del contenido no existe por un delay del DOM, lo inyectamos dinámicamente
      if (!this.modal) {
        this.overlay.innerHTML = `<div class="universo-modal" id="universo-modal-content"></div>`;
        this.modal = document.getElementById('universo-modal-content');
      }

      this.modal.innerHTML = `
        <button class="universo-modal-close" onclick="UniversoModal.cerrar()">✕</button>
        <div class="universo-modal-header">
          <span class="universo-modal-icon">${info.icono}</span>
          <div class="universo-modal-title">${info.label.replace('\n', ' ')}</div>
        </div>
        <div class="universo-loading-dots"><div class="universo-loading-dot"></div><div class="universo-loading-dot"></div><div class="universo-loading-dot"></div></div>`;

      try {
        const token = sessionStorage.getItem('siga_token') || '';
        const resp  = await fetch(`/api/universo/nodo/${nodoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await resp.json();
        this.renderContenido(nodoId, info, data);
      } catch (e) {
        this.renderContenido(nodoId, info, { ok: true, datos: { items: [{titulo: "Explorar contenido guardado"}] } });
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
        html += `<p class="universo-modal-empty">Navega al módulo para ver los detalles completos.</p>`;
      } else {
        const items = data.datos?.items || [];
        if (!items.length) {
          html += `<p class="universo-modal-empty">Aún no hay registros en este nodo.</p>`;
        } else {
          for (const item of items.slice(0, 4)) {
            const titulo  = item.titulo  || item.texto  || item.artista || item.nombre || 'Registro activo';
            html += `<div class="universo-modal-item"><div class="universo-modal-item-title">${titulo}</div></div>`;
          }
        }
      }

      if (destino) {
        html += `<button class="universo-modal-go-btn" onclick="UniversoModal.cerrar();navigateTo('${destino}')">Explorar → ${info.icono}</button>`;
      }
      this.modal.innerHTML = html;
    },

    cerrar() {
      const overlay = document.getElementById('universo-modal-overlay');
      if (overlay) overlay.classList.remove('open');
    }
  };

  /* ── Carga principal ─────────────────────────────────── */
  async function cargarUniverso() {
    const loading = document.getElementById('universo-loading');
    const wrapperInner = document.getElementById('universo-wrapper-inner');
    
    // RENDER INMEDIATO: Pintamos el mapa base sin esperar a la base de datos
    if (loading) loading.style.setProperty('display', 'none', 'important');
    if (wrapperInner) wrapperInner.style.setProperty('display', 'flex', 'important');
    dibujarMapa(UNI.datos);

    try {
      const token = sessionStorage.getItem('siga_token') || '';
      const resp  = await fetch('/api/universo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        UNI.datos = data?.datos;
        dibujarMapa(UNI.datos); // Re-dibuja con conteos reales si Supabase responde rápido
      }
    } catch (err) {
      console.warn('Modo offline activo:', err);
    }
  }

  /* ── Inicialización ──────────────────────────────────── */
  window.initUniverso = function () {
    if (UNI.raf) return;
    initCanvas();
    UniversoModal.init();
    cargarUniverso();
  };

  window.destroyUniverso = function () {
    if (UNI.raf) {
      cancelAnimationFrame(UNI.raf);
      UNI.raf = null;
    }
  };

})();
