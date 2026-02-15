import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../lib/api';
import { APP_CONFIG } from '../config/constants';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const user = res.user ?? res;
      const token = res.token;
      if (!token) throw new Error('No token received');
      login(user, token);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-rms-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rms-amber/15 text-rms-amber mb-4">
            <UtensilsCrossed className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">{APP_CONFIG.name}</h1>
          <p className="text-rms-muted mt-1">{APP_CONFIG.tagline}</p>
        </div>

        <div className="rounded-2xl border border-rms-border bg-rms-panel/80 backdrop-blur-xl p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Sign in</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-rms-muted mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-rms-border bg-rms-dark py-2.5 px-4 text-white placeholder-rms-muted focus:border-rms-amber/50 focus:outline-none focus:ring-2 focus:ring-rms-amber/20"
                placeholder="admin@rms.local"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-rms-muted mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-rms-border bg-rms-dark py-2.5 px-4 text-white placeholder-rms-muted focus:border-rms-amber/50 focus:outline-none focus:ring-2 focus:ring-rms-amber/20"
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              size="md"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-rms-muted">
            Demo: admin@rms.local / admin123
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-rms-muted">
          Don&apos;t have an account? <Link to="/register" className="text-rms-amber hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
