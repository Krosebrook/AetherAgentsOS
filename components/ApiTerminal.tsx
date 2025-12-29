
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
  Trash2,
  ChevronRight
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

  // Dedicated OpenAI state for the UI field
  const [openaiKeyInput, setOpenaiKeyInput] = useState('');
  
  // Quick-set state for secondary providers
  const [qsProvider, setQsProvider] = useState('anthropic');
  const [qsKey, setQsKey] = useState('');

  // Sync internal state when external keys change (e.g., from IndexedDB load)
  useEffect(() => {
    if (keys.openai) {
      setOpenaiKeyInput(keys.openai);
    }
  }, [keys.openai, isLoading]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ 
        top: scrollRef.current.scrollHeight, 
        behavior: 'smooth' 
      });
    }
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

    // Mask sensitive keys in history display
    const displayCmd = provider === 'set-key' && args.length >= 3
      ? `set-key ${args[1]} ************` 
      : cmd;

    setHistory(prev => [...prev, {
      id: commandId,
      command: displayCmd,
      response: null,
      timestamp: Date.now(),
      status: 'loading'
    }]);

    try {
      let result: any;

      if (provider === 'set-key') {
        if (args.length < 3) throw new Error('Usage: set-key [provider] [key]');
        const targetProvider = args[1].toLowerCase();
        await setKey(targetProvider, args[2]);
        
        // Sync local UI state if OpenAI was updated via command line
        if (targetProvider === 'openai') {
          setOpenaiKeyInput(args[2]);
        }

        result = { 
          status: 'success', 
          message: `Credential updated for [${targetProvider.toUpperCase()}]. Protocol verified and stored in secure vault.` 
        };
      } 
      else if (provider === 'help') {
        result = {
          available_commands: [
            'set-key [provider] [key] - Update engine credentials',
            'gemini generate --prompt "..." - Direct Flash-3 inference',
            'openai generate --prompt "..." (Simulated call)',
            'clear - Purge terminal history',
            'help - Display protocol manual'
          ],
          vault_status: keys ? Object.keys(keys) : []
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
        let groundingChunks: any[] = [];

        for await (const chunk of stream) {
          fullText += chunk.text || "";
          
          const metadata = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
          if (metadata) {
            groundingChunks = [...groundingChunks, ...metadata];
          }

          // Reactive history update for streaming output
          setHistory(prev => prev.map(h => 
            h.id === commandId ? { 
              ...h, 
              status: 'success', 
              response: { 
                content: fullText, 
                grounding: groundingChunks.length > 0 ? groundingChunks : undefined,
                node: 'gemini-3-flash-preview',
                type: 'stream_output'
              } 
            } : h
          ));
        }
        return; 
      } 
      else if (['openai', 'anthropic', 'mistral', 'cohere'].includes(provider)) {
        const key = keys[provider];
        if (!key) throw new Error(`${provider.toUpperCase()} key not found. Provision via 'set-key ${provider} [key]'`);
        
        result = {
          protocol: provider,
          status: "simulated_ok",
          timestamp: Date.now(),
          message: `Simulated engine handshake for ${provider}. Key verification signature: ${key.substring(0, 4)}***`,
          recommendation: "Deploy this protocol via the Node Manager for full orchestration."
        };
      }
      else {
        throw new Error(`Unknown command or protocol identifier: ${provider}`);
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

  const handleOpenaiKeySave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!openaiKeyInput.trim()) return;
    executeCommand(`set-key openai ${openaiKeyInput}`);
  };

  const secondaryProviders = ['anthropic', 'mistral', 'cohere'];

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
              <p className="text-[10px] text-slate-500 font-sans uppercase tracking-tighter font-bold">Direct engine interface & credential vault</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setHistory([])}
              className="p-2 text-slate-600 hover:text-rose-400 transition-colors"
              title="Purge History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-[10px] font-sans font-bold uppercase text-slate-500 tracking-widest">
              {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3 text-emerald-500" />}
              Vault: <span className={isLoading ? 'text-slate-600' : 'text-emerald-500'}>{isLoading ? 'Syncing' : 'Secure'}</span>
            </div>
          </div>
        </div>

        {/* Configuration Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Status Badges */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-3">
            {['openai', ...secondaryProviders].slice(0, 4).map(p => (
              <div key={p} className={`flex flex-col p-3 rounded-2xl border transition-all ${keys[p] ? 'bg-indigo-500/5 border-indigo-500/20 shadow-sm' : 'bg-slate-900 border-slate-800'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p}</span>
                  {keys[p] ? <Lock className="w-3 h-3 text-indigo-400" /> : <Unlock className="w-3 h-3 text-slate-700" />}
                </div>
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${keys[p] ? 'bg-indigo-400 animate-pulse' : 'bg-slate-800'}`} />
                  <span className="text-[9px] font-mono text-slate-500 truncate">
                    {keys[p] ? `${keys[p].substring(0, 4)}***${keys[p].substring(keys[p].length - 4)}` : 'Offline'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Primary OpenAI Config */}
          <form onSubmit={handleOpenaiKeySave} className="lg:col-span-4 bg-slate-900/50 border border-slate-800 p-4 rounded-3xl flex flex-col gap-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Cpu className="w-12 h-12 text-indigo-400" />
            </div>
            <div className="flex items-center gap-2 relative z-10">
              <Key className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-sans">OpenAI Primary Protocol</span>
            </div>
            <div className="flex gap-2 relative z-10">
              <input 
                type="password"
                value={openaiKeyInput}
                onChange={(e) => setOpenaiKeyInput(e.target.value)}
                placeholder="sk-..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-[10px] text-slate-100 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-mono transition-all"
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                <Save className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Secondary Provisioning */}
          <form onSubmit={handleQuickSet} className="lg:col-span-4 bg-slate-900/50 border border-slate-800 p-4 rounded-3xl flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Secondary Node Vault</span>
            </div>
            <div className="flex gap-2">
              <select 
                value={qsProvider}
                onChange={(e) => setQsProvider(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 appearance-none pr-8 relative cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '12px' }}
              >
                {secondaryProviders.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
              </select>
              <input 
                type="password"
                value={qsKey}
                onChange={(e) => setQsKey(e.target.value)}
                placeholder="Key string..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-[10px] text-slate-300 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-mono"
              />
              <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 rounded-xl transition-all border border-slate-700">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </header>

      {/* Terminal Output Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 scrollbar-hide pr-2">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-700 opacity-50 space-y-4">
            <div className="p-6 bg-slate-900/50 rounded-full border border-slate-800/50">
              <Database className="w-12 h-12" />
            </div>
            <div className="text-center font-sans">
              <p className="font-bold uppercase tracking-widest text-xs">Aether Engine: Online</p>
              <p className="text-[10px] mt-1 italic">Ready for protocol negotiation. Use 'help' for documentation.</p>
            </div>
          </div>
        )}

        {history.map((entry) => (
          <div key={entry.id} className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="flex items-center gap-3 text-indigo-400">
              <ChevronRight className="w-4 h-4 text-slate-600" />
              <span className="font-bold tracking-tight text-slate-300">{entry.command}</span>
              <span className="text-[9px] text-slate-600 ml-auto font-sans bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                {new Date(entry.timestamp).toLocaleTimeString([], { hour12: false })}
              </span>
            </div>

            <div className={`p-5 rounded-3xl border transition-all duration-300 ${
              entry.status === 'error' ? 'bg-rose-500/5 border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.05)]' : 
              entry.status === 'loading' ? 'bg-slate-900 border-slate-800 animate-pulse' : 
              'bg-slate-900/50 border-slate-800 shadow-sm'
            }`}>
              {entry.status === 'loading' && !entry.response ? (
                <div className="flex items-center gap-3 text-indigo-400">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Awaiting Engine Handshake...</span>
                </div>
              ) : (
                <div className="relative group">
                  <div className="absolute -top-2 -right-2 flex gap-1 z-10">
                    {entry.status === 'success' ? (
                      <div className="p-1.5 bg-slate-950 border border-emerald-500/30 rounded-full">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                    ) : entry.status === 'error' ? (
                      <div className="p-1.5 bg-slate-950 border border-rose-500/30 rounded-full">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                      </div>
                    ) : null}
                  </div>
                  <pre className="text-[11px] leading-relaxed overflow-x-auto selection:bg-indigo-500/30 font-mono scrollbar-hide">
                    <code className={entry.status === 'error' ? 'text-rose-400' : 'text-indigo-200'}>
                      {typeof entry.response === 'string' 
                        ? entry.response 
                        : JSON.stringify(entry.response, null, 2)}
                    </code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="shrink-0 relative">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3 pointer-events-none">
          <Code className="w-4 h-4 text-indigo-500" />
          <span className="text-indigo-400/60 font-bold">$</span>
        </div>
        <input 
          ref={inputRef}
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Execute protocol call (e.g., help, gemini generate, set-key)..."
          className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-[2rem] py-5 pl-16 pr-16 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none text-slate-100 placeholder:text-slate-700 shadow-2xl transition-all font-mono"
        />
        <button 
          type="submit" 
          disabled={!input.trim()}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-[1.5rem] transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ApiTerminal;
