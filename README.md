# Chatbot Widget Plugin

A reusable React chatbot widget component with built-in AI responses, product recommendations, and suggestion chips. Deploy as a React component or standalone IIFE bundle.

---

## 📦 Installation

### **For React Projects**

Add this to your `package.json`:

```json
{
  "dependencies": {
    "chatbot-plugin": "github:umair6066/chatbot-plugin.git#main"
  }
}
```

Then install:

```bash
npm install
```

Or install directly:

```bash
npm install github:umair6066/chatbot-plugin.git
```

---

## 🚀 Usage in React

### **Basic Usage**

```tsx
import { ChatbotWidget } from 'chatbot-plugin';

function App() {
  return (
    <ChatbotWidget
      position="bottom-right"
      primaryColor="#6366f1"
    />
  );
}

export default App;
```

### **With inline products**

```tsx
import { ChatbotWidget } from 'chatbot-plugin';

function App() {
  return (
    <ChatbotWidget
      title="Watch Support"
      subtitle="Search our inventory"
      position="bottom-right"
      primaryColor="#6366f1"
      welcomeMessage="Hi! Search by brand, model, or ref number. 👋"
      productsUrl="/api/products"
      suggestions={[
        "What do you have?",
        "What's in stock?",
        'Show me prices',
      ]}
    />
  );
}

export default App;
```

### **With `onSearch` (large catalogs)**

Use `onSearch` instead of `products` or `productsUrl` when your catalog is large or live. The widget calls it for every non-greeting message and renders the returned products as cards.

```tsx
import { ChatbotWidget } from 'chatbot-plugin';
import type { Product } from 'chatbot-plugin';

async function searchProducts(query: string): Promise<Product[]> {
  const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&limit=10`);
  const data = await res.json();
  return data.products;
}

function App() {
  return (
    <ChatbotWidget
      title="Watch Support"
      primaryColor="#0d9488"
      onSearch={searchProducts}
      suggestions={[
        "What do you have?",
        "What's in stock?",
        'Search by ref number',
      ]}
    />
  );
}

export default App;
```

### **With Inline Products**

```tsx
import { ChatbotWidget } from 'chatbot-plugin';
import type { Product } from 'chatbot-plugin';

// Only `name` is required — add any extra fields your domain needs
const products: Product[] = [
  { id: '1', name: 'Laptop',      price: 999, description: 'High-performance laptop', inStock: true  },
  { id: '2', name: 'Headphones',  price: 199, description: 'Wireless headphones',      inStock: true  },
  { id: '3', name: 'Standing Desk', price: 599,                                         inStock: false },
];

function App() {
  return <ChatbotWidget products={products} />;
}

export default App;
```

---

## 🧩 Custom Product Types

`Product` is a generic type — the base fields (`name`, `price`, `description`, `inStock`, `category`) are built in, and you extend it with whatever fields your business needs.

```ts
import type { Product } from 'chatbot-plugin';

// type Product<T extends Record<string, unknown> = Record<string, unknown>>
```

### Base fields (always available)

| Field | Type | Description |
|---|---|---|
| `name` | `string` | **Required.** Displayed as the card title and used for search |
| `id` | `string?` | Optional unique identifier |
| `price` | `number \| string?` | Drives price/cheapest/most-expensive intents |
| `description` | `string?` | Shown at the bottom of the product card |
| `inStock` | `boolean?` | Drives stock intent and shown on the card |
| `category` | `string?` | Drives category intent |

### Extending for your domain

Define a type alias with your extra fields as the generic parameter:

```ts
// Watch / jewellery dealer
type WatchProduct = Product<{
  model: string;
  reg: string;
  metal?: string;
  case?: string;
  serial?: string;
  dial?: string;
  brand?: string;
  status?: string;
}>;

// Generic ecommerce store
type StoreProduct = Product<{
  sku: string;
  weight?: number;
  tags?: string[];
}>;

// No extras needed — use the default
type SimpleProduct = Product;
```

Pass your typed array directly — no casting required:

```tsx
const watches: WatchProduct[] = [
  {
    id: '48291',
    name: 'Rolex, Submariner Date, 116610LN, 2019, Steel',
    price: 12850,
    model: 'Submariner Date',
    reg: '116610LN',
    metal: 'Steel',
    inStock: true,
  },
];

