import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

// Both clients are constructed lazily (on first real use, i.e. first
// request) rather than at module scope: Next.js imports route modules at
// build time to collect route metadata, and that must succeed even before
// the relevant API key is configured.

// --- Embeddings: Gemini (Google AI Studio), free tier, works in any country ---
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY is not set. Add it to .env before making requests."
      );
    }
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

export const genai = new Proxy({} as GoogleGenAI, {
  get(_target, prop) {
    return Reflect.get(getGeminiClient(), prop);
  },
});

export const EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL ?? "gemini-embedding-001";

// Must stay consistent across ingestion and retrieval, and must match the
// `vector(1536)` column width declared in prisma/schema.prisma. Gemini's
// embedding models default to 3072 dims but support truncation via
// outputDimensionality (768 / 1536 / 3072 are the documented "recommended"
// sizes) - pgvector's cosine operator works fine on the truncated vectors
// without renormalization.
export const EMBEDDING_DIMENSIONS = 1536;

// --- Chat: OpenRouter, free-tier models (":free" suffix) with no billing
// required. Gemini's own chat free tier and Groq's API were both geo-blocked
// during setup, so chat generation goes through OpenRouter's OpenAI-compatible
// endpoint instead - a different network/company, more likely to be reachable. ---
let openRouterClient: OpenAI | null = null;

function getOpenRouterClient(): OpenAI {
  if (!openRouterClient) {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error(
        "OPENROUTER_API_KEY is not set. Add it to .env before making requests."
      );
    }
    openRouterClient = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://localhost:3000",
        "X-Title": "UBT Student Assistant (thesis demo)",
      },
    });
  }
  return openRouterClient;
}

export const openRouter = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return Reflect.get(getOpenRouterClient(), prop);
  },
});

export const CHAT_MODEL =
  process.env.OPENROUTER_CHAT_MODEL ?? "nvidia/nemotron-3-super-120b-a12b:free";

// Free-tier models on OpenRouter run on shared, lower-priority capacity and
// intermittently return transient errors (502 "service overloaded", 429 rate
// limits, 503 provider errors). Critically, multiple Nvidia-hosted models
// share the same backend infrastructure and were observed failing together
// during testing - so the fallback list is deliberately spread across
// unrelated backend providers (Nvidia, Liquid AI, Nex AGI, Cohere, Google),
// not just alternate models from the same vendor, to avoid one vendor's
// outage taking down every candidate at once. If a model fails before
// producing any output, the chat route walks this list until one responds.
export const CHAT_MODEL_CANDIDATES = (
  process.env.OPENROUTER_CHAT_MODELS?.split(",").map((m) => m.trim()) ?? [
    CHAT_MODEL, // Nvidia (120B) - best quality when available
    "google/gemma-4-31b-it:free", // Google AI Studio (31B)
    "nex-agi/nex-n2.5-pro:free", // Nex AGI ("pro" tier)
    "cohere/north-mini-code:free", // Cohere
    "liquid/lfm-2.5-2.6b:free", // Liquid AI (2.6B, smallest - last resort)
  ]
).filter((m, i, arr) => m && arr.indexOf(m) === i);

// Per-attempt request timeout (ms): if a candidate hangs instead of erroring
// quickly, don't let it stall the whole request - move on to the next one.
export const CHAT_REQUEST_TIMEOUT_MS = 20_000;
