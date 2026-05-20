import { useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useProjectStore } from '../store/useProjectStore';
import { useAuthStore } from '../store/useAuthStore';
import { CheckCircle2, Clock, AlertCircle, LayoutList } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { tasks, fetchTasks, isLoading: tasksLoading } = useTaskStore();
  const { projects, fetchProjects, isLoading: projectsLoading } = useProjectStore();

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, [fetchTasks, fetchProjects]);

  const stats = [
    { 
      label: 'Total Projects', 
      value: projects.length, 
      icon: <LayoutList size={24} color="var(--accent-primary)" />,
      bg: 'var(--bg-tertiary)'
    },
    { 
      label: 'Tasks Completed', 
      value: tasks.filter(t => t.status === 'Done').length, 
      icon: <CheckCircle2 size={24} color="var(--status-done)" />,
      bg: 'var(--bg-tertiary)'
    },
    { 
      label: 'In Progress', 
      value: tasks.filter(t => t.status === 'In Progress').length, 
      icon: <Clock size={24} color="var(--status-in-progress)" />,
      bg: 'var(--bg-tertiary)'
    },
    { 
      label: 'To Do', 
      value: tasks.filter(t => t.status === 'To Do').length, 
      icon: <AlertCircle size={24} color="var(--status-todo)" />,
      bg: 'var(--bg-tertiary)'
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Logged in as: <strong>{user?.full_name} ({user?.role})</strong></p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {stats.map((stat, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: stat.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {projectsLoading || tasksLoading ? '...' : stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="card" style={{ minHeight: '400px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Recent Tasks</h2>
          {tasksLoading ? (
            <p>Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No tasks found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tasks.slice(0, 5).map(task => (
                <div key={task.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 'var(--border-radius-md)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{task.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Project: {task.project_id?.name || 'Unknown'}
                    </div>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '2rem',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    backgroundColor: task.status === 'Done' ? 'rgba(16, 185, 129, 0.1)' : 
                                     task.status === 'In Progress' ? 'rgba(59, 130, 246, 0.1)' : 
                                     'rgba(100, 116, 139, 0.1)',
                    color: task.status === 'Done' ? 'var(--status-done)' : 
                           task.status === 'In Progress' ? 'var(--status-in-progress)' : 
                           'var(--text-secondary)'
                  }}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="card" style={{ minHeight: '400px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Active Projects</h2>
          {projectsLoading ? (
            <p>Loading projects...</p>
          ) : projects.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No projects found.</p>
          ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {projects.slice(0, 5).map(project => (
                <div key={project.id} style={{
                  padding: '1rem',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 'var(--border-radius-md)',
                  border: '1px solid var(--border-color)',
                  borderLeft: '4px solid var(--accent-primary)'
                }}>
                  <div style={{ fontWeight: '500' }}>{project.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Created by: {project.created_by?.full_name || 'Admin'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
