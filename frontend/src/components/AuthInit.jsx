import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { setApiToken } from '../lib/api';

export default function AuthInit() {
  const { token } = useAuth();

  useEffect(() => {
    setApiToken(() => token ?? null);
  }, [token]);

  return null;
}
