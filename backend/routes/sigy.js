/* ======================================================
   SIGy ✨
   Mini IA emocional para SIGA.
   No diagnostica, no presiona, no controla.
   Solo acompaña con calma.
   ====================================================== */

const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

function limpiarTexto(texto) {
  return String(texto || '').trim();
}

function limitarTexto(texto, max = 2000) {
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

Formas de responder según el modo:
1. acompañar:
   Responde como una presencia cálida, breve y clara.

2. suavizar:
   Reescribe el mensaje para que suene menos reclamo, menos intenso y más cuidadoso.

3. carta:
   Ayuda a convertir la idea en una carta bonita, íntima y segura.

4. señal:
   Crea una señal pequeña, tipo mensaje corto, sin presión.

5. decidir:
   Ayuda a decidir si conviene enviar, guardar, esperar o reescribir.

Mensaje del usuario:
"""${mensaje}"""

Responde como SIGy.
No uses markdown pesado.
No escribas demasiado.
`;
}

/* ======================================================
   POST /api/sigy
   Body:
   {
     "mensaje": "texto",
     "modo": "acompañar | suavizar | carta | señal | decidir",
     "seccion": "dashboard | carta | tiempo | espacio | etc"
   }
   ====================================================== */

router.post('/', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        ok: false,
        error: 'Falta GEMINI_API_KEY en variables de entorno.'
      });
    }

    const mensaje = limitarTexto(req.body.mensaje, 2500);
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    const respuesta = limpiarTexto(response.text);

    return res.json({
      ok: true,
      respuesta: respuesta || 'Estoy aquí. Podemos ir despacio, sin presión.'
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
