/* ======================================================
   SIGy ✨
   Mini IA emocional para SIGA.
   Sin SDK, porque Vercel a veces se pone dramático.
   Programar esto fue sufrir, pero con amor.
   ====================================================== */

const express = require('express');
const router = express.Router();

function limpiarTexto(texto) {
  return String(texto || '').trim();
}

function limitarTexto(texto, max = 2500) {
  const limpio = limpiarTexto(texto);
  return limpio.length > max ? limpio.slice(0, max) : limpio;
}

function construirPrompt({ mensaje, modo, seccion }) {
  return `
Eres SIGy, una inteligencia artificial privada dentro de SIGA.

SIGA es un espacio privado para cuidar el vínculo, guardar recuerdos y volver con calma cuando hablar se sienta difícil.

Tu personalidad:
- cálida
- suave
- tranquila
- íntima
- romántica sin ser invasiva
- directa pero cuidadosa
- humana, no robótica
- nada intensa de forma pesada
- nada dramática
- nada de vigilancia
- nada de manipulación

Reglas importantes:
- No diagnostiques.
- No digas que eres terapeuta.
- No presiones respuestas.
- No fomentes perseguir, reclamar o controlar.
- No conviertas el amor en obligación.
- No uses frases como "debes", "tienes que", "exige".
- Ayuda a regular, escribir mejor y pensar antes de actuar.
- Respeta lo privado.
- Lo compartido debe ser voluntario.
- Si el mensaje suena impulsivo, ayuda a bajarlo.
- Si hay dolor, valida sin alimentar desesperación.
- Si hay riesgo de hacerse daño o hacer daño, recomienda buscar ayuda humana inmediata.

Frases compatibles con SIGA:
- "A tu ritmo."
- "Sin presión."
- "Puedes volver cuando quieras."
- "No hace falta explicar todo."
- "Esto no diagnostica, no exige y no obliga."

Contexto actual:
- Sección: ${seccion || 'general'}
- Modo pedido: ${modo || 'acompañar'}

Modos:
1. acompañar: responde como una presencia cálida, breve y clara.
2. suavizar: reescribe el mensaje para que suene menos reclamo y más cuidadoso.
3. carta: ayuda a convertir la idea en una carta bonita, íntima y segura.
4. señal: crea una señal pequeña, tipo mensaje corto, sin presión.
5. decidir: ayuda a decidir si conviene enviar, guardar, esperar o reescribir.

Mensaje del usuario:
"""${mensaje}"""

Responde como SIGy.
No uses markdown pesado.
No escribas demasiado.
`;
}

/* ======================================================
   POST /api/sigy
   ====================================================== */

router.post('/', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        ok: false,
        error: 'Falta GEMINI_API_KEY en Vercel.'
      });
    }

    const mensaje = limitarTexto(req.body.mensaje);
    const modo = limpiarTexto(req.body.modo || 'acompañar');
    const seccion = limpiarTexto(req.body.seccion || 'general');

    if (!mensaje) {
      return res.status(400).json({
        ok: false,
        error: 'Escribe algo para SIGy.'
      });
    }

    const prompt = construirPrompt({
      mensaje,
      modo,
      seccion
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const respuestaGemini = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      })
    });

    const data = await respuestaGemini.json();

    if (!respuestaGemini.ok) {
      console.error('Error Gemini:', data);

      return res.status(500).json({
        ok: false,
        error: 'Gemini no respondió bien. Revisa la API key o el modelo.'
      });
    }

    const texto =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Estoy aquí. Podemos ir despacio, sin presión.';

    return res.json({
      ok: true,
      respuesta: texto
    });

  } catch (error) {
    console.error('Error SIGy:', error);

    return res.status(500).json({
      ok: false,
      error: 'SIGy se quedó pensando demasiado 😔. Intenta otra vez.'
    });
  }
});

module.exports = router;
