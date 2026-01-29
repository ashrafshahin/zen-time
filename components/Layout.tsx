
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { WeatherInfo, UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedZone: string;
  setSelectedZone: (zone: string) => void;
  user: UserProfile | null;
  onLogout: () => void;
}

const AnalogClock = ({ zone }: { zone: string }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [zone]);

  const seconds = time.getSeconds() * 6;
  const minutes = time.getMinutes() * 6 + time.getSeconds() * 0.1;
  const hours = (time.getHours() % 12) * 30 + time.getMinutes() * 0.5;

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4">
      <div className="relative w-24 h-24 rounded-full border-[1px] border-zinc-800 bg-zinc-900 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] flex items-center justify-center">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 flex justify-center py-1.5"
            style={{ transform: `rotate(${i * 30}deg)` }}
          >
            <div className={`w-[1px] ${i % 3 === 0 ? 'h-2 bg-zinc-600' : 'h-1 bg-zinc-800'} rounded-full`} />
          </div>
        ))}
        <div 
          className="absolute w-1 h-7 bg-zinc-500 rounded-full origin-bottom transition-transform duration-500"
          style={{ transform: `translateY(-50%) rotate(${hours}deg)` }}
        />
        <div 
          className="absolute w-0.5 h-9 bg-indigo-400/80 rounded-full origin-bottom transition-transform duration-500"
          style={{ transform: `translateY(-50%) rotate(${minutes}deg)` }}
        />
        <div 
          className="absolute w-px h-10 bg-rose-600/60 origin-bottom"
          style={{ transform: `translateY(-50%) rotate(${seconds}deg)` }}
        />
        <div className="absolute w-1.5 h-1.5 bg-zinc-200 rounded-full shadow-lg z-10" />
      </div>
      <div className="mt-3 text-[9px] mono text-zinc-400 uppercase tracking-[0.2em] font-medium flex flex-col items-center">
        <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</span>
        <span className="text-[7px] text-zinc-600 mt-0.5">{zone}</span>
      </div>
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, selectedZone, setSelectedZone, user, onLogout }) => {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [isEditingZone, setIsEditingZone] = useState(false);
  const [zoneInput, setZoneInput] = useState(selectedZone);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      setIsLoadingWeather(true);
      const data = await geminiService.getWeatherForZone(selectedZone);
      setWeather(data);
      setIsLoadingWeather(false);
    };
    fetchWeather();
  }, [selectedZone]);

  const handleZoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (zoneInput.trim()) {
      setSelectedZone(zoneInput.trim());
      setIsEditingZone(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'tasks', label: 'Routines', icon: 'M4 6h16M4 12h16M4 18h16' },
    { id: 'calendar', label: 'Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'emails', label: 'Communications', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        {/* Brand */}
        <div className="p-6 flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg">Z</div>
          <span className="text-xl font-bold tracking-tight">ZAN TIME</span>
        </div>

        {/* User Widget */}
        {user && (
          <div className="px-4 mb-4">
             <div className="bg-zinc-800/40 rounded-2xl p-4 border border-zinc-800 flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-sm shadow-inner">
                  {user.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold truncate">{user.name}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Pro Member</p>
                </div>
             </div>
          </div>
        )}
        
        <nav className="flex-1 mt-2 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === item.id 
                ? 'bg-zinc-800 text-indigo-400 shadow-lg' 
                : 'hover:bg-zinc-800/40 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 py-2">
          <AnalogClock zone={selectedZone} />
        </div>

        <div className="p-4 border-t border-zinc-800 flex flex-col space-y-2">
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-zinc-500 hover:text-rose-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>
          </button>
          <div className="text-[9px] text-zinc-700 font-bold uppercase tracking-[0.3em] text-center pt-2">
            Zan Time v1.2.0
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div className="flex items-center space-x-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 hidden sm:block">
              {navItems.find(n => n.id === activeTab)?.label}
            </h2>
            
            <div className="relative">
              {isEditingZone ? (
                <form onSubmit={handleZoneSubmit} className="flex items-center">
                  <input 
                    autoFocus
                    className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500 w-32 sm:w-48"
                    value={zoneInput}
                    onChange={e => setZoneInput(e.target.value)}
                    onBlur={() => setIsEditingZone(false)}
                    placeholder="Enter City..."
                  />
                </form>
              ) : (
                <button 
                  onClick={() => setIsEditingZone(true)}
                  className="flex items-center space-x-2 text-xs font-bold text-zinc-500 hover:text-indigo-400 transition-colors bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>{selectedZone}</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
             {weather && (
               <div className="flex items-center space-x-3 bg-zinc-900 px-4 py-1.5 rounded-xl border border-zinc-800 shadow-sm transition-all group">
                 <div className="flex flex-col items-end">
                    <div className="flex items-center space-x-2">
                       <span className="text-sm font-bold text-zinc-100">{isLoadingWeather ? '...' : weather.temp}</span>
                       <span className={`w-1.5 h-1.5 rounded-full ${isLoadingWeather ? 'bg-zinc-700 animate-pulse' : 'bg-emerald-500'}`}></span>
                    </div>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-tighter truncate max-w-[80px]">{isLoadingWeather ? 'Loading' : weather.condition}</span>
                 </div>
                 {weather.sourceUrl && (
                   <a 
                    href={weather.sourceUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-indigo-400"
                   >
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                   </a>
                 )}
               </div>
             )}
             
             <div className="text-xs text-zinc-500 font-bold uppercase tracking-tighter bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
               {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
             </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-zinc-950">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
