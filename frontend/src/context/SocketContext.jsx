import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { APP_CONFIG } from '../config/constants';

const SocketContext = createContext(null);

function getSocketUrl() {
  const base = APP_CONFIG.apiBaseUrl || '/api';
  const u = base.replace(/\/api\/?$/, '');
  return u || window.location.origin;
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  const connect = useCallback((token, branchId) => {
    if (!token) return;
    if (socketRef.current) socketRef.current.disconnect();
    const url = getSocketUrl();
    const s = io(url, {
      auth: { token, branchId: branchId || undefined },
      transports: ['websocket', 'polling'],
    });
    s.on('connect', () => setConnected(true));
    s.on('disconnect', (reason) => {
      setConnected(false);
      if (reason === 'io server disconnect') s.connect();
    });
    s.on('connect_error', () => setConnected(false));
    socketRef.current = s;
    setSocket(s);
    return s;
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setSocket(null);
    setConnected(false);
  }, []);

  const on = useCallback((event, handler) => {
    const s = socketRef.current;
    if (s) s.on(event, handler);
  }, []);

  const off = useCallback((event, handler) => {
    const s = socketRef.current;
    if (s) {
      if (handler) s.off(event, handler);
      else s.off(event);
    }
  }, []);

  const value = {
    socket,
    connected,
    connect,
    disconnect,
    on,
    off,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
