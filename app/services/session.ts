import { supabase } from "./client";
import { redirect } from "next/navigation";

export async function checkAuth(
  username: string,
  password: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("User")
    .select("user_id")
    .eq("username", username)
    .eq("password", password)
    .single();

  if (error) {
    console.error("Error checking user credentials:", error);
    return false;
  }

  if (data) {
    sessionStorage.setItem("user_id", data.user_id);
    return true;
  }

  return false;
}

export function getUserId(): string | null {
  const storedUserId = sessionStorage.getItem("user_id");
  return storedUserId ? storedUserId : null;
}

export async function getUsername(): Promise<string | null> {
  const userId = sessionStorage.getItem("user_id");

  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("User")
    .select("username")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching username:", error);
    return null;
  }

  return data ? data.username : null;
}

export function useSignOut(): () => void {
  return () => {
    sessionStorage.removeItem("user_id");
  };
}


export function goToLogin() {
  redirect("/auth");
}