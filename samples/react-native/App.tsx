import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const WEBVIEW_HTML = `
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
        productsUrl: 'https://cdn.jsdelivr.net/gh/umair6066/chatbot-plugin@main/dist-widget/products.json'
      });
    </script>
  </body>
</html>
`;

const products = [
  { name: 'Wireless Headphones', description: 'Premium noise-cancelling audio, 30h battery', price: 149.99, category: 'Electronics', inStock: true },
  { name: 'Mechanical Keyboard', description: 'Tactile switches, RGB backlit, compact TKL layout', price: 89.99, category: 'Electronics', inStock: true },
  { name: 'Standing Desk', description: 'Motorised height-adjustable, 120x60 cm top', price: 599.00, category: 'Furniture', inStock: false },
  { name: 'Desk Lamp', description: 'LED, adjustable colour temperature 2700–6500K', price: 34.99, category: 'Furniture', inStock: true },
];

const SUGGESTIONS = [
  'What products do you have?',
  "What's in stock?",
  'Show me prices',
  'Tell me about Wireless Headphones',
];

type Message = { id: string; sender: 'bot' | 'user'; text: string };

function getBotReply(input: string): string {
  const q = input.toLowerCase();

  if (q.includes('product') || q.includes('have') || q.includes('sell')) {
    return 'We carry: ' + products.map(p => p.name).join(', ') + '.';
  }
  if (q.includes('stock') || q.includes('available')) {
    const inStock = products.filter(p => p.inStock).map(p => p.name);
    const outOfStock = products.filter(p => !p.inStock).map(p => p.name);
    return `In stock: ${inStock.join(', ')}. Out of stock: ${outOfStock.join(', ')}.`;
  }
  if (q.includes('price') || q.includes('cost') || q.includes('how much')) {
    return products.map(p => `${p.name}: $${p.price.toFixed(2)}`).join('\n');
  }
  for (const p of products) {
    if (q.includes(p.name.toLowerCase())) {
      return `${p.name} — ${p.description}. Price: $${p.price.toFixed(2)}. ${p.inStock ? 'In stock.' : 'Currently out of stock.'}`;
    }
  }
  return "I'm not sure about that. Try asking about our products, prices, or stock availability.";
}

export default function App() {
  const [viewMode, setViewMode] = useState<'webview' | 'native'>('webview');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: 'Hi there! 👋 How can I help you today?' },
  ]);
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const send = (msg: string) => {
    if (!msg.trim()) return;
    const userMsg: Message = { id: String(Date.now()), sender: 'user', text: msg };
    const botMsg: Message = { id: String(Date.now() + 1), sender: 'bot', text: getBotReply(msg) };
    setMessages(prev => [...prev, userMsg, botMsg]);
    setText('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabButton, viewMode === 'webview' && styles.activeTab]}
            onPress={() => setViewMode('webview')}>
            <Text style={[styles.tabText, viewMode === 'webview' && styles.activeTabText]}>WebView</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, viewMode === 'native' && styles.activeTab]}
            onPress={() => setViewMode('native')}>
            <Text style={[styles.tabText, viewMode === 'native' && styles.activeTabText]}>Native</Text>
          </TouchableOpacity>
        </View>

        {viewMode === 'webview' ? (
          <View style={styles.webviewContainer}>
            <WebView originWhitelist={['*']} source={{ html: WEBVIEW_HTML }} javaScriptEnabled />
          </View>
        ) : (
          <KeyboardAvoidingView
            style={styles.nativeContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>Chat Support</Text>
            </View>

            <ScrollView
              ref={scrollRef}
              style={styles.messageScroll}
              contentContainerStyle={styles.messageList}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
              {messages.map(item => (
                <View
                  key={item.id}
                  style={[styles.messageBubble, item.sender === 'bot' ? styles.botBubble : styles.userBubble]}>
                  <Text style={item.sender === 'bot' ? styles.botText : styles.userText}>{item.text}</Text>
                </View>
              ))}

              {messages.length === 1 && (
                <View style={styles.suggestionsContainer}>
                  {SUGGESTIONS.map(s => (
                    <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => send(s)}>
                      <Text style={styles.suggestionText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={text}
                onChangeText={setText}
                placeholder="Type a message..."
                onSubmitEditing={() => send(text)}
                returnKeyType="send"
              />
              <TouchableOpacity style={styles.sendButton} onPress={() => send(text)}>
                <Text style={styles.sendText}>Send</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  tabRow: { flexDirection: 'row', padding: 12 },
  tabButton: { flex: 1, padding: 10, marginHorizontal: 4, borderRadius: 8, backgroundColor: '#e2e8f0', alignItems: 'center' },
  activeTab: { backgroundColor: '#6366f1' },
  tabText: { color: '#1f2937', fontWeight: '600' },
  activeTabText: { color: '#fff' },
  webviewContainer: { flex: 1, borderRadius: 12, overflow: 'hidden', margin: 12, borderWidth: 1, borderColor: '#cbd5e1' },
  nativeContainer: { flex: 1, margin: 12, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', overflow: 'hidden' },
  chatHeader: { padding: 14, backgroundColor: '#6366f1' },
  chatTitle: { color: '#fff', fontWeight: '700', fontSize: 16 },
  messageScroll: { flex: 1 },
  messageList: { padding: 12, paddingBottom: 8 },
  messageBubble: { marginBottom: 10, padding: 12, borderRadius: 16, maxWidth: '75%' },
  botBubble: { backgroundColor: '#f1f5f9', alignSelf: 'flex-start' },
  userBubble: { backgroundColor: '#6366f1', alignSelf: 'flex-end' },
  botText: { color: '#111827', fontSize: 14, lineHeight: 20 },
  userText: { color: '#fff', fontSize: 14, lineHeight: 20 },
  suggestionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  suggestionChip: { borderWidth: 1, borderColor: '#6366f1', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  suggestionText: { color: '#6366f1', fontSize: 13 },
  inputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0', backgroundColor: '#fff' },
  input: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, marginRight: 8, fontSize: 14 },
  sendButton: { paddingHorizontal: 16, justifyContent: 'center', backgroundColor: '#6366f1', borderRadius: 8 },
  sendText: { color: '#fff', fontWeight: '700' },
});
