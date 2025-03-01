import { playfair } from "@/app/font/fonts";

interface AuctionDetailsProps {
  auction: {
    name: string;
    owner: string;
    category: string;
    endTime: number;
    price: number;
  };
  highestBidder: string;
  currentBid: number;
}

export default function AuctionDetails({
  auction,
  highestBidder,
  currentBid,
}: AuctionDetailsProps) {
  return (
    <div className="w-6/12 flex flex-col text-white">
      <h1
        className={`text-5xl text-[#FEF9E1] mb-6 ${playfair.className} font-bold`}
      >
        {auction.name}
      </h1>
      <div className="flex mb-8">
        <div className="w-1/2">
          <p className="text-[#878787] text-lg mb-2">
            Owner: <span className="font-semibold">{auction.owner}</span>
          </p>
          <p className="text-[#878787] text-lg mb-2">
            Category: <span>{auction.category}</span>
          </p>
          <p className="text-[#878787] text-lg mb-2">
            Ends in:{" "}
            <span className="font-semibold">
              {new Date(auction.endTime).toLocaleString()}
            </span>
          </p>
        </div>
        <div className="w-1/2">
          <p className="text-[#878787] text-lg mb-2">
            Starting Price:{" "}
            <span className="text-green-800 font-semibold">
              {auction.price}u
            </span>
          </p>
          <p className="text-[#878787] text-lg">
            Highest Bidder:{" "}
            <span className="font-semibold text-[#FEF9E1]">
              {highestBidder || "None yet"}
            </span>
          </p>
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-[#ba3737] text-xl font-semibold mb-2">
          Current Bid
        </h2>
        <h1 className="text-5xl font-bold">{currentBid}u</h1>
      </div>
    </div>
  );
}
