
import React, { useState, useCallback, useRef } from 'react';
import { 
  Plus, Play, Trash2, BookOpen, Settings2, ShieldCheck, 
  Cpu, Search, Zap, FileCode, Layers, ChevronRight, 
  Code2, ShieldAlert, CheckCircle2, Link, FolderOpen, Loader2, FastForward
} from 'lucide-react';
import { WorkflowNode, WorkflowEdge, NodeType, ModelType, WorkflowTemplate } from '../types';

const INDUSTRIAL_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'researcher',
    name: 'Autonomous Researcher',
    description: 'Scrapes competitors, synthesizes market gaps, and outputs analysis.',
    nodes: [
      { id: '1', type: NodeType.TRIGGER, label: 'Topic Input', position: { x: 50, y: 150 }, data: { temperature: 0.7 } },
      { id: '2', type: NodeType.TOOL, label: 'Search Engine', position: { x: 260, y: 50 }, data: { toolType: 'search' } },
      { id: '3', type: NodeType.AGENT, label: 'Synthesis Pro', position: { x: 480, y: 150 }, data: { instruction: 'Summarize results.', model: ModelType.PRO, thinkingBudget: 4096 } },
      { id: '4', type: NodeType.DOCS, label: 'Report Gen', position: { x: 720, y: 150 }, data: { instruction: 'Markdown format.' } }
    ],
    edges: [{ id: 'e1', source: '1', target: '2' }, { id: 'e2', source: '2', target: '3' }, { id: 'e3', source: '3', target: '4' }]
  },
  {
    id: 'code-audit',
    name: 'Security Auditor',
    description: 'Analyzes code for vulnerabilities and suggests patches.',
    nodes: [
      { id: 'c1', type: NodeType.TRIGGER, label: 'Git Hook', position: { x: 50, y: 150 }, data: {} },
      { id: 'c2', type: NodeType.AGENT, label: 'Sec Lead', position: { x: 300, y: 150 }, data: { instruction: 'Audit diff.', model: ModelType.PRO } },
      { id: 'c3', type: NodeType.GUARDRAIL, label: 'Rules Engine', position: { x: 300, y: 300 }, data: { rules: ['OWASP Top 10'] } },
      { id: 'c4', type: NodeType.CODE, label: 'Patch Fix', position: { x: 550, y: 150 }, data: { code: 'function fix(v) { return v; }' } }
    ],
    edges: [{ id: 'ce1', source: 'c1', target: 'c2' }, { id: 'ce2', source: 'c2', target: 'c4' }, { id: 'ce3', source: 'c3', target: 'c2' }]
  }
];

