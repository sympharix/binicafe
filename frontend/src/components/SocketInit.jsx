import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { APP_CONFIG } from '../config/constants';

export default function SocketInit() {
  const { token, branchId, isAuthenticated } = useAuth();
  const { connect, disconnect } = useSocket();
  const connectedRef = useRef(false);

  useEffect(() => {
    if (APP_CONFIG.mockMode) return; // No socket in mock/demo mode
    if (isAuthenticated && token) {
      connect(token, branchId);
      connectedRef.current = true;
    } else {
      disconnect();
      connectedRef.current = false;
    }
    return () => {
      disconnect();
      connectedRef.current = false;
    };
  }, [isAuthenticated, token, branchId, connect, disconnect]);

  return null;
}
