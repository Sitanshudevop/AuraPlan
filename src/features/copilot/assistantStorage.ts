import { EventData } from '../../types/event';
import { AssistantMessage } from '../../services/planningAssistantService';

const memoryMessageStore = new Map<string, AssistantMessage[]>();
const memoryLabelStore = new Map<string, string[]>();

export function getAssistantStorageKey(event: EventData): string {
  return `auraplan_assistant_msgs_${event.id || event.name}`;
}

export function getExecutedLabelsKey(event: EventData): string {
  return `auraplan_assistant_labels_${event.id || event.name}`;
}

export function createInitialWelcomeMessage(event: EventData): AssistantMessage {
  return {
    id: `ai-welcome-${event.id || 'default'}`,
    role: 'assistant',
    timestamp: 'Just now',
    source: 'offline',
    model: 'system-greeter',
    content: `Hello! I am your AI assistant for **${event.name}** (${event.type} mode).\n\nAsk about vendor negotiations, buffer times, permits, or select a suggested prompt below.`,
  };
}

export function loadAssistantMessages(event: EventData): AssistantMessage[] {
  const key = getAssistantStorageKey(event);
  if (memoryMessageStore.has(key)) {
    return memoryMessageStore.get(key)!;
  }
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const raw = window.sessionStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryMessageStore.set(key, parsed);
          return parsed;
        }
      }
    }
  } catch {
    // sessionStorage not available or throws in sandboxes
  }
  const welcome = [createInitialWelcomeMessage(event)];
  memoryMessageStore.set(key, welcome);
  return welcome;
}

export function saveAssistantMessages(event: EventData, messages: AssistantMessage[]): void {
  const key = getAssistantStorageKey(event);
  memoryMessageStore.set(key, messages);
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(key, JSON.stringify(messages));
    }
  } catch {
    // ignore
  }
}

export function loadExecutedLabels(event: EventData): Set<string> {
  const key = getExecutedLabelsKey(event);
  if (memoryLabelStore.has(key)) {
    return new Set(memoryLabelStore.get(key));
  }
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const raw = window.sessionStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          memoryLabelStore.set(key, parsed);
          return new Set(parsed);
        }
      }
    }
  } catch {
    // ignore
  }
  return new Set();
}

export function saveExecutedLabels(event: EventData, labels: Set<string>): void {
  const key = getExecutedLabelsKey(event);
  const arr = Array.from(labels);
  memoryLabelStore.set(key, arr);
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(key, JSON.stringify(arr));
    }
  } catch {
    // ignore
  }
}

export function clearAssistantStorage(event?: EventData): void {
  if (event) {
    const msgKey = getAssistantStorageKey(event);
    const labelKey = getExecutedLabelsKey(event);
    memoryMessageStore.delete(msgKey);
    memoryLabelStore.delete(labelKey);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(msgKey);
        window.sessionStorage.removeItem(labelKey);
      }
    } catch {
      // ignore
    }
  } else {
    memoryMessageStore.clear();
    memoryLabelStore.clear();
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.clear();
      }
    } catch {
      // ignore
    }
  }
}

