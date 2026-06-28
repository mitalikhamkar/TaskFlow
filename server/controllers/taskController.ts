//taskController.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Task from '../models/Task';
import Activity from '../models/Activity';
import { isMongoConnected } from '../config/db';
import { fallbackStore } from '../config/fallbackStore';

// @desc    Get all tasks for the logged-in user
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let tasks;
    if (isMongoConnected) {
      tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    } else {
      tasks = await fallbackStore.tasks.find({ user: req.user._id });
      // Sort in-memory tasks by createdAt descending
      tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    
    // Map _id to id for seamless frontend compatibility
    const formattedTasks = tasks.map((task) => ({
      id: isMongoConnected ? task._id.toString() : task._id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo || '',
      category: task.category,
    }));

    res.json(formattedTasks);
  } catch (error: any) {
    console.error('Fetch tasks error:', error.message);
    res.status(500).json({ error: 'Server error retrieving tasks' });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, category, priority, dueDate, assignedTo } = req.body;

    // Field-level validations
    if (!title || title.trim() === '') {
      res.status(400).json({ error: 'Task Title is required.' });
      return;
    }

    if (title.length > 200) {
      res.status(400).json({ error: 'Task Title must not exceed 200 characters.' });
      return;
    }

    if (!category || category.trim() === '') {
      res.status(400).json({ error: 'Category is required.' });
      return;
    }

    if (!dueDate || dueDate.trim() === '') {
      res.status(400).json({ error: 'Due Date is required.' });
      return;
    }

    const validPriorities = ['low', 'medium', 'high'];
    const selectedPriority = (priority || 'medium').toLowerCase();
    if (!validPriorities.includes(selectedPriority)) {
      res.status(400).json({ error: 'Priority must be one of: low, medium, high.' });
      return;
    }

    // Determine default status based on dueDate comparing to today
    const today = new Date().toISOString().split('T')[0];
    const initialStatus = dueDate < today ? 'overdue' : 'pending';

    let task;
    if (isMongoConnected) {
      // Create the task in database
      task = await Task.create({
        title: title.trim(),
        description: description || '',
        dueDate,
        status: initialStatus,
        priority: selectedPriority,
        assignedTo: assignedTo || '',
        category: category.trim(),
        user: req.user._id,
      });

      // Log Activity
      await Activity.create({
        user: req.user._id,
        action: 'Created task',
        taskTitle: title.trim(),
      });
    } else {
      // Create the task in in-memory fallback
      task = await fallbackStore.tasks.create({
        title: title.trim(),
        description: description || '',
        dueDate,
        status: initialStatus as any,
        priority: selectedPriority as any,
        assignedTo: assignedTo || '',
        category: category.trim(),
        user: req.user._id,
      });

      // Log Activity in fallback
      await fallbackStore.activities.create({
        user: req.user._id,
        action: 'Created task',
        taskTitle: title.trim(),
      });
    }

    res.status(201).json({
      id: isMongoConnected ? task._id.toString() : task._id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo || '',
      category: task.category,
    });
  } catch (error: any) {
    console.error('Create task error:', error.message);
    res.status(500).json({ error: 'Server error creating task' });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, category, priority, status, dueDate, assignedTo } = req.body;
    const { id } = req.params;

    let task;
    let updatedTask;

    if (isMongoConnected) {
      // Find the task
      task = await Task.findById(id);

      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      // Verify task belongs to the authenticated user
      if (task.user.toString() !== req.user._id.toString()) {
        res.status(403).json({ error: 'Unauthorized: You can only update your own tasks' });
        return;
      }

      const oldStatus = task.status;
      const oldTitle = task.title;

      // Update fields if provided
      if (title !== undefined) {
        if (title.trim() === '') {
          res.status(400).json({ error: 'Task Title is required.' });
          return;
        }
        task.title = title.trim();
      }

      if (description !== undefined) task.description = description;
      if (category !== undefined) task.category = category.trim();
      
      if (priority !== undefined) {
        const validPriorities = ['low', 'medium', 'high'];
        if (!validPriorities.includes(priority.toLowerCase())) {
          res.status(400).json({ error: 'Priority must be one of: low, medium, high.' });
          return;
        }
        task.priority = priority.toLowerCase() as any;
      }

      if (dueDate !== undefined) {
        task.dueDate = dueDate;
      }

      if (status !== undefined) {
        const validStatuses = ['pending', 'completed', 'overdue'];
        if (!validStatuses.includes(status.toLowerCase())) {
          res.status(400).json({ error: 'Status must be one of: pending, completed, overdue.' });
          return;
        }
        task.status = status.toLowerCase() as any;
      }

      // Re-evaluate overdue status if not completed and status was NOT explicitly provided
      if (status === undefined && task.status !== 'completed') {
        const today = new Date().toISOString().split('T')[0];
        task.status = task.dueDate < today ? 'overdue' : 'pending';
      }

      if (assignedTo !== undefined) task.assignedTo = assignedTo;

      updatedTask = await task.save();

      // Log Activity
      const actionType = status === 'completed' && oldStatus !== 'completed' ? 'Completed task' : 'Updated status';
      await Activity.create({
        user: req.user._id,
        action: actionType,
        taskTitle: updatedTask.title,
      });
    } else {
      // Fallback update
      task = await fallbackStore.tasks.findById(id);

      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      // Verify ownership
      if (task.user !== req.user._id) {
        res.status(403).json({ error: 'Unauthorized: You can only update your own tasks' });
        return;
      }

      const oldStatus = task.status;
      const oldTitle = task.title;

      if (title !== undefined) {
        if (title.trim() === '') {
          res.status(400).json({ error: 'Task Title is required.' });
          return;
        }
        task.title = title.trim();
      }

      if (description !== undefined) task.description = description;
      if (category !== undefined) task.category = category.trim();

      if (priority !== undefined) {
        const validPriorities = ['low', 'medium', 'high'];
        if (!validPriorities.includes(priority.toLowerCase())) {
          res.status(400).json({ error: 'Priority must be one of: low, medium, high.' });
          return;
        }
        task.priority = priority.toLowerCase() as any;
      }

      if (dueDate !== undefined) {
        task.dueDate = dueDate;
      }

      if (status !== undefined) {
        const validStatuses = ['pending', 'completed', 'overdue'];
        if (!validStatuses.includes(status.toLowerCase())) {
          res.status(400).json({ error: 'Status must be one of: pending, completed, overdue.' });
          return;
        }
        task.status = status.toLowerCase() as any;
      }

      // Re-evaluate overdue status if not completed and status was NOT explicitly provided
      if (status === undefined && task.status !== 'completed') {
        const today = new Date().toISOString().split('T')[0];
        task.status = task.dueDate < today ? 'overdue' : 'pending';
      }

      if (assignedTo !== undefined) task.assignedTo = assignedTo;

      updatedTask = await fallbackStore.tasks.save(task);

      // Log Activity in fallback
      const actionType = status === 'completed' && oldStatus !== 'completed' ? 'Completed task' : 'Updated status';
      await fallbackStore.activities.create({
        user: req.user._id,
        action: actionType,
        taskTitle: updatedTask.title,
      });
    }

    res.json({
      id: isMongoConnected ? updatedTask._id.toString() : updatedTask._id,
      title: updatedTask.title,
      description: updatedTask.description,
      dueDate: updatedTask.dueDate,
      status: updatedTask.status,
      priority: updatedTask.priority,
      assignedTo: updatedTask.assignedTo || '',
      category: updatedTask.category,
    });
  } catch (error: any) {
    console.error('Update task error:', error.message);
    res.status(500).json({ error: 'Server error updating task' });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isMongoConnected) {
      const task = await Task.findById(id);

      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      // Verify ownership
      if (task.user.toString() !== req.user._id.toString()) {
        res.status(403).json({ error: 'Unauthorized: You can only delete your own tasks' });
        return;
      }

      const taskTitle = task.title;
      await task.deleteOne();

      // Log Activity
      await Activity.create({
        user: req.user._id,
        action: 'Deleted',
        taskTitle,
      });
    } else {
      const task = await fallbackStore.tasks.findById(id);

      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      // Verify ownership
      if (task.user !== req.user._id) {
        res.status(403).json({ error: 'Unauthorized: You can only delete your own tasks' });
        return;
      }

      const taskTitle = task.title;
      await fallbackStore.tasks.deleteOne(id);

      // Log Activity in fallback
      await fallbackStore.activities.create({
        user: req.user._id,
        action: 'Deleted',
        taskTitle,
      });
    }

    res.json({ message: 'Task deleted successfully', id });
  } catch (error: any) {
    console.error('Delete task error:', error.message);
    res.status(500).json({ error: 'Server error deleting task' });
  }
};
