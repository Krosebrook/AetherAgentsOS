
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, Zap, Clock, DollarSign, Database, TrendingUp } from 'lucide-react';
import { InferenceMetric } from '../types';

interface Props {
  metrics: InferenceMetric[];
}

const MetricsView: React.FC<Props> = ({ metrics }) => {
  const latestLatency = metrics.length > 0 ? metrics[metrics.length - 1].latency.toFixed(2) : '0.00';
  const latestTokens = metrics.length > 0 ? metrics[metrics.length - 1].tokens : 0;
  const avgLatency = metrics.length > 0 
    ? (metrics.reduce((acc, m) => acc + m.latency, 0) / metrics.length).toFixed(2) 
    : '0.00';

  return (
    <div className="flex-1 p-8 bg-slate-950 overflow-y-auto pb-24">
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <div className="flex items-center gap-3 mb-1">
            <Activity className="text-emerald-500 w-6 h-6" />
            <h2 className="text-2xl font-bold text-slate-100">Live Telemetry</h2>
          </div>
          <p className="text-slate-500 text-sm">Synchronized performance metrics and token throughput for active agent nodes.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Current Latency', value: `${latestLatency}s`, icon: Clock, color: 'text-indigo-400', desc: 'Real-time response speed' },
            { label: 'Throughput', value: `${Math.round(latestTokens)} tk`, icon: Zap, color: 'text-amber-400', desc: 'Last inference density' },
            { label: 'Avg Latency', value: `${avgLatency}s`, icon: TrendingUp, color: 'text-emerald-400', desc: 'Session performance mean' },
            { label: 'System Load', value: metrics.length > 0 ? 'NOMINAL' : 'IDLE', icon: Database, color: 'text-indigo-400', desc: 'Compute engine status' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-slate-100 relative z-10">{stat.value}</div>
              <p className="text-[9px] text-slate-600 mt-1 uppercase tracking-tighter">{stat.desc}</p>
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">Inference Density (Tokens)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics}>
                  <defs>
                    <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#334155" fontSize={8} tickLine={false} axisLine={false} />
                  <YAxis stroke="#334155" fontSize={8} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#818cf8', fontSize: '10px' }} />
                  <Area type="monotone" dataKey="tokens" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorTokens)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">Latency Profile (Seconds)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#334155" fontSize={8} tickLine={false} axisLine={false} />
                  <YAxis stroke="#334155" fontSize={8} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fbbf24', fontSize: '10px' }} />
                  <Line type="monotone" dataKey="latency" stroke="#fbbf24" strokeWidth={2} dot={{ fill: '#fbbf24', r: 2 }} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {metrics.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-slate-700 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
             <TrendingUp className="w-12 h-12 mb-4 opacity-20" />
             <p className="text-sm font-bold uppercase tracking-widest opacity-40">No Telemetry Signal</p>
             <p className="text-xs opacity-40 mt-1">Initiate agent inference to capture performance data.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsView;
