import express from 'express';
import { protect } from '../middleware/auth';
import {
    getNotes,
    getNoteByDate,
    createNote,
    updateNote,
    deleteNote,
} from '../controllers/noteController';

const router = express.Router();

router.use(protect);

router.route('/').get(getNotes).post(createNote);
router.route('/date/:date').get(getNoteByDate);
router.route('/:id').put(updateNote).delete(deleteNote);

export default router;
