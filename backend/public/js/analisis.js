let testActual = null;

// Control de Pestañas
function switchAnalisisTab(tab) {
    document.querySelectorAll('.tiempo-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tiempo-tab-content').forEach(c => c.classList.remove('active'));

    document.getElementById(`atab-${tab}`).classList.add('active');
    document.getElementById(`acontent-${tab}`).classList.add('active');

    if(tab === 'tests') cargarCatalogoTests();
    if(tab === 'nuestros') cargarNuestrosResultados();
}

// Pintar la tarjeta del test
function cargarCatalogoTests() {
    const html = `
        <div class="stat-card" style="cursor:pointer;" onclick="iniciarTest('sternberg')">
            <div class="stat-icon">🔺</div>
            <div class="stat-label" style="font-size: 1.1rem; color: #fff;">Escala de Sternberg</div>
            <div style="font-size: 0.8rem; color: #aaa; margin-top:5px;">Mide Intimidad, Pasión y Compromiso.</div>
        </div>
    `;
    document.getElementById('lista-tests-disponibles').innerHTML = html;
}

// Empezar el test
async function iniciarTest(test_id) {
    document.getElementById('lista-tests-disponibles').style.display = 'none';
    document.getElementById('contenedor-hacer-test').style.display = 'block';
    document.getElementById('titulo-test-activo').innerText = "Cargando test...";
    
    try {
        const res = await fetch(`/api/analisis/test/${test_id}`);
        testActual = await res.json();
        
        document.getElementById('titulo-test-activo').innerText = testActual.titulo;
        document.getElementById('desc-test-activo').innerText = testActual.descripcion;
        
        let formHtml = '';
        testActual.preguntas.forEach((p, i) => {
            formHtml += `
            <div style="margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
                <p style="margin-bottom: 8px;"><strong>${i+1}.</strong> ${p.txt}</p>
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    ${[1,2,3,4,5].map(n => 
                        `<label style="background:rgba(0,0,0,0.3); padding:5px 10px; border-radius:5px; cursor:pointer;">
                            <input type="radio" name="preg_${p.id}" value="${n}" data-dim="${p.dim}" required> ${n}
                        </label>`
                    ).join('')}
                </div>
            </div>`;
        });
        document.getElementById('formulario-test-activo').innerHTML = formHtml;
    } catch(err) {
        alert("Error al cargar el test.");
    }
}

function cerrarTest() {
    document.getElementById('contenedor-hacer-test').style.display = 'none';
    document.getElementById('lista-tests-disponibles').style.display = 'grid';
}

// Procesar y enviar
async function procesarTest() {
    const form = document.getElementById('formulario-test-activo');
    if(!form.checkValidity()) {
        alert("Por favor, responde todas las preguntas we.");
        return;
    }

    const puntajes = {};
    const conteo = {};
    
    testActual.dimensiones.forEach(d => { puntajes[d] = 0; conteo[d] = 0; });
    
    const inputs = form.querySelectorAll('input[type="radio"]:checked');
    inputs.forEach(input => {
        const dim = input.getAttribute('data-dim');
        puntajes[dim] += parseInt(input.value);
        conteo[dim]++;
    });

    for (let dim in puntajes) {
        puntajes[dim] = (puntajes[dim] / conteo[dim]).toFixed(2);
    }

    // Aquí saca el usuario activo real de tu app. Pongo tu nombre como default para la prueba.
    const usuarioLogueado = localStorage.getItem('siga_user') || 'Franco'; 

    await fetch('/api/analisis/guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: usuarioLogueado, test_id: testActual.id, puntajes })
    });

    alert("¡Test guardado en la BD! Vamos a ver qué dice SiGy.");
    cerrarTest();
    switchAnalisisTab('nuestros');
}

// El motor cognitivo-conductual de SiGy
async function cargarNuestrosResultados() {
    try {
        const res = await fetch(`/api/analisis/conjunto/sternberg`);
        const datos = await res.json();

        if(!datos || datos.length < 2) {
            document.getElementById('sigy-diagnostico-box').innerHTML = `
                <p style="color:#fff;"><strong>Análisis pendiente:</strong></p>
                <p style="color:#ddd;">SiGy necesita que ambos completen el test para evaluar la brecha conductual. Dile a tu pareja que lo llene.</p>
            `;
            return;
        }

        // Parsear JSONs
        const user1 = datos[0];
        const user2 = datos[1];
        const pts1 = JSON.parse(user1.puntajes_json);
        const pts2 = JSON.parse(user2.puntajes_json);

        // Lógica de brecha conductual
        let brechaPasion = Math.abs(pts1["Pasión"] - pts2["Pasión"]);
        let analisisSiGy = "Métricas estables. Sigan manteniendo las misiones actuales.";

        if(brechaPasion > 1.5) {
            analisisSiGy = `He detectado una discrepancia en la dimensión de Pasión. 
            <strong>Misión sugerida por SIGy:</strong> Se recomienda planear una actividad fuera de la rutina esta semana que no implique diálogo pesado, enfocada en la aproximación física o lúdica.`;
        }

        document.getElementById('sigy-diagnostico-box').innerHTML = `
            <p style="color:#fff;"><strong>Evaluación de SiGy:</strong></p>
            <p style="color:#ddd; margin-top:8px;">${analisisSiGy}</p>
            <hr style="border-color:#333; margin:15px 0;">
            <p style="font-size:0.8rem; color:#aaa;">Resultados crudos: <br>
            ${user1.usuario}: Intimidad (${pts1["Intimidad"]}), Pasión (${pts1["Pasión"]}), Compromiso (${pts1["Compromiso"]}) <br>
            ${user2.usuario}: Intimidad (${pts2["Intimidad"]}), Pasión (${pts2["Pasión"]}), Compromiso (${pts2["Compromiso"]})
            </p>
        `;
    } catch(err) {
        console.error(err);
    }
}

// Cargar la vista inicial
document.addEventListener('DOMContentLoaded', () => {
    cargarCatalogoTests();
});
