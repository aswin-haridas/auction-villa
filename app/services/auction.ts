import { supabase } from "@/app/services/client";
import { Auction } from "@/app/types/auction";

export const fetchAuction = async (
  auctionId: string
): Promise<Auction | null> => {
  const { data: auction, error } = await supabase
    .from("Auction")
    .select("*")
    .eq("id", auctionId)
    .single();

  if (error) {
    console.error("Error fetching auction:", error);
    return null;
  }

  return auction;
};

export const fetchBids = async (auctionId: string): Promise<any[]> => {
  const { data: bidsData, error } = await supabase
    .from("Bid")
    .select("*")
    .eq("auction_id", auctionId)
    .order("timestamp", { ascending: false }); // This ensures latest bids come first
  if (error) {
    console.error("Error fetching bids:", error);
    return [];
  }
  return bidsData;
};

export const updateAuctionDetails = async (
  auctionId: string,
  newHighestBid: number,
  newHighestBidder: string
): Promise<Auction | null> => {
  const { data: updatedAuction, error } = await supabase
    .from("Auction")
    .update({
      highest_bid: newHighestBid,
      highest_bidder: newHighestBidder,
    })
    .eq("id", auctionId)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating auction details:", error);
    return null;
  }

  return updatedAuction;
};
