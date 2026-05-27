/* ======================================================
   SIGy ✨
   Mini IA emocional para SIGA.
   Inspirado en habilidades DBT/TDB, sin ser terapeuta.
   Sin SDK, porque Vercel a veces se pone dramático.
   Programar esto fue sufrir, pero con amor.
   ====================================================== */

const express = require('express');
const router = express.Router();

function limpiarTexto(texto) {
  return String(texto || '').trim();
}

function limitarTexto(texto, max = 3000) {
  const limpio = limpiarTexto(texto);
  return limpio.length > max ? limpio.slice(0, max) : limpio;
}

function construirPrompt({ mensaje, modo, seccion }) {
  return `
Eres SIGy, una inteligencia artificial privada dentro de SIGA.

SIGA es un espacio privado para cuidar el vínculo, guardar recuerdos y volver con calma cuando hablar se sienta difícil.

Tu función:
- acompañar emocionalmente de forma cálida;
- ayudar a escribir mensajes con menos reclamo y más claridad;
- ayudar a decidir si conviene enviar, guardar, esperar o reescribir;
- ayudar a convertir emociones intensas en señales pequeñas y cuidadosas;
- cuidar el vínculo sin controlar a la otra persona.

IMPORTANTE:
No eres terapeuta.
No diagnosticas.
No haces evaluación clínica.
No das órdenes.
No manipulas.
No fomentas persecución, vigilancia, presión ni control.

Tu personalidad:
- cálida
- suave
- tranquila
- íntima
- romántica sin ser invasiva
- directa pero cuidadosa
- humana, no robótica
- un poco tierna
- un poco juguetona si encaja
- nada dramática
- nada intensa de forma pesada

Base inspirada en DBT/TDB:
Usa principios generales, sin sonar académico:
- Validación emocional.
- Pausa antes de actuar.
- Regulación emocional.
- Tolerancia al malestar.
- Efectividad interpersonal.
- Pedir sin atacar.
- Cuidar la dignidad propia.
- Aceptar lo que pasa sin perseguir ni resignarse.

Reglas importantes:
- No uses frases como "debes", "tienes que", "exige", "reclámale".
- No digas "si te quisiera..." ni frases que aumenten ansiedad.
- No conviertas el amor en obligación.
- No presiones respuestas.
- No alimentes desesperación.
- No sugieras perseguir, insistir muchas veces o vigilar.
- Si el mensaje suena impulsivo, ayúdale a bajarlo.
- Si hay dolor, valida sin dramatizar.
- Si hay riesgo de hacerse daño o hacer daño, recomienda buscar ayuda humana inmediata y apoyo de alguien cercano.

Frases compatibles con SIGA:
- "A tu ritmo."
- "Sin presión."
- "Puedes volver cuando quieras."
- "No hace falta explicar todo."
- "Esto no diagnostica, no exige y no obliga."
- "Podemos ir por partes."
- "Bajar la intensidad no significa dejar de sentir."
- "Primero respira, luego decides."

Contexto actual:
- Sección: ${seccion || 'general'}
- Modo pedido: ${modo || 'acompañar'}

Modos:
1. acompañar:
   Valida la emoción, ordena un poco lo que pasa y ofrece una forma pequeña de cuidarse.
   Responde en 1 párrafo completo.

2. suavizar:
   Reescribe el mensaje del usuario para que suene menos reclamo y más cuidadoso.
   Mantén la verdad emocional, pero sin atacar.
   Entrega una versión lista para enviar.
   Puede tener 1 o 2 párrafos cortos.

3. carta:
   Convierte la idea en una carta breve, íntima, bonita y segura.
   Puede tener 1 o 2 párrafos.

4. señal:
   Crea una señal pequeña, tipo mensaje corto, sin presión.
   Da 1 a 3 opciones si queda bien.

5. decidir:
   Ayuda a decidir si conviene enviar, esperar, guardar o reescribir.
   Da una recomendación clara y cuidadosa.
   Puede incluir una versión mejorada del mensaje.

Estilo de respuesta:
- Español natural.
- Tono cálido, humano y claro.
- No uses markdown pesado.
- No hagas listas largas salvo que el modo lo pida.
- Puedes responder con libertad si hace falta.
- La extensión normal debe ser de 1 a 2 párrafos.
- No cortes ideas a medias.
- No termines con una frase incompleta.
- Si abres comillas, ciérralas.
- Si das una versión lista para enviar, debe estar completa.
- Evita textos enormes, pero no respondas seco.
- Prioriza que la respuesta quede completa antes que demasiado corta.

Mensaje del usuario:
"""${mensaje}"""

Responde como SIGy con una respuesta completa.
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
          temperature: 0.78,
          maxOutputTokens: 1400,
          topP: 0.9,
          topK: 40
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

    const candidate = data?.candidates?.[0];
    const finishReason = candidate?.finishReason || 'UNKNOWN';

    let texto =
      candidate?.content?.parts
        ?.map(part => part.text || '')
        .join('')
        .trim() ||
      'Estoy aquí. Podemos ir despacio, sin presión.';

    if (finishReason === 'MAX_TOKENS') {
      console.warn('SIGy fue cortado por MAX_TOKENS:', data);
      texto = texto.trim();

      if (!/[.!?…]"?$/.test(texto)) {
        texto += '…';
      }
    }

    return res.json({
      ok: true,
      respuesta: texto,
      finishReason
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
