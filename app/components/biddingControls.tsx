<<<<<<< HEAD
import React from "react";
import { buyOutItem, leaveAuction, placeBid } from "../services/auction";
import { LogOut } from "lucide-react";

const biddingValues = [100, 500, 1000, 5000];
=======
"use client";
import React, { useState } from "react";
import { supabase } from "@/app/utils/client";
>>>>>>> 54ab8cb8151d5335a26fe8e26def35ab78a97777

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
<<<<<<< HEAD
      <div className="flex space-x-4">
        {biddingValues.map((value) => (
          <div
            key={value}
            onClick={() => setSelectedValue(value)}
            className={`flex flex-col text-center cursor-pointer justify-center text-base border-2 w-1/4 h-10 rounded-sm ${
              selectedValue !== value ? "border-red-800" : "bg-white text-black"
            }`}
          >
            {value}u
          </div>
        ))}
      </div>

      <div className="flex space-x-4 mt-6">
=======
      <div>
>>>>>>> 54ab8cb8151d5335a26fe8e26def35ab78a97777
        <input
          type="number"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          placeholder="Enter bid amount"
        />
<<<<<<< HEAD
        <div
          onClick={!isAnimating ? handlePlaceBid : undefined}
          className={`relative flex flex-col text-center justify-center border-2 border-red-800 font-bold w-60 h-10  ${
            isAnimating
              ? "bg-transparent cursor-not-allowed"
              : "bg-red-800 cursor-pointer"
          }`}
        >
          <div className="relative z-10">
            {countdown ? `Wait ${countdown} sec` : "Place Bid"}
          </div>
        </div>
        <div
          onClick={handleBuyout}
          className="cursor-pointer group relative flex flex-col text-center justify-center font-bold border-2 border-red-800 w-60 h-10 text-cyan-300 "
        >
          <div className="relative z-10">Buy Out: {buyOutPrice}u</div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[linear-gradient(45deg,#ffffff33_25%,transparent_25%,transparent_50%,#ffffff33_50%,#ffffff33_75%,transparent_75%,transparent_100%)] bg-[length:40px_40px]"></div>
        </div>
        <div
          onClick={handleLeave}
          className="cursor-pointer flex flex-col justify-center items-center font-bold border-2 border-red-800 w-14 h-10 text-gray-500 hover:text-gray-400"
        >
          <LogOut className="w-6 h-6" />
        </div>
      </div>
=======
        <button onClick={handlePlaceBid} disabled={loading || error}>
          {loading ? "Placing bid..." : "Place Bid"}
        </button>
      </div>
      {/* ... (Buy-out button remains the same) ... */}
      {error && <div style={{ color: "red" }}>{error}</div>}
>>>>>>> 54ab8cb8151d5335a26fe8e26def35ab78a97777
    </div>
  );
};

export default BiddingControls;
