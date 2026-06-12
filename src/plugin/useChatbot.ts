import { useState, useCallback, useEffect, useRef } from 'react';
import type { Message, Product } from './types';
import { getResponse, getDelay } from './mockResponses';

let counter = 0;
function nextId() { return `msg-${++counter}`; }

const DEFAULT_SUGGESTIONS = [
  'What products do you have?',
  "What's in stock?",
  'Show me prices',
  'Help me find something',
];

function productSuggestions(products: Product[]): string[] {
  return [
    'What products do you have?',
    "What's in stock?",
    'Show me prices',
    `Tell me about ${products[0].name}`,
  ];
}

export function useChatbot(
  welcomeMessage?: string,
  products: Product[] = [],
  customSuggestions?: string[],
) {
  const [messages, setMessages] = useState<Message[]>(() =>
    welcomeMessage
      ? [{
          id: nextId(),
          role: 'bot',
          content: welcomeMessage,
          timestamp: new Date(),
          suggestions: customSuggestions ?? DEFAULT_SUGGESTIONS,
        }]
      : []
  );
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When products load from a URL, refresh welcome chips (unless the user passed custom ones)
  useEffect(() => {
    if (!products.length || customSuggestions) return;
    setMessages(prev => {
      if (!prev.length || prev[0].role !== 'bot') return prev;
      return [{ ...prev[0], suggestions: productSuggestions(products) }, ...prev.slice(1)];
    });
  }, [products, customSuggestions]);

  const sendMessage = useCallback((content: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const userMsg: Message = { id: nextId(), role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    timerRef.current = setTimeout(() => {
      const { text, suggestions } = getResponse(content, products);
      const botMsg: Message = {
        id: nextId(),
        role: 'bot',
        content: text,
        timestamp: new Date(),
        suggestions,
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, getDelay());
  }, [products]);

  return { messages, isTyping, sendMessage };
}
