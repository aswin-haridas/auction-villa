import { supabase } from "@/app/services/client";
import { Auction, Bid } from "@/app/types/auction";
import { getUserId, getUsername } from "@/app/services/session";

export async function placeBid({
  auction,
  bidAmount,
  selectedValue,
  setAuction,
  setBids,
  setError,
  setLoading,
}: {
  auction: Auction;
  bidAmount: string;
  selectedValue: number | null;
  setAuction: (auction: Auction) => void;
  setBids: (bids: (prev: Bid[]) => Bid[]) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}) {
  if (!auction) return;
  setLoading(true);
  setError(null);

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
    const userId = await getUserId();
    const username = await getUsername();
    const timestamp = new Date().toISOString();
    const { error } = await supabase.from("Bid").insert([
      {
        amount,
        auction_id: auction.id,
        user_id: userId,
        timestamp,
        username: username,
      },
    ]);

    if (error) {
      console.error("Error saving bid:", error);
      setError("Failed to place bid due to a database error.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("Auction")
      .update({ highest_bid: amount, highest_bidder: username })
      .eq("id", auction.id);

    if (updateError) {
      console.error("Error updating auction:", updateError);
      setError("Failed to update auction details.");
      setLoading(false);
      return;
    }

    setAuction({
      ...auction,
      highest_bid: amount,
      highest_bidder: username,
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
    setError(err instanceof Error ? err.message : "Failed to place bid");
  } finally {
    setLoading(false);
  }
}
export async function buyOut({
  auction,
  setAuction,
  setError,
  setLoading,
}: {
  auction: Auction;
  setAuction: (auction: Auction) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}) {
  if (!auction) return;
  setLoading(true);
  setError(null);

  try {
    const username = await getUsername();
    const { error } = await supabase
      .from("Auction")
      .update({
        highest_bid: auction.buyout_price,
        highest_bidder: username,
        status: "completed",
      })
      .eq("id", auction.id);

    if (error) {
      console.error("Error processing buyout:", error);
      setError("Failed to complete buyout.");
      setLoading(false);
      return;
    }

    setAuction({
      ...auction,
      highest_bid: auction.buyout_price,
      highest_bidder: username,
      status: "completed",
    });

    setError("Congratulations! You've successfully bought this item!");
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to process buyout");
  } finally {
    setLoading(false);
  }
}
