
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import CanvasView from './components/CanvasView';
import MetricsView from './components/MetricsView';
import AgentControlPanel from './components/AgentControlPanel';
import { Agent, ModelType } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'default-core',
      name: 'Aether Core',
      systemInstruction: 'You are an advanced AI operations agent. Provide precise, technical, and high-quality responses.',
      model: ModelType.FLASH,
      temperature: 0.7,
      useSearch: false,
    }
  ]);
  const [activeAgentId, setActiveAgentId] = useState<string>('default-core');

  const activeAgent = agents.find(a => a.id === activeAgentId) || agents[0];

  const handleAddAgent = () => {
    const newId = `agent-${Date.now()}`;
    const newAgent: Agent = {
      id: newId,
      name: `Agent Node ${agents.length + 1}`,
      systemInstruction: 'You are a specialized agent node.',
      model: ModelType.FLASH,
      temperature: 0.7,
      useSearch: false,
    };
    setAgents([...agents, newAgent]);
    setActiveAgentId(newId);
    setActiveTab('chat');
  };

  const handleUpdateAgent = (updatedAgent: Agent) => {
    setAgents(agents.map(a => a.id === updatedAgent.id ? updatedAgent : a));
  };

  const handleRemoveAgent = (id: string) => {
    if (agents.length <= 1) return;
    const newAgents = agents.filter(a => a.id !== id);
    setAgents(newAgents);
    if (activeAgentId === id) {
      setActiveAgentId(newAgents[0].id);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatView key={activeAgentId} agent={activeAgent} onMetricUpdate={() => {}} />;
      case 'canvas':
        return <CanvasView />;
      case 'metrics':
        return <MetricsView />;
      default:
        return (
          <div className="flex-1 flex items-center justify-center text-slate-500">
             <div className="text-center">
                <p className="text-lg font-medium">Module Not Initialized</p>
                <p className="text-sm">This system component is under construction.</p>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans antialiased overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        agents={agents} 
        activeAgentId={activeAgentId} 
        setActiveAgentId={setActiveAgentId}
        onAddAgent={handleAddAgent}
      />
      
      <main className="flex-1 flex overflow-hidden">
        {renderContent()}
        {activeTab === 'chat' && (
          <AgentControlPanel 
            agent={activeAgent} 
            onUpdate={handleUpdateAgent}
            onRemove={agents.length > 1 ? () => handleRemoveAgent(activeAgent.id) : undefined}
          />
        )}
      </main>
    </div>
  );
};

export default App;
