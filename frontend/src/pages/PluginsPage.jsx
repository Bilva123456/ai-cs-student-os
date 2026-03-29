import { useState, useCallback } from 'react';
import { useApi, useMutation } from '../hooks/useApi';
import { pluginApi, integrationApi } from '../api/client';
import {
  PageSpinner, ErrorBox, EmptyState, Icon, ICONS, Spinner, Modal, Field,
} from '../components/UI';

const CATEGORY_OPTIONS = [
  { value: 'DSA',      label: 'DSA — Data Structures & Algorithms' },
  { value: 'SQL',      label: 'SQL — Database Queries' },
  { value: 'Aptitude', label: 'Aptitude — Reasoning & Maths' },
  { value: 'Core CS',  label: 'Core CS — OS, Networks, DBMS' },
  { value: 'Other',    label: 'Other' },
];

const TYPE_OPTIONS = [
  { value: 'coding',   label: 'Coding — write & run solutions' },
  { value: 'database', label: 'Database — SQL queries' },
  { value: 'theory',   label: 'Theory — concepts & MCQs' },
];

const TRACK_COLORS = {
  DSA: '#f97316', SQL: '#60a5fa', Aptitude: '#c084fc',
  'Core CS': '#34d399', Other: '#94a3b8',
};

// detect if this track name implies a platform integration
function detectPlatform(name) {
  const n = name.toLowerCase();
  if (n.includes('leetcode')) return 'leetcode';
  if (n.includes('github'))   return 'github';
  return null;
}

