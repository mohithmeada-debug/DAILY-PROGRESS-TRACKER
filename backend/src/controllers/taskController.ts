import { Response } from 'express';
import { validationResult } from 'express-validator';
import Task from '../models/Task';
import DailyReport from '../models/DailyReport';
import { AuthRequest } from '../middleware/auth';
import { getStartOfDay, getEndOfDay, getTodayDateString } from '../utils/helpers';

const updateDailyReport = async (userId: string, dateStr: string): Promise<void> => {
  const startOfDay = getStartOfDay(dateStr);
  const endOfDay = getEndOfDay(dateStr);

  const tasks = await Task.find({
    userId,
    dueDate: { $gte: startOfDay, $lte: endOfDay },
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  await DailyReport.findOneAndUpdate(
    { userId, date: dateStr },
    { totalTasks, completedTasks, percentage },
    { upsert: true, new: true }
  );
};

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, completed } = req.query;
    const userId = req.user!._id;

    const filter: Record<string, unknown> = { userId };

    if (date) {
      filter.dueDate = {
        $gte: getStartOfDay(date as string),
        $lte: getEndOfDay(date as string),
      };
    }

    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error('GetTasks error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tasks.' });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, message: errors.array()[0].msg });
      return;
    }

    const { title, description, priority, dueDate } = req.body;
    const userId = req.user!._id;

    const task = await Task.create({
      title,
      description: description || '',
      priority: priority || 'Medium',
      dueDate,
      userId,
    });

    // Update daily report
    const dateStr = new Date(dueDate).toISOString().split('T')[0];
    await updateDailyReport(userId.toString(), dateStr);

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error('CreateTask error:', error);
    res.status(500).json({ success: false, message: 'Failed to create task.' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const task = await Task.findOne({ _id: id, userId });
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found.' });
      return;
    }

    const allowedFields = ['title', 'description', 'priority', 'dueDate', 'completed'];
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    // Update daily report for the task's due date
    const dateStr = (updatedTask!.dueDate as Date).toISOString().split('T')[0];
    await updateDailyReport(userId.toString(), dateStr);

    // If due date changed, also update the old date's report
    if (req.body.dueDate && task.dueDate.toISOString() !== new Date(req.body.dueDate).toISOString()) {
      const oldDateStr = task.dueDate.toISOString().split('T')[0];
      await updateDailyReport(userId.toString(), oldDateStr);
    }

    res.json({ success: true, data: updatedTask });
  } catch (error) {
    console.error('UpdateTask error:', error);
    res.status(500).json({ success: false, message: 'Failed to update task.' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const task = await Task.findOne({ _id: id, userId });
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found.' });
      return;
    }

    await Task.findByIdAndDelete(id);

    const dateStr = task.dueDate.toISOString().split('T')[0];
    await updateDailyReport(userId.toString(), dateStr);

    res.json({ success: true, message: 'Task deleted.' });
  } catch (error) {
    console.error('DeleteTask error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete task.' });
  }
};

export const deleteCompletedTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const today = getTodayDateString();

    const result = await Task.deleteMany({ userId, completed: true });

    await updateDailyReport(userId.toString(), today);

    res.json({
      success: true,
      message: `Removed ${result.deletedCount} completed task(s).`,
      data: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    console.error('DeleteCompleted error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove completed tasks.' });
  }
};
