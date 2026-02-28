import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import { upsertHabitEntry } from '../controllers/habitController';

const router = Router();

router.use(protect);

const validators = [
  body('habitId').notEmpty().withMessage('Habit ID is required'),
  body('date')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
  body('completed').isBoolean().withMessage('Completed flag must be boolean'),
];

router.post('/', validators, upsertHabitEntry);
router.put('/', validators, upsertHabitEntry);

export default router;

