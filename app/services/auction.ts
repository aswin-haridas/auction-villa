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

export const fetchHighestBidder = async (
  auctionId: string
): Promise<{ username: string } | null> => {
  const { data, error } = await supabase
    .from("Bid")
    .select("username")
    .eq("auction_id", auctionId)
    .order("amount", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching highest bid:", error);
    return null;
  }
  return data;
};

export const fetchHighestBid = async (
  auctionId: string
): Promise<number | null> => {
  const { data, error } = await supabase
    .from("Bid")
    .select("amount")
    .eq("auction_id", auctionId)
    .order("amount", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching highest bid amount:", error);
    return null;
  }

  return data?.amount || null;
};

/**
 * Creates a real-time subscription to auction updates
 * Returns a function to unsubscribe when done
 */
export const subscribeToAuction = (
  auctionId: string,
  callback: (auction: Auction) => void
): (() => void) => {
  const subscription = supabase
    .channel(`auction-${auctionId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'Auction',
        filter: `id=eq.${auctionId}`
      },
      (payload) => {
        callback(payload.new as Auction);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

/**
 * Creates a real-time subscription to bid updates for an auction
 * Returns a function to unsubscribe when done
 */
export const subscribeToBids = (
  auctionId: string,
  callback: (bids: any[]) => void
): (() => void) => {
  // Initially fetch all bids
  fetchBids(auctionId).then(callback);
  
  const subscription = supabase
    .channel(`bids-${auctionId}`)
    .on(
      'postgres_changes',
      {
        event: '*', // Listen for inserts, updates and deletes
        schema: 'public',
        table: 'Bid',
        filter: `auction_id=eq.${auctionId}`
      },
      async () => {
        // When any bid changes, fetch all bids again
        const bids = await fetchBids(auctionId);
        callback(bids);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};


