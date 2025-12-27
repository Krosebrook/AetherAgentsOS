
export enum ModelType {
  FLASH = 'gemini-3-flash-preview',
  PRO = 'gemini-3-pro-preview',
  IMAGE = 'gemini-2.5-flash-image',
  IMAGEN = 'imagen-4.0-generate-001'
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'search';
  metadata?: {
    model?: string;
    urls?: { uri: string; title: string }[];
    imageUrl?: string;
  };
}

export interface AgentConfig {
  name: string;
  systemInstruction: string;
  model: ModelType;
  temperature: number;
  useSearch: boolean;
}

export interface InferenceMetric {
  timestamp: string;
  tokens: number;
  latency: number;
}
