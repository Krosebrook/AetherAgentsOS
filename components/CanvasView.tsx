
import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, Download, Wand2, Loader2 } from 'lucide-react';
import { generateImage } from '../services/geminiService';

const CanvasView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<{url: string, prompt: string}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    try {
      const url = await generateImage(prompt);
      if (url) {
        setImages(prev => [{ url, prompt }, ...prev]);
        setPrompt('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      <div className="p-8 border-b border-slate-800 bg-slate-900/20">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-500/10 rounded-lg">
                <ImageIcon className="w-5 h-5 text-indigo-400" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-slate-100">Visual Synthesis Canvas</h2>
                <p className="text-sm text-slate-500">Harnessing Gemini 2.5 Flash for high-fidelity image generation.</p>
             </div>
          </div>
          
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the visual concept you want to synthesize..."
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-6 pr-40 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all placeholder:text-slate-600 text-slate-100"
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-6 rounded-xl transition-all flex items-center gap-2 font-medium"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {isGenerating ? 'Synthesizing...' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isGenerating && (
            <div className="aspect-square bg-slate-900 border border-indigo-500/20 rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-pulse">
               <Sparkles className="w-12 h-12 text-indigo-500/50 mb-4 animate-pulse" />
               <p className="text-slate-400 text-sm font-medium">Rendering Neural Patterns...</p>
               <p className="text-slate-600 text-xs mt-1">Applying diffusion layers</p>
            </div>
          )}
          
          {images.map((img, i) => (
            <div key={i} className="group relative bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-all">
              <img src={img.url} alt={img.prompt} className="w-full aspect-square object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                <p className="text-xs text-slate-200 line-clamp-2 mb-4 font-medium italic">"{img.prompt}"</p>
                <div className="flex gap-2">
                  <a 
                    href={img.url} 
                    download={`aether-${i}.png`}
                    className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-3 h-3" /> Export
                  </a>
                </div>
              </div>
            </div>
          ))}
          
          {images.length === 0 && !isGenerating && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-600">
               <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
               <p className="text-lg font-medium opacity-50">Empty Canvas</p>
               <p className="text-sm opacity-50">Start by describing a visual concept above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CanvasView;
