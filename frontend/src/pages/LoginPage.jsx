import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Spinner, Icon, ICONS } from '../components/UI';

function validate(form) {
  const e = {};
  if (!form.email.trim()) e.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
  if (!form.password) e.password = 'Password is required';
  return e;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setApiError('');
    try {
      const data = await authApi.login({ email: form.email.toLowerCase(), password: form.password });
      login(data.access_token, { id: data.user_id, name: data.name, email: data.email });
      navigate('/dashboard');
    } catch (err) {
      setApiError(err?.response?.data?.detail || 'Login failed — check credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg0)', padding: 16,
    }}>
      {/* Subtle grid background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.025,
        backgroundImage: 'linear-gradient(var(--text0) 1px, transparent 1px), linear-gradient(90deg, var(--text0) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon d={ICONS.cpu} size={16} color="var(--accent)" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text0)' }}>CS Student OS</p>
            <p style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>
              Bilvarchitha Edition
            </p>
          </div>
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text0)', marginBottom: 6 }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text1)', marginBottom: 28 }}>
          Log in to continue your preparation
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field">
            <label className="field-label">Email</label>
            <input
              className={`input ${errors.email ? 'error' : ''}`}
              type="email"
              placeholder="you@university.edu"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="field">
            <label className="field-label">Password</label>
            <input
              className={`input ${errors.password ? 'error' : ''}`}
              type="password"
              placeholder="Your password"
              value={form.password}
              onChange={set('password')}
              autoComplete="current-password"
            />
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          {apiError && (
            <div className="alert-err" style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>
              {apiError}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ marginTop: 4 }}
            disabled={loading}
          >
            {loading ? <Spinner size={16} color="var(--bg0)" /> : null}
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text2)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--accent)' }}>Sign up</Link>
        </p>

        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
          API → http://127.0.0.1:8000
        </p>
      </div>
    </div>
  );
}
