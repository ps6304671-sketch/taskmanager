import { useEffect, useState } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { useAuthStore } from '../store/useAuthStore';
import { Plus } from 'lucide-react';
import { api } from '../lib/api';

const Projects = () => {
  const { projects, fetchProjects, createProject, isLoading } = useProjectStore();
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [newProject, setNewProject] = useState({ name: '', description: '', assigned_to: '' });

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, [fetchProjects]);

  const fetchUsers = async () => {
    try {
      const data = await api.auth.getUsers();
      setUsersList(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createProject(newProject);
      setShowModal(false);
      setNewProject({ name: '', description: '', assigned_to: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Projects</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your team's projects.</p>
        </div>
        {(user?.role === 'Main Admin' || user?.role === 'Co-Admin') && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {isLoading ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No projects found. Create one to get started.</p>
          </div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>{project.name}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.5rem', flex: 1 }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {project.description || 'No description provided.'}
                </p>
                {project.assigned_to && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                    Lead: {project.assigned_to.full_name}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Created By: {project.created_by?.full_name || 'Admin'}</span>
                  <span>{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Create New Project</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Project Name</label>
                <input required className="input-field" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                <textarea className="input-field" rows={3} value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Assign Project Lead / Member</label>
                <select required className="input-field" value={newProject.assigned_to} onChange={e => setNewProject({...newProject, assigned_to: e.target.value})}>
                  <option value="">Select a user</option>
                  {usersList.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
