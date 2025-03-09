import { supabase } from "./client";

const isBrowser = typeof window !== "undefined";

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

  if (data && isBrowser) {
    sessionStorage.setItem("user_id", data.user_id);
    sessionStorage.setItem("username", username);
  }

  if (error || !data) return null;
  return data.user_id;
}

