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

// ---------------------------------------------------------------------------
// WebView tab — uses the full web widget from CDN (all features included)
// ---------------------------------------------------------------------------

// Bump this version string after every `npm run build:widget` + push
// so the WebView bypasses its HTTP cache and fetches the latest bundle.
const WIDGET_VERSION = '93431be';

const CDN = `https://cdn.jsdelivr.net/gh/umair6066/chatbot-plugin@main/dist-widget`;

const WEBVIEW_HTML = `
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="${CDN}/chatbot-widget.iife.js?v=${WIDGET_VERSION}"></script>
  </head>
  <body style="margin: 0; padding: 0;">
    <script>
      window.ChatbotWidget.init({
        title: 'Watch Support',
        subtitle: 'Search our inventory',
        position: 'bottom-right',
        primaryColor: '#6366f1',
        productsUrl: '${CDN}/products.json?v=${WIDGET_VERSION}'
      });
    </script>
  </body>
</html>
`;

// ---------------------------------------------------------------------------
// Native tab — watch catalog (mirrors samples/products.json)
// ---------------------------------------------------------------------------

const PRODUCTS = [
  { name: 'Rolex, Submariner Date, 116610LN, 2019, Steel',              price: 12850, model: 'Submariner Date',         reg: '116610LN',             metal: 'Steel', dial: 'Black',      inStock: true  },
  { name: 'Omega, Seamaster 300M, 210.30.42.20.01.001, 2021, Steel',    price: 5200,  model: 'Seamaster 300M',          reg: '210.30.42.20.01.001',  metal: 'Steel', dial: 'Blue',       inStock: true  },
  { name: 'Rolex, Daytona, 116500LN, 2020, Steel',                      price: 38500, model: 'Daytona',                 reg: '116500LN',             metal: 'Steel', dial: 'White',      inStock: true  },
  { name: 'Patek Philippe, Nautilus, 5711/1A-010, 2018, Steel',         price: 95000, model: 'Nautilus',                reg: '5711/1A-010',          metal: 'Steel', dial: 'Blue',       inStock: true  },
  { name: 'Audemars Piguet, Royal Oak, 15400ST, 2017, Steel',           price: 42000, model: 'Royal Oak',              reg: '15400ST',              metal: 'Steel', dial: 'Blue',       inStock: true  },
  { name: 'Rolex, GMT-Master II, 126710BLNR, 2022, Steel',              price: 16500, model: 'GMT-Master II',          reg: '126710BLNR',           metal: 'Steel', dial: 'Black',      inStock: true  },
  { name: 'Omega, Speedmaster Professional, 310.30.42.50.01.001, 2020, Steel', price: 6800, model: 'Speedmaster Professional', reg: '310.30.42.50.01.001', metal: 'Steel', dial: 'Black', inStock: false },
  { name: 'IWC, Portugieser Chronograph, IW371605, 2019, Steel',        price: 7200,  model: 'Portugieser Chronograph', reg: 'IW371605',            metal: 'Steel', dial: 'Silver',     inStock: true  },
  { name: 'Cartier, Santos Large, WSSA0018, 2021, Steel',               price: 8500,  model: 'Santos Large',           reg: 'WSSA0018',             metal: 'Steel', dial: 'Silver',     inStock: true  },
  { name: 'Rolex, Datejust 41, 126334, 2023, Steel',                    price: 9800,  model: 'Datejust 41',            reg: '126334',               metal: 'Steel', dial: 'Blue Motif', inStock: true  },
];

type Product = typeof PRODUCTS[number];
type BotReply = { text: string; suggestions: string[] };
type Message  = { id: string; sender: 'bot' | 'user'; text: string; suggestions?: string[] };

const fmt = (p: number) => `$${p.toLocaleString()}`;

function parsePrice(str: string): number {
  const s = str.replace(/[$, ]/g, '').toLowerCase();
  return s.endsWith('k') ? parseFloat(s) * 1000 : parseFloat(s);
}

function productLine(p: Product): string {
  return `${p.name}\n${fmt(p.price)} · ${p.inStock ? 'Available' : 'Temporarily unavailable'}`;
}

