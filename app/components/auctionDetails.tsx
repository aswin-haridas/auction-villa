import React from "react";
import { playfair } from "@/app/font/fonts";
import { AuctionDetailsProps } from "@/app/types/auction";

export default function AuctionDetails({
  auction
}: AuctionDetailsProps) {
  
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
              {auction.highest_bidder || "None yet"}
            </span>
          </p>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-[#ba3737] text-xl font-semibold mb-2">
          Current Bid
        </h2>
        <h1 className="text-5xl font-bold">
          {auction.highest_bid || auction.price}u
        </h1>
      </div>
    </div>
  );
}
