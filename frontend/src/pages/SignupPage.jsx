import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Spinner, Icon, ICONS } from '../components/UI';

function validate(form) {
  const e = {};
  if (!form.name.trim()) e.name = 'Name is required';
  if (!form.email.trim()) e.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
  if (!form.password) e.password = 'Password is required';
  else if (form.password.length < 8) e.password = 'Minimum 8 characters';
  if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match';
  return e;
}

const FIELDS = [
  { key: 'name',             label: 'Full Name',        type: 'text',     placeholder: 'Your full name',        autoComplete: 'name' },
  { key: 'email',            label: 'Email',            type: 'email',    placeholder: 'you@university.edu',    autoComplete: 'email' },
  { key: 'password',         label: 'Password',         type: 'password', placeholder: 'Min 8 characters',      autoComplete: 'new-password' },
  { key: 'confirm_password', label: 'Confirm Password', type: 'password', placeholder: 'Repeat your password',  autoComplete: 'new-password' },
];

export default function SignupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm_password: '' });
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
      const data = await authApi.signup({ ...form, email: form.email.toLowerCase() });
      login(data.access_token, { id: data.user_id, name: data.name, email: data.email });
      navigate('/dashboard');
    } catch (err) {
      setApiError(err?.response?.data?.detail || 'Signup failed — try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg0)', padding: 16,
    }}>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.025,
        backgroundImage: 'linear-gradient(var(--text0) 1px, transparent 1px), linear-gradient(90deg, var(--text0) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
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
            <p style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>Bilvarchitha Edition</p>
          </div>
        </div>

        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text0)', marginBottom: 6 }}>
          Create account
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text1)', marginBottom: 28 }}>
          Start your placement preparation today
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {FIELDS.map(({ key, label, type, placeholder, autoComplete }) => (
            <div key={key} className="field">
              <label className="field-label">{label}</label>
              <input
                className={`input ${errors[key] ? 'error' : ''}`}
                type={type}
                placeholder={placeholder}
                value={form[key]}
                onChange={set(key)}
                autoComplete={autoComplete}
              />
              {errors[key] && <p className="field-error">{errors[key]}</p>}
            </div>
          ))}

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
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text2)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
