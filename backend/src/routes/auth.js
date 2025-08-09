import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';

const router = express.Router();

router.get('/login', (req, res) => {
  res.send({ success: true, message: 'Login route working ✅' });
});

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'madagascar-secret-key-2024');
    const user = await User.findById(decoded.user_id);
    if (!user) {
      return res.status(403).json({ success: false, message: 'Invalid token - user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const authRateLimit = {
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
};

export default router;
