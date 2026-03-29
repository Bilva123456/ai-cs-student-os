// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 18, color = 'var(--accent)' }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2} strokeLinecap="round"
      className="spin"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

export function PageSpinner({ text = 'Loading...' }) {
  return (
    <div className="spinner-wrap">
      <Spinner size={20} />
      <span>{text}</span>
    </div>
  );
}

// ── ErrorBox ──────────────────────────────────────────────────────────────────
export function ErrorBox({ message, onRetry }) {
  return (
    <div className="alert-err" style={{ textAlign: 'center', padding: '24px' }}>
      <p style={{ marginBottom: onRetry ? 12 : 0 }}>{message || 'Something went wrong'}</p>
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, sub, action }) {
  return (
    <div className="empty-state">
      {icon && (
        <div
          style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'var(--bg3)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      )}
      <div>
        <p className="empty-state-title">{title}</p>
        {sub && <p className="empty-state-sub" style={{ marginTop: 4 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Badge ────────────────────────────────────────────────────────────────────
export function DiffBadge({ difficulty }) {
  const cls = { Easy: 'badge-easy', Medium: 'badge-medium', Hard: 'badge-hard' };
  return <span className={`badge ${cls[difficulty] || 'badge-planned'}`}>{difficulty}</span>;
}

export function StatusBadge({ status }) {
  const cls = { Planned: 'badge-planned', Solving: 'badge-solving', Mastered: 'badge-mastered' };
  return <span className={`badge ${cls[status] || 'badge-planned'}`}>{status}</span>;
}

// ── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, color = 'var(--text0)' }) {
  return (
    <div className="card card-tight">
      <p className="label" style={{ marginBottom: 8 }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 700, letterSpacing: '-0.04em', color }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>{sub}</p>
      )}
    </div>
  );
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = 'var(--accent)', style = {} }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="prog-bar" style={style}>
      <div className="prog-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// ── Ring ──────────────────────────────────────────────────────────────────────
export function Ring({ value, size = 96, stroke = 7, color = 'var(--accent)' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(value, 100) / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg4)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: 'stroke-dasharray 1.2s ease' }}
      />
    </svg>
  );
}

// ── Icon ─────────────────────────────────────────────────────────────────────
export function Icon({ d, size = 16, color = 'currentColor', strokeWidth = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

// Common icon paths
export const ICONS = {
  dashboard: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  practice:  'M16 18l6-6-6-6 M8 6l-6 6 6 6',
  plugins:   'M4 6h16 M4 12h8 M4 18h4',
  analytics: 'M18 20V10 M12 20V4 M6 20v-6',
  projects:  'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
  plus:      'M12 5v14 M5 12h14',
  logout:    'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  trash:     'M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2',
  cpu:       'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18',
  alert:     'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
  zap:       'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  github:    'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22',
  check:     'M20 6L9 17l-5-5',
  x:         'M18 6L6 18 M6 6l12 12',
};

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, sub, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal">
        <div className="modal-header">
          <p className="modal-title">{title}</p>
          {sub && <p className="modal-sub">{sub}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Field ────────────────────────────────────────────────────────────────────
export function Field({ label, error, children }) {
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
