require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function streamSSE(res, system, userContent, apiKey) {
  const client = new Anthropic({ apiKey: apiKey || process.env.ANTHROPIC_API_KEY });
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  try {
    const stream = client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 2500,
      system,
      messages: [{ role: 'user', content: userContent }],
    });
    stream.on('text', (text) => {
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    });
    await stream.finalMessage();
    res.write('data: [DONE]\n\n');
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
  } finally {
    res.end();
  }
}

const BASE_SYSTEM = `Eres un experto en marketing digital, ofertas digitales y negocios online.
Tu misión es ayudar a emprendedores a crear ofertas rentables paso a paso.
Responde SIEMPRE en español. Usa markdown con ## headers, listas con -, negritas y emojis para hacer las respuestas claras y visuales.`;

// ── PASO 1: IDEA ──────────────────────────────────────────────────────────────
app.post('/api/idea', async (req, res) => {
  const { idea } = req.body;
  const apiKey = req.headers['x-api-key'];
  await streamSSE(res, BASE_SYSTEM, `Analiza esta idea de negocio y ayúdame a validarla y refinarla:

"${idea}"

Responde con estas secciones:

## 💡 Validación
¿Es viable y rentable? ¿Cuál es el nivel de oportunidad?

## ✨ Idea Refinada
Versión mejorada, más específica y con mayor potencial

## 🎯 Potencial de Mercado
Tamaño del mercado y tendencias actuales

## 🏆 Ventaja Competitiva
Qué puede hacer única y diferente esta oferta

## 💰 Modelos de Monetización
3 formas concretas de generar ingresos con esta idea`, apiKey);
});

// ── PASO 2: AUDIENCIA ─────────────────────────────────────────────────────────
app.post('/api/audiencia', async (req, res) => {
  const { idea, ideaAnalisis } = req.body;
  const apiKey = req.headers['x-api-key'];
  await streamSSE(res, BASE_SYSTEM, `Define el cliente ideal para esta oferta:

**Idea:** ${idea}
**Análisis:** ${ideaAnalisis}

## 👤 Perfil Demográfico
Edad, género, ocupación, ingresos, ubicación

## 🧠 Perfil Psicográfico
Valores, creencias, aspiraciones, estilo de vida

## 😰 Los 5 Grandes Dolores
Sus principales frustraciones (muy específico, en sus propias palabras)

## 🌟 Deseos y Sueños
Qué quiere lograr, su vida ideal

## 🔍 Comportamiento de Compra
Dónde busca soluciones, qué lo motiva a comprar, objeciones frecuentes

## 💬 Frases que Diría
5 frases textuales en primera persona que diría este avatar

## 🎯 Nombre del Avatar
Nombre + descripción de su situación actual en 2-3 oraciones`, apiKey);
});

// ── PASO 3: PROMESA ───────────────────────────────────────────────────────────
app.post('/api/promesa', async (req, res) => {
  const { idea, audiencia } = req.body;
  const apiKey = req.headers['x-api-key'];
  await streamSSE(res, BASE_SYSTEM, `Crea la promesa central de transformación para:

**Idea:** ${idea}
**Cliente Ideal:** ${audiencia}

## 🔥 La Gran Promesa
La transformación principal: resultado específico + tiempo estimado

## 📝 5 Headlines Poderosos
Titulares irresistibles orientados a resultados

## 🎯 Declaración de Posicionamiento
Completa: "Para [avatar] que [problema], [producto] es [categoría] que [beneficio único], a diferencia de [alternativa]"

## 💎 Propuesta de Valor Única
En 1 sola oración poderosa por qué elegirían TU oferta

## 🚀 Antes y Después
Estado actual (antes) → Estado transformado (después) con detalles específicos

## 🏷️ 5 Nombres para el Producto
Nombres creativos, memorables y que comunican el resultado`, apiKey);
});

// ── PASO 4: PRODUCTO ──────────────────────────────────────────────────────────
app.post('/api/producto', async (req, res) => {
  const { idea, audiencia, promesa } = req.body;
  const apiKey = req.headers['x-api-key'];
  await streamSSE(res, BASE_SYSTEM, `Estructura la oferta digital completa:

**Idea:** ${idea}
**Cliente:** ${audiencia}
**Promesa:** ${promesa}

## 📦 Producto Principal
Tipo (curso/membresía/consultoría/etc.) + módulos y contenidos específicos

## 🎁 Stack de Bonos
4-5 bonos irresistibles con valor percibido de cada uno y por qué se incluyen

## 💰 Estrategia de Precios
- Precio recomendado y justificación
- Valor total del stack (vs. precio)
- Opciones de pago
- Upsell y downsell sugeridos

## 🛡️ Garantía
Tipo de garantía que elimina el riesgo del comprador

## ⚡ Escasez y Urgencia
Elementos reales para crear urgencia

## 🗺️ Hoja de Ruta del Cliente
Pasos desde la compra hasta lograr el resultado prometido`, apiKey);
});

