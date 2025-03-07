import { supabase } from "@/app/services/client";
import { Auction } from "@/app/types/auction";
import { getUserId, getUsername } from "@/app/services/auth";

// Simple in-memory cache for auctions with expiration
const auctionCache = new Map<string, { auction: Auction; timestamp: number }>();
const CACHE_EXPIRY_MS = 30000; // 30 seconds cache expiry

export const fetchAuction = async (
  auctionId: string
): Promise<Auction | null> => {
  // Check cache first
  const cachedItem = auctionCache.get(auctionId);
  const now = Date.now();

  if (cachedItem && now - cachedItem.timestamp < CACHE_EXPIRY_MS) {
    return cachedItem.auction;
  }

  const { data: auction, error } = await supabase
    .from("Auction")
    .select("*")
    .eq("id", auctionId)
    .single();

  if (error) {
    console.error(`Error fetching auction ${auctionId}:`, error);
    return null;
  }

  // Cache the result
  if (auction) {
    auctionCache.set(auctionId, { auction, timestamp: now });
  }

  return auction;
};

// Type for bid data
export interface Bid {
  bid_id: string;
  user_id: string;
  amount: number;
  timestamp: string;
  auction_id: string;
  username: string;
  is_buyout?: boolean;
}

export const fetchBids = async (auctionId: string): Promise<Bid[]> => {
  try {
    const { data: bidsData, error } = await supabase
      .from("Bid")
      .select("*")
      .eq("auction_id", auctionId)
      .order("timestamp", { ascending: false }); // This ensures latest bids come first

    if (error) throw error;
    return bidsData || [];
  } catch (error) {
    console.error(`Error fetching bids for auction ${auctionId}:`, error);
    return [];
  }
};

