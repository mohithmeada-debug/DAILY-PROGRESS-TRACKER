import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  deleteCompletedTasks,
} from '../controllers/taskController';

const router = Router();

// All task routes are protected
router.use(protect);

router.get('/', getTasks);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('dueDate').notEmpty().withMessage('Due date is required'),
    body('priority')
      .optional()
      .isIn(['Low', 'Medium', 'High'])
      .withMessage('Priority must be Low, Medium, or High'),
  ],
  createTask
);

// DELETE completed must come before /:id to avoid route conflict
router.delete('/completed', deleteCompletedTasks);

router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
