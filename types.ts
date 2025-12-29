
export enum ModelType {
  FLASH = 'gemini-3-flash-preview',
  PRO = 'gemini-3-pro-preview',
  LITE = 'gemini-flash-lite-latest',
  IMAGE = 'gemini-2.5-flash-image',
  IMAGEN = 'imagen-4.0-generate-001'
}

export enum NodeType {
  AGENT = 'agent',
  TOOL = 'tool',
  GUARDRAIL = 'guardrail',
  CODE = 'code',
  DOCS = 'docs',
  TRIGGER = 'trigger'
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  position: { x: number; y: number };
  status?: 'idle' | 'running' | 'error' | 'success';
  data: {
    instruction?: string;
    model?: ModelType;
    toolType?: 'search' | 'maps' | 'image' | 'audio';
    code?: string;
    rules?: string[];
    thinkingBudget?: number;
    searchQuery?: string;
    temperature?: number;
    safetyFilters?: boolean;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface AgentConfig {
  name: string;
  systemInstruction: string;
  model: ModelType;
  temperature: number;
  useSearch: boolean;
  searchQuery?: string;
  thinkingBudget: number;
  safetyFilters?: boolean;
}

export interface Agent extends AgentConfig {
  id: string;
  health?: number; // 0-100
  lastLatency?: number;
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
    agentId?: string;
    latency?: number;
    tokens?: number;
  };
}

export interface InferenceMetric {
  name: string;
  tokens: number;
  latency: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'critical';
  source: string;
  message: string;
}

export interface TerminalResponse {
  id: string;
  command: string;
  response: any;
  timestamp: number;
  status: 'success' | 'error' | 'loading';
}

export interface ApiKeyState {
  [provider: string]: string;
}
