import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { authApi, branchesApi } from '../lib/api';
import { APP_CONFIG } from '../config/constants';
import { toast } from 'sonner';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('WAITER');
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const branchRequired = role === 'WAITER' || role === 'KITCHEN';
  const passwordStrength = password.length < 6 ? 'weak' : password.length < 10 ? 'ok' : 'strong';
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    branchesApi.list().then((res) => setBranches(res.data ?? [])).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (branchRequired && !branchId) {
      setError('Branch is required for Waiter and Kitchen roles');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register({
        email,
        password,
        confirmPassword,
        name: name.trim(),
        role,
        branchId: branchId || undefined,
      });
      const user = res.user ?? res;
      const token = res.token;
      if (token) {
        login(user, token);
        toast.success('Account created');
        navigate('/', { replace: true });
      } else {
        toast.success('Account created. Please sign in.');
        navigate('/login', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
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
          <h2 className="text-lg font-semibold text-white mb-6">Create account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
            <Input
              label="Password (min 6 characters)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            {password.length > 0 && (
              <div className="flex gap-1">
                <div
                  className={`h-1 flex-1 rounded-full ${
                    passwordStrength === 'weak' ? 'bg-red-500' : 'bg-white/10'
                  }`}
                />
                <div
                  className={`h-1 flex-1 rounded-full ${
                    passwordStrength === 'ok' ? 'bg-amber-500' : passwordStrength === 'strong' ? 'bg-emerald-500' : 'bg-white/10'
                  }`}
                />
                <div
                  className={`h-1 flex-1 rounded-full ${
                    passwordStrength === 'strong' ? 'bg-emerald-500' : 'bg-white/10'
                  }`}
                />
              </div>
            )}
            <Input
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your full name"
            />
            <div>
              <label className="block text-sm font-medium text-rms-muted mb-1.5">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-rms-border bg-rms-dark py-2.5 px-4 text-white focus:border-rms-amber/50 focus:outline-none"
              >
                <option value="WAITER">Waiter</option>
                <option value="KITCHEN">Kitchen</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            {(branches.length > 0 || branchRequired) && (
              <div>
                <label className="block text-sm font-medium text-rms-muted mb-1.5">
                  Branch {branchRequired && <span className="text-amber-400">*</span>}
                </label>
                {branches.length > 0 ? (
                  <>
                    <select
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                      required={branchRequired}
                      className="w-full rounded-xl border border-rms-border bg-rms-dark py-2.5 px-4 text-white focus:border-rms-amber/50 focus:outline-none"
                    >
                      <option value="">Select branch</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                    {branchRequired && (
                      <p className="mt-1 text-xs text-rms-muted">Required for Waiter and Kitchen roles</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-amber-200/90">No branches available. Contact admin to create a branch first.</p>
                )}
              </div>
            )}
            <Button type="submit" size="md" className="w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create account'}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-rms-muted">
          Already have an account? <Link to="/login" className="text-rms-amber hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
