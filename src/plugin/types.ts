export interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export interface Product {
  name: string;
  description?: string;
  price?: number | string;
  category?: string;
  inStock?: boolean;
  [key: string]: unknown;
}

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
}
