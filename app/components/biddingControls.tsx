import React from "react";
import { placeBid } from "../middlewares/biddingMiddleware";
import { supabase } from "../utils/client";
import {getUsername} from "../utils/session";

const biddingValues = [100, 500, 1000];

interface BiddingControlsProps {
  buyOutPrice: number;
  itemId: string;
}

const BiddingControls = ({ buyOutPrice, itemId }: BiddingControlsProps) => {
  const [selectedValue, setSelectedValue] = React.useState(100);
  const [countdown, setCountdown] = React.useState<number | null>(null);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const handlePlaceBid = () => {
    setIsAnimating(true);
    setCountdown(3);

    try {
      placeBid(selectedValue, itemId);
    } catch (error) {
      console.error("Error placing bid:", error);
    }

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          setIsAnimating(false);
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const handleBuyout = async () => {
    const username = getUsername();
    if (!itemId) return;
  
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error) throw error;

      const userId = user?.id

      const { error: updateError } = await supabase
        .from("auctions")
        .update({
          owner: userId, // Assign to buyer
          highestBidder: userId,
          highestBid: buyOutPrice,
          currentBid: buyOutPrice,
          endTime: Date.now(), // End auction
        })
        .eq("id", itemId);
  
      if (updateError) throw updateError;
      alert("You bought this item!");
    } catch (error) {
      console.error("Error during buyout:", error);
    }
  };
  const handleLeave = async () => {
    if (!itemId) return;
  
    try {
      // Fetch the current auction data
      const { data: auction, error: fetchError } = await supabase
        .from("auctions")
        .select("highestBidder")
        .eq("id", itemId)
        .single();
  
      if (fetchError) throw fetchError;
  
      // Check if both users leave
      if (!auction.highestBidder) {
        await supabase
          .from("auctions")
          .update({ highestBid: 0, highestBidder: null })
          .eq("id", itemId);
        alert("Auction reset due to both users leaving.");
        return;
      }
  
      // If only one user remains, they win the item
      await supabase
        .from("auctions")
        .update({
          owner: auction.highestBidder,
          endTime: Date.now(), // End auction
        })
        .eq("id", itemId);
  
      alert("Other user left, you won the auction!");
    } catch (error) {
      console.error("Error during leave:", error);
    }
  };
    

  return (
    <div>
      <div className="flex space-x-4 mr-28 ">
        {biddingValues.map((value) => (
          <div
            key={value}
            onClick={() => setSelectedValue(value)}
            className={`flex flex-col text-center cursor-pointer justify-center text-base border-2 w-1/4 h-10 rounded-sm ${
              selectedValue !== value
                ? "border-red-600"
                : "bg-white text-black "
            }`}
          >
            {value}u
          </div>
        ))}
        <input
          onChange={(event) => {
            const inputValue = parseInt(event.target.value, 10);
            if (!isNaN(inputValue) && inputValue > 0) {
              setSelectedValue(inputValue);
            }
          }}
          type="number"
          placeholder="Custom Amount"
          className="border-2 border-red-600 placeholder-gray-500 font-bold px-2 bg-transparent text-white h-10 rounded-sm "
        />
      </div>

      <div className="flex space-x-4 mr-28 mt-6">
        <div
          onClick={!isAnimating ? handlePlaceBid : undefined}
          className={`relative flex flex-col text-center justify-center border-2 border-red-800 font-bold w-60 h-10 rounded-sm ${
            isAnimating
              ? "bg-transparent cursor-not-allowed"
              : "bg-red-700 cursor-pointer"
          }`}
        >
          <div className="relative z-10">
            {countdown ? `Wait ${countdown} sec` : "Place Bid"}
          </div>
        </div>
        <div
          onClick={handleBuyout}
          className="cursor-pointer group relative flex flex-col text-center justify-center font-bold border-2 border-red-800 w-60 h-10 text-cyan-300 rounded-sm overflow-hidden"
        >
          <div className="relative z-10">Buy Out: {buyOutPrice}u</div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[linear-gradient(45deg,#ffffff33_25%,transparent_25%,transparent_50%,#ffffff33_50%,#ffffff33_75%,transparent_75%,transparent_100%)] bg-[length:40px_40px]"></div>
        </div>
        <div onClick={handleLeave} className="cursor-pointer flex flex-col text-center justify-center font-bold border-2 border-red-800 w-48 h-10 text-gray-500 rounded-sm hover:text-gray-400">
          Leave
        </div>
      </div>
    </div>
  );
};

export default BiddingControls;
