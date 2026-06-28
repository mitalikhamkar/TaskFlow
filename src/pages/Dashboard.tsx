import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../components/Avatar';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  CheckCircle, Clock, AlertTriangle, ListTodo, Plus, Calendar, ArrowUpRight, Check, Trash2, Shield
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types';

export const Dashboard: React.FC = () => {
  const { tasks, team, currentUser, updateTask, deleteTask } = useApp();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activities, setActivities] = useState<{ id: string; action: string; taskTitle: string; createdAt: string }[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem('taskflow_token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        const res = await fetch('/api/activities', { headers });
        if (res.ok) {
          const data = await res.json();
          setActivities(data);
        }
      } catch (err) {
        console.error('Failed to fetch activities:', err);
      }
    };
    fetchActivities();
  }, [tasks]);

  // Compute key stats
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const pending = tasks.filter((t) => t.status === 'pending').length;
  const overdue = tasks.filter((t) => t.status === 'overdue').length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Filter tasks for quick view (max 4)
  const categories = ['All', ...new Set(tasks.map(t => t.category))];
  const activeTasks = tasks
    .filter(t => selectedCategory === 'All' || t.category === selectedCategory)
    .slice(0, 4);

  // Chart 1: Priority Distribution
  const priorityData = [
    { name: 'Low', count: tasks.filter(t => t.priority === 'low').length, fill: '#10b981' },
    { name: 'Medium', count: tasks.filter(t => t.priority === 'medium').length, fill: '#f59e0b' },
    { name: 'High', count: tasks.filter(t => t.priority === 'high').length, fill: '#ef4444' },
  ];

  // Chart 2: Category distribution of tasks (completed vs pending)
  const uniqueCats = [...new Set(tasks.map(t => t.category))];
  const categoryData = uniqueCats.map(cat => ({
    category: cat,
    Completed: tasks.filter(t => t.category === cat && t.status === 'completed').length,
    Pending: tasks.filter(t => t.category === cat && (t.status === 'pending' || t.status === 'overdue')).length,
  }));

  // Handle rapid completion state
  const handleToggleComplete = (id: string, currentStatus: TaskStatus) => {
    const newStatus: TaskStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    updateTask(id, { status: newStatus });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Upper Welcoming Section */}
      <div id="welcome-banner" className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="font-display font-bold text-3xl text-white tracking-tight">
            Welcome back, {currentUser?.name || 'Explorer'}!
          </h2>
          <p className="text-sm text-slate-400 mt-1.5">
            Your workspace metrics are stable. You have completed <span className="text-emerald-400 font-semibold">{completed}</span> of your <span className="text-[#818CF8] font-semibold">{total}</span> tasks.
          </p>
        </div>
        <button
          id="btn-create-task-dashboard"
          onClick={() => navigate('/add-task')}
          className="py-2.5 px-5 bg-gradient-to-r from-[#818CF8] to-[#6366F1] hover:opacity-90 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/15 transition-all cursor-pointer active:scale-95 self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create New Task</span>
        </button>
      </div>

      {/* KPI Dashboard Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks Card */}
        <div id="card-total-tasks" className="p-5 glass-card glass-card-hover flex items-center justify-between group">
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-medium">Workspace Tasks</span>
            <h3 className="text-3xl font-display font-bold text-white tracking-tight">{total}</h3>
            <span className="text-[10px] text-slate-500 block">Total registered actions</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#818CF8]/10 text-[#818CF8] flex items-center justify-center group-hover:scale-105 transition-transform">
            <ListTodo className="w-5 h-5" />
          </div>
        </div>

        {/* Completed Card */}
        <div id="card-completed-tasks" className="p-5 glass-card glass-card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium">Completed</span>
              <h3 className="text-3xl font-display font-bold text-emerald-400 tracking-tight">{completed}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${completionRate}%` }} />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
              <span>Progress rate</span>
              <span className="font-mono">{completionRate}%</span>
            </div>
          </div>
        </div>

        {/* Pending Card */}
        <div id="card-pending-tasks" className="p-5 glass-card glass-card-hover flex items-center justify-between group">
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-medium">Pending Scope</span>
            <h3 className="text-3xl font-display font-bold text-amber-400 tracking-tight">{pending}</h3>
            <span className="text-[10px] text-slate-500 block">Requires near-term input</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Overdue Card */}
        <div id="card-overdue-tasks" className={`p-5 glass-card glass-card-hover ${overdue > 0 ? 'border-rose-500/40 bg-rose-500/[0.02] glow-border' : ''} flex items-center justify-between group`}>
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-medium">Overdue Scope</span>
            <h3 className={`text-3xl font-display font-bold ${overdue > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400'} tracking-tight`}>{overdue}</h3>
            <span className="text-[10px] text-slate-500 block">Passed scheduled deadlines</span>
          </div>
          <div className={`w-12 h-12 rounded-xl ${overdue > 0 ? 'bg-rose-500/15 text-rose-500' : 'bg-white/10 text-slate-400'} flex items-center justify-center group-hover:scale-105 transition-transform`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Analytics Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Productivity Chart */}
        <div id="card-analytics-category" className="p-6 glass-card lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-white">Project Allocation</h3>
              <p className="text-xs text-slate-500">Distribution of pending and completed tasks across departments</p>
            </div>
            <span className="text-[10px] font-mono font-medium px-2 py-1 bg-white/10 text-slate-300 border border-white/5 rounded-lg">Category Metrics</span>
          </div>

          <div className="h-64 w-full">
            {categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">No category allocation available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818CF8" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />
                  <XAxis dataKey="category" stroke="rgba(255, 255, 255, 0.4)" fontSize={11} tickLine={false} />
                  <YAxis stroke="rgba(255, 255, 255, 0.4)" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', fontSize: '12px' }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="Completed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
                  <Area type="monotone" dataKey="Pending" stroke="#818CF8" strokeWidth={2} fillOpacity={1} fill="url(#colorPending)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Priority Allocation Chart */}
        <div id="card-analytics-priority" className="p-6 glass-card lg:col-span-4 space-y-6">
          <div>
            <h3 className="font-display font-bold text-base text-white">Priority Loads</h3>
            <p className="text-xs text-slate-500">Resource balance grouped by severity level</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.4)" fontSize={11} tickLine={false} />
                <YAxis stroke="rgba(255, 255, 255, 0.4)" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={36} fill="#818CF8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Bottom Section: Tasks & Team Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Task Feed */}
        <div id="dashboard-recent-tasks" className="p-6 glass-card lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-base text-white">Quick Task Feed</h3>
              <p className="text-xs text-slate-500">Manage near-term actions immediately</p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
              {categories.slice(0, 4).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-2xs rounded-lg font-semibold transition-all ${selectedCategory === cat ? 'bg-[#818CF8] text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {activeTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No active tasks matching this criteria. You can create one!
              </div>
            ) : (
              activeTasks.map((task) => {
                const assignedMember = team.find(m => m.id === task.assignedTo) || currentUser;
                const isCompleted = task.status === 'completed';
                const isOverdue = task.status === 'overdue';

                return (
                  <div 
                    key={task.id} 
                    className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all hover:bg-white/[0.08] ${isCompleted ? 'border-white/5 bg-white/[0.01]' : isOverdue ? 'border-rose-500/20 bg-rose-500/[0.02]' : 'border-white/10 bg-white/[0.03]'}`}
                  >
                    <div className="flex items-center space-x-4 flex-1 truncate">
                      {/* Interactive Custom Radio Check */}
                      <button
                        onClick={() => handleToggleComplete(task.id, task.status)}
                        className={`w-5.5 h-5.5 rounded-full border flex items-center justify-center transition-all cursor-pointer focus:outline-none ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/20 hover:border-[#818CF8] text-transparent hover:text-[#818CF8]/30'}`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>

                      {/* Title & Desc */}
                      <div className="truncate flex-1">
                        <h4 className={`text-sm font-semibold truncate ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                          {task.title}
                        </h4>
                        <p className={`text-xs mt-1 truncate ${isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                          {task.description}
                        </p>
                      </div>
                    </div>

                    {/* Metadata items */}
                    <div className="flex items-center space-x-4 shrink-0">
                      {/* Priority Badge */}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${task.priority === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/10' : task.priority === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/10' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/10'}`}>
                        {task.priority}
                      </span>

                      {/* Profile Image */}
                      {assignedMember && (
                        <Avatar 
                          name={assignedMember.name}
                          src={assignedMember.avatar} 
                          className="w-7.5 h-7.5 text-[9px] border border-white/10"
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button
            id="btn-view-all-tasks-dashboard"
            onClick={() => navigate('/tasks')}
            className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition-all"
          >
            <span>View Complete Task Board</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar Column (span-4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Team Roster */}
          <div id="dashboard-team-roster" className="p-6 glass-card space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-white">Active Resourcing</h3>
                <p className="text-xs text-slate-500">Allocated bandwidth and status</p>
              </div>
              <button 
                onClick={() => navigate('/team')}
                className="text-xs font-semibold text-[#818CF8] hover:text-[#818CF8]/80 transition-colors"
              >
                Configure
              </button>
            </div>

            <div className="space-y-4">
              {team.map((member) => {
                const assignedTasks = tasks.filter(t => t.assignedTo === member.id && t.status !== 'completed');
                return (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex items-center space-x-3">
                      <Avatar 
                        name={member.name} 
                        src={member.avatar} 
                        className="w-9 h-9 text-2xs border border-white/10"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{member.name}</h4>
                        <p className="text-[10px] text-slate-500">{member.role}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold ${assignedTasks.length > 0 ? 'bg-[#818CF8]/20 text-[#818CF8]' : 'bg-white/10 text-slate-400'}`}>
                        {assignedTasks.length} active
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <div className="p-3 bg-[#818CF8]/10 border border-[#818CF8]/20 rounded-xl space-y-1.5">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#818CF8]">
                  <Shield className="w-4 h-4" />
                  <span>Need more help?</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Invite your product teams to share visual sprints, resolve bottlenecks, and complete actions faster.
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div id="dashboard-recent-activity" className="p-6 glass-card space-y-6">
            <div>
              <h3 className="font-display font-bold text-base text-white">Recent Activity</h3>
              <p className="text-xs text-slate-500">Live logs of workspace operations</p>
            </div>

            <div className="space-y-4">
              {activities.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No recent activity logged yet.
                </div>
              ) : (
                <div className="relative pl-4 border-l border-white/10 space-y-5">
                  {activities.slice(0, 5).map((act) => {
                    let badgeColor = 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/5';
                    if (act.action === 'Created' || act.action === 'Created task') {
                      badgeColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/5';
                    } else if (act.action === 'Completed' || act.action === 'Completed task') {
                      badgeColor = 'bg-teal-500/10 text-teal-400 border border-teal-500/5';
                    } else if (act.action === 'Updated' || act.action === 'Updated status') {
                      badgeColor = 'bg-amber-500/10 text-amber-400 border border-amber-500/5';
                    } else if (act.action === 'Deleted') {
                      badgeColor = 'bg-rose-500/10 text-rose-400 border border-rose-500/5';
                    }
                    
                    const formattedTime = new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <div key={act.id} className="relative group">
                        {/* Timeline node dot */}
                        <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-950 border-2 border-[#818CF8]" />
                        
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded ${badgeColor}`}>
                              {act.action}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{formattedTime}</span>
                          </div>
                          <p className="text-xs text-slate-300 font-semibold leading-snug">
                            {act.taskTitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
