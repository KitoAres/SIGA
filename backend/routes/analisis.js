const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const { requireAuth } = require('../middleware/auth');

// Catálogo de Tests con los 45 ítems completos
const testsDisponibles = {
    sternberg: {
        id: "sternberg",
        titulo: "Escala Triangular del Amor de Sternberg",
        descripcion: "Evalúa Intimidad, Pasión y Compromiso. Usa la escala del 1 (Nunca) al 5 (Siempre).",
        dimensiones: ["Intimidad", "Compromiso", "Pasión"],
        preguntas: [
            // --- INTIMIDAD (21 ítems) ---
            { id: 1, txt: "Tengo una relación cariñosa con mi pareja.", dim: "Intimidad" },
            { id: 2, txt: "Me comunico bien con mi pareja.", dim: "Intimidad" },
            { id: 3, txt: "Apoyo activamente el bienestar de mi pareja.", dim: "Intimidad" },
            { id: 4, txt: "Siento que mi pareja me comprende.", dim: "Intimidad" },
            { id: 5, txt: "Mi relación con mi pareja es muy romántica.", dim: "Intimidad" },
            { id: 6, txt: "Aun en los momentos en que resulta difícil tratar con mi pareja, permanezco comprometido(a) en la relación.", dim: "Intimidad" },
            { id: 7, txt: "Permanecería con mi pareja incluso en tiempos difíciles.", dim: "Intimidad" },
            { id: 8, txt: "Estoy seguro(a) de mi amor por mi pareja.", dim: "Intimidad" },
            { id: 9, txt: "Siento que realmente comprendo a mi pareja.", dim: "Intimidad" },
            { id: 10, txt: "Recibo mucho apoyo emocional de mi pareja.", dim: "Intimidad" },
            { id: 11, txt: "Puedo contar con mi pareja en momentos de dificultad.", dim: "Intimidad" },
            { id: 12, txt: "Tengo una relación agradable con mi pareja.", dim: "Intimidad" },
            { id: 13, txt: "Considero mi relación con mi pareja como una buena decisión.", dim: "Intimidad" },
            { id: 14, txt: "Mi pareja puede contar conmigo en momentos de dificultad.", dim: "Intimidad" },
            { id: 15, txt: "Me siento emocionalmente cercano(a) a mi pareja.", dim: "Intimidad" },
            { id: 16, txt: "Doy mucho apoyo emocional a mi pareja.", dim: "Intimidad" },
            { id: 17, txt: "Considero sólida mi relación con mi pareja.", dim: "Intimidad" },
            { id: 18, txt: "Siento que realmente puedo confiar en mi pareja.", dim: "Intimidad" },
            { id: 19, txt: "Comparto información muy personal con mi pareja.", dim: "Intimidad" },
            { id: 20, txt: "Confío en la estabilidad de mi relación con mi pareja.", dim: "Intimidad" },
            { id: 21, txt: "Valoro a mi pareja mucho dentro de mi vida.", dim: "Intimidad" },

            // --- COMPROMISO (15 ítems) ---
            { id: 22, txt: "Prefiero estar con mi pareja antes que con cualquier otra persona.", dim: "Compromiso" },
            { id: 23, txt: "No puedo imaginarme que otra persona pueda hacerme tan feliz como mi pareja.", dim: "Compromiso" },
            { id: 24, txt: "Planeo continuar mi relación con mi pareja.", dim: "Compromiso" },
            { id: 25, txt: "Siempre sentiré un gran compromiso hacia mi pareja.", dim: "Compromiso" },
            { id: 26, txt: "No hay nada más importante para mí, que mi relación con mi pareja.", dim: "Compromiso" },
            { id: 27, txt: "Estoy dispuesto a entregar y compartir mis bienes con mi pareja.", dim: "Compromiso" },
            { id: 28, txt: "No puedo imaginar la vida sin mi pareja.", dim: "Compromiso" },
            { id: 29, txt: "Sé que tengo que cuidar de mi pareja.", dim: "Compromiso" },
            { id: 30, txt: "Adoro a mi pareja.", dim: "Compromiso" },
            { id: 31, txt: "Espero que mi amor por mi pareja se mantenga durante el resto de mi vida.", dim: "Compromiso" },
            { id: 32, txt: "No puedo imaginar la ruptura de mi relación con mi pareja.", dim: "Compromiso" },
            { id: 33, txt: "Considero mi relación con mi pareja como permanente.", dim: "Compromiso" },
            { id: 34, txt: "No podría permitir que algo interfiera en mi compromiso con mi pareja.", dim: "Compromiso" },
            { id: 35, txt: "Siento sentido de responsabilidad hacia mi pareja.", dim: "Compromiso" },
            { id: 36, txt: "Debido a mi relación con mi pareja, no dejaría que otras personas interfirieran entre nosotros.", dim: "Compromiso" },

            // --- PASIÓN (9 ítems) ---
            { id: 37, txt: "Existe algo casi «mágico» en mi relación con mi pareja.", dim: "Pasión" },
            { id: 38, txt: "Idealizo a mi pareja.", dim: "Pasión" },
            { id: 39, txt: "Disfruto especialmente el contacto físico con mi pareja.", dim: "Pasión" },
            { id: 40, txt: "Cuando veo películas románticas o leo libros románticos pienso en mi pareja.", dim: "Pasión" },
            { id: 41, txt: "Me encuentro pensando en mi pareja frecuentemente en el día.", dim: "Pasión" },
            { id: 42, txt: "El solo hecho de ver a mi pareja me excita.", dim: "Pasión" },
            { id: 43, txt: "Fantaseo con mi pareja.", dim: "Pasión" },
            { id: 44, txt: "Mi relación con mi pareja es muy apasionada.", dim: "Pasión" },
            { id: 45, txt: "Encuentro a mi pareja muy atractivo(a).", dim: "Pasión" }
        ]
    }
};

