import { supabase } from "./client";

export async function loginUser(
  username: string,
  password: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("User")
    .select("user_id")
    .eq("username", username)
    .eq("password", password)
    .single();

  if (data) {
    sessionStorage.setItem("user_id", data.user_id);
    sessionStorage.setItem("username", username);
  }

  if (error || !data) return null;
  return data.user_id;
}

export async function logoutUser(): Promise<void> {
  sessionStorage.removeItem("user_id");
  sessionStorage.removeItem("username");
}

