import { useState } from 'react';
import { ChatbotWidget } from './plugin';
import './App.css';

const PRODUCTS_URL = `${import.meta.env.BASE_URL}products.json`;
const SCRIPT_URL = 'https://umair6066.github.io/chatbot-plugin/chatbot-widget.iife.js';

const PRESETS = [
  { label: 'Indigo', color: '#6366f1', title: 'Chat Support',     subtitle: 'Typically replies instantly' },
  { label: 'Teal',   color: '#0d9488', title: 'Live Help',         subtitle: 'Online now' },
  { label: 'Rose',   color: '#e11d48', title: 'Ask Us Anything',   subtitle: 'Response time < 1 min' },
  { label: 'Amber',  color: '#d97706', title: 'Sales Chat',        subtitle: 'Ready to help' },
] as const;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className="demo-copy-btn" onClick={copy} aria-label="Copy to clipboard">
      {copied ? (
        <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Copied!</>
      ) : (
        <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</>
      )}
    </button>
  );
}

export default function App() {
  const [preset, setPreset]     = useState(0);
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right');
  const active = PRESETS[preset];

  const embedSnippet = `<script src="${SCRIPT_URL}"></script>
<script>
  ChatbotWidget.init({
    title: "${active.title}",
    subtitle: "${active.subtitle}",
    primaryColor: "${active.color}",
    welcomeMessage: "Hi there! 👋 How can I help?",
    position: "${position}",
    productsUrl: "https://yoursite.com/products.json",
    suggestions: [
      "What products do you have?",
      "What\\'s in stock?",
      "Show me prices",
      "Help me find something",
    ],
  });
</script>`;

  return (
    <div className="demo-root">
      <header className="demo-header">
        <div className="demo-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          ChatbotWidget
        </div>
        <span className="demo-badge">v1.0.0</span>
      </header>

      <main className="demo-main">
        <section className="demo-hero">
          <h1 className="demo-h1">Embeddable Chat Widget</h1>
          <p className="demo-lead">
            Lightweight and fully customisable. Add it to any site with a single{' '}
            <code>&lt;script&gt;</code> tag — no npm, no build step. Try the floating button →
          </p>
        </section>

        {/* ── Live controls ───────────────────────────────────────────── */}
        <section className="demo-card">
          <div className="demo-control-group">
            <p className="demo-label">Color theme</p>
            <div className="demo-presets">
              {PRESETS.map((p, i) => (
                <button
                  key={p.label}
                  className={`demo-preset${i === preset ? ' demo-preset--active' : ''}`}
                  style={{ '--c': p.color } as React.CSSProperties}
                  onClick={() => setPreset(i)}
                >
                  <span className="demo-swatch" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="demo-control-group">
            <p className="demo-label">Position</p>
            <div className="demo-toggle">
              {(['bottom-right', 'bottom-left'] as const).map(p => (
                <button
                  key={p}
                  className={`demo-toggle-btn${position === p ? ' demo-toggle-btn--active' : ''}`}
                  onClick={() => setPosition(p)}
                >
                  {p === 'bottom-right' ? 'Bottom Right' : 'Bottom Left'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Smart suggestions ───────────────────────────────────────── */}
        <section className="demo-card">
          <p className="demo-label">Smart suggestion chips</p>
          <p className="demo-method-desc">
            The widget shows clickable quick-reply chips below every bot message. When it
            understands the query it returns context-aware follow-ups. When it doesn't, it
            shows fallback chips so the user always knows what to ask next.
          </p>

          <div className="demo-suggestions-preview">
            <p className="demo-suggestions-preview-label">Live example — open the chat and see the chips</p>
            <div className="demo-chip-row">
              {['What products do you have?', "What's in stock?", 'Show me prices', 'Help me find something'].map(s => (
                <span key={s} className="demo-chip">{s}</span>
              ))}
            </div>
            <p className="demo-suggestions-preview-note">Chips on older messages grey out — only the latest reply has active chips.</p>
          </div>

          <div className="demo-method">
            <p className="demo-method-title">Pass custom welcome chips <span className="demo-method-tag">optional</span></p>
            <pre className="demo-code">{`ChatbotWidget.init({
  suggestions: [
    "What products do you have?",
    "What's your return policy?",
    "Do you ship internationally?",
    "Talk to a human",
  ],
});`}</pre>
            <p className="demo-method-desc">
              If <code>suggestions</code> is omitted the widget auto-generates chips from your
              product catalog. Pass your own array to override with business-specific questions.
            </p>
          </div>

          <div className="demo-method">
            <p className="demo-method-title">React component usage</p>
            <pre className="demo-code">{`<ChatbotWidget
  suggestions={[
    "What products do you have?",
    "What's your return policy?",
    "Do you ship internationally?",
  ]}
/>`}</pre>
          </div>
        </section>

        {/* ── Products ────────────────────────────────────────────────── */}
        <section className="demo-card">
          <p className="demo-label">Passing products to the widget</p>

          <div className="demo-method">
            <p className="demo-method-title">1 — JSON file URL <span className="demo-method-tag">recommended</span></p>
            <pre className="demo-code">{`<ChatbotWidget productsUrl="/products.json" />`}</pre>
            <p className="demo-method-desc">Widget fetches the file at runtime. Update the file anytime — no code change needed.</p>
          </div>

          <div className="demo-method">
            <p className="demo-method-title">2 — Inline array</p>
            <pre className="demo-code">{`<ChatbotWidget
  products={[
    { name: "Wireless Headphones", price: 149.99, inStock: true },
    { name: "Standing Desk",       price: 599.00, inStock: false },
  ]}
/>`}</pre>
            <p className="demo-method-desc">Good for small or static catalogs already in your app.</p>
          </div>

          <div className="demo-method">
            <p className="demo-method-title">3 — Fetched by your page, shared with the widget</p>
            <pre className="demo-code">{`const [products, setProducts] = useState([]);
useEffect(() => {
  fetch("/products.json").then(r => r.json()).then(setProducts);
}, []);

<ProductGrid products={products} />
<ChatbotWidget products={products} />`}</pre>
            <p className="demo-method-desc">Fetch once — your product grid and the chatbot use the same array, no double request.</p>
          </div>

          <div className="demo-method">
            <p className="demo-method-title">Product shape — only <code>name</code> is required</p>
            <pre className="demo-code">{`{
  name:        string           // required
  description: string           // shown in detail card
  price:       number | string  // 29.99 or "Contact us"
  category:    string           // used for category listing
  inStock:     boolean          // shown in stock queries
  // any extra fields are also shown in the detail card
}`}</pre>
          </div>

          <p className="demo-hint">Try the chat: "what products do you have?" · "tell me about the keyboard" · "cheapest option" · "what's in stock?"</p>
        </section>

        {/* ── Embed snippet ───────────────────────────────────────────── */}
        <section className="demo-card">
          <p className="demo-label">Add to any website</p>
          <p className="demo-method-desc">
            Paste these two tags before <code>&lt;/body&gt;</code>. No npm, no build step, no React needed.
          </p>

          <div className="demo-script-url-box">
            <span className="demo-script-url-label">Script URL</span>
            <code className="demo-script-url">{SCRIPT_URL}</code>
            <span className="demo-script-url-note">
              ⓘ This is the hosted location on GitHub Pages. If you self-host, replace this URL with your own path to <strong>chatbot-widget.iife.js</strong>.
            </span>
          </div>

          <div className="demo-snippet-wrap">
            <CopyButton text={embedSnippet} />
            <pre className="demo-code">{embedSnippet}</pre>
          </div>
          <p className="demo-hint">The snippet updates live as you change colour and position above.</p>
        </section>

        {/* ── Features ────────────────────────────────────────────────── */}
        <section className="demo-card">
          <p className="demo-label">Features</p>
          <ul className="demo-features">
            {[
              'Smart suggestion chips — auto-generated or custom, guide users when queries are unclear',
              'Product-aware responses with fuzzy matching (handles typos)',
              'Cheapest / most expensive / category / stock intents',
              'Floating trigger button with open/close animation',
              'Typing indicator with animated dots',
              'Auto-scroll to latest message',
              'Textarea auto-resize — Shift+Enter for newlines',
              'Conversation preserved across open/close',
              'Configurable title, subtitle, colour, position, suggestions',
              'Mobile responsive (< 480 px)',
              'Keyboard accessible with ARIA roles & labels',
              'Zero host-page CSS conflicts (cbw- prefix)',
            ].map(f => (
              <li key={f}><span className="demo-check">✓</span>{f}</li>
            ))}
          </ul>
        </section>
      </main>

      <ChatbotWidget
        key={`${preset}-${position}`}
        title={active.title}
        subtitle={active.subtitle}
        primaryColor={active.color}
        welcomeMessage="Hi there! 👋 Ask me about our products or anything else!"
        position={position}
        productsUrl={PRODUCTS_URL}
      />
    </div>
  );
}
