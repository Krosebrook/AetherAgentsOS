import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  Send, 
  Code, 
  Database, 
  ShieldAlert, 
  CheckCircle, 
  Search, 
  Lock, 
  Unlock,
  Key,
  Plus,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Save,
  X
} from 'lucide-react';
import { useApiKeys } from '../contexts/ApiKeysContext';
import { TerminalResponse } from '../types';
import { GoogleGenAI } from '@google/genai';

const ApiTerminal: React.FC = () => {
  const { keys, setKey, isLoading } = useApiKeys();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<TerminalResponse[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Specific OpenAI state
  const [openaiKeyInput, setOpenaiKeyInput] = useState('');
  
  // Quick-set state for others
  const [qsProvider, setQsProvider] = useState('anthropic');
  const [qsKey, setQsKey] = useState('');

  // Pre-populate OpenAI key input when keys are loaded from context
  useEffect(() => {
    if (keys.openai) {
      setOpenaiKeyInput(keys.openai);
    }
  }, [keys.openai, isLoading]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [history]);

  const parseCommand = (cmd: string) => {
    const matches = cmd.match(/(".*?"|'.*?'|\S+)/g);
    if (!matches) return null;
    return matches.map(m => m.replace(/^['"]|['"]$/g, ''));
  };

  const executeCommand = async (cmd: string) => {
    const args = parseCommand(cmd);
    if (!args || args.length === 0) return;

    const commandId = Date.now().toString();
    const provider = args[0].toLowerCase();

    setHistory(prev => [...prev, {
      id: commandId,
      command: cmd,
      response: null,
      timestamp: Date.now(),
      status: 'loading'
    }]);

    try {
      let result: any;

      if (provider === 'set-key') {
        if (args.length < 3) throw new Error('Usage: set-key [provider] [key]');
        await setKey(args[1], args[2]);
        result = { 
          status: 'success', 
          message: `Credential persistent for [${args[1].toUpperCase()}]. Sequence stored in AetherSecureStorage.` 
        };
      } 
      else if (provider === 'help') {
        result = {
          available_commands: [
            'set-key [provider] [key]',
            'gemini generate --prompt "..."',
            'openai generate text --prompt "..." (Simulated)',
            'anthropic generate --prompt "..." (Simulated)',
            'clear'
          ]
        };
      }
      else if (provider === 'clear') {
        setHistory([]);
        return;
      }
      else if (provider === 'gemini') {
        const promptIdx = args.indexOf('--prompt');
        if (promptIdx === -1 || !args[promptIdx + 1]) throw new Error('Missing --prompt argument');
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const stream = await ai.models.generateContentStream({
          model: 'gemini-3-flash-preview',
          contents: args[promptIdx + 1]
        });

        let fullText = "";
        let groundingMetadata: any[] = [];

        for await (const chunk of stream) {
          const text = chunk.text || "";
          fullText += text;

          const metadata = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
          if (metadata) {
            groundingMetadata = metadata;
          }

          setHistory(prev => prev.map(h => 
            h.id === commandId ? { 
              ...h, 
              status: 'success', 
              response: { 
                text: fullText, 
                grounding: groundingMetadata.length > 0 ? groundingMetadata : undefined 
              } 
            } : h
          ));
        }
        return; 
      } 
      else if (provider === 'openai' || provider === 'anthropic' || provider === 'mistral') {
        const key = keys[provider];
        if (!key) throw new Error(`${provider.toUpperCase()} key not found. Use set-key ${provider} [key]`);
        
        result = {
          protocol: provider,
          status: "simulated_ok",
          timestamp: Date.now(),
          message: `Simulation: Active engine call to ${provider}. Key verification passed (${key.substring(0, 4)}***).`,
          recommendation: "Deploy this node via Node Manager for production throughput."
        };
      }
      else {
        throw new Error(`Unknown provider or command: ${provider}`);
      }

      setHistory(prev => prev.map(h => h.id === commandId ? { ...h, response: result, status: 'success' } : h));
    } catch (err: any) {
      setHistory(prev => prev.map(h => h.id === commandId ? { ...h, response: { error: err.message }, status: 'error' } : h));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    executeCommand(input.trim());
    setInput('');
  };

  const handleQuickSet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qsKey.trim()) return;
    executeCommand(`set-key ${qsProvider} ${qsKey}`);
    setQsKey('');
  };

  const handleOpenaiKeySave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openaiKeyInput.trim()) return;
    
    // Echo the action to history
    setHistory(prev => [...prev, {
      id: Date.now().toString(),
      command: `vault set-key openai ************`,
      response: { message: "Updating OpenAI credential in secure storage..." },
      timestamp: Date.now(),
      status: 'loading'
    }]);

    try {
      await setKey('openai', openaiKeyInput);
      setHistory(prev => prev.map(h => h.command.includes('vault set-key openai') && h.status === 'loading' ? { 
        ...h, 
        status: 'success', 
        response: { message: "OpenAI credential updated successfully. Protocol ready." } 
      } : h));
    } catch (err: any) {
      setHistory(prev => prev.map(h => h.command.includes('vault set-key openai') && h.status === 'loading' ? { 
        ...h, 
        status: 'error', 
        response: { error: err.message } 
      } : h));
    }
  };

  const knownProviders = ['anthropic', 'mistral', 'cohere'];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 font-mono text-sm overflow-hidden p-6 gap-6 pb-24">
      <header className="flex flex-col gap-4 border-b border-slate-800 pb-6 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <TerminalIcon className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                API Terminal <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded uppercase tracking-widest">Protocol V3</span>
              </h2>
              <p className="text-[10px] text-slate-500 font-sans uppercase tracking-tighter">Direct engine interface & credential vault</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-sans font-bold uppercase text-slate-500 tracking-widest">
            {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3 text-emerald-500" />}
            Vault Status: <span className={isLoading ? 'text-slate-600' : 'text-emerald-500'}>{isLoading ? 'Syncing' : 'Encrypted'}</span>
          </div>
        </div>

        {/* Vault Summary & Config row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Provider Badges */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-3">
            {['openai', ...knownProviders].slice(0, 4).map(p => (
              <div key={p} className={`flex flex-col p-3 rounded-2xl border transition-all ${keys[p] ? 'bg-indigo-500/5 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)]' : 'bg-slate-900 border-slate-800'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p}</span>
                  {keys[p] ? <Lock className="w-3 h-3 text-indigo-400" /> : <Unlock className="w-3 h-3 text-slate-700" />}
                </div>
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${keys[p] ? 'bg-indigo-400 animate-pulse' : 'bg-slate-800'}`} />
                  <span className="text-[9px] font-mono text-slate-500 truncate">
                    {keys[p] ? `${keys[p].substring(0, 4)}***${keys[p].substring(keys[p].length - 3)}` : 'No Protocol'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* OpenAI Primary Configuration */}
          <form onSubmit={handleOpenaiKeySave} className="lg:col-span-4 bg-slate-900/50 border border-slate-800 p-4 rounded-3xl flex flex-col gap-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Cpu className="w-12 h-12 text-indigo-400" />
            </div>
            <div className="flex items-center gap-2 relative z-10">
              <Key className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest">OpenAI Protocol</span>
            </div>
            <div className="flex gap-2 relative z-10">
              <input 
                type="password"
                value={openaiKeyInput}
                onChange={(e) => setOpenaiKeyInput(e.target.value)}
                placeholder="sk-..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-[10px] text-slate-100 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-mono"
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                <Save className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Provision for others */}
          <form onSubmit={handleQuickSet} className="lg:col-span-4 bg-slate-900/50 border border-slate-800 p-4 rounded-3xl flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secondary Nodes</span>
            </div>
            <div className="flex gap-2">
              <select 
                value={qsProvider}
                onChange={(e) => setQsProvider(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 appearance-none pr-8 relative"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '12px' }}
              >
                {knownProviders.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
              </select>
              <input 
                type="password"
                value={qsKey}
                onChange={(e) => setQsKey(e.target.value)}
                placeholder="Key payload..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-[10px] text-slate-300 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-mono"
              />
              <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 rounded-xl transition-all border border-slate-700">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 scrollbar-hide pr-2">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-700 opacity-50 space-y-4">
            <Database className="w-12 h-12" />
            <div className="text-center font-sans">
              <p className="font-bold uppercase tracking-widest text-xs">Aether Host: Port 8080 Active</p>
              <p className="text-[10px] mt-1">Ready for direct API orchestration. Secure vault initialized.</p>
            </div>
          </div>
        )}

        {history.map((entry) => (
          <div key={entry.id} className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="flex items-center gap-3 text-indigo-400">
              <span className="text-slate-600 font-bold">$</span>
              <span className="font-bold">{entry.command}</span>
              <span className="text-[10px] text-slate-600 ml-auto font-sans">{new Date(entry.timestamp).toLocaleTimeString()}</span>
            </div>

            <div className={`p-5 rounded-3xl border transition-all ${
              entry.status === 'error' ? 'bg-rose-500/5 border-rose-500/20' : 
              entry.status === 'loading' ? 'bg-slate-900 border-slate-800 animate-pulse' : 
              'bg-slate-900/50 border-slate-800'
            }`}>
              {entry.status === 'loading' && !entry.response ? (
                <div className="flex items-center gap-2 text-indigo-400">
                  <Search className="w-3 h-3 animate-spin" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Negotiating Handshake...</span>
                </div>
              ) : (
                <div className="relative group">
                  <div className="absolute -top-1 -right-1 flex gap-1">
                    {entry.status === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : entry.status === 'error' ? <ShieldAlert className="w-4 h-4 text-rose-500" /> : null}
                  </div>
                  <pre className="text-[11px] leading-relaxed overflow-x-auto selection:bg-indigo-500/30 font-mono">
                    <code className={entry.status === 'error' ? 'text-rose-400' : 'text-indigo-200'}>
                      {JSON.stringify(entry.response, null, 2)}
                    </code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="shrink-0 relative">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3 pointer-events-none">
          <Code className="w-4 h-4 text-indigo-500" />
          <span className="text-indigo-400 font-bold">$</span>
        </div>
        <input 
          ref={inputRef}
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Execute direct call (e.g., help, gemini generate, set-key)..."
          className="w-full bg-slate-900 border border-slate-800 rounded-3xl py-4.5 pl-16 pr-16 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none text-slate-100 placeholder:text-slate-700 shadow-2xl transition-all"
        />
        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ApiTerminal;