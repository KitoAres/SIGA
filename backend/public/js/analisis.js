let testActual = null;

// Extraemos el usuario y el token correctamente del sessionStorage
let usuarioLogueado = 'Franco';
try {
    const userObj = JSON.parse(sessionStorage.getItem('siga_user'));
    if (userObj && userObj.usuario) {
        usuarioLogueado = userObj.usuario;
    }
} catch(e) {
    console.warn("No se pudo parsear siga_user");
}

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
        const token = sessionStorage.getItem('siga_token');
        const res = await fetch(`/api/analisis/mis-resultados/${test_id}/${usuarioLogueado}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        // Si responde 401 o 500, capturamos el JSON sin romper la página
        const text = await res.text();
        let data = {};
        if (text) {
            data = JSON.parse(text);
        }

        if (!data.error && data.fecha) {
            const fechaUltimoTest = new Date(data.fecha);
            const fechaActual = new Date();
            const diasPasados = Math.floor((fechaActual - fechaUltimoTest) / (1000 * 60 * 60 * 24));

            if (diasPasados < 30) {
                alert(`Deben pasar al menos 30 días para volver a evaluar este constructo y evitar sesgos. Te faltan ${30 - diasPasados} días.`);
                return;
            }
        }
        
        iniciarTest(test_id);
    } catch (err) {
        console.error("Error validando test previo:", err);
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

// ── AQUÍ ESTÁ LA CORRECCIÓN PRINCIPAL (Detector de errores del servidor) ──
async function procesarTest() {
    const form = document.getElementById('formulario-test-activo');
    if(!form.checkValidity()) {
        alert("Por favor, responde todas las preguntas.");
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

    const token = sessionStorage.getItem('siga_token');

    try {
        const peticion = await fetch('/api/analisis/guardar', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ usuario: usuarioLogueado, test_id: testActual.id, puntajes })
        });

        const respuesta = await peticion.json();

        // Si el backend lanzó error (401, 500, etc.) lo mostramos en pantalla
        if (!peticion.ok || respuesta.error) {
            alert("Error del servidor: " + (respuesta.error || "No se pudo guardar en la BD."));
            return; 
        }

        // Si llegó hasta aquí, el guardado fue exitoso y real.
        alert("¡Test guardado en la BD! Tienes 30 días de cooldown.");
        cerrarTest();
        switchAnalisisTab('mis');

    } catch (error) {
        console.error(error);
        alert("Error de conexión: No se pudo contactar al servidor.");
    }
}

async function cargarMisResultados() {
    const container = document.getElementById('mis-resultados-container');
    if (!container) return;
    
    container.innerHTML = "<p>Procesando perfil individual...</p>";

    try {
        const token = sessionStorage.getItem('siga_token');
        const res = await fetch(`/api/analisis/mis-resultados/sternberg/${usuarioLogueado}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await res.json();

        if (data.error) {
            container.innerHTML = `<p>${data.error}</p>`;
            return;
        }

        const pts = typeof data.puntajes_json === 'string' ? JSON.parse(data.puntajes_json) : data.puntajes_json;
        const fecha = new Date(data.fecha).toLocaleDateString('es-BO');

        const obtenerAnalisisCualitativo = (dimension, valor) => {
            const val = parseFloat(valor);
            if (val < 2.50) {
                return {
                    rango: "Bajo",
                    color: "#ff6384",
                    desc: `Nivel crítico en ${dimension}. Indica un déficit percibido en este componente dentro de la dinámica actual. Se recomienda activar misiones específicas de aproximación para evitar el distanciamiento.`
                };
            } else if (val <= 3.90) {
                return {
                    rango: "Moderado",
                    color: "#ffca28",
                    desc: `Nivel estable en ${dimension}. El componente está presente de forma adaptativa, pero muestra vulnerabilidad frente a la habituación o la rutina de la convivencia. Conviene reforzar de forma deliberada.`
                };
            } else {
                return {
                    rango: "Alto",
                    color: "#22d3ee",
                    desc: `Nivel consolidado en ${dimension}. Representa una fortaleza actual en tu percepción de la relación. El objetivo aquí es mantener la tasa de reforzamiento positivo para preservar esta base.`
                };
            }
        };

        let bloquesHtml = `
            <h3 style="margin-bottom:5px;">Análisis de Perfil Individual</h3>
            <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom:20px;">Corte psicométrico: ${fecha}</p>
        `;

        for (let dim in pts) {
            const val = parseFloat(pts[dim]);
            const interpretacion = obtenerAnalisisCualitativo(dim, val);

            bloquesHtml += `
                <div class="card-siga" style="margin-bottom: 15px; padding: 15px; border-left: 4px solid ${interpretacion.color}; background: rgba(30, 20, 45, 0.4);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="font-size:1.05rem; color:#fff;">${dim}</strong>
                        <span style="color:${interpretacion.color}; font-weight:bold; font-size:1.1rem;">${val.toFixed(2)} / 5.00</span>
                    </div>
                    <div style="font-size:0.8rem; color:${interpretacion.color}; font-weight:500; margin-top:2px;">Estado: ${interpretacion.rango}</div>
                    <p style="font-size:0.85rem; color:#ddd; margin-top:8px; line-height:1.4;">${interpretacion.desc}</p>
                </div>
            `;
        }

        container.innerHTML = bloquesHtml;

    } catch (err) {
        console.error(err);
        container.innerHTML = "<p style='color:#ff6384;'>Error al procesar la matriz psicométrica individual.</p>";
    }
}

async function cargarNuestrosResultados() {
    try {
        const token = sessionStorage.getItem('siga_token');
        const res = await fetch(`/api/analisis/conjunto/sternberg`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
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
        const pts1 = typeof user1.puntajes_json === 'string' ? JSON.parse(user1.puntajes_json) : user1.puntajes_json;
        const pts2 = typeof user2.puntajes_json === 'string' ? JSON.parse(user2.puntajes_json) : user2.puntajes_json;

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
