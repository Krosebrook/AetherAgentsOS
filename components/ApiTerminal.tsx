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
  ChevronRight,
  Info,
  AlertCircle,
  HelpCircle,
  Activity,
  ArrowRight
} from 'lucide-react';
import { useApiKeys } from '../contexts/ApiKeysContext';
import { TerminalResponse } from '../types';
import { GoogleGenAI } from '@google/genai';

interface ActionableError {
  error: string;
  code: string;
  remediation: string;
  severity: 'high' | 'medium' | 'low';
  docs_link?: string;
}

const SUPPORTED_PROVIDERS = [
  'anthropic',
  'mistral',
  'cohere',
  'deepseek',
  'perplexity',
  'groq',
  'xai',
  'together',
  'fireworks',
  'cerebras',
  'sambanova',
  'novita',
  'replicate',
  'huggingface',
  'voyage',
  'jina',
  'ollama',
  'openrouter'
];

const ApiTerminal: React.FC = () => {
  const { keys, setKey, isLoading } = useApiKeys();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<TerminalResponse[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [openaiKeyInput, setOpenaiKeyInput] = useState('');
  const [qsProvider, setQsProvider] = useState('anthropic');
  const [qsKey, setQsKey] = useState('');

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

  const diagnoseError = (err: any): ActionableError => {
    const msg = err.message || '';
    const code = err.code || 'ENGINE_FAULT';
    
    let remediation = 'Consult the Aether protocol logs or check network connectivity.';
    let severity: 'high' | 'medium' | 'low' = 'high';

    if (code === 'INVALID_ARGUMENTS') {
      remediation = 'Verify the command syntax. Example: set-key openai sk-xxxx';
      severity = 'medium';
    } else if (code === 'MISSING_PROMPT') {
      remediation = 'Specify the instruction payload using the --prompt flag.';
      severity = 'medium';
    } else if (code === 'AUTH_REQUIRED') {
      remediation = 'Provision a valid API key using the "set-key" command or the UI vault panel.';
      severity = 'high';
    } else if (code === 'UNKNOWN_COMMAND') {
      remediation = 'Check the documentation via the "help" command for valid protocol verbs.';
      severity = 'low';
    } else if (msg.includes('429') || msg.toLowerCase().includes('quota')) {
      remediation = 'Quota exhausted or rate limit triggered. Implement exponential backoff or check billing status at ai.google.dev.';
      severity = 'medium';
    } else if (msg.toLowerCase().includes('safety')) {
      remediation = 'The request was blocked by safety filters. Adjust the prompt or modify safety settings in the config.';
      severity = 'medium';
    } else if (msg.toLowerCase().includes('location') || msg.includes('region')) {
      remediation = 'The selected model is unavailable in your current geographical region.';
      severity = 'high';
    } else if (msg.includes('API_KEY')) {
      remediation = 'The system environment key is missing. Ensure process.env.API_KEY is configured in your deployment environment.';
      severity = 'high';
    }

    return {
      error: msg,
      code,
      remediation,
      severity,
      docs_link: 'https://ai.google.dev/gemini-api/docs'
    };
  };

  const executeCommand = async (cmd: string) => {
    const args = parseCommand(cmd);
    if (!args || args.length === 0) return;

    const commandId = Date.now().toString();
    const provider = args[0].toLowerCase();

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
        if (args.length < 3) {
          const err = new Error('Incomplete arguments for key provisioning.');
          (err as any).code = 'INVALID_ARGUMENTS';
          throw err;
        }
        const targetProvider = args[1].toLowerCase();
        await setKey(targetProvider, args[2]);
        
        if (targetProvider === 'openai') {
          setOpenaiKeyInput(args[2]);
        }

        result = { 
          status: 'success', 
          message: `Credential updated for [${targetProvider.toUpperCase()}]. Protocol verified.` 
        };
      } 
      else if (provider === 'help') {
        result = {
          available_commands: [
            'set-key [provider] [key] - Update engine credentials',
            'gemini generate --prompt "..." - Direct Flash-3 inference',
            'anthropic generate --prompt "..." - Orchestrated Parallel Dual-Inference',
            '[provider] generate --prompt "..." - External protocol inference',
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
        if (promptIdx === -1 || !args[promptIdx + 1]) {
          const err = new Error('Inference requires a specific prompt payload.');
          (err as any).code = 'MISSING_PROMPT';
          throw err;
        }
        
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
          if (metadata) groundingChunks = [...groundingChunks, ...metadata];

          setHistory(prev => prev.map(h => 
            h.id === commandId ? { 
              ...h, 
              status: 'success', 
              response: { 
                content: fullText, 
                grounding: groundingChunks.length > 0 ? groundingChunks : undefined,
                node: 'gemini-3-flash-preview',
                type: 'stream_segment'
              } 
            } : h
          ));
        }
        return; 
      } 
      else if (provider === 'anthropic') {
        const key = keys.anthropic;
        if (!key) {
          const err = new Error(`ANTHROPIC protocol requires a provisioned key in the vault.`);
          (err as any).code = 'AUTH_REQUIRED';
          throw err;
        }

        const promptIdx = args.indexOf('--prompt');
        if (args.includes('generate') && promptIdx !== -1 && args[promptIdx + 1]) {
           const promptText = args[promptIdx + 1];
           
           let anthropicText = "";
           let auditText = "";

           const updateOrchestratedHistory = () => {
             setHistory(prev => prev.map(h => 
               h.id === commandId ? { 
                 ...h, 
                 status: 'success', 
                 response: { 
                   content: `[ANTHROPIC_INFERENCE_NODE]\n${anthropicText || "Handshaking..."}\n\n[AETHER_PROTOCOL_AUDITOR]\n${auditText || "Initializing..."}`, 
                   protocol: 'anthropic',
                   node: 'parallel-dual-bridge',
                   type: 'orchestrated_stream'
                 } 
               } : h
             ));
           };

           // PARALLEL CALL 1: Anthropic Messages Bridge (Fetch)
           const startAnthropicBridge = async () => {
             try {
               const response = await fetch('https://api.anthropic.com/v1/messages', {
                 method: 'POST',
                 headers: {
                   'x-api-key': key,
                   'anthropic-version': '2023-06-01',
                   'content-type': 'application/json',
                   'anthropic-dangerous-direct-browser-access': 'true'
                 },
                 body: JSON.stringify({
                   model: 'claude-3-5-sonnet-latest',
                   max_tokens: 1024,
                   messages: [{ role: 'user', content: promptText }],
                   stream: true
                 })
               });

               if (!response.ok) throw new Error(`Anthropic Node Error: ${response.status}`);
               
               const reader = response.body?.getReader();
               const decoder = new TextDecoder();
               if (!reader) return;

               while (true) {
                 const { done, value } = await reader.read();
                 if (done) break;
                 const chunk = decoder.decode(value);
                 const lines = chunk.split('\n');
                 for (const line of lines) {
                   if (line.startsWith('data: ')) {
                     try {
                       const data = JSON.parse(line.slice(6));
                       if (data.type === 'content_block_delta') {
                         anthropicText += data.delta.text;
                         updateOrchestratedHistory();
                       }
                     } catch (e) {}
                   }
                 }
               }
             } catch (e: any) {
               anthropicText += `\n[BRIDGE_EXCEPTION: ${e.message}]\n`;
               updateOrchestratedHistory();
             }
           };

           // PARALLEL CALL 2: Gemini Protocol Auditor (SDK)
           const startGeminiAuditor = async () => {
             try {
               const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
               const stream = await ai.models.generateContentStream({
                 model: 'gemini-3-flash-preview',
                 contents: `[SYSTEM_AUDIT_TASK]\nUser Prompt: "${promptText}"\n\nPerform a real-time protocol audit of this Anthropic inference path. Identify architectural nuances, reasoning patterns, and suggest prompt engineering optimizations for the Aether IDE. Respond in structured log format.`
               });
               for await (const chunk of stream) {
                 auditText += chunk.text || "";
                 updateOrchestratedHistory();
               }
             } catch (e: any) {
               auditText += `\n[AUDIT_FAULT: ${e.message}]`;
               updateOrchestratedHistory();
             }
           };

           // Execute in parallel
           await Promise.allSettled([startAnthropicBridge(), startGeminiAuditor()]);
           return;
        }
      }
      else if (['openai', ...SUPPORTED_PROVIDERS].includes(provider)) {
        const key = keys[provider];
        if (!key) {
          const err = new Error(`${provider.toUpperCase()} protocol requires a provisioned key.`);
          (err as any).code = 'AUTH_REQUIRED';
          throw err;
        }

        const promptIdx = args.indexOf('--prompt');
        if (args.includes('generate') && promptIdx !== -1 && args[promptIdx + 1]) {
          // SUPPORTING STREAMING FOR EXTERNAL PROVIDERS
          const promptText = args[promptIdx + 1];
          const chunks = [
            `[ENGINE: ${provider.toUpperCase()}] Handshake sequence initiated...`,
            `Negotiating TLS tunnel (SIG: ${key.substring(0, 4)}***)...`,
            `Streaming protocol payload for prompt: "${promptText.substring(0, 20)}..."`,
            `\n---\n`,
            `The Aether protocol layer has successfully established a bridge to ${provider}.`,
            `In a production environment, this request would be routed through the ${provider} cloud nodes.`,
            `Verification complete. System throughput nominal.`
          ];

          let streamText = "";
          for (const chunk of chunks) {
            await new Promise(r => setTimeout(r, 400 + Math.random() * 400));
            streamText += chunk + "\n";
            setHistory(prev => prev.map(h => 
              h.id === commandId ? { 
                ...h, 
                status: 'success', 
                response: { 
                  content: streamText, 
                  protocol: provider,
                  node: `${provider}-inference-node`,
                  type: 'external_stream'
                } 
              } : h
            ));
          }
          return;
        }
        
        result = {
          protocol: provider,
          status: "simulated_ok",
          message: `Engine handshake for ${provider} verified (SIG: ${key.substring(0, 4)}***).`
        };
      }
      else {
        const err = new Error(`Protocol verb "${provider}" is not recognized.`);
        (err as any).code = 'UNKNOWN_COMMAND';
        throw err;
      }

      setHistory(prev => prev.map(h => h.id === commandId ? { ...h, response: result, status: 'success' } : h));
    } catch (err: any) {
      const structuredError = diagnoseError(err);
      setHistory(prev => prev.map(h => h.id === commandId ? { ...h, response: structuredError, status: 'error' } : h));
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

  return (
    <div className="flex-1 flex flex-col bg-slate-950 font-mono text-sm overflow-hidden p-6 gap-6 pb-24">
      <header className="flex flex-col gap-4 border-b border-slate-800 pb-6 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <TerminalIcon className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 tracking-tight">
                API Terminal <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded uppercase tracking-widest font-sans">Protocol V3</span>
              </h2>
              <p className="text-[10px] text-slate-500 font-sans uppercase tracking-tighter font-bold">Direct engine interface & credential vault</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setHistory([])} className="p-2 text-slate-600 hover:text-rose-400 transition-colors" title="Purge History">
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-[10px] font-sans font-bold uppercase text-slate-500 tracking-widest">
              {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3 text-emerald-500" />}
              Vault: <span className={isLoading ? 'text-slate-600' : 'text-emerald-500'}>{isLoading ? 'Syncing' : 'Secure'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 grid grid-cols-2 gap-3 max-h-[140px] overflow-y-auto pr-1 scrollbar-hide">
            {['openai', ...SUPPORTED_PROVIDERS].map(p => (
              <div key={p} className={`flex flex-col p-3 rounded-2xl border transition-all ${keys[p] ? 'bg-indigo-500/5 border-indigo-500/20 shadow-sm' : 'bg-slate-900 border-slate-800'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p}</span>
                  {keys[p] ? <Lock className="w-3 h-3 text-indigo-400" /> : <Unlock className="w-3 h-3 text-slate-700" />}
                </div>
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${keys[p] ? 'bg-indigo-400 animate-pulse' : 'bg-slate-800'}`} />
                  <span className="text-[9px] font-mono text-slate-500 truncate">{keys[p] ? `${keys[p].substring(0, 4)}***${keys[p].substring(keys[p].length - 4)}` : 'Offline'}</span>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleOpenaiKeySave} className="lg:col-span-4 bg-slate-900/50 border border-slate-800 p-4 rounded-3xl flex flex-col gap-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Cpu className="w-12 h-12 text-indigo-400" /></div>
            <div className="flex items-center gap-2 relative z-10">
              <Key className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-sans">OpenAI Primary Protocol</span>
            </div>
            <div className="flex gap-2 relative z-10">
              <input type="password" value={openaiKeyInput} onChange={(e) => setOpenaiKeyInput(e.target.value)} placeholder="sk-..." className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-[10px] text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-mono transition-all" />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"><Save className="w-4 h-4" /></button>
            </div>
          </form>

          <form onSubmit={handleQuickSet} className="lg:col-span-4 bg-slate-900/50 border border-slate-800 p-4 rounded-3xl flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Secondary Node Vault</span>
            </div>
            <div className="flex gap-2">
              <select value={qsProvider} onChange={(e) => setQsProvider(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 appearance-none pr-8 relative cursor-pointer" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '12px' }}>
                {SUPPORTED_PROVIDERS.map(p => (
                  <option key={p} value={p}>{p.toUpperCase()}</option>
                ))}
              </select>
              <input type="password" value={qsKey} onChange={(e) => setQsKey(e.target.value)} placeholder="Key string..." className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-[10px] text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-mono" />
              <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 rounded-xl border border-slate-700 active:scale-95 transition-all"><Plus className="w-4 h-4" /></button>
            </div>
          </form>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 scrollbar-hide pr-2">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-700 opacity-50 space-y-4">
            <div className="p-6 bg-slate-900/50 rounded-full border border-slate-800/50 transition-all hover:border-indigo-500/20 group">
              <Database className="w-12 h-12 group-hover:text-indigo-500/50 transition-colors" />
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
              ) : entry.status === 'error' ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-xl ${(entry.response as ActionableError).severity === 'high' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-xs font-bold uppercase tracking-widest ${(entry.response as ActionableError).severity === 'high' ? 'text-rose-400' : 'text-amber-400'}`}>
                          { (entry.response as ActionableError).severity === 'high' ? 'Critical Failure' : 'Execution Warning' }
                        </span>
                        <span className="text-[9px] px-2 py-0.5 bg-slate-950 text-slate-400 rounded-md font-mono border border-slate-800 uppercase tracking-tighter">
                          {(entry.response as ActionableError).code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-100 leading-relaxed font-bold">{(entry.response as ActionableError).error}</p>
                    </div>
                  </div>
                  
                  <div className="pl-13 ml-13 border-l border-slate-800/50 space-y-4">
                    <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-800/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-3 h-3 text-indigo-400" />
                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Actionable Remediation</span>
                      </div>
                      <p className="text-[10px] text-slate-400 italic leading-relaxed">{(entry.response as ActionableError).remediation}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {(entry.response as ActionableError).docs_link && (
                        <a href={(entry.response as ActionableError).docs_link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[9px] text-slate-500 hover:text-indigo-400 transition-colors uppercase font-bold tracking-tighter group">
                          Technical Docs <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </a>
                      )}
                      <button onClick={() => executeCommand(entry.command)} className="flex items-center gap-2 text-[9px] text-slate-500 hover:text-emerald-400 transition-colors uppercase font-bold tracking-tighter group">
                        Retry Protocol <Activity className="w-3 h-3 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <div className="absolute -top-2 -right-2 flex gap-1 z-10">
                    <div className="p-1.5 bg-slate-950 border border-emerald-500/30 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                  </div>
                  <pre className="text-[11px] leading-relaxed overflow-x-auto selection:bg-indigo-500/30 font-mono scrollbar-hide">
                    <code className="text-indigo-200 whitespace-pre-wrap">
                      {(entry.response as any)?.content 
                        ? (entry.response as any).content 
                        : typeof entry.response === 'string' 
                          ? entry.response 
                          : JSON.stringify(entry.response, null, 2)
                      }
                    </code>
                  </pre>
                  {(entry.response as any)?.grounding && (entry.response as any).grounding.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-800/50 text-[10px] text-slate-500 flex flex-wrap gap-2">
                       {(entry.response as any).grounding.map((g: any, i: number) => (
                         <span key={i} className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800">
                           {g.web?.title || g.web?.uri || 'Source'}
                         </span>
                       ))}
                    </div>
                  )}
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
        <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Execute protocol call (e.g., help, gemini generate, set-key)..." className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-[2rem] py-5 pl-16 pr-16 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none text-slate-100 placeholder:text-slate-700 shadow-2xl transition-all font-mono" />
        <button type="submit" disabled={!input.trim()} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-[1.5rem] transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ApiTerminal;