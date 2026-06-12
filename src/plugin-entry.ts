import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { ChatbotWidget } from './plugin/ChatbotWidget';
import type { ChatbotWidgetProps } from './plugin/ChatbotWidget';

let mounted = false;

function init(options: ChatbotWidgetProps = {}) {
  if (mounted) {
    console.warn('[ChatbotWidget] init() called more than once — ignoring.');
    return;
  }

  const container = document.createElement('div');
  container.id = 'chatbot-widget-root';
  document.body.appendChild(container);

  createRoot(container).render(createElement(ChatbotWidget, options));
  mounted = true;
}

(window as unknown as Record<string, unknown>).ChatbotWidget = { init };
