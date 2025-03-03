"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LogOut } from "lucide-react";
import Image from "next/image";
import { playfair, anton } from "@/app/font/fonts";
import Header from "@/app/components/header";
import BidHistory from "@/app/components/bidhistory";
import { supabase } from "@/app/services/client";

// Interfaces
interface AuctionData {
  id: string;
  name: string;
  price: number;
  end_time: string; // Changed to string to match database format
  owner: string | null;
  currentBid: number | null;
  highest_bid: number | null; // Changed to match database column name
  highest_bidder: string | null; // Changed to match database column name
  buyout_price: number; // Changed to match database column name
  image: string[];
  category: string;
  status: string;
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
  const [currentUser, setCurrentUser] = useState(
    "User" + Math.floor(Math.random() * 1000)
  );

  // Fetch auction data from Supabase
  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        setLoading(true);
        
        // Fetch auction details
        const { data: auctionData, error: auctionError } = await supabase
          .from("Auction")
          .select("*")
          .eq("id", id)
          .single();

        if (auctionError) {
          throw new Error(`Error fetching auction: ${auctionError.message}`);
        }

        if (!auctionData) {
          throw new Error("Auction not found");
        }

        // Since we're not implementing a separate bids table yet, we'll initialize with empty bids
        // You might want to add a bids table and fetch related bids here
        const initialBids: Bid[] = [];

        // Map the database fields to our interface
        const mappedAuction: AuctionData = {
          id: auctionData.id,
          name: auctionData.name,
          price: auctionData.price,
          end_time: auctionData.end_time,
          owner: auctionData.owner || "Unknown",
          currentBid: auctionData.highest_bid || auctionData.price,
          highest_bid: auctionData.highest_bid || auctionData.price,
          highest_bidder: auctionData.highest_bidder || "None yet",
          buyout_price: auctionData.buyout_price,
          image: auctionData.image || [],
          category: auctionData.category,
          status: auctionData.status,
        };

