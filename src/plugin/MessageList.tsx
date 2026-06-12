import { useEffect, useRef } from 'react';
import type { Message } from './types';
import { MessageItem } from './MessageItem';
import { TypingIndicator } from './TypingIndicator';

interface Props {
  messages: Message[];
  isTyping: boolean;
  onSuggestionClick: (text: string) => void;
}

export function MessageList({ messages, isTyping, onSuggestionClick }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="cbw-messages" role="log" aria-live="polite" aria-label="Chat messages">
      {messages.map((msg, i) => (
        <MessageItem
          key={msg.id}
          message={msg}
          // Suggestions are only clickable on the last message and only when not waiting for a reply
          onSuggestionClick={
            i === messages.length - 1 && !isTyping ? onSuggestionClick : undefined
          }
        />
      ))}
      {isTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
