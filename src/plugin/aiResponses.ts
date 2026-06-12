import { pipeline, env } from '@xenova/transformers';
import type { Product } from './types';

env.backends.onnx.wasm.wasmPaths =
  'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/';
env.allowLocalModels = false;

// TinyLlama-Chat: proper instruction-tuned chat model, natural conversation
const MODEL = 'Xenova/TinyLlama-1.1B-Chat-v1.0';

export type ModelStatus = 'idle' | 'loading' | 'ready' | 'error';

type StatusListener = (status: ModelStatus, progress?: number) => void;

let generator: Awaited<ReturnType<typeof pipeline>> | null = null;
let currentStatus: ModelStatus = 'idle';
const listeners: StatusListener[] = [];

function notify(status: ModelStatus, progress?: number) {
  currentStatus = status;
  listeners.forEach(fn => fn(status, progress));
}

export function onModelStatusChange(fn: StatusListener) {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i !== -1) listeners.splice(i, 1);
  };
}

export function getModelStatus(): ModelStatus {
  return currentStatus;
}

// Deduplicate concurrent load calls
let loadPromise: Promise<void> | null = null;

function ensureModel(): Promise<void> {
  if (generator) return Promise.resolve();
  if (loadPromise) return loadPromise;

  notify('loading', 0);
  loadPromise = pipeline('text-generation', MODEL, {
    progress_callback: (data: { status: string; progress?: number }) => {
      if (data.status === 'downloading' || data.status === 'progress') {
        notify('loading', Math.round(data.progress ?? 0));
      }
    },
  })
    .then(gen => {
      generator = gen;
      notify('ready');
    })
    .catch(err => {
      console.error('[ChatbotWidget] AI model load failed:', err);
      loadPromise = null;
      notify('error');
    });

  return loadPromise;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

function buildPrompt(history: ChatTurn[], products: Product[]): string {
  const productLines =
    products.length > 0
      ? products
          .map(p => {
            const parts = [`• ${p.name}`];
            if (p.price !== undefined) parts.push(`$${p.price}`);
            if (p.category) parts.push(p.category);
            if (p.inStock !== undefined) parts.push(p.inStock ? 'In stock' : 'Out of stock');
            if (p.description) parts.push(p.description);
            return parts.join(' | ');
          })
          .join('\n')
      : null;

  const system = [
    'You are a friendly, helpful shopping assistant. Have a natural conversation.',
    'Keep replies concise (2-4 sentences). Be warm and helpful.',
    productLines ? `\nAvailable products:\n${productLines}` : '',
    'If asked about something unrelated to products, answer helpfully from general knowledge.',
  ]
    .filter(Boolean)
    .join('\n');

  // TinyLlama ChatML format: <|system|>\n...\n</s>\n<|user|>\n...\n</s>\n<|assistant|>\n
  let prompt = `<|system|>\n${system}</s>\n`;
  for (const turn of history) {
    if (turn.role === 'user') {
      prompt += `<|user|>\n${turn.content}</s>\n`;
    } else {
      prompt += `<|assistant|>\n${turn.content}</s>\n`;
    }
  }
  prompt += `<|assistant|>\n`;
  return prompt;
}

export async function getAIResponse(
  history: ChatTurn[],
  products: Product[],
  onStatus?: StatusListener,
): Promise<string> {
  const unsub = onStatus ? onModelStatusChange(onStatus) : null;
  await ensureModel();
  if (unsub) unsub();

  if (!generator || currentStatus === 'error') {
    return "Sorry, I couldn't load the AI model. Please try again.";
  }

  const prompt = buildPrompt(history, products);

  type GenResult = Array<{ generated_text: string }>;
  const result = await (generator as (p: string, opts: object) => Promise<GenResult>)(prompt, {
    max_new_tokens: 200,
    do_sample: true,
    temperature: 0.7,
    top_p: 0.9,
    repetition_penalty: 1.3,
  });

  const full = result[0]?.generated_text ?? '';
  // Extract only the final assistant turn (everything after the last <|assistant|>\n)
  const parts = full.split('<|assistant|>\n');
  const reply = parts[parts.length - 1].split('</s>')[0].trim();
  return reply || "I'm not sure how to answer that — could you rephrase?";
}