// ── GENERACIÓN: ANUNCIOS ──────────────────────────────────────────────────────
app.post('/api/generar/anuncios', async (req, res) => {
  const { idea, audiencia, promesa, producto } = req.body;
  const apiKey = req.headers['x-api-key'];
  await streamSSE(res, BASE_SYSTEM, `Crea anuncios de alta conversión para:

**Oferta:** ${idea} | **Cliente:** ${audiencia} | **Promesa:** ${promesa} | **Producto:** ${producto}

## 📱 Anuncio #1 — El Problema (Facebook/Instagram)
Gancho + agitación del problema + solución + CTA. Incluye texto principal, headline y descripción.

## 📱 Anuncio #2 — La Transformación
Antes/después, resultado real, CTA urgente. Texto completo.

## 📱 Anuncio #3 — Oferta Directa
Escasez, precio, valor, CTA inmediato. Texto completo.

## 🎥 Script Video 60 segundos
Guión completo para Reels/TikTok/YouTube Shorts con instrucciones de producción

## 📊 Segmentación Sugerida
Audiencias específicas, intereses y comportamientos para Meta Ads`, apiKey);
});

// ── GENERACIÓN: PÁGINA DE VENTAS ──────────────────────────────────────────────
app.post('/api/generar/pagina', async (req, res) => {
  const { idea, audiencia, promesa, producto } = req.body;
  const apiKey = req.headers['x-api-key'];
  await streamSSE(res, BASE_SYSTEM, `Escribe el copy completo de una página de ventas de alta conversión:

**Oferta:** ${idea} | **Cliente:** ${audiencia} | **Promesa:** ${promesa} | **Producto:** ${producto}

## 🎯 HEADLINE PRINCIPAL
El más poderoso, orientado al resultado

## 📣 SUBHEADLINE
Amplía y complementa el headline

## 😰 EL PROBLEMA
Agita el dolor del cliente ideal (3-4 párrafos que generan identificación)

## 💡 LA SOLUCIÓN
Presenta el producto como la única salida lógica

## 📦 QUÉ INCLUYE
Lista detallada con valores y descripción de cada elemento

## 🌟 TESTIMONIOS
3 testimonios realistas con nombre, resultado específico y transformación

## 👤 SOBRE EL AUTOR
Bio de autoridad creíble y conectada con el cliente (plantilla)

## 💰 PRECIO Y OFERTA
Presentación del precio con comparación de valor y justificación

## 🛡️ GARANTÍA
Copy completo de la garantía que elimina toda fricción

## ❓ PREGUNTAS FRECUENTES
5 preguntas que eliminan las objeciones principales

## 🚀 CIERRE Y CTA FINAL
Párrafo de cierre emocional + llamada a la acción irresistible`, apiKey);
});

// ── GENERACIÓN: EMAILS ────────────────────────────────────────────────────────
app.post('/api/generar/emails', async (req, res) => {
  const { idea, audiencia, promesa, producto } = req.body;
  const apiKey = req.headers['x-api-key'];
  await streamSSE(res, BASE_SYSTEM, `Crea una secuencia de 5 emails de bienvenida y ventas:

**Oferta:** ${idea} | **Cliente:** ${audiencia} | **Promesa:** ${promesa} | **Producto:** ${producto}

## 📧 EMAIL 1 — Bienvenida (Día 0)
Asunto + cuerpo completo. Entrega el lead magnet, genera confianza, fija expectativas.

## 📧 EMAIL 2 — Historia y Conexión (Día 1)
Asunto + historia que conecta profundamente con el dolor del cliente.

## 📧 EMAIL 3 — La Solución (Día 2)
Asunto + presentación de la solución con prueba de concepto y valor.

## 📧 EMAIL 4 — Oferta Directa (Día 3)
Asunto + presentación completa de la oferta con precio, bonos y garantía.

## 📧 EMAIL 5 — Urgencia y Cierre (Día 4)
Asunto + urgencia genuina, objeciones finales y último llamado a la acción.`, apiKey);
});

// ── GENERACIÓN: POSTS SOCIALES ────────────────────────────────────────────────
app.post('/api/generar/posts', async (req, res) => {
  const { idea, audiencia, promesa, producto } = req.body;
  const apiKey = req.headers['x-api-key'];
  await streamSSE(res, BASE_SYSTEM, `Crea contenido completo para redes sociales:

**Oferta:** ${idea} | **Cliente:** ${audiencia} | **Promesa:** ${promesa} | **Producto:** ${producto}

## 📸 POST INSTAGRAM — Carrusel Educativo
Slide 1 (portada) + Slides 2-6 (contenido) + caption + 20 hashtags relevantes

## 📸 POST INSTAGRAM — Oferta Directa
Caption de venta con gancho, CTA y hashtags

## 💙 POST FACEBOOK — Historia Larga
Post de 400-500 palabras con historia, valor y CTA suave

## 💼 POST LINKEDIN
Post profesional con perspectiva de industria y autoridad

## 🐦 HILO TWITTER/X
8 tweets en secuencia numerados con el tweet ancla

## 💬 MENSAJE WHATSAPP
Mensaje conversacional de venta para difusión o 1 a 1

## 📱 BIO INSTAGRAM OPTIMIZADA
Bio con propuesta de valor, público objetivo y CTA`, apiKey);
});

app.get('/venta', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'venta.html'));
});

app.get('/guia', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'guia.html'));
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║   💰 NODEMON MILLON — Sistema activo     ║
║   http://localhost:${PORT}                   ║
╚══════════════════════════════════════════╝
`);
});
