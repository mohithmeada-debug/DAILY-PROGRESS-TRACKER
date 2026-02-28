import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  FiBarChart2,
  FiCheckSquare,
  FiGrid,
  FiHome,
  FiLogOut,
  FiMoon,
  FiSun,
  FiTarget,
  FiBookOpen,
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className="hidden md:flex md:flex-col w-64 px-4 py-6 gap-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                  DP
                </span>
                <h1 className="text-lg font-semibold tracking-tight">
                  Daily Progress
                </h1>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Stay consistent every single day.
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link'
              }
            >
              <FiHome className="text-lg" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/tasks"
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link'
              }
            >
              <FiCheckSquare className="text-lg" />
              <span>Tasks</span>
            </NavLink>
            <NavLink
              to="/habits"
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link'
              }
            >
              <FiGrid className="text-lg" />
              <span>Daily tasks grid</span>
            </NavLink>
            <NavLink
              to="/goals"
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link'
              }
            >
              <FiTarget className="text-lg" />
              <span>Goals</span>
            </NavLink>
            <NavLink
              to="/notes"
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link'
              }
            >
              <FiBookOpen className="text-lg" />
              <span>Notes</span>
            </NavLink>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link'
              }
            >
              <FiBarChart2 className="text-lg" />
              <span>Reports</span>
            </NavLink>
          </nav>

          <div className="mt-auto flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="btn-secondary flex items-center gap-2 px-3 py-2"
            >
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
              <span className="text-sm">
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </span>
            </button>
            <button
              type="button"
              onClick={logout}
              className="btn-secondary flex items-center gap-2 px-3 py-2"
            >
              <FiLogOut />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-4 md:px-8 py-4 md:py-8">
          {/* Top bar + navigation for mobile */}
          <header className="md:hidden mb-3 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold gradient-text">
                Daily Progress
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Welcome back{user ? `, ${user.name}` : ''}.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="btn-secondary flex items-center justify-center px-3 py-2"
              >
                {theme === 'dark' ? <FiSun /> : <FiMoon />}
              </button>
              <button
                type="button"
                onClick={logout}
                className="btn-secondary flex items-center justify-center px-3 py-2"
              >
                <FiLogOut />
              </button>
            </div>
          </header>

          {/* Mobile nav links */}
          <nav className="md:hidden mb-4 flex items-center gap-2 text-xs">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive
                  ? 'flex-1 sidebar-link-active justify-center'
                  : 'flex-1 sidebar-link justify-center'
              }
            >
              <FiHome className="text-base" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/tasks"
              className={({ isActive }) =>
                isActive
                  ? 'flex-1 sidebar-link-active justify-center'
                  : 'flex-1 sidebar-link justify-center'
              }
            >
              <FiCheckSquare className="text-base" />
              <span>Tasks</span>
            </NavLink>
            <NavLink
              to="/habits"
              className={({ isActive }) =>
                isActive
                  ? 'flex-1 sidebar-link-active justify-center'
                  : 'flex-1 sidebar-link justify-center'
              }
            >
              <FiGrid className="text-base" />
              <span>Daily tasks</span>
            </NavLink>
            <NavLink
              to="/goals"
              className={({ isActive }) =>
                isActive
                  ? 'flex-1 sidebar-link-active justify-center'
                  : 'flex-1 sidebar-link justify-center'
              }
            >
              <FiTarget className="text-base" />
              <span>Goals</span>
            </NavLink>
            <NavLink
              to="/notes"
              className={({ isActive }) =>
                isActive
                  ? 'flex-1 sidebar-link-active justify-center'
                  : 'flex-1 sidebar-link justify-center'
              }
            >
              <FiBookOpen className="text-base" />
              <span>Notes</span>
            </NavLink>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                isActive
                  ? 'flex-1 sidebar-link-active justify-center'
                  : 'flex-1 sidebar-link justify-center'
              }
            >
              <FiBarChart2 className="text-base" />
              <span>Reports</span>
            </NavLink>
          </nav>

          {/* Greeting */}
          <section className="mb-6 hidden md:flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Welcome back,
              </p>
              <h2 className="text-2xl font-semibold gradient-text">
                {user?.name || 'Productive human'}
              </h2>
            </div>
          </section>

          <div className="pb-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

