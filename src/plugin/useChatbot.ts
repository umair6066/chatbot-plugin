import { useState, useCallback } from 'react';
import type { Message, Product } from './types';
import { getAIResponse, getModelStatus } from './aiResponses';

let counter = 0;
function nextId() {
  return `msg-${++counter}`;
}

function buildWelcome(text: string): Message {
  return { id: nextId(), role: 'bot', content: text, timestamp: new Date() };
}

export type ModelStatus = 'idle' | 'loading' | 'ready' | 'error';

export function useChatbot(welcomeMessage?: string, products: Product[] = []) {
  const [messages, setMessages] = useState<Message[]>(() =>
    welcomeMessage ? [buildWelcome(welcomeMessage)] : []
  );
  const [isTyping, setIsTyping] = useState(false);
  const [modelStatus, setModelStatus] = useState<ModelStatus>(getModelStatus);
  const [modelProgress, setModelProgress] = useState(0);

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: Message = { id: nextId(), role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const response = await getAIResponse(content, products, (status, progress) => {
      setModelStatus(status as ModelStatus);
      if (progress !== undefined) setModelProgress(progress);
    });

    const botMsg: Message = {
      id: nextId(),
      role: 'bot',
      content: response,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  }, [products]);

  return { messages, isTyping, sendMessage, modelStatus, modelProgress };
}
