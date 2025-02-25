import { supabase } from "./client";

// Get wallet balance
export const getWalletBalance = async (username: string): Promise<number> => {
  const { data, error } = await supabase
    .from("User")
    .select("balance")
    .eq("username", username)
    .single();
  
  if (error || !data) {
    throw error || new Error("No data found");
  }

  return data.balance;
};

// Update balance
export const updateBalance = async (username: string, amount: number, type: "add" | "subtract"): Promise<any> => {
  // Get the current balance
  const { data, error } = await supabase
    .from("User")
    .select("balance")
    .eq("username", username)
    .single();

  if (error || !data) {
    throw error || new Error("No data found");
  }

  const currentBalance: number = data.balance;

  let newBalance: number;
  if (type === "add") {
    newBalance = currentBalance + amount;
  } else if (type === "subtract") {
    newBalance = currentBalance - amount;
  } else {
    throw new Error("Invalid type. Must be 'add' or 'subtract'");
  }

  // Update the balance in the database
  const { data: updatedData, error: updateError } = await supabase
    .from("User")
    .update({ balance: newBalance })
    .eq("username", username)
    .single();

  if (updateError) {
    throw updateError;
  }

  return updatedData;
};

// Check balance
export const checkBalance = async (username: string, amount: number): Promise<any> => {
  const { data, error } = await supabase
    .from("User")
    .select("balance")
    .eq("username", username)
    .single();
  
  if (error || !data) {
    throw error || new Error("No data found");
  }
  
  if (data.balance < amount) {
    throw new Error("Insufficient funds");
  }
  return data;
};
