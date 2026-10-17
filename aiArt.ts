// Motores de arte: Puter.js (público, sem chave) → Gemini (se houver chave válida) → Pollinations.
const DEFAULT_GEMINI_KEY = "";
const KEY_STORAGE = "arena-gemini-key";

declare global {
  interface Window {
    puter?: { ai?: { txt2img: (prompt: string, options?: Record<string, unknown>) => Promise<HTMLImageElement> } };
  }
}

export function getGeminiKey(): string {
  try {
    const stored = window.localStorage.getItem(KEY_STORAGE);
    return stored !== null ? stored : DEFAULT_GEMINI_KEY;
  } catch {
    return DEFAULT_GEMINI_KEY;
  }
}

export function setGeminiKey(key: string) {
  try {
    window.localStorage.setItem(KEY_STORAGE, key.trim());
  } catch {
    /* Storage can be unavailable. */
  }
}

function hasLikelyGeminiKey() {
  return /^AIza[\w-]{20,}$/.test(getGeminiKey().trim());
}

const panelCache = new Map<string, string>();

function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

// Limitador genérico de chamadas simultâneas.
function createLimiter(max: number) {
  let active = 0;
  const waiting: Array<() => void> = [];
  return function limited<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const run = () => {
        active += 1;
        task()
          .then(resolve, reject)
          .finally(() => {
            active -= 1;
            waiting.shift()?.();
          });
      };
      if (active < max) run();
      else waiting.push(run);
    });
  };
}

/* ---------------- Puter.js: público, sem chave ---------------- */

let puterLoader: Promise<boolean> | null = null;
let puterBroken = false;

function loadPuter(): Promise<boolean> {
  if (window.puter?.ai?.txt2img) return Promise.resolve(true);
  if (puterBroken) return Promise.resolve(false);
  if (!puterLoader) {
    puterLoader = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://js.puter.com/v2/";
      script.async = true;
      const timeout = window.setTimeout(() => resolve(false), 12000);
      script.onload = () => {
        window.clearTimeout(timeout);
        resolve(Boolean(window.puter?.ai?.txt2img));
      };
      script.onerror = () => {
        window.clearTimeout(timeout);
        resolve(false);
      };
      document.head.appendChild(script);
    });
  }
  return puterLoader;
}

const puterLimit = createLimiter(3);

export type ArtQuality = "max" | "fast";
const QUALITY_STORAGE = "arena-art-quality";

export function getArtQuality(): ArtQuality {
  try {
    return window.localStorage.getItem(QUALITY_STORAGE) === "fast" ? "fast" : "max";
  } catch {
    return "max";
  }
}

export function setArtQuality(quality: ArtQuality) {
  try {
    window.localStorage.setItem(QUALITY_STORAGE, quality);
  } catch {
    /* Storage can be unavailable. */
  }
}

// Cadeias de modelos por qualidade; se um for recusado, tenta o seguinte.
const maxModels: Array<Record<string, unknown> | null> = [
  { model: "gemini-3-pro-image", quality: "1K" }, // Nano Banana Pro: o topo de linha
  { model: "black-forest-labs/flux-2-pro" }, // FLUX.2 Pro: referência em detalhe
  { model: "gemini-3.1-flash-image" },
  { model: "google/gemini-2.5-flash-image" },
  null, // modelo padrão do serviço
];

const fastModels: Array<Record<string, unknown> | null> = [
  { model: "gemini-3.1-flash-image" },
  { model: "google/gemini-2.5-flash-image" },
  null,
];

async function puterPanel(prompt: string, seed: number, wide: boolean): Promise<string> {
  const ready = await loadPuter();
  if (!ready || !window.puter?.ai?.txt2img) {
    puterBroken = true;
    throw new Error("puter-unavailable");
  }
  const fullPrompt = `${prompt}. Composition variation #${seed % 97}. No text, no speech bubbles, no lettering, no watermarks.`;
  const ratio = wide ? { w: 16, h: 9 } : { w: 1, h: 1 };
  const chain = getArtQuality() === "max" ? maxModels : fastModels;
  return puterLimit(async () => {
    let lastError: Error = new Error("puter-empty");
    for (const base of chain) {
      try {
        const options = base ? { ...base, ratio } : undefined;
        const image = await Promise.race([
          window.puter!.ai!.txt2img(fullPrompt, options),
          sleep(75000).then(() => {
            throw new Error("puter-timeout");
          }),
        ]);
        if (image?.src) return image.src;
        lastError = new Error("puter-empty");
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("puter-failed");
        if (lastError.message === "puter-timeout") break;
      }
    }
    throw lastError;
  });
}

/* ---------------- AI Horde: rede pública colaborativa, sem chave e sem limite ---------------- */

const hordeLimit = createLimiter(4);
const hordeModels = ["AlbedoBase XL 3.1", "AlbedoBase XL (SDXL)", "AAM XL", "Blank Canvas XL", "CyberRealistic Pony"];

type HordeStatus = { done?: boolean; faulted?: boolean; generations?: Array<{ img?: string }> };

