import { pipeline, env } from '@xenova/transformers';
import type { Product } from './types';

// Load WASM runtime from CDN — works in any embed context
env.backends.onnx.wasm.wasmPaths =
  'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/';
env.allowLocalModels = false;

type ModelStatus = 'idle' | 'loading' | 'ready' | 'error';

let generator: Awaited<ReturnType<typeof pipeline>> | null = null;
let modelStatus: ModelStatus = 'idle';
const loadListeners: Array<(status: ModelStatus, progress?: number) => void> = [];

function notify(status: ModelStatus, progress?: number) {
  modelStatus = status;
  loadListeners.forEach(fn => fn(status, progress));
}

export function onModelStatusChange(fn: (status: ModelStatus, progress?: number) => void) {
  loadListeners.push(fn);
  return () => {
    const i = loadListeners.indexOf(fn);
    if (i !== -1) loadListeners.splice(i, 1);
  };
}

export function getModelStatus(): ModelStatus {
  return modelStatus;
}

async function ensureModel(): Promise<void> {
  if (generator) return;
  if (modelStatus === 'loading') {
    // wait until the ongoing load resolves
    await new Promise<void>(resolve => {
      const unsub = onModelStatusChange(s => {
        if (s === 'ready' || s === 'error') { unsub(); resolve(); }
      });
    });
    return;
  }

  notify('loading', 0);
  try {
    generator = await pipeline('text2text-generation', 'Xenova/flan-t5-small', {
      progress_callback: (data: { status: string; progress?: number }) => {
        if (data.status === 'downloading' || data.status === 'progress') {
          notify('loading', Math.round(data.progress ?? 0));
        }
      },
    });
    notify('ready');
  } catch (err) {
    console.error('[ChatbotWidget] Failed to load AI model:', err);
    notify('error');
  }
}

function buildPrompt(userMessage: string, products: Product[]): string {
  const productLines =
    products.length > 0
      ? products
          .map(p => {
            const parts: string[] = [`- ${p.name}`];
            if (p.price !== undefined) parts.push(`$${p.price}`);
            if (p.category) parts.push(p.category);
            if (p.inStock !== undefined) parts.push(p.inStock ? 'in stock' : 'out of stock');
            if (p.description) parts.push(p.description);
            return parts.join(' · ');
          })
          .join('\n')
      : 'No products listed.';

  return `You are a friendly shopping assistant. Use the product list below to answer the customer's question. If the question is unrelated to products, answer helpfully from general knowledge. Keep answers concise (1-3 sentences).

Products:
${productLines}

Customer: ${userMessage}
Answer:`;
}

export async function getAIResponse(
  userMessage: string,
  products: Product[],
  onStatusChange?: (status: ModelStatus, progress?: number) => void,
): Promise<string> {
  if (onStatusChange) {
    const unsub = onModelStatusChange(onStatusChange);
    await ensureModel();
    unsub();
  } else {
    await ensureModel();
  }

  if (!generator || modelStatus === 'error') {
    return "Sorry, I couldn't load the AI model. Please try again later.";
  }

  const prompt = buildPrompt(userMessage, products);
  const result = await (generator as (input: string, opts: object) => Promise<Array<{ generated_text: string }>>)(
    prompt,
    { max_new_tokens: 120 },
  );
  return result[0]?.generated_text?.trim() || "I'm not sure how to answer that.";
}
