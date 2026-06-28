/* SIGA — puntos.js: actualiza el dashboard con puntos globales */
(function(){
  function $(id){return document.getElementById(id)}
  
  async function cargarProgresoGlobal(){
    try{
      // CORRECCIÓN: Usamos la función api() para inyectar las cabeceras de autorización 
      // y apuntamos a la ruta real unificada en el backend (/api/eventos/progreso)
      const data = await api('GET', '/api/eventos/progreso?x=' + Date.now());
      
      if(!data || data.error) return;
      
      const n = data.nivel || {};
      
      if($('misiones-puntos-total')) $('misiones-puntos-total').textContent = data.puntos || 0;
      if($('misiones-nivel-nombre')) $('misiones-nivel-nombre').textContent = `${n.emoji || '🏆'} Nivel ${n.nivel || 1} — ${n.nombre || 'Primeros destellos'}`;
      if($('misiones-nivel-texto'))  $('misiones-nivel-texto').textContent  = `${data.completadas || 0} acciones sumaron puntos · ${data.hoy || 0} hoy`;
      if($('misiones-progress-bar')) $('misiones-progress-bar').style.width = `${n.progreso || 0}%`;
      
      if($('misiones-progreso-detalle')) {
        $('misiones-progreso-detalle').textContent = n.siguiente 
          ? `${data.puntos || 0} / ${n.siguiente} pts · faltan ${n.faltan || 0}` 
          : `${data.puntos || 0} pts · nivel máximo simbólico`;
      }
    } catch(e) {
      console.warn('No se pudo cargar puntos globales', e);
    }
  }
  
  function enganchar(){
    if(typeof window.loadDashboard === 'function' && !window.loadDashboard.__puntosGlobales){
      const old = window.loadDashboard;
      const nuevo = async function(){
        await old.apply(this, arguments); 
        await cargarProgresoGlobal();
      };
      nuevo.__puntosGlobales = true; 
      window.loadDashboard = nuevo;
    }
  }
  
  window.cargarProgresoGlobal = cargarProgresoGlobal;
  
  document.addEventListener('DOMContentLoaded', () => {
    enganchar();
    setTimeout(cargarProgresoGlobal, 500);
  });
  
  setTimeout(() => {
    enganchar();
    cargarProgresoGlobal();
  }, 1200);
})();
