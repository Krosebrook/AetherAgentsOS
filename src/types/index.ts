/**
 * @fileoverview Core type definitions for AetherAgentsOS
 * @module types
 * @description Centralized TypeScript types, interfaces, and enums for the agent orchestration platform
 */

// =============================================================================
// ENUMS
// =============================================================================

/**
 * Available AI model types for agent inference
 */
export enum ModelType {
  /** Gemini 3 Flash - High speed, balanced latency */
  FLASH = 'gemini-3-flash-preview',
  /** Gemini 3 Pro - Advanced reasoning & complex logic */
  PRO = 'gemini-3-pro-preview',
  /** Gemini Flash Lite - Optimized for high-efficiency */
  LITE = 'gemini-flash-lite-latest',
  /** Gemini 2.5 Flash Image - Image understanding */
  IMAGE = 'gemini-2.5-flash-image',
  /** Imagen 4.0 - Image generation */
  IMAGEN = 'imagen-4.0-generate-001'
}

/**
 * Workflow node types for canvas-based orchestration
 */
export enum NodeType {
  /** AI Agent node */
  AGENT = 'agent',
  /** External tool integration */
  TOOL = 'tool',
  /** Safety guardrail */
  GUARDRAIL = 'guardrail',
  /** Code execution block */
  CODE = 'code',
  /** Documentation generator */
  DOCS = 'docs',
  /** Workflow trigger */
  TRIGGER = 'trigger'
}

/**
 * Log entry severity levels
 */
export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Agent health status categories
 */
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  CRITICAL = 'critical',
  OFFLINE = 'offline'
}

/**
 * Workflow node execution status
 */
export enum NodeStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  SUCCESS = 'success',
  ERROR = 'error'
}

// =============================================================================
// WORKFLOW TYPES
// =============================================================================

/**
 * Position coordinates for canvas elements
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Workflow node data configuration
 */
export interface WorkflowNodeData {
  instruction?: string;
  model?: ModelType;
  toolType?: 'search' | 'maps' | 'image' | 'audio';
  code?: string;
  rules?: string[];
  thinkingBudget?: number;
  searchQuery?: string;
  temperature?: number;
  safetyFilters?: boolean;
}

/**
 * Canvas workflow node
 */
export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  position: Position;
  status?: NodeStatus;
  data: WorkflowNodeData;
}

/**
 * Connection between workflow nodes
 */
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

/**
 * Predefined workflow template
 */
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

// =============================================================================
// AGENT TYPES
// =============================================================================

/**
 * Agent configuration parameters
 */
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

/**
 * Full agent instance with runtime state
 */
export interface Agent extends AgentConfig {
  id: string;
  health?: number; // 0-100
  lastLatency?: number;
  createdAt?: number;
  lastActiveAt?: number;
}

/**
 * Agent creation parameters
 */
export interface CreateAgentParams {
  name?: string;
  systemInstruction?: string;
  model?: ModelType;
  temperature?: number;
}

// =============================================================================
// MESSAGE TYPES
// =============================================================================

/**
 * Message roles in conversation
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Message content types
 */
export type MessageType = 'text' | 'image' | 'search' | 'error';

/**
 * URL reference from grounding
 */
export interface GroundingUrl {
  uri: string;
  title: string;
}

/**
 * Message metadata from inference
 */
export interface MessageMetadata {
  model?: string;
  urls?: GroundingUrl[];
  imageUrl?: string;
  agentId?: string;
  latency?: number;
  tokens?: number;
}

/**
 * Chat message structure
 */
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  type: MessageType;
  metadata?: MessageMetadata;
}

// =============================================================================
// METRICS & LOGGING TYPES
// =============================================================================

/**
 * Inference performance metric
 */
export interface InferenceMetric {
  name: string;
  tokens: number;
  latency: number;
  timestamp?: number;
}

/**
 * System log entry
 */
export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel | 'info' | 'warn' | 'error' | 'critical';
  source: string;
  message: string;
}

// =============================================================================
// TERMINAL TYPES
// =============================================================================

/**
 * Terminal command response status
 */
export type TerminalStatus = 'success' | 'error' | 'loading';

/**
 * Terminal command response
 */
export interface TerminalResponse {
  id: string;
  command: string;
  response: unknown;
  timestamp: number;
  status: TerminalStatus;
}

/**
 * Actionable error with remediation guidance
 */
export interface ActionableError {
  error: string;
  code: string;
  remediation: string;
  severity: 'high' | 'medium' | 'low';
  docs_link?: string;
}

// =============================================================================
// API & STATE TYPES
// =============================================================================

/**
 * API key storage state
 */
export interface ApiKeyState {
  [provider: string]: string;
}

/**
 * Generation result from AI model
 */
export interface GenerationResult {
  text: string;
  grounding?: GroundingChunk[];
  latency: number;
  modelUsed: string;
}

/**
 * Grounding chunk from search
 */
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
  };
}

// =============================================================================
// COMPONENT PROP TYPES
// =============================================================================

/**
 * Common component props with className
 */
export interface BaseComponentProps {
  className?: string;
}

/**
 * Props for components that handle loading states
 */
export interface LoadableProps {
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Navigation tab identifiers
 */
export type TabId = 'canvas' | 'chat' | 'metrics' | 'terminal' | 'orchestration';

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extract the type of array elements
 */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

/**
 * Callback function type for logging
 */
export type LogCallback = (
  level: LogEntry['level'],
  source: string,
  message: string
) => void;

/**
 * Callback for metric updates
 */
export type MetricUpdateCallback = (tokens: number, latency: number) => void;
