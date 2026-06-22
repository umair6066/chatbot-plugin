import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const REACT_NATIVE_WEBVIEW_HTML = `
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
        productsUrl: 'https://raw.githubusercontent.com/umair6066/chatbot-plugin/main/samples/products.json'
      });
    </script>
  </body>
</html>
`;

const sampleMessages = [
  { id: '1', sender: 'bot', text: 'Hi there! 👋 How can I help you today?' }
];

export default function App() {
  const [viewMode, setViewMode] = useState<'webview' | 'native'>('webview');
  const [messages, setMessages] = useState(sampleMessages);
  const [text, setText] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  const sendMessage = () => {
    if (!text.trim()) return;
    const user = { id: String(Date.now()), sender: 'user', text };
    setMessages(prev => [...prev, user, { id: String(Date.now() + 1), sender: 'bot', text: 'This is a placeholder bot response.' }]);
    setText('');
  };

  return (
    <SafeAreaProvider>
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tabButton, viewMode === 'webview' && styles.activeTab]} onPress={() => setViewMode('webview')}>
          <Text style={styles.tabText}>WebView</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, viewMode === 'native' && styles.activeTab]} onPress={() => setViewMode('native')}>
          <Text style={styles.tabText}>Native</Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'webview' ? (
        <View style={styles.webviewContainer}>
          <WebView originWhitelist={['*']} source={{ html: REACT_NATIVE_WEBVIEW_HTML }} />
        </View>
      ) : (
        <View style={styles.nativeContainer}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>Native Chatbot Demo</Text>
          </View>
          <FlatList
            data={messages}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messageList}
            renderItem={({ item }) => (
              <View style={[styles.messageBubble, item.sender === 'bot' ? styles.botBubble : styles.userBubble]}>
                <Text style={item.sender === 'bot' ? styles.botText : styles.userText}>{item.text}</Text>
              </View>
            )}
          />
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Type a message..."
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  tabRow: { flexDirection: 'row', padding: 12, justifyContent: 'center' },
  tabButton: { flex: 1, padding: 10, marginHorizontal: 4, borderRadius: 8, backgroundColor: '#e2e8f0', alignItems: 'center' },
  activeTab: { backgroundColor: '#6366f1' },
  tabText: { color: '#1f2937', fontWeight: '600' },
  webviewContainer: { flex: 1, borderRadius: 12, overflow: 'hidden', margin: 12, borderWidth: 1, borderColor: '#cbd5e1' },
  nativeContainer: { flex: 1, margin: 12, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', overflow: 'hidden' },
  chatHeader: { padding: 12, backgroundColor: '#6366f1' },
  chatTitle: { color: '#fff', fontWeight: '700' },
  messageList: { padding: 12 },
  messageBubble: { marginBottom: 10, padding: 12, borderRadius: 16, maxWidth: '70%' },
  botBubble: { backgroundColor: '#e2e8f0', alignSelf: 'flex-start' },
  userBubble: { backgroundColor: '#6366f1', alignSelf: 'flex-end' },
  botText: { color: '#111827' },
  userText: { color: '#fff' },
  inputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  input: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, marginRight: 8 },
  sendButton: { paddingHorizontal: 16, justifyContent: 'center', backgroundColor: '#6366f1', borderRadius: 8 },
  sendText: { color: '#fff', fontWeight: '700' }
});
