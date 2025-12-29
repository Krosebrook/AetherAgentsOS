
import React from 'react';
import { 
  Cpu, Zap, Plus, Trash2, MessageSquare, Settings2, 
  Layers, Search, BrainCircuit, Link2, ShieldCheck 
} from 'lucide-react';
import { Agent, ModelType } from '../types';

interface Props {
  agents: Agent[];
  activeAgentId: string;
  onAddAgent: () => void;
  onRemoveAgent: (id: string) => void;
  onSelectAgent: (id: string) => void;
  onSetActiveTab: (tab: string) => void;
}

const OrchestrationView: React.FC<Props> = ({ 
  agents, 
  activeAgentId, 
  onAddAgent, 
  onRemoveAgent, 
  onSelectAgent,
  onSetActiveTab
}) => {
  return (
    <div className="flex-1 p-10 bg-slate-950 overflow-y-auto pb-32">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex justify-between items-end">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-4 tracking-tight font-sans">
              <Layers className="text-indigo-500 w-8 h-8" /> Neural Orchestrator
            </h2>
            <p className="text-slate-500 max-w-2xl font-medium">Manage localized agent clusters. Monitor neural throughput, connection density, and protocol health.</p>
          </div>
          <button onClick={onAddAgent} className="flex items-center gap-3 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all font-bold text-xs uppercase tracking-widest shadow-2xl shadow-indigo-600/30">
            <Plus className="w-4 h-4" /> Provision Node
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map(agent => (
            <div key={agent.id} className={`relative bg-slate-900/40 border-2 rounded-3xl p-8 flex flex-col group transition-all ${agent.id === activeAgentId ? 'border-indigo-500/40 shadow-2xl shadow-indigo-500/10' : 'border-slate-800'}`}>
              <div className={`absolute top-6 right-6 w-2.5 h-2.5 rounded-full ${agent.health && agent.health < 20 ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`} />
              
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400">
                  <Cpu className="w-8 h-8" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-100 truncate">{agent.name}</h3>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{agent.model}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Reasoning</span>
                  <div className="text-sm font-bold text-slate-200 font-mono">{(agent.thinkingBudget || 0).toLocaleString()}tk</div>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Status</span>
                  <div className="text-sm font-bold text-emerald-400 uppercase tracking-tighter">Healthy</div>
                </div>
              </div>

              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
                  <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2"><Search className="w-3 h-3" /> Grounding</span>
                  <span className={`text-[10px] font-bold ${agent.useSearch ? 'text-indigo-400' : 'text-slate-600'}`}>{agent.useSearch ? 'ON' : 'OFF'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
                  <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2"><ShieldCheck className="w-3 h-3" /> Shields</span>
                  <span className="text-[10px] font-bold text-emerald-500">NOMINAL</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { onSelectAgent(agent.id); onSetActiveTab('chat'); }} className="py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-600/20">Launch</button>
                <button onClick={() => { onSelectAgent(agent.id); onSetActiveTab('chat'); }} className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-slate-700">Config</button>
              </div>

              {agents.length > 1 && (
                <button onClick={() => onRemoveAgent(agent.id)} className="absolute bottom-6 right-6 p-2 text-slate-700 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          <button onClick={onAddAgent} className="border-2 border-dashed border-slate-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-slate-600 hover:text-indigo-400 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group min-h-[400px]">
            <Plus className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-lg">Provision New Node</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrchestrationView;
