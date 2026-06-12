import type { Message, ChatbotConfig } from './types';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

interface Props {
  config: ChatbotConfig;
  messages: Message[];
  isTyping: boolean;
  onSend: (message: string) => void;
  onClose: () => void;
}

export function ChatWindow({ config, messages, isTyping, onSend, onClose }: Props) {
  return (
    <div className="cbw-window" role="dialog" aria-label="Chat window">
      <div className="cbw-header">
        <div className="cbw-header-info">
          <div className="cbw-header-avatar" aria-hidden="true">
            <BotIcon />
          </div>
          <div>
            <h3 className="cbw-title">{config.title ?? 'Chat Support'}</h3>
            {config.subtitle && <p className="cbw-subtitle">{config.subtitle}</p>}
          </div>
        </div>
        <button className="cbw-close-btn" onClick={onClose} aria-label="Close chat">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <MessageList messages={messages} isTyping={isTyping} />
      <ChatInput onSend={onSend} disabled={isTyping} placeholder={config.placeholder} />
    </div>
  );
}

function BotIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M9 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4m6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
    </svg>
  );
}
