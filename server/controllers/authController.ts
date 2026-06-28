//authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { isMongoConnected } from '../config/db';
import { fallbackStore } from '../config/fallbackStore';

// Helper to generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super-secret-jwt-key-for-taskflow-enterprise', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, confirmPassword, avatar } = req.body;

    // Field-level validations
    if (!name || name.trim().length < 3) {
      res.status(400).json({ error: 'Full Name is required and must be at least 3 characters long.' });
      return;
    }

    if (!email) {
      res.status(400).json({ error: 'Email address is required.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Please enter a valid email format.' });
      return;
    }

    if (!password) {
      res.status(400).json({ error: 'Password is required.' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      return;
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      res.status(400).json({ 
        error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number.' 
      });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }

    // Check if user already exists
    const emailLower = email.trim().toLowerCase();
    let userExists;
    if (isMongoConnected) {
      userExists = await User.findOne({ email: emailLower });
    } else {
      userExists = await fallbackStore.users.findOne({ email: emailLower });
    }

    if (userExists) {
      res.status(400).json({ error: 'User with this email already exists.' });
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Default avatar if none provided (empty string triggers initials avatar)
    const defaultAvatar = avatar || '';

    let user;
    if (isMongoConnected) {
      // Create the user in MongoDB
      user = await User.create({
        name,
        email: emailLower,
        passwordHash,
        avatar: defaultAvatar,
        role: 'Collaborator',
        bio: 'New TaskFlow account. Excited to collaborate and manage projects efficiently!',
        dob: '',
        contact: '',
      });
    } else {
      // Create the user in fallback store
      user = await fallbackStore.users.create({
        name,
        email: emailLower,
        passwordHash,
        avatar: defaultAvatar,
        role: 'Collaborator',
        bio: 'New TaskFlow account. Excited to collaborate and manage projects efficiently!',
        dob: '',
        contact: '',
      });
    }

    if (user) {
      const idStr = isMongoConnected ? user._id.toString() : user._id;
      const token = generateToken(String(user._id));
      res.status(201).json({
        token,
        user: {
          id: idStr,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          bio: user.bio,
          dob: user.dob || '',
          contact: user.contact || '',
          age: user.age || '',
          company: user.company || '',
          designation: user.designation || '',
          address: user.address || '',
          createdAt: user.createdAt,
        },
      });
    } else {
      res.status(400).json({ error: 'Invalid user data received' });
    }
  } catch (error: any) {
    console.error('Registration error:', error.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validations
    if (!email) {
      res.status(400).json({ error: 'Email address is required.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Please enter a valid email format.' });
      return;
    }

    if (!password) {
      res.status(400).json({ error: 'Password is required.' });
      return;
    }

    // Check if user exists
    const emailLower = email.trim().toLowerCase();
    let user;
    if (isMongoConnected) {
      user = await User.findOne({ email: emailLower });
    } else {
      user = await fallbackStore.users.findOne({ email: emailLower });
    }

    if (!user) {
      res.status(401).json({ error: 'Invalid email or credentials.' });
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or credentials.' });
      return;
    }

    const idStr = isMongoConnected ? user._id.toString() : user._id;
    const token = generateToken(String(user._id));
    res.json({
      token,
      user: {
        id: idStr,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        bio: user.bio,
        dob: user.dob || '',
        contact: user.contact || '',
        age: user.age || '',
        company: user.company || '',
        designation: user.designation || '',
        address: user.address || '',
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// @desc    Get authenticated user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let user;
    if (isMongoConnected) {
      user = await User.findById(req.user._id).select('-passwordHash');
    } else {
      user = await fallbackStore.users.findById(req.user._id);
    }

    if (user) {
      const idStr = isMongoConnected ? user._id.toString() : user._id;
      res.json({
        id: idStr,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        bio: user.bio,
        dob: user.dob || '',
        contact: user.contact || '',
        age: user.age || '',
        company: user.company || '',
        designation: user.designation || '',
        address: user.address || '',
        createdAt: user.createdAt,
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error: any) {
    console.error('Profile retrieval error:', error.message);
    res.status(500).json({ error: 'Server error retrieving profile' });
  }
};

// @desc    Update authenticated user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let user;
    let updatedUser;

    if (isMongoConnected) {
      user = await User.findById(req.user._id);
      if (user) {
        user.name = req.body.name !== undefined ? req.body.name : user.name;
        user.email = req.body.email !== undefined ? req.body.email : user.email;
        user.role = req.body.role !== undefined ? req.body.role : user.role;
        user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
        user.dob = req.body.dob !== undefined ? req.body.dob : user.dob;
        user.contact = req.body.contact !== undefined ? req.body.contact : user.contact;
        user.age = req.body.age !== undefined ? req.body.age : user.age;
        user.company = req.body.company !== undefined ? req.body.company : user.company;
        user.designation = req.body.designation !== undefined ? req.body.designation : user.designation;
        user.address = req.body.address !== undefined ? req.body.address : user.address;
        if (req.body.avatar !== undefined) {
          user.avatar = req.body.avatar;
        }
        updatedUser = await user.save();
      }
    } else {
      user = await fallbackStore.users.findById(req.user._id);
      if (user) {
        user.name = req.body.name !== undefined ? req.body.name : user.name;
        user.email = req.body.email !== undefined ? req.body.email : user.email;
        user.role = req.body.role !== undefined ? req.body.role : user.role;
        user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
        user.dob = req.body.dob !== undefined ? req.body.dob : user.dob;
        user.contact = req.body.contact !== undefined ? req.body.contact : user.contact;
        user.age = req.body.age !== undefined ? req.body.age : user.age;
        user.company = req.body.company !== undefined ? req.body.company : user.company;
        user.designation = req.body.designation !== undefined ? req.body.designation : user.designation;
        user.address = req.body.address !== undefined ? req.body.address : user.address;
        if (req.body.avatar !== undefined) {
          user.avatar = req.body.avatar;
        }
        updatedUser = await fallbackStore.users.save(user);
      }
    }

    if (updatedUser) {
      const idStr = isMongoConnected ? updatedUser._id.toString() : updatedUser._id;
      res.json({
        id: idStr,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        bio: updatedUser.bio,
        dob: updatedUser.dob || '',
        contact: updatedUser.contact || '',
        age: updatedUser.age || '',
        company: updatedUser.company || '',
        designation: updatedUser.designation || '',
        address: updatedUser.address || '',
        createdAt: updatedUser.createdAt,
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error: any) {
    console.error('Profile update error:', error.message);
    res.status(500).json({ error: 'Server error updating profile' });
  }
};