function getBotReply(input: string): BotReply {
  const q = input.toLowerCase().trim();

  const fallback: BotReply = {
    text: "I didn't quite catch that — try a brand, model, or ref number.",
    suggestions: ["What do you have?", "What's in stock?", "Show me prices"],
  };

  // Greetings
  if (/^(hi+|hello|hey|thanks?|thank\s+you|bye)[\s!,.?]*$/i.test(input)) {
    return {
      text: 'Hi! Looking for something specific or just browsing?',
      suggestions: ["What do you have?", "What's in stock?", "Show me prices"],
    };
  }

  // Cheapest
  if (/\b(cheap|cheapest|budget|affordable|lowest price|best price)\b/i.test(q)) {
    const p = PRODUCTS.reduce((a, b) => a.price < b.price ? a : b);
    return {
      text: `The most affordable one:\n\n${productLine(p)}`,
      suggestions: [`Tell me about ${p.name}`, 'Show me prices', "What's in stock?"],
    };
  }

  // Most expensive
  if (/\b(expensive|priciest|premium|most expensive|top of the range)\b/i.test(q)) {
    const p = PRODUCTS.reduce((a, b) => a.price > b.price ? a : b);
    return {
      text: `Top of the range:\n\n${productLine(p)}`,
      suggestions: [`Tell me about ${p.name}`, 'Show me prices', "What's in stock?"],
    };
  }

  // Price range — under / over / between
  let priceMin = -Infinity, priceMax = Infinity, priceMatched = false;

  const betweenM = q.match(/between\s*\$?\s*([\d,.k]+)\s*(?:and|to|-)\s*\$?\s*([\d,.k]+)/i);
  if (betweenM) { priceMin = parsePrice(betweenM[1]); priceMax = parsePrice(betweenM[2]); priceMatched = true; }

  if (!priceMatched) {
    const underM = q.match(/(?:under|less than|below|max|up to)\s*\$?\s*([\d,.k]+)/i);
    if (underM) { priceMax = parsePrice(underM[1]); priceMatched = true; }
  }
  if (!priceMatched) {
    const overM = q.match(/(?:over|more than|above|at least)\s*\$?\s*([\d,.k]+)/i);
    if (overM) { priceMin = parsePrice(overM[1]); priceMatched = true; }
  }

  if (priceMatched) {
    const filtered = PRODUCTS
      .filter(p => p.price >= priceMin && p.price <= priceMax)
      .sort((a, b) => a.price - b.price);

    if (filtered.length === 0) {
      return {
        text: 'Nothing in that price range — try a wider range.',
        suggestions: ["Show me prices", "Under 15k", "Between 5k and 20k"],
      };
    }

    const rangeDesc =
      priceMax === Infinity  ? `over ${fmt(priceMin)}` :
      priceMin === -Infinity ? `under ${fmt(priceMax)}` :
      `${fmt(priceMin)}–${fmt(priceMax)}`;

    return {
      text: `${filtered.length} watch${filtered.length !== 1 ? 'es' : ''} in that range (${rangeDesc}):\n\n` +
        filtered.slice(0, 5).map(productLine).join('\n\n'),
      suggestions: filtered.slice(0, 3).map(p => `Tell me about ${p.name}`),
    };
  }

  // Stock
  if (/\b(in stock|out of stock|available|stock|inventory)\b/i.test(q)) {
    const inStock = PRODUCTS.filter(p => p.inStock);
    const outCount = PRODUCTS.length - inStock.length;
    return {
      text: `${inStock.length} available${outCount > 0 ? `, ${outCount} temporarily unavailable` : ''}:\n\n` +
        inStock.slice(0, 5).map(p => `• ${p.name} — ${fmt(p.price)}`).join('\n'),
      suggestions: inStock.slice(0, 3).map(p => `Tell me about ${p.name}`),
    };
  }

  // Prices
  if (/\b(prices?|cost|how much|pricing)\b/i.test(q)) {
    const sorted = [...PRODUCTS].sort((a, b) => a.price - b.price);
    return {
      text: "Here's our range, cheapest first:\n\n" +
        sorted.map(p => `• ${p.model} — ${fmt(p.price)}`).join('\n'),
      suggestions: [
        `Tell me about ${sorted[0].name}`,
        `Tell me about ${sorted[sorted.length - 1].name}`,
        "What's in stock?",
      ],
    };
  }

  // Browse all
  if (
    /\bwhat do you (have|carry|sell)\b/i.test(q) ||
    (/\b(all|what|list|show|catalog)\b/i.test(q) && /\b(product|watch|item)\b/i.test(q))
  ) {
    return {
      text: `We carry ${PRODUCTS.length} watches:\n\n` +
        PRODUCTS.slice(0, 5).map(p => `• ${p.name} — ${fmt(p.price)}`).join('\n') +
        (PRODUCTS.length > 5 ? `\n…and ${PRODUCTS.length - 5} more` : ''),
      suggestions: PRODUCTS.slice(0, 3).map(p => `Tell me about ${p.name}`),
    };
  }

  // All-fields search — every term must appear somewhere in the product
  const terms = q
    .replace(/\b(?:ref|serial|reg|model|metal|dial)=(\S+)/gi, '$1')
    .replace(DETAIL_STRIP, '')
    .trim()
    .split(/\s+/)
    .filter(t => t.length > 1);

  if (terms.length > 0) {
    const matches = PRODUCTS.filter(p => {
      const text = JSON.stringify(p).toLowerCase();
      return terms.every(t => text.includes(t));
    });

    if (matches.length === 1) {
      const p = matches[0];
      const others = PRODUCTS.filter(x => x !== p).slice(0, 2);
      return {
        text: productLine(p),
        suggestions: [
          ...others.map(x => `Tell me about ${x.name}`),
          "What's in stock?",
        ].slice(0, 3),
      };
    }

    if (matches.length > 1) {
      return {
        text: `Found ${matches.length} match${matches.length !== 1 ? 'es' : ''}:\n\n` +
          matches.slice(0, 5).map(productLine).join('\n\n'),
        suggestions: matches.slice(0, 3).map(p => `Tell me about ${p.name}`),
      };
    }
  }

  return fallback;
}