export const fetchHighestBidder = async (
  auctionId: string
): Promise<{ username: string } | null> => {
  try {
    const { data, error } = await supabase
      .from("Bid")
      .select("username")
      .eq("auction_id", auctionId)
      .order("amount", { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(
      `Error fetching highest bidder for auction ${auctionId}:`,
      error
    );
    return null;
  }
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
 * Allows a user to leave an auction by removing their bid
 * @param auctionId The ID of the auction to leave
 * @param userId The ID of the user leaving the auction
 */
export const leaveAuction = async (
  auctionId: string,
  userId: string
): Promise<boolean> => {
  try {
    // Find the user's bids for this auction
    const { data: userBids, error: fetchError } = await supabase
      .from("Bid")
      .select("*")
      .eq("auction_id", auctionId)
      .eq("user_id", userId);

    if (fetchError) {
      console.error("Error fetching user bids:", fetchError);
      return false;
    }

    if (!userBids || userBids.length === 0) {
      console.error("No bids found for this user in this auction");
      return false;
    }

    // Delete the user's bids for this auction
    const { error: deleteError } = await supabase
      .from("Bid")
      .delete()
      .eq("auction_id", auctionId)
      .eq("user_id", userId);

    if (deleteError) {
      console.error("Error deleting bids:", deleteError);
      return false;
    }

    // If this user was the highest bidder, update the auction with the next highest bid
    const { data: auction, error: auctionError } = await supabase
      .from("Auction")
      .select("highest_bidder")
      .eq("id", auctionId)
      .single();

    if (auctionError || !auction) {
      console.error("Error fetching auction:", auctionError);
      return false;
    }

    // If this user was the highest bidder, update the auction with the next highest bid
    if (auction.highest_bidder === userId) {
      // Find the next highest bid from another user
      const { data: nextHighestBid, error: highestBidError } = await supabase
        .from("Bid")
        .select("*")
        .eq("auction_id", auctionId)
        .neq("user_id", userId)
        .order("amount", { ascending: false })
        .limit(1)
        .single();

      if (!highestBidError && nextHighestBid) {
        // Update the auction with the next highest bidder
        await supabase
          .from("Auction")
          .update({
            highest_bid: nextHighestBid.amount,
            highest_bidder: nextHighestBid.user_id,
          })
          .eq("id", auctionId);
      } else {
        // No other bids, reset to starting price
        const { data: originalAuction } = await supabase
          .from("Auction")
          .select("price")
          .eq("id", auctionId)
          .single();

        await supabase
          .from("Auction")
          .update({
            highest_bid: originalAuction?.price || null,
            highest_bidder: null,
          })
          .eq("id", auctionId);
      }
    }

    return true;
  } catch (error) {
    console.error("Error leaving auction:", error);
    return false;
  }
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
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "Auction",
        filter: `id=eq.${auctionId}`,
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
      "postgres_changes",
      {
        event: "INSERT", // Listen for new bids specifically
        schema: "public",
        table: "Bid",
        filter: `auction_id=eq.${auctionId}`,
      },
      async (payload) => {
        // When a new bid is inserted, fetch all bids again to refresh the list
        const bids = await fetchBids(auctionId);
        callback(bids);
      }
    )
    .on(
      "postgres_changes",
      {
        event: "*", // Listen for all other changes
        schema: "public",
        table: "Bid",
        filter: `auction_id=eq.${auctionId}`,
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

interface BidParams {
  auction: Auction;
  setAuction: (auction: Auction) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

interface PlaceBidParams extends BidParams {
  bidAmount: string;
  selectedValue: number | null;
  setBids: (callback: (prev: Bid[]) => Bid[]) => void;
}

/**
 * Places a bid on an auction
 */
export async function placeBid({
  auction,
  bidAmount,
  selectedValue,
  setAuction,
  setBids,
  setError,
  setLoading,
}: PlaceBidParams): Promise<void> {
  if (!auction) return;

  setLoading(true);
  setError(null);

  // Parse and validate bid amount
  const amount = selectedValue ?? Number(bidAmount);
  if (isNaN(amount)) {
    setError("Invalid bid amount.");
    setLoading(false);
    return;
  }

  const currentHighest = auction.highest_bid || auction.price;
  if (amount <= currentHighest) {
    setError("Bid must be higher than current bid.");
    setLoading(false);
    return;
  }

  try {
    // Get user information in parallel
    const [userId, username] = await Promise.all([getUserId(), getUsername()]);

    const timestamp = new Date().toISOString();

    // Create bid record
    const bidData = {
      amount,
      auction_id: auction.id,
      user_id: userId,
      timestamp,
      username,
    };

    // Execute both operations in parallel
    const [bidResult, auctionResult] = await Promise.all([
      supabase.from("Bid").insert([bidData]),
      supabase
        .from("Auction")
        .update({ highest_bid: amount, highest_bidder: userId }) // Changed from username to userId
        .eq("id", auction.id),
    ]);

    // Check for errors
    if (bidResult.error) {
      throw new Error(`Failed to place bid: ${bidResult.error.message}`);
    }

    if (auctionResult.error) {
      throw new Error(
        `Failed to update auction: ${auctionResult.error.message}`
      );
    }

    // Update UI state
    setAuction({
      ...auction,
      highest_bid: amount,
      highest_bidder: username, // Keep using username for display purposes in the UI
    });

    setBids((prev) => [
      ...prev,
      {
        bid_id: `bid-${Date.now()}`,
        user_id: userId || "",
        amount,
        timestamp,
        auction_id: auction.id,
        username: username || "",
      },
    ]);
  } catch (err) {
    console.error("Bid placement error:", err);
    setError(err instanceof Error ? err.message : "Failed to place bid");
  } finally {
    setLoading(false);
  }
}

/**
 * Processes a buyout for an auction
 */
export async function buyOut({
  auction,
  setAuction,
  setError,
  setLoading,
}: BidParams): Promise<void> {
  if (!auction) return;

  setLoading(true);
  setError(null);

  try {
    const [userId, username] = await Promise.all([getUserId(), getUsername()]);

    if (!userId) {
      throw new Error("You must be logged in to buy out an auction");
    }

    const timestamp = new Date().toISOString();

    // Create a bid record for the buyout
    const bidData = {
      amount: auction.buyout_price,
      auction_id: auction.id,
      user_id: userId,
      timestamp,
      username,
      is_buyout: true,
    };

    // Execute both operations: create bid and update auction
    const [bidResult, auctionResult] = await Promise.all([
      supabase.from("Bid").insert([bidData]),
      supabase
        .from("Auction")
        .update({
          highest_bid: auction.buyout_price,
          highest_bidder: userId,
          status: "completed",
        })
        .eq("id", auction.id),
    ]);

    // Check for errors
    if (bidResult.error) {
      throw new Error(`Failed to record buyout: ${bidResult.error.message}`);
    }

    if (auctionResult.error) {
      throw new Error(
        `Failed to complete buyout: ${auctionResult.error.message}`
      );
    }

    // Update UI state
    setAuction({
      ...auction,
      highest_bid: auction.buyout_price,
      highest_bidder: username, // Keep using username for display purposes in the UI
      status: "completed",
    });

    setError("Congratulations! You've successfully bought this item!");
  } catch (err) {
    console.error("Buyout error:", err);
    setError(err instanceof Error ? err.message : "Failed to process buyout");
  } finally {
    setLoading(false);
  }
}