async function hordePanel(prompt: string, seed: number, wide: boolean): Promise<string> {
  return hordeLimit(async () => {
    const submit = await fetch("https://stablehorde.net/api/v2/generate/async", {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: "0000000000", "Client-Agent": "arena-comic:1.0:web" },
      body: JSON.stringify({
        prompt: `${prompt}. Composition variation #${seed % 97}. ### text, speech bubbles, captions, lettering, watermark, blurry, deformed`,
        params: {
          width: wide ? 1024 : 832,
          height: wide ? 576 : 832,
          steps: 28,
          cfg_scale: 6,
          sampler_name: "k_euler_a",
          seed: String(seed),
          n: 1,
        },
        models: hordeModels,
        nsfw: false,
        censor_nsfw: true,
        shared: true,
      }),
    });
    if (!submit.ok) throw new Error(`horde-${submit.status}`);
    const { id } = (await submit.json()) as { id?: string };
    if (!id) throw new Error("horde-no-id");

    const deadline = Date.now() + 150000;
    while (Date.now() < deadline) {
      await sleep(4000);
      const check = await fetch(`https://stablehorde.net/api/v2/generate/check/${id}`);
      if (!check.ok) continue;
      const state = (await check.json()) as HordeStatus;
      if (state.faulted) throw new Error("horde-faulted");
      if (state.done) {
        const statusResponse = await fetch(`https://stablehorde.net/api/v2/generate/status/${id}`);
        if (!statusResponse.ok) throw new Error(`horde-status-${statusResponse.status}`);
        const status = (await statusResponse.json()) as HordeStatus;
        const img = status.generations?.[0]?.img;
        if (!img) throw new Error("horde-empty");
        return img.startsWith("http") ? img : `data:image/webp;base64,${img}`;
      }
    }
    throw new Error("horde-timeout");
  });
}

/* ---------------- Gemini: usado apenas com chave válida ---------------- */

type GeminiPart = { inlineData?: { mimeType?: string; data?: string } };
type GeminiResponse = { candidates?: Array<{ content?: { parts?: GeminiPart[] } }> };

const geminiLimit = createLimiter(1);
let geminiCooldownUntil = 0;

async function geminiPanel(prompt: string, seed: number, wide: boolean): Promise<string> {
  if (!hasLikelyGeminiKey()) throw new Error("gemini-no-key");
  return geminiLimit(async () => {
    const now = Date.now();
    if (geminiCooldownUntil > now) await sleep(geminiCooldownUntil - now);
    const key = getGeminiKey().trim();
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${encodeURIComponent(key)}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${prompt}. Composition variation #${seed % 97}.` }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"], imageConfig: { aspectRatio: wide ? "16:9" : "1:1" } },
      }),
    });
    if (response.status === 429 || response.status === 503) {
      geminiCooldownUntil = Date.now() + 20000;
      throw new Error(`gemini-${response.status}`);
    }
    if (!response.ok) throw new Error(`gemini-${response.status}`);
    const data = (await response.json()) as GeminiResponse;
    const part = data.candidates?.[0]?.content?.parts?.find((candidate) => candidate.inlineData?.data);
    if (!part?.inlineData?.data) throw new Error("gemini-empty");
    return `data:${part.inlineData.mimeType ?? "image/png"};base64,${part.inlineData.data}`;
  });
}

/* ---------------- Pollinations: última reserva, por URL ---------------- */

export function pollinationsPanelUrl(prompt: string, seed: number, wide: boolean): string {
  const full = `${prompt}, no text, no speech bubbles, no captions, no lettering`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(full)}?width=${wide ? 896 : 640}&height=${wide ? 512 : 640}&seed=${seed}&nologo=true&model=turbo`;
}

/* ---------------- Orquestrador ---------------- */

export type PanelResult = { src: string; engine: "puter" | "gemini" | "horde" | "reserva" };

export type ArtEngine = "horde" | "puter" | "reserva";
const ENGINE_STORAGE = "arena-art-engine";

export function getArtEngine(): ArtEngine {
  try {
    const stored = window.localStorage.getItem(ENGINE_STORAGE);
    if (stored === "puter" || stored === "reserva" || stored === "horde") return stored;
  } catch {
    /* Storage can be unavailable. */
  }
  return "horde";
}

export function setArtEngine(engine: ArtEngine) {
  try {
    window.localStorage.setItem(ENGINE_STORAGE, engine);
  } catch {
    /* Storage can be unavailable. */
  }
}

let puterCooldownUntil = 0;

export async function generatePanel(prompt: string, seed: number, wide: boolean): Promise<PanelResult> {
  const preferred = getArtEngine();
  const cacheKey = `${preferred}|${seed}|${wide}|${prompt}`;
  const cached = panelCache.get(cacheKey);
  if (cached) return JSON.parse(cached) as PanelResult;

  const remember = (result: PanelResult) => {
    // Evita guardar data URLs gigantes em excesso: só memória local do módulo.
    panelCache.set(cacheKey, JSON.stringify(result));
    return result;
  };

  // Motor escolhido pelo usuário primeiro.
  if (preferred === "horde") {
    try {
      return remember({ src: await hordePanel(prompt, seed, wide), engine: "horde" });
    } catch {
      /* cai para os demais */
    }
  }
  if (preferred === "reserva") {
    return remember({ src: pollinationsPanelUrl(prompt, seed, wide), engine: "reserva" });
  }

  if (preferred === "puter" && Date.now() >= puterCooldownUntil) {
    try {
      return remember({ src: await puterPanel(prompt, seed, wide), engine: "puter" });
    } catch {
      // Limite ou indisponibilidade: pausa o Puter por 10 minutos.
      puterCooldownUntil = Date.now() + 10 * 60 * 1000;
    }
  }
  try {
    return remember({ src: await geminiPanel(prompt, seed, wide), engine: "gemini" });
  } catch {
    /* tenta o próximo motor */
  }
  if (preferred !== "horde") {
    try {
      return remember({ src: await hordePanel(prompt, seed, wide), engine: "horde" });
    } catch {
      /* tenta o próximo motor */
    }
  }
  return remember({ src: pollinationsPanelUrl(prompt, seed, wide), engine: "reserva" });
}
