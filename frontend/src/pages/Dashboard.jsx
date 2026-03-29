import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { analyticsApi, plannerApi } from '../api/client';
import {
  PageSpinner, ErrorBox, EmptyState, StatCard, Ring, ProgressBar,
  Icon, ICONS, Spinner,
} from '../components/UI';

// ── Readiness Ring Card ───────────────────────────────────────────────────────
function ReadinessCard({ analytics }) {
  const score = analytics.readiness_score;
  const d = analytics.difficulty_breakdown;
  const s = analytics.status_breakdown;
  const barMax = Math.max(d.Easy, d.Medium, d.Hard, 1);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <p className="label">Placement Readiness</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Ring value={score} size={110} stroke={9} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, color: 'var(--text0)', letterSpacing: '-0.05em' }}>
              {score}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text2)' }}>/100</span>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Easy',   val: d.Easy,   color: 'var(--green)' },
            { label: 'Medium', val: d.Medium, color: 'var(--amber)' },
            { label: 'Hard',   val: d.Hard,   color: 'var(--red)' },
          ].map(({ label, val, color }) => (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: 'var(--text1)' }}>{label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color }}>{val}</span>
              </div>
              <ProgressBar value={val} max={barMax} color={color} style={{ height: 4 }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 0, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        {[
          { label: 'Mastered', val: s.Mastered, color: 'var(--accent)' },
          { label: 'Solving',  val: s.Solving,  color: 'var(--amber)' },
          { label: 'Planned',  val: s.Planned,  color: 'var(--text2)' },
        ].map(({ label, val, color }, i) => (
          <div key={label} style={{ flex: 1, textAlign: 'center', borderLeft: i ? '1px solid var(--border)' : 'none' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color }}>{val}</p>
            <p style={{ fontSize: 11, color: 'var(--text2)' }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Alerts Card ───────────────────────────────────────────────────────────────
function AlertsCard({ weaknesses }) {
  if (!weaknesses?.length) {
    return (
      <div className="card card-tight">
        <p className="label" style={{ marginBottom: 10 }}>Alerts</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--accent)', fontSize: 14 }}>✓</span>
          <span style={{ fontSize: 13, color: 'var(--text1)' }}>No active alerts — keep going!</span>
        </div>
      </div>
    );
  }
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Icon d={ICONS.alert} size={14} color="var(--amber)" />
        <p className="label">Active Alerts</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {weaknesses.map((w, i) => (
          <div key={i} className="alert-warn" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--amber)', fontSize: 10, marginTop: 2, flexShrink: 0 }}>▲</span>
            {w}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Daily Plan Card ───────────────────────────────────────────────────────────
function DailyPlanCard() {
  const { data: plan, loading, error, refetch } = useApi(plannerApi.dailyPlan);

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon d={ICONS.zap} size={14} color="var(--accent)" />
          <p className="label">AI Daily Plan</p>
        </div>
        <button
          onClick={refetch}
          className="btn btn-secondary btn-sm"
          disabled={loading}
          style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}
        >
          {loading ? <Spinner size={11} /> : 'Refresh'}
        </button>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '24px 0', color: 'var(--text2)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
          <Spinner size={15} />
          AI is generating your plan...
        </div>
      )}

      {error && <ErrorBox message={error} onRetry={refetch} />}

      {plan && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Mentor message */}
          <div className="card-accent" style={{ borderRadius: 10, padding: '14px 16px' }}>
            <p className="label" style={{ marginBottom: 6, color: 'var(--accent)' }}>Mentor says</p>
            <p style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--text0)', lineHeight: 1.6 }}>
              "{plan.mentor_message}"
            </p>
          </div>

          {/* Problems */}
          <div>
            <p className="label" style={{ marginBottom: 10 }}>Solve today</p>
            {plan.problems.map((p, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, padding: '8px 0',
                borderBottom: '1px solid var(--border)', alignItems: 'flex-start',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text0)', lineHeight: 1.5 }}>{p}</span>
              </div>
            ))}
          </div>

          {/* Concept + Task */}
          <div className="grid-2">
            {[
              { label: 'Concept', value: plan.concept },
              { label: 'Project Task', value: plan.project_task },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--bg3)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)' }}>
                <p className="label" style={{ marginBottom: 5 }}>{label}</p>
                <p style={{ fontSize: 12, color: 'var(--text1)', lineHeight: 1.6 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Revision */}
          <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)' }}>
            <p className="label" style={{ marginBottom: 5 }}>Revision</p>
            <p style={{ fontSize: 12, color: 'var(--text1)', lineHeight: 1.6 }}>{plan.revision}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Dashboard Page ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const { data: analytics, loading, error, refetch } = useApi(analyticsApi.get);
  const d = analytics?.difficulty_breakdown;

  return (
    <div className="page page-enter">
      {/* Header */}
      <div className="page-header">
        <p className="label" style={{ marginBottom: 6 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="page-title">
          Good morning,{' '}
          <span style={{ color: 'var(--accent)' }}>{user?.name?.split(' ')[0] || 'there'}</span>
        </h1>
        <p className="page-subtitle">Your placement intelligence dashboard — all data live from backend</p>
      </div>

      {loading && <PageSpinner />}
      {error && <ErrorBox message={`Backend error: ${error} — is FastAPI running at port 8000?`} onRetry={refetch} />}

      {analytics && (
        <>
          {/* Stat cards */}
          <div className="grid-4" style={{ marginBottom: 24 }}>
            <StatCard label="Readiness Score" value={`${analytics.readiness_score}/100`} color="var(--accent)" />
            <StatCard label="Easy Solved"   value={d.Easy}   sub="problems" color="var(--green)" />
            <StatCard label="Medium Solved" value={d.Medium} sub="problems" color="var(--amber)" />
            <StatCard label="Hard Solved"   value={d.Hard}   sub="problems" color="var(--red)" />
          </div>

          {/* Main grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <AlertsCard weaknesses={analytics.weaknesses} />
              <DailyPlanCard />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <ReadinessCard analytics={analytics} />
              <div className="card card-tight">
                <p className="label" style={{ marginBottom: 12 }}>Top Topics</p>
                {analytics.top_topics?.length === 0 && (
                  <p style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>
                    No topics yet — add practice items
                  </p>
                )}
                {analytics.top_topics?.map(([topic, count]) => (
                  <div key={topic} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text0)' }}>{topic}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{count}</span>
                  </div>
                ))}
              </div>
              <div className="card card-tight">
                <p className="label" style={{ marginBottom: 10 }}>Total Practice Items</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 48, fontWeight: 700, letterSpacing: '-0.05em', color: 'var(--text0)', lineHeight: 1 }}>
                  {analytics.total_items}
                </p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>
                  across all tracks
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {analytics?.total_items === 0 && (
        <EmptyState
          title="No data yet — start by adding a track"
          sub="Go to Manage Tracks → add your first track → add practice items"
        />
      )}
    </div>
  );
}
