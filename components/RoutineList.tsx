
import React, { useState, useMemo, useEffect } from 'react';
import { Task } from '../types';

interface RoutineListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onOpenForm: () => void;
  initialViewMode?: ViewMode;
}

type ViewMode = 'list' | 'calendar';

const RoutineList: React.FC<RoutineListProps> = ({ tasks, onToggle, onDelete, onEdit, onOpenForm, initialViewMode = 'list' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Moved memoized calculations above useEffect to fix "variable used before declaration" error
  const categories = useMemo(() => {
    const cats = new Set(tasks.map(t => t.category).filter(Boolean));
    return ['All', ...Array.from(cats)].sort();
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return tasks
      .filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(query) || 
                             task.description.toLowerCase().includes(query) ||
                             task.category.toLowerCase().includes(query);
        const matchesCategory = selectedCategory === 'All' || task.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (a.dueDate !== b.dueDate) {
          return a.dueDate.localeCompare(b.dueDate);
        }
        return a.startTime.localeCompare(b.startTime);
      });
  }, [tasks, searchQuery, selectedCategory]);

  // Sync viewMode if prop changes
  useEffect(() => {
    setViewMode(initialViewMode);
  }, [initialViewMode]);

  // Reset focus on filter changes
  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchQuery, selectedCategory]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (isInput) return;

      if (viewMode === 'list' && filteredTasks.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setFocusedIndex(prev => Math.min(prev + 1, filteredTasks.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setFocusedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && focusedIndex >= 0) {
          e.preventDefault();
          onToggle(filteredTasks[focusedIndex].id);
        } else if (e.key.toLowerCase() === 'e' && focusedIndex >= 0) {
          e.preventDefault();
          onEdit(filteredTasks[focusedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, filteredTasks, focusedIndex, onToggle, onEdit]);

  // Calendar Helpers
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const prevMonthTotalDays = daysInMonth(year, month - 1);
    
    const days = [];
    // Previous month padding
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthTotalDays - i, currentMonth: false, date: new Date(year, month - 1, prevMonthTotalDays - i) });
    }
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({ day: i, currentMonth: true, date: new Date(year, month, i) });
    }
    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, currentMonth: false, date: new Date(year, month + 1, i) });
    }
    return days;
  }, [currentCalendarDate]);

  const changeMonth = (offset: number) => {
    setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + offset, 1));
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredTasks.filter(t => t.dueDate === dateStr);
  };

  const renderListView = () => (
    <div className="space-y-3">
      {filteredTasks.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-950/20">
           <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-600 border border-zinc-800">
             {searchQuery || selectedCategory !== 'All' ? (
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             ) : (
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             )}
           </div>
           <p className="text-zinc-500 text-lg font-medium">
             {searchQuery || selectedCategory !== 'All' 
              ? `No routines match your filters.` 
              : "Your schedule is currently clear."}
           </p>
           <button 
             onClick={() => {setSearchQuery(''); setSelectedCategory('All');}} 
             className="text-indigo-400 mt-2 hover:text-indigo-300 text-sm font-semibold transition-colors"
           >
             Clear all filters
           </button>
        </div>
      ) : (
        filteredTasks.map((task, idx) => {
          const isFocused = idx === focusedIndex;
          return (
            <div 
              key={task.id} 
              className={`group flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 outline-none ${
                isFocused ? 'ring-2 ring-indigo-500/80 border-indigo-500/50 bg-zinc-800/80' : 
                task.completed 
                ? 'bg-zinc-950/50 border-zinc-900 opacity-60' 
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:shadow-xl'
              }`}
            >
              <div className="flex items-center space-x-6 overflow-hidden flex-1">
                <button 
                  onClick={() => onToggle(task.id)}
                  className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.completed 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'border-zinc-700 hover:border-indigo-400 bg-zinc-800/50'
                  }`}
                >
                  {task.completed && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </button>
                
                <div onClick={() => onEdit(task)} className="cursor-pointer overflow-hidden flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className={`text-lg font-semibold truncate transition-all ${task.completed ? 'line-through text-zinc-600' : 'text-zinc-100'}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        task.priority === 'high' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 
                        task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                        'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      }`}>
                        {task.priority}
                      </span>
                      {task.category && (
                        <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {task.category}
                        </span>
                      )}
                      {task.reminderTime && (
                        <span className="shrink-0 flex items-center bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20" title={`Reminder at: ${new Date(task.reminderTime).toLocaleString()}`}>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
                    <div className="flex items-center text-zinc-500 text-xs mono whitespace-nowrap">
                      <svg className="w-4 h-4 mr-1.5 text-indigo-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                    </div>
                    <div className="flex items-center text-zinc-500 text-xs mono whitespace-nowrap">
                      <svg className="w-4 h-4 mr-1.5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {task.startTime} — {task.endTime}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 sm:opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                <button 
                  onClick={() => onEdit(task)}
                  className="p-2 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all"
                  title="Edit task (E)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button 
                  onClick={() => onDelete(task.id)}
                  className="p-2 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                  title="Delete task"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const renderCalendarView = () => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
        <h3 className="text-xl font-bold tracking-tight">
          {currentCalendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-zinc-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button 
            onClick={() => setCurrentCalendarDate(new Date())}
            className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest bg-zinc-800 hover:bg-indigo-600/20 hover:text-indigo-400 rounded-lg transition-all border border-zinc-700"
          >
            Today
          </button>
          <button 
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-zinc-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 text-center py-4 bg-zinc-950/40 text-[10px] font-bold uppercase tracking-widest text-zinc-600 border-b border-zinc-800">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 bg-zinc-950/20">
        {calendarDays.map((item, idx) => {
          const dayTasks = getTasksForDate(item.date);
          const isToday = item.date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
          
          return (
            <div 
              key={idx} 
              className={`min-h-[130px] p-2 border-r border-b border-zinc-800/50 last:border-r-0 transition-colors ${
                item.currentMonth ? 'bg-transparent hover:bg-zinc-800/10' : 'bg-zinc-950/40 text-zinc-800'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                  isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 
                  item.currentMonth ? 'text-zinc-500' : 'text-zinc-800'
                }`}>
                  {item.day}
                </span>
              </div>
              
              <div className="space-y-1 overflow-hidden">
                {dayTasks.slice(0, 4).map(task => {
                   // Priority colors for calendar
                   const colors = {
                     high: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
                     medium: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
                     low: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                   };

                  return (
                    <div 
                      key={task.id}
                      onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                      className={`px-1.5 py-0.5 rounded-[4px] text-[9px] truncate cursor-pointer transition-all border font-medium ${
                        task.completed ? 'opacity-30 grayscale bg-zinc-800 border-zinc-700 text-zinc-500 line-through' :
                        colors[task.priority] + ' hover:brightness-125'
                      }`}
                      title={`${task.startTime}: ${task.title}`}
                    >
                      {task.startTime} {task.title}
                    </div>
                  );
                })}
                {dayTasks.length > 4 && (
                  <div className="text-[8px] text-zinc-600 px-1 font-bold uppercase tracking-tighter">+{dayTasks.length - 4} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tighter">Your Daily Rhythm</h2>
            <p className="text-zinc-500 mt-1">Manage recurring work blocks and personal routines.</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl flex shadow-xl">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-zinc-800 text-indigo-400 shadow-inner' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="List View"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-zinc-800 text-indigo-400 shadow-inner' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Calendar View"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest hidden md:block">Filter:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm text-zinc-300 min-w-[120px] cursor-pointer hover:border-zinc-700 transition-all shadow-lg"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="relative group flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search routines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-500/50 w-full transition-all text-sm text-zinc-100 placeholder:text-zinc-600 shadow-lg"
            />
          </div>

          <button 
            onClick={onOpenForm}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            <span>Add Task (N)</span>
          </button>
        </div>
      </div>

      <div className="transition-all duration-500">
        {viewMode === 'list' ? renderListView() : renderCalendarView()}
      </div>
    </div>
  );
};

export default RoutineList;