        setAuction(mappedAuction);
        setBids(initialBids);
        setHighestBid(mappedAuction.highest_bid || 0);
        setHighestBidder(mappedAuction.highest_bidder || "");
        setCurrentBid(mappedAuction.currentBid || 0);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to load auction data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAuctionData();
    }
  }, [id]);

  // Handle placing a bid
  const handlePlaceBid = async () => {
    setLoading(true);
    setError(null);

    const amount = selectedValue || Number(bidAmount);

    if (!amount || amount <= currentBid) {
      setError("Bid must be higher than current bid");
      setLoading(false);
      return;
    }

    try {
      // Update auction with new highest bid
      const { error: updateError } = await supabase
        .from("Auction")
        .update({
          highest_bid: amount,
          highest_bidder: currentUser,
        })
        .eq("id", id);

      if (updateError) {
        throw new Error(`Error placing bid: ${updateError.message}`);
      }

      // Create new bid record (assuming you might add a bids table later)
      const newBid: Bid = {
        bid_id: `bid-${Date.now()}`,
        user_id: currentUser,
        amount: amount,
        timestamp: new Date().toISOString(),
        auction_id: id || "",
      };

      setBids([newBid, ...bids]);
      setCurrentBid(amount);
      setHighestBid(amount);
      setHighestBidder(currentUser);
      setBidAmount("");
      setSelectedValue(null);
    } catch (err) {
      console.error("Bid error:", err);
      setError(err instanceof Error ? err.message : "Failed to place bid");
    } finally {
      setLoading(false);
    }
  };

  // Handle buy out
  const handleBuyOut = async () => {
    if (loading || !auction) return;

    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from("Auction")
        .update({
          highest_bid: auction.buyout_price,
          highest_bidder: currentUser,
          status: "completed",
        })
        .eq("id", id);

      if (updateError) {
        throw new Error(`Error processing buyout: ${updateError.message}`);
      }

      const buyOutBid: Bid = {
        bid_id: `bid-buyout-${Date.now()}`,
        user_id: currentUser,
        amount: auction.buyout_price,
        timestamp: new Date().toISOString(),
        auction_id: id || "",
      };

      setBids([buyOutBid, ...bids]);
      setCurrentBid(auction.buyout_price);
      setHighestBid(auction.buyout_price);
      setHighestBidder(currentUser);
      setError("Congratulations! You've successfully bought this item!");
    } catch (err) {
      console.error("Buyout error:", err);
      setError(err instanceof Error ? err.message : "Failed to process buyout");
    } finally {
      setLoading(false);
    }
  };

  // Handle leaving the auction
  const handleLeave = () => {
    alert("Leaving auction page");
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-screen">
        <div className="text-white text-xl">Loading auction data...</div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="p-4 flex items-center justify-center h-screen">
        <div className="text-white text-xl">Auction not found</div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="px-12 min-h-screen mt-8">
        <div className="flex flex-col">
          <div className="flex justify-between">
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
                    className={`h-28 flex cursor-pointer ${
                      currentImage !== i && "opacity-50 grayscale"
                    }`}
                    style={{ objectFit: "cover" }}
                  />
                ))}
              </div>
              <Image
                src={auction.image[currentImage] || "/placeholder.jpg"}
                alt={`Current Image`}
                width={500}
                height={500}
                priority
                className="object-cover h-[76vh]"
              />
            </div>
            <div className="w-6/12 flex flex-col text-white pl-8">
              <h1
                className={`text-5xl text-[#FEF9E1] mb-6 ${playfair.className} font-bold`}
              >
                {auction.name}
              </h1>
              <div className="flex mb-4">
                <div className="w-1/2">
                  <p className="text-[#878787] text-lg mb-2">
                    Owner:{" "}
                    <span className="font-semibold">{auction.owner}</span>
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
                      {highestBidder || "None yet"}
                    </span>
                  </p>
                </div>
              </div>
              <div className="mb-8">
                <h2 className="text-[#ba3737] text-xl font-semibold mb-2">
                  Current Bid
                </h2>
                <h1 className="text-5xl font-bold">{currentBid}u</h1>
              </div>

              {/* Bidding Controls */}
              <div>
                <div className="flex space-x-4">
                  {biddingValues.map((value) => (
                    <div
                      key={value}
                      onClick={() => setSelectedValue(value)}
                      className={`flex flex-col text-center cursor-pointer justify-center text-base border-2 w-1/4 h-10 rounded-sm ${
                        selectedValue !== value
                          ? "border-red-800"
                          : "bg-white text-black"
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
                    onFocus={() => setSelectedValue(null)}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="Enter bid amount"
                    className="text-white bg-[#171717] p-2 w-72"
                  />
                  <button
                    onClick={!loading ? handlePlaceBid : undefined}
                    className={`relative flex flex-col text-center justify-center border-2 border-red-800 font-bold w-60 h-10 ${
                      loading
                        ? "bg-transparent cursor-not-allowed"
                        : "bg-red-800 cursor-pointer"
                    }`}
                  >
                    {loading ? "Loading..." : "Place Bid"}
                  </button>
                  <button
                    onClick={handleBuyOut}
                    className="cursor-pointer group relative flex flex-col text-center justify-center font-bold border-2 border-red-800 w-60 h-10 text-cyan-300"
                  >
                    Buy Out: {auction.buyout_price}u
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[linear-gradient(45deg,#ffffff33_25%,transparent_25%,transparent_50%,#ffffff33_50%,#ffffff33_75%,transparent_75%,transparent_100%)] bg-[length:40px_40px]"></div>
                  </button>
                  <button
                    onClick={handleLeave}
                    className="cursor-pointer flex flex-col justify-center items-center font-bold border-2 border-red-800 w-14 h-10 text-gray-500 hover:text-gray-400"
                  >
                    <LogOut className="w-6 h-6" />
                  </button>
                </div>
                {error && <div className="text-red-500 mt-2">{error}</div>}
              </div>
              <BidHistory bids={bids} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}