
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import CanvasView from './components/CanvasView';
import MetricsView from './components/MetricsView';
import OrchestrationView from './components/OrchestrationView';
import AgentControlPanel from './components/AgentControlPanel';
import SystemTerminal from './components/SystemTerminal';
import ApiTerminal from './components/ApiTerminal';
import { ApiKeysProvider } from './contexts/ApiKeysContext';
import { Agent, ModelType, InferenceMetric, LogEntry } from './types';

const App: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>(() => {
    const saved = localStorage.getItem('aether_agents');
    return saved ? JSON.parse(saved) : [
      {
        id: 'core-01',
        name: 'Aether Core',
        systemInstruction: 'You are an advanced AI operations agent. Provide precise, technical, and high-quality responses.',
        model: ModelType.FLASH,
        temperature: 0.7,
        useSearch: false,
        thinkingBudget: 0,
        health: 100
      }
    ];
  });

  const [activeTab, setActiveTab] = useState('canvas');
  const [activeAgentId, setActiveAgentId] = useState<string>('core-01');
  const [metrics, setMetrics] = useState<InferenceMetric[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('aether_agents', JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(a => ({
        ...a,
        health: Math.max(0, Math.min(100, (a.health || 100) + (Math.random() > 0.5 ? 0.5 : -0.5)))
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const addLog = useCallback((level: LogEntry['level'], source: string, message: string) => {
    const newLog: LogEntry = {
      id: Date.now().toString() + Math.random(),
      timestamp: Date.now(),
      level,
      source,
      message
    };
    setLogs(prev => [...prev.slice(-199), newLog]);
  }, []);

  const handleAddAgent = useCallback((name?: string) => {
    const newId = `node-${Date.now()}`;
    const newAgent: Agent = {
      id: newId,
      name: name || `Agent Node ${agents.length + 1}`,
      systemInstruction: 'You are a specialized agent node.',
      model: ModelType.FLASH,
      temperature: 0.7,
      useSearch: false,
      thinkingBudget: 0,
      health: 100
    };
    setAgents(prev => [...prev, newAgent]);
    setActiveAgentId(newId);
    setActiveTab('chat');
    addLog('info', 'SYSTEM', `Deployed new agent node: ${newAgent.name}`);
  }, [agents, addLog]);

  const handleCommand = (cmd: string) => {
    const parts = cmd.toLowerCase().split(' ');
    const action = parts[0];

    addLog('info', 'TERM', `> ${cmd}`);

    switch (action) {
      case 'nodes':
        const nodeNames = agents.map(a => `${a.name} [${a.id}]`).join(', ');
        addLog('info', 'ENGINE', `Active Instances: ${nodeNames}`);
        break;
      case 'deploy':
        handleAddAgent(parts[1]);
        break;
      case 'clear':
        setLogs([]);
        break;
      case 'status':
        addLog('info', 'SYSTEM', `Health: ${Math.round(agents.reduce((acc, a) => acc + (a.health || 0), 0) / agents.length)}% | Nodes: ${agents.length}`);
        break;
      case 'help':
        addLog('info', 'HELP', 'Commands: nodes, deploy [name], clear, status, help');
        break;
      default:
        addLog('error', 'TERM', `Unknown command: ${action}`);
    }
  };

  const handleUpdateAgent = (updatedAgent: Agent) => {
    setAgents(agents.map(a => a.id === updatedAgent.id ? updatedAgent : a));
    addLog('info', 'CONFIG', `Modified protocol for node: ${updatedAgent.name}`);
  };

  const handleRemoveAgent = (id: string) => {
    if (agents.length <= 1) return;
    const agentToRemove = agents.find(a => a.id === id);
    const newAgents = agents.filter(a => a.id !== id);
    setAgents(newAgents);
    if (activeAgentId === id) setActiveAgentId(newAgents[0].id);
    addLog('warn', 'SYSTEM', `Decommissioned agent node: ${agentToRemove?.name}`);
  };

  const handleMetricUpdate = (tokens: number, latency: number) => {
    const newMetric: InferenceMetric = {
      name: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      tokens,
      latency: latency / 1000,
    };
    setMetrics(prev => [...prev.slice(-99), newMetric]);
  };

  const activeAgent = agents.find(a => a.id === activeAgentId) || agents[0];

  return (
    <ApiKeysProvider>
      <div className="flex h-screen bg-slate-950 text-slate-200 font-sans antialiased overflow-hidden select-none">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          agents={agents} 
          activeAgentId={activeAgentId} 
          setActiveAgentId={setActiveAgentId}
          onAddAgent={handleAddAgent}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 flex overflow-hidden">
            {activeTab === 'chat' && <ChatView key={activeAgentId} agent={activeAgent} onMetricUpdate={handleMetricUpdate} onLog={addLog} />}
            {activeTab === 'canvas' && <CanvasView onLog={addLog} />}
            {activeTab === 'metrics' && <MetricsView metrics={metrics} />}
            {activeTab === 'terminal' && <ApiTerminal />}
            {activeTab === 'orchestration' && (
              <OrchestrationView 
                agents={agents}
                activeAgentId={activeAgentId}
                onAddAgent={handleAddAgent}
                onRemoveAgent={handleRemoveAgent}
                onSelectAgent={setActiveAgentId}
                onSetActiveTab={setActiveTab}
              />
            )}
          </div>
          
          <SystemTerminal 
            logs={logs} 
            isOpen={isTerminalOpen} 
            onToggle={() => setIsTerminalOpen(!isTerminalOpen)} 
            onClear={() => setLogs([])}
            onCommand={handleCommand}
          />

          {activeTab === 'chat' && (
            <AgentControlPanel 
              agent={activeAgent} 
              onUpdate={handleUpdateAgent}
              onRemove={agents.length > 1 ? () => handleRemoveAgent(activeAgent.id) : undefined}
            />
          )}
        </main>
      </div>
    </ApiKeysProvider>
  );
};

export default App;
