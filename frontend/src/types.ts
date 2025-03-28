export interface SearchResult {
  question: string;
  answer: string;
  timestamp: string;
  cached?: boolean;
  error?: boolean;
  streaming?: boolean;
}

export interface HistoryItem extends SearchResult {}

export interface ToastOptions {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
} 