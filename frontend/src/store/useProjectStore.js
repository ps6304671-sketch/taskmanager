import { create } from 'zustand';
import { api } from '../lib/api';

export const useProjectStore = create((set) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.projects.getAll();
      set({ projects: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchProjectById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.projects.getById(id);
      set({ currentProject: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createProject: async (projectData) => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.projects.create(projectData);
      set((state) => ({ 
        projects: [data, ...state.projects],
        isLoading: false 
      }));
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));
