/* ======================================================
   SIGA — utils/nivel.js
   Fuente única de verdad para el sistema de niveles.
   Importar desde aquí, nunca redefinir en otro archivo.
   ====================================================== */

function calcularNivelRelacion(total) {
  const niveles = [
    { nivel: 1, nombre: 'Primeros destellos',  minimo: 0,    siguiente: 100,  emoji: '✨' },
    { nivel: 2, nombre: 'Coincidencia bonita', minimo: 100,  siguiente: 250,  emoji: '💫' },
    { nivel: 3, nombre: 'Ritmo propio',         minimo: 250,  siguiente: 500,  emoji: '🌙' },
    { nivel: 4, nombre: 'Cuidado mutuo',        minimo: 500,  siguiente: 850,  emoji: '💜' },
    { nivel: 5, nombre: 'Historia compartida',  minimo: 850,  siguiente: 1300, emoji: '📖' },
    { nivel: 6, nombre: 'Vínculo fuerte',       minimo: 1300, siguiente: 2000, emoji: '🏆' },
    { nivel: 7, nombre: 'Modo legendario',      minimo: 2000, siguiente: 3000, emoji: '👑' },
    { nivel: 8, nombre: 'Universo propio',      minimo: 3000, siguiente: null, emoji: '🌌' }
  ];

  let actual = niveles[0];
  for (const n of niveles) {
    if (total >= n.minimo) actual = n;
  }

  const faltan = actual.siguiente ? Math.max(actual.siguiente - total, 0) : 0;
  const progreso = actual.siguiente
    ? Math.min(Math.round(((total - actual.minimo) / (actual.siguiente - actual.minimo)) * 100), 100)
    : 100;

  return { ...actual, total, faltan, progreso };
}

module.exports = { calcularNivelRelacion };
