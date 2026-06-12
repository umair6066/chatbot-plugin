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
}
