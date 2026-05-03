const API='/api';
let currentUser=null;
const $=id=>document.getElementById(id);
const moneyDate=d=>d?new Date(d).toLocaleString('es-BO',{dateStyle:'medium',timeStyle:'short'}):'Pendiente';

async function api(method,path,body){
  const res=await fetch(API+path,{method,headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
  const data=await res.json();
  if(!res.ok) throw new Error(data.error||'Error');
  return data;
}
function openModal(id){$(id).classList.add('open')}
function closeModals(){document.querySelectorAll('.modal').forEach(m=>m.classList.remove('open'))}
window.openModal=openModal;window.closeModals=closeModals;

document.querySelectorAll('[data-nav]').forEach(a=>a.addEventListener('click',()=>navigate(a.dataset.nav)));
function navigate(sec){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('nav a').forEach(a=>a.classList.remove('active'));
  $('sec-'+sec).classList.add('active');
  document.querySelector(`[data-nav="${sec}"]`)?.classList.add('active');
  loaders[sec]?.();
}

$('login-form').addEventListener('submit',async e=>{
  e.preventDefault();
  try{
    const data=await api('POST','/auth/login',{usuario:$('login-user').value,contrasena:$('login-pass').value});
    currentUser=data.user;
    $('login-screen').style.display='none';$('sidebar').style.display='flex';$('main').style.display='block';
    $('user-name').textContent=currentUser.nombre;$('user-role').textContent=currentUser.rol;
    navigate('dashboard');
  }catch(err){$('login-alert').textContent=err.message}
});
$('logout').addEventListener('click',()=>location.reload());

async function loadDashboard(){
  const d=await api('GET','/dashboard');
  $('stat-recuerdos').textContent=d.recuerdos;$('stat-citas').textContent=d.citas;$('stat-canciones').textContent=d.canciones;$('stat-razones').textContent=d.razones;$('stat-promesas').textContent=d.promesas;
  $('dash-proximas').innerHTML=d.proximas.map(c=>`<div class="item"><h3>${c.titulo}</h3><span class="badge">${c.estado}</span><p>${moneyDate(c.fecha)}</p><p>${c.descripcion||''}</p></div>`).join('')||'<p class="mini">Aún no hay citas pendientes.</p>';
}
async function loadRecuerdos(){
  const rows=await api('GET','/recuerdos');
  $('recuerdos-list').innerHTML=rows.map(r=>`<div class="item"><h3>${r.titulo}</h3><span class="badge">${r.sentimiento||'recuerdo'}</span><p>${r.descripcion}</p><p class="mini">${r.lugar||''} ${r.fecha?'- '+new Date(r.fecha).toLocaleDateString('es-BO'):''}</p></div>`).join('');
}
async function loadCitas(){
  const rows=await api('GET','/citas');
  $('citas-list').innerHTML=rows.map(c=>`<div class="item"><h3>${c.titulo}</h3><span class="badge">${c.estado}</span><p>${moneyDate(c.fecha)}</p><p>${c.descripcion||''}</p></div>`).join('');
}
async function loadPlaylist(){
  const rows=await api('GET','/playlist');
  $('playlist-list').innerHTML=rows.map(p=>`<div class="item"><h3>${p.titulo}</h3><span class="badge">${p.artista||'canción'}</span><p>${p.motivo||''}</p>${p.enlace?`<a href="${p.enlace}" target="_blank">Abrir canción</a>`:''}</div>`).join('');
}
async function loadRazones(){
  const rows=await api('GET','/razones');
  $('razones-list').innerHTML=rows.map((r,i)=>`<div class="item"><span class="badge">Razón ${i+1}</span><p>${r.texto}</p></div>`).join('');
}
async function loadPromesas(){
  const rows=await api('GET','/promesas');
  $('promesas-list').innerHTML=rows.map(p=>`<div class="item"><span class="badge">${p.estado}</span><p>${p.texto}</p></div>`).join('');
}
async function loadCarta(){
  const rows=await api('GET','/cartas');
  $('carta-box').innerHTML=rows.map(c=>`<h2>${c.titulo}</h2><p>${c.contenido}</p>`).join('');
}
function loadFinal(){}
const loaders={dashboard:loadDashboard,recuerdos:loadRecuerdos,citas:loadCitas,playlist:loadPlaylist,razones:loadRazones,promesas:loadPromesas,carta:loadCarta,final:loadFinal};

$('form-recuerdo').addEventListener('submit',async e=>{e.preventDefault();await api('POST','/recuerdos',{titulo:$('r-titulo').value,fecha:$('r-fecha').value||null,lugar:$('r-lugar').value,descripcion:$('r-desc').value,sentimiento:$('r-sent').value});closeModals();loadRecuerdos();});
$('form-cita').addEventListener('submit',async e=>{e.preventDefault();await api('POST','/citas',{titulo:$('c-titulo').value,lugar:$('c-lugar').value,fecha:$('c-fecha').value?$('c-fecha').value.replace('T',' '):null,descripcion:$('c-desc').value});closeModals();loadCitas();});
$('form-cancion').addEventListener('submit',async e=>{e.preventDefault();await api('POST','/playlist',{titulo:$('p-titulo').value,artista:$('p-artista').value,enlace:$('p-link').value,motivo:$('p-motivo').value});closeModals();loadPlaylist();});
$('form-razon').addEventListener('submit',async e=>{e.preventDefault();await api('POST','/razones',{texto:$('z-texto').value});closeModals();loadRazones();});
$('form-promesa').addEventListener('submit',async e=>{e.preventDefault();await api('POST','/promesas',{texto:$('m-texto').value});closeModals();loadPromesas();});

$('btn-prohibido')?.addEventListener('click',()=>{$('prohibido-msg').textContent='Sabía que lo ibas a presionar. Por eso preparé esto para ti. Te amo.'});
const noBtn=$('no-btn');
noBtn?.addEventListener('mouseenter',()=>{noBtn.style.transform=`translate(${Math.random()*180-90}px,${Math.random()*120-60}px)`});
window.finalSi=()=>{$('final-msg').textContent='Entonces prometo seguir eligiéndote, incluso en los días difíciles. 💙'};
