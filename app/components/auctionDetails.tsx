import React, { useEffect, useState } from "react";
import { playfair } from "@/app/font/fonts";
import { AuctionDetailsProps } from "@/app/types/auction";
import { subscribeToAuction, subscribeToBids } from "@/app/services/auction";

export default function AuctionDetails({
  auction: initialAuction,
}: AuctionDetailsProps) {
  const [auction, setAuction] = useState(initialAuction);
  const [bids, setBids] = useState<any[]>([]);

  useEffect(() => {
    // Set the initial auction data
    setAuction(initialAuction);

    // Subscribe to real-time updates for the auction
    const unsubscribeAuction = subscribeToAuction(
      initialAuction.id,
      (updatedAuction) => {
        setAuction(updatedAuction);
      }
    );

    // Subscribe to real-time updates for bids
    const unsubscribeBids = subscribeToBids(
      initialAuction.id,
      (updatedBids) => {
        setBids(updatedBids);
      }
    );

    // Clean up subscriptions when component unmounts
    return () => {
      unsubscribeAuction();
      unsubscribeBids();
    };
  }, [initialAuction.id]);

  // Get highest bid from the bids array
  const highestBid =
    bids.length > 0
      ? Math.max(...bids.map((bid) => bid.amount))
      : auction.highest_bid || auction.price;

  // Get highest bidder from the bids array
  const highestBidder =
    bids.length > 0
      ? bids.reduce((prev, current) =>
          prev.amount > current.amount ? prev : current
        ).username
      : auction.highest_bidder || "None yet";

  return (
    <div className="flex flex-col text-white ">
      <h1
        className={`text-5xl text-[#FEF9E1] mb-6 ${playfair.className} font-bold`}
      >
        {auction.name}
      </h1>
      <div className="flex mb-4">
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
              {new Date(auction.end_time).toLocaleString()}
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
              {highestBidder}
            </span>
          </p>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-[#ba3737] text-xl font-semibold mb-2">
          Current Bid
        </h2>
        <h1 className="text-5xl font-bold">{highestBid}u</h1>
      </div>
    </div>
  );
}
