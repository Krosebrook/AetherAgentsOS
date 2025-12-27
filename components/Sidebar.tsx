
import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Image as ImageIcon, 
  Zap, 
  Settings, 
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'chat', label: 'Agent Chat', icon: MessageSquare },
    { id: 'canvas', label: 'Image Canvas', icon: ImageIcon },
    { id: 'metrics', label: 'Inference Metrics', icon: Activity },
    { id: 'orchestration', label: 'Orchestration', icon: Layers },
  ];

  return (
    <div className="w-64 border-r border-slate-800 h-full flex flex-col bg-slate-950/50 backdrop-blur-xl">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <Zap className="w-5 h-5 text-white fill-current" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100 italic">AETHER</h1>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">Workspace</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
              activeTab === item.id 
                ? 'bg-slate-800 text-indigo-400 shadow-sm ring-1 ring-slate-700' 
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
            {activeTab === item.id && <ChevronRight className="ml-auto w-3 h-3" />}
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <button className="flex items-center gap-3 w-full px-3 py-2 text-slate-400 hover:text-slate-200 transition-colors text-sm">
          <Settings className="w-4 h-4" />
          System Config
        </button>
        <div className="mt-4 p-3 bg-slate-900/50 rounded-xl border border-slate-800/50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 font-medium">QUOTA STATUS</span>
            <span className="text-[10px] text-emerald-400 font-bold">ACTIVE</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-500 h-full w-[65%]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
