import { useEffect, useRef } from 'react';
import type { Message } from './types';
import { MessageItem } from './MessageItem';
import { TypingIndicator } from './TypingIndicator';

interface Props {
  messages: Message[];
  isTyping: boolean;
}

export function MessageList({ messages, isTyping }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="cbw-messages" role="log" aria-live="polite" aria-label="Chat messages">
      {messages.map(msg => (
        <MessageItem key={msg.id} message={msg} />
      ))}
      {isTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
