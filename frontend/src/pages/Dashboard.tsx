import React, { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { ApiResponse, DailyReport, WeeklyReport } from '../types';
import * as moodApi from '../api/moods';
import { FiSmile, FiMeh, FiFrown } from 'react-icons/fi';

interface StreakResponse {
  streak: number;
}

const DashboardPage: React.FC = () => {
  const [daily, setDaily] = useState<DailyReport | null>(null);
  const [weekly, setWeekly] = useState<WeeklyReport | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [currentMood, setCurrentMood] = useState<moodApi.MoodValue | null>(null);
  const [loading, setLoading] = useState(true);

  const todayDateStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dailyRes, weeklyRes, streakRes, moodRes] = await Promise.all([
          api.get<ApiResponse<DailyReport>>('/reports/daily'),
          api.get<ApiResponse<WeeklyReport>>('/reports/weekly'),
          api.get<ApiResponse<{ streak: number }>>('/reports/streak'),
          moodApi.getMoodByDate(todayDateStr).catch(() => null), // If not found, ignore
        ]);

        setDaily(dailyRes.data.data);
        setWeekly(weeklyRes.data.data);
        setStreak(streakRes.data.data.streak);
        if (moodRes) {
          setCurrentMood(moodRes.value);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData().catch(() => setLoading(false));
  }, [todayDateStr]);

  const handleSetMood = async (value: moodApi.MoodValue) => {
    try {
      setCurrentMood(value);
      await moodApi.setMood({ value, date: todayDateStr });
    } catch (error) {
      console.error('Failed to set mood:', error);
    }
  };

  const todayLabel = daily?.date
    ? new Date(daily.date + 'T00:00:00').toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
    : '';

  const percentage = daily?.percentage ?? 0;
  const isDarkMode =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark');

  const moodOptions: { value: moodApi.MoodValue; emoji: string; label: string }[] = [
    { value: 'Happy', emoji: '🤩', label: 'Great' },
    { value: 'Good', emoji: '😊', label: 'Good' },
    { value: 'Normal', emoji: '😐', label: 'Okay' },
    { value: 'Low', emoji: '😔', label: 'Low' },
    { value: 'Stressed', emoji: '😫', label: 'Stressed' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Today's Focus Card */}
        <div className="glass-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center gap-4 md:col-span-2">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
            Today&apos;s focus
          </p>
          <div className="flex-1 space-y-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {todayLabel || 'Today'}
            </h3>
            <p className="text-3xl font-semibold mb-1">
              {daily?.completedTasks ?? 0}
              <span className="text-base font-normal text-gray-500 dark:text-gray-400 ml-1">
                / {daily?.totalTasks ?? 0} tasks
              </span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pending:{' '}
              <span className="font-semibold">
                {(daily?.totalTasks ?? 0) - (daily?.completedTasks ?? 0)}
              </span>
            </p>
            <Link
              to="/tasks"
              className="inline-flex items-center gap-2 text-xs text-primary-500 hover:text-primary-600 font-medium mt-1"
            >
              Go to tasks
              <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative h-24 w-24 md:h-28 md:w-28 rounded-full flex items-center justify-center"
              style={{
                background: `conic-gradient(#6366F1 ${percentage}%, rgba(148,163,184,0.2) ${percentage}% 100%)`,
              }}
            >
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center shadow-inner">
                <motion.span
                  key={percentage}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-lg font-semibold"
                >
                  {percentage}%
                </motion.span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  today
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Mood Card */}
        <div className="glass-card p-5 rounded-2xl md:col-span-2">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
            How are you feeling today?
          </p>
          <div className="flex justify-between items-center h-full pb-4">
            {moodOptions.map((mood) => (
              <button
                key={mood.value}
                onClick={() => handleSetMood(mood.value)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${currentMood === mood.value
                    ? 'bg-primary-50 dark:bg-primary-900/30 scale-110'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 grayscale hover:grayscale-0 opacity-60 hover:opacity-100'
                  }`}
              >
                <span className="text-3xl">{mood.emoji}</span>
                <span
                  className={`text-[10px] font-medium ${currentMood === mood.value
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 dark:text-gray-400'
                    }`}
                >
                  {mood.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
            Weekly progress
          </p>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
            Last 7 days
          </h3>
          <p className="text-3xl font-semibold mb-1">
            {weekly?.avgProductivity ?? 0}
            <span className="text-base font-normal text-gray-500 dark:text-gray-400 ml-1">
              %
            </span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {weekly
              ? `${weekly.totalCompleted} of ${weekly.totalTasks} tasks completed.`
              : 'Stay consistent to see your weekly stats here.'}
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
            Current streak
          </p>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
            Days with 100% completion
          </h3>
          <p className="text-3xl font-semibold mb-1">{streak}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {streak > 0
              ? 'Amazing consistency. Keep the chain going.'
              : 'Complete all tasks for the day to start your streak.'}
          </p>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold">Weekly productivity</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Daily completion percentage (0–100%) over the last week.
            </p>
          </div>
        </div>
        <div className="h-72">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              Loading stats...
            </div>
          ) : weekly && weekly.weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly.weeklyData}>
                <XAxis dataKey="day" />
                <YAxis domain={[0, 100]} tickCount={6} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow:
                      '0 10px 25px rgba(15, 23, 42, 0.15)',
                    backgroundColor: isDarkMode ? '#020617' : '#ffffff',
                    color: isDarkMode ? '#e5e7eb' : '#0f172a',
                  }}
                  formatter={(
                    _value: number,
                    _name: string,
                    entry: any
                  ) => {
                    const d = entry?.payload;
                    const completed = d?.completedTasks ?? 0;
                    const total = d?.totalTasks ?? 0;
                    const pct = d?.percentage ?? 0;
                    return [
                      `${completed}/${total} tasks • ${pct}%`,
                      'Progress',
                    ];
                  }}
                />
                <Bar
                  dataKey="percentage"
                  fill="url(#barGradient)"
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient
                    id="barGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              Complete some tasks to see your weekly productivity chart.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

