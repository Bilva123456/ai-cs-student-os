import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { pluginApi } from '../api/client';
import { Icon, ICONS, Spinner } from './UI';

const TRACK_COLORS = {
  DSA:       '#f97316',
  SQL:       '#60a5fa',
  Aptitude:  '#c084fc',
  'Core CS': '#34d399',
  Other:     '#94a3b8',
};

const NAV = [
  { to: '/dashboard', label: 'Dashboard',    icon: ICONS.dashboard },
  { to: '/practice',  label: 'Practice Zone',icon: ICONS.practice  },
  { to: '/plugins',   label: 'Manage Tracks', icon: ICONS.plugins  },
  { to: '/analytics', label: 'Analytics',    icon: ICONS.analytics },
  { to: '/projects',  label: 'Projects',     icon: ICONS.projects  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: plugins, loading } = useApi(pluginApi.list);

  const handleLogout = () => { logout(); navigate('/login'); };
  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <aside style={{
      width: 228, minWidth: 228, height: '100vh',
      background: 'var(--bg1)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-display)',
    }}>
      {/* Logo */}
      <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon d={ICONS.cpu} size={14} color="var(--accent)" />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text0)', lineHeight: 1.2 }}>
              CS Student OS
            </p>
            <p style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--font-mono)', lineHeight: 1.2 }}>
              ● connected
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '10px 10px 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8,
              fontSize: 13, fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--accent)' : 'var(--text1)',
              background: isActive ? 'var(--accent-dim)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              textDecoration: 'none', transition: 'all 0.15s',
            })}
          >
            <Icon d={icon} size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Dynamic Tracks */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '12px 10px',
        marginTop: 8, borderTop: '1px solid var(--border)',
      }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)',
          textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 12px 8px',
        }}>
          Your Tracks
        </p>

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px' }}>
            <Spinner size={11} />
            <span style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>
              Loading...
            </span>
          </div>
        )}

        {!loading && plugins?.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--text2)', padding: '0 12px', fontFamily: 'var(--font-mono)' }}>
            No tracks yet
          </p>
        )}

        {!loading && plugins?.map((p) => (
          <NavLink
            key={p.id}
            to={`/practice?plugin=${p.id}`}
            style={{ display: 'flex', alignItems: 'center', gap: 9,
              padding: '7px 12px', borderRadius: 8, fontSize: 12,
              color: 'var(--text1)', textDecoration: 'none', transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: TRACK_COLORS[p.category] || TRACK_COLORS.Other,
            }} />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p.name}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)',
              background: 'var(--bg4)', padding: '1px 5px', borderRadius: 3,
            }}>
              {p.category}
            </span>
          </NavLink>
        ))}
      </div>

      {/* User footer */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 8px' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'var(--accent)',
          }}>
            {initial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text0)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </p>
            <p style={{ fontSize: 10, color: 'var(--text2)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: 'var(--text2)', flexShrink: 0 }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--red)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text2)'}
          >
            <Icon d={ICONS.logout} size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
