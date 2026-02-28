import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FiBarChart2, FiCheckSquare, FiPlus, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/client';
import {
  ApiResponse,
  Habit,
  HabitEntry,
  MonthlyHabitData,
} from '../types';

const getTodayDate = () => new Date().toISOString().split('T')[0];

const getInitialMonth = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const getDaysInMonth = (year: number, monthIndex: number) =>
  new Date(year, monthIndex + 1, 0).getDate();

const HabitsPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(getInitialMonth);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  const [year, monthIndex] = useMemo(() => {
    const [y, m] = selectedMonth.split('-');
    return [Number(y), Number(m) - 1];
  }, [selectedMonth]);

  const daysInMonth = useMemo(
    () => getDaysInMonth(year, monthIndex),
    [year, monthIndex]
  );

  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth]
  );

  const entryMap = useMemo(() => {
    const map: Record<string, Record<string, HabitEntry>> = {};
    for (const e of entries) {
      if (!map[e.habitId]) map[e.habitId] = {};
      map[e.habitId][e.date] = e;
    }
    return map;
  }, [entries]);

  const loadMonth = useCallback(
    async (month: string) => {
      setLoading(true);
      try {
        const res = await api.get<ApiResponse<MonthlyHabitData>>(
          `/habits/month/${month}`
        );
        setHabits(res.data.data.habits);
        setEntries(res.data.data.entries);
      } catch (error: any) {
        const message =
          error?.response?.data?.message || 'Failed to load habit grid.';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadMonth(selectedMonth).catch(() => setLoading(false));
  }, [loadMonth, selectedMonth]);

  const toggleEntry = async (habitId: string, day: number) => {
    if (saving) return;
    const date = `${selectedMonth}-${String(day).padStart(2, '0')}`;
    const existing = entryMap[habitId]?.[date];
    const nextCompleted = !(existing?.completed ?? false);

    setSaving(true);
    setEntries((prev) => {
      const copy = [...prev];
      if (existing) {
        return copy.map((e) =>
          e._id === existing._id ? { ...e, completed: nextCompleted } : e
        );
      }
      const optimistic: HabitEntry = {
        _id: `temp-${habitId}-${date}`,
        habitId,
        userId: '',
        date,
        completed: nextCompleted,
      };
      return [...copy, optimistic];
    });

    try {
      const res = await api.post<ApiResponse<HabitEntry>>('/habit-entry', {
        habitId,
        date,
        completed: nextCompleted,
      });
      const saved = res.data.data;
      setEntries((prev) =>
        prev
          .filter(
            (e) =>
              !(
                e.habitId === habitId &&
                e.date === date &&
                e._id.startsWith('temp-')
              )
          )
          .map((e) => (e._id === saved._id ? saved : e))
          .concat(
            prev.some((e) => e._id === saved._id) ? [] : [saved]
          )
      );
    } catch (error: any) {
      setEntries((prev) =>
        prev.map((e) =>
          e.habitId === habitId && e.date === date
            ? { ...e, completed: existing?.completed ?? false }
            : e
        )
      );
      const message =
        error?.response?.data?.message || 'Failed to update habit entry.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newHabitName.trim();
    if (!name) {
      toast.error('Habit name cannot be empty.');
      return;
    }
    try {
      const res = await api.post<ApiResponse<Habit>>('/habits', { name });
      toast.success('Daily task added.');
      setNewHabitName('');
      setIsAddModalOpen(false);
      setHabits((prev) => [...prev, res.data.data]);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Failed to add habit.';
      toast.error(message);
    }
  };

  const handleDeleteHabit = async (habit: Habit) => {
    if (!window.confirm(`Delete habit "${habit.name}"?`)) return;
    try {
      await api.delete<ApiResponse<unknown>>(`/habits/${habit._id}`);
      toast.success('Habit deleted.');
      setHabits((prev) => prev.filter((h) => h._id !== habit._id));
      setEntries((prev) => prev.filter((e) => e.habitId !== habit._id));
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Failed to delete habit.';
      toast.error(message);
    }
  };

  const today = getTodayDate();
  const todaySummary = useMemo(() => {
    if (!habits.length) return { completed: 0, total: 0, percentage: 0 };
    let completed = 0;
    for (const h of habits) {
      const e = entryMap[h._id]?.[today];
      if (e?.completed) completed += 1;
    }
    const total = habits.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  }, [habits, entryMap]);

  const habitStats = useMemo(() => {
    const stats: Record<
      string,
      { completion: number; streak: number; longestStreak: number }
    > = {};

    for (const habit of habits) {
      let completedDays = 0;
      let streak = 0;
      let longestStreak = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const date = `${selectedMonth}-${String(day).padStart(2, '0')}`;
        const entry = entryMap[habit._id]?.[date];
        if (entry?.completed) {
          completedDays += 1;
          streak += 1;
          longestStreak = Math.max(longestStreak, streak);
        } else {
          streak = 0;
        }
      }

      const completion =
        daysInMonth > 0
          ? Math.round((completedDays / daysInMonth) * 100)
          : 0;
      stats[habit._id] = { completion, streak, longestStreak };
    }

    return stats;
  }, [habits, entryMap, daysInMonth, selectedMonth]);

  const exportCsv = () => {
    if (!habits.length) {
      toast.error('No daily tasks to export.');
      return;
    }
    const header = ['Daily task', ...days.map((d) => String(d))];
    const rows = habits.map((h) => {
      const row: string[] = [h.name];
      for (const day of days) {
        const date = `${selectedMonth}-${String(day).padStart(2, '0')}`;
        const e = entryMap[h._id]?.[date];
        row.push(e?.completed ? '1' : '');
      }
      return row.join(',');
    });
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-tasks-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const monthLabel = useMemo(() => {
    const date = new Date(year, monthIndex, 1);
    return date.toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    });
  }, [year, monthIndex]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Daily tasks grid</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track your recurring daily tasks across the month with a simple checkbox grid.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">
              Select month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="input-field w-40"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus />
            <span className="text-sm">Add daily task</span>
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="btn-secondary flex items-center gap-2"
          >
            <FiBarChart2 />
            <span className="text-sm">Export CSV</span>
          </button>
        </div>
      </div>

      <div className="glass-card p-5 rounded-2xl flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
            Today&apos;s daily task score
          </p>
          <p className="text-2xl font-semibold">
            {todaySummary.completed}
            <span className="text-base font-normal text-gray-500 dark:text-gray-400 ml-1">
              / {todaySummary.total} daily tasks
            </span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Completion:{' '}
            <span className="font-semibold text-primary-500">
              {todaySummary.percentage}%
            </span>
          </p>
        </div>
        <div className="flex-1 max-w-xs">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500 dark:text-gray-400">
              Monthly consistency ({monthLabel})
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.round(
                  habits.length
                    ? habits.reduce(
                        (sum, h) => sum + (habitStats[h._id]?.completion || 0),
                        0
                      ) / habits.length
                    : 0
                )}%`,
              }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
            />
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-0 overflow-hidden">
        <div className="border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
            {monthLabel}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <FiCheckSquare />
            Tap to toggle completion
          </p>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-max">
            <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(24px,1fr))] text-xs">
              <div className="sticky left-0 z-10 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur px-4 py-2 border-r border-gray-100 dark:border-gray-800">
                Daily task
              </div>
              {days.map((day) => (
                <div
                  key={day}
                  className="px-2 py-2 text-center text-[11px] text-gray-500 dark:text-gray-400"
                >
                  {day}
                </div>
              ))}
            </div>

            {loading ? (
              <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
                Loading daily tasks grid...
              </div>
            ) : !habits.length ? (
              <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
                No daily tasks yet. Add one to start tracking.
              </div>
            ) : (
              habits.map((habit) => {
                const stat = habitStats[habit._id] || {
                  completion: 0,
                  streak: 0,
                  longestStreak: 0,
                };
                return (
                  <div
                    key={habit._id}
                    className="grid grid-cols-[200px_repeat(auto-fit,minmax(24px,1fr))] border-t border-gray-100 dark:border-gray-800 text-xs"
                  >
                    <div className="sticky left-0 z-10 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur px-4 py-3 flex items-center justify-between gap-2 border-r border-gray-100 dark:border-gray-800">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100 text-sm truncate">
                          {habit.name}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                          {stat.completion}% month • streak {stat.streak} • best{' '}
                          {stat.longestStreak}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteHabit(habit)}
                        className="btn-secondary px-2 py-1 text-[11px] flex items-center gap-1"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    {days.map((day) => {
                      const date = `${selectedMonth}-${String(day).padStart(
                        2,
                        '0'
                      )}`;
                      const entry = entryMap[habit._id]?.[date];
                      const isChecked = entry?.completed ?? false;
                      return (
                        <button
                          type="button"
                          key={day}
                          onClick={() => toggleEntry(habit._id, day)}
                          className="flex items-center justify-center px-2 py-2 border-r border-gray-50 dark:border-gray-900"
                        >
                          <motion.div
                            initial={false}
                            animate={{
                              scale: isChecked ? 0.9 : 1,
                            }}
                            transition={{ duration: 0.15 }}
                            className={`h-4 w-4 rounded-md border flex items-center justify-center ${
                              isChecked
                                ? 'bg-gradient-to-r from-primary-500 to-accent-500 border-transparent'
                                : 'border-gray-300 dark:border-gray-700 bg-transparent'
                            }`}
                          >
                            {isChecked && (
                              <span className="h-2 w-2 rounded-sm bg-white" />
                            )}
                          </motion.div>
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-sm font-semibold">Add daily task</h3>
            <form onSubmit={handleAddHabit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Task name
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 6:00 AM Wake Up"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary px-4 py-2 text-xs">
                  Add daily task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitsPage;

