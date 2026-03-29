import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { analyticsApi, pluginApi, integrationApi } from '../api/client';
import {
  PageSpinner, ErrorBox, EmptyState, StatCard, ProgressBar, Ring, Icon, ICONS, Spinner,
} from '../components/UI';

const TRACK_COLORS = {
  DSA: '#f97316', SQL: '#60a5fa', Aptitude: '#c084fc',
  'Core CS': '#34d399', Other: '#94a3b8',
};

// ── Horizontal bar row ─────────────────────────────────────────────────────────
function HBar({ label, value, max, color, count }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: 'var(--text1)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color, fontWeight: 600 }}>{count}</span>
      </div>
      <ProgressBar value={value} max={max} color={color} style={{ height: 6 }} />
    </div>
  );
}

// ── Integration Fetcher ────────────────────────────────────────────────────────
function IntegrationPanel() {
  const [ghUser, setGhUser] = useState('');
  const [lcUser, setLcUser] = useState('');
  const [ghData, setGhData] = useState(null);
  const [lcData, setLcData] = useState(null);
  const [ghErr, setGhErr] = useState('');
  const [lcErr, setLcErr] = useState('');
  const [ghLoading, setGhLoading] = useState(false);
  const [lcLoading, setLcLoading] = useState(false);

  const fetchGH = async (e) => {
    e.preventDefault();
    if (!ghUser.trim()) return;
    setGhLoading(true); setGhErr(''); setGhData(null);
    try { setGhData(await integrationApi.github(ghUser.trim())); }
    catch (err) { setGhErr(err?.response?.data?.detail || 'User not found'); }
    finally { setGhLoading(false); }
  };

  const fetchLC = async (e) => {
    e.preventDefault();
    if (!lcUser.trim()) return;
    setLcLoading(true); setLcErr(''); setLcData(null);
    try { setLcData(await integrationApi.leetcode(lcUser.trim())); }
    catch (err) { setLcErr(err?.response?.data?.detail || 'User not found'); }
    finally { setLcLoading(false); }
  };

  const inputStyle = {
    flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text0)', fontFamily: 'var(--font-mono)',
    fontSize: 13, outline: 'none', padding: '8px 12px',
  };

  return (
    <div className="card">
      <p className="label" style={{ marginBottom: 4 }}>External Integrations</p>
      <p style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--font-mono)', marginBottom: 20 }}>
        Fetch live stats from your coding profiles
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* GitHub */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text0)', marginBottom: 8 }}>
            <Icon d={ICONS.github} size={14} color="var(--text1)" style={{ marginRight: 6 }} />
            GitHub
          </p>
          <form onSubmit={fetchGH} style={{ display: 'flex', gap: 8 }}>
            <input style={inputStyle} placeholder="your-github-username" value={ghUser} onChange={(e) => setGhUser(e.target.value)} />
            <button type="submit" className="btn btn-secondary btn-sm" disabled={ghLoading} style={{ flexShrink: 0 }}>
              {ghLoading ? <Spinner size={12} /> : 'Fetch'}
            </button>
          </form>
          {ghErr && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', marginTop: 6 }}>{ghErr}</p>}
          {ghData && (
            <div className="alert-ok" style={{ marginTop: 10 }}>
              <p style={{ fontWeight: 700, color: 'var(--text0)', marginBottom: 4 }}>@{ghData.username}</p>
              <div style={{ display: 'flex', gap: 16, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text1)' }}>
                <span>{ghData.public_repos} repos</span>
                <span>{ghData.followers} followers</span>
              </div>
              {ghData.top_languages?.length > 0 && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>
                  {ghData.top_languages.slice(0, 4).map(([l]) => l).join(' · ')}
                </p>
              )}
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--border)' }} />

        {/* LeetCode */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text0)', marginBottom: 8 }}>LeetCode</p>
          <form onSubmit={fetchLC} style={{ display: 'flex', gap: 8 }}>
            <input style={inputStyle} placeholder="your-leetcode-username" value={lcUser} onChange={(e) => setLcUser(e.target.value)} />
            <button type="submit" className="btn btn-secondary btn-sm" disabled={lcLoading} style={{ flexShrink: 0 }}>
              {lcLoading ? <Spinner size={12} /> : 'Fetch'}
            </button>
          </form>
          {lcErr && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', marginTop: 6 }}>{lcErr}</p>}
          {lcData && (
            <div className="alert-ok" style={{ marginTop: 10 }}>
              <p style={{ fontWeight: 700, color: 'var(--text0)', marginBottom: 4 }}>@{lcData.username}</p>
              {lcData.solved && (
                <div style={{ display: 'flex', gap: 16, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text1)' }}>
                  {Object.entries(lcData.solved).map(([k, v]) => (
                    <span key={k}>{k}: <strong style={{ color: 'var(--text0)' }}>{v}</strong></span>
                  ))}
                </div>
              )}
              {lcData.ranking && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>
                  Rank #{lcData.ranking?.toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Analytics Page ─────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { data: analytics, loading, error, refetch } = useApi(analyticsApi.get);
  const { data: plugins } = useApi(pluginApi.list);

  if (loading) return <div className="page"><PageSpinner /></div>;
  if (error) return <div className="page"><ErrorBox message={error} onRetry={refetch} /></div>;
  if (!analytics) return null;

  const d = analytics.difficulty_breakdown;
  const s = analytics.status_breakdown;
  const total = analytics.total_items;
  const barMax = Math.max(d.Easy, d.Medium, d.Hard, 1);

  return (
    <div className="page page-enter">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">All data live from backend — no cached or fake values</p>
      </div>

      {total === 0 ? (
        <EmptyState
          title="No data yet"
          sub="Add practice items to see analytics here"
        />
      ) : (
        <>
          {/* Stats row */}
          <div className="grid-4" style={{ marginBottom: 24 }}>
            <StatCard label="Readiness Score" value={`${analytics.readiness_score}/100`} color="var(--accent)" />
            <StatCard label="Total Problems"   value={total} />
            <StatCard label="Mastered"  value={s.Mastered} sub={`${total ? Math.round((s.Mastered / total) * 100) : 0}% mastery`} color="var(--accent)" />
            <StatCard label="In Progress" value={s.Solving} sub="currently solving" color="var(--amber)" />
          </div>

          {/* Readiness bar */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <p className="label">Placement Readiness Index</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 700, letterSpacing: '-0.05em', color: 'var(--accent)', lineHeight: 1 }}>
                {analytics.readiness_score}
                <span style={{ fontSize: 16, color: 'var(--text2)' }}>/100</span>
              </p>
            </div>
            <div className="prog-bar" style={{ height: 8 }}>
              <div
                className="prog-bar-fill"
                style={{
                  width: `${analytics.readiness_score}%`,
                  background: 'linear-gradient(90deg, var(--accent), var(--blue))',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>0 — not ready</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>100 — placement ready</span>
            </div>
          </div>

          {/* 3-col breakdown */}
          <div className="grid-3" style={{ marginBottom: 20 }}>
            {/* Difficulty */}
            <div className="card">
              <p className="label" style={{ marginBottom: 18 }}>Difficulty Breakdown</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <HBar label="Easy"   value={d.Easy}   max={barMax} color="var(--green)" count={d.Easy} />
                <HBar label="Medium" value={d.Medium} max={barMax} color="var(--amber)" count={d.Medium} />
                <HBar label="Hard"   value={d.Hard}   max={barMax} color="var(--red)"   count={d.Hard} />
              </div>
            </div>

            {/* Status */}
            <div className="card">
              <p className="label" style={{ marginBottom: 18 }}>Status Distribution</p>
              {[
                { label: 'Mastered', val: s.Mastered, color: 'var(--accent)' },
                { label: 'Solving',  val: s.Solving,  color: 'var(--amber)' },
                { label: 'Planned',  val: s.Planned,  color: 'var(--text2)' },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: 13, color: 'var(--text1)' }}>{label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color }}>{val}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>
                      {total ? Math.round((val / total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Top topics */}
            <div className="card">
              <p className="label" style={{ marginBottom: 18 }}>Top Topics</p>
              {analytics.top_topics?.length === 0 ? (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text2)' }}>
                  Add topics to practice items to see trends
                </p>
              ) : (
                analytics.top_topics?.map(([topic, count], i) => (
                  <div key={topic} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', width: 20 }}>#{i + 1}</span>
                      <span style={{ fontSize: 13, color: 'var(--text0)' }}>{topic}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Weaknesses */}
          {analytics.weaknesses?.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Icon d={ICONS.alert} size={14} color="var(--red)" />
                <p className="label" style={{ color: 'var(--red)' }}>Detected Weaknesses</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {analytics.weaknesses.map((w, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.12)',
                    borderRadius: 10, padding: '12px 16px',
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', flexShrink: 0, marginTop: 1 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text0)', lineHeight: 1.6 }}>{w}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Per-track */}
          {plugins?.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <p className="label" style={{ marginBottom: 16 }}>Track Breakdown</p>
              <div className="grid-3">
                {plugins.map((pl) => (
                  <div key={pl.id} style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: TRACK_COLORS[pl.category] || TRACK_COLORS.Other }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text0)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {pl.name}
                      </span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text2)' }}>
                      {pl.category} · {pl.type}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Integrations always visible */}
      <IntegrationPanel />
    </div>
  );
}
