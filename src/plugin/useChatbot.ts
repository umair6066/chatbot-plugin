import { useState, useCallback, useEffect, useRef } from 'react';
import type { Message, Product } from './types';
import { getResponse, getDelay, SHOW_MORE_RE } from './mockResponses';
import type { ChatContext } from './mockResponses';

let counter = 0;
function nextId() { return `msg-${++counter}`; }

const GREETING_RE = /^(hi+|hello|hey|bye|goodbye|thanks?|thank\s+you)[\s!,.?]*$/i;

// Messages that should never trigger an external onSearch call
const LOCAL_ONLY_RE = new RegExp(
  `${GREETING_RE.source}|${SHOW_MORE_RE.source}`,
  'i',
);

const DEFAULT_SUGGESTIONS = [
  "What do you have?",
  "What's in stock?",
  'Show me prices',
  'Help me find something',
];

function productSuggestions(products: Product[]): string[] {
  return [
    "What do you have?",
    "What's in stock?",
    'Show me prices',
    `Tell me about ${products[0].name}`,
  ];
}

export function useChatbot(
  welcomeMessage?: string,
  products: Product[] = [],
  customSuggestions?: string[],
  onSearch?: (query: string) => Promise<Product[]>,
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
  const [chatContext, setChatContext] = useState<ChatContext>({});
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

    // onSearch path — delegate to caller's API, but handle local-only messages locally
    if (onSearch && !LOCAL_ONLY_RE.test(content.trim())) {
      onSearch(content)
        .then(results => {
          const resp = getResponse(
            content,
            Array.isArray(results) ? results : [],
            chatContext,
          );
          setChatContext(resp.context ?? {});
          setMessages(prev => [...prev, {
            id: nextId(),
            role: 'bot',
            content: resp.text,
            timestamp: new Date(),
            suggestions: resp.suggestions,
            products: resp.products,
          }]);
        })
        .catch(err => {
          console.warn('[ChatbotWidget] onSearch error:', err);
          setMessages(prev => [...prev, {
            id: nextId(),
            role: 'bot',
            content: 'Sorry, something went wrong with the search. Please try again.',
            timestamp: new Date(),
            suggestions: ["What's in stock?", 'Show me prices'],
          }]);
        })
        .finally(() => setIsTyping(false));
      return;
    }

    // Local path — use in-memory products with simulated typing delay
    timerRef.current = setTimeout(() => {
      const resp = getResponse(content, products, chatContext);
      setChatContext(resp.context ?? {});
      setMessages(prev => [...prev, {
        id: nextId(),
        role: 'bot',
        content: resp.text,
        timestamp: new Date(),
        suggestions: resp.suggestions,
        products: resp.products,
      }]);
      setIsTyping(false);
    }, getDelay());
  }, [onSearch, products, chatContext]);

  return { messages, isTyping, sendMessage };
}
