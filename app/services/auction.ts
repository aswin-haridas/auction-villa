import { supabase } from "./client";

// Buy out item
export const buyOutItem = async (
  buyOutPrice: number,
  itemId: string
): Promise<void> => {
  const username = sessionStorage.getItem("username");
  if (!username) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("User")
    .select("balance")
    .eq("username", username)
    .single();
  if (error || !data) {
    console.error("Error fetching user balance:", error);
    return;
  }

  if (data.balance < buyOutPrice) {
    console.error("Insufficient funds");
    return;
  }

  const { error: updateError } = await supabase
    .from("User")
    .update({ balance: data.balance - buyOutPrice })
    .eq("username", username);
  if (updateError) {
    console.error("Error updating user balance:", updateError);
    return;
  }

  await supabase
    .from("Auction")
    .update({ status: "sold", buyer: username })
    .eq("id", itemId);
};

// Leave auction
export const leaveAuction = async (itemId: string): Promise<void> => {
  const username = sessionStorage.getItem("username");
  if (!username) throw new Error("User not authenticated");

  await supabase
    .from("AuctionParticipants")
    .delete()
    .eq("username", username)
    .eq("auction_id", itemId);
};

// Place bid
export const placeBid = async (
  amount: number,
  itemId: string
): Promise<void> => {
  const username = sessionStorage.getItem("username");
  if (!username) throw new Error("User not authenticated");

  const { data: auction, error: auctionError } = await supabase
    .from("Auction")
    .select("highestBid")
    .eq("id", itemId)
    .single();
  if (auctionError || !auction) {
    console.error("Error fetching auction:", auctionError);
    return;
  }

  if (amount <= auction.highestBid) {
    console.error("Bid amount must be higher than the current highest bid");
    return;
  }

  const { data: user, error: userError } = await supabase
    .from("User")
    .select("balance")
    .eq("username", username)
    .single();
  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return;
  }

  if (user.balance < amount) {
    console.error("Insufficient funds");
    return;
  }

  const { error: bidError } = await supabase
    .from("Bid")
    .insert({ amount, auction_id: itemId, user_id: username });
  if (bidError) {
    console.error("Error placing bid:", bidError);
    return;
  }

  await supabase
    .from("Auction")
    .update({ highestBid: amount })
    .eq("id", itemId);
};

// Define interfaces for auction and bid data
interface Auction {
  id: string;
  highestBid: number;
  // Add other auction fields as necessary
}

interface Bid {
  user_id: string;
  amount: number;
  // Add other bid fields as necessary
}

// Fetch auction data
export const fetchAuctionData = async (itemId: string): Promise<Auction> => {
  const { data, error } = await supabase
    .from("Auction")
    .select("*")
    .eq("id", itemId)
    .single();

  if (error) {
    console.error("Error fetching auction data:", error);
    throw error;
  }

  return data as Auction;
};

// Fetch highest bid data
export const fetchHighestBidData = async (itemId: string): Promise<number> => {
  const { data, error } = await supabase
    .from("Auction")
    .select("highestBid")
    .eq("id", itemId)
    .single();

  if (error) {
    console.error("Error fetching highest bid data:", error);
    throw error;
  }

  return data.highestBid;
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

  if (error) {
    console.error("Error fetching highest bidder:", error);
    throw error;
  }

  return data.user_id;
};

// Subscribe to auction updates
export const subscribeToAuctionUpdates = (
  itemId: string,
  callback: (data: Auction) => void
) => {
  return supabase
    .channel(`public:Auction:id=eq.${itemId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "Auction",
        filter: `id=eq.${itemId}`,
      },
      (payload: { new: Auction }) => {
        callback(payload.new as Auction);
      }
    )
    .subscribe();
};

// Subscribe to bid updates
export const subscribeToBidUpdates = (
  itemId: string,
  callback: (data: Bid) => void
) => {
  return supabase
    .channel(`public:Bid:auction_id=eq.${itemId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "Bid",
        filter: `auction_id=eq.${itemId}`,
      },
      (payload: { new: Bid }) => {
        callback(payload.new as Bid);
      }
    )
    .subscribe();
};
