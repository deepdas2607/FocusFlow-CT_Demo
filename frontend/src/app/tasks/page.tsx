'use client';

/**
 * Tasks page - Full task management interface.
 *
 * Features:
 * - View all tasks with filtering
 * - Create new task (inline form)
 * - Edit existing task (inline form)
 * - Mark task as complete
 * - Delete task
 */

import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { tasksApi, Task, CreateTaskData } from '../../lib/api';

const CATEGORIES = ['General', 'Work', 'Study', 'Personal', 'Health', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];

// Filter options for the task list
type FilterOption = 'all' | 'active' | 'completed';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Controls whether the "create task" form is visible
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Holds the ID of the task currently being edited (null = not editing)
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await tasksApi.getAll();
      setTasks(response.tasks);
    } catch (err: any) {
      setError(err.message || 'Could not load tasks.');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new task
  const handleCreateTask = async (formData: CreateTaskData) => {
    try {
      const response = await tasksApi.create(formData);
      setTasks((prev) => [response.task, ...prev]);
      setShowCreateForm(false);
    } catch (err: any) {
      alert(err.message || 'Could not create task.');
    }
  };

  // Update an existing task
  const handleUpdateTask = async (taskId: number, formData: Partial<CreateTaskData>) => {
    try {
      const response = await tasksApi.update(taskId, formData);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? response.task : t)));
      setEditingTaskId(null);
    } catch (err: any) {
      alert(err.message || 'Could not update task.');
    }
  };

  // View a task's details
  const handleViewTask = (_task: Task) => {
    // Inspection handler for task card clicks
  };

  // Mark a task as completed
  const handleCompleteTask = async (task: Task) => {
    try {
      const response = await tasksApi.complete(task.id);
      const updatedTasks = tasks.map((t) => (t.id === task.id ? response.task : t));
      setTasks(updatedTasks);
    } catch (err: any) {
      alert(err.message || 'Could not complete task.');
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId: number, _task: Task) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await tasksApi.delete(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err: any) {
      alert(err.message || 'Could not delete task.');
    }
  };

  // Apply the current filter to the task list
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true; // 'all'
  });

  return (
    <AppLayout>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 mt-1">Manage and track your work</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          + New Task
        </button>
      </div>

      {/* Create task form */}
      {showCreateForm && (
        <div className="mb-6">
          <TaskForm
            onSubmit={handleCreateTask}
            onCancel={() => setShowCreateForm(false)}
            submitLabel="Create Task"
          />
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'completed'] as FilterOption[]).map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === option
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-16">
          <p className="text-gray-500">Loading tasks...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && filteredTasks.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No tasks here</h3>
          <p className="text-gray-500 mb-4">
            {filter === 'all'
              ? "You haven't created any tasks yet."
              : `No ${filter} tasks found.`}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="text-indigo-600 font-medium hover:text-indigo-700"
            >
              Create your first task →
            </button>
          )}
        </div>
      )}

      {/* Task list */}
      {!isLoading && filteredTasks.length > 0 && (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isEditing={editingTaskId === task.id}
              onEdit={() => setEditingTaskId(task.id)}
              onCancelEdit={() => setEditingTaskId(null)}
              onUpdate={handleUpdateTask}
              onComplete={handleCompleteTask}
              onDelete={handleDeleteTask}
              onView={handleViewTask}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}

// ─── TaskCard component ───────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (id: number, data: Partial<CreateTaskData>) => Promise<void>;
  onComplete: (task: Task) => Promise<void>;
  onDelete: (id: number, task: Task) => Promise<void>;
  onView: (task: Task) => void;
}

function TaskCard({
  task,
  isEditing,
  onEdit,
  onCancelEdit,
  onUpdate,
  onComplete,
  onDelete,
  onView,
}: TaskCardProps) {
  const priorityColors: Record<string, string> = {
    High: 'bg-red-100 text-red-700 border-red-200',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Low: 'bg-green-100 text-green-700 border-green-200',
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl border border-indigo-300 p-4">
        <TaskForm
          initialValues={{
            title: task.title,
            description: task.description || '',
            category: task.category,
            priority: task.priority,
          }}
          onSubmit={(data) => onUpdate(task.id, data)}
          onCancel={onCancelEdit}
          submitLabel="Save Changes"
        />
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl border p-4 flex items-start gap-4 ${
        task.completed ? 'border-gray-100 opacity-75' : 'border-gray-200'
      }`}
    >
      {/* Complete checkbox */}
      <button
        onClick={() => !task.completed && onComplete(task)}
        disabled={task.completed}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
          task.completed
            ? 'bg-indigo-600 border-indigo-600'
            : 'border-gray-300 hover:border-indigo-400'
        }`}
        aria-label={task.completed ? 'Task completed' : 'Mark as complete'}
      />

      {/* Task content - clicking triggers Task Viewed event */}
      <div
        onClick={() => onView(task)}
        className="flex-1 min-w-0 cursor-pointer"
        title="Click to view task details"
      >
        <p
          className={`font-medium text-gray-900 ${task.completed ? 'line-through text-gray-400' : ''}`}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-sm text-gray-500 mt-0.5">{task.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {task.category}
          </span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
              priorityColors[task.priority] || 'bg-gray-100 text-gray-600 border-gray-200'
            }`}
          >
            {task.priority}
          </span>
        </div>
      </div>

      {/* Action buttons - only show if task is not completed */}
      {!task.completed && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onEdit}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
            aria-label="Edit task"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id, task)}
            className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
            aria-label="Delete task"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─── TaskForm component ───────────────────────────────────────────────────────

interface TaskFormProps {
  initialValues?: Partial<CreateTaskData>;
  onSubmit: (data: CreateTaskData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

function TaskForm({ initialValues, onSubmit, onCancel, submitLabel }: TaskFormProps) {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [category, setCategory] = useState(initialValues?.category || 'General');
  const [priority, setPriority] = useState(initialValues?.priority || 'Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      alert('Task title is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), category, priority });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-200 p-5 space-y-4"
    >
      <div>
        <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you need to do?"
          required
          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400 text-sm"
        />
      </div>

      <div>
        <label htmlFor="task-desc" className="block text-sm font-medium text-gray-700 mb-1">
          Description (optional)
        </label>
        <textarea
          id="task-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details..."
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400 text-sm resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="task-category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="task-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm bg-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm bg-white"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

