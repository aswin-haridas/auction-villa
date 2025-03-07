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
    sessionStorage.setItem("username", username);
    return true;
  }

  return false;
}

export function getUserId(): string | null {
  return sessionStorage.getItem("user_id");
}

export function getUsername(): string | null {
  return sessionStorage.getItem("username");
}

export function useSignOut(): () => void {
  return () => {
    sessionStorage.removeItem("user_id");
    sessionStorage.removeItem("username");
  };
}

export function goToLogin() {
  redirect("/auth");
}
