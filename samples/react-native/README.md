# React Native Sample

This sample project demonstrates how to use the chatbot plugin in React Native.

## What is included

- **WebView demo**: loads the existing web widget bundle from GitHub.
- **Native UI demo**: sample mobile chat screen for a React Native app.

## Run the sample

```bash
cd samples/react-native
npm install
npx expo start
```

Then open the app in Expo Go or a simulator.

## Verify both approaches

### WebView

- Open the app.
- Select the `WebView` tab.
- Confirm the chat widget loads and displays.
- Verify you can type a message and see the widget UI.

### Native UI

- Select the `Native` tab.
- Confirm the sample native chat UI appears.
- Type a message and verify the sample response behavior.

## Notes

- The WebView demo uses the GitHub-hosted widget bundle:
  `https://raw.githubusercontent.com/umair6066/chatbot-plugin/main/dist-widget/chatbot-widget.iife.js`
- For production, host the widget bundle yourself or use a private asset URL.