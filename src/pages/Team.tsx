import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Plus, UserPlus, CheckCircle, ShieldCheck, Briefcase, ChevronRight, X, Trash2, Upload, Image } from 'lucide-react';
import { Avatar } from '../components/Avatar';

export const Team: React.FC = () => {
  const { team, tasks, addTeamMember } = useApp();
  
  // Slide out drawer state
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New member inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Frontend Engineer');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
  
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please provide a complete squad name and email address.');
      return;
    }

    addTeamMember({
      name,
      email,
      role,
      avatar
    });

    setName('');
    setEmail('');
    setRole('Frontend Engineer');
    setFeedback('Squad member successfully added!');
    setShowAddForm(false);
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleRandomAvatar = () => {
    const urls = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
    ];
    setAvatar(urls[Math.floor(Math.random() * urls.length)]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">Active Product Squad</h2>
          <p className="text-xs text-slate-500 mt-1">Review squad resourcing, assignment logs, and invite team members</p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="py-2.5 px-4 bg-[#818CF8] hover:bg-[#818CF8]/90 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/10 cursor-pointer active:scale-95 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 text-slate-950" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Team Roster Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((member) => {
          const totalAssigned = tasks.filter((t) => t.assignedTo === member.id);
          const activeTasks = totalAssigned.filter((t) => t.status !== 'completed');
          const completedTasks = totalAssigned.filter((t) => t.status === 'completed');

          return (
            <div 
              key={member.id} 
              className="glass-card glass-card-hover rounded-2xl p-5 group relative"
            >
              {/* Member card upper block */}
              <div className="flex items-start space-x-4">
                <Avatar
                  name={member.name}
                  src={member.avatar}
                  className="w-14 h-14 text-base border border-white/10 shadow-lg"
                />
                <div className="space-y-1 truncate">
                  <h3 className="font-display font-bold text-base text-slate-200 group-hover:text-[#818CF8] transition-colors truncate">
                    {member.name}
                  </h3>
                  <p className="text-xs text-[#818CF8] font-semibold flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{member.role}</span>
                  </p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3 text-slate-500" />
                    <span>{member.email}</span>
                  </p>
                </div>
              </div>

              {/* Bandwidth Metrics Block */}
              <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-500 font-medium uppercase block">Active Load</span>
                  <span className="text-lg font-mono font-bold text-slate-200 mt-1 block">
                    {activeTasks.length}
                  </span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-500 font-medium uppercase block">Completed</span>
                  <span className="text-lg font-mono font-bold text-emerald-400 mt-1 block">
                    {completedTasks.length}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-out Invitation Drawer */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 flex justify-end">
          <div className="w-full max-w-md bg-slate-950/85 backdrop-blur-xl border-l border-white/10 h-full p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              {/* Drawer Title */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#818CF8]" />
                  <h3 className="font-display font-bold text-lg text-white">Invite Squad Member</h3>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Invitation Form */}
              <form onSubmit={handleCreateMember} className="space-y-4">
                {/* Avatar select */}
                <div className="space-y-3 flex flex-col items-center py-4 bg-white/5 rounded-xl border border-white/10">
                  <Avatar
                    name={name || 'New Member'}
                    src={avatar}
                    className="w-16 h-16 text-lg border-2 border-white/10"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="text-2xs font-semibold text-[#818CF8] hover:text-[#818CF8]/80 cursor-pointer flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload from Gallery</span>
                    </button>
                    <span className="text-[10px] text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={handleRandomAvatar}
                      className="text-2xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                    >
                      Randomize
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g., John Connor"
                    className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2 px-4 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-500"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@taskflow.dev"
                    className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2 px-4 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-500"
                  />
                </div>

                {/* Role */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Squad Role Title</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2 px-4 text-xs text-slate-300 outline-none transition-all cursor-pointer"
                  >
                    <option value="Lead Software Architect" className="bg-slate-900 text-slate-300">Lead Software Architect</option>
                    <option value="Senior Frontend Engineer" className="bg-slate-900 text-slate-300">Senior Frontend Engineer</option>
                    <option value="Senior Backend Engineer" className="bg-slate-900 text-slate-300">Senior Backend Engineer</option>
                    <option value="Product Manager" className="bg-slate-900 text-slate-300">Product Manager</option>
                    <option value="Senior QA Automation" className="bg-slate-900 text-slate-300">Senior QA Automation</option>
                    <option value="Visual Product Designer" className="bg-slate-900 text-slate-300">Visual Product Designer</option>
                  </select>
                </div>

                {error && (
                  <p className="text-xs text-rose-500 font-semibold">{error}</p>
                )}
              </form>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="w-1/2 py-2.5 border border-white/10 hover:border-white/20 hover:bg-white/5 bg-transparent text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMember}
                className="w-1/2 py-2.5 bg-[#818CF8] hover:bg-[#818CF8]/90 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>Invite Member</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
