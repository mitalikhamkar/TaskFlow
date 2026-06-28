import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { 
  List, LayoutGrid, Search, Filter, ArrowUpDown, Plus, Check, Calendar, Trash2, Edit3, Circle, CheckCircle2, AlertCircle, ListTodo
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { Avatar } from '../components/Avatar';
import { DndContext, useDroppable, useDraggable, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';

interface DroppableColumnProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ id, children, className }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div 
      ref={setNodeRef} 
      className={`${className} transition-all duration-200 ${isOver ? 'bg-white/[0.04] ring-2 ring-dashed ring-[#818CF8]/40 scale-[1.01] rounded-2xl shadow-inner shadow-[#818CF8]/5' : ''}`}
    >
      {children}
    </div>
  );
};

interface DraggableTaskCardProps {
  id: string;
  children: React.ReactNode;
}

const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });

  const style: React.CSSProperties = {
    opacity: isDragging ? 0.25 : undefined,
    cursor: isDragging ? 'grabbing' : 'grab',
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`transition-all duration-150 ${isDragging ? 'ring-2 ring-dashed ring-indigo-500/40 rounded-xl bg-white/[0.01]' : ''}`}
    >
      {children}
    </div>
  );
};

export const Tasks: React.FC<{ filterStatus?: TaskStatus }> = ({ filterStatus }) => {
  const { tasks, team, currentUser, updateTask, deleteTask } = useApp();
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<string | null>(null);

  // Layout preference
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  // Search, Filters & Sorting State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(filterStatus || 'all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title'>('dueDate');

  // Automatically adapt status filter if props change (for pending/completed/overdue sidebar routes)
  React.useEffect(() => {
    if (filterStatus) {
      setStatusFilter(filterStatus);
    }
  }, [filterStatus]);

  // Derived filter options
  const categories = ['all', ...new Set(tasks.map(t => t.category))];

  // Map priorities to numerical values for sorting
  const priorityWeight = { high: 3, medium: 2, low: 1 };

  // Filter and Sort implementation
  const filteredTasks = tasks
    .filter(task => {
      const matchSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' ? true : task.status === statusFilter;
      const matchPriority = priorityFilter === 'all' ? true : task.priority === priorityFilter;
      const matchCategory = categoryFilter === 'all' ? true : task.category === categoryFilter;
      return matchSearch && matchStatus && matchPriority && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'priority') {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return a.title.localeCompare(b.title);
    });

  const handleToggleComplete = (id: string, currentStatus: TaskStatus) => {
    const newStatus: TaskStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    updateTask(id, { status: newStatus });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(id);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      updateTask(taskId, { status: newStatus });
    }
  };

  // Render Kanban Columns
  const renderKanbanColumns = () => {
    const columns: { id: TaskStatus; title: string; color: string; icon: any }[] = [
      { id: 'pending', title: 'Pending Work', color: 'border-[#818CF8]/30 text-[#818CF8] bg-[#818CF8]/5', icon: Circle },
      { id: 'completed', title: 'Completed Sprints', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5', icon: CheckCircle2 },
      { id: 'overdue', title: 'Overdue Actions', color: 'border-rose-500/30 text-rose-500 bg-rose-500/5', icon: AlertCircle },
    ];

    return (
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveId(null)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {columns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);
            const ColIcon = col.icon;

            return (
              <div key={col.id} className="flex flex-col h-[650px] bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/10 p-5">
                {/* Column Header */}
                <div className={`flex items-center justify-between p-3 rounded-xl border ${col.color} mb-4`}>
                  <div className="flex items-center space-x-2">
                    <ColIcon className="w-4.5 h-4.5" />
                    <span className="text-xs font-bold uppercase tracking-wider">{col.title}</span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-white/10 border border-white/5 px-2 py-0.5 rounded-full text-slate-200">
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Cards Stack (Droppable) */}
                <DroppableColumn id={col.id} className="flex-1 overflow-y-auto space-y-3.5 pr-1 min-h-[100px]">
                  {colTasks.length === 0 ? (
                    <div className="h-40 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-xs text-slate-500 p-4 text-center">
                      No active cards in this stage
                    </div>
                  ) : (
                    colTasks.map(task => {
                      const assignee = team.find(m => m.id === task.assignedTo) || currentUser;
                      return (
                        <DraggableTaskCard key={task.id} id={task.id}>
                          <div className="glass-card glass-card-hover rounded-xl p-4.5 group">
                            <div className="space-y-3">
                              {/* Tags row */}
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-md border border-white/5 text-slate-300">
                                  {task.category}
                                </span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${task.priority === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/10' : task.priority === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/10' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/10'}`}>
                                  {task.priority}
                                </span>
                              </div>

                              {/* Task Text Content */}
                              <div>
                                <h4 className={`text-sm font-semibold text-slate-200 line-clamp-1 group-hover:text-[#818CF8] transition-colors ${task.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                                  {task.title}
                                </h4>
                                <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                                  {task.description}
                                </p>
                              </div>

                              {/* Footer Info Row */}
                              <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-1">
                                <div className="flex items-center space-x-1.5 text-2xs text-slate-500 font-medium">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>{task.dueDate}</span>
                                </div>

                                <div className="flex items-center space-x-3">
                                  {/* Quick Action Buttons */}
                                  <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-all">
                                    <button
                                      onPointerDown={(e) => e.stopPropagation()}
                                      onClick={() => navigate(`/add-task?edit=${task.id}`)}
                                      className="p-1 rounded text-slate-400 hover:text-[#818CF8] hover:bg-white/10 cursor-pointer"
                                      title="Edit"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onPointerDown={(e) => e.stopPropagation()}
                                      onClick={() => handleDelete(task.id)}
                                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-white/10 cursor-pointer"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  {/* Assignee avatar */}
                                  {assignee && (
                                    <Avatar
                                      name={assignee.name}
                                      src={assignee.avatar}
                                      className="w-6.5 h-6.5 text-[9px] border border-white/10 group-hover:border-white/20 transition-all"
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </DraggableTaskCard>
                      );
                    })
                  )}
                </DroppableColumn>
              </div>
            );
          })}
        </div>
        <DragOverlay>
          {activeId ? (() => {
            const activeTask = tasks.find(t => t.id === activeId);
            if (!activeTask) return null;
            const assignee = team.find(m => m.id === activeTask.assignedTo) || currentUser;
            return (
              <div className="glass-card rounded-xl p-4.5 shadow-2xl shadow-[#818CF8]/30 scale-[1.03] rotate-1 border border-[#818CF8]/30 cursor-grabbing bg-[#0F172A]/95 backdrop-blur-md">
                <div className="space-y-3">
                  {/* Tags row */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-md border border-white/5 text-slate-300">
                      {activeTask.category}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${activeTask.priority === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/10' : activeTask.priority === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/10' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/10'}`}>
                      {activeTask.priority}
                    </span>
                  </div>

                  {/* Task Text Content */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200 line-clamp-1">
                      {activeTask.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                      {activeTask.description}
                    </p>
                  </div>

                  {/* Footer Info Row */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-1">
                    <div className="flex items-center space-x-1.5 text-2xs text-slate-500 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{activeTask.dueDate}</span>
                    </div>

                    {assignee && (
                      <Avatar
                        name={assignee.name}
                        src={assignee.avatar}
                        className="w-6.5 h-6.5 text-[9px] border border-white/20"
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })() : null}
        </DragOverlay>
      </DndContext>
    );
  };

  // Render Table List Row
  const renderListRows = () => {
    return (
      <div className="mt-6 glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-slate-300">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.01] text-xs font-bold text-slate-400">
                <th className="py-4 px-6 w-12 text-center">Status</th>
                <th className="py-4 px-4">Task Detail</th>
                <th className="py-4 px-4">Assigned To</th>
                <th className="py-4 px-4 w-28">Category</th>
                <th className="py-4 px-4 w-28 text-center">Priority</th>
                <th className="py-4 px-4 w-32">Due Date</th>
                <th className="py-4 px-6 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-500">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => {
                  const assignee = team.find(m => m.id === task.assignedTo) || currentUser;
                  const isCompleted = task.status === 'completed';
                  const isOverdue = task.status === 'overdue';

                  return (
                    <tr 
                      key={task.id} 
                      className={`hover:bg-white/5 text-xs transition-colors border-b border-white/5 ${isCompleted ? 'bg-white/[0.01]' : isOverdue ? 'bg-rose-500/[0.01]' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleToggleComplete(task.id, task.status)}
                          className={`mx-auto w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer transition-all ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/20 hover:border-[#818CF8] text-transparent hover:text-[#818CF8]/30'}`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </button>
                      </td>

                      {/* Detail */}
                      <td className="py-4 px-4 max-w-sm">
                        <h4 className={`font-semibold text-slate-200 truncate ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                          {task.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{task.description}</p>
                      </td>

                      {/* Assignee */}
                      <td className="py-4 px-4">
                        {assignee && (
                          <div className="flex items-center space-x-2">
                            <Avatar 
                              name={assignee.name} 
                              src={assignee.avatar} 
                              className="w-6.5 h-6.5 text-[9px] border border-white/10"
                            />
                            <span className="font-semibold text-slate-300 truncate max-w-[100px]">{assignee.name}</span>
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-slate-300 font-mono font-medium">
                          {task.category}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-4 text-center">
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${task.priority === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/10' : task.priority === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/10' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/10'}`}>
                          {task.priority}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="py-4 px-4 font-mono font-medium text-slate-400">
                        {task.dueDate}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => navigate(`/add-task?edit=${task.id}`)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-[#818CF8] transition-all"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-rose-400 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-lg mx-auto space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-[#818CF8]/10 text-[#818CF8] flex items-center justify-center border border-[#818CF8]/20 animate-pulse">
          <ListTodo className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h3 className="font-display font-bold text-xl text-white">No tasks in your workspace yet</h3>
          <p className="text-xs text-slate-400 max-w-md">
            Get started by creating your first action. Organize your sprints, set due dates, and collaborate with your squad.
          </p>
        </div>
        <button
          onClick={() => navigate('/add-task')}
          className="py-2.5 px-6 bg-[#818CF8] hover:bg-[#818CF8]/90 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/10 cursor-pointer active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create Your First Task</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Upper Filters row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="font-display font-bold text-2xl text-white capitalize">
            {statusFilter === 'all' ? 'Core Workspace' : `${statusFilter} tasks`}
          </h2>
          <p className="text-xs text-slate-500 mt-1">Review active items, resource schedules, and team completion states</p>
        </div>

        {/* View Layout Toggle & Add task */}
        <div className="flex items-center gap-3">
          {/* List vs Board layout buttons */}
          <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'board' ? 'bg-[#818CF8] text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-100'}`}
              title="Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-[#818CF8] text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-100'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            id="btn-create-task-board"
            onClick={() => navigate('/add-task')}
            className="py-2 px-4 bg-[#818CF8] hover:bg-[#818CF8]/90 text-slate-950 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-500/10 cursor-pointer active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Grid containing filters controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/10">
        {/* Search */}
        <div className="md:col-span-4 relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            placeholder="Search details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-1.5 pl-9 pr-4 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-500"
          />
        </div>

        {/* Status Filter (only active if not forced by parent view) */}
        {!filterStatus && (
          <div className="md:col-span-2 relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-1.5 px-3 text-xs text-slate-300 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-300">All Statuses</option>
              <option value="pending" className="bg-slate-900 text-slate-300">Pending</option>
              <option value="completed" className="bg-slate-900 text-slate-300">Completed</option>
              <option value="overdue" className="bg-slate-900 text-slate-300">Overdue</option>
            </select>
            <Filter className="w-3 h-3 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>
        )}

        {/* Priority Filter */}
        <div className={`relative ${filterStatus ? 'md:col-span-3' : 'md:col-span-2'}`}>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-1.5 px-3 text-xs text-slate-300 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-slate-300">All Priorities</option>
            <option value="high" className="bg-slate-900 text-slate-300">High</option>
            <option value="medium" className="bg-slate-900 text-slate-300">Medium</option>
            <option value="low" className="bg-slate-900 text-slate-300">Low</option>
          </select>
          <Filter className="w-3 h-3 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>

        {/* Category Filter */}
        <div className={`relative ${filterStatus ? 'md:col-span-3' : 'md:col-span-2'}`}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-1.5 px-3 text-xs text-slate-300 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-slate-300">All Categories</option>
            {categories.filter(c => c !== 'all').map(cat => (
              <option key={cat} value={cat} className="bg-slate-900 text-slate-300">{cat}</option>
            ))}
          </select>
          <Filter className="w-3 h-3 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>

        {/* Sorting option */}
        <div className={`relative ${filterStatus ? 'md:col-span-2' : 'md:col-span-2'}`}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-1.5 px-3 text-xs text-slate-300 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="dueDate" className="bg-slate-900 text-slate-300">Due Date</option>
            <option value="priority" className="bg-slate-900 text-slate-300">Priority Weight</option>
            <option value="title" className="bg-slate-900 text-slate-300">Alphabetical</option>
          </select>
          <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Interactive Guidance Banner */}
      {viewMode === 'board' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#818CF8]/10 border border-[#818CF8]/20 rounded-2xl gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#818CF8]/20 rounded-xl text-[#818CF8] shrink-0">
              <LayoutGrid className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Board Interaction Active</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Drag and drop tasks - this is the way you can manage which one is complete or pending.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#818CF8] uppercase tracking-wider bg-[#818CF8]/10 px-2.5 py-1 rounded-lg border border-[#818CF8]/10 self-start sm:self-center">
            <span>Interactive Workspace</span>
          </div>
        </div>
      )}

      {/* Main Board vs List container */}
      {viewMode === 'board' ? renderKanbanColumns() : renderListRows()}
    </div>
  );
};
