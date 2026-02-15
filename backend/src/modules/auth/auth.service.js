import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../db/prisma.js';
import { config } from '../../config/index.js';
import { AppError } from '../../utils/errors.js';
const SALT_ROUNDS = 10;

export const authService = {
  async register({ email, password, name, role = 'WAITER', branchId }) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email already registered', 400);
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { email, password: hashed, name, role, branchId },
      select: { id: true, email: true, name: true, role: true, branchId: true, createdAt: true },
    });
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    return { user, token };
  },

  async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('Invalid email or password', 401);
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError('Invalid email or password', 401);
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        branchId: user.branchId,
      },
      token,
    };
  },

  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, branchId: true, createdAt: true },
      include: { branch: { select: { id: true, name: true } } },
    });
    if (!user) throw new AppError('User not found', 404);
    return user;
  },
};
