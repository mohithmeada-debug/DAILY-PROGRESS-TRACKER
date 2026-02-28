import { Router } from 'express';
import { body, param } from 'express-validator';
import { protect } from '../middleware/auth';
import {
  getHabits,
  createHabit,
  deleteHabit,
  getMonthlyHabits,
} from '../controllers/habitController';

const router = Router();

router.use(protect);

router.get('/', getHabits);

router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Habit name is required')],
  createHabit
);

router.delete('/:id', deleteHabit);

router.get(
  '/month/:month',
  [param('month').matches(/^\d{4}-\d{2}$/)],
  getMonthlyHabits
);

export default router;

