
import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';

interface SettingsProps {
  user: UserProfile;
  onUpdate: (updatedUser: UserProfile) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [title, setTitle] = useState(user.title || '');
  const [mobile, setMobile] = useState(user.mobile);
  const [timezone, setTimezone] = useState(user.timezone);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdate({
        ...user,
        name,
        title,
        mobile,
        timezone
      });
      setIsSaving(false);
    }, 800);
  };

  const exportData = () => {
    const tasks = localStorage.getItem(`zan_tasks_${user.id}`) || '[]';
    const backupData = {
      profile: user,
      tasks: JSON.parse(tasks),
      exportedAt: new Date().toISOString(),
      version: "1.2.0"
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zan_time_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.profile && data.tasks) {
          // Update profile
          onUpdate(data.profile);
          // Update tasks in local storage
          localStorage.setItem(`zan_tasks_${data.profile.id}`, JSON.stringify(data.tasks));
          alert("Backup restored successfully! The page will refresh to apply changes.");
          window.location.reload();
        }
      } catch (err) {
        alert("Invalid backup file format.");
      }
    };
    reader.readAsText(file);
  };

  const resetApplication = () => {
    if (confirm("Are you sure you want to delete all data from this device? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tighter">Setup & Preferences</h2>
          <p className="text-zinc-500 mt-1">Configure your professional identity and local storage.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.9L10 9.503l7.834-4.603a2.002 2.002 0 00-1.834-1.4h-12c-.74 0-1.4.4-1.834 1.4zM18 6.697l-7.531 4.43a1 1 0 01-1.018 0L2 6.697V13a2 2 0 002 2h12a2 2 0 002-2V6.697z" clipRule="evenodd" /></svg>
            <span>Device Memory Active</span>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col items-center text-center">
            <div className="relative group cursor-pointer mb-6">
              <div className="w-24 h-24 bg-zinc-800 rounded-3xl flex items-center justify-center text-3xl font-bold text-indigo-400 border border-zinc-700 shadow-xl overflow-hidden">
                {user.avatarUrl ? <img src={user.avatarUrl} alt="avatar" /> : name.charAt(0)}
              </div>
              <div className="absolute inset-0 bg-indigo-600/60 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
            </div>
            <h3 className="text-xl font-bold">{name}</h3>
            <p className="text-zinc-500 text-sm mt-1">{title || 'Zan Time Member'}</p>
            <div className="mt-6 w-full pt-6 border-t border-zinc-800 text-left space-y-4">
              <div>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Email</p>
                <p className="text-zinc-300 text-sm truncate">{user.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Member Since</p>
                <p className="text-zinc-300 text-sm">{new Date(user.joinedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
             <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center space-x-2">
               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3m0 18a10.003 10.003 0 01-9.308-6.23l-.093-.204M12 3a10.003 10.003 0 019.308 6.23l.093.204M12 3v18" /></svg>
               <span>Keyboard Shortcuts</span>
             </h4>
             <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
                   <span className="text-zinc-500">New Task</span>
                   <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">N</kbd>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
                   <span className="text-zinc-500">Navigate List</span>
                   <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">↑/↓</kbd>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
                   <span className="text-zinc-500">Toggle Task</span>
                   <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">Enter</kbd>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
                   <span className="text-zinc-500">Edit Task</span>
                   <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">E</kbd>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
                   <span className="text-zinc-500">Close Modals</span>
                   <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">Esc</kbd>
                </div>
             </div>
          </div>

          {/* Data Management Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
             <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Device Memory Management</h4>
             <button 
              onClick={exportData}
              className="w-full flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-indigo-500/50 transition-all group"
             >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-zinc-500 group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  <span className="text-sm font-medium">Export to File</span>
                </div>
                <svg className="w-4 h-4 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
             </button>

             <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-emerald-500/50 transition-all group"
             >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  <span className="text-sm font-medium">Restore Backup</span>
                </div>
                <svg className="w-4 h-4 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
             </button>
             <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={importData} />

             <button 
              onClick={resetApplication}
              className="w-full flex items-center justify-between p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl hover:bg-rose-500/10 transition-all group"
             >
                <div className="flex items-center space-x-3 text-rose-500/70">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  <span className="text-sm font-bold">Clear All Memory</span>
                </div>
             </button>
          </div>
        </div>

        {/* Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6 shadow-xl">
            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-4 mb-2 flex items-center justify-between">
              <span>Personal Information</span>
              <span className="text-[10px] text-zinc-600 font-mono tracking-normal">SECURE-STORAGE-ID: {user.id}</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Full Name</label>
                <input 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-100 transition-all"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Professional Title</label>
                <input 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-100 transition-all"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Senior Developer"
                />
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6 shadow-xl">
            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-4 mb-2">Synchronization & Privacy</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Mobile Notification Number</label>
                <input 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-100 transition-all"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">System Timezone</label>
                <input 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-100 transition-all"
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                />
              </div>
            </div>
            
            <div className="pt-6 border-t border-zinc-800">
               <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold">Privacy First Mode</p>
                      <p className="text-xs text-zinc-500">Your data never leaves this device unless you export it.</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">ENABLED</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
