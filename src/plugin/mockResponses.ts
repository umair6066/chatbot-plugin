import type { Product } from './types';

export interface ChatContext {
  lastProducts?: Product[]; // full matched set from last search
  lastShown?: Product[];    // subset displayed in last reply
  lastQuery?: string;
  page?: number;
}

export interface BotResponse {
  text: string;
  suggestions?: string[];
  products?: Product[];
  context?: ChatContext;
}

export const RESULTS_CAP = 5;

// ---------- helpers ----------

function extractValues(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.flatMap(extractValues);
  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).flatMap(extractValues);
  }
  return [String(value).toLowerCase()];
}

function normalizeQuery(message: string): string {
  return message
    .replace(/\b(?:ref|serial|id|model|metal|case|reg)=(\S+)/gi, '$1')
    .trim();
}

function matchesQuery(query: string, product: Product): boolean {
  const normalized = normalizeQuery(query);
  const terms = normalized.toLowerCase().split(/\s+/).filter(t => t.length > 1);
  if (terms.length === 0) return false;
  const values = extractValues(product);
  return terms.every(term => values.some(v => v.includes(term)));
}

function parsePrice(str: string): number {
  const s = str.replace(/[$, ]/g, '').toLowerCase();
  return s.endsWith('k') ? parseFloat(s) * 1000 : parseFloat(s);
}

function cap<T>(arr: T[]): [items: T[], total: number] {
  return [arr.slice(0, RESULTS_CAP), arr.length];
}

function moreChip(shown: number, total: number): string | null {
  return total > shown ? `Show ${Math.min(total - shown, RESULTS_CAP)} more` : null;
}

function addMore(sug: string[], shown: number, total: number) {
  const chip = moreChip(shown, total);
  if (chip) sug.push(chip);
}

function buildWelcomeSuggestions(products: Product[]): string[] {
  const list = ["What do you have?", "What's in stock?", "Show me prices"];
  if (products.length > 0) list.push(`Tell me about ${products[0].name}`);
  return list;
}

const DETAIL_PATTERNS =
  /\b(tell me about|details|more about|describe|specs|what model|what case|what metal|what ref|this one|that product|about it)\b/i;

export const SHOW_MORE_RE =
  /\b(show\s+(\d+\s+)?more|more results?|see (more|rest|all)|next( page)?|load more)\b/i;

