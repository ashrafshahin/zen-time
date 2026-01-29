
import React, { useEffect, useState } from 'react';
import { Task, DailyInsight } from '../types';
import { geminiService } from '../services/geminiService';

interface DashboardProps {
  tasks: Task[];
}

const Dashboard: React.FC<DashboardProps> = ({ tasks }) => {
  const [insight, setInsight] = useState<DailyInsight | null>(null);
  const [loading, setLoading] = useState(false);

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
  
  const activePhone = tasks.find(t => t.phoneNumber)?.phoneNumber || "01816677503";

  useEffect(() => {
    const fetchInsight = async () => {
      if (tasks.length === 0) return;
      setLoading(true);
      const data = await geminiService.getDailyOptimizer(tasks);
      setInsight(data);
      setLoading(false);
    };
    fetchInsight();
  }, [tasks]);

  const sendDailySummarySms = () => {
    const todayStr = new Date().toLocaleDateString();
    const taskSummary = tasks
      .filter(t => !t.completed)
      .map(t => `${t.startTime}: ${t.title}`)
      .join('\n');
    
    const message = `Zan Time Summary (${todayStr}):\n\n${taskSummary || 'No tasks remaining!'}`;
    const smsUrl = `sms:${activePhone}?body=${encodeURIComponent(message)}`;
    window.location.href = smsUrl;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Card */}
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl">
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-2">Completion</p>
          <div className="flex items-end justify-between">
            <h3 className="text-4xl font-bold">{Math.round(progress)}%</h3>
            <span className="text-zinc-400 text-sm">{completedCount} / {tasks.length} Routines</span>
          </div>
          <div className="mt-4 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-1000 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Mobile Notification Card */}
        <div className="bg-zinc-900 p-6 rounded-2xl border border-indigo-500/20 shadow-xl flex flex-col justify-between">
           <div>
             <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-1">Mobile Sync Active</p>
             <h4 className="text-xl font-bold">{activePhone}</h4>
             <p className="text-zinc-500 text-xs mt-1">Ready for SMS reminders & summaries.</p>
           </div>
           <button 
            onClick={sendDailySummarySms}
            className="mt-4 w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-2 rounded-xl text-xs font-bold transition-all border border-zinc-700 flex items-center justify-center space-x-2"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
             <span>Send Daily Sync</span>
           </button>
        </div>

        {/* Next Task Card */}
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl">
           <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-4">Upcoming Next</p>
           {tasks.filter(t => !t.completed).length > 0 ? (
             <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-semibold truncate">{tasks.find(t => !t.completed)?.title}</h4>
                    <p className="text-sm text-zinc-400">{tasks.find(t => !t.completed)?.startTime} - {tasks.find(t => !t.completed)?.endTime}</p>
                  </div>
                </div>
             </div>
           ) : (
             <p className="text-zinc-500 italic">No tasks left for today.</p>
           )}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-zinc-900/50 p-8 rounded-2xl border border-indigo-500/20 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
          <svg className="w-24 h-24 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" /></svg>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <h3 className="text-xl font-bold tracking-tight">AI Smart Suggestions</h3>
          </div>
          
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
              <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
            </div>
          ) : insight ? (
            <div className="space-y-6">
              <p className="text-zinc-300 leading-relaxed max-w-2xl">{insight.summary}</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insight.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start space-x-3 text-sm text-zinc-400 bg-zinc-950/40 p-3 rounded-lg border border-zinc-800">
                    <svg className="w-5 h-5 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
             <p className="text-zinc-500">Add some routines to get smart schedule optimization.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
