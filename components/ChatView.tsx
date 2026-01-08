
import React, { useState, useRef, useEffect } from 'react';
import { Send, Globe, Sparkles, User, Bot, Clock, Cpu, BrainCircuit, Loader2 } from 'lucide-react';
import { Message, Agent } from '../types';
import { generateAgentResponse } from '../services/geminiService';

interface Props {
  agent: Agent;
  onMetricUpdate: (tokens: number, latency: number) => void;
  onLog: (level: 'info' | 'warn' | 'error' | 'critical', source: string, message: string) => void;
}

const ChatView: React.FC<Props> = ({ agent, onMetricUpdate, onLog }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Aether Node [${agent.name}] protocol initialized. Monitoring port active.`,
      timestamp: Date.now(),
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    if (agent.thinkingBudget > 0) setIsThinking(true);

    const assistantMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      type: 'text'
    }]);

    onLog('info', agent.name, `Processing prompt: "${input.substring(0, 30)}..."`);

    try {
      const result = await generateAgentResponse(
        agent, 
        input, 
        'chat-session', // sessionId for tracking
        agent.id, // agentId for tracking
        (currentFullText) => {
          setIsThinking(false);
          setMessages(prev => prev.map(m => 
            m.id === assistantMsgId ? { ...m, content: currentFullText } : m
          ));
        }
      );
      
      const searchResult = result as { text: string; grounding?: any[]; latency: number; modelUsed: string };
      setIsThinking(false);
      
      setMessages(prev => prev.map(m => 
        m.id === assistantMsgId 
          ? { 
              ...m, 
              content: searchResult.text, 
              metadata: { 
                  model: searchResult.modelUsed,
                  latency: searchResult.latency,
                  urls: searchResult.grounding?.map((g: any) => ({ uri: g.web?.uri || g.maps?.uri, title: g.web?.title || g.maps?.title }))
              } 
            } 
          : m
      ));

      const tokens = searchResult.text.length / 4;
      onMetricUpdate(tokens, searchResult.latency);
      onLog('info', searchResult.modelUsed, `Inference complete. Latency: ${searchResult.latency}ms. Tokens: ~${Math.round(tokens)}`);
      
    } catch (error: any) {
      setIsThinking(false);
      onLog('error', 'API_LAYER', error.message || 'Fatal Protocol Error');
      setMessages(prev => prev.map(m => 
        m.id === assistantMsgId ? { ...m, content: `CRITICAL_EXCEPTION: ${error.message || 'Handshake failed.'}` } : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-950">
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-indigo-500/10 rounded-lg"><Cpu className="w-4 h-4 text-indigo-400" /></div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">{agent.name}</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">{agent.model} {agent.thinkingBudget > 0 && `| R:${agent.thinkingBudget}`}</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth pb-12">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-slate-900 border border-slate-800'}`}>
              {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-indigo-400" />}
            </div>
            <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : ''}`}>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{msg.role === 'assistant' ? agent.name : 'OPERATOR'}</span>
                <span className="text-[10px] text-slate-600">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className={`p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-slate-900 text-slate-200 border border-slate-800' : 'bg-transparent text-slate-300'}`}>
                {msg.content}
                {isLoading && !msg.content && msg.id === messages[messages.length-1].id && (
                  <div className="flex gap-1.5 py-1">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                  </div>
                )}
                
                {msg.metadata?.urls && msg.metadata.urls.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                    <p className="text-[9px] font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-widest"><Globe className="w-3 h-3" /> External Grounding</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.metadata.urls.map((url, i) => (
                        <a key={i} href={url.uri} target="_blank" rel="noreferrer" className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[9px] text-indigo-400 hover:text-indigo-300 transition-colors">{url.title || 'Citation'}</a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex gap-4 max-w-4xl mx-auto animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <BrainCircuit className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex-1 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />
                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Neural Reasoning Engine Active</span>
              </div>
              <div className="h-2 w-full bg-amber-500/10 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 animate-[shimmer_2s_infinite]" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-800 bg-slate-950/80 backdrop-blur-md mb-10">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative group">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Instruct Node: ${agent.name}...`} className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 pr-16 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-700 text-slate-200" />
          <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;
