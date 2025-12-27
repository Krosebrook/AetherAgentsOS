
import React from 'react';
import { ModelType, AgentConfig } from '../types';
// Fixed: Added missing 'Zap' import
import { Sliders, Search, ShieldAlert, Cpu, Zap } from 'lucide-react';

interface Props {
  config: AgentConfig;
  setConfig: React.Dispatch<React.SetStateAction<AgentConfig>>;
}

const AgentControlPanel: React.FC<Props> = ({ config, setConfig }) => {
  return (
    <div className="w-80 border-l border-slate-800 p-6 flex flex-col gap-6 bg-slate-950/30 overflow-y-auto">
      <div className="flex items-center gap-2 mb-2">
        <Sliders className="w-4 h-4 text-indigo-400" />
        <h2 className="font-semibold text-slate-100">Agent Architect</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1.5 tracking-wider">Model Selection</label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: ModelType.FLASH, label: 'Gemini 3 Flash', icon: Zap },
              { id: ModelType.PRO, label: 'Gemini 3 Pro', icon: Cpu },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setConfig(prev => ({ ...prev, model: m.id }))}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  config.model === m.id 
                    ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-200' 
                    : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <m.icon className="w-3.5 h-3.5" />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1.5 tracking-wider">System Instruction</label>
          <textarea
            value={config.systemInstruction}
            onChange={(e) => setConfig(prev => ({ ...prev, systemInstruction: e.target.value }))}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 h-32 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all resize-none font-mono"
            placeholder="Define your agent's persona and constraints..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Temperature</label>
            <span className="text-[10px] font-mono text-indigo-400">{config.temperature}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.temperature}
            onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-3">
          <label className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium text-slate-300">Search Grounding</span>
            </div>
            <div className={`w-8 h-4 rounded-full transition-colors relative ${config.useSearch ? 'bg-indigo-600' : 'bg-slate-700'}`}>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={config.useSearch} 
                onChange={() => setConfig(prev => ({ ...prev, useSearch: !prev.useSearch }))}
              />
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${config.useSearch ? 'left-4.5 translate-x-1.5' : 'left-0.5'}`} />
            </div>
          </label>
          
          <div className="p-3 bg-orange-500/5 rounded-lg border border-orange-500/20 flex gap-2">
            <ShieldAlert className="w-4 h-4 text-orange-500 shrink-0" />
            <p className="text-[10px] text-orange-200/70 leading-relaxed">
              Grounding increases latency but significantly reduces hallucination risk for real-world data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentControlPanel;
