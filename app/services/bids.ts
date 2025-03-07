import { supabase } from "@/app/services/client";
import { Auction, Bid } from "@/app/types/auction";
import { getUserId, getUsername } from "@/app/services/session";

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

    const { error } = await supabase
      .from("Auction")
      .update({
        highest_bid: auction.buyout_price,
        highest_bidder: userId, // Changed from username to userId
        status: "completed",
      })
      .eq("id", auction.id);

    if (error) {
      throw new Error(`Failed to complete buyout: ${error.message}`);
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
