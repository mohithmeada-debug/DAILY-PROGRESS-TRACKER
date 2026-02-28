import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import Habit from '../models/Habit';
import HabitEntry from '../models/HabitEntry';

export const getHabits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const habits = await Habit.find({ userId }).sort({ createdAt: 1 });
    res.json({ success: true, data: habits });
  } catch (error) {
    console.error('GetHabits error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch habits.' });
  }
};

export const createHabit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, message: errors.array()[0].msg });
      return;
    }

    const userId = req.user!._id;
    const { name } = req.body;

    const existing = await Habit.findOne({ userId, name: name.trim() });
    if (existing) {
      res
        .status(400)
        .json({ success: false, message: 'You already track this habit.' });
      return;
    }

    const habit = await Habit.create({ name: name.trim(), userId });
    res.status(201).json({ success: true, data: habit });
  } catch (error) {
    console.error('CreateHabit error:', error);
    res.status(500).json({ success: false, message: 'Failed to create habit.' });
  }
};

export const deleteHabit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const habit = await Habit.findOne({ _id: id, userId });
    if (!habit) {
      res.status(404).json({ success: false, message: 'Habit not found.' });
      return;
    }

    await HabitEntry.deleteMany({ userId, habitId: id });
    await Habit.findByIdAndDelete(id);

    res.json({ success: true, message: 'Habit deleted.' });
  } catch (error) {
    console.error('DeleteHabit error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete habit.' });
  }
};

export const getMonthlyHabits = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { month } = req.params; // YYYY-MM

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      res.status(400).json({
        success: false,
        message: 'Month must be in YYYY-MM format.',
      });
      return;
    }

    const [yearStr, monthStr] = month.split('-');
    const year = Number(yearStr);
    const monthIndex = Number(monthStr) - 1;
    const start = new Date(year, monthIndex, 1);
    const end = new Date(year, monthIndex + 1, 0);

    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];

    const habits = await Habit.find({ userId }).sort({ createdAt: 1 });
    const entries = await HabitEntry.find({
      userId,
      date: { $gte: startDateStr, $lte: endDateStr },
    });

    res.json({
      success: true,
      data: {
        habits,
        entries,
        month,
      },
    });
  } catch (error) {
    console.error('GetMonthlyHabits error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch monthly habits.' });
  }
};

export const upsertHabitEntry = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, message: errors.array()[0].msg });
      return;
    }

    const userId = req.user!._id;
    const { habitId, date, completed } = req.body as {
      habitId: string;
      date: string;
      completed: boolean;
    };

    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) {
      res.status(404).json({ success: false, message: 'Habit not found.' });
      return;
    }

    const entry = await HabitEntry.findOneAndUpdate(
      { userId, habitId, date },
      { completed },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, data: entry });
  } catch (error) {
    console.error('UpsertHabitEntry error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to update habit entry.' });
  }
};