const CanvasView: React.FC<{ onLog: any }> = ({ onLog }) => {
  const [nodes, setNodes] = useState<WorkflowNode[]>(INDUSTRIAL_TEMPLATES[0].nodes);
  const [edges, setEdges] = useState<WorkflowEdge[]>(INDUSTRIAL_TEMPLATES[0].edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
  const [simulationState, setSimulationState] = useState<'idle' | 'running'>('idle');
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggedNodeId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - 88;
      const y = e.clientY - rect.top - 32;
      setNodes(prev => prev.map(n => n.id === draggedNodeId ? { ...n, position: { x, y } } : n));
    }
  }, [draggedNodeId]);

  const addNode = (type: NodeType) => {
    const newNode: WorkflowNode = {
      id: `n-${Date.now()}`,
      type,
      label: `New ${type}`,
      position: { x: 100, y: 100 },
      data: { model: ModelType.FLASH, thinkingBudget: 0 }
    };
    setNodes([...nodes, newNode]);
    onLog('info', 'CANVAS', `Node ${type} added.`);
  };

  const runSimulation = () => {
    setSimulationState('running');
    onLog('info', 'ENGINE', 'Sequence initialization started.');
    nodes.forEach((n, i) => {
      setTimeout(() => {
        setNodes(prev => prev.map(node => node.id === n.id ? { ...node, status: 'running' } : node));
        setTimeout(() => {
          setNodes(prev => prev.map(node => node.id === n.id ? { ...node, status: 'success' } : node));
          if (i === nodes.length - 1) setSimulationState('idle');
        }, 1000);
      }, i * 800);
    });
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-950 relative">
      <div className="w-80 border-r border-slate-800 bg-slate-950/80 backdrop-blur-3xl p-6 flex flex-col gap-6 z-30 overflow-y-auto scrollbar-hide">
        <header className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-100 flex items-center gap-2 uppercase tracking-widest">
            <Layers className="w-4 h-4 text-indigo-500" /> Schematics
          </h2>
        </header>

        <section className="space-y-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Blueprints</p>
          {INDUSTRIAL_TEMPLATES.map(t => (
            <button key={t.id} onClick={() => { setNodes(t.nodes); setEdges(t.edges); }} className="w-full text-left p-4 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-indigo-500/40 transition-all">
              <h4 className="text-xs font-bold text-slate-200">{t.name}</h4>
              <p className="text-[10px] text-slate-500 mt-1">{t.description}</p>
            </button>
          ))}
        </section>

        <section className="space-y-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Add Node</p>
          <div className="grid grid-cols-2 gap-2">
            {[NodeType.AGENT, NodeType.TOOL, NodeType.GUARDRAIL, NodeType.CODE].map(type => (
              <button key={type} onClick={() => addNode(type)} className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500/40 text-[10px] font-bold text-slate-400 uppercase">
                {type}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div 
        ref={canvasRef}
        className="flex-1 relative bg-slate-950"
        onMouseMove={handleMouseMove}
        onMouseUp={() => setDraggedNodeId(null)}
        onClick={() => { setSelectedNodeId(null); setConnectingNodeId(null); }}
        style={{ backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      >
        <div className="absolute top-8 left-8 flex gap-4 z-40">
           <button onClick={runSimulation} disabled={simulationState === 'running'} className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase text-white shadow-xl flex items-center gap-2">
              {simulationState === 'running' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              {simulationState === 'running' ? 'Simulating' : 'Deploy'}
           </button>
        </div>

        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          {edges.map(edge => {
            const s = nodes.find(n => n.id === edge.source);
            const t = nodes.find(n => n.id === edge.target);
            if (!s || !t) return null;
            const sx = s.position.x + 176, sy = s.position.y + 32;
            const tx = t.position.x, ty = t.position.y + 32;
            return <path key={edge.id} d={`M ${sx} ${sy} C ${sx + 80} ${sy}, ${tx - 80} ${ty}, ${tx} ${ty}`} stroke={s.status === 'success' ? '#6366f1' : '#1e293b'} strokeWidth="2" fill="none" className="transition-all duration-500" />;
          })}
        </svg>

        {nodes.map(node => (
          <div key={node.id} onMouseDown={(e) => { e.stopPropagation(); setDraggedNodeId(node.id); setSelectedNodeId(node.id); }} className={`absolute w-44 h-16 bg-slate-900 border-2 rounded-2xl flex items-center px-4 cursor-grab ${selectedNodeId === node.id ? 'border-indigo-500 shadow-2xl scale-105' : 'border-slate-800'} ${node.status === 'running' ? 'animate-pulse ring-2 ring-indigo-500/50' : ''}`} style={{ left: node.position.x, top: node.position.y }}>
             <div className="p-2 bg-slate-800 rounded-lg mr-3">
                {node.type === NodeType.AGENT ? <Cpu className="w-4 h-4 text-indigo-400" /> : <Settings2 className="w-4 h-4 text-slate-400" />}
             </div>
             <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-200 uppercase truncate">{node.label}</p>
                {node.status === 'success' && <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-1" />}
             </div>
             <div onMouseDown={(e) => { e.stopPropagation(); setConnectingNodeId(node.id); }} className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-800 border-2 border-slate-700 rounded-full cursor-crosshair hover:bg-emerald-500 transition-colors" />
          </div>
        ))}
      </div>

      {selectedNode && (
        <div className="w-80 border-l border-slate-800 bg-slate-950/95 backdrop-blur-3xl p-6 flex flex-col gap-6 z-40 animate-in slide-in-from-right duration-300">
           <h3 className="text-[10px] font-bold text-slate-100 uppercase tracking-widest">Node Settings</h3>
           <div className="space-y-4">
              <div className="space-y-2">
                 <label className="text-[9px] text-slate-500 uppercase font-bold">Label</label>
                 <input type="text" value={selectedNode.label} onChange={e => setNodes(nodes.map(n => n.id === selectedNodeId ? { ...n, label: e.target.value } : n))} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none" />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CanvasView;
const Workflow = Layers;
