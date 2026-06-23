export interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  products?: Product[];
}

export type Product<T extends Record<string, unknown> = Record<string, unknown>> = {
  id?: string;
  name: string;
  description?: string;
  price?: number | string;
  category?: string;
  inStock?: boolean;
} & T;

export interface ChatbotConfig {
  title?: string;
  subtitle?: string;
  welcomeMessage?: string;
  primaryColor?: string;
  placeholder?: string;
  products?: Product[];
  productsUrl?: string;
  /** Custom quick-reply chips shown with the welcome message. Auto-generated from products if omitted. */
  suggestions?: string[];
  /**
   * Called for every non-greeting user message when provided.
   * Return matching products from your API — the widget handles display and capping.
   * When set, `products` / `productsUrl` are ignored for search; use them only if
   * you also want local intent handling (cheapest, stock, etc.) on a small catalog.
   */
  onSearch?: (query: string) => Promise<Product[]>;
}
