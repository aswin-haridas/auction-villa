"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/app/services/client";
import { LogOut } from "lucide-react";
import Image from "next/image";
import { playfair } from "@/app/font/fonts";
import { RealtimeChannel } from "@supabase/supabase-js";
import {
  fetchAuctionData,
  subscribeToAuctionUpdates,
  fetchHighestBidData,
  subscribeToBidUpdates,
  fetchHighestBidder,
} from "@/app/services/auction";

// Interfaces
interface AuctionData {
  id: string;
  name: string;
  price: number;
  endTime: number;
  owner: string;
  currentBid: number;
  highestBid: number;
  highestBidder: string;
  buyOutPrice: number;
  image: string[];
  category: string;
}

interface Bid {
  bid_id: string;
  user_id: string;
  amount: number;
  timestamp: string;
  auction_id: string;
}

export default function Bidding() {
  const { id } = useParams<{ id: string }>();
  const [auction, setAuction] = useState<AuctionData | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [currentImage, setCurrentImage] = useState<number>(0);
  const [highestBid, setHighestBid] = useState<number>(0);
  const [highestBidder, setHighestBidder] = useState<string>("");
  const [currentBid, setCurrentBid] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const biddingValues = [100, 500, 1000, 5000];
  const userColors: string[] = ["#d062fc", "#8efc62"];

  const handlePlaceBid = async () => {
    setError(null);
    setLoading(true);
    try {
      const amount = parseInt(bidAmount, 10) || 0;
      if (isNaN(amount) || amount <= 0 || amount <= currentBid) {
        throw new Error("Invalid bid amount. Must be a number greater than the current bid.");
      }
      const { error } = await supabase.rpc("place_bid", {
        auction_id: id,
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
    // Implement buyout logic if needed
  };

  const handleLeave = () => {
    // Implement leave logic if needed
  };

  if (loading) {
    return (
      <div className="flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        Loading...
      </div>
    );
  }

  if (!auction) {
    return <div className="p-4">No auction data found.</div>;
  }

  return (
    <>
      <header className="p-4 bg-gray-800 text-white">Auction Platform</header>
      <div className="pt-8 px-12 flex justify-between">
        {/* Auction Images */}
        <div className="flex">
          <div className="flex flex-col pr-2 space-y-2">
            {auction.image.map((img, i) => (
              <Image
                key={i}
                alt={`Thumbnail ${i + 1}`}
                onClick={() => setCurrentImage(i)}
                src={img}
                width={100}
                height={100}
                className={`h-28 flex cursor-pointer ${currentImage !== i && "opacity-50 grayscale"}`}
                style={{ objectFit: "cover" }}
              />
            ))}
          </div>
          <div className="relative">
            <Image
              src={auction.image[currentImage]}
              alt={`Current Image`}
              width={500}
              height={500}
              priority
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>

        {/* Auction Details */}
        <div className="w-6/12 flex flex-col text-white">
          <h1 className={`text-5xl text-[#FEF9E1] mb-6 ${playfair.className} font-bold`}>
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
                Ends in: <span className="font-semibold">{new Date(auction.endTime).toLocaleString()}</span>
              </p>
            </div>
            <div className="w-1/2">
              <p className="text-[#878787] text-lg mb-2">
                Starting Price: <span className="text-green-800 font-semibold">{auction.price}u</span>
              </p>
              <p className="text-[#878787] text-lg">
                Highest Bidder: <span className="font-semibold text-[#FEF9E1]">{highestBidder || "None yet"}</span>
              </p>
            </div>
          </div>
          <div className="mb-6">
            <h2 className="text-[#ba3737] text-xl font-semibold mb-2">Current Bid</h2>
            <h1 className="text-5xl font-bold">{currentBid}u</h1>
          </div>
        </div>

        {/* Bidding Controls */}
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
              className="text-black"
            />
            <div
              onClick={!loading ? handlePlaceBid : undefined}
              className={`relative flex flex-col text-center justify-center border-2 border-red-800 font-bold w-60 h-10 ${
                loading ? "bg-transparent cursor-not-allowed" : "bg-red-800 cursor-pointer"
              }`}
            >
              <div className="relative z-10">{loading ? "Loading..." : "Place Bid"}</div>
            </div>
            <div
              onClick={handleBuyOut}
              className="cursor-pointer group relative flex flex-col text-center justify-center font-bold border-2 border-red-800 w-60 h-10 text-cyan-300"
            >
              <div className="relative z-10">Buy Out: {auction.buyOutPrice}u</div>
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

        {/* Bid History */}
        <div className="flex flex-col justify-start items-start pt-8">
          <div className="overflow-auto">
            {bids.length === 0 ? (
              <p className="text-gray-400">No bids yet</p>
            ) : (
              bids.map((bid, index) => (
                <div key={bid.bid_id} className="mb-3">
                  <span
                    style={{ color: userColors[index % userColors.length] }}
                    className="font-bold"
                  >
                    {bid.user_id || "Anonymous"}
                  </span>
                  <span className="text-white"> bid </span>
                  <span className="text-yellow-400 font-bold">{bid.amount}u</span>
                  <span className="text-gray-400 text-sm ml-2">
                    {new Date(bid.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}