import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../lib/api';
import { Bell, Search, Check } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await api.notifications.getAll();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.notifications.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.5rem 2rem',
      backgroundColor: 'transparent',
      borderBottom: '1px solid var(--border-color)',
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '400px'
        }}>
          <Search 
            size={18} 
            style={{ 
              position: 'absolute', 
              left: '1rem', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} 
          />
          <input 
            type="text" 
            placeholder="Search projects or tasks..." 
            className="input-field"
            style={{ 
              paddingLeft: '2.5rem', 
              borderRadius: '2rem',
              backgroundColor: 'var(--bg-primary)'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative' }}>
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          style={{ color: 'var(--text-secondary)', position: 'relative' }}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--status-danger)',
              borderRadius: '50%'
            }}></span>
          )}
        </button>

        {showNotifications && (
          <div className="card animate-fade-in" style={{
            position: 'absolute',
            top: '3rem',
            right: '10rem',
            width: '300px',
            padding: '1rem',
            zIndex: 50,
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Notifications</h3>
            {notifications.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>No notifications</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div key={n.id} style={{ 
                    padding: '0.75rem', 
                    backgroundColor: n.is_read ? 'var(--bg-primary)' : 'rgba(99, 102, 241, 0.1)', 
                    borderRadius: 'var(--border-radius-sm)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{n.message}</p>
                    {!n.is_read && (
                      <button 
                        onClick={() => handleMarkAsRead(n.id)}
                        style={{ alignSelf: 'flex-start', color: 'var(--accent-primary)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Check size={12} /> Mark as read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--accent-primary)' }}>{user?.full_name || 'User'}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600' }}>{user?.role || 'Member'}</div>
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--border-radius-sm)',
            backgroundColor: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            border: '2px solid var(--bg-tertiary)'
          }}>
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
