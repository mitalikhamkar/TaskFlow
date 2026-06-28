import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Calendar, AlertTriangle, ArrowLeft, CheckCircle, ShieldAlert } from 'lucide-react';
import { Task, TaskPriority } from '../types';

export const TaskForm: React.FC = () => {
  const { tasks, team, currentUser, addTask, updateTask } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  // Core Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assignedTo, setAssignedTo] = useState('u-1');
  const [category, setCategory] = useState('Design');
  const [error, setError] = useState('');

  // Check if editing and load state
  useEffect(() => {
    if (editId) {
      const existingTask = tasks.find((t) => t.id === editId);
      if (existingTask) {
        setTitle(existingTask.title);
        setDescription(existingTask.description);
        setDueDate(existingTask.dueDate);
        setPriority(existingTask.priority);
        setAssignedTo(existingTask.assignedTo);
        setCategory(existingTask.category);
      } else {
        setError('The requested task for editing was not found.');
      }
    }
  }, [editId, tasks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !dueDate) {
      setError('Please provide a complete title, summary, and calendar date.');
      return;
    }

    const taskData = {
      title,
      description,
      dueDate,
      priority,
      assignedTo,
      category: category.trim()
    };

    if (editId) {
      updateTask(editId, taskData);
    } else {
      addTask(taskData);
    }

    // Go back to tasks
    navigate('/tasks');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12">
      {/* Back to workspace */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Back to workspace</span>
      </button>

      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-2xl text-white">
          {editId ? 'Modify Workspace Item' : 'Create Collaborative Action'}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {editId 
            ? 'Update the assignment parameters, status indicators, and delivery dates.' 
            : 'Initialize, schedule, and assign corporate actions across your product squads.'}
        </p>
      </div>

      {/* Form Container */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Action Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Implement responsive layouts"
              className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2.5 px-4 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Summary & Execution Description</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context, micro-interactions, specifications, and links..."
              className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2.5 px-4 text-xs text-slate-200 outline-none transition-all resize-none placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Calendar Due Date</label>
              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-300 outline-none transition-all cursor-pointer"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Department Category</label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="E.g., Design, Engineering, QA"
                className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2.5 px-4 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Assignee */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Squad Assignee</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2.5 px-4 text-xs text-slate-300 outline-none transition-all cursor-pointer"
              >
                {currentUser && (
                  <option value={currentUser.id} className="bg-slate-900 text-slate-300">{currentUser.name} (You)</option>
                )}
                {team.map((member) => (
                  <option key={member.id} value={member.id} className="bg-slate-900 text-slate-300">
                    {member.name} — {member.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Severity Level Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2.5 px-4 text-xs text-slate-300 outline-none transition-all cursor-pointer"
              >
                <option value="low" className="bg-slate-900 text-slate-300">Low Priority</option>
                <option value="medium" className="bg-slate-900 text-slate-300">Medium Priority</option>
                <option value="high" className="bg-slate-900 text-slate-300">High Priority</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-500 font-semibold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 mt-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="py-2.5 px-5 border border-white/10 hover:border-white/20 hover:bg-white/5 bg-transparent text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-submit-task"
              type="submit"
              className="py-2.5 px-6 bg-[#818CF8] hover:bg-[#818CF8]/90 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-500/10 cursor-pointer active:scale-95 transition-all"
            >
              <CheckCircle className="w-4 h-4 text-slate-950" />
              <span>{editId ? 'Commit Changes' : 'Initialize Action'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
