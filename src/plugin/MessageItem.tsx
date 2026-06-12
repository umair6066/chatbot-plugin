import type { Message } from './types';

interface Props {
  message: Message;
}

export function MessageItem({ message }: Props) {
  const isBot = message.role === 'bot';
  const time = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`cbw-message ${isBot ? 'cbw-message--bot' : 'cbw-message--user'}`}>
      {isBot && (
        <div className="cbw-avatar" aria-hidden="true">
          <BotIcon />
        </div>
      )}
      <div className="cbw-bubble">
        <p className="cbw-bubble-text">{message.content}</p>
        <span className="cbw-bubble-time">{time}</span>
      </div>
    </div>
  );
}

function BotIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M9 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4m6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
    </svg>
  );
}
