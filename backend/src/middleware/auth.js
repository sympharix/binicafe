import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { prisma } from '../db/prisma.js';
import { AppError } from '../utils/errors.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    throw new AppError('Authentication required', 401);
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.userId = decoded.userId;
    req.tokenPayload = decoded;
    next();
  } catch (e) {
    throw new AppError('Invalid or expired token', 401);
  }
}

export async function attachUser(req, res, next) {
  if (!req.userId) return next();
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, role: true, branchId: true },
    });
    req.user = user;
    next();
  } catch (e) {
    next(e);
  }
}

export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) throw new AppError('Authentication required', 401);
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError('Insufficient permissions', 403);
    }
    next();
  };
}

