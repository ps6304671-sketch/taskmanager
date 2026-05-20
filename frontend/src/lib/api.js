import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const fetchWithAuth = async (url, options = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const localToken = localStorage.getItem('token');

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  } else if (localToken) {
    headers.Authorization = `Bearer ${localToken}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'API Request Failed');
  }

  return data;
};

export const api = {
  auth: {
    signup: (data) => fetchWithAuth('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    getMe: () => fetchWithAuth('/auth/me'),
    getUsers: () => fetchWithAuth('/auth/users'),
  },
  projects: {
    getAll: () => fetchWithAuth('/projects'),
    getById: (id) => fetchWithAuth(`/projects/${id}`),
    create: (data) => fetchWithAuth('/projects', { method: 'POST', body: JSON.stringify(data) }),
  },
  tasks: {
    getAll: (projectId) => fetchWithAuth(projectId ? `/tasks?projectId=${projectId}` : '/tasks'),
    create: (data) => fetchWithAuth('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchWithAuth(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  notifications: {
    getAll: () => fetchWithAuth('/notifications'),
    markAsRead: (id) => fetchWithAuth(`/notifications/${id}/read`, { method: 'PUT' }),
  }
};
