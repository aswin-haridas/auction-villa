"use client";
import React, { useState } from "react";
import { LogOut } from "lucide-react";
import { supabase } from "@/app/services/client";

interface BiddingControlsProps {
  buyOutPrice: number;
  itemId: string;
  currentBid: number;
}

const biddingValues = [100, 500, 1000, 5000];

const BiddingControls: React.FC<BiddingControlsProps> = ({
  buyOutPrice,
  itemId,
  currentBid,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  const handlePlaceBid = async () => {
    setError(null);
    setLoading(true);
    try {
      const amount = parseInt(bidAmount, 10) || 0;
      if (isNaN(amount) || amount <= 0 || amount <= currentBid) {
        throw new Error(
          "Invalid bid amount. Must be a number greater than the current bid."
        );
      }
      const { error } = await supabase.rpc("place_bid", {
        auction_id: itemId,
        user_id: "anonymous",
        amount: amount,
      });
      if (error) throw new Error(`Failed to place bid: ${error.message}`);
      alert("Bid placed successfully!");
      setBidAmount("");
    } catch (error: any) {
      setError(error.message);
      console.error("Error placing bid:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyOut = async () => {
    // ...existing code...
  };

  const handleLeave = () => {
    // ...existing code...
  };

  return (
    <div>
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
        <input
          type="number"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          placeholder="Enter bid amount"
        />
        <div
          onClick={!loading ? handlePlaceBid : undefined}
          className={`relative flex flex-col text-center justify-center border-2 border-red-800 font-bold w-60 h-10 ${
            loading
              ? "bg-transparent cursor-not-allowed"
              : "bg-red-800 cursor-pointer"
          }`}
        >
          <div className="relative z-10">
            {loading ? "Loading..." : "Place Bid"}
          </div>
        </div>
        <div
          onClick={handleBuyOut}
          className="cursor-pointer group relative flex flex-col text-center justify-center font-bold border-2 border-red-800 w-60 h-10 text-cyan-300"
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
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default BiddingControls;
