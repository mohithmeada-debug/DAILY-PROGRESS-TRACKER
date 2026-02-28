import { Response } from 'express';
import Task from '../models/Task';
import DailyReport from '../models/DailyReport';
import { AuthRequest } from '../middleware/auth';
import { getTodayDateString, getStartOfDay, getEndOfDay, getWeekDates } from '../utils/helpers';

export const getDailyReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const date = (req.query.date as string) || getTodayDateString();

    const tasks = await Task.find({
      userId,
      dueDate: { $gte: getStartOfDay(date), $lte: getEndOfDay(date) },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Upsert daily report
    await DailyReport.findOneAndUpdate(
      { userId, date },
      { totalTasks, completedTasks, percentage },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: {
        date,
        totalTasks,
        completedTasks,
        pendingTasks,
        percentage,
      },
    });
  } catch (error) {
    console.error('DailyReport error:', error);
    res.status(500).json({ success: false, message: 'Failed to get daily report.' });
  }
};

export const getWeeklyReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { dates } = getWeekDates();

    const reports = await DailyReport.find({
      userId,
      date: { $in: dates },
    }).sort({ date: 1 });

    // Fill in missing dates with zero values
    const weeklyData = dates.map((date) => {
      const report = reports.find((r) => r.date === date);
      const dayName = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
      return {
        date,
        day: dayName,
        totalTasks: report?.totalTasks || 0,
        completedTasks: report?.completedTasks || 0,
        percentage: report?.percentage || 0,
      };
    });

    const totalCompleted = weeklyData.reduce((sum, d) => sum + d.completedTasks, 0);
    const totalTasks = weeklyData.reduce((sum, d) => sum + d.totalTasks, 0);
    const avgProductivity = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

    res.json({
      success: true,
      data: {
        weeklyData,
        totalCompleted,
        totalTasks,
        avgProductivity,
      },
    });
  } catch (error) {
    console.error('WeeklyReport error:', error);
    res.status(500).json({ success: false, message: 'Failed to get weekly report.' });
  }
};

export const getStreak = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;

    // Get reports sorted by date descending
    const reports = await DailyReport.find({
      userId,
      percentage: 100,
      totalTasks: { $gt: 0 },
    }).sort({ date: -1 });

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      const hasReport = reports.some((r) => r.date === dateStr);
      if (hasReport) {
        streak++;
      } else {
        // Allow today to be incomplete (streak counts up to yesterday)
        if (i === 0) continue;
        break;
      }
    }

    res.json({
      success: true,
      data: { streak },
    });
  } catch (error) {
    console.error('Streak error:', error);
    res.status(500).json({ success: false, message: 'Failed to get streak.' });
  }
};
