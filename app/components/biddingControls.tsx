import React from "react";
import { buyOutItem, leaveAuction, placeBid } from "../services/auction";
import { LogOut } from "lucide-react";

const biddingValues = [100, 500, 1000, 5000];

interface BiddingControlsProps {
  buyOutPrice: number;
  itemId: string;
}

const BiddingControls = ({ buyOutPrice, itemId }: BiddingControlsProps) => {
  const [selectedValue, setSelectedValue] = React.useState(100);
  const [countdown, setCountdown] = React.useState<number | null>(null);
  const [isAnimating, setIsAnimating] = React.useState(false);

  // Handle placing a bid with a countdown animation.
  const handlePlaceBid = () => {
    setIsAnimating(true);
    setCountdown(3);

    placeBid(selectedValue, itemId);

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
    await buyOutItem(buyOutPrice, itemId);
  };

  const handleLeave = async () => {
    await leaveAuction(itemId);
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
          onChange={(event) => {
            const inputValue = parseInt(event.target.value, 10);
            if (!isNaN(inputValue) && inputValue > 0) {
              setSelectedValue(inputValue);
            }
          }}
          type="number"
          placeholder="Custom Amount"
          className="border-2 border-red-800 placeholder-gray-500 font-bold px-2 bg-transparent text-white h-10 rounded-sm"
        />
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
    </div>
  );
};

export default BiddingControls;
