import { supabase } from "./client";

export const setAuctionStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from("Auctions")
    .update({ status })
    .match({ id });

  if (error) {
    console.log("Error updating auction status", error);
    return null;
  }

  return data;
};

export const getHighestBidder = async (auctionId: string) => {
  const { data, error } = await supabase
    .from("Bid")
    .select("user_id, amount")
    .eq("auction_id", auctionId)
    .order("amount", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.log("Error fetching highest bidder", error);
    return null;
  }

  return data;
};

export const getHighestBid = async (auctionId: string) => {
  const { data, error } = await supabase
    .from("Bid")
    .select("amount")
    .eq("auction_id", auctionId)
    .order("amount", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.log("Error fetching highest bid", error);
    return null;
  }

  return data;
};

export const saveBid = async (bid: {
  bid_id: string;
  user_id: string;
  amount: number;
  timestamp: string;
  auction_id: string;
}) => {
  const { data, error } = await supabase.from("Bid").insert([bid]);

  if (error) {
    console.log("Error saving bid", error);
    return null;
  }

  return data;
};


export const getBids = async (auctionId: string) => {
  const { data, error } = await supabase
    .from("Bid")
    .select("*")
    .eq("auction_id", auctionId)
    .order("timestamp", { ascending: true });

  if (error) {
    console.log("Error fetching bids", error);
    return null;
  }

  return data;
}