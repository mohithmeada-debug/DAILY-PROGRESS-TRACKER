import { Request, Response } from 'express';
import Mood from '../models/Mood';
import { AuthRequest } from '../middleware/auth';

// @desc    Get mood history
// @route   GET /api/moods
// @access  Private
export const getMoods = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const moods = await Mood.find({ userId: req.user?._id }).sort({ date: -1 });
        res.json(moods);
    } catch (error) {
        console.error('Error in getMoods:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get mood for specific date
// @route   GET /api/moods/date/:date
// @access  Private
export const getMoodByDate = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const mood = await Mood.findOne({
            userId: req.user?._id,
            date: req.params.date
        });

        if (!mood) {
            res.status(404).json({ message: 'Mood not found for this date' });
            return;
        }

        res.json(mood);
    } catch (error) {
        console.error('Error in getMoodByDate:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Set mood for a date (Create or Update)
// @route   POST /api/moods
// @access  Private
export const setMood = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { value, date } = req.body;

        if (!value || !date) {
            res.status(400).json({ message: 'Please provide mood value and date' });
            return;
        }

        // Upsert mood for the day
        const mood = await Mood.findOneAndUpdate(
            { userId: req.user?._id, date },
            { value, date, userId: req.user?._id },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json(mood);
    } catch (error) {
        console.error('Error in setMood:', error);
        if ((error as any).code === 11000) {
            res.status(400).json({ message: 'Mood already exists for this date. Update instead.' });
        } else {
            res.status(500).json({ message: 'Server Error' });
        }
    }
};
