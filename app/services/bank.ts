import { supabase } from "./client";

export const getWalletBalance = async (username: string): Promise<number> => {
  const { data, error } = await supabase
    .from("User")
    .select("balance")
    .eq("username", username)
    .single();

  if (error || !data) throw error || new Error("No data found");

  return data.balance;
};

export const updateBalance = async (
  username: string,
  amount: number,
  type: "add" | "subtract"
): Promise<any> => {
  const { data, error } = await supabase
    .from("User")
    .select("balance")
    .eq("username", username)
    .single();

  if (error || !data) throw error || new Error("No data found");

  const newBalance =
    type === "add" ? data.balance + amount : data.balance - amount;

  const { data: updatedData, error: updateError } = await supabase
    .from("User")
    .update({ balance: newBalance })
    .eq("username", username)
    .single();

  if (updateError) throw updateError;

  return updatedData;
};

export const checkBalance = async (
  username: string,
  amount: number
): Promise<any> => {
  const { data, error } = await supabase
    .from("User")
    .select("balance")
    .eq("username", username)
    .single();

  if (error || !data) throw error || new Error("No data found");

  if (data.balance < amount) throw new Error("Insufficient funds");

  return data;
};
