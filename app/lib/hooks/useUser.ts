import { useMemory } from "../../store/store";

export function useUser() {
  const { setUsername } = useMemory();

  const loginUser = async (username: string) => {
    // Simply store the username in Zustand without any validation
    setUsername(username);
    return { username };
  };

  const getUser = () => {
    const { username } = useMemory.getState();
    return username ? { username } : null;
  };

  const logoutUser = () => {
    setUsername(null);
  };

  return { loginUser, logoutUser, getUser };
}
