/**
 * Real-Time Event Engine — Socket.IO
 * Emits events to branch rooms for live updates.
 */

import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

let io = null;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: config.cors?.origins || '*', credentials: true },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      socket.userId = decoded.userId;
      socket.role = decoded.role;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const branchId = socket.handshake.auth?.branchId;
    if (branchId) {
      socket.join(`branch:${branchId}`);
      socket.branchId = branchId;
    }
    socket.on('join:branch', (id) => {
      if (id) socket.join(`branch:${id}`);
    });
    socket.on('leave:branch', (id) => {
      if (id) socket.leave(`branch:${id}`);
    });
    socket.on('disconnect', () => {});
  });

  return io;
}

export function getIO() {
  return io;
}

/**
 * Emit event to a branch room. Call from services after mutations.
 */
export function emitToBranch(branchId, event, data) {
  if (io && branchId) {
    io.to(`branch:${branchId}`).emit(event, data);
  }
}

/**
 * Emit to all branches (e.g. admin dashboard). Use sparingly.
 */
export function emitToAll(event, data) {
  if (io) {
    io.emit(event, data);
  }
}