// Strip intent phrases before searching (mirrors web plugin's DETAIL_PATTERNS)
const DETAIL_STRIP =
  /\b(tell me about|details|more about|describe|specs|this one|about it)\b/gi;

const WELCOME_SUGGESTIONS = [
  "What do you have?",
  "What's in stock?",
  'Show me prices',
  `Tell me about ${PRODUCTS[0].name}`,
];

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  const [viewMode, setViewMode] = useState<'webview' | 'native'>('webview');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Hi! 👋 Looking for something specific or just browsing?',
      suggestions: WELCOME_SUGGESTIONS,
    },
  ]);
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const send = (msg: string) => {
    if (!msg.trim()) return;

    const userMsg: Message = { id: String(Date.now()), sender: 'user', text: msg };
    const reply = getBotReply(msg);
    const botMsg: Message = {
      id: String(Date.now() + 1),
      sender: 'bot',
      text: reply.text,
      suggestions: reply.suggestions,
    };

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
              <Text style={styles.chatTitle}>Watch Support</Text>
              <Text style={styles.chatSubtitle}>Search our inventory</Text>
            </View>

            <ScrollView
              ref={scrollRef}
              style={styles.messageScroll}
              contentContainerStyle={styles.messageList}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>

              {messages.map((item, idx) => {
                const isLastMessage = idx === messages.length - 1;
                return (
                  <View key={item.id}>
                    <View style={[
                      styles.messageBubble,
                      item.sender === 'bot' ? styles.botBubble : styles.userBubble,
                    ]}>
                      <Text style={item.sender === 'bot' ? styles.botText : styles.userText}>
                        {item.text}
                      </Text>
                    </View>

                    {item.sender === 'bot' && item.suggestions && (
                      <View style={[
                        styles.suggestionsContainer,
                        !isLastMessage && styles.suggestionsInactive,
                      ]}>
                        {item.suggestions.map(s => (
                          <TouchableOpacity
                            key={s}
                            style={[
                              styles.suggestionChip,
                              !isLastMessage && styles.suggestionChipInactive,
                            ]}
                            onPress={() => isLastMessage && send(s)}
                            activeOpacity={isLastMessage ? 0.7 : 1}>
                            <Text style={[
                              styles.suggestionText,
                              !isLastMessage && styles.suggestionTextInactive,
                            ]}>
                              {s}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={text}
                onChangeText={setText}
                placeholder="Type a message…"
                placeholderTextColor="#9ca3af"
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

const PRIMARY = '#6366f1';

const styles = StyleSheet.create({
  container:              { flex: 1, backgroundColor: '#f8fafc' },
  tabRow:                 { flexDirection: 'row', padding: 12 },
  tabButton:              { flex: 1, padding: 10, marginHorizontal: 4, borderRadius: 8, backgroundColor: '#e2e8f0', alignItems: 'center' },
  activeTab:              { backgroundColor: PRIMARY },
  tabText:                { color: '#1f2937', fontWeight: '600' },
  activeTabText:          { color: '#fff' },

  webviewContainer:       { flex: 1, borderRadius: 12, overflow: 'hidden', margin: 12, borderWidth: 1, borderColor: '#cbd5e1' },
  nativeContainer:        { flex: 1, margin: 12, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', overflow: 'hidden' },

  chatHeader:             { padding: 14, backgroundColor: PRIMARY },
  chatTitle:              { color: '#fff', fontWeight: '700', fontSize: 16 },
  chatSubtitle:           { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 1 },

  messageScroll:          { flex: 1 },
  messageList:            { padding: 12, paddingBottom: 8 },
  messageBubble:          { marginBottom: 6, padding: 12, borderRadius: 16, maxWidth: '80%' },
  botBubble:              { backgroundColor: '#f1f5f9', alignSelf: 'flex-start' },
  userBubble:             { backgroundColor: PRIMARY, alignSelf: 'flex-end' },
  botText:                { color: '#111827', fontSize: 14, lineHeight: 20 },
  userText:               { color: '#fff', fontSize: 14, lineHeight: 20 },

  suggestionsContainer:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10, paddingLeft: 4 },
  suggestionsInactive:    { opacity: 0.4 },
  suggestionChip:         { borderWidth: 1.5, borderColor: PRIMARY, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  suggestionChipInactive: { borderColor: '#9ca3af' },
  suggestionText:         { color: PRIMARY, fontSize: 12 },
  suggestionTextInactive: { color: '#9ca3af' },

  inputRow:               { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0', backgroundColor: '#fff' },
  input:                  { flex: 1, padding: 12, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, marginRight: 8, fontSize: 14, color: '#111827' },
  sendButton:             { paddingHorizontal: 16, justifyContent: 'center', backgroundColor: PRIMARY, borderRadius: 8 },
  sendText:               { color: '#fff', fontWeight: '700' },
});
