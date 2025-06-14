"use client";
import { useMemory } from "@/app/store/store";
import { supabase } from "@/app/services/client";

async function useBank() {
  const { balance, user, setBalance } = useMemory((state) => ({
    user: state.user,
    balance: state.balance,
    setBalance: state.setBalance,
  }));

  const { data, error } = await supabase
    .from("User")
    .select("balance")
    .eq("user_id", user?.id)
    .single();
  if (error) {
    console.log("error updating bank");
    return;
  }
  if (data) {
    setBalance(data.balance);
  }
  return balance;
}
export default useBank;
