import type { Product } from './types';

const genericResponses = [
  "That's a great question! Let me help you with that.",
  "I understand your concern. Here's what I can tell you — feel free to ask follow-up questions.",
  "Thanks for reaching out! I'd be happy to assist you.",
  "Sure thing! Here's some information that might help.",
  "Absolutely! Let me provide some details on that.",
  "Good point. Here's my take on it — let me know if you need more info.",
];

const keywordMap: [string, string][] = [
  ['hello', 'Hi there! How can I help you today?'],
  ['hi', 'Hello! What can I do for you?'],
  ['hey', 'Hey! Great to hear from you. How can I assist?'],
  ['bye', 'Goodbye! Feel free to come back if you need anything. 👋'],
  ['thank you', "You're very welcome! Is there anything else I can help with?"],
  ['thanks', "You're welcome! Anything else I can help with?"],
  ['help', "Of course! I'm here to help. What do you need assistance with?"],
  ['price', 'Our pricing starts at $9/month. Would you like full plan details?'],
  ['cost', 'Our pricing starts at $9/month. Would you like full plan details?'],
  ['pricing', 'We offer flexible plans starting at $9/month. Want to know more?'],
  ['refund', 'We offer a 30-day money-back guarantee. I can help you process a refund.'],
  ['cancel', 'I can help you with cancellation. Would you like to proceed?'],
  ['support', 'Our support team is available 24/7. What do you need help with?'],
  ['contact', 'You can reach us at support@example.com or via this chat anytime!'],
  ['hours', 'We are available 24/7 — this chat is always on!'],
  ['broken', 'Sorry to hear that! Can you describe the issue in more detail so I can help?'],
  ['error', 'Sorry about that error! Could you share more details about what happened?'],
  ['bug', 'Thanks for reporting this. Could you describe the bug in more detail?'],
  ['feature', "Great idea! I'll pass that feedback to our product team."],
  ['upgrade', 'Upgrading is easy! Head to Settings → Billing or I can guide you through it.'],
  ['password', 'You can reset your password from the login page using "Forgot password".'],
  ['login', 'Having trouble logging in? Try resetting your password or clearing browser cache.'],
];

function formatPrice(price: number | string): string {
  return typeof price === 'number' ? `$${price.toFixed(2)}` : price;
}

function buildProductCard(p: Product): string {
  const lines: string[] = [p.name];
  if (p.description) lines.push(p.description);
  if (p.price !== undefined) lines.push(`Price: ${formatPrice(p.price)}`);
  if (p.category) lines.push(`Category: ${p.category}`);
  if (p.inStock !== undefined) lines.push(`In stock: ${p.inStock ? 'Yes' : 'No'}`);
  // Render any extra fields the caller passed
  const known = new Set(['name', 'description', 'price', 'category', 'inStock']);
  for (const [key, val] of Object.entries(p)) {
    if (!known.has(key) && val !== undefined && val !== null) {
      lines.push(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${val}`);
    }
  }
  return lines.join('\n');
}

function getProductResponse(message: string, products: Product[]): string | null {
  if (!products.length) return null;
  const lower = message.toLowerCase();

  // List all products
  if (
    /\b(list|show|all|what|which|any|available|have)\b.*\bproduct/i.test(message) ||
    /\bproduct.*\b(list|show|all|what|which|any|available)\b/i.test(message) ||
    lower.trim() === 'products'
  ) {
    const lines = products.map((p, i) => {
      const price = p.price !== undefined ? ` — ${formatPrice(p.price)}` : '';
      const stock = p.inStock === false ? ' (out of stock)' : '';
      return `${i + 1}. ${p.name}${price}${stock}`;
    });
    return `Here's what we offer:\n\n${lines.join('\n')}\n\nAsk me about any product for details!`;
  }

  // Specific product by name
  const matched = products.find(p => lower.includes(p.name.toLowerCase()));
  if (matched) return buildProductCard(matched);

  // Price overview when no specific product matched
  if (/\b(price|cost|how much|cheap|expensive|pricing)\b/i.test(message)) {
    const priced = products.filter(p => p.price !== undefined);
    if (priced.length) {
      const lines = priced.map(p => `• ${p.name}: ${formatPrice(p.price!)}`);
      return `Here are our prices:\n\n${lines.join('\n')}`;
    }
  }

  // Category listing
  if (/\bcategor/i.test(message)) {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    if (cats.length) return `We carry products in these categories:\n${cats.map(c => `• ${c}`).join('\n')}`;
  }

  // Stock check (generic)
  if (/\b(in stock|available|stock)\b/i.test(message)) {
    const inStock = products.filter(p => p.inStock !== false);
    const out = products.filter(p => p.inStock === false);
    const lines: string[] = [];
    if (inStock.length) lines.push(`In stock: ${inStock.map(p => p.name).join(', ')}`);
    if (out.length) lines.push(`Out of stock: ${out.map(p => p.name).join(', ')}`);
    if (lines.length) return lines.join('\n');
  }

  return null;
}

export function getMockResponse(userMessage: string, products: Product[] = []): string {
  const productReply = getProductResponse(userMessage, products);
  if (productReply) return productReply;

  const lower = userMessage.toLowerCase();
  for (const [keyword, response] of keywordMap) {
    if (lower.includes(keyword)) return response;
  }

  return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}

export function getMockDelay(): number {
  return 800 + Math.random() * 800;
}
