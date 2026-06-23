import { useState, useEffect } from 'react';
import type { ChatbotConfig, Product } from './types';
import { ChatBubble } from './ChatBubble';
import { ChatWindow } from './ChatWindow';
import { useChatbot } from './useChatbot';
import './widget.css';

export interface ChatbotWidgetProps extends ChatbotConfig {
  position?: 'bottom-right' | 'bottom-left';
}

export function ChatbotWidget({
  position = 'bottom-right',
  primaryColor = '#6366f1',
  welcomeMessage = 'Hi there! 👋 How can I help you today?',
  products: inlineProducts = [],
  productsUrl,
  suggestions,
  onSearch,
  ...config
}: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(inlineProducts);

  useEffect(() => {
    if (!productsUrl) return;
    fetch(productsUrl)
      .then(r => {
        if (!r.ok) throw new Error(`Failed to load products: HTTP ${r.status}`);
        return r.json();
      })
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(err => console.warn('[ChatbotWidget]', err.message));
  }, [productsUrl]);

  const { messages, isTyping, sendMessage } = useChatbot(welcomeMessage, products, suggestions, onSearch);

  return (
    <div
      className={`cbw-root cbw-root--${position}`}
      style={{ '--cbw-primary': primaryColor } as React.CSSProperties}
    >
      {isOpen && (
        <ChatWindow
          config={{ ...config, welcomeMessage, primaryColor }}
          messages={messages}
          isTyping={isTyping}
          onSend={sendMessage}
          onClose={() => setIsOpen(false)}
        />
      )}
      <ChatBubble onClick={() => setIsOpen(prev => !prev)} isOpen={isOpen} />
    </div>
  );
}
