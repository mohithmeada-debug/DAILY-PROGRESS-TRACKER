import React, { useEffect, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../api/client';
import { ApiResponse, DailyReport, WeeklyReport } from '../types';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const ProgressReportPage: React.FC = () => {
  const [daily, setDaily] = useState<DailyReport | null>(null);
  const [weekly, setWeekly] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dailyRes, weeklyRes] = await Promise.all([
          api.get<ApiResponse<DailyReport>>('/reports/daily'),
          api.get<ApiResponse<WeeklyReport>>('/reports/weekly'),
        ]);
        setDaily(dailyRes.data.data);
        setWeekly(weeklyRes.data.data);
      } finally {
        setLoading(false);
      }
    };

    fetchData().catch(() => setLoading(false));
  }, []);

  const exportPdf = () => {
    if (!weekly) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Weekly Productivity Report', 14, 20);

    doc.setFontSize(11);
    doc.text(
      `Generated on ${new Date().toLocaleString()}`,
      14,
      28
    );

    const body = weekly.weeklyData.map((day) => [
      day.day,
      day.date,
      day.totalTasks,
      day.completedTasks,
      `${day.percentage}%`,
    ]);

    (doc as any).autoTable({
      head: [['Day', 'Date', 'Total tasks', 'Completed', 'Productivity']],
      body,
      startY: 36,
      styles: { fontSize: 10 },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 36;
    doc.text(
      `Total tasks: ${weekly.totalTasks} | Completed: ${weekly.totalCompleted} | Average productivity: ${weekly.avgProductivity}%`,
      14,
      finalY + 10
    );

    doc.save('weekly-progress-report.pdf');
  };

  const todayLabel = daily?.date
    ? new Date(daily.date + 'T00:00:00').toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold mb-1">Progress reports</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            See how consistent you&apos;ve been and export a summary.
          </p>
        </div>
        <button
          type="button"
          onClick={exportPdf}
          className="btn-secondary flex items-center gap-2"
          disabled={!weekly || loading}
        >
          <FiDownload />
          <span className="text-sm">Download weekly PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5 rounded-2xl space-y-3">
          <h3 className="text-sm font-semibold">Today&apos;s snapshot</h3>
          {loading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading daily stats...
            </p>
          ) : daily ? (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {todayLabel}
              </p>
              <p className="text-3xl font-semibold">
                {daily.completedTasks}
                <span className="text-base font-normal text-gray-500 dark:text-gray-400 ml-1">
                  / {daily.totalTasks} tasks
                </span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Productivity:{' '}
                <span className="font-semibold text-primary-500">
                  {daily.percentage}%
                </span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pending tasks: {daily.pendingTasks}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No tasks yet today. Add a few to get your day started.
            </p>
          )}
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-3">
          <h3 className="text-sm font-semibold">Weekly summary</h3>
          {loading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading weekly stats...
            </p>
          ) : weekly ? (
            <>
              <p className="text-3xl font-semibold">
                {weekly.avgProductivity}
                <span className="text-base font-normal text-gray-500 dark:text-gray-400 ml-1">
                  %
                </span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {weekly.totalCompleted} of {weekly.totalTasks} tasks completed.
              </p>
              <ul className="mt-3 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                {weekly.weeklyData.map((day) => (
                  <li key={day.date} className="flex justify-between">
                    <span>
                      {day.day}{' '}
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">
                        ({day.date})
                      </span>
                    </span>
                    <span>
                      {day.completedTasks}/{day.totalTasks} • {day.percentage}%
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Once you start completing tasks across a week, your summary will
              appear here.
            </p>
          )}
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-sm font-semibold mb-3">Weekly trend</h3>
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading chart...
          </p>
        ) : weekly && weekly.weeklyData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekly.weeklyData}>
                <XAxis dataKey="day" />
                <YAxis domain={[0, 100]} tickCount={6} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 10px 25px rgba(15, 23, 42, 0.15)',
                    backgroundColor:
                      typeof document !== 'undefined' &&
                      document.documentElement.classList.contains('dark')
                        ? '#020617'
                        : '#ffffff',
                    color:
                      typeof document !== 'undefined' &&
                      document.documentElement.classList.contains('dark')
                        ? '#e5e7eb'
                        : '#0f172a',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#6366F1"
                  strokeWidth={2.2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            As you complete tasks during the week, your productivity trend will
            be visualized here.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProgressReportPage;

