import { create } from 'zustand';
import { api } from '../lib/api';

export const useTaskStore = create((set) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async (projectId = null) => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.tasks.getAll(projectId);
      set({ tasks: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createTask: async (taskData) => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.tasks.create(taskData);
      set((state) => ({ 
        tasks: [data, ...state.tasks],
        isLoading: false 
      }));
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateTask: async (taskId, updateData) => {
    try {
      set({ error: null });
      // Optimistic UI update
      set((state) => ({
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updateData } : t)
      }));
      
      await api.tasks.update(taskId, updateData);
    } catch (error) {
      // Revert if error
      set({ error: error.message });
      throw error;
    }
  }
}));
