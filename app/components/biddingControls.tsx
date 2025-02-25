"use client";
import React, { useState } from "react";
import { supabase } from "@/app/utils/client";

interface BiddingControlsProps {
  buyOutPrice: number;
  itemId: string;
  currentBid: number;
}

const BiddingControls: React.FC<BiddingControlsProps> = ({
  buyOutPrice,
  itemId,
  currentBid,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bidAmount, setBidAmount] = useState(""); // Add state for custom bid amount

  const handlePlaceBid = async () => {
    setError(null);
    setLoading(true);

    try {
      const amount = parseInt(bidAmount, 10) || 0; // Parse bid amount, default to 0 if invalid

      if (isNaN(amount) || amount <= 0 || amount <= currentBid) {
        throw new Error("Invalid bid amount. Must be a number greater than the current bid.");
      }

      const { error } = await supabase.rpc('place_bid', {
        auction_id: itemId,
        user_id: "anonymous", // Replace with actual user ID
        amount: amount,
      });

      if (error) {
        throw new Error(`Failed to place bid: ${error.message}`);
      }

      alert("Bid placed successfully!");
      setBidAmount(""); // Clear the input field
    } catch (error: any) {
      setError(error.message);
      console.error("Error placing bid:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyOut = async () => {
    // ... (Buy-out logic remains the same) ...
  };

  return (
    <div>
      <div>
        <input
          type="number"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          placeholder="Enter bid amount"
        />
        <button onClick={handlePlaceBid} disabled={loading || error}>
          {loading ? "Placing bid..." : "Place Bid"}
        </button>
      </div>
      {/* ... (Buy-out button remains the same) ... */}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
};

export default BiddingControls;
