import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Avatar } from './Avatar';
import { 
  LayoutDashboard, 
  ListTodo, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Users, 
  Settings, 
  Plus, 
  LogOut,
  User,
  Activity
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { tasks, currentUser, logout } = useApp();
  const navigate = useNavigate();

  // Calculate quick stats for side badges
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const overdueCount = tasks.filter(t => t.status === 'overdue').length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { to: '/tasks', label: 'All Tasks', icon: ListTodo, badge: totalCount },
    { to: '/pending', label: 'Pending', icon: Clock, badge: pendingCount, color: 'text-amber-500 bg-amber-500/10' },
    { to: '/completed', label: 'Completed', icon: CheckCircle2, badge: completedCount, color: 'text-emerald-500 bg-emerald-500/10' },
    { to: '/overdue', label: 'Overdue', icon: AlertCircle, badge: overdueCount, color: 'text-rose-500 bg-rose-500/10' },
    { to: '/team', label: 'Our Team', icon: Users, badge: null },
    { to: '/settings', label: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <aside id="sidebar-panel" className="w-64 h-screen fixed left-0 top-0 bg-white/[0.02] backdrop-blur-xl border-r border-white/10 flex flex-col justify-between text-slate-300 z-30">
      {/* Upper Brand Section */}
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-[#818CF8] flex items-center justify-center shadow-lg shadow-[#818CF8]/25">
            <Activity className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white leading-tight">TaskFlow</h1>
            <span className="text-xs text-slate-500 font-medium">Enterprise Suite</span>
          </div>
        </div>

        {/* Quick Add Button */}
        <button
          id="btn-sidebar-add-task"
          onClick={() => navigate('/add-task')}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-[#818CF8] to-[#6366F1] hover:opacity-90 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all duration-200 group active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3] transition-transform group-hover:rotate-90" />
          <span>New Task</span>
        </button>

        {/* Navigation List */}
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                id={`nav-link-${item.label.toLowerCase().replace(' ', '-')}`}
                className={({ isActive }) => `
                  flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                  ${isActive 
                    ? 'bg-[#818CF8]/20 text-white border-l-[3px] border-[#818CF8] font-semibold' 
                    : 'hover:bg-white/5 hover:text-slate-100 border-l-[3px] border-transparent text-slate-400'}
                `}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${item.color || 'bg-white/10 text-slate-300 border border-white/5'}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile Section */}
      <div className="p-4 border-t border-white/10 bg-white/[0.01]">
        {currentUser && (
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-3 cursor-pointer group flex-1 mr-2"
              onClick={() => navigate('/profile')}
              id="sidebar-profile-trigger"
            >
              <Avatar 
                name={currentUser.name} 
                src={currentUser.avatar} 
                className="w-10 h-10 border border-slate-800 group-hover:border-indigo-500 transition-colors"
              />
              <div className="truncate max-w-[110px]">
                <h4 className="text-sm font-semibold text-slate-200 truncate group-hover:text-indigo-400 transition-colors">
                  {currentUser.name}
                </h4>
                <p className="text-xs text-slate-500 truncate">{currentUser.role}</p>
              </div>
            </div>
            
            <button
              id="btn-logout"
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800/50 transition-all active:scale-90"
              title="Sign Out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
