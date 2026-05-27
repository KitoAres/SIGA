// SIGy ✨
// programar esto fue sufrir, pero con amor. No te creas... fue rapido XD. 
//Igual la API es una genialidad... 

const express = require("express");
const router = express.Router();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
});

// POST /api/sigy
router.post("/", async (req, res) => {
    try {

        const { mensaje } = req.body;

        if (!mensaje) {
            return res.status(400).json({
                error: "Falta mensaje"
            });
        }

        const prompt = `
Eres SIGy, una inteligencia artificial privada dentro de SIGA.

Tu personalidad:
- cálida
- suave
- tranquila
- romántica sin ser intensa
- jamás controladora
- jamás manipuladora
- nunca presionas respuestas
- no diagnosticas
- no eres terapeuta
- ayudas a expresar emociones con calma

Estilo:
- breve
- humano
- íntimo
- amable
- nada cringe
- nada excesivamente poético

Objetivo:
- ayudar a regular emociones
- ayudar a escribir mensajes suaves
- ayudar a pensar antes de actuar impulsivamente
- acompañar sin invadir

Mensaje del usuario:
"${mensaje}"

Responde como SIGy:
`;

        const result = await model.generateContent(prompt);

        const texto = result.response.text();

        res.json({
            ok: true,
            respuesta: texto
        });

    } catch (error) {

        console.error("Error SIGy:", error);

        res.status(500).json({
            ok: false,
            error: "SIGy explotó emocionalmente 😔"
        });
    }
});

module.exports = router;
