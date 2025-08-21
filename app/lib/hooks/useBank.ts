"use client";
import { useMemory } from "@/app/store/store";
import { supabase } from "@/app/services/client";

async function useBank() {
  const { balance, username, setBalance } = useMemory((state) => ({
    username: state.username,
    balance: state.balance,
    setBalance: state.setBalance,
  }));

  if (!username) {
    return balance;
  }

  try {
    const { data, error } = await supabase
      .from("User")
      .select("balance")
      .eq("username", username)
      .single();
    if (error) {
      console.log("error updating bank");
      return balance;
    }
    if (data) {
      setBalance(data.balance);
    }
  } catch (error) {
    console.log("error in useBank:", error);
  }
  return balance;
}
export default useBank;
