// ============================================================
// Service: Groq (LLM gratuito)
// Wrapper REST sobre la API Chat Completions compatible con OpenAI.
// Sin SDK: usa fetch nativo de Node 18+.
//
// Variables .env requeridas:
//   GROQ_API_KEY   - API key (https://console.groq.com)
//   GROQ_MODEL     - opcional, default: llama-3.3-70b-versatile
// ============================================================
'use strict';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const DEFAULT_TIMEOUT_MS = 30000;
const MAX_RETRIES = 2;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Llama al endpoint chat/completions de Groq.
 * @param {Object} opts
 * @param {Array<{role:string, content:string}>} opts.messages
 * @param {string} [opts.model]
 * @param {number} [opts.temperature]
 * @param {number} [opts.maxTokens]
 * @param {boolean} [opts.json] - Si true, fuerza response_format JSON
 * @returns {Promise<string>} contenido textual de la respuesta
 */
const chat = async ({ messages, model, temperature = 0.1, maxTokens = 1024, json = false } = {}) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY no configurada en .env');
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('messages es requerido');
  }

  const body = {
    model: model || DEFAULT_MODEL,
    messages,
    temperature,
    max_tokens: maxTokens,
  };
  if (json) body.response_format = { type: 'json_object' };

  let lastErr = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    try {
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`Groq HTTP ${res.status}`);
        if (attempt < MAX_RETRIES) {
          await sleep(500 * Math.pow(2, attempt));
          continue;
        }
        throw lastErr;
      }
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Groq HTTP ${res.status}: ${errText.slice(0, 200)}`);
      }

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content !== 'string') {
        throw new Error('Respuesta de Groq sin content');
      }
      return content;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (err.name === 'AbortError' && attempt < MAX_RETRIES) {
        await sleep(500 * Math.pow(2, attempt));
        continue;
      }
      if (attempt >= MAX_RETRIES) throw err;
    }
  }
  throw lastErr || new Error('Groq: error desconocido');
};

module.exports = { chat };
