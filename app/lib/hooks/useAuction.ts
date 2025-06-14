import { useState } from "react";
import { supabase } from "../../services/client";
import { Auction } from "@/app/lib/types/auction";

export function useAuction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuctions = async (
    status?: "active" | "closed"
  ): Promise<Auction[]> => {
    setLoading(true);
    setError(null);
    let query = supabase.from("Auction").select("*");
    if (status) {
      query = query.eq("status", status);
    }
    const { data, error } = await query;
    setError(error?.message ?? null);
    setLoading(false);
    return (data as Auction[]) ?? [];
  };

  const getAuction = async (auctionId: string): Promise<Auction | null> => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("Auction")
      .select("*")
      .eq("id", auctionId)
      .single();
    setError(error?.message ?? null);
    setLoading(false);
    return data as Auction;
  };

  const subscribeToAuction = (
    auctionId: string,
    callback: (auction: Auction) => void
  ) => {
    getAuction(auctionId).catch(console.error);

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

          const updatedAuction = payload.new as Auction;
          callback(updatedAuction);
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  };

  const checkAuctionActive = async (auctionId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("Auction")
      .select("status, end_time")
      .eq("id", auctionId)
      .single();
    setError(error?.message ?? null);
    setLoading(false);
    return error
      ? false
      : data.status === "active" && new Date() < new Date(data.end_time);
  };

  const winAuction = async (
    auctionId: string,
    winnerId: string,
    amount: number
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    const { data: auction, error: auctionError } = await supabase
      .from("Auction")
      .select("owner, name, image, category, status")
      .eq("id", auctionId)
      .single();

    if (auctionError) {
      setError(auctionError.message);
      setLoading(false);
      return;
    }

    if (auction.status === "closed") {
      setError("Auction is already closed");
      setLoading(false);
      return;
    }

    const { error: balanceError1 } = await supabase.rpc("update_balance", {
      p_user_id: winnerId,
      p_amount: -amount,
    });

    if (balanceError1) {
      setError(balanceError1.message);
      setLoading(false);
      return;
    }

    const { error: balanceError2 } = await supabase.rpc("update_balance", {
      p_user_id: auction.owner,
      p_amount: amount,
    });

    if (balanceError2) {
      setError(balanceError2.message);
      setLoading(false);
      return;
    }

    const timestamp = new Date().toISOString();
    const { error: transactionError } = await supabase
      .from("Transactions")
      .insert([
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

    if (transactionError) {
      setError(transactionError.message);
      setLoading(false);
      return;
    }

    const { error: paintingError } = await supabase.from("Painting").insert({
      name: auction.name,
      image: auction.image,
      acquire_date: timestamp,
      category: auction.category,
      owner: winnerId,
    });

    if (paintingError) {
      setError(paintingError.message);
      setLoading(false);
      return;
    }

    const { error: closeError } = await supabase
      .from("Auction")
      .update({
        status: "closed",
        winner: winnerId,
        end_time: new Date().toISOString(),
      })
      .eq("id", auctionId);

    setError(closeError?.message ?? null);
    setLoading(false);
  };

  const endAuction = async (
    auctionId: string,
    winnerId?: string,
    winnerName?: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    const updateData = {
      status: "closed",
      ...(winnerId && { highest_bidder: winnerId }),
      ...(winnerName && { winner: winnerName }),
    };

    const { error: updateError } = await supabase
      .from("Auction")
      .update(updateData)
      .eq("id", auctionId);

    setError(updateError?.message ?? null);
    setLoading(false);
  };

  return {
    loading,
    error,
    getAuctions,
    getAuction,
    subscribeToAuction,
    checkAuctionActive,
    winAuction,
    endAuction,
  };
}
