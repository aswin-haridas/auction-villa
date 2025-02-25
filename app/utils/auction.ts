import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types_db";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const fetchAuctionData = async (id: string) => {
  const { data, error } = await supabase
    .from("Auction")
    .select("*")
    .eq("id", id)
    .single();
  return { data, error };
};

export const fetchHighestBidData = async (id: string) => {
  const { data, error } = await supabase
    .from("Bid")
    .select("amount")
    .eq("auction_id", id)
    .order("amount", { ascending: false })
    .limit(1)
    .single();
  return { data, error };
};

export const fetchHighestBidder = async (id: string) => {
  const { data, error } = await supabase
    .from("Bid")
    .select("user_id")
    .eq("auction_id", id)
    .order("amount", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return {  null, error };

  const {  userData, error: userError } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", data.user_id)
    .single();

  return {  userData, error: userError };
};

export const subscribeToAuctionUpdates = (
  auctionId: string,
  callback: (payload: { new: any; old: any }) => void
) => {
  return supabase
    .channel(`auction-${auctionId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "Auction",
        filter: `id=eq.${auctionId}`,
      },
      callback
    )
    .subscribe();
};

export const subscribeToBidUpdates = (
  auctionId: string,
  callback: (payload: { new: any; old: any }) => void
) => {
  return supabase
    .channel(`bid-${auctionId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "Bid",
        filter: `auction_id=eq.${auctionId}`,
      },
      callback
    )
    .subscribe();
};
