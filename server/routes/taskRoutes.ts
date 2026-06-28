//taskRouts.ts
import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Apply the protect middleware to all routes below
router.use(protect as any);

router.route('/')
  .get(getTasks as any)
  .post(createTask as any);

router.route('/:id')
  .put(updateTask as any)
  .delete(deleteTask as any);

export default router;
