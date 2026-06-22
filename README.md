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

### **Advanced Usage with Options**

```tsx
import { ChatbotWidget } from 'chatbot-plugin';

function App() {
  return (
    <ChatbotWidget
      position="bottom-right"
      primaryColor="#6366f1"
      welcomeMessage="Hi! How can I help you today? 👋"
      productsUrl="/api/products"
      suggestions={[
        'What products do you have?',
        'Tell me about shipping',
        "What's the cheapest item?"
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

const products: Product[] = [
  {
    id: '1',
    name: 'Laptop',
    price: 999,
    description: 'High-performance laptop'
  },
  {
    id: '2',
    name: 'Headphones',
    price: 199,
    description: 'Wireless headphones'
  }
];

function App() {
  return <ChatbotWidget products={products} />;
}

export default App;
```

---

## ⚙️ Configuration Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `'bottom-right'` \| `'bottom-left'` | `'bottom-right'` | Widget position on screen |
| `primaryColor` | `string` | `'#6366f1'` | Primary color (hex/rgb) |
| `welcomeMessage` | `string` | `'Hi there! 👋 How can I help you today?'` | Initial greeting message |
| `productsUrl` | `string` | - | URL to fetch products JSON |
| `products` | `Product[]` | `[]` | Inline product array |
| `suggestions` | `string[]` | - | Array of suggested questions |

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

- `basic.html` — Simple setup
- `ecommerce.html` — With products
- `custom-suggestions.html` — With custom suggestions
- `with-products-url.html` — Loading products from URL

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
