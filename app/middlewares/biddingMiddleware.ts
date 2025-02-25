import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types_db";
import { Session, User } from "@supabase/supabase-js";
import { decode } from "jsonwebtoken";
import { cookies } from "next/headers";

interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  sessionCookieName: string;
}

const config: SupabaseConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  sessionCookieName: "sb:token", // Default cookie name, can be overridden
};

const supabase = createClient<Database>(config.supabaseUrl, config.supabaseAnonKey);

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

export const placeBid = async (amount: number, auctionId: string) => {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("You must be logged in to place a bid.");
  }
  const { data, error } = await supabase
    .from("Bid")
    .insert([{ amount, auction_id: auctionId, user_id: session.user.id }]);
  if (error) {
    throw new Error(`Error placing bid: ${error.message}`);
  }
  return { data, error };
};

export const buyOutItem = async (buyOutPrice: number, auctionId: string) => {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("You must be logged in to buy out an item.");
  }
  const { data, error } = await supabase
    .from("Auction")
    .update({ status: "bought_out", currentBid: buyOutPrice })
    .eq("id", auctionId);
  if (error) {
    throw new Error(`Error buying out item: ${error.message}`);
  }
  return { data, error };
};

export const leaveAuction = async (auctionId: string, userId: string | null) => {
  if (!userId) {
    throw new Error("You must be logged in to leave an auction.");
  }
  const { data, error } = await supabase
    .from("Bid")
    .delete()
    .eq("auction_id", auctionId)
    .eq("user_id", userId);
  if (error) {
    throw new Error(`Error leaving auction: ${error.message}`);
  }
  return { data, error };
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

const getSession = async (): Promise<Session | null> => {
  const cookie = cookies().get(config.sessionCookieName);
  if (!cookie) return null;
  try {
    const decoded = decode(cookie.value) as User;
    return {
      user: decoded,
      expires_in: 3600,
      refresh_token: "",
      access_token: "",
      token_type: "",
    };
  } catch (error) {
    console.error("Error decoding session token:", error);
    return null;
  }
};
