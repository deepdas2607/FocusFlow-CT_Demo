// ============================================================================
// FILE: frontend/src/views/TasksView.jsx
// PURPOSE: MVVM "View" for creating, filtering, completing, and deleting tasks.
// ============================================================================

import React, { useState } from 'react';
import { TASK_CATEGORIES, TASK_PRIORITIES } from '../models/focusFlowModels';

export default function TasksView({
  tasks,
  onCreateTask,
  onToggleTaskComplete,
  onDeleteTask
}) {
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'COMPLETED'
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    category: 'Work',
    priority: 'Medium',
    estimatedMinutes: 25,
    dueDate: new Date().toISOString().split('T')[0]
  });

  // Updates a single field in the new task creation form
  function handleFormChange(field, value) {
    setNewTaskForm((prev) => ({ ...prev, [field]: value }));
  }

  // Submits the new task to the ViewModel and resets the title/description inputs
  function handleFormSubmit(e) {
    e.preventDefault();
    if (!newTaskForm.title.trim()) return;
    onCreateTask(newTaskForm);
    setNewTaskForm((prev) => ({ ...prev, title: '', description: '' }));
  }

  // Filters the task list based on selected status and category tabs
  const filteredTasks = tasks.filter((task) => {
    if (statusFilter === 'PENDING' && task.completed) return false;
    if (statusFilter === 'COMPLETED' && !task.completed) return false;
    if (categoryFilter !== 'ALL' && task.category !== categoryFilter) return false;
    return true;
  });

  const priorityBadgeStyles = {
    High: 'bg-rose-50 text-rose-700 border-rose-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Low: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Tasks</h1>
        <p className="text-sm text-slate-500 mt-1">
          Organize your daily priorities and track task completion events.
        </p>
      </div>

      {/* 1. Create New Task Card */}
      <form
        onSubmit={handleFormSubmit}
        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4"
      >
        <h2 className="text-base font-bold text-slate-900">Create a New Task</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
            <input
              type="text"
              required
              value={newTaskForm.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
              placeholder="What do you want to accomplish today?"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={newTaskForm.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Add notes, acceptance criteria, or links..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:col-span-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={newTaskForm.category}
                onChange={(e) => handleFormChange('category', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {TASK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={newTaskForm.priority}
                onChange={(e) => handleFormChange('priority', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {TASK_PRIORITIES.map((pri) => (
                  <option key={pri} value={pri}>{pri}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Est. Minutes</label>
              <input
                type="number"
                min="5"
                max="240"
                value={newTaskForm.estimatedMinutes}
                onChange={(e) => handleFormChange('estimatedMinutes', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={newTaskForm.dueDate}
                onChange={(e) => handleFormChange('dueDate', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-xs cursor-pointer"
          >
            + Add Task
          </button>
        </div>
      </form>

      {/* 2. Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-xl w-fit">
          {[
            { id: 'ALL', label: `All (${tasks.length})` },
            { id: 'PENDING', label: `Pending (${tasks.filter((t) => !t.completed).length})` },
            { id: 'COMPLETED', label: `Completed (${tasks.filter((t) => t.completed).length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', ...TASK_CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
            <p className="text-sm text-slate-500">No tasks match the current filter.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-2xl border p-4 sm:p-5 flex items-start justify-between gap-4 transition-all ${
                task.completed
                  ? 'border-slate-200 bg-slate-50/70 opacity-75'
                  : 'border-slate-200 hover:border-indigo-200 shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <button
                  type="button"
                  onClick={() => onToggleTaskComplete(task.id)}
                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                    task.completed
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-slate-300 hover:border-indigo-500'
                  }`}
                >
                  {task.completed && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                <div className="min-w-0">
                  <p
                    className={`text-sm font-bold ${
                      task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-slate-500 mt-1">{task.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2.5">
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {task.category}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${
                        priorityBadgeStyles[task.priority] || 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Est. {task.estimatedMinutes || 25}m
                    </span>
                    {task.dueDate && (
                      <span className="text-[11px] text-slate-400">
                        Due: {task.dueDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onToggleTaskComplete(task.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    task.completed
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {task.completed ? 'Reopen' : 'Complete'}
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete Task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

