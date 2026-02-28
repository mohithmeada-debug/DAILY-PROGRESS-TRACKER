import express from 'express';
import { protect } from '../middleware/auth';
import {
    getGoals,
    createGoal,
    updateGoal,
    deleteGoal,
} from '../controllers/goalController';

const router = express.Router();

router.use(protect); // All routes are protected

router.route('/').get(getGoals).post(createGoal);
router.route('/:id').put(updateGoal).delete(deleteGoal);

export default router;
