"use client";
import { supabase } from "@/app/services/client";

export const getWalletBalance = async (): Promise<number> => {
  const user_id = sessionStorage.getItem("user_id");
  const { data, error } = await supabase
    .from("User")
    .select("balance")
    .eq("user_id", user_id)
    .single();

  if (data) {
    sessionStorage.setItem("balance", data.balance);
  }

  if (error || !data) throw error || new Error("No data found");

  return data.balance;
};
