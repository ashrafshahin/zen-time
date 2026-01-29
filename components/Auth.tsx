
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all required fields.');
      return;
    }

    // Simulate Auth logic with LocalStorage
    const users = JSON.parse(localStorage.getItem('zan_users') || '[]');
    
    if (isLogin) {
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (user) {
        onLogin(user.profile);
      } else {
        setError('Invalid email or password.');
      }
    } else {
      if (users.find((u: any) => u.email === email)) {
        setError('Email already exists.');
        return;
      }
      
      const newUserProfile: UserProfile = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        email,
        mobile: '01816677503',
        timezone: 'New York, USA',
        joinedAt: Date.now(),
        title: 'New Member'
      };

      users.push({ email, password, profile: newUserProfile });
      localStorage.setItem('zan_users', JSON.stringify(users));
      onLogin(newUserProfile);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center font-bold text-3xl shadow-2xl shadow-indigo-600/30 mb-4">Z</div>
          <h1 className="text-2xl font-bold tracking-tight">Zan Time</h1>
          <p className="text-zinc-500 text-sm mt-2">{isLogin ? 'Welcome back to your rhythm.' : 'Create your professional routine.'}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Full Name</label>
              <input 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-zinc-100"
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Email Address</label>
            <input 
              type="email"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-zinc-100"
              placeholder="name@work.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Password</label>
            <input 
              type="password"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-zinc-100"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] mt-6"
          >
            {isLogin ? 'Sign In' : 'Join Zan Time'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-zinc-500 hover:text-indigo-400 text-sm font-medium transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already a member? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
