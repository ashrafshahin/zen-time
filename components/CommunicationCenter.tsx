
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { EmailDraft } from '../types';

const CommunicationCenter: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [currentDraft, setCurrentDraft] = useState<EmailDraft | null>(null);
  const [history, setHistory] = useState<EmailDraft[]>([]);

  const handleDraft = async () => {
    if (!prompt) return;
    setIsDrafting(true);
    const draft = await geminiService.draftEmail(prompt);
    setCurrentDraft({
      to: '',
      subject: draft.subject,
      body: draft.body,
      status: 'draft',
      timestamp: Date.now()
    });
    setIsDrafting(false);
  };

  const sendEmail = () => {
    if (!currentDraft) return;
    const mailto = `mailto:${currentDraft.to}?subject=${encodeURIComponent(currentDraft.subject)}&body=${encodeURIComponent(currentDraft.body)}`;
    window.location.href = mailto;
    
    setHistory([
      { ...currentDraft, status: 'sent', timestamp: Date.now() },
      ...history
    ]);
    setCurrentDraft(null);
    setPrompt('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in zoom-in-95 duration-500">
      <div className="space-y-6">
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-xl">
          <h3 className="text-xl font-bold mb-4">Draft Smart Communication</h3>
          <p className="text-zinc-500 text-sm mb-6">Describe who you are emailing and what you want to achieve. Gemini will craft a precise message for you.</p>
          
          <div className="space-y-4">
            <textarea
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-5 outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[160px] resize-none transition-all"
              placeholder="e.g. Write a status update to the engineering team about the project delay, proposing a new timeline."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />
            
            <button
              onClick={handleDraft}
              disabled={isDrafting || !prompt}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-3 transition-all"
            >
              {isDrafting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Gemini is composing...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  <span>Generate Draft</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-zinc-900/40 p-6 rounded-3xl border border-zinc-800/50">
           <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-4">Recent History</h4>
           <div className="space-y-3">
             {history.length === 0 ? (
               <p className="text-zinc-600 text-sm italic">No communications logged yet.</p>
             ) : (
               history.slice(0, 3).map((item, idx) => (
                 <div key={idx} className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800">
                   <p className="font-medium text-zinc-300 line-clamp-1">{item.subject}</p>
                   <p className="text-xs text-zinc-500 mt-1">{new Date(item.timestamp).toLocaleTimeString()}</p>
                 </div>
               ))
             )}
           </div>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col min-h-[500px] shadow-2xl">
        {currentDraft ? (
          <>
            <div className="bg-zinc-900/50 p-6 border-b border-zinc-800 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-indigo-400">Generated Draft</h4>
                <p className="text-xs text-zinc-500">Edit or refine before sending</p>
              </div>
              <button onClick={() => setCurrentDraft(null)} className="text-zinc-500 hover:text-zinc-300 p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex-1 p-8 space-y-6">
              <div>
                <label className="text-xs font-bold text-zinc-600 uppercase mb-2 block">To (Optional)</label>
                <input 
                  type="email"
                  className="w-full bg-transparent border-b border-zinc-800 py-2 focus:border-indigo-500 outline-none text-zinc-300"
                  placeholder="team@company.com"
                  value={currentDraft.to}
                  onChange={e => setCurrentDraft({...currentDraft, to: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-600 uppercase mb-2 block">Subject</label>
                <input 
                  type="text"
                  className="w-full bg-transparent border-b border-zinc-800 py-2 focus:border-indigo-500 outline-none font-semibold text-zinc-100"
                  value={currentDraft.subject}
                  onChange={e => setCurrentDraft({...currentDraft, subject: e.target.value})}
                />
              </div>
              <div>
                 <label className="text-xs font-bold text-zinc-600 uppercase mb-2 block">Message</label>
                 <textarea 
                  className="w-full bg-transparent outline-none text-zinc-300 leading-relaxed resize-none h-64 scrollbar-hide"
                  value={currentDraft.body}
                  onChange={e => setCurrentDraft({...currentDraft, body: e.target.value})}
                 />
              </div>
            </div>

            <div className="p-6 bg-zinc-900/30 border-t border-zinc-800">
               <button 
                 onClick={sendEmail}
                 className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/10"
               >
                 Open in Email Client
               </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-zinc-700">
             <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
             </div>
             <p className="text-lg font-medium text-zinc-600">Your draft will appear here.</p>
             <p className="text-sm max-w-[240px] mt-2">Use the generator on the left to start a new professional message.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationCenter;
