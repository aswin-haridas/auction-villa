import { supabase } from "../utils/client";
import { checkUsernameExists } from "../utils/session";

const placeBid = async (selectedValue: number, itemId: string) => {
  const username = checkUsernameExists();
  const highestBid = await fetchHighestBidData(itemId);

  const newBid = highestBid?.data
    ? selectedValue + highestBid.data.amount
    : selectedValue;

  const { data, error } = await supabase
    .from("Bid")
    .insert([
      {
        item_id: itemId,
        amount: newBid,
        username: username,
      },
    ])
    .select();

  if (error) {
    throw new Error(`Failed to place bid: ${error.message}`);
  }

  return data;
};



async function fetchAuctionData(id: string) {
  const { data, error } = await supabase
    .from("Auction")
    .select("*")
    .eq("id", id)
    .single();
  return { data, error };
}

// Middleware: Subscribe to Auction Updates
function subscribeToAuctionUpdates(
  id: string,
  callback: (payload: any) => void
) {
  const auctionChannel = supabase
    .channel("Auction")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "auctions",
        filter: `id=eq.${id}`,
      },
      callback
    )
    .subscribe();
  return auctionChannel;
}

// Middleware: Fetch Highest Bid
async function fetchHighestBidData(id: string) {
  const { data, error } = await supabase
    .from("Bid")
    .select("amount")
    .eq("item_id", id)
    .order("amount", { ascending: false })
    .limit(1)
    .single();
  return { data, error };
}

async function fetchHighestBidder(id: string) {
  const { data, error } = await supabase
    .from("Bid")
    .select("username")
    .eq("item_id", id)
    .order("amount", { ascending: false })
    .limit(1)
    .single();
  return { data, error };
}

// Middleware: Subscribe to Bid Updates
function subscribeToBidUpdates(id: string, callback: (payload: any) => void) {
  const bidChannel = supabase
    .channel("Bid")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "bids",
        filter: `item_id=eq.${id}`,
      },
      callback
    )
    .subscribe();
  return bidChannel;
}

// Middleware: Format Time Remaining
function formatTimeRemaining(timeRemaining: number | null) {
  if (!timeRemaining) return "Calculating...";
  const h = Math.floor(timeRemaining / 3600000);
  const m = Math.floor((timeRemaining % 3600000) / 60000);
  const s = Math.floor((timeRemaining % 60000) / 1000);
  return `${h}h ${m}m ${s}s`;
}

export {
  placeBid,
  fetchAuctionData,
  subscribeToAuctionUpdates,
  fetchHighestBidData,
  subscribeToBidUpdates,
  formatTimeRemaining,
  fetchHighestBidder,
};
