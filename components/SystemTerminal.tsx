
import React, { useRef, useEffect, useState } from 'react';
import { Terminal as TerminalIcon, X, ChevronUp, ChevronDown, Trash2, Command } from 'lucide-react';
import { LogEntry } from '../types';

interface Props {
  logs: LogEntry[];
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
  onCommand: (cmd: string) => void;
}

const SystemTerminal: React.FC<Props> = ({ logs, onClear, isOpen, onToggle, onCommand }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onCommand(inputValue.trim());
      setInputValue('');
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'text-indigo-400';
      case 'warn': return 'text-amber-400';
      case 'error': return 'text-rose-400';
      case 'critical': return 'text-rose-600 font-bold';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className={`fixed bottom-0 left-64 right-0 bg-slate-950 border-t border-slate-800 transition-all z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] ${isOpen ? 'h-64' : 'h-10'}`}>
      <div className="flex items-center justify-between px-4 h-10 border-b border-slate-900 bg-slate-950/90 backdrop-blur-md">
        <div className="flex items-center gap-2 cursor-pointer h-full" onClick={onToggle}>
          <TerminalIcon className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Aether CLI Console</span>
          <span className="text-[8px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded border border-slate-800 font-mono">REV:2.5.0</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={onClear} className="p-1 text-slate-600 hover:text-rose-400 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onToggle} className="p-1 text-slate-500 hover:text-slate-200 transition-colors">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="flex flex-col h-[calc(100%-40px)]">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 font-mono text-[10px] space-y-1 selection:bg-indigo-500/30">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-4 group hover:bg-white/5 transition-colors px-2 py-0.5 rounded">
                <span className="text-slate-600 shrink-0">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                <span className={`uppercase font-bold shrink-0 w-12 ${getLevelColor(log.level)}`}>[{log.level}]</span>
                <span className="text-indigo-500/60 shrink-0">[{log.source}]</span>
                <span className="text-slate-300 break-all leading-relaxed">{log.message}</span>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="h-full flex items-center justify-center text-slate-700 italic text-[10px]">
                System state nominal. Root terminal ready.
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="border-t border-slate-900 bg-slate-950 p-2 flex items-center gap-3">
             <div className="flex items-center gap-2 pl-2">
                <Command className="w-3 h-3 text-indigo-500" />
                <span className="text-indigo-400 font-mono text-[10px]">$</span>
             </div>
             <input 
               ref={inputRef}
               type="text" 
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               placeholder="Enter system command (nodes, deploy, clear, status)..."
               className="flex-1 bg-transparent border-none outline-none text-[10px] font-mono text-slate-100 placeholder:text-slate-700 h-6"
             />
          </form>
        </div>
      )}
    </div>
  );
};

export default SystemTerminal;
