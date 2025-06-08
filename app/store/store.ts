import { create } from "zustand";

type StoreState = {
  name: string;
  setName: (newName: string) => void;
};

export const useStore = create<StoreState>((set) => ({
  name: "###",
  setName: (newName) => set({ name: newName }),
}));
