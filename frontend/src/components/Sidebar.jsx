import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, CheckSquare, LogOut, Users } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const Sidebar = () => {
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Projects', path: '/projects', icon: <Briefcase size={20} /> },
    { name: 'My Tasks', path: '/tasks', icon: <CheckSquare size={20} /> },
  ];

  const { user } = useAuthStore();
  const isAdmin = user && (user.role === 'Main Admin' || user.role === 'Co-Admin');
  
  if (isAdmin) {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: <Users size={20} /> });
  }

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      height: '100vh'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '3rem',
        color: 'var(--accent-primary)',
        fontWeight: 'bold',
        fontSize: '1.25rem'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          backgroundColor: 'var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <CheckSquare size={18} strokeWidth={3} />
        </div>
        NexxTask
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--border-radius-sm)',
              color: isActive ? 'white' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
              fontWeight: isActive ? '600' : '500',
              transition: 'all var(--transition-fast)',
              border: isActive ? 'none' : '1px solid transparent'
            })}
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <button 
        onClick={handleLogout}
        className="btn"
        style={{
          marginTop: 'auto',
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          justifyContent: 'flex-start',
          padding: '0.75rem 1rem',
          border: '1px solid var(--border-color)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.color = 'var(--status-danger)';
          e.currentTarget.style.borderColor = 'var(--status-danger)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.borderColor = 'var(--border-color)';
        }}
      >
        <LogOut size={20} />
        Log Out
      </button>
    </aside>
  );
};

export default Sidebar;
