
import React from 'react';
import { 
  Zap, 
  Activity,
  Layers,
  Plus,
  Cpu,
  Workflow,
  AlertCircle,
  CheckCircle2,
  Clock,
  Terminal as TerminalIcon
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
    { id: 'canvas', label: 'Workflow Engine', icon: Workflow },
    { id: 'metrics', label: 'Inference Metrics', icon: Activity },
    { id: 'orchestration', label: 'Node Manager', icon: Layers },
    { id: 'terminal', label: 'API Terminal', icon: TerminalIcon },
  ];

  return (
    <div className="w-64 border-r border-slate-800 h-full flex flex-col bg-slate-950/80 backdrop-blur-2xl z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-600/30">
          <Zap className="w-5 h-5 text-white fill-current" />
        </div>
        <h1 className="text-xl font-bold tracking-tighter text-slate-100 italic">AETHER</h1>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <nav className="px-4 py-2 space-y-1 shrink-0">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">Platform</p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium border border-transparent ${
                activeTab === item.id 
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-lg shadow-indigo-500/5' 
                  : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-8 flex-1 flex flex-col overflow-hidden">
          <div className="px-6 mb-4 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Instances</p>
            <button 
              onClick={onAddAgent}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 transition-all border border-slate-800 hover:border-indigo-500/30"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-3 space-y-2 scrollbar-hide pb-10">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => {
                  setActiveAgentId(agent.id);
                  setActiveTab('chat');
                }}
                className={`w-full p-3 rounded-2xl transition-all group text-left border ${
                  activeAgentId === agent.id && activeTab === 'chat'
                    ? 'bg-slate-900 border-slate-700 ring-1 ring-indigo-500/20 shadow-xl' 
                    : 'bg-transparent border-transparent hover:bg-slate-900/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${
                    activeAgentId === agent.id && activeTab === 'chat' ? 'bg-indigo-600 shadow-lg shadow-indigo-600/30' : 'bg-slate-800'
                  }`}>
                    <Cpu className={`w-4 h-4 ${activeAgentId === agent.id && activeTab === 'chat' ? 'text-white' : 'text-slate-500'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-xs font-bold truncate ${activeAgentId === agent.id && activeTab === 'chat' ? 'text-indigo-200' : 'text-slate-400 group-hover:text-slate-200'}`}>
                        {agent.name}
                      </span>
                      <div className={`w-1.5 h-1.5 rounded-full ${agent.health && agent.health < 20 ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-700 ${agent.health && agent.health < 20 ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                          style={{ width: `${agent.health || 100}%` }} 
                        />
                      </div>
                      <span className="text-[8px] font-mono text-slate-600 uppercase tracking-tighter">Live</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-slate-800 bg-slate-950/50">
        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
               <Clock className="w-3 h-3 text-indigo-500" /> Session Uptime
            </span>
            <span className="text-[10px] text-slate-200 font-mono">12:45:02</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] text-slate-400 font-medium">Network Latency: <span className="text-emerald-400">22ms</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
