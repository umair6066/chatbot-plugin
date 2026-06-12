import { useState, useCallback, useRef } from 'react';
import type { Message, Product } from './types';
import { getAIResponse, getModelStatus } from './aiResponses';
import type { ChatTurn } from './aiResponses';

let counter = 0;
function nextId() {
  return `msg-${++counter}`;
}

function buildWelcome(text: string): Message {
  return { id: nextId(), role: 'bot', content: text, timestamp: new Date() };
}

export type ModelStatus = 'idle' | 'loading' | 'ready' | 'error';

// Keep last N turns so the prompt stays within token budget
const MAX_HISTORY_TURNS = 8;

export function useChatbot(welcomeMessage?: string, products: Product[] = []) {
  const [messages, setMessages] = useState<Message[]>(() =>
    welcomeMessage ? [buildWelcome(welcomeMessage)] : []
  );
  const [isTyping, setIsTyping] = useState(false);
  const [modelStatus, setModelStatus] = useState<ModelStatus>(getModelStatus);
  const [modelProgress, setModelProgress] = useState(0);

  // Ref so sendMessage always sees latest messages without needing them as a dep
  const messagesRef = useRef<Message[]>(messages);
  messagesRef.current = messages;

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: Message = { id: nextId(), role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Build conversation history for the AI: skip the welcome bot message, keep last N turns
    const prior = messagesRef.current
      .filter(m => !(m.role === 'bot' && m === messagesRef.current[0])) // skip welcome
      .slice(-MAX_HISTORY_TURNS)
      .map<ChatTurn>(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content }));

    // Append the current user message
    const history: ChatTurn[] = [...prior, { role: 'user', content }];

    const response = await getAIResponse(history, products, (status, progress) => {
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
