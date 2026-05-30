let testActual = null;
const usuarioLogueado = localStorage.getItem('siga_user') || 'Franco'; // O 'Francin', depende tu auth

function switchAnalisisTab(tab) {
    document.querySelectorAll('.tiempo-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tiempo-tab-content').forEach(c => c.classList.remove('active'));

    document.getElementById(`atab-${tab}`).classList.add('active');
    document.getElementById(`acontent-${tab}`).classList.add('active');

    if(tab === 'tests') cargarCatalogoTests();
    if(tab === 'mis') cargarMisResultados();
    if(tab === 'nuestros') cargarNuestrosResultados();
}

function cargarCatalogoTests() {
    const html = `
        <div class="stat-card" style="cursor:pointer;" onclick="validarYEmpezarTest('sternberg')">
            <div class="stat-icon">🔺</div>
            <div class="stat-label" style="font-size: 1.1rem; color: #fff;">Escala de Sternberg</div>
            <div style="font-size: 0.8rem; color: #aaa; margin-top:5px;">Mide Intimidad, Pasión y Compromiso.</div>
        </div>
    `;
    document.getElementById('lista-tests-disponibles').innerHTML = html;
}

// Validación de los 30 días
async function validarYEmpezarTest(test_id) {
    try {
        const res = await fetch(`/api/analisis/mis-resultados/${test_id}/${usuarioLogueado}`);
        const data = await res.json();

        if (!data.error) {
            const fechaUltimoTest = new Date(data.fecha);
            const fechaActual = new Date();
            const diasPasados = Math.floor((fechaActual - fechaUltimoTest) / (1000 * 60 * 60 * 24));

            if (diasPasados < 30) {
                alert(`Deben pasar al menos 30 días para volver a evaluar este constructo y evitar sesgos. Te faltan ${30 - diasPasados} días we.`);
                return;
            }
        }
        
        iniciarTest(test_id);
    } catch (err) {
        console.error(err);
        iniciarTest(test_id); // Si falla la red, igual lo dejamos pasar
    }
}

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

    await fetch('/api/analisis/guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: usuarioLogueado, test_id: testActual.id, puntajes })
    });

    alert("¡Test guardado en la BD! Tienes 30 días de cooldown.");
    cerrarTest();
    switchAnalisisTab('mis');
}

// Nueva función: Muestra los resultados individuales
async function cargarMisResultados() {
    const container = document.getElementById('mis-resultados-container');
    container.innerHTML = "<p>Cargando métricas...</p>";

    try {
        const res = await fetch(`/api/analisis/mis-resultados/sternberg/${usuarioLogueado}`);
        const data = await res.json();

        if (data.error) {
            container.innerHTML = "<p>Aún no has completado este test.</p>";
            return;
        }

        const pts = JSON.parse(data.puntajes_json);
        const fecha = new Date(data.fecha).toLocaleDateString();

        container.innerHTML = `
            <h3>Tus resultados de Sternberg</h3>
            <p style="color:#aaa; font-size:0.8rem; margin-bottom:15px;">Última evaluación: ${fecha}</p>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; background:rgba(0,0,0,0.3); padding:10px; border-radius:5px;">
                <span><strong>Intimidad:</strong> Mide la cercanía y confianza.</span>
                <span style="color:#22d3ee; font-weight:bold;">${pts.Intimidad} / 5</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; background:rgba(0,0,0,0.3); padding:10px; border-radius:5px;">
                <span><strong>Pasión:</strong> Mide la atracción física y romántica.</span>
                <span style="color:#ff6384; font-weight:bold;">${pts.Pasión} / 5</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; background:rgba(0,0,0,0.3); padding:10px; border-radius:5px;">
                <span><strong>Compromiso:</strong> Mide la decisión de mantener la relación.</span>
                <span style="color:#6b2a8a; font-weight:bold;">${pts.Compromiso} / 5</span>
            </div>
        `;
    } catch (err) {
        container.innerHTML = "<p>Error al cargar resultados.</p>";
    }
}

async function cargarNuestrosResultados() {
    try {
        const res = await fetch(`/api/analisis/conjunto/sternberg`);
        const datos = await res.json();

        if(!datos || datos.length < 2) {
            document.getElementById('sigy-diagnostico-box').innerHTML = `
                <p style="color:#fff;"><strong>Análisis pendiente:</strong></p>
                <p style="color:#ddd;">SiGy necesita que ambos completen el test para evaluar la brecha conductual.</p>
            `;
            return;
        }

        const user1 = datos[0];
        const user2 = datos[1];
        const pts1 = JSON.parse(user1.puntajes_json);
        const pts2 = JSON.parse(user2.puntajes_json);

        let brechaPasion = Math.abs(pts1["Pasión"] - pts2["Pasión"]);
        let analisisSiGy = "Métricas estables. El vínculo muestra simetría, sigan manteniendo las misiones actuales.";

        if(brechaPasion > 1.5) {
            analisisSiGy = `He detectado una discrepancia en la dimensión de Pasión. 
            <strong>Misión sugerida por SIGy:</strong> Se recomienda planear una actividad fuera de la rutina esta semana que no implique diálogo pesado, enfocada en la aproximación física o lúdica.`;
        }

        document.getElementById('sigy-diagnostico-box').innerHTML = `
            <p style="color:#fff;"><strong>Evaluación de SiGy:</strong></p>
            <p style="color:#ddd; margin-top:8px;">${analisisSiGy}</p>
        `;
    } catch(err) {
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarCatalogoTests();
});
