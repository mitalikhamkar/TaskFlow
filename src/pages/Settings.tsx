import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings as SettingsIcon, Bell, Shield, Database, CheckCircle2, Sliders, ToggleLeft } from 'lucide-react';

export const Settings: React.FC = () => {
  const { tasks } = useApp();
  const [workspaceName, setWorkspaceName] = useState('TaskFlow Enterprise');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [browserToasts, setBrowserToasts] = useState(true);
  const [teamSizeLimit, setTeamSizeLimit] = useState(15);
  const [feedback, setFeedback] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback('Workspace options successfully committed!');
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleResetData = () => {
    if (window.confirm('WARNING: This will clear local state changes and restore initial seed data. Do you wish to continue?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-2xl text-white">System Settings</h2>
        <p className="text-xs text-slate-500 mt-1">Configure global workspace parameters, integrations, and notification triggers</p>
      </div>

      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Workspace Options Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-200 border-b border-white/10 pb-2">
              <Sliders className="w-4 h-4 text-[#818CF8]" />
              <span>Workspace Parameters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Workspace Label</label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2 px-4 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Maximum Collaborators Threshold</label>
                <input
                  type="number"
                  value={teamSizeLimit}
                  onChange={(e) => setTeamSizeLimit(parseInt(e.target.value) || 10)}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2 px-4 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Alert Options */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-200 border-b border-white/10 pb-2">
              <Bell className="w-4 h-4 text-[#818CF8]" />
              <span>Notification Digests</span>
            </div>

            <div className="space-y-3">
              {/* Email digests toggle */}
              <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Email digest alerts</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Send a consolidated daily overview of overdue and pending tasks.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${emailAlerts ? 'bg-[#818CF8]' : 'bg-white/10'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${emailAlerts ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Browser toasts */}
              <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Browser push notification triggers</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Receive instant micro-alerts when a squad teammate completes an active task.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setBrowserToasts(!browserToasts)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${browserToasts ? 'bg-[#818CF8]' : 'bg-white/10'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${browserToasts ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Backup options */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-200 border-b border-white/10 pb-2">
              <Database className="w-4 h-4 text-rose-400" />
              <span>Data Optimization</span>
            </div>

            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-rose-400">Restore Seed Templates</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed max-w-md">
                  This action will clear all user-created modifications, resetting the local tasks, team members, and user credentials back to initial seed data. This operation is irreversible.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetData}
                className="py-1.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 text-rose-500 text-xs font-semibold rounded-xl transition-all active:scale-95 cursor-pointer shrink-0"
              >
                Reset Database
              </button>
            </div>
          </div>

          {feedback && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 mt-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          <div className="pt-4 flex items-center justify-end border-t border-white/10">
            <button
              type="submit"
              className="py-2.5 px-6 bg-[#818CF8] hover:bg-[#818CF8]/90 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-500/10 cursor-pointer active:scale-95 transition-all"
            >
              <span>Save Workspace Options</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
