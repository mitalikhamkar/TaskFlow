import express from 'express';
import { protect } from '../middleware/auth';
import { getActivities } from '../controllers/activityController';

const router = express.Router();

router.get('/', protect, getActivities);

export default router;
