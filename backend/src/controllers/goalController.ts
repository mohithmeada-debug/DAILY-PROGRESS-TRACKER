import { Request, Response } from 'express';
import Goal from '../models/Goal';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all goals for user
// @route   GET /api/goals
// @access  Private
export const getGoals = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const goals = await Goal.find({ userId: req.user?._id }).sort({ createdAt: -1 });
        res.json(goals);
    } catch (error) {
        console.error('Error in getGoals:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a goal
// @route   POST /api/goals
// @access  Private
export const createGoal = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, targetDate, progressPercentage } = req.body;

        if (!title || !targetDate) {
            res.status(400).json({ message: 'Please provide title and target date' });
            return;
        }

        const goal = await Goal.create({
            title,
            targetDate,
            progressPercentage: progressPercentage || 0,
            userId: req.user?._id,
        });

        res.status(201).json(goal);
    } catch (error) {
        console.error('Error in createGoal:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a goal
// @route   PUT /api/goals/:id
// @access  Private
export const updateGoal = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const goal = await Goal.findById(req.params.id);

        if (!goal) {
            res.status(404).json({ message: 'Goal not found' });
            return;
        }

        // Check user
        if (goal.userId.toString() !== req.user?._id.toString()) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }

        const updatedGoal = await Goal.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedGoal);
    } catch (error) {
        console.error('Error in updateGoal:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
export const deleteGoal = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const goal = await Goal.findById(req.params.id);

        if (!goal) {
            res.status(404).json({ message: 'Goal not found' });
            return;
        }

        // Check user
        if (goal.userId.toString() !== req.user?._id.toString()) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }

        await goal.deleteOne();
        res.json({ id: req.params.id });
    } catch (error) {
        console.error('Error in deleteGoal:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
