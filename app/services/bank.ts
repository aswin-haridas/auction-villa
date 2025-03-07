import { supabase } from "./client";

export const getWalletBalance = async (): Promise<number> => {
  const user_id = sessionStorage.getItem("user_id");
  const { data, error } = await supabase
    .from("User")
    .select("balance")
    .eq("user_id", user_id)
    .single();

  if (error || !data) throw error || new Error("No data found");

  return data.balance;
};

export const updateBalance = async (
  user_id: string,
  amount: number,
  type: "add" | "subtract"
): Promise<any> => {
  const { data, error } = await supabase
    .from("User")
    .select("balance")
    .eq("user_id", user_id)
    .single();

  if (error || !data) throw error || new Error("No data found");

  const newBalance =
    type === "add" ? data.balance + amount : data.balance - amount;

  const { data: updatedData, error: updateError } = await supabase
    .from("User")
    .update({ balance: newBalance })
    .eq("user_id", user_id)
    .single();

  if (updateError) throw updateError;

  return updatedData;
};

export const checkBalance = async (
  user_id: string,
  amount: number
): Promise<any> => {
  const { data, error } = await supabase
    .from("User")
    .select("balance")
    .eq("user_id", user_id)
    .single();

  if (error || !data) throw error || new Error("No data found");

  if (data.balance < amount) throw new Error("Insufficient funds");

  return data;
};
