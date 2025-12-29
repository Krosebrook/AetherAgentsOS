
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { ModelType, Agent } from '../types';
import { 
  Sliders, 
  Search, 
  Cpu, 
  Zap, 
  Trash2, 
  Edit3, 
  Check, 
  Terminal, 
  ChevronDown,
  Target,
  Hash,
  BrainCircuit,
  Layers,
  Thermometer,
  ShieldCheck,
  Activity,
  ZapOff
} from 'lucide-react';

interface Props {
  agent: Agent;
  onUpdate: (updated: Agent) => void;
  onRemove?: () => void;
}

const AgentControlPanel: React.FC<Props> = ({ agent, onUpdate, onRemove }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const models = [
    { id: ModelType.FLASH, label: 'Gemini 3 Flash', icon: Zap, desc: 'High speed, balanced latency' },
    { id: ModelType.PRO, label: 'Gemini 3 Pro', icon: Cpu, desc: 'Advanced reasoning & complex logic' },
    { id: ModelType.LITE, label: 'Gemini Flash Lite', icon: ZapOff, desc: 'Optimized for high-efficiency' },
  ];

  const selectedModel = models.find(m => m.id === agent.model) || models[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const highlightedInstruction = useMemo(() => {
    if (!agent.systemInstruction) return '';
    return agent.systemInstruction
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(YOU ARE|ROLE|PERSONA|TASK|CONTEXT|CONSTRAINTS|OUTPUT FORMAT|GOAL|INSTRUCTIONS|SYSTEM)/gi, '<span class="text-indigo-400 font-bold">$1</span>')
      .replace(/(NEVER|ALWAYS|MUST|DO NOT|REQUIRED|PROHIBITED|STRICTLY|LIMIT)/g, '<span class="text-rose-400 font-bold">$1</span>')
      .replace(/(### .*)/g, '<span class="text-slate-100 font-bold">$1</span>')
      .replace(/(^|\n)(\d+\. |- )/g, '$1<span class="text-indigo-500/70 font-bold">$2</span>');
  }, [agent.systemInstruction]);

  return (
    <div className="w-80 border-l border-slate-800 p-6 flex flex-col gap-6 bg-slate-950/40 backdrop-blur-3xl overflow-y-auto relative scrollbar-hide mb-10 shadow-[-10px_0_30px_rgba(0,0,0,0.3)]">
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full bg-slate-900 border border-slate-800 rounded-[2rem] p-7 shadow-2xl space-y-6 text-center">
             <div className="mx-auto w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 ring-4 ring-rose-500/5 mb-2">
                <Trash2 className="w-8 h-8" />
             </div>
             <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-100">Terminate?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Disconnecting <span className="text-slate-300 font-mono">[{agent.name}]</span> will purge local context. This action is irreversible.</p>
             </div>
             <div className="flex gap-3 pt-2">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-[10px] font-bold uppercase transition-all">Abort</button>
                <button onClick={() => { if (onRemove) onRemove(); setShowDeleteConfirm(false); }} className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-[10px] font-bold uppercase transition-all shadow-xl shadow-rose-900/30">Confirm</button>
             </div>
          </div>
        </div>
      )}

      <header className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2.5">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <h2 className="font-bold text-slate-100 uppercase tracking-widest text-[10px]">Neural Configurator</h2>
        </div>
        {onRemove && (
          <button onClick={() => setShowDeleteConfirm(true)} className="p-2 text-slate-500 hover:text-rose-400 transition-all bg-slate-900/50 rounded-xl border border-slate-800 hover:border-rose-500/30">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </header>

      <div className="space-y-8 pb-12">
        {/* Basic Meta */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-indigo-500/60" /> Node Identity
          </label>
          <div className="relative group">
            <input 
              type="text" 
              value={agent.name} 
              onChange={(e) => onUpdate({ ...agent, name: e.target.value })} 
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3 px-4 pl-11 text-xs text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-700 font-bold" 
            />
            <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
          </div>
        </div>

        {/* Compute Logic Selector */}
        <div className="relative" ref={dropdownRef}>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
            <Cpu className="w-3.5 h-3.5 text-indigo-500/60" /> Logic Tier
          </label>
          <button onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all ${isModelDropdownOpen ? 'bg-slate-800 border-indigo-500/50 ring-2 ring-indigo-500/10' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 shadow-sm'}`}>
            <div className="flex items-center gap-4 text-left overflow-hidden">
              <selectedModel.icon className={`w-5 h-5 shrink-0 ${agent.model === ModelType.PRO ? 'text-indigo-400' : 'text-amber-400'}`} />
              <div className="truncate">
                <div className="text-xs font-bold text-slate-100">{selectedModel.label}</div>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform duration-500 ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {isModelDropdownOpen && (
            <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-[100] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-1.5 animate-in fade-in slide-in-from-top-4 duration-300">
              {models.map((m) => (
                <button key={m.id} onClick={() => { onUpdate({ ...agent, model: m.id as ModelType }); setIsModelDropdownOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all group ${agent.model === m.id ? 'bg-indigo-600/10' : 'hover:bg-slate-800/80'}`}>
                  <div className={`p-2.5 rounded-xl ${agent.model === m.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'}`}><m.icon className="w-4.5 h-4.5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[11px] font-bold ${agent.model === m.id ? 'text-indigo-200' : 'text-slate-300'}`}>{m.label}</div>
                    <div className="text-[9px] text-slate-500 truncate mt-0.5">{m.desc}</div>
                  </div>
                  {agent.model === m.id && <Check className="w-4 h-4 text-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hyperparameters */}
        <div className="space-y-5">
           <div className="space-y-3">
              <div className="flex justify-between items-center">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Thermometer className="w-3.5 h-3.5 text-rose-400/70" /> Temperature
                 </label>
                 <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/10">{agent.temperature}</span>
              </div>
              <input type="range" min="0" max="1" step="0.1" value={agent.temperature} onChange={(e) => onUpdate({ ...agent, temperature: parseFloat(e.target.value) })} className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-rose-500 transition-all" />
           </div>

           <div className="space-y-3">
              <div className="flex justify-between items-center">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <BrainCircuit className="w-3.5 h-3.5 text-amber-400/70" /> Thinking Budget
                 </label>
                 <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/10">{agent.thinkingBudget.toLocaleString()}</span>
              </div>
              <input type="range" min="0" max="32768" step="1024" value={agent.thinkingBudget} onChange={(e) => onUpdate({ ...agent, thinkingBudget: parseInt(e.target.value) })} className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-amber-500 transition-all" />
           </div>
        </div>

        {/* System Payload */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-500/60" /> System Protocols
            </label>
            <div className="text-[9px] font-mono font-bold text-slate-500 flex items-center gap-1.5">
              <Activity className="w-3 h-3" /> {agent.systemInstruction.length} chars
            </div>
          </div>
          <div className="relative group border border-slate-800 rounded-[1.5rem] overflow-hidden bg-slate-900/40 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <div className="absolute inset-0 p-5 text-[11px] font-mono leading-relaxed whitespace-pre-wrap break-words pointer-events-none select-none text-transparent" dangerouslySetInnerHTML={{ __html: highlightedInstruction + '\n' }} />
            <textarea value={agent.systemInstruction} onChange={(e) => onUpdate({ ...agent, systemInstruction: e.target.value })} className="relative w-full h-56 bg-transparent p-5 text-[11px] text-slate-400 focus:outline-none resize-none font-mono leading-relaxed break-words caret-indigo-400 placeholder:text-slate-700 border-none" spellCheck={false} />
          </div>
        </div>

        {/* Tool Grounding */}
        <div className="pt-6 border-t border-slate-800/60 space-y-5">
           <div className="grid grid-cols-1 gap-4">
              <div 
                onClick={() => onUpdate({ ...agent, useSearch: !agent.useSearch })} 
                className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${agent.useSearch ? 'bg-indigo-600/10 border-indigo-500/40' : 'bg-slate-900/30 border-slate-800 hover:border-slate-700'}`}
              >
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-xl ${agent.useSearch ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}><Search className="w-4 h-4" /></div>
                   <span className={`text-[11px] font-bold ${agent.useSearch ? 'text-indigo-100' : 'text-slate-400'}`}>Grounding Search</span>
                </div>
                <div className={`w-9 h-5 rounded-full transition-all flex items-center px-1 ${agent.useSearch ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                   <div className={`w-3 h-3 bg-white rounded-full transition-all ${agent.useSearch ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>

              <div 
                onClick={() => onUpdate({ ...agent, safetyFilters: !agent.safetyFilters })} 
                className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${agent.safetyFilters ? 'bg-emerald-600/10 border-emerald-500/40' : 'bg-slate-900/30 border-slate-800 hover:border-slate-700'}`}
              >
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-xl ${agent.safetyFilters ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'}`}><ShieldCheck className="w-4 h-4" /></div>
                   <span className={`text-[11px] font-bold ${agent.safetyFilters ? 'text-emerald-100' : 'text-slate-400'}`}>Safety Shield</span>
                </div>
                <div className={`w-9 h-5 rounded-full transition-all flex items-center px-1 ${agent.safetyFilters ? 'bg-emerald-600' : 'bg-slate-700'}`}>
                   <div className={`w-3 h-3 bg-white rounded-full transition-all ${agent.safetyFilters ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>
           </div>

           {agent.useSearch && (
             <div className="space-y-3 animate-in slide-in-from-top-4 duration-500">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                 <Layers className="w-3.5 h-3.5 text-indigo-400" /> Research Payload Query
               </label>
               <input 
                 type="text" 
                 value={agent.searchQuery || ''} 
                 onChange={(e) => onUpdate({ ...agent, searchQuery: e.target.value })} 
                 placeholder="Specific topic override..."
                 className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3.5 px-5 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-700 font-medium"
               />
               <p className="text-[9px] text-slate-600 font-medium leading-relaxed italic px-1">Model will prioritize searching this manifest before synthesis.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AgentControlPanel;
