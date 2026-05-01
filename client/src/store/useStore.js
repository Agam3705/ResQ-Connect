import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

export const useStore = create(
  persist(
    (set, get) => ({
      // --- AUTH STATE ---
      user: null,
      token: null,
      isAuthenticated: false,
      sidebarOpen: true,
      
      // --- DATA STATE ---
      sosRequests: [], 
      hazards: [],
      rescueUnits: [],
      alerts: [],
      disasters: [],

      // --- AUTH ACTIONS ---
      login: (userData, token) => {
        set({ 
          user: userData, 
          token: token, 
          isAuthenticated: true 
        });
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, sosRequests: [] });
      },
      
      setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
      
      updateUser: (updates) => set((state) => ({
        user: { ...state.user, ...updates }
      })),

      // --- ASYNC DATA ACTIONS ---

      fetchSOS: async () => {
        try {
          const res = await api.get('/api/sos/active');
          if (Array.isArray(res.data)) {
            set({ sosRequests: res.data });
          }
        } catch (error) {
          // Silent - SOS fetch failures are non-critical on dashboard load
        }
      },

      resolveSOS: async (sosId) => {
        try {
          await api.post('/api/sos/resolve', { sosId });
          // Immediately remove from local state
          set((state) => ({
            sosRequests: state.sosRequests.filter(s => s._id !== sosId)
          }));
        } catch (error) {
          console.error("Failed to resolve SOS:", error);
          throw error;
        }
      },

      updateSOSDetails: async (sosId, detailsData) => {
        try {
          await api.put(`/api/sos/update/${sosId}`, detailsData);
          // Refresh
          const res = await api.get('/api/sos/active');
          if (Array.isArray(res.data)) set({ sosRequests: res.data });
        } catch (error) {
          console.error("Failed to update SOS details:", error);
          throw error;
        }
      },

      assignSOS: async (sosId, agencyId, agencyName, notes) => {
        try {
          await api.put(`/api/sos/assign/${sosId}`, { agencyId, agencyName, notes });
          const res = await api.get('/api/sos/active');
          if (Array.isArray(res.data)) set({ sosRequests: res.data });
        } catch (error) {
          console.error("Failed to assign SOS:", error);
          throw error;
        }
      },

      updateSOSStatus: async (sosId, status, notes) => {
        try {
          await api.put(`/api/sos/status/${sosId}`, { status, notes });
          const res = await api.get('/api/sos/active');
          if (Array.isArray(res.data)) set({ sosRequests: res.data });
        } catch (error) {
          console.error("Failed to update SOS status:", error);
          throw error;
        }
      },

      fetchHazards: async () => {
        try {
          const res = await api.get('/api/community/hazards');
          if (Array.isArray(res.data)) set({ hazards: res.data });
        } catch (error) { console.error(error); }
      },
    }),
    {
      name: 'resq-connect-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);