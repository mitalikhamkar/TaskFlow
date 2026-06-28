//authRoutes.ts
import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/profile')
  .get(protect as any, getUserProfile as any)
  .put(protect as any, updateUserProfile as any);

export default router;
