import { create } from 'zustand';

interface DashboardState {
  isWorking: boolean;
  toggleIsWorking: () => void;
  incomeEarned: number;
  roomsVisited: number;
  // Placeholder for actions to update incomeEarned and roomsVisited if needed
}

export const useDashboardStore = create<DashboardState>((set) => ({
  isWorking: false,
  toggleIsWorking: () => set((state) => ({ isWorking: !state.isWorking })),
  incomeEarned: 0, // Placeholder value
  roomsVisited: 0, // Placeholder value
}));
