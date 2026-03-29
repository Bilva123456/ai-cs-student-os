import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage    from './pages/LoginPage';
import SignupPage   from './pages/SignupPage';
import Dashboard    from './pages/Dashboard';
import PracticePage from './pages/PracticePage';
import PluginsPage  from './pages/PluginsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProjectsPage from './pages/ProjectsPage';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"  element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

      {/* Protected — inside shared layout */}
      <Route
        path="/"
        element={<PrivateRoute><Layout /></PrivateRoute>}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="practice"  element={<PracticePage />} />
        <Route path="plugins"   element={<PluginsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="projects"  element={<ProjectsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
