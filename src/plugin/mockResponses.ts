import type { Product } from './types';

export interface BotResponse {
  text: string;
  suggestions?: string[];
}

// ---------- helpers ----------

function formatPrice(price: number | string): string {
  return typeof price === 'number' ? `$${price.toFixed(2)}` : price;
}

function buildProductCard(p: Product): string {
  const lines: string[] = [`**${p.name}**`];
  if (p.description) lines.push(p.description);
  if (p.price !== undefined) lines.push(`Price: ${formatPrice(p.price)}`);
  if (p.category) lines.push(`Category: ${p.category}`);
  if (p.inStock !== undefined) lines.push(p.inStock ? 'In stock ✓' : 'Out of stock ✗');
  const known = new Set(['name', 'description', 'price', 'category', 'inStock']);
  for (const [key, val] of Object.entries(p)) {
    if (!known.has(key) && val !== undefined && val !== null) {
      lines.push(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${val}`);
    }
  }
  return lines.join('\n');
}

/**
 * Fuzzy product match: every word in the query must appear as a substring
 * of the product name (case-insensitive). "wireles headfone" still matches
 * "Wireless Headphones" because "wireles" ⊂ "wireless" and "headfone" ⊂ …
 * well, not quite — for real typo tolerance we do token overlap.
 */
function fuzzyMatch(query: string, name: string): boolean {
  const qTokens = query.toLowerCase().split(/\W+/).filter(t => t.length > 2);
  const nLower = name.toLowerCase();
  // A query token matches if the product name contains it, OR if it's contained in a name token
  return (
    qTokens.length > 0 &&
    qTokens.some(qt => nLower.includes(qt) || qt.includes(nLower.split(' ')[0]))
  );
}

function buildProductSuggestions(products: Product[]): string[] {
  const list: string[] = ['What products do you have?', "What's in stock?", 'Show me prices'];
  if (products.length > 0) list.push(`Tell me about ${products[0].name}`);
  const cats = [...new Set(products.map(p => p.category).filter(Boolean) as string[])];
  if (cats.length > 1) list.push(`Show ${cats[1]} products`);
  return list.slice(0, 4);
}

// ---------- intent handlers ----------

function handleProductList(products: Product[]): BotResponse {
  const lines = products.map((p, i) => {
    const price = p.price !== undefined ? ` — ${formatPrice(p.price)}` : '';
    const stock = p.inStock === false ? ' *(out of stock)*' : '';
    return `${i + 1}. ${p.name}${price}${stock}`;
  });
  const followUps = products.map(p => `Tell me about ${p.name}`).slice(0, 3);
  return {
    text: `Here's what we offer:\n\n${lines.join('\n')}\n\nAsk me about any item for full details!`,
    suggestions: followUps,
  };
}

function handlePrices(products: Product[]): BotResponse {
  const priced = products.filter(p => p.price !== undefined);
  if (!priced.length) return { text: "I don't have pricing information right now." };
  const sorted = [...priced].sort(
    (a, b) => Number(a.price) - Number(b.price)
  );
  const lines = sorted.map(p => `• ${p.name}: ${formatPrice(p.price!)}`);
  const cheapest = sorted[0];
  const dearest = sorted[sorted.length - 1];
  return {
    text: `Here are our prices:\n\n${lines.join('\n')}`,
    suggestions: [
      `Tell me about ${cheapest.name}`,
      `Tell me about ${dearest.name}`,
      "What's in stock?",
    ],
  };
}

function handleStock(products: Product[]): BotResponse {
  const inStock = products.filter(p => p.inStock !== false);
  const outStock = products.filter(p => p.inStock === false);
  const parts: string[] = [];
  if (inStock.length) parts.push(`✓ In stock: ${inStock.map(p => p.name).join(', ')}`);
  if (outStock.length) parts.push(`✗ Out of stock: ${outStock.map(p => p.name).join(', ')}`);
  return {
    text: parts.join('\n') || 'No stock information available.',
    suggestions: inStock.slice(0, 3).map(p => `Tell me about ${p.name}`),
  };
}

function handleCheapest(products: Product[]): BotResponse {
  const priced = products.filter(p => p.price !== undefined);
  if (!priced.length) return { text: 'No pricing information available.' };
  const cheapest = priced.reduce((a, b) => Number(a.price) < Number(b.price) ? a : b);
  return {
    text: `Our most affordable option is the **${cheapest.name}** at ${formatPrice(cheapest.price!)}.\n${cheapest.description ?? ''}`,
    suggestions: [`Tell me more about ${cheapest.name}`, 'Show all prices', "What's in stock?"],
  };
}

function handleMostExpensive(products: Product[]): BotResponse {
  const priced = products.filter(p => p.price !== undefined);
  if (!priced.length) return { text: 'No pricing information available.' };
  const priciest = priced.reduce((a, b) => Number(a.price) > Number(b.price) ? a : b);
  return {
    text: `Our premium option is the **${priciest.name}** at ${formatPrice(priciest.price!)}.\n${priciest.description ?? ''}`,
    suggestions: [`Tell me more about ${priciest.name}`, 'Show all prices', "What's in stock?"],
  };
}

function handleCategory(message: string, products: Product[]): BotResponse | null {
  const cats = [...new Set(products.map(p => p.category).filter(Boolean) as string[])];
  const matchedCat = cats.find(c => message.toLowerCase().includes(c.toLowerCase()));
  if (!matchedCat && !/\bcategor/i.test(message)) return null;

  if (matchedCat) {
    const inCat = products.filter(p => p.category === matchedCat);
    const lines = inCat.map(p => `• ${p.name}${p.price !== undefined ? ` — ${formatPrice(p.price)}` : ''}`);
    return {
      text: `${matchedCat} products:\n\n${lines.join('\n')}`,
      suggestions: inCat.slice(0, 3).map(p => `Tell me about ${p.name}`),
    };
  }

  return {
    text: `We carry these categories:\n${cats.map(c => `• ${c}`).join('\n')}`,
    suggestions: cats.slice(0, 4).map(c => `Show ${c} products`),
  };
}

function handleProductDetail(message: string, products: Product[]): BotResponse | null {
  const lower = message.toLowerCase();

  // Exact substring match first
  const exact = products.find(p => lower.includes(p.name.toLowerCase()));
  if (exact) {
    const others = products.filter(p => p !== exact).slice(0, 3);
    return {
      text: buildProductCard(exact),
      suggestions: others.map(p => `Tell me about ${p.name}`),
    };
  }

  // Fuzzy match fallback
  const fuzzy = products.find(p => fuzzyMatch(message, p.name));
  if (fuzzy) {
    const others = products.filter(p => p !== fuzzy).slice(0, 3);
    return {
      text: buildProductCard(fuzzy),
      suggestions: others.map(p => `Tell me about ${p.name}`),
    };
  }

  return null;
}

// ---------- main ----------

const greetings: Record<string, string> = {
  hello: 'Hello! How can I help you today?',
  hi: 'Hi there! What can I do for you?',
  hey: 'Hey! Great to hear from you. How can I assist?',
  bye: 'Goodbye! Come back anytime if you need help. 👋',
  goodbye: 'Take care! Feel free to return if you need anything.',
  'thank you': "You're very welcome! Is there anything else I can help with?",
  thanks: "Happy to help! Anything else?",
};

export function getResponse(userMessage: string, products: Product[] = []): BotResponse {
  const lower = userMessage.toLowerCase().trim();

  // Greetings
  for (const [key, reply] of Object.entries(greetings)) {
    if (lower.includes(key)) {
      return {
        text: reply,
        suggestions: products.length > 0 ? buildProductSuggestions(products) : undefined,
      };
    }
  }

  // Product intents (only when products are available)
  if (products.length > 0) {
    // List all
    if (/\b(list|show|all|what|which|any|available|have)\b.*\bproduct/i.test(userMessage) ||
        /\bproduct.*\b(list|show|all|what|which|any|available)\b/i.test(userMessage) ||
        lower === 'products') {
      return handleProductList(products);
    }

    // Cheapest / budget
    if (/\b(cheap|cheapest|budget|affordable|lowest price|best price|least expensive)\b/i.test(userMessage)) {
      return handleCheapest(products);
    }

    // Most expensive / premium
    if (/\b(expensive|priciest|premium|most expensive|highest price)\b/i.test(userMessage)) {
      return handleMostExpensive(products);
    }

    // Prices
    if (/\b(price|cost|how much|pricing)\b/i.test(userMessage)) {
      return handlePrices(products);
    }

    // Stock
    if (/\b(in stock|out of stock|available|stock|inventory)\b/i.test(userMessage)) {
      return handleStock(products);
    }

    // Category
    const catReply = handleCategory(userMessage, products);
    if (catReply) return catReply;

    // Specific product (exact + fuzzy)
    const productReply = handleProductDetail(userMessage, products);
    if (productReply) return productReply;
  }

  // Generic keywords
  const genericMap: [RegExp, string][] = [
    [/\bhelp\b/i, "Of course! I'm here to help. What do you need?"],
    [/\bprice|cost|pricing\b/i, 'Our pricing varies by product. Ask me about a specific item!'],
    [/\brefund|return\b/i, 'We offer a 30-day return policy. Need help with a specific order?'],
    [/\bcancel/i, 'I can help with cancellation. Could you tell me more about your situation?'],
    [/\bsupport|contact\b/i, 'Our support team is available 24/7. What do you need help with?'],
    [/\berror|bug|broken|issue\b/i, "Sorry to hear that! Could you describe what's happening?"],
    [/\bpassword|login|sign in\b/i, 'You can reset your password from the login page using "Forgot password".'],
  ];

  for (const [pattern, reply] of genericMap) {
    if (pattern.test(userMessage)) return { text: reply };
  }

  // No match — show suggestions so the user knows what to ask
  const fallbackSuggestions = products.length > 0
    ? buildProductSuggestions(products)
    : ['What can you help with?', 'Tell me about your services', 'How do I contact support?'];

  return {
    text: "I'm not sure I understood that. Here are some things I can help with:",
    suggestions: fallbackSuggestions,
  };
}

export function getDelay(): number {
  return 600 + Math.random() * 600;
}
