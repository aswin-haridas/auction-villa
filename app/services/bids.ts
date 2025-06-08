import { supabase } from "./client";
import { Bid } from "../lib/types/auction";
import { winAuction } from "./auction";

export async function placeBid(
  userId: string,
  auctionId: string,
  amount: number
): Promise<void> {
  const { data: user, error: userError } = await supabase
    .from("User")
    .select("balance, username")
    .eq("user_id", userId)
    .single();

  if (userError) throw new Error(`Failed to fetch user: ${userError.message}`);
  if (user.balance < amount) throw new Error("Insufficient balance");

  const { data: auction, error: auctionError } = await supabase
    .from("Auction")
    .select("status, end_time, highest_bid, price, buyout_price")
    .eq("id", auctionId)
    .single();

  if (auctionError)
    throw new Error(`Failed to fetch auction: ${auctionError.message}`);
  if (auction.status !== "active" || new Date() >= new Date(auction.end_time)) {
    throw new Error("Auction is not active or has ended");
  }
  if (auction.highest_bid === null && amount <= auction.price) {
    throw new Error("Bid must exceed starting price");
  }
  if (auction.highest_bid !== null && amount <= auction.highest_bid) {
    throw new Error("Bid must exceed current highest bid");
  }

  // Insert bid
  const { error: bidError } = await supabase.from("Bid").insert({
    auction_id: auctionId,
    user_id: userId,
    amount,
    timestamp: new Date().toISOString(),
    username: user.username,
  });

  if (bidError) throw new Error(`Failed to place bid: ${bidError.message}`);

  // Update auction
  const { error: updateError } = await supabase
    .from("Auction")
    .update({ highest_bid: amount, highest_bidder: userId })
    .eq("id", auctionId);

  if (updateError)
    throw new Error(`Failed to update auction: ${updateError.message}`);

  // Handle buyout
  if (amount >= auction.buyout_price) {
    // We're removing the automatic status update here
    // This will only happen explicitly when user clicks buyout button
    await winAuction(auctionId, userId, amount);
  }
}

export async function getBids(auctionId: string): Promise<Bid[]> {
  const { data, error } = await supabase
    .from("Bid")
    .select("*")
    .eq("auction_id", auctionId)
    .order("timestamp", { ascending: false });

  if (error) throw new Error(`Failed to get bids: ${error.message}`);
  return data as Bid[];
}

export function subscribeToBids(
  auctionId: string,
  callback: (bids: Bid[]) => void
) {
  // First, get initial bids
  getBids(auctionId).then(callback).catch(console.error);

  // Then subscribe to changes
  const subscription = supabase
    .channel(`auction-bids-${auctionId}`)
    .on(
      "postgres_changes",
      {
        event: "*", // Listen to all events (insert, update, delete)
        schema: "public",
        table: "Bid",
        filter: `auction_id=eq.${auctionId}`,
      },
      async () => {
        // When we get any update, fetch all bids again to ensure we have the latest state
        try {
          const updatedBids = await getBids(auctionId);
          callback(updatedBids);
        } catch (error) {
          console.error("Error fetching updated bids:", error);
        }
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
}
