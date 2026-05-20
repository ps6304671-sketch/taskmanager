import { useEffect, useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useProjectStore } from '../store/useProjectStore';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../lib/api';
import { Plus } from 'lucide-react';

const Tasks = () => {
  const { tasks, fetchTasks, createTask, updateTask, isLoading } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', project_id: '', assigned_to: '', checklist: [] });
  const [newChecklistItem, setNewChecklistItem] = useState('');

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchUsers();
  }, [fetchTasks, fetchProjects]);

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
      await createTask(newTask);
      setShowModal(false);
      setNewTask({ title: '', description: '', project_id: '', assigned_to: '', checklist: [] });
      setNewChecklistItem('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddChecklist = () => {
    if (newChecklistItem.trim() !== '') {
      setNewTask({
        ...newTask,
        checklist: [...newTask.checklist, { id: Date.now().toString(), text: newChecklistItem, completed: false }]
      });
      setNewChecklistItem('');
    }
  };

  const handleToggleChecklist = async (task, itemId) => {
    const updatedChecklist = (task.checklist || []).map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    await updateTask(task.id, { checklist: updatedChecklist });
  };

  const handleSubmitTask = async (taskId) => {
    await updateTask(taskId, { status: 'Done' });
  };

  const statuses = ['To Do', 'In Progress', 'Done'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Tasks</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track and manage project tasks.</p>
        </div>
        {(user?.role === 'Main Admin' || user?.role === 'Co-Admin') && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Task
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
        {statuses.map(status => (
          <div key={status} style={{ 
            flex: 1, 
            minWidth: '320px', 
            backgroundColor: 'var(--bg-tertiary)', 
            borderRadius: 'var(--border-radius-sm)', 
            padding: '1.25rem',
            border: '1px solid var(--border-color)',
            borderTop: `4px solid ${status === 'Done' ? 'var(--status-done)' : (status === 'In Progress' ? 'var(--status-in-progress)' : 'var(--status-todo)')}`
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
              {status}
              <span style={{ fontSize: '0.8rem', backgroundColor: 'var(--bg-secondary)', padding: '0.2rem 0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
                {tasks.filter(t => t.status === status).length}
              </span>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tasks.filter(t => t.status === status).map(task => (
                <div key={task.id} className="card" style={{ padding: '1rem' }}>
                  <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{task.title}</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{task.description}</p>
                  
                  {task.checklist && task.checklist.length > 0 && (
                    <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <h5 style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Checklist</h5>
                      {task.checklist.map(item => (
                        <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                          <input 
                            type="checkbox" 
                            checked={item.completed}
                            onChange={() => handleToggleChecklist(task, item.id)}
                            disabled={user?.role !== 'Member'} // Only members check off their tasks? Let admins do it too for testing
                          />
                          <span style={{ textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                            {item.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {task.project_id?.name || 'No Project'}
                    </div>
                    
                    {user?.role === 'Member' ? (
                      task.status !== 'Done' ? (
                        <button 
                          onClick={() => handleSubmitTask(task.id)}
                          className="btn btn-primary"
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                        >
                          Submit Task
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--status-done)', fontWeight: 'bold' }}>Completed</span>
                      )
                    ) : (
                      <select 
                        value={task.status} 
                        onChange={(e) => updateTask(task.id, { status: e.target.value })}
                        style={{ 
                          backgroundColor: 'var(--bg-primary)', 
                          color: 'var(--text-primary)', 
                          border: '1px solid var(--border-color)', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '0.25rem',
                          fontSize: '0.8rem'
                        }}
                      >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Create New Task</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Project</label>
                <select required className="input-field" value={newTask.project_id} onChange={e => setNewTask({...newTask, project_id: e.target.value})}>
                  <option value="">Select a project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Assign To</label>
                <select required className="input-field" value={newTask.assigned_to} onChange={e => setNewTask({...newTask, assigned_to: e.target.value})}>
                  <option value="">Select a member</option>
                  {usersList.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Task Title</label>
                <input required className="input-field" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                <textarea className="input-field" rows={3} value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Checklist Items (Optional)</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input className="input-field" value={newChecklistItem} onChange={e => setNewChecklistItem(e.target.value)} placeholder="Add item..." onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); handleAddChecklist(); } }} />
                  <button type="button" className="btn btn-secondary" onClick={handleAddChecklist}>Add</button>
                </div>
                {newTask.checklist.length > 0 && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {newTask.checklist.map(item => (
                      <li key={item.id} style={{ fontSize: '0.85rem', padding: '0.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
                        • {item.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