<ChatbotWidget products={watches} />
```

### What happens with custom fields

The widget handles extra fields automatically — no configuration needed:

- **Search** — every field value is indexed. Users can search by `reg`, `serial`, `brand`, `sku`, or any other field you add.
- **Product cards** — all fields are rendered in the chat card in the order they appear. Unknown field names are title-cased automatically (`serialNumber` → `Serialnumber`).
- **`ref=X` / `serial=X` queries** — users can prefix a value with its field name (e.g. `ref=116610LN`) and the widget strips the prefix before searching.

### Where the generic applies

| Usage | Type safety | Custom fields searched & rendered |
|---|---|---|
| Inline array (TypeScript) | ✓ Compile-time via `Product<T>` | ✓ |
| `productsUrl` JSON fetch | — Runtime only, no TS generics | ✓ |
| IIFE / CDN (`ChatbotWidget.init`) | — Plain JS, no types | ✓ |

The `Product<T>` generic is purely a TypeScript authoring aid — it catches typos in your product objects at build time. At runtime, all three delivery methods work identically: every field in the object is searched and rendered regardless of whether it was declared in `T`.

---

## ⚙️ Configuration Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `'bottom-right'` \| `'bottom-left'` | `'bottom-right'` | Widget position on screen |
| `primaryColor` | `string` | `'#6366f1'` | Accent color used for the button, header, and product card titles |
| `title` | `string` | `'Chat Support'` | Widget header title |
| `subtitle` | `string` | `'Ask us anything'` | Widget header subtitle |
| `welcomeMessage` | `string` | `'Hi there! 👋 How can I help you today?'` | First message shown when the widget opens |
| `placeholder` | `string` | `'Type a message…'` | Input field placeholder text |
| `products` | `Product[]` | `[]` | Inline product array — best for small catalogs |
| `productsUrl` | `string` | - | URL to a JSON file of products — fetched once on load |
| `onSearch` | `(query: string) => Promise<Product[]>` | - | Async callback for server-side search — ideal for large catalogs |
| `suggestions` | `string[]` | - | Welcome message chips. Auto-generated from products if omitted |

> **Choosing between `products`, `productsUrl`, and `onSearch`:**
> - `products` — inline array, loaded at init. Good for < ~500 items.
> - `productsUrl` — fetches a JSON file once. Good for static catalogs.
> - `onSearch` — calls your API on every message. Correct choice for large or live catalogs. No pre-loading needed.

---

## 💬 What users can ask

The widget handles these query patterns out of the box — no AI required.

### Browse & discover

| What the user types | What the bot does |
|---|---|
| "What do you have?" / "show everything" | Lists all products (capped at 5, with "Show more" chips) |
| "What's in stock?" | Shows only available items |
| "Show me prices" | Lists all products sorted cheapest first |
| "Cheapest" / "best price" / "affordable" | Shows the single most affordable item |
| "Most expensive" / "top of the range" / "premium" | Shows the single priciest item |

### Search (all-fields, AND logic)

| What the user types | What the bot does |
|---|---|
| `rolex` | Finds every product where any field contains "rolex" |
| `blue dial steel` | Every term must appear somewhere — AND logic across all fields |
| `ref=116610LN` | Strips the key prefix and searches by value |
| `tell me about Submariner` | Returns a single detail card |

### Price range

| What the user types | What the bot does |
|---|---|
| `under 10k` / `less than $15,000` | Filters by maximum price |
| `over 20k` / `above $50,000` | Filters by minimum price |
| `between 5k and 20k` / `10k to 40k` | Filters by price band |

Price queries also work as refinements after a search — e.g. search "rolex" first, then "under 15k" narrows just those results.

### Follow-ups (context-aware)

| What the user types | What the bot does |
|---|---|
| "Show more" / "Show 5 more" (chip) | Pages through the previous result set — no re-search |
| "the first one" / "#2" / "the third watch" | Picks a card by position from the last reply |
| "tell me about the second one" | Detail card for item #2 in the last result set |

---

## 📥 Getting Updates

Your testing team can receive updates in two ways:

### **1. Automatic Updates (Recommended)**

Already using `#main` in `package.json`:

