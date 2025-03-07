import React, { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { Bid, BiddingControlsProps } from "@/app/types/auction";
import { buyOut, placeBid } from "@/app/services/auction";
import { getUsername } from "../services/auth";

const biddingValues = [100, 500, 1000, 5000];

export default function BiddingControls({
  auction,
  setAuction,
}: BiddingControlsProps) {
  const [bidAmount, setBidAmount] = useState("");
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const fetchUsername = async () => {
      const storedUsername = await getUsername();
      if (storedUsername) {
        setUsername(storedUsername);
      }
    };

    fetchUsername();
  }, []);

  const handlePlaceBid = async () => {
    setLoading(true);
    const startTime = Date.now();

    try {
      await placeBid({
        auction,
        bidAmount,
        selectedValue: selectedValue,
        setAuction,
        setBids,
        setError,
        setLoading: () => {}, // Prevent the service from changing loading state
      });

      // Calculate how much time has passed and wait for the remainder of 3 seconds
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1000 - elapsedTime);

      // Wait for the remaining time to complete 3 seconds total
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    } catch (err) {
      // If there was an error that wasn't handled by placeBid
      setError(err instanceof Error ? err.message : "An error occurred");

      // Still ensure we wait the full 3 seconds before turning off loading state
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1000 - elapsedTime);
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 sm:gap-4">
        {biddingValues.map((value) => (
          <div
            key={value}
            onClick={() => setSelectedValue(value)}
            className={`flex flex-col text-center cursor-pointer justify-center text-base border-2 flex-1 min-w-[60px] h-10 rounded-sm ${
              selectedValue !== value ? "border-red-800" : "bg-white text-black"
            }`}
          >
            {value}u
          </div>
        ))}
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <div className="flex flex-wrap gap-2 sm:gap-4 mt-6">
        <input
          type="number"
          value={bidAmount}
          onFocus={() => setSelectedValue(null)}
          onChange={(e) => setBidAmount(e.target.value)}
          placeholder="Enter bid amount"
          className="text-white bg-[#171717] p-2 w-full sm:w-auto flex-grow"
        />
        <button
          onClick={handlePlaceBid}
          className={`relative flex flex-col text-center justify-center border-2 border-red-800 font-bold w-full sm:w-auto flex-grow h-10 ${
            loading
              ? "bg-transparent cursor-not-allowed"
              : "bg-red-800 cursor-pointer"
          }`}
        >
          {loading ? "Please Wait.." : "Place Bid"}
        </button>
        <button
          onClick={() =>
            !loading &&
            buyOut({
              auction,
              setAuction,
              setError,
              setLoading,
            })
          }
          className="cursor-pointer group relative flex flex-col text-center justify-center font-bold border-2 border-red-800 w-full sm:w-auto flex-grow h-10 text-cyan-300"
        >
          Buy Out: {auction.buyout_price}u
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[linear-gradient(45deg,#ffffff33_25%,transparent_25%,transparent_50%,#ffffff33_50%,#ffffff33_75%,transparent_75%,transparent_100%)] bg-[length:40px_40px]"></div>
        </button>
        <button
          onClick={() => console.log("Leaving auction...")}
          className="cursor-pointer flex justify-center items-center font-bold border-2 border-red-800 w-full sm:w-14 h-10 text-gray-500 hover:text-gray-400"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
