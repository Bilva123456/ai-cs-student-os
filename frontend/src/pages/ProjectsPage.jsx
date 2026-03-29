import { useState, useCallback } from 'react';
import { useApi, useMutation } from '../hooks/useApi';
import { projectApi } from '../api/client';
import { PageSpinner, ErrorBox, EmptyState, Icon, ICONS, Spinner, Field } from '../components/UI';

const STATUS_STYLES = {
  Completed:    { color: 'var(--accent)', bg: 'var(--accent-dim)', border: 'var(--accent-border)' },
  'In Progress':{ color: 'var(--amber)',  bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)' },
  Planned:      { color: 'var(--text2)',  bg: 'var(--bg4)',  border: 'var(--border)' },
};

// ── Add Project Form ───────────────────────────────────────────────────────────
function AddProjectForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    name: '', description: '', tech_stack: '',
    status: 'Planned', progress: 0,
    github_url: '', live_url: '',
  });
  const [errors, setErrors] = useState({});

  const { mutate, loading, error } = useMutation(
    () => projectApi.add({
      ...form,
      progress: Number(form.progress),
      description: form.description || undefined,
      tech_stack: form.tech_stack || undefined,
      github_url: form.github_url || undefined,
      live_url: form.live_url || undefined,
    }),
    { onSuccess }
  );

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Project name is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) mutate();
  };

  return (
    <div className="card" style={{ border: '1px solid var(--accent-border)', marginBottom: 24 }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 18 }}>
        + New Project
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="grid-2">
          <Field label="Project Name" error={errors.name}>
            <input
              className={`input ${errors.name ? 'error' : ''}`}
              placeholder="Portfolio, Chat App, ML Model..."
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              autoFocus
            />
          </Field>
          <Field label="Status">
            <select className="select" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </Field>
        </div>

        <Field label="Description (optional)">
          <input className="input" placeholder="Brief description of the project" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        </Field>

        <div className="grid-2">
          <Field label="Tech Stack (optional)">
            <input className="input" placeholder="React, FastAPI, PostgreSQL..." value={form.tech_stack} onChange={(e) => setForm((p) => ({ ...p, tech_stack: e.target.value }))} />
          </Field>
          <Field label={`Progress — ${form.progress}%`}>
            <input
              type="range" min={0} max={100} step={5} value={form.progress}
              onChange={(e) => setForm((p) => ({ ...p, progress: e.target.value }))}
              style={{ width: '100%', accentColor: 'var(--accent)', marginTop: 8 }}
            />
          </Field>
        </div>

        <div className="grid-2">
          <Field label="GitHub URL (optional)">
            <input className="input" placeholder="https://github.com/..." value={form.github_url} onChange={(e) => setForm((p) => ({ ...p, github_url: e.target.value }))} />
          </Field>
          <Field label="Live URL (optional)">
            <input className="input" placeholder="https://your-app.vercel.app" value={form.live_url} onChange={(e) => setForm((p) => ({ ...p, live_url: e.target.value }))} />
          </Field>
        </div>

        {error && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--red)' }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <Spinner size={14} color="var(--bg0)" /> : null}
            {loading ? 'Adding...' : 'Add Project'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

// ── Project Card ───────────────────────────────────────────────────────────────
function ProjectCard({ project, onDelete }) {
  const st = STATUS_STYLES[project.status] || STATUS_STYLES.Planned;
  const stackItems = project.tech_stack ? project.tech_stack.split(',').map((s) => s.trim()).filter(Boolean) : [];

  return (
    <div
      className="card"
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-hover)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text0)', marginBottom: 4 }}>{project.name}</h3>
          {project.description && (
            <p style={{ fontSize: 13, color: 'var(--text1)', lineHeight: 1.5 }}>{project.description}</p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, padding: '3px 10px', borderRadius: 20,
            color: st.color, background: st.bg, border: `1px solid ${st.border}`,
          }}>
            {project.status}
          </span>
          <button
            onClick={() => window.confirm(`Delete "${project.name}"?`) && onDelete(project.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 2 }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--red)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text3)'}
          >
            <Icon d={ICONS.x} size={16} />
          </button>
        </div>
      </div>

      {stackItems.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {stackItems.map((s) => (
            <span key={s} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'var(--bg4)', color: 'var(--text2)' }}>
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text2)' }}>Progress</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text1)' }}>{project.progress}%</span>
        </div>
        <div className="prog-bar" style={{ height: 5 }}>
          <div
            className="prog-bar-fill"
            style={{
              width: `${project.progress}%`,
              background: project.status === 'Completed' ? 'var(--accent)' : 'var(--amber)',
            }}
          />
        </div>
      </div>

      {/* Links */}
      <div style={{ display: 'flex', gap: 16 }}>
        {project.github_url && (
          <a
            href={project.github_url} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text2)'}
          >
            ⎇ GitHub ↗
          </a>
        )}
        {project.live_url && (
          <a
            href={project.live_url} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--blue)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text2)'}
          >
            ↗ Live demo
          </a>
        )}
      </div>
    </div>
  );
}

// ── Projects Page ──────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const { data: projects, loading, error, refetch } = useApi(projectApi.list);
  const [showAdd, setShowAdd] = useState(false);

  const { mutate: deleteProject } = useMutation(projectApi.remove, { onSuccess: refetch });

  const handleAdded = useCallback(() => {
    setShowAdd(false);
    refetch();
  }, [refetch]);

  const completed  = projects?.filter((p) => p.status === 'Completed').length || 0;
  const inProgress = projects?.filter((p) => p.status === 'In Progress').length || 0;

  return (
    <div className="page page-enter">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">
            {projects
              ? `${completed} completed · ${inProgress} active`
              : 'Your project portfolio'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd((v) => !v)} style={{ marginTop: 6 }}>
          <Icon d={ICONS.plus} size={14} color="var(--bg0)" />
          Add project
        </button>
      </div>

      {showAdd && (
        <AddProjectForm
          onSuccess={handleAdded}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {loading && <PageSpinner />}
      {error && <ErrorBox message={error} onRetry={refetch} />}

      {!loading && !error && projects?.length === 0 && !showAdd && (
        <EmptyState
          icon={<Icon d={ICONS.projects} size={22} color="var(--text2)" />}
          title="No projects yet"
          sub="Add your first project to track your portfolio progress"
          action={
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
              <Icon d={ICONS.plus} size={13} color="var(--bg0)" /> Add first project
            </button>
          }
        />
      )}

      {projects?.length > 0 && (
        <div className="grid-2">
          {projects.map((proj) => (
            <ProjectCard key={proj.id} project={proj} onDelete={deleteProject} />
          ))}
        </div>
      )}
    </div>
  );
}