```json
{
  "dependencies": {
    "chatbot-plugin": "github:umair6066/chatbot-plugin.git#main"
  }
}
```

Run this to get latest updates:

```bash
npm install
```

### **2. Manual Updates**

```bash
npm install github:umair6066/chatbot-plugin.git
```

---

## 📱 React Native Integration

### Option 1: Using WebView (Simplest)

Embed the web widget in a `WebView` component. The widget bundle is served via **jsDelivr CDN** — this is required because `raw.githubusercontent.com` serves files as `text/plain`, which WebViews refuse to execute as JavaScript.

```tsx
import { WebView } from 'react-native-webview';
import { View } from 'react-native';

export default function ChatbotScreen() {
  const htmlContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.jsdelivr.net/gh/umair6066/chatbot-plugin@main/dist-widget/chatbot-widget.iife.js"></script>
      </head>
      <body style="margin: 0; padding: 0;">
        <script>
          window.ChatbotWidget.init({
            position: 'bottom-right',
            primaryColor: '#6366f1',
            productsUrl: 'your-api-url'
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={{ flex: 1 }}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        javaScriptEnabled
      />
    </View>
  );
}
```

Install dependency:

```bash
npm install react-native-webview
```

> **Note:** After pushing a new widget build, purge the jsDelivr cache so the WebView picks up the latest version:
> `https://purge.jsdelivr.net/gh/umair6066/chatbot-plugin@main/dist-widget/chatbot-widget.iife.js`

### Option 2: Native React Native Components (Advanced)

Create a wrapper using React Native UI components:

```tsx
import { View, TouchableOpacity, Text, ScrollView, TextInput } from 'react-native';
import { useState } from 'react';

export function ChatbotWidget({
  primaryColor = '#6366f1',
  welcomeMessage = 'Hi there! 👋'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: welcomeMessage, sender: 'bot' }
  ]);

  return (
    <View style={{ position: 'absolute', bottom: 20, right: 20 }}>
      {isOpen && (
        <View style={{
          width: 300,
          height: 400,
          backgroundColor: '#fff',
          borderRadius: 12,
          marginBottom: 10,
          padding: 15
        }}>
          <ScrollView>
            {messages.map(msg => (
              <View key={msg.id} style={{ marginBottom: 10 }}>
                <Text style={{
                  backgroundColor: msg.sender === 'bot' ? primaryColor : '#e5e7eb',
                  color: msg.sender === 'bot' ? '#fff' : '#000',
                  padding: 10,
                  borderRadius: 8
                }}>
                  {msg.text}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)}
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: primaryColor,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Text style={{ color: '#fff', fontSize: 24 }}>💬</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Running the Sample App

A ready-to-run sample project is included at `samples/react-native/` demonstrating both approaches above.

**Requirement:** Expo Go **SDK 54** (version 54.x) on your device. Check in Expo Go → Profile tab. Update from the Play Store / App Store if needed.

```bash
cd samples/react-native
npm install
npx expo start --clear
```

Scan the QR code with Expo Go, or press `a` for Android emulator / `i` for iOS simulator. See [`samples/react-native/README.md`](samples/react-native/README.md) for full details.

---

## 📝 Samples

See the `samples/` directory for complete HTML examples:

| File | What it demonstrates |
|---|---|
| `basic.html` | Minimal setup, suggestion chips, welcome message |
| `with-products-inline.html` | Products passed as an inline array |
| `with-products-url.html` | Products fetched from a JSON URL |
| `on-search.html` | `onSearch` API callback with a simulated server and live request log |
| `custom-suggestions.html` | Custom welcome chips, auto-generated chips, fallback chips |
| `ecommerce.html` | Full store page with nav, hero, product grid, and chatbot |
| `test.html` | Bare minimum for quick testing |

Run samples:

```bash
npm run dev:samples
```

Then visit http://localhost:3000

---

## 🏗️ Development

To build the widget:

```bash
npm run build          # Build React app
npm run build:widget   # Build standalone IIFE bundle
npm run dev           # Development server
npm run lint          # ESLint
```

---

## 📄 License

MIT

---

## 🛠️ For Contributors

### React + TypeScript + Vite

This project is built with React, TypeScript, and Vite for HMR and ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
