import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <div className="page-enter">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
