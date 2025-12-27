
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Zap, Clock, DollarSign } from 'lucide-react';

const data = [
  { name: '10:00', tokens: 400, latency: 1.2 },
  { name: '10:05', tokens: 1200, latency: 2.8 },
  { name: '10:10', tokens: 800, latency: 1.5 },
  { name: '10:15', tokens: 2100, latency: 4.1 },
  { name: '10:20', tokens: 1600, latency: 3.2 },
  { name: '10:25', tokens: 2800, latency: 4.5 },
  { name: '10:30', tokens: 1900, latency: 3.0 },
];

const MetricsView: React.FC = () => {
  return (
    <div className="flex-1 p-8 bg-slate-950 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Activity className="text-emerald-500 w-6 h-6" /> System Telemetry
          </h2>
          <p className="text-slate-500">Real-time inference performance and resource allocation metrics.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Avg Latency', value: '2.4s', icon: Clock, color: 'text-indigo-400' },
            { label: 'Token Throughput', value: '45.2k', icon: Zap, color: 'text-amber-400' },
            { label: 'Est. Daily Cost', value: '$1.12', icon: DollarSign, color: 'text-emerald-400' },
            { label: 'Uptime', value: '99.99%', icon: Activity, color: 'text-indigo-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-slate-100">{stat.value}</div>
              <div className="mt-2 flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold">
                <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded">+12% vs last hour</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider">Inference Density Over Time</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    itemStyle={{ color: '#818cf8', fontSize: '12px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="tokens" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorTokens)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsView;
