import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;

// Get JWT secrets with fallbacks - evaluated lazily to ensure dotenv is loaded
function getJwtAccessSecret() {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'your-secret-access-token-key-change-in-production';
  return secret;
}

function getJwtRefreshSecret() {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-secret-refresh-token-key-change-in-production';
  return secret;
}

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(payload) {
  const secret = getJwtAccessSecret();
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET is not configured');
  }
  return jwt.sign(payload, secret, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' });
}

export function signRefreshToken(payload) {
  const secret = getJwtRefreshSecret();
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not configured');
  }
  return jwt.sign(payload, secret, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' });
}

export function verifyToken(token, secret) {
  if (!secret) {
    throw new Error('JWT secret is required for token verification');
  }
  return jwt.verify(token, secret);
}

// Auth middleware to protect routes
export default function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const secret = getJwtAccessSecret();
    if (!secret) {
      return res.status(500).json({ success: false, message: 'JWT secret not configured' });
    }

    const decoded = verifyToken(token, secret);
    req.user = decoded; // Attach user info to request
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}
