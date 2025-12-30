/**
 * @fileoverview Agent management hook
 * @module hooks/useAgents
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Agent, ModelType, CreateAgentParams, LogCallback } from '../types';
import { STORAGE_KEYS, DEFAULT_AGENT, AGENT_LIMITS } from '../constants';
import {
  generateId,
  getStorageItem,
  setStorageItem,
  simulateHealthFluctuation,
  calculateAverageHealth,
} from '../utils';

/**
 * Hook return type for agent management
 */
export interface UseAgentsReturn {
  /** All agents */
  agents: Agent[];
  /** Currently active agent */
  activeAgent: Agent;
  /** Active agent ID */
  activeAgentId: string;
  /** Set the active agent */
  setActiveAgentId: (id: string) => void;
  /** Add a new agent */
  addAgent: (params?: CreateAgentParams) => Agent;
  /** Update an existing agent */
  updateAgent: (agent: Agent) => void;
  /** Remove an agent */
  removeAgent: (id: string) => void;
  /** Average health across all agents */
  averageHealth: number;
  /** Whether at max agents limit */
  isAtLimit: boolean;
}

/**
 * Hook for managing agents with persistence and health monitoring
 *
 * @param onLog - Optional callback for logging events
 * @returns Agent management functions and state
 *
 * @example
 * ```tsx
 * const { agents, activeAgent, addAgent, removeAgent } = useAgents((level, source, msg) => {
 *   console.log(`[${level}] ${source}: ${msg}`);
 * });
 * ```
 */
export function useAgents(onLog?: LogCallback): UseAgentsReturn {
  // Initialize agents from storage or use default
  const [agents, setAgents] = useState<Agent[]>(() => {
    const saved = getStorageItem<Agent[]>(STORAGE_KEYS.AGENTS, []);
    if (saved.length > 0) return saved;

    const initialAgent: Agent = {
      id: 'core-01',
      ...DEFAULT_AGENT,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    };
    return [initialAgent];
  });

  const [activeAgentId, setActiveAgentId] = useState<string>(() => {
    return agents[0]?.id || 'core-01';
  });

  // Persist agents to storage
  useEffect(() => {
    setStorageItem(STORAGE_KEYS.AGENTS, agents);
  }, [agents]);

  // Health monitoring simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev =>
        prev.map(agent => ({
          ...agent,
          health: simulateHealthFluctuation(agent.health ?? 100),
        }))
      );
    }, AGENT_LIMITS.HEALTH_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Derived values
  const activeAgent = useMemo(() => {
    return agents.find(a => a.id === activeAgentId) || agents[0];
  }, [agents, activeAgentId]);

  const averageHealth = useMemo(() => {
    return calculateAverageHealth(agents);
  }, [agents]);

  const isAtLimit = agents.length >= AGENT_LIMITS.MAX_AGENTS;

  // Agent operations
  const addAgent = useCallback(
    (params?: CreateAgentParams): Agent => {
      if (isAtLimit) {
        onLog?.('warn', 'SYSTEM', `Maximum agent limit (${AGENT_LIMITS.MAX_AGENTS}) reached`);
        return activeAgent;
      }

      const newAgent: Agent = {
        id: generateId('node'),
        name: params?.name || `Agent Node ${agents.length + 1}`,
        systemInstruction: params?.systemInstruction || DEFAULT_AGENT.systemInstruction,
        model: params?.model || ModelType.FLASH,
        temperature: params?.temperature ?? DEFAULT_AGENT.temperature,
        useSearch: false,
        thinkingBudget: 0,
        health: 100,
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
      };

      setAgents(prev => [...prev, newAgent]);
      setActiveAgentId(newAgent.id);
      onLog?.('info', 'SYSTEM', `Deployed new agent node: ${newAgent.name}`);

      return newAgent;
    },
    [agents.length, isAtLimit, activeAgent, onLog]
  );

  const updateAgent = useCallback(
    (updatedAgent: Agent) => {
      setAgents(prev =>
        prev.map(a =>
          a.id === updatedAgent.id
            ? { ...updatedAgent, lastActiveAt: Date.now() }
            : a
        )
      );
      onLog?.('info', 'CONFIG', `Modified protocol for node: ${updatedAgent.name}`);
    },
    [onLog]
  );

  const removeAgent = useCallback(
    (id: string) => {
      if (agents.length <= 1) {
        onLog?.('warn', 'SYSTEM', 'Cannot remove the last agent');
        return;
      }

      const agentToRemove = agents.find(a => a.id === id);
      if (!agentToRemove) return;

      setAgents(prev => {
        const newAgents = prev.filter(a => a.id !== id);

        // Update active agent if needed
        if (activeAgentId === id) {
          setActiveAgentId(newAgents[0].id);
        }

        return newAgents;
      });

      onLog?.('warn', 'SYSTEM', `Decommissioned agent node: ${agentToRemove.name}`);
    },
    [agents, activeAgentId, onLog]
  );

  return {
    agents,
    activeAgent,
    activeAgentId,
    setActiveAgentId,
    addAgent,
    updateAgent,
    removeAgent,
    averageHealth,
    isAtLimit,
  };
}

export default useAgents;
