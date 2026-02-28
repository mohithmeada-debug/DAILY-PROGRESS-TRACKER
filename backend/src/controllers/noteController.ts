import { Request, Response } from 'express';
import Note from '../models/Note';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all notes for user
// @route   GET /api/notes
// @access  Private
export const getNotes = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const notes = await Note.find({ userId: req.user?._id }).sort({ date: -1, createdAt: -1 });
        res.json(notes);
    } catch (error) {
        console.error('Error in getNotes:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get note for specific date
// @route   GET /api/notes/date/:date
// @access  Private
export const getNoteByDate = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const notes = await Note.find({
            userId: req.user?._id,
            date: req.params.date
        }).sort({ createdAt: -1 });

        res.json(notes);
    } catch (error) {
        console.error('Error in getNoteByDate:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a note
// @route   POST /api/notes
// @access  Private
export const createNote = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { content, date } = req.body;

        if (!content || !date) {
            res.status(400).json({ message: 'Please provide content and date' });
            return;
        }

        const note = await Note.create({
            content,
            date,
            userId: req.user?._id,
        });

        res.status(201).json(note);
    } catch (error) {
        console.error('Error in createNote:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
export const updateNote = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            res.status(404).json({ message: 'Note not found' });
            return;
        }

        // Check user
        if (note.userId.toString() !== req.user?._id.toString()) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }

        const updatedNote = await Note.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedNote);
    } catch (error) {
        console.error('Error in updateNote:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteNote = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            res.status(404).json({ message: 'Note not found' });
            return;
        }

        // Check user
        if (note.userId.toString() !== req.user?._id.toString()) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }

        await note.deleteOne();
        res.json({ id: req.params.id });
    } catch (error) {
        console.error('Error in deleteNote:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
