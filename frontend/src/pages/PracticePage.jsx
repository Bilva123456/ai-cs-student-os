import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApi, useMutation } from '../hooks/useApi';
import { practiceApi, pluginApi } from '../api/client';
import {
  PageSpinner, ErrorBox, EmptyState, DiffBadge, StatusBadge,
  Icon, ICONS, Spinner, Field,
} from '../components/UI';

const STATUS_CYCLE = { Planned: 'Solving', Solving: 'Mastered', Mastered: 'Planned' };

const STATUS_DOT = {
  Planned:  'var(--text3)',
  Solving:  'var(--amber)',
  Mastered: 'var(--accent)',
};

const TRACK_COLORS = {
  DSA: '#f97316', SQL: '#60a5fa', Aptitude: '#c084fc',
  'Core CS': '#34d399', Other: '#94a3b8',
};

// ── Add Problem Form ──────────────────────────────────────────────────────────
function AddProblemForm({ plugins, defaultPluginId, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    title: '', topic: '', difficulty: 'Medium',
    plugin_id: defaultPluginId || plugins[0]?.id || '',
    source_link: '',
  });
  const [errors, setErrors] = useState({});

  const { mutate, loading, error } = useMutation(practiceApi.add, { onSuccess });

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.plugin_id)    e.plugin_id = 'Select a track';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) mutate({ ...form, topic: form.topic || undefined, source_link: form.source_link || undefined });
  };

  return (
    <div className="card" style={{ border: '1px solid var(--accent-border)', marginBottom: 20 }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 18 }}>
        + New Problem
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Problem Title" error={errors.title}>
          <input
            className={`input ${errors.title ? 'error' : ''}`}
            placeholder="e.g. Two Sum, Window Functions, Time & Work..."
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            autoFocus
          />
        </Field>

        <div className="grid-2">
          <Field label="Topic (optional)">
            <input
              className="input"
              placeholder="Arrays, Trees, SQL Joins..."
              value={form.topic}
              onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
            />
          </Field>
          <Field label="Difficulty">
            <select
              className="select"
              value={form.difficulty}
              onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value }))}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </Field>
        </div>

        <div className="grid-2">
          <Field label="Track" error={errors.plugin_id}>
            <select
              className={`select ${errors.plugin_id ? 'error' : ''}`}
              value={form.plugin_id}
              onChange={(e) => setForm((p) => ({ ...p, plugin_id: e.target.value }))}
            >
              <option value="">Select a track...</option>
              {plugins.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
              ))}
            </select>
          </Field>
          <Field label="Source Link (optional)">
            <input
              className="input"
              placeholder="https://leetcode.com/..."
              value={form.source_link}
              onChange={(e) => setForm((p) => ({ ...p, source_link: e.target.value }))}
            />
          </Field>
        </div>

        {error && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--red)' }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <Spinner size={14} color="var(--bg0)" /> : null}
            {loading ? 'Adding...' : 'Add Problem'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

// ── Problem Row ───────────────────────────────────────────────────────────────
function ProblemRow({ item, plugin, onStatusClick, onDelete, updating }) {
  const statusColor = STATUS_DOT[item.status];

  return (
    <div
      className="card card-tight"
      style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'default' }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-hover)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {/* Status toggle */}
      <button
        onClick={() => onStatusClick(item.id, STATUS_CYCLE[item.status])}
        disabled={updating}
        title={`Mark as ${STATUS_CYCLE[item.status]}`}
        style={{
          width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
          border: `2px solid ${statusColor}`,
          background: item.status === 'Mastered' ? 'var(--accent-dim)' : 'transparent',
          cursor: updating ? 'wait' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {updating ? (
          <Spinner size={10} />
        ) : item.status === 'Mastered' ? (
          <Icon d={ICONS.check} size={11} color="var(--accent)" strokeWidth={2.5} />
        ) : item.status === 'Solving' ? (
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)', display: 'block' }} />
        ) : null}
      </button>

      {/* Track color dot */}
      {plugin && (
        <span
          style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: TRACK_COLORS[plugin.category] || TRACK_COLORS.Other }}
        />
      )}

      {/* Title + topic */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 14, fontWeight: 500, color: item.status === 'Mastered' ? 'var(--text2)' : 'var(--text0)',
          textDecoration: item.status === 'Mastered' ? 'line-through' : 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {item.title}
        </p>
        {item.topic && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
            {item.topic}
          </p>
        )}
      </div>

      {/* Track name */}
      {plugin && (
        <span style={{ fontSize: 11, color: 'var(--text2)', flexShrink: 0, minWidth: 80, textAlign: 'right' }}>
          {plugin.name}
        </span>
      )}

      <DiffBadge difficulty={item.difficulty} />
      <StatusBadge status={item.status} />

      {item.revision_count > 0 && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>
          ×{item.revision_count}
        </span>
      )}

      {item.source_link && (
        <a
          href={item.source_link}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 12, color: 'var(--text2)', flexShrink: 0 }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--blue)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text2)'}
          onClick={(e) => e.stopPropagation()}
        >
          ↗
        </a>
      )}

      <button
        onClick={() => onDelete(item.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text3)', flexShrink: 0 }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--red)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text3)'}
        title="Delete"
      >
        <Icon d={ICONS.x} size={14} />
      </button>
    </div>
  );
}

