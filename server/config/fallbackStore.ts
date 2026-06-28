import mongoose from 'mongoose';

export interface IFallbackUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar: string;
  role: string;
  bio: string;
  dob: string;
  contact: string;
  age: string;
  company: string;
  designation: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFallbackTask {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  category: string;
  user: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

export interface IFallbackActivity {
  _id: string;
  user: string;
  action: string;
  taskTitle: string;
  createdAt: Date;
}

// In-memory collections
const users: IFallbackUser[] = [];
const tasks: IFallbackTask[] = [];
const activities: IFallbackActivity[] = [];

export const fallbackStore = {
  // User operations
  users: {
    async findOne(filter: { email?: string }): Promise<IFallbackUser | null> {
      if (filter.email) {
        const emailLower = filter.email.toLowerCase();
        return users.find((u) => u.email.toLowerCase() === emailLower) || null;
      }
      return null;
    },

    async findById(id: string): Promise<IFallbackUser | null> {
      return users.find((u) => u._id === id) || null;
    },

    async create(userData: Partial<IFallbackUser>): Promise<IFallbackUser> {
      const newUser: IFallbackUser = {
        _id: new mongoose.Types.ObjectId().toString(),
        name: userData.name || '',
        email: (userData.email || '').toLowerCase(),
        passwordHash: userData.passwordHash || '',
        avatar: userData.avatar || '',
        role: userData.role || 'Collaborator',
        bio: userData.bio || 'New TaskFlow account.',
        dob: userData.dob || '',
        contact: userData.contact || '',
        age: userData.age || '',
        company: userData.company || '',
        designation: userData.designation || '',
        address: userData.address || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.push(newUser);
      return newUser;
    },

    async save(user: IFallbackUser): Promise<IFallbackUser> {
      const idx = users.findIndex((u) => u._id === user._id);
      user.updatedAt = new Date();
      if (idx !== -1) {
        users[idx] = user;
      } else {
        users.push(user);
      }
      return user;
    }
  },

  // Task operations
  tasks: {
    async find(filter: { user?: string }): Promise<IFallbackTask[]> {
      let filtered = [...tasks];
      if (filter.user) {
        filtered = filtered.filter((t) => t.user === filter.user);
      }
      return filtered;
    },

    async findById(id: string): Promise<IFallbackTask | null> {
      return tasks.find((t) => t._id === id) || null;
    },

    async create(taskData: Partial<IFallbackTask>): Promise<IFallbackTask> {
      const newTask: IFallbackTask = {
        _id: new mongoose.Types.ObjectId().toString(),
        title: taskData.title || '',
        description: taskData.description || '',
        dueDate: taskData.dueDate || '',
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
        assignedTo: taskData.assignedTo || '',
        category: taskData.category || '',
        user: taskData.user || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      tasks.push(newTask);
      return newTask;
    },

    async save(task: IFallbackTask): Promise<IFallbackTask> {
      const idx = tasks.findIndex((t) => t._id === task._id);
      task.updatedAt = new Date();
      if (idx !== -1) {
        tasks[idx] = task;
      } else {
        tasks.push(task);
      }
      return task;
    },

    async deleteOne(id: string): Promise<boolean> {
      const idx = tasks.findIndex((t) => t._id === id);
      if (idx !== -1) {
        tasks.splice(idx, 1);
        return true;
      }
      return false;
    }
  },
  activities: {
    async find(filter: { user?: string }): Promise<IFallbackActivity[]> {
      let filtered = [...activities];
      if (filter.user) {
        filtered = filtered.filter((a) => a.user === filter.user);
      }
      return filtered;
    },
    async create(activityData: Partial<IFallbackActivity>): Promise<IFallbackActivity> {
      const newActivity: IFallbackActivity = {
        _id: new mongoose.Types.ObjectId().toString(),
        user: activityData.user || '',
        action: activityData.action || '',
        taskTitle: activityData.taskTitle || '',
        createdAt: new Date(),
      };
      activities.push(newActivity);
      return newActivity;
    }
  }
};
