# React Native Sample

Demonstrates two integration approaches for the chatbot plugin in a React Native (Expo) app.

| Tab | Approach | Best for |
|-----|----------|----------|
| **WebView** | Embeds the web widget bundle in a `WebView` | Zero native code — drop-in the existing web widget |
| **Native** | Fully native chat UI built with React Native components | Custom look, offline-capable, deep RN integration |

## Requirements

- **Node.js** 18+
- **Expo Go** app on your device — must be **SDK 54** (version 54.x). Check: open Expo Go → Profile tab → version shown at the bottom. If older, update from the Play Store / App Store.

## Run the sample

```bash
cd samples/react-native
npm install
npx expo start --clear
```

Scan the QR code with Expo Go, or press `a` for Android emulator / `i` for iOS simulator.

## WebView tab

Loads the built widget bundle from jsDelivr CDN and initialises it with the sample product catalogue.

**Why jsDelivr and not `raw.githubusercontent.com`?**  
GitHub's raw file server sends files as `text/plain`. Browsers and WebViews refuse to execute scripts with the wrong MIME type, so the widget would silently fail to load. jsDelivr proxies the same GitHub file but serves it with the correct `Content-Type: application/javascript`.

The widget URL used:
```
https://cdn.jsdelivr.net/gh/umair6066/chatbot-plugin@main/dist-widget/chatbot-widget.iife.js
```

> **Note:** If you push a new build and the WebView shows the old version, purge the jsDelivr cache:
> `https://purge.jsdelivr.net/gh/umair6066/chatbot-plugin@main/dist-widget/chatbot-widget.iife.js`

## Native tab

A fully native chat UI built with React Native components. Supports the same query patterns as the web widget:

- **All-fields search** — "rolex", "blue dial", "ref=116610LN" all work
- **Price range** — "under 10k", "between 5k and 20k", "over 50k"
- **Browse intents** — "what do you have?", "what's in stock?", "show me prices", "cheapest", "most expensive"
- **Context-aware suggestion chips** — chips update after every reply, older ones grey out
- **Keyboard-safe input** — `KeyboardAvoidingView` keeps the text field visible
- **Auto-scroll** — message list scrolls to the latest message automatically

## Project structure

```
samples/react-native/
├── App.tsx          # Both WebView and native chat UI
├── app.json         # Expo config (sdkVersion: 54.0.0)
├── babel.config.js  # Uses babel-preset-expo
├── metro.config.js  # Expo Metro config
└── package.json
```

## Updating the widget

When you rebuild the widget (`npm run build` in the root), commit and push `dist-widget/` so jsDelivr can serve the new version:

```bash
git add dist-widget/
git commit -m "chore: rebuild widget"
git push
```

Then purge the jsDelivr cache (URL above) and reload the app.
