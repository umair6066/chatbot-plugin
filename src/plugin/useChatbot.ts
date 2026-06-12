import { useState, useCallback, useRef } from 'react';
import type { Message, Product } from './types';
import { getMockResponse, getMockDelay } from './mockResponses';

let counter = 0;
function nextId() {
  return `msg-${++counter}`;
}

function buildWelcome(text: string): Message {
  return { id: nextId(), role: 'bot', content: text, timestamp: new Date() };
}

export function useChatbot(welcomeMessage?: string, products: Product[] = []) {
  const [messages, setMessages] = useState<Message[]>(() =>
    welcomeMessage ? [buildWelcome(welcomeMessage)] : []
  );
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendMessage = useCallback((content: string) => {
    const userMsg: Message = { id: nextId(), role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    timerRef.current = setTimeout(() => {
      const botMsg: Message = {
        id: nextId(),
        role: 'bot',
        content: getMockResponse(content, products),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, getMockDelay());
  }, [products]);

  return { messages, isTyping, sendMessage };
}
