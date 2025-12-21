import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

export const useStore = create(
  persist(
    (set) => ({
      // --- AUTH STATE ---
      user: null,
      isAuthenticated: false,
      sidebarOpen: true,
      
      // --- DATA STATE (Initialized with empty arrays to prevent crashes) ---
      sosRequests: [], 
      hazards: [],      // <--- Crucial fix: Prevents map crash
      rescueUnits: [],  // <--- Crucial fix: Prevents map crash
      alerts: [], 

      // --- ACTIONS ---
      login: (userData) => set({ user: userData, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
      
      // Update local user data without logging out (for Family/Group updates)
      updateUser: (updates) => set((state) => ({
        user: { ...state.user, ...updates }
      })),

      // Placeholder for refresh logic if needed later
      refreshUser: async (email) => { /* logic to re-fetch user profile */ },

      // --- ASYNC DATA ACTIONS ---

      // 1. Fetch Active SOS Alerts
      fetchSOS: async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/sos/active');
          if (res.data) set({ sosRequests: res.data });
        } catch (error) {
          console.error("Failed to fetch SOS:", error);
        }
      },

      // 2. Resolve (Cancel) an SOS Alert
      resolveSOS: async (sosId) => {
        try {
          // Tell backend to mark as resolved
          await axios.post('http://localhost:5000/api/sos/resolve', { sosId });
          
          // Optimistically remove from local state immediately
          set((state) => ({
            sosRequests: state.sosRequests.filter(s => s._id !== sosId)
          }));
        } catch (error) {
          console.error("Failed to resolve SOS:", error);
        }
      },

      updateSOSDetails: async (sosId, detailsData) => {
        try {
          await axios.put(`http://localhost:5000/api/sos/update/${sosId}`, detailsData);
          // Refresh list to show updated info
          const res = await axios.get('http://localhost:5000/api/sos/active');
          if (res.data) set({ sosRequests: res.data });
        } catch (error) {
          console.error("Failed to update SOS details:", error);
        }
      },

      // 3. Fetch Broadcast Alerts
      fetchBroadcasts: async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/broadcast/active');
          if (res.data) set({ alerts: res.data });
        } catch (error) {
          console.error("Failed to fetch alerts:", error);
        }
      },
      fetchHazards: async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/community/hazards');
          if (res.data) set({ hazards: res.data });
        } catch (error) { console.error(error); }
      },
    }),
    {
      name: 'resq-connect-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);