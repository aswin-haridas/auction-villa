"use client";
import { useEffect, useState } from "react";
import { supabase } from "../utils/client";

interface Bid {
  id: number;
  item_id: string;
  amount: number;
  created_at: string;
  username: string;
}

interface BiddingLogProps {
  itemId: string;
}

const userColors: string[] = ["#d062fc", "#8efc62"];

const BiddingLog: React.FC<BiddingLogProps> = ({ itemId }) => {
  const [bids, setBids] = useState<Bid[]>([]);

  useEffect(() => {
    const fetchBids = async () => {
      const { data, error } = await supabase
        .from("Bid")
        .select("*")
        .eq("item_id", itemId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching bids:", error);
        return;
      }

      if (data) {
        setBids(data);
      }
    };

    fetchBids();

    const channel = supabase
      .channel(`Bid-${itemId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Bid",
          filter: `item_id=eq.${itemId}`,
        },
        (payload) => {
          setBids((prev) => [payload.new as Bid, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [itemId]);

  return (
    <div className="mt-5 pt-6 max-h-[300px] overflow-auto">
      {bids.length === 0 ? (
        <p className="text-gray-400">No bids yet</p>
      ) : (
        bids.map((bid, index) => (
          <div 
            key={bid.id} 
            className="mb-3"
          >
            <span style={{ color: userColors[index % 2] }} className="font-bold">
              {bid.username || "Anonymous"}
            </span>
            <span className="text-white"> bid </span>
            <span className="text-yellow-400 font-bold">{bid.amount}u</span>
            <span className="text-gray-400 text-sm ml-2">
              {new Date(bid.created_at).toLocaleString()}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default BiddingLog;