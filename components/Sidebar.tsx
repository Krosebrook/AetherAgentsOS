
import React from 'react';
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Zap, 
  Settings, 
  Activity,
  Layers,
  ChevronRight,
  Plus,
  Cpu
} from 'lucide-react';
import { Agent } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  agents: Agent[];
  activeAgentId: string;
  setActiveAgentId: (id: string) => void;
  onAddAgent: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  agents, 
  activeAgentId, 
  setActiveAgentId, 
  onAddAgent 
}) => {
  const menuItems = [
    { id: 'canvas', label: 'Image Canvas', icon: ImageIcon },
    { id: 'metrics', label: 'Inference Metrics', icon: Activity },
    { id: 'orchestration', label: 'Orchestration', icon: Layers },
  ];

  return (
    <div className="w-64 border-r border-slate-800 h-full flex flex-col bg-slate-950/50 backdrop-blur-xl">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <Zap className="w-5 h-5 text-white fill-current" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100 italic">AETHER</h1>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Workspace Navigation */}
        <nav className="px-4 py-2 space-y-1 shrink-0">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">Systems</p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                activeTab === item.id 
                  ? 'bg-slate-800 text-indigo-400 shadow-sm ring-1 ring-slate-700' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Agent Orchestration */}
        <div className="mt-6 flex-1 flex flex-col overflow-hidden">
          <div className="px-6 mb-3 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Agents</p>
            <button 
              onClick={onAddAgent}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-indigo-400 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 space-y-1">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => {
                  setActiveAgentId(agent.id);
                  setActiveTab('chat');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium group ${
                  activeAgentId === agent.id && activeTab === 'chat'
                    ? 'bg-indigo-500/10 text-indigo-200 border border-indigo-500/20' 
                    : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-300'
                }`}
              >
                <div className={`p-1 rounded-md ${
                  activeAgentId === agent.id && activeTab === 'chat' ? 'bg-indigo-500/20' : 'bg-slate-800'
                }`}>
                  <Cpu className="w-3 h-3" />
                </div>
                <span className="truncate flex-1 text-left">{agent.name}</span>
                {activeAgentId === agent.id && activeTab === 'chat' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 mt-auto border-t border-slate-800">
        <button className="flex items-center gap-3 w-full px-3 py-2 text-slate-400 hover:text-slate-200 transition-colors text-sm">
          <Settings className="w-4 h-4" />
          System Config
        </button>
        <div className="mt-4 p-3 bg-slate-900/50 rounded-xl border border-slate-800/50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 font-medium">QUOTA STATUS</span>
            <span className="text-[10px] text-emerald-400 font-bold">ACTIVE</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-500 h-full w-[65%]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
