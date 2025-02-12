import React from "react";

const biddingValues = [100, 500, 1000];

interface BiddingControlsProps {
  buyOutPrice: number;
}

const BiddingControls = ({ buyOutPrice }: BiddingControlsProps) => {
  const [selectedValue, setSelectedValue] = React.useState(100);
  const [countdown, setCountdown] = React.useState<number | null>(null);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const handlePlaceBid = () => {
    setIsAnimating(true);
    setCountdown(3);
    
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


  return (
    <div>
      <div className="flex space-x-4 mr-28 ">
        {biddingValues.map((value) => (
          <div
            key={value}
            onClick={() => setSelectedValue(value)}
            className={`flex flex-col text-center cursor-pointer justify-center text-base border-2 w-1/5 h-12 rounded-sm ${
              selectedValue !== value
                ? "border-red-600"
                : "bg-white text-black "
            }`}
          >
            {value}u
          </div>
        ))}
        <input type="number" placeholder="Custom Amount" className="border-2 border-red-600 placeholder-gray-500 font-bold px-2 bg-transparent text-white h-12 rounded-sm " />
      </div>

      <div className="flex space-x-4 mr-28 mt-6">
        <div
          onClick={!isAnimating ? handlePlaceBid : undefined}
          className={`relative flex flex-col text-center justify-center border-2 border-red-800 font-bold w-60 h-12 rounded-sm cursor-pointer overflow-hidden ${
              isAnimating 
                ? 'bg-transparent' 
                : 'bg-red-700'
            }`}
        >
          <div className="relative z-10">
            {countdown ? `Wait ${countdown} sec` : "Place Bid"}
          </div>
          <div
            className={`absolute inset-0 bg-red-800 transform origin-left transition-transform ease-linear ${
              isAnimating 
                ? 'scale-x-100 duration-[3000ms]' 
                : 'scale-x-0 duration-0'
            }`}
          />
        </div>
        <div className="cursor-pointer group relative flex flex-col text-center justify-center font-bold border-2 border-red-800 w-60 h-12 text-cyan-300 rounded-sm overflow-hidden">
          <div className="relative z-10">Buy Out: {buyOutPrice}u</div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[linear-gradient(45deg,#ffffff33_25%,transparent_25%,transparent_50%,#ffffff33_50%,#ffffff33_75%,transparent_75%,transparent_100%)] bg-[length:40px_40px]"></div>
        </div>
        <div className="cursor-pointer flex flex-col text-center justify-center font-bold border-2 border-red-800 w-48 h-12 text-gray-500 rounded-sm hover:text-gray-400">Leave</div>
      </div>
    </div>
  );
};

export default BiddingControls;
