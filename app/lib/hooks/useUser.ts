import { supabase } from "../../services/client";

export function useUser() {
  const loginUser = async (username: string, password: string) => {
    const { data, error } = await supabase
      .from("User")
      .select("user_id, username")
      .eq("username", username)
      .eq("password", password)
      .single();

    if (error || !data) return null;
    localStorage.setItem("user", JSON.stringify(data));
    return data;
  };

  const getUser = () => {
    const user = localStorage.getItem("user");
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return null;
    }
  };

  const logoutUser = () => {
    localStorage.clear();
  };

  return { loginUser, logoutUser, getUser };
}
