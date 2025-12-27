
import React, { useState, useRef, useEffect } from 'react';
import { Send, Globe, Sparkles, User, Bot, Clock } from 'lucide-react';
import { Message, AgentConfig } from '../types';
import { generateAgentResponse } from '../services/geminiService';

interface Props {
  config: AgentConfig;
  onMetricUpdate: (tokens: number) => void;
}

const ChatView: React.FC<Props> = ({ config, onMetricUpdate }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Aether core initialized. Ready for multi-modal orchestration. How can I assist you today?',
      timestamp: Date.now(),
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

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

    const assistantMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      type: 'text'
    }]);

    try {
      let fullResponse = "";
      if (config.useSearch) {
        // Search grounding doesn't support streaming well in some SDK versions, fallback to direct
        const result = await generateAgentResponse(config, input);
        const searchResult = result as { text: string; grounding: any[] };
        
        setMessages(prev => prev.map(m => 
          m.id === assistantMsgId 
            ? { 
                ...m, 
                content: searchResult.text, 
                metadata: { 
                    model: config.model,
                    urls: searchResult.grounding.map((g: any) => ({ uri: g.web?.uri || g.maps?.uri, title: g.web?.title || g.maps?.title }))
                } 
              } 
            : m
        ));
        onMetricUpdate(searchResult.text.length / 4);
      } else {
        await generateAgentResponse(config, input, (chunk) => {
          fullResponse += chunk;
          setMessages(prev => prev.map(m => 
            m.id === assistantMsgId ? { ...m, content: fullResponse } : m
          ));
        });
        onMetricUpdate(fullResponse.length / 4);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map(m => 
        m.id === assistantMsgId ? { ...m, content: "Error: Inference failed. Please check your API configuration." } : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-950">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'
            }`}>
              {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-indigo-400" />}
            </div>
            <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : ''}`}>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {msg.role === 'assistant' ? 'Aether Node' : 'System Architect'}
                </span>
                <Clock className="w-3 h-3 text-slate-600" />
                <span className="text-[10px] text-slate-600">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-slate-800 text-slate-200 border border-slate-700' 
                  : 'bg-transparent text-slate-300'
              }`}>
                {msg.content || (isLoading && msg.id === messages[messages.length-1].id ? (
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                  </div>
                ) : null)}
                
                {msg.metadata?.urls && msg.metadata.urls.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                      <Globe className="w-3 h-3" /> Grounding Sources
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {msg.metadata.urls.map((url, i) => (
                        <a 
                          key={i}
                          href={url.uri} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[10px] text-indigo-400 hover:border-indigo-500/50 transition-colors"
                        >
                          {url.title || 'View Source'}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative group">
          <div className="absolute -top-10 left-0 right-0 flex justify-between px-2">
             <div className="flex items-center gap-2 text-[10px] text-slate-500">
               <Sparkles className="w-3 h-3 text-indigo-500" />
               Using {config.model.split('-')[1].toUpperCase()} {config.useSearch && ' + Search'}
             </div>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Issue command to agent..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 pr-16 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all placeholder:text-slate-600 text-slate-200"
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;
