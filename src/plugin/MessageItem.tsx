import type { Message, Product } from './types';

interface Props {
  message: Message;
  onSuggestionClick?: (text: string) => void;
}

export function MessageItem({ message, onSuggestionClick }: Props) {
  const isBot = message.role === 'bot';
  const time = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`cbw-message ${isBot ? 'cbw-message--bot' : 'cbw-message--user'}`}>
      {isBot && (
        <div className="cbw-avatar" aria-hidden="true">
          <BotIcon />
        </div>
      )}
      <div className="cbw-message-body">
        <div className="cbw-bubble">
          <p className="cbw-bubble-text">{message.content}</p>
          <span className="cbw-bubble-time">{time}</span>
        </div>

        {isBot && message.products && message.products.length > 0 && (
          <div className="cbw-product-cards">
            {message.products.map((p, i) => (
              <ProductCard key={p.id ?? `${p.name}-${i}`} product={p} />
            ))}
          </div>
        )}

        {isBot && message.suggestions && message.suggestions.length > 0 && (
          <div className="cbw-suggestions" role="list">
            {message.suggestions.map(s => (
              <button
                key={s}
                className={`cbw-suggestion-chip${onSuggestionClick ? '' : ' cbw-suggestion-chip--stale'}`}
                onClick={() => onSuggestionClick?.(s)}
                disabled={!onSuggestionClick}
                role="listitem"
                type="button"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const CARD_FIELDS: Array<[string, string]> = [
  ['Model',  'model'],
  ['Reg',    'reg'],
  ['Case',   'case'],
  ['Metal',  'metal'],
  ['Serial', 'serial'],
  ['Year',   'year'],
  ['Dial',   'dial'],
  ['Status', 'status'],
];

const KNOWN_KEYS = new Set([
  'id', 'name', 'description', 'price', 'inStock',
  'model', 'reg', 'case', 'metal', 'serial', 'year', 'dial', 'status', 'category',
]);

function fmtPrice(price: number | string): string {
  return typeof price === 'number' ? `$${price.toLocaleString()}` : price;
}

function ProductCard({ product: p }: { product: Product }) {
  const extraFields = Object.entries(p).filter(
    ([key, val]) => !KNOWN_KEYS.has(key) && val !== undefined && val !== null,
  );

  return (
    <div className="cbw-product-card">
      <p className="cbw-product-card-name">{p.name}</p>

      {p.price !== undefined && (
        <div className="cbw-product-card-field">
          <span className="cbw-product-card-label">Price</span>
          <span className="cbw-product-card-value cbw-product-card-price">{fmtPrice(p.price)}</span>
        </div>
      )}

      {CARD_FIELDS.map(([label, key]) => {
        const val = p[key];
        if (val === undefined || val === null || val === '') return null;
        return (
          <div key={key} className="cbw-product-card-field">
            <span className="cbw-product-card-label">{label}</span>
            <span className="cbw-product-card-value">{String(val)}</span>
          </div>
        );
      })}

      {extraFields.map(([key, val]) => (
        <div key={key} className="cbw-product-card-field">
          <span className="cbw-product-card-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
          <span className="cbw-product-card-value">{String(val)}</span>
        </div>
      ))}

      {p.description && (
        <p className="cbw-product-card-desc">{String(p.description)}</p>
      )}

      {p.inStock !== undefined && (
        <p className={`cbw-product-card-stock ${p.inStock ? 'cbw-product-card-stock--in' : 'cbw-product-card-stock--out'}`}>
          {p.inStock ? 'In stock ✓' : 'Out of stock ✗'}
        </p>
      )}
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
