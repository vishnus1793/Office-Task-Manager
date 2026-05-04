import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Avatar } from '../ui';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
  { to: '/tasks', label: 'My Tasks' }
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col
        transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
        style={{
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)'
        }}
      >

        {/* 🔥 HEADER (Taskflow Title) */}
        <div className="p-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3">

            {/* Logo */}
            <div
              className="flex items-center justify-center rounded-xl"
              style={{
                width: '40px',
                height: '40px',
                background: 'var(--color-brand)',
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              T
            </div>

            {/* Title */}
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '700' }}>
                Taskflow
              </h1>
              <p style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                Team Manager
              </p>
            </div>

          </div>
        </div>

        {/* 🔥 NAVIGATION */}
        <nav className="flex-1 p-4">
          <p
            className="mb-3"
            style={{
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-muted)'
            }}
          >
            Navigation
          </p>

          <div className="space-y-2">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all`
                }
                style={({ isActive }) => ({
                  background: isActive ? 'var(--color-brand)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--color-muted)'
                })}
              >
                {label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* 🔥 BOTTOM SECTION */}
        <div className="p-4" style={{ borderTop: '1px solid var(--color-border)' }}>

          {/* Theme Toggle */}
          <button
            onClick={toggle}
            className="btn btn-secondary w-full mb-3"
          >
            {dark ? '☀ Light Mode' : '🌙 Dark Mode'}
          </button>

          {/* User */}
          <div className="flex items-center gap-3 mb-3">
            <Avatar user={user} size="sm" />
            <div>
              <p style={{ fontWeight: 600 }}>{user?.name}</p>
              <p style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                {user?.role}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="btn btn-danger w-full"
          >
            Sign Out
          </button>

        </div>

      </aside>
    </>
  );
};

export default Sidebar;