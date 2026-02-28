import React, { useEffect, useMemo, useState } from 'react';
import {
  FiCalendar,
  FiCheckCircle,
  FiEdit2,
  FiPlus,
  FiTrash2,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import api from '../api/client';
import { ApiResponse, Task, TaskFormData } from '../types';
import LoadingSkeleton from '../components/UI/LoadingSkeleton';

type Filter = 'all' | 'pending' | 'completed';

const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getToday());
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState<TaskFormData | null>(null);

  const [form, setForm] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: getToday(),
  });

  const loadTasks = async (date: string) => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<Task[]>>('/tasks', {
        params: { date },
      });
      setTasks(response.data.data);
    } catch {
      toast.error('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks(selectedDate).catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setForm((prev) => ({ ...prev, dueDate: date }));
    loadTasks(date).catch(() => setLoading(false));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: TaskFormData = {
        ...form,
        dueDate: form.dueDate || selectedDate,
      };
      await api.post<ApiResponse<Task>>('/tasks', payload);
      toast.success('Task added.');
      setForm({
        title: '',
        description: '',
        priority: 'Medium',
        dueDate: selectedDate,
      });
      await loadTasks(selectedDate);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Failed to create task.';
      toast.error(message);
    }
  };

  const toggleComplete = async (task: Task) => {
    try {
      const pendingBefore = tasks.filter((t) => !t.completed).length;
      await api.put<ApiResponse<Task>>(`/tasks/${task._id}`, {
        completed: !task.completed,
      });
      await loadTasks(selectedDate);

      if (!task.completed && pendingBefore === 1) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
        toast.success('All tasks completed for the day. Amazing!');
      }
    } catch {
      toast.error('Failed to update task.');
    }
  };

  const deleteTask = async (task: Task) => {
    try {
      await api.delete<ApiResponse<unknown>>(`/tasks/${task._id}`);
      toast.success('Task removed.');
      await loadTasks(selectedDate);
    } catch {
      toast.error('Failed to delete task.');
    }
  };

  const deleteCompleted = async () => {
    try {
      await api.delete<ApiResponse<{ deletedCount: number }>>(
        '/tasks/completed'
      );
      toast.success('Completed tasks cleared.');
      await loadTasks(selectedDate);
    } catch {
      toast.error('Failed to clear completed tasks.');
    }
  };

  const filteredTasks = useMemo(() => {
    if (filter === 'pending') return tasks.filter((t) => !t.completed);
    if (filter === 'completed') return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Today&apos;s tasks</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Plan, prioritize, and check off your work for the day.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <FiCalendar />
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="input-field pl-10 w-44"
            />
          </div>
          <button
            type="button"
            onClick={deleteCompleted}
            className="btn-secondary flex items-center gap-2"
          >
            <FiTrash2 />
            <span className="text-sm">Clear completed</span>
          </button>
        </div>
      </div>

      <form
        onSubmit={handleCreate}
        className="glass-card p-5 rounded-2xl grid grid-cols-1 md:grid-cols-[2fr,2fr,1fr,auto] gap-3 items-end"
      >
        <div>
          <label className="block text-xs font-medium mb-1">Task</label>
          <input
            type="text"
            className="input-field"
            placeholder="What do you need to get done?"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Notes (optional)</label>
          <input
            type="text"
            className="input-field"
            placeholder="Add any helpful details..."
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1">Priority</label>
            <select
              className="input-field"
              value={form.priority}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  priority: e.target.value as TaskFormData['priority'],
                }))
              }
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1">Due date</label>
            <input
              type="date"
              className="input-field"
              value={form.dueDate}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, dueDate: e.target.value }))
              }
            />
          </div>
        </div>
        <button
          type="submit"
          className="btn-primary flex items-center justify-center gap-2"
        >
          <FiPlus />
          <span>Add</span>
        </button>
      </form>

      <div className="glass-card p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="text-primary-500" />
            <div>
              <p className="text-sm font-medium">Your tasks</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {completedCount} of {tasks.length} completed.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full border ${
                filter === 'all'
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-full border ${
                filter === 'pending'
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              Pending
            </button>
            <button
              type="button"
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded-full border ${
                filter === 'completed'
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton type="list" />
        ) : filteredTasks.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No tasks yet. Add your first task for this day.
          </p>
        ) : (
          <ul className="space-y-3">
            {filteredTasks.map((task) => (
              <li
                key={task._id}
                className="flex items-start justify-between gap-3 glass-card rounded-2xl p-4"
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleComplete(task)}
                    className="mt-1 h-5 w-5 rounded-full border flex items-center justify-center border-gray-300 dark:border-gray-600"
                  >
                    {task.completed && (
                      <span className="h-3 w-3 rounded-full bg-gradient-to-r from-primary-500 to-accent-500" />
                    )}
                  </button>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        task.completed
                          ? 'line-through text-gray-400 dark:text-gray-500'
                          : ''
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {task.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full border ${
                          task.priority === 'High'
                            ? 'border-red-500 text-red-500'
                            : task.priority === 'Medium'
                            ? 'border-amber-500 text-amber-500'
                            : 'border-emerald-500 text-emerald-500'
                        }`}
                      >
                        {task.priority} priority
                      </span>
                      <span>
                        Due{' '}
                        {new Date(task.dueDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTask(task);
                      setEditForm({
                        title: task.title,
                        description: task.description,
                        priority: task.priority,
                        dueDate: task.dueDate.slice(0, 10),
                      });
                    }}
                    className="btn-secondary flex items-center justify-center px-2 py-1 text-xs"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTask(task)}
                    className="btn-secondary flex items-center justify-center px-2 py-1 text-xs"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editingTask && editForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-sm font-semibold">Edit task</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await api.put<ApiResponse<Task>>(`/tasks/${editingTask._id}`, {
                    title: editForm.title,
                    description: editForm.description,
                    priority: editForm.priority,
                    dueDate: editForm.dueDate,
                  });
                  toast.success('Task updated.');
                  setEditingTask(null);
                  setEditForm(null);
                  await loadTasks(selectedDate);
                } catch (error: any) {
                  const message =
                    error?.response?.data?.message || 'Failed to update task.';
                  toast.error(message);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-medium mb-1">
                  Task title
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            title: e.target.value,
                          }
                        : prev
                    )
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Description
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            description: e.target.value,
                          }
                        : prev
                    )
                  }
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1">
                    Priority
                  </label>
                  <select
                    className="input-field"
                    value={editForm.priority}
                    onChange={(e) =>
                      setEditForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              priority: e.target.value as TaskFormData['priority'],
                            }
                          : prev
                      )
                    }
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1">
                    Due date
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={editForm.dueDate}
                    onChange={(e) =>
                      setEditForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              dueDate: e.target.value,
                            }
                          : prev
                      )
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTask(null);
                    setEditForm(null);
                  }}
                  className="btn-secondary px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-4 py-2 text-xs"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;

