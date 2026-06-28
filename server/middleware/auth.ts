import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { isMongoConnected } from '../config/db';
import { fallbackStore } from '../config/fallbackStore';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ error: 'Not authorized, no token provided' });
      return;
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-jwt-key-for-taskflow-enterprise');

    let user;
    if (isMongoConnected) {
      user = await User.findById(decoded.id).select('-passwordHash');
    } else {
      const fbUser = await fallbackStore.users.findById(decoded.id);
      if (fbUser) {
        user = {
          _id: fbUser._id,
          name: fbUser.name,
          email: fbUser.email,
          avatar: fbUser.avatar,
          role: fbUser.role,
          bio: fbUser.bio,
          dob: fbUser.dob || '',
          contact: fbUser.contact || '',
          createdAt: fbUser.createdAt,
        };
      }
    }

    if (!user) {
      res.status(401).json({ error: 'User not found or authorization failed' });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ error: 'Not authorized, token failed' });
  }
};
