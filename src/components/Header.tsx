import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Avatar } from './Avatar';
import { Bell, Search, Calendar, ChevronDown, CheckCircle } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, tasks } = useApp();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Set up localized real-time clock for extra micro-crafting polish
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const completedToday = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending');

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header id="main-app-header" className="h-16 border-b border-white/10 bg-white/[0.02] backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20 w-full text-slate-300">
      {/* Search Bar */}
      <div className="flex items-center space-x-3 w-96 relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
        <input
          id="global-search-input"
          type="text"
          placeholder="Search tasks, documents, or team workflows..."
          className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 focus:border-[#818CF8] rounded-xl py-1.5 pl-10 pr-4 text-xs placeholder-slate-500 text-slate-200 outline-none transition-all"
        />
      </div>

      {/* Right Tools Panel */}
      <div className="flex items-center space-x-6">
        {/* Real-time Clock & Calendar */}
        <div id="header-datetime" className="hidden md:flex items-center space-x-2 text-xs text-slate-400 border-r border-slate-800 pr-6">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold">{todayStr}</span>
          <span className="text-slate-600">•</span>
          <span className="font-mono">{currentTime}</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            id="notifications-bell"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800/60 transition-all relative active:scale-90"
          >
            <Bell className="w-4.5 h-4.5" />
            {pendingTasks.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div id="notifications-popover" className="absolute right-0 mt-3 w-80 glassmorphism rounded-2xl p-4 z-50 animate-in fade-in slide-in-from-top-3 duration-250">
              <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>Notifications</span>
                  <span className="text-xs font-mono font-normal bg-[#818CF8]/20 text-[#818CF8] px-1.5 py-0.5 rounded-full">
                    {pendingTasks.length} pending
                  </span>
                </h3>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Dismiss
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {pendingTasks.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">All caught up! Nice work.</p>
                ) : (
                  pendingTasks.slice(0, 3).map(task => (
                    <div key={task.id} className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/50 hover:border-slate-800 transition-all">
                      <p className="text-xs font-medium text-slate-200 line-clamp-1">{task.title}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Due date: {task.dueDate}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mini profile connector */}
        {currentUser && (
          <div 
            id="header-profile-connector"
            className="flex items-center space-x-2.5 cursor-pointer group"
            onClick={() => navigate('/profile')}
          >
            <Avatar
              name={currentUser.name}
              src={currentUser.avatar}
              className="w-8 h-8 text-[10px] border border-slate-800 group-hover:border-indigo-500 transition-colors"
            />
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-semibold text-slate-300 group-hover:text-indigo-400 transition-colors leading-none">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {completedToday} tasks completed
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
