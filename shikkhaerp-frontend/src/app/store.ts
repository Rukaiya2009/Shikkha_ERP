import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  currentSchoolId: string | null;
  notificationCount: number;
  isLoading: boolean;
  
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setCurrentSchool: (schoolId: string) => void;
  setNotificationCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'light',
      currentSchoolId: null,
      notificationCount: 0,
      isLoading: false,
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
      setCurrentSchool: (currentSchoolId) => set({ currentSchoolId }),
      setNotificationCount: (notificationCount) => set({ notificationCount }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'app-storage',
    }
  )
);
