const express = require('express');
const router = express.Router();
const db = require('../config/db'); 

// Catálogo de Tests (Podemos agregar más después)
const testsDisponibles = {
    sternberg: {
        id: "sternberg",
        titulo: "Escala Triangular del Amor de Sternberg",
        descripcion: "Evalúa Intimidad, Pasión y Compromiso. Usa la escala del 1 (Nunca) al 5 (Siempre).",
        dimensiones: ["Intimidad", "Compromiso", "Pasión"],
        preguntas: [
            // Intimidad (Muestra de 3 ítems, luego le pegas los 21 completos)
            { id: 1, txt: "Tengo una relación cariñosa con ella/él.", dim: "Intimidad" },
            { id: 2, txt: "Me comunico bien con ella/él.", dim: "Intimidad" },
            { id: 3, txt: "Apoyo activamente el bienestar de ella/él.", dim: "Intimidad" },
            // Compromiso
            { id: 22, txt: "Prefiero estar con ella/él antes que con cualquier otra persona.", dim: "Compromiso" },
            { id: 23, txt: "No puedo imaginarme que otra persona pueda hacerme tan feliz.", dim: "Compromiso" },
            { id: 24, txt: "Planeo continuar mi relación.", dim: "Compromiso" },
            // Pasión
            { id: 37, txt: "Existe algo casi 'mágico' en mi relación.", dim: "Pasión" },
            { id: 38, txt: "Idealizo a mi pareja.", dim: "Pasión" },
            { id: 39, txt: "Disfruto especialmente el contacto físico.", dim: "Pasión" }
        ]
    }
};

// Obtener un test para mostrarlo en el frontend
router.get('/test/:id', (req, res) => {
    const test = testsDisponibles[req.params.id];
    if (test) res.json(test);
    else res.status(404).json({ error: "Test no encontrado" });
});

// Guardar resultados en BD
router.post('/guardar', async (req, res) => {
    const { usuario, test_id, puntajes } = req.body;
    try {
        const query = 'INSERT INTO siga_test_resultados (usuario, test_id, puntajes_json) VALUES ($1, $2, $3)';
        // Ojo: si usas MySQL cambia $1, $2, $3 por ?, ?, ?
        await db.query(query, [usuario, test_id, JSON.stringify(puntajes)]);
        res.json({ success: true, message: "Resultados guardados con éxito" });
    } catch (error) {
        console.error("Error al guardar test:", error);
        res.status(500).json({ error: "Error interno de base de datos" });
    }
});

// Obtener los datos de ambos para que SiGy los analice
router.get('/conjunto/:test_id', async (req, res) => {
    const { test_id } = req.params;
    try {
        // Trae el último test de cada usuario
        const query = `
            SELECT usuario, puntajes_json, fecha 
            FROM siga_test_resultados 
            WHERE test_id = $1 
            AND id IN (
                SELECT MAX(id) FROM siga_test_resultados GROUP BY usuario, test_id
            )
        `;
        const result = await db.query(query, [test_id]);
        // Adaptación dependiendo si db.query devuelve {rows: []} (Postgres) o [] (MySQL)
        const rows = result.rows ? result.rows : result[0];
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener análisis:", error);
        res.status(500).json({ error: "Error al cargar los datos conjuntos" });
    }
});

module.exports = router;
