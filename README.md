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

Then visit `http://localhost:3000`

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
