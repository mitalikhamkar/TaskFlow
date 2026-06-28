import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Activity from '../models/Activity';
import { isMongoConnected } from '../config/db';
import { fallbackStore } from '../config/fallbackStore';

// @desc    Get user activities
// @route   GET /api/activities
// @access  Private
export const getActivities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let activitiesList = [];

    if (isMongoConnected) {
      activitiesList = await Activity.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(30);
    } else {
      const all = await fallbackStore.activities.find({ user: req.user._id.toString() });
      activitiesList = all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 30);
    }

    res.json(
      activitiesList.map((act: any) => ({
        id: isMongoConnected ? act._id.toString() : act._id,
        action: act.action,
        taskTitle: act.taskTitle,
        createdAt: act.createdAt,
      }))
    );
  } catch (error: any) {
    console.error('Fetch activities error:', error.message);
    res.status(500).json({ error: 'Server error fetching activities' });
  }
};
