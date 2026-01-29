
import React, { useState } from 'react';
import { Task, Priority } from '../types';

interface TaskFormProps {
  onSave: (task: Omit<Task, 'id'>) => void;
  onClose: () => void;
  initialTask?: Task | null;
  defaultPhone: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSave, onClose, initialTask, defaultPhone }) => {
  const today = new Date().toISOString().split('T')[0];
  
  const [title, setTitle] = useState(initialTask?.title || '');
  const [startTime, setStartTime] = useState(initialTask?.startTime || '09:00');
  const [endTime, setEndTime] = useState(initialTask?.endTime || '10:00');
  const [dueDate, setDueDate] = useState(initialTask?.dueDate || today);
  const [reminderTime, setReminderTime] = useState(initialTask?.reminderTime || '');
  const [phoneNumber, setPhoneNumber] = useState(initialTask?.phoneNumber || defaultPhone);
  const [smsEnabled, setSmsEnabled] = useState(initialTask?.smsEnabled || false);
  const [priority, setPriority] = useState<Priority>(initialTask?.priority || 'medium');
  const [category, setCategory] = useState(initialTask?.category || 'Work');
  const [description, setDescription] = useState(initialTask?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onSave({
      title,
      description,
      startTime,
      endTime,
      dueDate,
      reminderTime: reminderTime || undefined,
      reminderSent: initialTask?.reminderSent || false,
      phoneNumber,
      smsEnabled,
      priority,
      category: category || 'General',
      completed: initialTask?.completed || false,
      isRoutine: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="font-bold text-lg">{initialTask ? 'Edit Routine' : 'Add New Routine'}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Title</label>
            <input 
              autoFocus
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-zinc-100"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Project Review"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Category</label>
              <input 
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-zinc-100"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="Work, Focus..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Priority</label>
              <select 
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 outline-none appearance-none text-zinc-100"
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Start Time</label>
              <input 
                type="time"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 outline-none text-zinc-100"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">End Time</label>
              <input 
                type="time"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 outline-none text-zinc-100"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10 space-y-4">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Mobile Notifications</h4>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Mobile Number</label>
              <input 
                type="tel"
                className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-100"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="e.g. 01816677503"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Enable SMS Forwarding</span>
              <button 
                type="button"
                onClick={() => setSmsEnabled(!smsEnabled)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${smsEnabled ? 'bg-indigo-600' : 'bg-zinc-700'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${smsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-indigo-600/10 active:scale-[0.98] mt-2"
          >
            {initialTask ? 'Update Routine' : 'Add to Schedule'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
