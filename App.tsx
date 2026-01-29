
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import RoutineList from './components/RoutineList';
import CommunicationCenter from './components/CommunicationCenter';
import TaskForm from './components/TaskForm';
import Auth from './components/Auth';
import Settings from './components/Settings';
import { Task, UserProfile } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedZone, setSelectedZone] = useState('New York, USA');
  const [isLoading, setIsLoading] = useState(true);

  // Load Initial Session
  useEffect(() => {
    const savedSession = localStorage.getItem('zan_session');
    if (savedSession) {
      setUser(JSON.parse(savedSession));
    }
    setIsLoading(false);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (isInput) return;

      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setEditingTask(null);
        setShowTaskForm(true);
      }
      
      if (e.key === 'Escape') {
        setShowTaskForm(false);
        setEditingTask(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load Task Data & Profile Config
  useEffect(() => {
    if (!user) return;

    const savedTasks = localStorage.getItem(`zan_tasks_${user.id}`);
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    setSelectedZone(user.timezone);
  }, [user]);

  // Sync Data
  useEffect(() => {
    if (user) {
      localStorage.setItem(`zan_tasks_${user.id}`, JSON.stringify(tasks));
      localStorage.setItem('zan_session', JSON.stringify(user));
      
      // Update the main user list for profile changes
      const users = JSON.parse(localStorage.getItem('zan_users') || '[]');
      const updatedUsers = users.map((u: any) => u.email === user.email ? { ...u, profile: user } : u);
      localStorage.setItem('zan_users', JSON.stringify(updatedUsers));
    }
  }, [tasks, user]);

  const handleLogin = (newUser: UserProfile) => {
    setUser(newUser);
    localStorage.setItem('zan_session', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    localStorage.removeItem('zan_session');
    setUser(null);
    setActiveTab('dashboard');
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    setSelectedZone(updatedUser.timezone);
  };

  // Notification logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (!user) return;
      
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentTimeStr = now.toTimeString().substring(0, 5);
      const currentFullTime = now.getTime();
      
      let updated = false;
      const nextTasks = tasks.map(task => {
        if (task.completed) return task;
        let shouldNotify = false;
        let notificationMsg = "";

        if (task.reminderTime && !task.reminderSent) {
          const reminderDate = new Date(task.reminderTime).getTime();
          if (currentFullTime >= reminderDate) {
            shouldNotify = true;
            notificationMsg = `Reminder for: ${task.title}`;
          }
        }

        if (!shouldNotify && task.dueDate === todayStr && task.startTime === currentTimeStr && !task.reminderSent) {
          shouldNotify = true;
          notificationMsg = `${task.title} is starting now (${task.startTime})`;
        }

        if (shouldNotify) {
          if (Notification.permission === "granted") {
            const n = new Notification("Zan Time Alert", {
              body: notificationMsg,
              icon: 'https://img.icons8.com/ios-filled/100/4f46e5/clock--v1.png',
              tag: task.id
            });
            if (task.smsEnabled && task.phoneNumber) {
              n.onclick = () => {
                const smsUrl = `sms:${task.phoneNumber}?body=${encodeURIComponent(notificationMsg)}`;
                window.location.href = smsUrl;
              };
            }
          }
          updated = true;
          return { ...task, reminderSent: true };
        }
        return task;
      });

      if (updated) setTasks(nextTasks);
    }, 30000);
    return () => clearInterval(interval);
  }, [tasks, user]);

  const saveTask = (taskData: Omit<Task, 'id'>) => {
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...taskData, id: editingTask.id } : t));
      setEditingTask(null);
    } else {
      const task: Task = { ...taskData, id: Math.random().toString(36).substr(2, 9) };
      setTasks([...tasks, task]);
    }
  };

  const toggleTask = (id: string) => setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const deleteTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));
  const handleEdit = (task: Task) => { setEditingTask(task); setShowTaskForm(true); };

  if (isLoading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!user) return <Auth onLogin={handleLogin} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard tasks={tasks} />;
      case 'tasks': return <RoutineList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} onEdit={handleEdit} onOpenForm={() => { setEditingTask(null); setShowTaskForm(true); }} initialViewMode="list" />;
      case 'calendar': return <RoutineList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} onEdit={handleEdit} onOpenForm={() => { setEditingTask(null); setShowTaskForm(true); }} initialViewMode="calendar" />;
      case 'emails': return <CommunicationCenter />;
      case 'settings': return <Settings user={user} onUpdate={handleUpdateUser} />;
      default: return <Dashboard tasks={tasks} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      selectedZone={selectedZone} 
      setSelectedZone={setSelectedZone}
      user={user}
      onLogout={handleLogout}
    >
      {renderContent()}
      
      {showTaskForm && (
        <TaskForm 
          onSave={saveTask} 
          onClose={() => { setShowTaskForm(false); setEditingTask(null); }} 
          initialTask={editingTask}
          defaultPhone={user.mobile}
        />
      )}

      <button 
        onClick={() => { setEditingTask(null); setShowTaskForm(true); }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-2xl md:hidden active:scale-95 transition-transform z-40"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
      </button>
    </Layout>
  );
};

export default App;
