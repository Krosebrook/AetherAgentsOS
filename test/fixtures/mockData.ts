import { Agent, Message, ModelType, LogEntry, InferenceMetric } from '../../types';

export const mockAgent: Agent = {
  id: 'test-agent-1',
  name: 'Test Agent',
  systemInstruction: 'You are a test agent for unit testing.',
  model: ModelType.FLASH,
  temperature: 0.7,
  useSearch: false,
  thinkingBudget: 0,
  health: 100,
};

export const mockAgentWithSearch: Agent = {
  ...mockAgent,
  id: 'test-agent-search',
  name: 'Search Agent',
  useSearch: true,
  searchQuery: 'test query',
};

export const mockAgentWithThinking: Agent = {
  ...mockAgent,
  id: 'test-agent-thinking',
  name: 'Thinking Agent',
  thinkingBudget: 4096,
};

export const mockUserMessage: Message = {
  id: 'msg-1',
  role: 'user',
  content: 'Hello, this is a test message',
  timestamp: Date.now(),
  type: 'text',
};

export const mockAssistantMessage: Message = {
  id: 'msg-2',
  role: 'assistant',
  content: 'This is a test response',
  timestamp: Date.now(),
  type: 'text',
  metadata: {
    model: ModelType.FLASH,
    latency: 1234,
    tokens: 50,
  },
};

export const mockMessageWithGrounding: Message = {
  ...mockAssistantMessage,
  id: 'msg-3',
  metadata: {
    ...mockAssistantMessage.metadata,
    urls: [
      { uri: 'https://example.com/1', title: 'Example 1' },
      { uri: 'https://example.com/2', title: 'Example 2' },
    ],
  },
};

export const mockLogEntry: LogEntry = {
  id: 'log-1',
  timestamp: Date.now(),
  level: 'info',
  source: 'TEST',
  message: 'Test log entry',
};

export const mockInferenceMetric: InferenceMetric = {
  name: '12:00:00',
  tokens: 100,
  latency: 1.5,
};

export const mockAgents: Agent[] = [
  mockAgent,
  mockAgentWithSearch,
  mockAgentWithThinking,
];
