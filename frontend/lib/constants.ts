export const API_TIMEOUT = {
  DEFAULT: 10000,
  AI_RESPONSE: 35000,
} as const;

export const SCROLL_DELAY = 50;
export const SCROLL_RESET_DELAY = 300;

export const MAX_MESSAGE_LENGTH = 500;
export const MAX_CONTEXT_MESSAGES = 15;

export const ERROR_MESSAGES = {
  TIMEOUT: 'Request timeout. Please check your connection.',
  TIMEOUT_RETRY: 'Request timeout. Please try again.',
  AI_TIMEOUT: 'Request timeout after 35s. The AI model is too slow. Consider using a smaller model like llama3.2:1b or phi3:mini for faster responses.',
  CONNECTION_ERROR: 'Cannot connect to server. Make sure the backend is running.',
  REQUEST_CANCELLED: 'Request was cancelled',
  MODEL_NOT_FOUND: 'Model not found. Please pull the model first using: ollama pull <model-name>',
  OLLAMA_UNAVAILABLE: 'Ollama service is unavailable. Please make sure Ollama is running.',
  OLLAMA_TIMEOUT: 'Request timeout. Ollama is taking too long to respond.',
} as const;