// ── Add Track Modal ────────────────────────────────────────────────────────────
function AddTrackModal({ onClose, onAdded }) {
  const [step, setStep] = useState('form'); // 'form' | 'connect'
  const [form, setForm] = useState({ name: '', category: 'DSA', type: 'coding' });
  const [errors, setErrors] = useState({});
  const [username, setUsername] = useState('');
  const [connectData, setConnectData] = useState(null);
  const [connectErr, setConnectErr] = useState('');
  const [connectLoading, setConnectLoading] = useState(false);

  const platform = detectPlatform(form.name);

  const { mutate: addPlugin, loading: adding, error: addErr } = useMutation(pluginApi.add, {
    onSuccess: () => {
      onAdded();
      if (platform) setStep('connect');
      else onClose();
    },
  });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Track name is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (validate()) addPlugin(form);
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setConnectLoading(true);
    setConnectErr('');
    try {
      const fn = platform === 'leetcode' ? integrationApi.leetcode : integrationApi.github;
      const result = await fn(username.trim());
      setConnectData(result);
    } catch (err) {
      setConnectErr(err?.response?.data?.detail || 'User not found — check the username');
    } finally {
      setConnectLoading(false);
    }
  };

  if (step === 'connect') {
    return (
      <Modal
        title={`Connect your ${platform === 'leetcode' ? 'LeetCode' : 'GitHub'} account`}
        sub="Fetch live stats to show in Analytics and Dashboard"
        onClose={onClose}
      >
        {!connectData ? (
          <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label={`${platform === 'leetcode' ? 'LeetCode' : 'GitHub'} username`} error={connectErr}>
              <input
                className={`input ${connectErr ? 'error' : ''}`}
                placeholder={`Enter your ${platform} username`}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Field>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={connectLoading}>
                {connectLoading ? <Spinner size={14} color="var(--bg0)" /> : null}
                {connectLoading ? 'Fetching...' : 'Fetch Profile'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Skip</button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="alert-ok">
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                ✓ Profile connected
              </p>
              <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text0)', marginBottom: 4 }}>
                @{connectData.username}
              </p>
              {platform === 'leetcode' && connectData.solved && (
                <div style={{ display: 'flex', gap: 16, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text1)' }}>
                  {Object.entries(connectData.solved).map(([k, v]) => (
                    <span key={k}>{k}: <strong style={{ color: 'var(--text0)' }}>{v}</strong></span>
                  ))}
                </div>
              )}
              {platform === 'github' && (
                <div style={{ display: 'flex', gap: 16, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text1)' }}>
                  <span>{connectData.public_repos} repos</span>
                  <span>{connectData.followers} followers</span>
                </div>
              )}
            </div>
            <button className="btn btn-primary" onClick={onClose}>Done</button>
          </div>
        )}
      </Modal>
    );
  }

  return (
    <Modal
      title="Add new track"
      sub="Tracks organise your practice items and appear in the sidebar"
      onClose={onClose}
    >
      <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Track Name" error={errors.name}>
          <input
            className={`input ${errors.name ? 'error' : ''}`}
            placeholder="e.g. LeetCode DSA, SQL Practice, Aptitude..."
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
        </Field>

        {platform && (
          <div className="alert-ok" style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>
            ↗ After adding, you'll be asked to connect your {platform} account for live stats
          </div>
        )}

        <Field label="Category">
          <select
            className="select"
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Type">
          <select
            className="select"
            value={form.type}
            onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>

        {addErr && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--red)' }}>{addErr}</p>
        )}

        <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={adding}>
            {adding ? <Spinner size={14} color="var(--bg0)" /> : null}
            {adding ? 'Adding...' : 'Add Track'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

// ── Plugins Page ──────────────────────────────────────────────────────────────
export default function PluginsPage() {
  const { data: plugins, loading, error, refetch } = useApi(pluginApi.list);
  const [showModal, setShowModal] = useState(false);

  const { mutate: removePlugin } = useMutation(pluginApi.remove, {
    onSuccess: refetch,
  });

  const handleAdded = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="page page-enter">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Manage Tracks</h1>
          <p className="page-subtitle">
            {plugins ? `${plugins.length} track${plugins.length !== 1 ? 's' : ''} — no preloaded defaults` : 'All data from your backend'}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          style={{ marginTop: 6 }}
        >
          <Icon d={ICONS.plus} size={14} color="var(--bg0)" />
          Add track
        </button>
      </div>

      {loading && <PageSpinner />}
      {error && <ErrorBox message={error} onRetry={refetch} />}

      {!loading && !error && plugins?.length === 0 && (
        <EmptyState
          icon={<Icon d={ICONS.plugins} size={22} color="var(--text2)" />}
          title="No tracks yet"
          sub="Add your first track — LeetCode, SQL, Aptitude, or anything you practice"
          action={
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Icon d={ICONS.plus} size={14} color="var(--bg0)" /> Add first track
            </button>
          }
        />
      )}

      {plugins?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {plugins.map((plugin) => (
            <div
              key={plugin.id}
              className="card card-tight"
              style={{ display: 'flex', alignItems: 'center', gap: 16 }}
            >
              {/* Color dot */}
              <span style={{
                width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                background: TRACK_COLORS[plugin.category] || TRACK_COLORS.Other,
              }} />

              {/* Name + meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text0)' }}>{plugin.name}</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
                  {plugin.category} · {plugin.type}
                </p>
              </div>

              {/* Category badge */}
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, padding: '3px 9px',
                borderRadius: 20, background: 'var(--bg4)', color: 'var(--text1)',
                flexShrink: 0,
              }}>
                {plugin.category}
              </span>

              {/* Type badge */}
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, padding: '3px 9px',
                borderRadius: 20, background: 'var(--bg3)', color: 'var(--text2)',
                border: '1px solid var(--border)', flexShrink: 0,
              }}>
                {plugin.type}
              </span>

              {/* Added date */}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', flexShrink: 0 }}>
                {new Date(plugin.created_at).toLocaleDateString()}
              </span>

              {/* Delete */}
              <button
                onClick={() => window.confirm(`Remove "${plugin.name}"?`) && removePlugin(plugin.id)}
                className="btn btn-danger btn-sm"
                style={{ flexShrink: 0 }}
                title="Remove track"
              >
                <Icon d={ICONS.trash} size={13} color="var(--red)" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Explanation card */}
      {plugins?.length > 0 && (
        <div className="card card-tight" style={{ marginTop: 24, borderColor: 'var(--accent-border)', background: 'var(--accent-dim)' }}>
          <p style={{ fontSize: 13, color: 'var(--text1)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--accent)' }}>How tracks work:</strong> Each track represents a practice domain. After adding a track, go to{' '}
            <strong style={{ color: 'var(--text0)' }}>Practice Zone</strong> to add problems under it. Tracks appear in the sidebar and as filters in Practice Zone.
          </p>
        </div>
      )}

      {showModal && (
        <AddTrackModal
          onClose={() => setShowModal(false)}
          onAdded={handleAdded}
        />
      )}
    </div>
  );
}
