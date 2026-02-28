import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getDailyReport, getWeeklyReport, getStreak } from '../controllers/reportController';

const router = Router();

router.use(protect);

router.get('/daily', getDailyReport);
router.get('/weekly', getWeeklyReport);
router.get('/streak', getStreak);

export default router;
