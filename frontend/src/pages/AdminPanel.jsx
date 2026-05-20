import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../lib/api';
import { UserPlus, Users } from 'lucide-react';

const AdminPanel = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Member');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await api.auth.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await api.auth.signup({ email, password, full_name: fullName, role });
      setSuccessMessage('User created successfully!');
      setEmail('');
      setPassword('');
      setFullName('');
      setRole('Member');
      fetchUsers(); // Refresh list
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (!user || (user.role !== 'Main Admin' && user.role !== 'Co-Admin')) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Access Denied</h2>
        <p style={{ color: 'var(--text-muted)' }}>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Admin Panel</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your organization's users</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Create User Form */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-sm)' }}>
              <UserPlus size={20} color="var(--accent-primary)" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Create User</h2>
          </div>

          {error && (
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--status-danger)', borderRadius: 'var(--border-radius-md)', color: 'var(--status-danger)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}
          
          {successMessage && (
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--status-done)', borderRadius: 'var(--border-radius-md)', color: 'var(--status-done)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {successMessage}
            </div>
          )}

          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Full Name</label>
              <input type="text" required className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email</label>
              <input type="email" required className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Password</label>
              <input type="text" required className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Temporary Password" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Role</label>
              <select className="input-field" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="Member">Member</option>
                {user.role === 'Main Admin' && <option value="Co-Admin">Co-Admin</option>}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>

        {/* User List */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-sm)' }}>
              <Users size={20} color="var(--accent-primary)" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>All Users</h2>
          </div>

          {isLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading users...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {users.map((u) => (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: '500' }}>{u.full_name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </div>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '1rem', 
                    fontSize: '0.8rem', 
                    fontWeight: '600',
                    backgroundColor: u.role === 'Main Admin' ? 'rgba(99, 102, 241, 0.15)' : (u.role === 'Co-Admin' ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-tertiary)'),
                    color: u.role === 'Main Admin' ? 'var(--accent-primary)' : (u.role === 'Co-Admin' ? 'var(--accent-secondary)' : 'var(--text-primary)')
                  }}>
                    {u.role}
                  </span>
                </div>
              ))}
              {users.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No users found.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