const ORDINAL_MAP: [RegExp, number][] = [
  [/\b(first|1st|number\s*1|#\s*1)\b/i,  0],
  [/\b(second|2nd|number\s*2|#\s*2)\b/i, 1],
  [/\b(third|3rd|number\s*3|#\s*3)\b/i,  2],
  [/\b(fourth|4th|number\s*4|#\s*4)\b/i, 3],
  [/\b(fifth|5th|number\s*5|#\s*5)\b/i,  4],
];

function getOrdinalIndex(message: string): number {
  for (const [re, idx] of ORDINAL_MAP) {
    if (re.test(message)) return idx;
  }
  return -1;
}

// ---------- intent handlers ----------

function handleShowMore(context: ChatContext): BotResponse | null {
  const { lastProducts, page = 0 } = context;
  if (!lastProducts || lastProducts.length <= RESULTS_CAP) return null;

  const nextPage = page + 1;
  const start = nextPage * RESULTS_CAP;
  const slice = lastProducts.slice(start, start + RESULTS_CAP);

  if (slice.length === 0) {
    return {
      text: "That's everything — no more results.",
      suggestions: ["What's in stock?", "Show me prices", "What do you have?"],
      context,
    };
  }

  const remaining = lastProducts.length - start - slice.length;
  const sug = slice.slice(0, 3).map(p => `Tell me about ${p.name}`);
  addMore(sug, slice.length, slice.length + remaining);

  return {
    text: remaining > 0
      ? `Here are ${slice.length} more (${remaining} still to go):`
      : `And the last ${slice.length}:`,
    products: slice,
    suggestions: sug,
    context: { ...context, page: nextPage, lastShown: slice },
  };
}

function handleOrdinalRef(message: string, context: ChatContext): BotResponse | null {
  const idx = getOrdinalIndex(message);
  if (idx < 0 || !context.lastShown) return null;

  const product = context.lastShown[idx];
  if (!product) return null;

  const others = context.lastShown.filter((_, i) => i !== idx).slice(0, 2);
  return {
    text: 'Here you go:',
    products: [product],
    suggestions: [
      ...others.map(p => `Tell me about ${p.name}`),
      "What's in stock?",
    ].slice(0, 3),
    context: { ...context, lastShown: [product] },
  };
}

function handlePriceRange(
  message: string,
  products: Product[],
  context: ChatContext,
): BotResponse | null {
  const lower = message.toLowerCase();
  let min = -Infinity;
  let max = Infinity;
  let matched = false;

  const betweenM = lower.match(
    /between\s*\$?\s*([\d,.k]+)\s*(?:and|to|-)\s*\$?\s*([\d,.k]+)/i,
  );
  if (betweenM) {
    min = parsePrice(betweenM[1]);
    max = parsePrice(betweenM[2]);
    matched = true;
  }

  if (!matched) {
    const underM = lower.match(
      /(?:under|less than|below|cheaper than|max|up to)\s*\$?\s*([\d,.k]+)/i,
    );
    if (underM) { max = parsePrice(underM[1]); matched = true; }
  }

  if (!matched) {
    const overM = lower.match(
      /(?:over|more than|above|at least|from|min)\s*\$?\s*([\d,.k]+)/i,
    );
    if (overM) { min = parsePrice(overM[1]); matched = true; }
  }

  if (!matched) return null;

  const pool = context.lastProducts ?? products;
  const priced = pool.filter(p => p.price !== undefined);
  const filtered = priced.filter(p => {
    const n = Number(p.price);
    return n >= min && n <= max;
  });

  const fmt = (n: number) => `$${n.toLocaleString()}`;
  const rangeDesc =
    max === Infinity ? `over ${fmt(min)}` :
    min === -Infinity ? `under ${fmt(max)}` :
    `${fmt(min)}–${fmt(max)}`;

  if (filtered.length === 0) {
    return {
      text: `Nothing in the catalog ${rangeDesc}. Try a different range?`,
      suggestions: ["Show me prices", "What's in stock?", "What do you have?"],
      context,
    };
  }

  const sorted = [...filtered].sort((a, b) => Number(a.price) - Number(b.price));
  const [display, total] = cap(sorted);
  const sug = display.slice(0, 3).map(p => `Tell me about ${p.name}`);
  addMore(sug, display.length, total);

  return {
    text: total === 1
      ? `One watch in that range (${rangeDesc}):`
      : total > RESULTS_CAP
        ? `${total} watches in that range (${rangeDesc}) — here are the first ${display.length}:`
        : `${total} watch${total !== 1 ? 'es' : ''} in that range (${rangeDesc}):`,
    products: display,
    suggestions: sug,
    context: { lastProducts: sorted, lastShown: display, page: 0 },
  };
}

function handleProductList(products: Product[]): BotResponse {
  const [display, total] = cap(products);
  const sug = display.slice(0, 3).map(p => `Tell me about ${p.name}`);
  addMore(sug, display.length, total);

  return {
    text: total <= RESULTS_CAP
      ? `We carry ${total} watch${total !== 1 ? 'es' : ''} — here they are:`
      : `We carry ${total} watches — here's a selection:`,
    products: display,
    suggestions: sug,
    context: { lastProducts: products, lastShown: display, page: 0 },
  };
}

function handlePrices(products: Product[]): BotResponse {
  const priced = products.filter(p => p.price !== undefined);
  if (!priced.length) return { text: "I don't have pricing information right now." };

  const sorted = [...priced].sort((a, b) => Number(a.price) - Number(b.price));
  const [display, total] = cap(sorted);
  const sug = [
    `Tell me about ${display[0].name}`,
    `Tell me about ${display[display.length - 1].name}`,
    "What's in stock?",
  ];
  addMore(sug, display.length, total);

  return {
    text: "Here's our range, cheapest first:",
    products: display,
    suggestions: sug,
    context: { lastProducts: sorted, lastShown: display, page: 0 },
  };
}

function handleStock(products: Product[]): BotResponse {
  const inStock = products.filter(p => p.inStock !== false);
  const outOfStock = products.filter(p => p.inStock === false);

  if (inStock.length === 0) {
    return {
      text: "Nothing in stock right now — check back soon.",
      suggestions: ["Show me prices", "What do you have?"],
    };
  }

  const [display, total] = cap(inStock);
  const sug = display.slice(0, 3).map(p => `Tell me about ${p.name}`);
  addMore(sug, display.length, total);

  const suffix = outOfStock.length > 0
    ? ` (${outOfStock.length} temporarily unavailable)`
    : '';

  return {
    text: total === 1
      ? `One watch available right now${suffix}:`
      : `${total} available right now${suffix}:`,
    products: display,
    suggestions: sug,
    context: { lastProducts: inStock, lastShown: display, page: 0 },
  };
}

function handleCheapest(products: Product[]): BotResponse {
  const priced = products.filter(p => p.price !== undefined);
  if (!priced.length) return { text: 'No pricing information available.' };
  const cheapest = priced.reduce((a, b) => Number(a.price) < Number(b.price) ? a : b);
  return {
    text: 'The most affordable one we have:',
    products: [cheapest],
    suggestions: [`Tell me about ${cheapest.name}`, 'Show me prices', "What's in stock?"],
    context: { lastShown: [cheapest] },
  };
}

function handleMostExpensive(products: Product[]): BotResponse {
  const priced = products.filter(p => p.price !== undefined);
  if (!priced.length) return { text: 'No pricing information available.' };
  const priciest = priced.reduce((a, b) => Number(a.price) > Number(b.price) ? a : b);
  return {
    text: 'Top of the range:',
    products: [priciest],
    suggestions: [`Tell me about ${priciest.name}`, 'Show me prices', "What's in stock?"],
    context: { lastShown: [priciest] },
  };
}

function handleCategory(message: string, products: Product[]): BotResponse | null {
  const cats = [...new Set(products.map(p => p.category).filter(Boolean) as string[])];
  const matchedCat = cats.find(c => message.toLowerCase().includes(c.toLowerCase()));
  if (!matchedCat && !/\bcategor/i.test(message)) return null;

  if (matchedCat) {
    const inCat = products.filter(p => p.category === matchedCat);
    const [display, total] = cap(inCat);
    const sug = display.slice(0, 3).map(p => `Tell me about ${p.name}`);
    addMore(sug, display.length, total);
    return {
      text: total === 1
        ? `One ${matchedCat} in the catalog:`
        : `${total} ${matchedCat} watch${total !== 1 ? 'es' : ''}:`,
      products: display,
      suggestions: sug,
      context: { lastProducts: inCat, lastShown: display, page: 0 },
    };
  }

  return {
    text: `We carry these categories:\n${cats.map(c => `• ${c}`).join('\n')}`,
    suggestions: cats.slice(0, 4).map(c => `Show ${c} products`),
  };
}

function handleProductSearch(
  message: string,
  products: Product[],
  context: ChatContext,
): BotResponse | null {
  const isDetailRequest = DETAIL_PATTERNS.test(message);

  const searchQuery = isDetailRequest
    ? message.replace(DETAIL_PATTERNS, '').replace(/^[\s,]+/, '').trim()
    : message;

  if (!searchQuery) return null;

  const matches = products.filter(p => matchesQuery(searchQuery, p));
  if (matches.length === 0) return null;

  if (isDetailRequest || matches.length === 1) {
    const product = matches[0];
    const pool = context.lastShown ?? products;
    const others = pool.filter(p => p !== product).slice(0, 2);
    return {
      text: 'Here you go:',
      products: [product],
      suggestions: [
        ...others.map(p => `Tell me about ${p.name}`),
        "What's in stock?",
      ].slice(0, 3),
      context: { ...context, lastShown: [product] },
    };
  }

  const [display, total] = cap(matches);
  const sug = display.slice(0, 3).map(p => `Tell me about ${p.name}`);
  addMore(sug, display.length, total);

  return {
    text: total <= RESULTS_CAP
      ? `Found ${total} match${total !== 1 ? 'es' : ''}:`
      : `Found ${total} matches — here are the first ${display.length}:`,
    products: display,
    suggestions: sug,
    context: { lastProducts: matches, lastShown: display, lastQuery: searchQuery, page: 0 },
  };
}

// ---------- main ----------

const greetings: Record<string, string> = {
  hello: 'Hello! What can I help you find?',
  hi: 'Hi there! Looking for something specific, or just browsing?',
  hey: 'Hey! What can I do for you?',
  bye: 'Goodbye! Come back anytime.',
  goodbye: 'Take care — feel free to return anytime.',
  'thank you': "You're welcome! Anything else I can help with?",
  thanks: "Happy to help! Anything else?",
};

export function getResponse(
  userMessage: string,
  products: Product[] = [],
  context: ChatContext = {},
): BotResponse {
  const lower = userMessage.toLowerCase().trim();

  // Show more — always check first, works without products
  if (SHOW_MORE_RE.test(lower)) {
    const r = handleShowMore(context);
    if (r) return r;
  }

  for (const [key, reply] of Object.entries(greetings)) {
    if (lower.includes(key)) {
      return {
        text: reply,
        suggestions: products.length > 0 ? buildWelcomeSuggestions(products) : undefined,
      };
    }
  }

  // Ordinal follow-up — "the second one", "#3" — only when there are prior results
  if (context.lastShown?.length) {
    const ordinalReply = handleOrdinalRef(userMessage, context);
    if (ordinalReply) return ordinalReply;
  }

  if (products.length > 0) {
    // Price range — check before generic "price" intent so "under 10k" doesn't go to handlePrices
    const rangeReply = handlePriceRange(userMessage, products, context);
    if (rangeReply) return rangeReply;

    if (
      /\b(list|show|all|what|which|any|available|do you have|do you carry)\b.*\bproduct/i.test(userMessage) ||
      /\bproduct.*\b(list|show|all|what|which|any|available)\b/i.test(userMessage) ||
      /\bwhat do you (have|carry|sell)\b/i.test(userMessage) ||
      /\bshow (me )?(everything|all)\b/i.test(userMessage) ||
      lower === 'products' || lower === 'catalog'
    ) {
      return handleProductList(products);
    }

    if (/\b(cheap|cheapest|budget|affordable|lowest price|best price|least expensive)\b/i.test(userMessage)) {
      return handleCheapest(products);
    }

    if (/\b(expensive|priciest|premium|most expensive|highest price|top of the range)\b/i.test(userMessage)) {
      return handleMostExpensive(products);
    }

    if (/\b(prices?|cost|how much|pricing)\b/i.test(userMessage)) {
      return handlePrices(products);
    }

    if (/\b(in stock|out of stock|available|stock|inventory)\b/i.test(userMessage)) {
      return handleStock(products);
    }

    const catReply = handleCategory(userMessage, products);
    if (catReply) return catReply;

    const searchReply = handleProductSearch(userMessage, products, context);
    if (searchReply) return searchReply;
  }

  const genericMap: [RegExp, string][] = [
    [/\bhelp\b/i,              "I can search by brand, model, ref number, price range, or availability — what are you looking for?"],
    [/\bprice|cost|pricing\b/i,'Pricing varies a lot across the catalog. Try asking "under 15k" or "show me prices" to see the range.'],
    [/\brefund|return\b/i,     'Returns are handled case by case — get in touch with the team directly for that.'],
    [/\bcancel/i,              'For cancellations, please reach out to us directly.'],
    [/\bsupport|contact\b/i,   'The team is available during business hours. What can I help with right now?'],
  ];

  for (const [pattern, reply] of genericMap) {
    if (pattern.test(userMessage)) return { text: reply };
  }

  const fallbackSuggestions = products.length > 0
    ? buildWelcomeSuggestions(products)
    : ["What can you help with?", "Tell me about your services", "How do I contact support?"];

  return {
    text: "I didn't quite catch that — try a brand name, model, or ref number:",
    suggestions: fallbackSuggestions,
  };
}

export function getDelay(): number {
  return 600 + Math.random() * 600;
}