// Obtener un test para mostrarlo en el frontend
router.get('/test/:id', (req, res) => {
    const test = testsDisponibles[req.params.id];
    if (test) res.json(test);
    else res.status(404).json({ error: "Test no encontrado" });
});

// Guardar resultados en BD (Usa el ID seguro del token)
router.post('/guardar', requireAuth, async (req, res) => {
    const { test_id, puntajes } = req.body;
    const usuario_id = req.user.id;
    try {
        const query = 'INSERT INTO siga_test_resultados (usuario_id, test_id, puntajes_json) VALUES ($1, $2, $3)';
        await db.query(query, [usuario_id, test_id, JSON.stringify(puntajes)]);
        res.json({ success: true, message: "Resultados guardados con éxito" });
    } catch (error) {
        console.error("Error al guardar test:", error);
        // AQUÍ ESTÁ EL CAMBIO: Ahora enviará el error real de PostgreSQL al frontend
        res.status(500).json({ error: error.message });
    }
});
// Obtener los datos de la pareja para que SiGy los analice
router.get('/conjunto/:test_id', requireAuth, async (req, res) => {
    const { test_id } = req.params;
    const usuario_id = req.user.id;
    try {
        const query = `
            SELECT usuario_id, puntajes_json, fecha 
            FROM siga_test_resultados 
            WHERE test_id = $1 
              AND (usuario_id = $2 OR usuario_id = (SELECT pareja_id FROM usuarios WHERE id = $2))
              AND id IN (
                  SELECT MAX(id) FROM siga_test_resultados GROUP BY usuario_id, test_id
              )
        `;
        const result = await db.query(query, [test_id, usuario_id]);
        const rows = result.rows ? result.rows : result[0];
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener análisis:", error);
        res.status(500).json({ error: "Error al cargar los datos conjuntos" });
    }
});

// Obtener mis resultados y validar fecha del último test
router.get('/mis-resultados/:test_id/:usuario_ignorado', requireAuth, async (req, res) => {
    const usuario_id = req.user.id;
    try {
        const query = `
            SELECT puntajes_json, fecha 
            FROM siga_test_resultados 
            WHERE test_id = $1 AND usuario_id = $2 
            ORDER BY fecha DESC LIMIT 1
        `;
        const result = await db.query(query, [req.params.test_id, usuario_id]);
        
        let row = null;
        if (result.rows && result.rows.length > 0) row = result.rows[0];
        else if (Array.isArray(result) && result[0].length > 0) row = result[0][0];

        if (row) {
            res.json(row);
        } else {
            res.json({ error: "No hay tests previos" });
        }
    } catch (error) {
        console.error("Error al obtener mis resultados:", error);
        res.status(500).json({ error: "Error en BD" });
    }
});

// Obtener el historial completo de tests para el panel de administración (Acceso total global)
router.get('/admin/historial', async (req, res) => {
    try {
        const query = `
            SELECT r.id, r.usuario_id, r.test_id, r.puntajes_json, r.fecha,
                   COALESCE(u.display_name, u.nombre, u.usuario, 'Usuario') AS usuario_nombre
            FROM siga_test_resultados r
            LEFT JOIN usuarios u ON u.id = r.usuario_id
            ORDER BY r.fecha DESC
        `;
        const result = await db.query(query);
        const rows = result.rows ? result.rows : result[0];
        res.json(rows);
    } catch (error) {
        console.error("Error al cargar historial admin:", error);
        res.status(500).json({ error: "Error al obtener los datos de administración." });
    }
});

module.exports = router;
