import { create } from "zustand";
import { User } from "../lib/types/user";

type StoreState = {
  balance: number;
  setBalance: (balance: number) => void;
  user: User | null;
  setUser: (user: User | null) => void;
};

export const useMemory = create<StoreState>((set) => ({
  balance: 0,
  setBalance: (balance) => set({ balance }),
  user: null,
  setUser: (user) => set({ user }),
}));
