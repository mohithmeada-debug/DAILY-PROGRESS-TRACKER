import express from 'express';
import { protect } from '../middleware/auth';
import {
    getMoods,
    getMoodByDate,
    setMood,
} from '../controllers/moodController';

const router = express.Router();

router.use(protect);

router.route('/').get(getMoods).post(setMood);
router.route('/date/:date').get(getMoodByDate);

export default router;
