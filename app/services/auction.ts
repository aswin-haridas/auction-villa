import { supabase } from "./client";

// Types
interface User {
  username: string;
  balance: number;
}

interface Auction {
  id: string;
  name: string;
  price: number;
  endTime: number;
  owner: string;
  highestBid: number;
  highestBidder?: string;
  buyOutPrice: number;
  image: string[];
  category: string;
  status: string;
  buyer?: string;
}

interface Bid {
  bid_id: string;
  user_id: string;
  amount: number;
  timestamp: string;
  auction_id: string;
}

// Utility function to get authenticated username
const getAuthenticatedUsername = (): string => {
  const username = sessionStorage.getItem("username");
  if (!username) throw new Error("User not authenticated");
  return username;
};

// Buy out an auction item
export const buyOutItem = async (buyOutPrice: number, itemId: string): Promise<void> => {
  const username = getAuthenticatedUsername();

  const { data: user, error: userError } = await supabase
    .from("User")
    .select("balance")
    .eq("username", username)
    .single();

  if (userError) throw userError;
  if (!user) throw new Error("User not found");
  if (user.balance < buyOutPrice) throw new Error("Insufficient funds");

  const { error: transactionError } = await supabase.rpc("buy_out_item", {
    p_username: username,
    p_item_id: itemId,
    p_buyout_price: buyOutPrice
  });

  if (transactionError) throw transactionError;
};

// Leave an auction
export const leaveAuction = async (itemId: string): Promise<void> => {
  const username = getAuthenticatedUsername();

  const { error } = await supabase
    .from("AuctionParticipants")
    .delete()
    .match({ username, auction_id: itemId });

  if (error) throw error;
};

// Place a bid
export const placeBid = async (amount: number, itemId: string): Promise<void> => {
  const username = getAuthenticatedUsername();

  const { data: auction, error: auctionError } = await supabase
    .from("Auction")
    .select("highestBid, status")
    .eq("id", itemId)
    .single();

  if (auctionError) throw auctionError;
  if (!auction) throw new Error("Auction not found");
  if (auction.status === "sold") throw new Error("Auction already sold");
  if (amount <= auction.highestBid) throw new Error("Bid too low");

  const { data: user, error: userError } = await supabase
    .from("User")
    .select("balance")
    .eq("username", username)
    .single();

  if (userError) throw userError;
  if (!user) throw new Error("User not found");
  if (user.balance < amount) throw new Error("Insufficient funds");

  const { error: transactionError } = await supabase.rpc("place_bid", {
    p_amount: amount,
    p_item_id: itemId,
    p_username: username
  });

  if (transactionError) throw transactionError;
};

// Fetch auction data
export const fetchAuctionData = async (itemId: string): Promise<Auction> => {
  const { data, error } = await supabase
    .from("Auction")
    .select("*")
    .eq("id", itemId)
    .single();

  if (error) throw error;
  if (!data) throw new Error("Auction not found");

  return data as Auction;
};

// Fetch highest bid
export const fetchHighestBidData = async (itemId: string): Promise<number> => {
  const { data, error } = await supabase
    .from("Auction")
    .select("highestBid")
    .eq("id", itemId)
    .single();

  if (error) throw error;
  if (!data) throw new Error("Auction not found");

  return data.highestBid ?? 0;
};

// Fetch highest bidder
export const fetchHighestBidder = async (itemId: string): Promise<string> => {
  const { data, error } = await supabase
    .from("Bid")
    .select("user_id")
    .eq("auction_id", itemId)
    .order("amount", { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;
  if (!data) return "";

  return data.user_id;
};

// Subscriptions
export const subscribeToAuctionUpdates = (
  itemId: string,
  callback: (data: Auction) => void
) => supabase
  .channel(`auction:${itemId}`)
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "Auction",
      filter: `id=eq.${itemId}`,
    },
    (payload) => callback(payload.new as Auction)
  )
  .subscribe();

export const subscribeToBidUpdates = (
  itemId: string,
  callback: (data: Bid) => void
) => supabase
  .channel(`bids:${itemId}`)
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "Bid",
      filter: `auction_id=eq.${itemId}`,
    },
    (payload) => callback(payload.new as Bid)
  )
  .subscribe();