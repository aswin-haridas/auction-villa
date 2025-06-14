import { create } from "zustand";

type StoreState = {
  balance: number;
  setBalance: (balance: number) => void;
};

export const useMemory = create<StoreState>((set) => ({
  balance: 0,
  setBalance: (balance) => set({ balance }),
}));
