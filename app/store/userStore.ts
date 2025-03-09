import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginUser, logoutUser } from "@/app/services/user";

interface UserState {
  userId: string | null;
  username: string | null;
  isLoggedIn: boolean;
  balance: number | null;
  
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setBalance: (balance: number) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      username: null,
      isLoggedIn: false,
      balance: null,
      
      login: async (username, password) => {
        const userId = await loginUser(username, password);
        if (userId) {
          set({ userId, username, isLoggedIn: true });
          return true;
        }
        return false;
      },
      
      logout: () => {
        logoutUser();
        set({ userId: null, username: null, isLoggedIn: false, balance: null });
      },
      
      setBalance: (balance) => {
        set({ balance });
      }
    }),
    {
      name: "user-storage",
      skipHydration: true, // Avoid hydration issues
    }
  )
);