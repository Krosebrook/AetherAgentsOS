
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import CanvasView from './components/CanvasView';
import MetricsView from './components/MetricsView';
import AgentControlPanel from './components/AgentControlPanel';
import { AgentConfig, ModelType } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    name: 'Aether Core',
    systemInstruction: 'You are an advanced AI operations agent. Provide precise, technical, and high-quality responses. Use search grounding when factual accuracy is critical.',
    model: ModelType.FLASH,
    temperature: 0.7,
    useSearch: false,
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatView config={agentConfig} onMetricUpdate={() => {}} />;
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
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex overflow-hidden">
        {renderContent()}
        {activeTab === 'chat' && (
          <AgentControlPanel 
            config={agentConfig} 
            setConfig={setAgentConfig} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
