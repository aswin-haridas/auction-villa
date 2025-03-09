import { supabase } from "./client";
import { Auction } from "@/app/types/auction";

// Get auctions with optional status filter
export async function getAuctions(
  status?: "active" | "closed"
): Promise<Auction[]> {
  let query = supabase.from("Auction").select("*");

  // Apply status filter if provided
  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to get auctions: ${error.message}`);
  return data as Auction[];
}

export async function getAuction(auctionId: string): Promise<Auction> {
  const { data, error } = await supabase
    .from("Auction")
    .select("*")
    .eq("id", auctionId)
    .single();

  if (error) throw new Error(`Failed to get auction: ${error.message}`);
  return data as Auction;
}

export function subscribeToAuction(
  auctionId: string,
  callback: (auction: Auction) => void
) {
  // First, get initial auction data
  getAuction(auctionId).then(callback).catch(console.error);

  // Then subscribe to changes
  const subscription = supabase
    .channel(`auction-details-${auctionId}`)
    .on(
      "postgres_changes",
      {
        event: "*", // Listen to all events (insert, update, delete)
        schema: "public",
        table: "Auction",
        filter: `id=eq.${auctionId}`,
      },
      (payload) => {
        // Use the payload directly instead of fetching again
        if (payload.eventType === "DELETE") {
          console.log("Auction was deleted");
          return;
        }

        // For INSERT and UPDATE events, the new record is in payload.new
        const updatedAuction = payload.new as Auction;
        callback(updatedAuction);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
}

export async function checkAuctionActive(auctionId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("Auction")
    .select("status, end_time")
    .eq("id", auctionId)
    .single();

  if (error)
    throw new Error(`Failed to check auction status: ${error.message}`);
  return data.status === "active" && new Date() < new Date(data.end_time);
}

export async function winAuction(
  auctionId: string,
  winnerId: string,
  amount: number
): Promise<void> {
  const { data: auction, error: auctionError } = await supabase
    .from("Auction")
    .select("owner, name, image, category")
    .eq("id", auctionId)
    .single();

  if (auctionError)
    throw new Error(`Failed to fetch auction: ${auctionError.message}`);

  // Deduct from winner's balance
  await supabase.rpc("update_balance", {
    p_user_id: winnerId,
    p_amount: -amount,
  });

  // Add to owner's balance
  await supabase.rpc("update_balance", {
    p_user_id: auction.owner,
    p_amount: amount,
  });

  // Record transactions
  const timestamp = new Date().toISOString();
  await supabase.from("Transactions").insert([
    {
      user_id: winnerId,
      type: "auction_win",
      amount: -amount,
      timestamp,
      event: `Won auction ${auctionId}`,
    },
    {
      user_id: auction.owner,
      type: "auction_sale",
      amount,
      timestamp,
      event: `Sold in auction ${auctionId}`,
    },
  ]);

  // Create painting
  const { error: paintingError } = await supabase.from("Painting").insert({
    name: auction.name,
    image: auction.image,
    acquire_date: timestamp,
    category: auction.category,
    owner: winnerId,
  });

  if (paintingError)
    throw new Error(`Failed to create painting: ${paintingError.message}`);
}

// Update endAuction function to also set the winner
export async function endAuction(
  auctionId: string,
  winnerId?: string,
  winnerName?: string
): Promise<void> {
  const updateData: {
    status: string;
    highest_bidder?: string;
    winner?: string;
  } = {
    status: "closed",
  };

  // If winner info is provided, update it
  if (winnerId) {
    updateData.highest_bidder = winnerId;
  }

  if (winnerName) {
    updateData.winner = winnerName;
  }

  const { error: updateError } = await supabase
    .from("Auction")
    .update(updateData)
    .eq("id", auctionId);

  if (updateError)
    throw new Error(`Failed to close auction: ${updateError.message}`);
}