// ── Practice Page ─────────────────────────────────────────────────────────────
export default function PracticePage() {
  const [searchParams] = useSearchParams();
  const [showAdd, setShowAdd] = useState(false);
  const [filterPlugin, setFilterPlugin] = useState(searchParams.get('plugin') || '');
  const [filterDiff, setFilterDiff] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const { data: plugins, loading: pluginsLoading } = useApi(pluginApi.list);

  const fetchItems = useCallback(
    () => practiceApi.list({
      ...(filterPlugin ? { plugin_id: filterPlugin } : {}),
      ...(filterDiff   ? { difficulty: filterDiff }   : {}),
      ...(filterStatus ? { status: filterStatus }      : {}),
    }),
    [filterPlugin, filterDiff, filterStatus]
  );

  const { data: items, loading: itemsLoading, error: itemsError, refetch } = useApi(fetchItems, [fetchItems]);

  const { mutate: updateStatus } = useMutation(
    ({ id, status }) => practiceApi.updateStatus(id, status),
    {
      onSuccess: () => { setUpdatingId(null); refetch(); },
    }
  );

  const { mutate: deleteItem } = useMutation(practiceApi.remove, { onSuccess: refetch });

  const handleStatusClick = (id, status) => {
    setUpdatingId(id);
    updateStatus({ id, status });
  };

  const pluginMap = Object.fromEntries((plugins || []).map((p) => [p.id, p]));

  const selectStyle = {
    background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text1)', fontFamily: 'var(--font-display)',
    fontSize: 13, outline: 'none', padding: '8px 12px', cursor: 'pointer',
  };

  return (
    <div className="page page-enter">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Practice Zone</h1>
          <p className="page-subtitle">
            {items ? `${items.length} item${items.length !== 1 ? 's' : ''} shown` : 'All practice items from your tracks'}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAdd((v) => !v)}
          disabled={!plugins?.length}
          title={!plugins?.length ? 'Add a track first' : 'Add problem'}
          style={{ marginTop: 6 }}
        >
          <Icon d={ICONS.plus} size={14} color="var(--bg0)" />
          Add problem
        </button>
      </div>

      {/* No tracks at all */}
      {!pluginsLoading && plugins?.length === 0 && (
        <EmptyState
          icon={<Icon d={ICONS.plugins} size={22} color="var(--text2)" />}
          title="No tracks yet"
          sub='Go to "Manage Tracks" to add your first track, then come back here to add problems'
        />
      )}

      {/* Add form */}
      {showAdd && plugins?.length > 0 && (
        <AddProblemForm
          plugins={plugins}
          defaultPluginId={filterPlugin || undefined}
          onSuccess={() => { setShowAdd(false); refetch(); }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {/* Filters */}
      {plugins?.length > 0 && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, alignItems: 'center' }}>
            <select style={selectStyle} value={filterPlugin} onChange={(e) => setFilterPlugin(e.target.value)}>
              <option value="">All tracks</option>
              {plugins.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.category})</option>)}
            </select>

            <select style={selectStyle} value={filterDiff} onChange={(e) => setFilterDiff(e.target.value)}>
              <option value="">All difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select style={selectStyle} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All status</option>
              <option value="Planned">Planned</option>
              <option value="Solving">Solving</option>
              <option value="Mastered">Mastered</option>
            </select>

            {(filterPlugin || filterDiff || filterStatus) && (
              <button
                onClick={() => { setFilterPlugin(''); setFilterDiff(''); setFilterStatus(''); }}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 11 }}
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Track pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {plugins.map((pl) => {
              const total    = (items || []).filter((i) => i.plugin_id === pl.id).length;
              const mastered = (items || []).filter((i) => i.plugin_id === pl.id && i.status === 'Mastered').length;
              const isActive = filterPlugin === pl.id;
              return (
                <button
                  key={pl.id}
                  onClick={() => setFilterPlugin(isActive ? '' : pl.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 12px', borderRadius: 20,
                    background: isActive ? 'var(--accent-dim)' : 'var(--bg2)',
                    border: `1px solid ${isActive ? 'var(--accent-border)' : 'var(--border)'}`,
                    color: isActive ? 'var(--accent)' : 'var(--text1)',
                    fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-display)',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: TRACK_COLORS[pl.category] || TRACK_COLORS.Other }} />
                  {pl.name}
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: isActive ? 'var(--accent)' : 'var(--text3)' }}>
                    {mastered}/{total}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {(pluginsLoading || itemsLoading) && <PageSpinner />}
      {itemsError && <ErrorBox message={itemsError} onRetry={refetch} />}

      {!itemsLoading && !itemsError && items?.length === 0 && plugins?.length > 0 && (
        <EmptyState
          icon={<Icon d={ICONS.practice} size={22} color="var(--text2)" />}
          title={filterPlugin || filterDiff || filterStatus ? 'No items match these filters' : 'No practice items yet'}
          sub={filterPlugin || filterDiff || filterStatus ? 'Try adjusting your filters' : 'Click "Add problem" to add your first item'}
          action={
            !(filterPlugin || filterDiff || filterStatus) ? (
              <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
                <Icon d={ICONS.plus} size={13} color="var(--bg0)" /> Add first problem
              </button>
            ) : undefined
          }
        />
      )}

      {!itemsLoading && items?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item) => (
            <ProblemRow
              key={item.id}
              item={item}
              plugin={pluginMap[item.plugin_id]}
              onStatusClick={handleStatusClick}
              onDelete={(id) => window.confirm('Delete this problem?') && deleteItem(id)}
              updating={updatingId === item.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
