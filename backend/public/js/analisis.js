function switchAnalisisTab(tab) {
    // Apagar todos los tabs
    document.querySelectorAll('.tiempo-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tiempo-tab-content').forEach(c => c.classList.remove('active'));

    // Encender el seleccionado
    document.getElementById(`atab-${tab}`).classList.add('active');
    document.getElementById(`acontent-${tab}`).classList.add('active');

    if(tab === 'tests') cargarCatalogoTests();
    if(tab === 'mis') cargarMisResultados();
    if(tab === 'nuestros') cargarNuestrosResultados();
}

async function cargarCatalogoTests() {
    // Esto luego puede venir de un fetch a tu API, por ahora lo mockeamos para armar el UI
    const html = `
        <div class="stat-card" style="cursor:pointer;" onclick="iniciarTest('sternberg')">
            <div class="stat-icon">🔺</div>
            <div class="stat-label" style="font-size: 1.1rem; color: #fff;">Escala de Sternberg</div>
            <div style="font-size: 0.8rem; color: #aaa; margin-top:5px;">Mide Intimidad, Pasión y Compromiso.</div>
        </div>
    `;
    document.getElementById('lista-tests-disponibles').innerHTML = html;
}

async function iniciarTest(test_id) {
    document.getElementById('lista-tests-disponibles').style.display = 'none';
    document.getElementById('contenedor-hacer-test').style.display = 'block';
    
    // Aquí harás el fetch: const res = await fetch(`/api/analisis/test/${test_id}`);
    document.getElementById('titulo-test-activo').innerText = "Cargando test...";
    
    // Simulación del JSON de tu backend para que veas cómo pinta
    setTimeout(() => {
        document.getElementById('titulo-test-activo').innerText = "Escala Triangular de Sternberg";
        document.getElementById('desc-test-activo').innerText = "Del 1 al 9, evalúa cada afirmación con honestidad.";
        
        let formHtml = '';
        // Ejemplo con 2 ítems, el backend mandará los 45
        const mockPreguntas = [
            { id: 1, txt: "Sostengo activamente el bienestar de ella.", dim: "Compromiso" },
            { id: 2, txt: "El solo hecho de verla me excita.", dim: "Pasión" }
        ];

        mockPreguntas.forEach((p, i) => {
            formHtml += `
            <div style="margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
                <p style="margin-bottom: 8px;"><strong>${i+1}.</strong> ${p.txt}</p>
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    ${[1,2,3,4,5,6,7,8,9].map(n => 
                        `<label style="background:rgba(0,0,0,0.3); padding:5px 10px; border-radius:5px; cursor:pointer;">
                            <input type="radio" name="preg_${p.id}" value="${n}" data-dim="${p.dim}" required> ${n}
                        </label>`
                    ).join('')}
                </div>
            </div>`;
        });
        document.getElementById('formulario-test-activo').innerHTML = formHtml;
    }, 500);
}

function cerrarTest() {
    document.getElementById('contenedor-hacer-test').style.display = 'none';
    document.getElementById('lista-tests-disponibles').style.display = 'grid'; // asumiendo clase items-grid
}

async function procesarTest() {
    // Recolectar datos
    const inputs = document.querySelectorAll('#formulario-test-activo input[type="radio"]:checked');
    // Validación rápida
    // ...
    alert("Test guardado en la base de datos.");
    cerrarTest();
    switchAnalisisTab('nuestros'); // Saltar al análisis mágico de SiGy
}

function cargarMisResultados() {
    // Lógica para consultar tus scores individuales
}

function cargarNuestrosResultados() {
    // Lógica de Chart.js y generación del texto de SiGy 
    document.getElementById('sigy-diagnostico-box').innerHTML = `
        <p style="color:#fff;"><strong>Análisis de Vínculo:</strong></p>
        <p style="color:#ddd; margin-top:8px;">
            He analizado las métricas recientes. Identifico una fuerte carga compartida en <strong>Intimidad</strong>, lo que indica alta seguridad emocional base. 
            Sin embargo, hay una brecha de 2.5 puntos en la dimensión de <strong>Pasión</strong>. 
            <br><br>
            <strong>Misión sugerida por SIGy:</strong> Se asigna actividad de aproximación física libre de expectativas (Ej. Abrazos sostenidos de 1 min).
        </p>
    `;
}

// Cargar la vista inicial
document.addEventListener('DOMContentLoaded', () => {
    cargarCatalogoTests();
});
